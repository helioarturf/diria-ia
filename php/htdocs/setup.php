<?php
/**
 * DirIA Angola — Assistente de instalação (InfinityFree / cPanel).
 *
 * Acede em: https://o-teu-dominio/setup.php
 *
 * 1. Verifica o ambiente PHP do alojamento.
 * 2. Liga ao MySQL, cria as tabelas e insere o conteúdo inicial.
 * 3. Guarda as credenciais em api/config.local.php.
 * 4. Testa a chave da API Google Gemini.
 *
 * IMPORTANTE: apaga (ou renomeia) este ficheiro depois de concluíres.
 */

declare(strict_types=1);

require_once __DIR__ . '/api/lib/bootstrap.php';

diria_install_error_handler(false);

$messages = [];
$errors = [];

if (diria_method() === 'POST') {
    $action = (string) ($_POST['action'] ?? 'install');

    if ($action === 'install') {
        $input = [
            'host' => trim((string) ($_POST['db_host'] ?? '')),
            'port' => (int) ($_POST['db_port'] ?? 3306),
            'database' => trim((string) ($_POST['db_name'] ?? '')),
            'user' => trim((string) ($_POST['db_user'] ?? '')),
            'password' => (string) ($_POST['db_password'] ?? ''),
        ];

        try {
            $status = diria_db_provision($input);
            $messages[] = $status['message'];
            $messages[] = 'Tabelas criadas: ' . implode(', ', (array) $status['tables']);
            $messages[] = 'Advogados no directório: ' . (int) ($status['recordsSummary']['lawyers'] ?? 0);
        } catch (Throwable $e) {
            $errors[] = 'Base de dados: ' . $e->getMessage();
        }

        $geminiKey = trim((string) ($_POST['gemini_api_key'] ?? ''));
        $model = trim((string) ($_POST['gemini_model'] ?? '')) ?: (string) diria_config('gemini_model', 'gemini-3.8-flash');
        $ttsModel = trim((string) ($_POST['gemini_tts_model'] ?? '')) ?: (string) diria_config('gemini_tts_model', 'gemini-3.8-flash-lite-tts');

        if ($geminiKey !== '') {
            $saved = diria_config_save([
                'gemini_api_key' => $geminiKey,
                'gemini_model' => $model,
                'gemini_tts_model' => $ttsModel,
            ]);
            $messages[] = $saved
                ? 'Chave da API Google guardada em api/config.local.php.'
                : 'ATENÇÃO: não foi possível escrever api/config.local.php — preenche-o à mão.';
        } elseif (trim((string) diria_config('gemini_api_key', '')) === '') {
            $errors[] = 'Sem chave da API Google: a aplicação funciona, mas responde sempre com a síntese jurídica integrada (sem IA).';
        }
    }

    if ($action === 'test_gemini') {
        try {
            $reply = diria_gemini_generate('Responde apenas com a palavra: operacional', null, 0.0);
            $messages[] = 'Teste ao modelo "' . diria_config('gemini_model') . '" bem-sucedido: ' . trim($reply);
        } catch (Throwable $e) {
            $errors[] = 'Teste Gemini falhou: ' . $e->getMessage();
        }
    }
}

$status = diria_db_status();
$cfg = diria_config();

/** Verifica um requisito e devolve [ok, detalhe]. */
function diria_check(string $label, bool $ok, string $detail, bool $warnOnly = false): array
{
    return ['label' => $label, 'ok' => $ok, 'detail' => $detail, 'warn' => $warnOnly];
}

