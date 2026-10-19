<?php
/**
 * DirIA Angola — Configuração.
 *
 * As credenciais reais vivem em config.local.php (gerado pelo setup.php
 * ou preenchido à mão). Este ficheiro contém apenas os valores por omissão.
 *
 * NOTA sobre os modelos: os nomes abaixo seguem a configuração original do
 * servidor Node (que usava identificadores internos do AI Studio). Se a API
 * Google devolver erro 404 "model not found", substitui pelos identificadores
 * públicos actuais, por exemplo:
 *   'gemini_model'     => 'gemini-2.5-flash',
 *   'gemini_tts_model' => 'gemini-2.5-flash-preview-tts',
 */

declare(strict_types=1);

$defaults = [
    // Base de dados MySQL (InfinityFree / cPanel)
    'db_host'      => 'sqlXXX.infinityfree.com',
    'db_port'      => 3306,
    'db_name'      => 'if0_XXXXXXXX_diria',
    'db_user'      => 'if0_XXXXXXXX',
    'db_password'  => '',

    // Google Gemini (obrigatório para respostas de IA e síntese de voz)
    'gemini_api_key' => '',

    // Modelos usados (iguais aos do servidor Node)
    'gemini_model'     => 'gemini-3.8-flash',
    'gemini_tts_model' => 'gemini-3.8-flash-lite-tts',

    // Nome visível do ambiente (mostrado no estado do banco)
    'environment'  => 'infinityfree',
];

$localFile = __DIR__ . '/config.local.php';
$local = [];
if (is_file($localFile)) {
    /** @noinspection PhpIncludeInspection */
    $loaded = require $localFile;
    if (is_array($loaded)) {
        $local = $loaded;
    }
}

$config = array_merge($defaults, $local);

// Variáveis de ambiente têm precedência (útil em testes e em deploy automatizado)
$envMap = [
    'DB_HOST' => 'db_host',
    'DB_PORT' => 'db_port',
    'DB_NAME' => 'db_name',
    'DB_USER' => 'db_user',
    'DB_PASSWORD' => 'db_password',
    'GEMINI_API_KEY' => 'gemini_api_key',
    'GEMINI_MODEL' => 'gemini_model',
    'GEMINI_TTS_MODEL' => 'gemini_tts_model',
    'DIRIA_ENVIRONMENT' => 'environment',
];

foreach ($envMap as $envKey => $configKey) {
    $value = getenv($envKey);
    if ($value !== false && $value !== '') {
        $config[$configKey] = $configKey === 'db_port' ? (int) $value : $value;
    }
}

/**
 * Devolve um valor de configuração (ou todo o array).
 *
 * @param string|null $key
 * @param mixed       $default
 * @return mixed
 */
function diria_config(?string $key = null, $default = null)
{
    global $config;

    if ($key === null) {
        return $config;
    }
    return array_key_exists($key, $config) && $config[$key] !== '' ? $config[$key] : $default;
}

/**
 * Actualiza valores em memória para o pedido actual (sem tocar no ficheiro).
 *
 * @param array<string,mixed> $values
 */
function diria_config_set(array $values): void
{
    global $config;
    $config = array_merge($config, $values);
}

/**
 * Grava credenciais em config.local.php (best-effort).
 *
 * @param array<string,mixed> $values
 * @return bool true se o ficheiro foi escrito
 */
function diria_config_save(array $values): bool
{
    global $config;

    $known = [
        'db_host', 'db_port', 'db_name', 'db_user', 'db_password',
        'gemini_api_key', 'gemini_model', 'gemini_tts_model', 'environment',
    ];

    $merged = array_merge($config, array_intersect_key($values, array_flip($known)));
    diria_config_set($merged);

    $lines = [
        '<?php',
        '/**',
        ' * DirIA Angola — Credenciais locais (gerado automaticamente).',
        ' * NÃO versionar este ficheiro.',
        ' */',
        'return [',
    ];
    foreach ($known as $key) {
        if (!array_key_exists($key, $merged)) {
            continue;
        }
        $value = $merged[$key];
        if ($key === 'db_port') {
            $lines[] = "    '{$key}' => " . (int) $value . ',';
        } else {
            $lines[] = "    '{$key}' => " . var_export((string) $value, true) . ',';
        }
    }
    $lines[] = '];';
    $lines[] = '';

    $target = __DIR__ . '/config.local.php';
    $ok = @file_put_contents($target, implode("\n", $lines), LOCK_EX) !== false;
    if ($ok) {
        @chmod($target, 0640);
    }

    return $ok;
}
