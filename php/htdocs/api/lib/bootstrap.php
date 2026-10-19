<?php
/**
 * DirIA Angola — Bootstrap comum (includes, polyfills e tratamento de erros).
 */

declare(strict_types=1);

// --- Polyfills defensivos (alojamentos sem mbstring) -------------------------
if (!function_exists('mb_strtolower')) {
    function mb_strtolower(string $string, ?string $encoding = null): string
    {
        return strtolower($string);
    }
}
if (!function_exists('mb_strpos')) {
    function mb_strpos(string $haystack, string $needle, int $offset = 0): int|false
    {
        return strpos($haystack, $needle, $offset);
    }
}
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool
    {
        return $needle === '' || strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/http.php';
require_once __DIR__ . '/prompt.php';
require_once __DIR__ . '/schema.php';
require_once __DIR__ . '/seed.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/gemini.php';

/**
 * Instala o handler de excepções que responde sempre em JSON.
 *
 * @param bool $asJson true para a API; false para o setup (HTML).
 */
function diria_install_error_handler(bool $asJson = true): void
{
    set_exception_handler(static function (Throwable $e) use ($asJson): void {
        error_log('[DirIA] ' . $e->getMessage());
        $status = $e instanceof DiriaDbException || $e instanceof DiriaGeminiException ? 500 : 500;

        if ($asJson) {
            $payload = ['error' => $e->getMessage()];
            $payload['details'] = $e->getMessage();
            http_response_code($status);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code($status);
            header('Content-Type: text/html; charset=utf-8');
            echo '<h1>Erro DirIA</h1><pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES) . '</pre>';
        }
        exit;
    });
}

/** Devolve o método HTTP do pedido. */
function diria_method(): string
{
    return strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
}

/**
 * Normaliza a rota pedida (ex.: "/api/chat" -> "/chat").
 *
 * Funciona quer a aplicação esteja na raiz do domínio quer numa subpasta.
 */
function diria_route(): string
{
    $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
    $path = parse_url($uri, PHP_URL_PATH);
    $path = is_string($path) ? $path : '/';

    $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'));
    $base = rtrim(dirname($script), '/');

    if ($base !== '' && $base !== '/' && strpos($path, $base) === 0) {
        $path = substr($path, strlen($base));
    }

    $path = '/' . trim($path, '/');

    return $path === '//' ? '/' : $path;
}
