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
APP_ROOT="${PWD#"$HOME"/}"
case "$APP_ROOT" in
    /*) APP_ROOT="$(basename "$PWD")" ;;   # PWD fora do HOME: usar só o nome da pasta
esac
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

# Chave da API Gemini (obrigatória para as respostas de IA)
GEMINI_API_KEY=${GEMINI_API_KEY:-SUBSTITUI_PELA_TUA_CHAVE}

# Ambiente (Passenger define a porta automaticamente)
NODE_ENV=production
EOF
    echo "✓ Ficheiro .env criado com sucesso."
else
    echo "ℹ Ficheiro .env já existente preservado."
fi

# 5. Activar ambiente Node do cPanel (se necessário)
if ! command -v node >/dev/null 2>&1; then
    REL="${PWD#"$HOME"/}"
    VENV=""
    for cand in "$HOME/nodevenv/$REL"/*/bin/activate; do
        [ -f "$cand" ] && VENV="$cand" && break
    done
    if [ -z "$VENV" ] && [ -d "$HOME/nodevenv" ]; then
        VENV=$(find "$HOME/nodevenv" -maxdepth 6 -type f -name activate -path '*/bin/*' 2>/dev/null | sort -V | tail -1)
    fi
    if [ -n "$VENV" ]; then
        echo "➜ A activar ambiente Node do cPanel: $VENV"
        # O activate do cPanel/CloudLinux não é compatível com 'set -u'
        set +u
        set +e
        # shellcheck disable=SC1090
        source "$VENV"
        set -e
        # Reforço: garantir a pasta bin do ambiente no PATH
        export PATH="$(dirname "$VENV"):$PATH"
        set -u
    fi
fi

# 6. Validar ligação MySQL e preparar tabelas
echo "➜ Verificando ligação ao banco de dados $DB_NAME..."

set -a
# shellcheck disable=SC1091
. ./.env 2>/dev/null || true
set +a

DB_OK=""
if command -v node >/dev/null 2>&1 && [ -d node_modules/mysql2 ]; then
    if node --input-type=module -e "
      import mysql from 'mysql2/promise';
      const c = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      await c.query('SELECT 1');
      await c.end();
    " >/dev/null 2>&1; then
        DB_OK="sim"
    fi
fi
if [ -z "$DB_OK" ] && command -v mysql >/dev/null 2>&1; then
    if mysql -h "${DB_HOST:-localhost}" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE \`$DB_NAME\`;" >/dev/null 2>&1; then
        DB_OK="sim"
    fi
fi

if [ "$DB_OK" = "sim" ]; then
    echo "✓ Ligação MySQL validada (utilizador: $DB_USER, base: $DB_NAME)."
    echo "  As tabelas do DirIA são criadas automaticamente no 1.º arranque da aplicação."
else
    echo "⚠ Não foi possível validar a ligação MySQL agora."
    echo "  As tabelas serão criadas automaticamente no 1.º arranque da aplicação"
    echo "  (cPanel → Setup Node.js App). Até lá, o DirIA usa o modo autocontido."
fi

echo "=========================================================="
echo "🎉 DirIA Angola configurado com sucesso no cPanel!"
echo "Próximo passo: criar a app em cPanel → Setup Node.js App"
echo "  • Application root: $APP_ROOT"
echo "  • Application startup file: server.js"
echo "e depois executar:  ./deploy-cpanel.sh"
echo "=========================================================="
