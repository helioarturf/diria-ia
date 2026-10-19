<?php
/**
 * DirIA Angola — Front controller da API (equivalente a server.ts).
 *
 * Rotas:
 *   POST /api/chat
 *   POST /api/tts
 *   POST /api/generate-draft
 *   POST /api/analyze-document
 *   GET  /api/health
 *   GET  /api/db/status
 *   POST /api/db/auto-provision
 *   GET  /api/db/schema-sql
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/bootstrap.php';

diria_install_error_handler(true);
diria_handle_preflight();

$method = diria_method();
$route = diria_route();

switch ($route) {
    case '/chat':
        diria_require_method($method, ['POST']);
        diria_handle_chat();
        break;

    case '/tts':
        diria_require_method($method, ['POST']);
        diria_handle_tts();
        break;

    case '/generate-draft':
        diria_require_method($method, ['POST']);
        diria_handle_generate_draft();
        break;

    case '/analyze-document':
        diria_require_method($method, ['POST']);
        diria_handle_analyze_document();
        break;

    case '/health':
        diria_require_method($method, ['GET']);
        diria_handle_health();
        break;

    case '/db/status':
        diria_require_method($method, ['GET']);
        diria_json(diria_db_status());
        break;

    case '/db/auto-provision':
        diria_require_method($method, ['POST']);
        diria_json(diria_db_provision(diria_json_body()));
        break;

    case '/db/schema-sql':
        diria_require_method($method, ['GET']);
        if (!headers_sent()) {
            header('Content-Type: text/plain; charset=utf-8');
            header('Content-Disposition: attachment; filename="diria_cpanel_schema.sql"');
        }
        echo diria_schema_sql();
        exit;

    default:
        diria_json_error('Rota não encontrada: ' . $route, 404);
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

/** Garante que o método HTTP é aceite. */
function diria_require_method(string $method, array $allowed): void
{
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        diria_json_error('Método ' . $method . ' não permitido nesta rota.', 405);
    }
}

/** POST /api/chat */
function diria_handle_chat(): void
{
    $body = diria_json_body();
    $messages = $body['messages'] ?? null;
    $consultationType = $body['consultationType'] ?? null;
    $attachedDoc = $body['attachedDoc'] ?? null;
    $userProfile = is_array($body['userProfile'] ?? null) ? $body['userProfile'] : null;

    if (!is_array($messages) || count($messages) === 0) {
        diria_json_error('Nenhuma mensagem fornecida.', 400);
    }

    $history = [];
    foreach ($messages as $message) {
        $role = ($message['role'] ?? 'user') === 'user' ? 'Utilizador' : 'DirIA';
        $history[] = $role . ': ' . (string) ($message['content'] ?? '');
    }
    $conversationHistory = implode("\n\n", $history);

    $extraContext = '';
    if ($userProfile) {
        $extraContext .= "\n[PERFIL DO UTILIZADOR ACTIVO:"
            . "\n- Papel / Função: " . ($userProfile['role'] ?? 'Geral')
            . "\n- Nível de Experiência: " . ($userProfile['experienceLevel'] ?? 'Intermédio')
            . "\n- Estilo de Resposta Solicitado: " . ($userProfile['responseStyle'] ?? 'Equilibrado')
            . "\n- Áreas de Foco Seleccionadas: " . (implode(', ', (array) ($userProfile['primaryAreas'] ?? [])) ?: 'Todas as áreas')
            . "\n- Província / Comarca de Referência: " . ($userProfile['province'] ?? 'Angola Geral')
            . (!empty($userProfile['name']) ? "\n- Nome/Tratamento: " . $userProfile['name'] : '')
            . (!empty($userProfile['institutionOrFirm']) ? "\n- Instituição / Gabinete: " . $userProfile['institutionOrFirm'] : '')
            . "\nINSTRUÇÃO CRUCIAL: Modela integralmente a tua linguagem, profundidade e vocabulário ao perfil acima!]";
    }

    if (is_string($consultationType) && $consultationType !== '') {
        $extraContext .= "\n[Área Jurídica da Consulta: " . $consultationType . ']';
    }

    if (is_array($attachedDoc)) {
        $docContent = $attachedDoc['content'] ?? ($attachedDoc['summary'] ?? '');
        $extraContext .= "\n[Documento em Análise: Nome: \"" . ($attachedDoc['name'] ?? '') . '", Conteúdo / Resumo: ' . $docContent . ']';
    }

    $prompt = "Histórico da consulta:\n{$conversationHistory}\n{$extraContext}\n\nResponde ao último pedido do utilizador, aplicando com precisão o ramo do direito angolano correspondente ao assunto e adaptando rigorosamente ao perfil de experiência especificado.";

    $replyText = '';
    try {
        $replyText = diria_gemini_generate($prompt, diria_system_prompt(), 0.2);
    } catch (Throwable $e) {
        error_log('[DirIA chat] Geração com Gemini falhou: ' . $e->getMessage());
    }

    if ($replyText === '') {
        $replyText = diria_fallback_reply($messages, $userProfile);
    }

    diria_json([
        'text' => $replyText,
        'complexity' => diria_extract_complexity($replyText),
        'suggestions' => diria_extract_suggestions($replyText),
    ]);
}

