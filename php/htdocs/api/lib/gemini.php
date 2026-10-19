<?php
/**
 * DirIA Angola — Cliente Google Gemini via cURL.
 *
 * Requer a extensão cURL (disponível no InfinityFree). Se a extensão estiver
 * desactivada, cai automaticamente para file_get_contents com allow_url_fopen.
 */

declare(strict_types=1);

/** Erro devolvido pela API Gemini ou por falha de rede. */
class DiriaGeminiException extends RuntimeException
{
}

/**
 * Envia um pedido POST JSON e devolve o corpo descodificado.
 *
 * @param array<string,mixed> $payload
 * @return array<string,mixed>
 */
function diria_http_post_json(string $url, array $payload, int $timeout = 60): array
{
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($body === false) {
        throw new DiriaGeminiException('Falha ao codificar o pedido JSON.');
    }

    $headers = [
        'Content-Type: application/json',
        'User-Agent: aistudio-build',
    ];

    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
        ]);

        $response = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $error = curl_error($handle);
        curl_close($handle);

        if ($response === false) {
            throw new DiriaGeminiException('Falha de rede ao contactar a API: ' . $error);
        }

        return diria_decode_api_response((string) $response, $status);
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $body,
            'timeout' => $timeout,
            'ignore_errors' => true,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        throw new DiriaGeminiException('Falha de rede ao contactar a API (sem cURL).');
    }

    $status = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $status = (int) $m[1];
    }

    return diria_decode_api_response($response, $status);
}

/**
 * Descodifica a resposta JSON, convertendo erros HTTP em excepções legíveis.
 *
 * @return array<string,mixed>
 */
function diria_decode_api_response(string $raw, int $status): array
{
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        throw new DiriaGeminiException('Resposta inválida da API (HTTP ' . $status . ').');
    }

    if ($status >= 400 || isset($data['error'])) {
        $message = $data['error']['message'] ?? ('HTTP ' . $status);
        throw new DiriaGeminiException('API Gemini: ' . $message, $status);
    }

    return $data;
}

/** Concatena todo o texto devolvido em candidates[0].content.parts[].text */
function diria_gemini_extract_text(array $data): string
{
    $parts = $data['candidates'][0]['content']['parts'] ?? [];
    $chunks = [];

    foreach ((array) $parts as $part) {
        if (isset($part['text']) && is_string($part['text'])) {
            $chunks[] = $part['text'];
        }
    }

    return trim(implode("\n", $chunks));
}

/**
 * Gera conteúdo textual com o modelo configurado.
 *
 * @throws DiriaGeminiException
 */
function diria_gemini_generate(string $prompt, ?string $systemInstruction = null, float $temperature = 0.2, ?string $model = null): string
{
    $key = (string) diria_config('gemini_api_key', '');
    if ($key === '') {
        throw new DiriaGeminiException('GEMINI_API_KEY não configurada.');
    }

    $model = $model ?: (string) diria_config('gemini_model', 'gemini-3.8-flash');
    $url = sprintf(
        'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
        rawurlencode($model),
        rawurlencode($key)
    );

    $payload = [
        'contents' => [
            [
                'role' => 'user',
                'parts' => [['text' => $prompt]],
            ],
        ],
        'generationConfig' => [
            'temperature' => $temperature,
        ],
    ];

    if ($systemInstruction !== null && $systemInstruction !== '') {
        $payload['systemInstruction'] = [
            'parts' => [['text' => $systemInstruction]],
        ];
    }

    $data = diria_http_post_json($url, $payload);

    return diria_gemini_extract_text($data);
}

/**
 * Sintetiza voz e devolve a base64 do áudio (ou null se indisponível).
 *
 * @throws DiriaGeminiException
 */
function diria_gemini_tts(string $text): ?string
{
    $key = (string) diria_config('gemini_api_key', '');
    if ($key === '') {
        throw new DiriaGeminiException('GEMINI_API_KEY não configurada.');
    }

    $model = (string) diria_config('gemini_tts_model', 'gemini-3.8-flash-lite-tts');
    $url = sprintf(
        'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
        rawurlencode($model),
        rawurlencode($key)
    );

    $payload = [
        'contents' => [
            [
                'role' => 'user',
                'parts' => [['text' => $text]],
            ],
        ],
        'generationConfig' => [
            'responseModalities' => ['AUDIO'],
            'speechConfig' => [
                'voiceConfig' => [
                    'prebuiltVoiceConfig' => ['voiceName' => 'Kore'],
                ],
            ],
        ],
    ];

    $data = diria_http_post_json($url, $payload, 90);

    $inline = $data['candidates'][0]['content']['parts'][0]['inlineData']['data'] ?? null;

    return is_string($inline) && $inline !== '' ? $inline : null;
}
