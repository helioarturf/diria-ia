<?php
/**
 * DirIA Angola — Testes unitários da camada PHP (sem base de dados).
 *
 * Valida o contrato entre o esquema SQL e os dados de seed, a lógica de
 * fallback jurídico e a configuração — exactamente os pontos onde um erro
 * só apareceria em produção.
 *
 * Uso: php php/_test_units.php
 */

declare(strict_types=1);

require_once __DIR__ . '/htdocs/api/lib/bootstrap.php';

$pass = 0;
$fail = 0;

function ok(string $label, bool $condition, string $detail = ''): void
{
    global $pass, $fail;
    if ($condition) {
        printf("  \033[32m✔\033[0m %s\n", $label);
        $pass++;
        return;
    }
    printf("  \033[31m✖\033[0m %s%s\n", $label, $detail !== '' ? " — {$detail}" : '');
    $fail++;
}

echo "\n=== DirIA Angola · testes unitários ===\n\n";

// --- 1. Esquema SQL -----------------------------------------------------------
echo "Esquema SQL\n";

$statements = diria_schema_statements();
$expectedTables = [
    'users', 'consultations', 'messages', 'lawyers', 'user_documents',
    'consultation_requests', 'lawyer_reviews', 'labor_simulations', 'cpanel_system_logs',
];

ok('9 instruções DDL', count($statements) === 9, 'obtidas ' . count($statements));
ok(
    'todas começam por CREATE TABLE',
    count(array_filter($statements, static fn($s) => str_starts_with(ltrim($s), 'CREATE TABLE'))) === 9
);
ok('nenhuma contém comentários SQL', count(array_filter($statements, static fn($s) => str_contains($s, '--'))) === 0);

foreach ($expectedTables as $table) {
    ok("tabela `{$table}` presente", str_contains(implode(';', $statements), "CREATE TABLE IF NOT EXISTS `{$table}`"));
}

ok('8/9 tabelas — todas as esperadas', count($expectedTables) === 9);
ok(
    'todas as instruções terminam sem ";"',
    count(array_filter($statements, static fn($s) => str_ends_with($s, ';'))) === 0
);

// --- 2. Seed vs. colunas do INSERT -------------------------------------------
echo "\nSeed · advogados\n";

$lawyerColumns = [
    'id', 'name', 'oaa_number', 'location', 'specialty', 'phone', 'email', 'photo_url',
    'available', 'entity_type', 'province', 'address', 'bio', 'verified_oaa', 'rating', 'review_count',
];
$lawyers = diria_default_lawyers();

ok('3 advogados iniciais', count($lawyers) === 3, 'obtidos ' . count($lawyers));

$lawyerKeysOk = true;
foreach ($lawyers as $index => $lawyer) {
    $missing = array_diff($lawyerColumns, array_keys($lawyer));
    $extra = array_diff(array_keys($lawyer), $lawyerColumns);
    if ($missing || $extra) {
        $lawyerKeysOk = false;
        echo "      advogado #{$index}: em falta [" . implode(',', $missing) . '] extra [' . implode(',', $extra) . "]\n";
    }
}
ok('chaves dos advogados coincidem com as colunas do INSERT', $lawyerKeysOk);
ok('identificadores únicos', count(array_unique(array_column($lawyers, 'id'))) === 3);
ok('campos NOT NULL preenchidos', count(array_filter($lawyers, static fn($l) => $l['name'] !== '' && $l['oaa_number'] !== '' && $l['location'] !== '' && $l['specialty'] !== '')) === 3);

echo "\nSeed · consulta inicial\n";

$consultation = diria_initial_consultation();
$messageColumns = [
    'id', 'role', 'content', 'citation_law', 'citation_article',
    'citation_text', 'complexity', 'suggestions', 'audio_duration',
];

ok('consulta com id e categoria', $consultation['id'] !== '' && $consultation['category'] !== '');
ok('2 mensagens iniciais', count($consultation['messages']) === 2, 'obtidas ' . count($consultation['messages']));

$messageKeysOk = true;
foreach ($consultation['messages'] as $index => $message) {
    $missing = array_diff($messageColumns, array_keys($message));
    if ($missing) {
        $messageKeysOk = false;
        echo "      mensagem #{$index}: em falta [" . implode(',', $missing) . "]\n";
    }
}
ok('chaves das mensagens coincidem com as colunas do INSERT', $messageKeysOk);
ok('papéis válidos no ENUM', count(array_filter($consultation['messages'], static fn($m) => in_array($m['role'], ['user', 'assistant'], true))) === 2);
ok('sugestões serializáveis em JSON', is_string(json_encode($consultation['messages'][1]['suggestions'])));

// --- 3. Fallback jurídico ----------------------------------------------------
echo "\nFallback jurídico (sem IA)\n";

$cases = [
    ['Fui despedido sem justa causa.', 'Direito Laboral Angolano'],
    ['O senhorio aumentou a renda da casa.', 'Direito Imobiliário'],
    ['Quero registar uma sociedade por quotas.', 'Direito Comercial'],
    ['Fui chamado pela polícia por um crime.', 'Direito Penal'],
    ['Preciso de ajuda com um assunto geral.', 'Parecer Preliminar'],
];

