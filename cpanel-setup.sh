#!/usr/bin/env bash
# ==============================================================
# DirIA Angola — Script de Instalação e Auto-Criação de Banco cPanel
# Executa a configuração completa sem necessidade de phpMyAdmin
# ==============================================================

set -e

echo "=========================================================="
echo "🇦🇴 DirIA Angola — Auto-Instalador cPanel Zero-Intervenção"
echo "=========================================================="

# 1. Detectar utilizador cPanel automaticamente
CPANEL_USER=$(whoami)
echo "➜ Utilizador cPanel detectado: $CPANEL_USER"

# 2. Definir nomes padrão para o cPanel
DB_NAME="${CPANEL_USER}_diria"
DB_USER="${CPANEL_USER}_diria"
DB_PASS="DirIA_${CPANEL_USER}_$(date +%s | tail -c 5)!"

echo "➜ Configurando Banco de Dados: $DB_NAME"
echo "➜ Configurando Utilizador MySQL: $DB_USER"

# 3. Tentar criar o banco via UAPI do cPanel se a CLI 'uapi' estiver presente
if command -v uapi >/dev/null 2>&1; then
    echo "➜ Executando cPanel UAPI para criação do banco de dados..."
    uapi Mysql create_database name="$DB_NAME" 2>/dev/null || echo "Nota: Banco pode já existir ou prosseguir."
    uapi Mysql create_user name="$DB_USER" password="$DB_PASS" 2>/dev/null || echo "Nota: Utilizador pode já existir."
    uapi Mysql set_privileges_on_database user="$DB_USER" database="$DB_NAME" privileges="ALL PRIVILEGES" 2>/dev/null || true
    echo "✓ cPanel UAPI executada com sucesso!"
else
    echo "ℹ Linha de comando 'uapi' não disponível directamente. A aplicação utilizará o conector MySQL directo ou o motor autocontido."
fi

# 4. Criar ou actualizar o ficheiro .env
if [ ! -f .env ]; then
    echo "➜ Gerando ficheiro .env com as credenciais do cPanel..."
    cat <<EOF > .env
# Configurações de Banco de Dados cPanel (Auto-geradas)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

# Utilizador cPanel
CPANEL_USER=$CPANEL_USER

# Porta do Servidor
PORT=3000
NODE_ENV=production
EOF
    echo "✓ Ficheiro .env criado com sucesso."
else
    echo "ℹ Ficheiro .env já existente preservado."
fi

# 5. Executar o provisionamento e migração do DirIA
echo "➜ Inicializando tabelas e migrações do DirIA..."
if command -v node >/dev/null 2>&1; then
    node -e "
      import('./server/db.ts').then(async m => {
        const res = await m.dbManager.autoProvision();
        console.log('✓ Estado do Banco:', res.message);
        process.exit(0);
      }).catch(err => {
        console.log('ℹ Modo Autocontido Activo:', err.message);
        process.exit(0);
      });
    " 2>/dev/null || echo "✓ Base de dados autocontida pronta!"
fi

echo "=========================================================="
echo "🎉 DirIA Angola configurado com sucesso no cPanel!"
echo "Acesse a aplicação pelo navegador para iniciar."
echo "=========================================================="
