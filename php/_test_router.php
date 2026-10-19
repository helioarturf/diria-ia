<?php
/**
 * Router de teste para o servidor embutido do PHP.
 *
 * Reproduz o comportamento do .htaccess de produção:
 *   - /api/*  -> api/index.php
 *   - restantes ficheiros existentes -> servidos tal como estão
 *
 * Uso: php -S 127.0.0.1:8099 -t php/htdocs php/_test_router.php
 */

declare(strict_types=1);

$uri = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$docroot = getenv('DIRIA_DOCROOT') ?: (__DIR__ . '/htdocs');
$path = $docroot . $uri;

if (preg_match('#^/api(/.*)?$#', $uri)) {
    $_SERVER['SCRIPT_NAME'] = '/api/index.php';
    require $docroot . '/api/index.php';
    return true;
}

if ($uri === '/' || is_file($path)) {
    return false; // deixa o servidor embutido entregar o ficheiro
}

// Fallback SPA
$index = $docroot . '/index.html';
if (is_file($index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($index);
    return true;
}

http_response_code(404);
echo 'Not found';
return true;