$checks = [
    diria_check('Versão PHP', version_compare(PHP_VERSION, '8.0.0', '>='), PHP_VERSION),
    diria_check('Extensão pdo_mysql', extension_loaded('pdo_mysql'), extension_loaded('pdo_mysql') ? 'disponível' : 'EM FALTA (obrigatória)'),
    diria_check('Extensão curl', function_exists('curl_init'), function_exists('curl_init') ? 'disponível' : 'ausente (usa allow_url_fopen)'),
    diria_check('allow_url_fopen', (bool) ini_get('allow_url_fopen'), ini_get('allow_url_fopen') ? 'activado' : 'desactivado', true),
    diria_check('Extensão mbstring', extension_loaded('mbstring'), extension_loaded('mbstring') ? 'disponível' : 'ausente (polyfill activo)', true),
    diria_check('Escrita em api/', is_writable(__DIR__ . '/api'), is_writable(__DIR__ . '/api') ? 'permissões OK' : 'sem permissão de escrita'),
    diria_check('config.local.php', is_file(__DIR__ . '/api/config.local.php'), is_file(__DIR__ . '/api/config.local.php') ? 'existe' : 'será criado agora', true),
];

$e = static fn($value): string => htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="pt-AO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DirIA Angola — Assistente de Instalação</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 16px; background: #020617; color: #e2e8f0;
         font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; line-height: 1.55; }
  .wrap { max-width: 780px; margin: 0 auto; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 32px 0 12px; color: #fbbf24; text-transform: uppercase; letter-spacing: .06em; }
  .sub { color: #94a3b8; margin: 0 0 24px; }
  .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; margin-bottom: 18px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 7px 0; border-bottom: 1px solid #1e293b; vertical-align: top; }
  td:last-child { text-align: right; color: #cbd5e1; }
  .ok { color: #4ade80; font-weight: 600; }
  .bad { color: #f87171; font-weight: 600; }
  .warn { color: #fbbf24; font-weight: 600; }
  label { display: block; font-size: 13px; color: #94a3b8; margin: 14px 0 5px; }
  input { width: 100%; padding: 10px 12px; border-radius: 9px; border: 1px solid #334155;
          background: #020617; color: #e2e8f0; font-size: 14px; font-family: monospace; }
  input:focus { outline: 2px solid #f59e0b; outline-offset: 1px; }
  .row { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
  .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  button { margin-top: 20px; padding: 12px 22px; border: 0; border-radius: 10px; cursor: pointer;
           background: linear-gradient(135deg,#f59e0b,#d97706); color: #0b1120; font-weight: 700; font-size: 15px; }
  button.ghost { background: #1e293b; color: #e2e8f0; font-weight: 600; margin-left: 8px; }
  .msg { border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; font-size: 14px; }
  .msg.ok { background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.35); color: #bbf7d0; }
  .msg.err { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.4); color: #fecaca; }
  code { background: #1e293b; padding: 2px 6px; border-radius: 5px; font-size: 13px; }
  .hint { font-size: 13px; color: #94a3b8; margin-top: 8px; }
  .links a { color: #fbbf24; text-decoration: none; margin-right: 16px; font-weight: 600; }
</style>
</head>
<body>
<div class="wrap">
  <h1>DirIA Angola — Instalação</h1>
  <p class="sub">Plataforma de Inteligência Jurídica de Angola · Backend PHP + MySQL (InfinityFree)</p>

  <?php foreach ($messages as $message): ?>
    <div class="msg ok"><?= $e($message) ?></div>
  <?php endforeach; ?>
  <?php foreach ($errors as $error): ?>
    <div class="msg err"><?= $e($error) ?></div>
  <?php endforeach; ?>

  <h2>1 · Ambiente do alojamento</h2>
  <div class="card">
    <table>
      <?php foreach ($checks as $check): ?>
        <tr>
          <td><?= $e($check['label']) ?></td>
          <td>
            <span class="<?= $check['ok'] ? 'ok' : ($check['warn'] ? 'warn' : 'bad') ?>">
              <?= $check['ok'] ? '✔' : '✖' ?>
            </span>
            <?= $e($check['detail']) ?>
          </td>
        </tr>
      <?php endforeach; ?>
    </table>
  </div>

  <h2>2 · Estado da base de dados</h2>
  <div class="card">
    <table>
      <tr><td>Modo</td><td class="<?= $status['mode'] === 'mysql' ? 'ok' : 'bad' ?>"><?= $e(strtoupper((string) $status['mode'])) ?></td></tr>
      <tr><td>Ligado</td><td><?= $status['connected'] ? 'Sim' : 'Não' ?></td></tr>
      <tr><td>Servidor</td><td><?= $e($status['host']) ?>:<?= $e($status['port']) ?></td></tr>
      <tr><td>Base de dados</td><td><?= $e($status['databaseName']) ?></td></tr>
      <tr><td>Utilizador</td><td><?= $e($status['user']) ?></td></tr>
      <tr><td>Tabelas</td><td><?= (int) $status['tablesCount'] ?></td></tr>
      <tr><td>Mensagem</td><td><?= $e($status['message']) ?></td></tr>
    </table>
    <?php if (!$status['connected'] && !empty($status['details'])): ?>
      <p class="hint">Detalhe técnico: <code><?= $e($status['details']) ?></code></p>
    <?php endif; ?>
  </div>

  <h2>3 · Credenciais e chave de IA</h2>
  <div class="card">
    <form method="post" autocomplete="off">
      <input type="hidden" name="action" value="install">

      <div class="row">
        <div>
          <label>Servidor MySQL (host)</label>
          <input name="db_host" value="<?= $e($_POST['db_host'] ?? $cfg['db_host']) ?>" placeholder="sqlXXX.infinityfree.com" required>
        </div>
        <div>
          <label>Porta</label>
          <input name="db_port" value="<?= $e($_POST['db_port'] ?? $cfg['db_port']) ?>" placeholder="3306">
        </div>
      </div>

      <div class="row">
        <div>
          <label>Nome da base de dados</label>
          <input name="db_name" value="<?= $e($_POST['db_name'] ?? $cfg['db_name']) ?>" placeholder="if0_12345678_diria" required>
        </div>
        <div>
          <label>Utilizador MySQL</label>
          <input name="db_user" value="<?= $e($_POST['db_user'] ?? $cfg['db_user']) ?>" placeholder="if0_12345678" required>
        </div>
      </div>

      <label>Password do MySQL</label>
      <input type="password" name="db_password" value="" placeholder="(deixa vazio para manter a actual)">

      <label>Chave da API Google Gemini (GEMINI_API_KEY)</label>
      <input name="gemini_api_key" value="" placeholder="AIza... (deixa vazio para manter a actual)">

      <div class="row3">
        <div>
          <label>Modelo de chat</label>
          <input name="gemini_model" value="<?= $e($cfg['gemini_model']) ?>">
        </div>
        <div>
          <label>Modelo de voz (TTS)</label>
          <input name="gemini_tts_model" value="<?= $e($cfg['gemini_tts_model']) ?>">
        </div>
        <div>
          <label>Ambiente</label>
          <input name="environment" value="<?= $e($cfg['environment']) ?>" disabled>
        </div>
      </div>

      <p class="hint">No InfinityFree, cria primeiro a base de dados e o utilizador no painel
        <strong>MySQL Databases</strong> e copia o host indicado (ex.: <code>sql123.infinityfree.com</code>).
        Esta ferramenta cria as tabelas e o conteúdo inicial, não a base de dados.</p>

      <button type="submit">Instalar / Actualizar</button>
    </form>

    <form method="post" autocomplete="off">
      <input type="hidden" name="action" value="test_gemini">
      <button type="submit" class="ghost">Testar ligação ao Gemini</button>
    </form>
  </div>

  <h2>4 · Verificação final</h2>
  <div class="card links">
    <a href="api/health" target="_blank">/api/health</a>
    <a href="api/db/status" target="_blank">/api/db/status</a>
    <a href="api/db/schema-sql" target="_blank">Esquema SQL</a>
    <a href="./">Abrir a aplicação</a>
    <p class="hint">Quando tudo estiver verde, apaga este ficheiro (<code>setup.php</code>) do alojamento.</p>
  </div>
</div>
</body>
</html>
