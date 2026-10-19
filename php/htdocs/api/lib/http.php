<?php
/**
 * DirIA Angola — Utilitários HTTP (JSON in/out, CORS, erros).
 */

declare(strict_types=1);

/** Lê o corpo JSON do pedido como array. */
function diria_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Envia uma resposta JSON e termina a execução. */
function diria_json($payload, int $status = 200): void
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        // O frontend é servido do mesmo domínio; CORS só ajuda em testes locais.
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Erro JSON padronizado. */
function diria_json_error(string $message, int $status = 500, ?string $details = null): void
{
    $payload = ['error' => $message];
    if ($details !== null) {
        $payload['details'] = $details;
    }
    diria_json($payload, $status);
}

/** Trata o pedido OPTIONS (preflight). */
function diria_handle_preflight(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        diria_json(['ok' => true], 204);
    }
}