foreach ($cases as [$question, $expected]) {
    $reply = diria_fallback_reply([['role' => 'user', 'content' => $question]], ['role' => 'Cidadão / Utente', 'province' => 'Luanda']);
    ok(
        '"' . mb_substr($question, 0, 32) . '..." -> ' . $expected,
        str_contains($reply, $expected),
        'obtido: ' . mb_substr(strip_tags($reply), 0, 60)
    );
}

$labour = diria_fallback_reply([['role' => 'user', 'content' => 'despedimento']], null);
ok('província por omissão (Luanda)', str_contains($labour, 'Luanda'));
ok('perfil por omissão (Cidadão)', str_contains($labour, 'Cidadão / Utente'));

$custom = diria_fallback_reply(
    [['role' => 'user', 'content' => 'despedimento']],
    ['role' => 'Advogado / Jurista', 'province' => 'Benguela']
);
ok('perfil personalizado aplicado', str_contains($custom, 'Benguela') && str_contains($custom, 'Advogado / Jurista'));

// --- 4. Complexidade e sugestões --------------------------------------------
echo "\nClassificação e sugestões\n";

ok('complexidade Elevada (despedimento ilícito)', diria_extract_complexity('trata-se de um despedimento ilícito') === 'Elevada');
ok('complexidade Baixa (mero esclarecimento)', diria_extract_complexity('é um mero esclarecimento') === 'Baixa');
ok('complexidade Média (por omissão)', diria_extract_complexity('resposta genérica') === 'Média');

ok('3 sugestões (laboral)', count(diria_extract_suggestions('queixa na IGT')) === 3);
ok('sugestões laborais corretas', in_array('Simular cálculo de indemnização Lei 12/23', diria_extract_suggestions('IGT'), true));
ok('sugestões imobiliárias', in_array('Prazo legal de denúncia do senhorio segundo a Lei 26/15', diria_extract_suggestions('arrendamento'), true));
ok('sugestões comerciais', in_array('Obrigações fiscais perante a AGT e INSS', diria_extract_suggestions('sociedade'), true));
ok('sugestões genéricas', in_array('Agendar consulta com advogado especialista da OAA', diria_extract_suggestions('outro assunto'), true));

// --- 5. Prompt de sistema ----------------------------------------------------
echo "\nPrompt de sistema\n";

$prompt = diria_system_prompt();
ok('menciona a OAA', str_contains($prompt, 'Ordem dos Advogados de Angola'));
ok('cobre a Lei 12/23', str_contains($prompt, 'Lei n.º 12/23'));
ok('cobre a CRA', str_contains($prompt, 'Constituição da República de Angola'));
ok('exige adaptação ao perfil', str_contains($prompt, 'ADAPTAÇÃO DINÂMICA AO PERFIL'));

// --- 6. Configuração ---------------------------------------------------------
echo "\nConfiguração\n";

ok('modelo de chat definido', (string) diria_config('gemini_model') !== '');
ok('modelo de voz definido', (string) diria_config('gemini_tts_model') !== '');
ok('porta numérica', is_int(diria_config('db_port', 3306)));

putenv('DIRIA_TEST_MARKER=valor-de-teste');
$before = diria_config('environment');
diria_config_set(['environment' => 'teste-unitario']);
ok('diria_config_set altera em memória', diria_config('environment') === 'teste-unitario');
diria_config_set(['environment' => $before]);

ok('segredo não vaza no estado', !array_key_exists('gemini_api_key', diria_db_status()));
$status = diria_db_status();
ok('estado tem os campos do frontend', isset($status['mode'], $status['connected'], $status['tablesCount'], $status['tables'], $status['recordsSummary']));
ok('timestamp em ISO-8601', (bool) preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', (string) $status['timestamp']));

// --- 7. Rota ---------------------------------------------------------------
echo "\nResolução de rotas\n";

$_SERVER['SCRIPT_NAME'] = '/api/index.php';
$_SERVER['REQUEST_URI'] = '/api/db/status';
ok('rota /api/db/status', diria_route() === '/db/status');

$_SERVER['REQUEST_URI'] = '/api/chat?x=1';
ok('rota ignora a query string', diria_route() === '/chat');

$_SERVER['SCRIPT_NAME'] = '/sub/api/index.php';
$_SERVER['REQUEST_URI'] = '/sub/api/db/schema-sql';
ok('rota em subpasta', diria_route() === '/db/schema-sql');

$_SERVER['SCRIPT_NAME'] = '/api/index.php';
$_SERVER['REQUEST_URI'] = '/api/';
ok('rota raiz normalizada', diria_route() === '/');

// --- Resumo -----------------------------------------------------------------
echo "\n";
if ($fail === 0) {
    printf("\033[32m%d verificações passaram.\033[0m\n\n", $pass);
    exit(0);
}

printf("\033[31m%d falharam\033[0m, %d passaram.\n\n", $fail, $pass);
exit(1);
