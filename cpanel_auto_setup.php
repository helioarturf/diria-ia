<?php
/**
 * DirIA Angola — Auto-Instalador de Banco de Dados cPanel (PHP Zero-Intervenção)
 * Este script pode ser executado directamente no navegador ou por chamada HTTP
 * para criar o banco e as tabelas sem passar pelo phpMyAdmin.
 */

header('Content-Type: text/html; charset=utf-8');

$cpanelUser = get_current_user();
$defaultDbName = $cpanelUser . '_diria';
$defaultDbUser = $cpanelUser . '_diria';

$action = $_GET['action'] ?? $_POST['action'] ?? 'view';
$message = '';
$status = 'info';

if ($action === 'install') {
    $dbHost = $_POST['db_host'] ?? '127.0.0.1';
    $dbPort = $_POST['db_port'] ?? '3306';
    $dbName = $_POST['db_name'] ?? $defaultDbName;
    $dbUser = $_POST['db_user'] ?? $defaultDbUser;
    $dbPass = $_POST['db_pass'] ?? '';

    try {
        // 1. Tentar conectar sem nome do banco para criar
        try {
            $pdoRoot = new PDO("mysql:host=$dbHost;port=$dbPort;charset=utf8mb4", $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            $pdoRoot->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        } catch (Exception $eRoot) {
            // Se o utilizador não tem permissão global, o banco já deve ter sido criado no cPanel
        }

        // 2. Conectar directamente ao banco de dados
        $pdo = new PDO("mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);

        // 3. Executar o esquema DDL completo
        $sql = "
        CREATE TABLE IF NOT EXISTS `users` (
          `id` VARCHAR(64) PRIMARY KEY,
          `name` VARCHAR(255) NOT NULL,
          `email` VARCHAR(255) UNIQUE,
          `role` VARCHAR(64) DEFAULT 'Cidadão / Utente',
          `experience_level` VARCHAR(64) DEFAULT 'Iniciante',
          `response_style` VARCHAR(64) DEFAULT 'Prático & Directo',
          `province` VARCHAR(128) DEFAULT 'Luanda',
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `consultations` (
          `id` VARCHAR(64) PRIMARY KEY,
          `user_id` VARCHAR(64) NULL,
          `title` VARCHAR(255) NOT NULL,
          `category` VARCHAR(128) NOT NULL,
          `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `messages` (
          `id` VARCHAR(64) PRIMARY KEY,
          `consultation_id` VARCHAR(64) NOT NULL,
          `role` ENUM('user', 'assistant') NOT NULL,
          `content` MEDIUMTEXT NOT NULL,
          `citation_law` VARCHAR(255) NULL,
          `citation_article` VARCHAR(128) NULL,
          `citation_text` TEXT NULL,
          `complexity` VARCHAR(32) NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `lawyers` (
          `id` VARCHAR(64) PRIMARY KEY,
          `name` VARCHAR(255) NOT NULL,
          `oaa_number` VARCHAR(64) NOT NULL,
          `location` VARCHAR(128) NOT NULL,
          `specialty` VARCHAR(128) NOT NULL,
          `phone` VARCHAR(64) NULL,
          `email` VARCHAR(255) NULL,
          `photo_url` TEXT NULL,
          `available` TINYINT(1) DEFAULT 1,
          `province` VARCHAR(128) DEFAULT 'Luanda',
          `rating` DECIMAL(2,1) DEFAULT 5.0,
          `review_count` INT DEFAULT 0,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `user_documents` (
          `id` VARCHAR(64) PRIMARY KEY,
          `user_id` VARCHAR(64) NULL,
          `title` VARCHAR(255) NOT NULL,
          `category` VARCHAR(128) NOT NULL,
          `type` VARCHAR(64) NOT NULL,
          `status` VARCHAR(64) DEFAULT 'Finalizado',
          `content` LONGTEXT NOT NULL,
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `labor_simulations` (
          `id` VARCHAR(64) PRIMARY KEY,
          `monthly_salary` DECIMAL(14,2) NOT NULL,
          `years_service` INT NOT NULL,
          `compensation_amount` DECIMAL(14,2) NOT NULL,
          `gross_total` DECIMAL(14,2) NOT NULL,
          `net_total` DECIMAL(14,2) NOT NULL,
          `legal_basis` VARCHAR(255) DEFAULT 'Lei Geral do Trabalho Lei 12/23',
          `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";

        $pdo->exec($sql);

        // 4. Actualizar .env automaticamente
        $envContent = "# Configurações geradas pelo Instalador cPanel\n" .
                      "DB_HOST=$dbHost\n" .
                      "DB_PORT=$dbPort\n" .
                      "DB_USER=$dbUser\n" .
                      "DB_PASSWORD=$dbPass\n" .
                      "DB_NAME=$dbName\n" .
                      "CPANEL_USER=$cpanelUser\n";
        file_put_contents(__DIR__ . '/.env', $envContent, FILE_APPEND);

        $message = "Sucesso! O banco de dados '$dbName' e todas as 6 tabelas foram criados e configurados no cPanel!";
        $status = 'success';

        if (isset($_GET['format']) && $_GET['format'] === 'json') {
            echo json_encode(['success' => true, 'message' => $message]);
            exit;
        }
    } catch (Exception $ex) {
        $message = "Erro ao provisionar banco: " . $ex->getMessage();
        $status = 'error';
        if (isset($_GET['format']) && $_GET['format'] === 'json') {
            echo json_encode(['success' => false, 'error' => $message]);
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-AO">
<head>
  <meta charset="UTF-8">
  <title>Instalador de Banco DirIA Angola — cPanel</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Outfit', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
        ⚖️
      </div>
      <div>
        <h1 class="text-2xl font-bold text-white">DirIA Angola — Auto-Instalador cPanel</h1>
        <p class="text-sm text-slate-400">Criação automatizada de banco e tabelas sem phpMyAdmin</p>
      </div>
    </div>

    <?php if (!empty($message)): ?>
      <div class="mb-6 p-4 rounded-xl text-sm <?php echo $status === 'success' ? 'bg-emerald-950/80 border border-emerald-600/50 text-emerald-300' : 'bg-rose-950/80 border border-rose-600/50 text-rose-300'; ?>">
        <div class="flex items-center gap-2 font-semibold">
          <span><?php echo $status === 'success' ? '✓ Sucesso' : '⚠ Atenção'; ?></span>
        </div>
        <p class="mt-1"><?php echo htmlspecialchars($message); ?></p>
      </div>
    <?php endif; ?>

    <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-6">
      <div class="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">Ambiente cPanel Detectado</div>
      <div class="grid grid-cols-2 gap-3 text-xs text-slate-300">
        <div>Utilizador cPanel: <span class="font-mono text-white"><?php echo htmlspecialchars($cpanelUser); ?></span></div>
        <div>Banco Sugerido: <span class="font-mono text-white"><?php echo htmlspecialchars($defaultDbName); ?></span></div>
      </div>
    </div>

    <form method="POST" action="?action=install" class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1">Host MySQL</label>
        <input type="text" name="db_host" value="127.0.0.1" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" required>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Nome do Banco</label>
          <input type="text" name="db_name" value="<?php echo htmlspecialchars($defaultDbName); ?>" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" required>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Utilizador MySQL</label>
          <input type="text" name="db_user" value="<?php echo htmlspecialchars($defaultDbUser); ?>" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" required>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1">Senha MySQL</label>
        <input type="password" name="db_pass" placeholder="Palavra-passe definida no cPanel" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required>
      </div>

      <button type="submit" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2">
        <span>Criar Banco e Tabelas no cPanel</span>
        <span>→</span>
      </button>
    </form>

    <div class="mt-6 pt-4 border-t border-slate-800 text-center">
      <a href="/" class="text-xs text-slate-400 hover:text-amber-400 transition">Voltar à Página Inicial da DirIA</a>
    </div>
  </div>
</body>
</html>
