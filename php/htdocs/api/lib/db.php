<?php
/**
 * DirIA Angola — Camada de base de dados (PDO / MySQL).
 *
 * Substitui server/db.ts no ambiente PHP. Mantém o mesmo contrato JSON
 * consumido pelo frontend (/api/db/status, /api/db/auto-provision).
 *
 * Requer: config.php, lib/schema.php, lib/seed.php
 */

declare(strict_types=1);

/** Erro de ligação/configuração da base de dados. */
class DiriaDbException extends RuntimeException
{
}

/**
 * Abre (ou reutiliza) a ligação PDO à base de dados configurada.
 *
 * @param array<string,mixed>|null $override credenciais alternativas
 */
function diria_pdo(?array $override = null): PDO
{
    static $pool = [];

    $cfg = array_merge([
        'db_host' => diria_config('db_host'),
        'db_port' => (int) diria_config('db_port', 3306),
        'db_name' => diria_config('db_name'),
        'db_user' => diria_config('db_user'),
        'db_password' => (string) diria_config('db_password', ''),
    ], $override ?? []);

    $host = (string) $cfg['db_host'];
    $port = (int) $cfg['db_port'];
    $name = (string) $cfg['db_name'];
    $user = (string) $cfg['db_user'];
    $pass = (string) $cfg['db_password'];

    if ($host === '' || $name === '' || $user === '') {
        throw new DiriaDbException('Credenciais MySQL incompletas (host/nome/user em falta). Corre o setup.php.');
    }

    $signature = md5($host . '|' . $port . '|' . $name . '|' . $user);
    if (isset($pool[$signature])) {
        return $pool[$signature];
    }

    if (!extension_loaded('pdo_mysql')) {
        throw new DiriaDbException('A extensão pdo_mysql não está disponível neste alojamento.');
    }

    try {
        $pdo = new PDO(
            sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $name),
            $user,
            $pass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 10,
            ]
        );
    } catch (PDOException $e) {
        $driverCode = isset($e->errorInfo[1]) ? (int) $e->errorInfo[1] : 0;

        if ($driverCode === 1049) {
            throw new DiriaDbException(
                'A base de dados "' . $name . '" não existe no servidor "' . $host . '". '
                . 'No InfinityFree, cria-a primeiro em Control Panel → MySQL Databases '
                . '(o nome real tem o prefixo da conta, ex.: if0_12345678_diria).'
            );
        }

        if ($driverCode === 1045) {
            throw new DiriaDbException(
                'Utilizador ou password incorretos ("' . $user . '" em ' . $host . '). '
                . 'Confirma as credenciais e se o utilizador está associado à base de dados '
                . '(MySQL Databases → Add User to Database).'
            );
        }

        throw new DiriaDbException(
            'Não foi possível ligar ao MySQL (' . $host . '): ' . $e->getMessage(),
            (int) $e->getCode()
        );
    }

    $pool[$signature] = $pdo;

    return $pdo;
}

/** Lista as tabelas existentes. @return array<int,string> */
function diria_db_tables(PDO $pdo): array
{
    $rows = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    return array_map('strval', $rows ?: []);
}

/** Cria todas as tabelas do esquema, se ainda não existirem. */
function diria_db_ensure_schema(PDO $pdo): void
{
    foreach (diria_schema_statements() as $statement) {
        $pdo->exec($statement);
    }
}

/** Conta registos de uma tabela (0 se a tabela não existir). */
function diria_db_count(PDO $pdo, string $table): int
{
    try {
        $value = $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
        return (int) $value;
    } catch (Throwable $e) {
        return 0;
    }
}

/** Insere o conteúdo inicial (advogados, consulta demo e utilizador admin). */
function diria_db_seed(PDO $pdo): void
{
    if (diria_db_count($pdo, 'lawyers') === 0) {
        $insert = $pdo->prepare(
            'INSERT INTO lawyers (id, name, oaa_number, location, specialty, phone, email, photo_url, available, entity_type, province, address, bio, verified_oaa, rating, review_count)
             VALUES (:id, :name, :oaa_number, :location, :specialty, :phone, :email, :photo_url, :available, :entity_type, :province, :address, :bio, :verified_oaa, :rating, :review_count)'
        );

        foreach (diria_default_lawyers() as $lawyer) {
            $insert->execute($lawyer);
        }
    }

    if (diria_db_count($pdo, 'users') === 0) {
        $user = diria_initial_user();
        $insert = $pdo->prepare(
            'INSERT INTO users (id, name, email, role, province) VALUES (:id, :name, :email, :role, :province)'
        );
        $insert->execute($user);
    }

    if (diria_db_count($pdo, 'consultations') === 0) {
        $consultation = diria_initial_consultation();

        $pdo->prepare('INSERT INTO consultations (id, title, category) VALUES (?, ?, ?)')->execute([
            $consultation['id'],
            $consultation['title'],
            $consultation['category'],
        ]);

        $insert = $pdo->prepare(
            'INSERT INTO messages (id, consultation_id, role, content, citation_law, citation_article, citation_text, complexity, suggestions_json, audio_duration)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        foreach ($consultation['messages'] as $message) {
            $insert->execute([
                $message['id'],
                $consultation['id'],
                $message['role'],
                $message['content'],
                $message['citation_law'],
                $message['citation_article'],
                $message['citation_text'],
                $message['complexity'],
                $message['suggestions'] !== null ? json_encode($message['suggestions'], JSON_UNESCAPED_UNICODE) : null,
                $message['audio_duration'],
            ]);
        }
    }

    try {
        $pdo->prepare('INSERT INTO cpanel_system_logs (event_type, message, environment) VALUES (?, ?, ?)')->execute([
            'AUTO_PROVISION_SUCCESS',
            'Banco provisionado e migrado com sucesso via DirIA Angola (PHP).',
            (string) diria_config('environment', 'infinityfree'),
        ]);
    } catch (Throwable $e) {
        // Log de auditoria é opcional; nunca deve interromper o provisionamento.
    }
}