/** POST /api/tts */
function diria_handle_tts(): void
{
    $body = diria_json_body();
    $text = (string) ($body['text'] ?? '');

    if ($text === '') {
        diria_json_error('Texto obrigatório.', 400);
    }

    $cleanText = mb_substr(str_replace(['*', '#', '_', '`', '>'], '', $text), 0, 500);

    try {
        $audio = diria_gemini_tts($cleanText);
    } catch (Throwable $e) {
        diria_json_error('Erro na síntese de voz.', 500, $e->getMessage());
    }

    if ($audio === null) {
        diria_json_error('Não foi possível gerar áudio.', 500);
    }

    diria_json([
        'audio' => $audio,
        'mimeType' => 'audio/wav',
    ]);
}

/** POST /api/generate-draft */
function diria_handle_generate_draft(): void
{
    $body = diria_json_body();
    $documentType = (string) ($body['documentType'] ?? 'Minuta Jurídica');
    $details = $body['details'] ?? [];

    $prompt = "Como DirIA Angola, redige uma MINUTA JURÍDICA FORMAL completa e pronta a preencher, segundo as praxes e normas da Ordem dos Advogados de Angola e leis angolanas vigentes.\n"
        . "Tipo de Documento Solicitado: {$documentType}\n"
        . 'Dados e Contexto: ' . json_encode($details, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
        . 'Apresenta a minuta completa com cabeçalho institucional (República de Angola), identificação das partes, fundamentação nos artigos das leis angolanas pertinentes, cláusulas numeradas ou requerimento formal, local (ex: Luanda) e espaço para data e assinaturas.';

    try {
        $draft = diria_gemini_generate($prompt, diria_system_prompt(), 0.2);
    } catch (Throwable $e) {
        diria_json_error('Erro ao gerar minuta jurídica.', 500, $e->getMessage());
    }

    diria_json([
        'draft' => $draft,
        'title' => $documentType,
    ]);
}

/** POST /api/analyze-document */
function diria_handle_analyze_document(): void
{
    $body = diria_json_body();
    $fileName = (string) ($body['fileName'] ?? 'documento');
    $fileContent = (string) ($body['fileContent'] ?? '');
    $docCategory = (string) ($body['docCategory'] ?? 'Geral');

    $prompt = "Analisa juridicamente o seguinte documento segundo a legislação em vigor em Angola (Lei Geral do Trabalho Lei 12/23 se for laboral, Código Civil, Comercial ou Penal).\n"
        . "Nome do ficheiro: {$fileName}\n"
        . "Categoria: {$docCategory}\n\n"
        . "Conteúdo do documento:\n\"\"\"\n{$fileContent}\n\"\"\"\n\n"
        . "Faz uma auditoria jurídica detalhada:\n"
        . "1. Resumo executivo do teor do documento.\n"
        . "2. Conformidade com a Lei Angolana (o que está legal vs. eventuais cláusulas ilegais, nulas ou abusivas).\n"
        . "3. Riscos identificados para o trabalhador ou cliente.\n"
        . "4. Recomendações e medidas preventivas ou reparatórias imediatas.\n"
        . "5. Indicação clara se requer intervenção da IGT ou advogado da OAA.";

    try {
        $analysis = diria_gemini_generate($prompt, diria_system_prompt(), 0.1);
    } catch (Throwable $e) {
        diria_json_error('Erro na análise documental.', 500, $e->getMessage());
    }

    diria_json(['analysis' => $analysis]);
}

/** GET /api/health */
function diria_handle_health(): void
{
    $status = diria_db_status();

    diria_json([
        'status' => 'ok',
        'jurisdiction' => 'Angola',
        'legislation' => 'Lei 12/23, CRA 2010/2021',
        'runtime' => 'php-' . PHP_VERSION,
        'database' => [
            'mode' => $status['mode'],
            'connected' => $status['connected'],
            'tablesCount' => $status['tablesCount'],
            'databaseName' => $status['databaseName'],
        ],
    ]);
}