/**
 * Provisiona a base de dados com credenciais fornecidas (modal cPanel).
 *
 * @param array<string,mixed> $input {host, port, database, user, password}
 * @return array<string,mixed> estado final (DatabaseStatus)
 */
function diria_db_provision(array $input): array
{
    $host = trim((string) ($input['host'] ?? ''));
    $port = (int) ($input['port'] ?? 3306);
    $name = trim((string) ($input['database'] ?? $input['db_name'] ?? ''));
    $user = trim((string) ($input['user'] ?? ''));
    $pass = (string) ($input['password'] ?? '');

    if ($host === '' || $name === '' || $user === '') {
        throw new DiriaDbException('Preenche o servidor, o nome da base de dados e o utilizador.');
    }

    $credentials = [
        'db_host' => $host,
        'db_port' => $port,
        'db_name' => $name,
        'db_user' => $user,
        'db_password' => $pass,
    ];

    // Alguns alojamentos permitem criar a base de dados; no InfinityFree tem de
    // ser criada antes no painel de controlo (MySQL Databases).
    try {
        $root = new PDO(
            sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $host, $port),
            $user,
            $pass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 10]
        );
        $root->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    } catch (Throwable $e) {
        // Sem privilégios para criar bases de dados — seguimos para a ligação directa.
    }

    $pdo = diria_pdo($credentials);

    diria_db_ensure_schema($pdo);
    diria_db_seed($pdo);

    // Persiste as credenciais para os próximos pedidos
    diria_config_save($credentials);

    $status = diria_db_status();
    $status['message'] = 'Base de dados MySQL conectada, tabelas criadas e conteúdo inicial inserido com sucesso!';

    return $status;
}

/**
 * Estado actual da base de dados no formato DatabaseStatus do frontend.
 *
 * @return array<string,mixed>
 */
function diria_db_status(): array
{
    $user = diria_console_user();
    $dbName = (string) diria_config('db_name', '');
    $notInitializedMessage = $dbName !== '' && $dbName !== 'if0_XXXXXXXX_diria'
        ? 'Base de dados ainda não inicializada. Abre o Assistente de Instalação (setup.php) ou usa o painel de Base de Dados para ligar ao MySQL da InfinityFree.'
        : 'Configura primeiro as credenciais MySQL. Abre setup.php no navegador para concluir a instalação.';

    $base = [
        'success' => true,
        'databaseName' => $dbName,
        'host' => (string) diria_config('db_host', ''),
        'port' => (int) diria_config('db_port', 3306),
        'user' => (string) diria_config('db_user', ''),
        'cpanelDetected' => true,
        'cpanelUser' => $user,
        'timestamp' => gmdate('Y-m-d\TH:i:s.v\Z'),
    ];

    try {
        $pdo = diria_pdo();
        $tables = diria_db_tables($pdo);

        if (!in_array('lawyers', $tables, true)) {
            // Ligação OK mas esquema em falta (ex.: base de dados vazia).
            diria_db_ensure_schema($pdo);
            diria_db_seed($pdo);
            $tables = diria_db_tables($pdo);
        }

        return array_merge($base, [
            'mode' => 'mysql',
            'connected' => true,
            'tablesCount' => count($tables),
            'tables' => array_values($tables),
            'seeded' => in_array('lawyers', $tables, true),
            'message' => 'Base de dados MySQL provisionada e operacional com sucesso!',
            'recordsSummary' => [
                'users' => diria_db_count($pdo, 'users'),
                'lawyers' => diria_db_count($pdo, 'lawyers'),
                'consultations' => diria_db_count($pdo, 'consultations'),
                'documents' => diria_db_count($pdo, 'user_documents'),
                'laborSimulations' => diria_db_count($pdo, 'labor_simulations'),
            ],
        ]);
    } catch (Throwable $e) {
        return array_merge($base, [
            'mode' => 'not-initialized',
            'connected' => false,
            'tablesCount' => 0,
            'tables' => [],
            'seeded' => false,
            'message' => $notInitializedMessage,
            'details' => $e->getMessage(),
            'recordsSummary' => [
                'users' => 0,
                'lawyers' => 0,
                'consultations' => 0,
                'documents' => 0,
                'laborSimulations' => 0,
            ],
        ]);
    }
}

/**
 * Nome da conta de alojamento (usado para pré-preencher o modal).
 *
 * No InfinityFree o utilizador é algo como "if0_35949895".
 */
function diria_console_user(): ?string
{
    foreach (['USER', 'LOGNAME', 'USERNAME'] as $key) {
        $value = getenv($key);
        if (is_string($value) && $value !== '') {
            return $value;
        }
    }

    $owner = @get_current_user();
    if (is_string($owner) && $owner !== '' && $owner !== 'root') {
        return $owner;
    }

    // Em último recurso, deriva do nome da base de dados (prefixo antes de "_").
    $dbName = (string) diria_config('db_name', '');
    if (preg_match('/^(if0_\d+|[a-z0-9]+)_/', $dbName, $matches)) {
        return $matches[1];
    }

    return null;
}
