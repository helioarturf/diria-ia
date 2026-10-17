#!/usr/bin/env bash
# ==============================================================
# DirIA Angola — Deploy para cPanel
#
# Funciona em DOIS modos:
#   A) Directamente no servidor cPanel (recomendado se clonaste o repo lá)
#      ./deploy-cpanel.sh              -> build + restart do Passenger
#   B) Na tua máquina, enviando por SSH/rsync para o cPanel
#      export CPANEL_HOST=meudominio.com
#      export CPANEL_USER=usuario
#      ./deploy-cpanel.sh              -> build + rsync + restart remoto
#
# OUTRAS OPÇÕES:
#   ./deploy-cpanel.sh --build        # apenas build local (dist/ + server.js)
#   ./deploy-cpanel.sh --remote       # forçar modo remoto (SSH/rsync)
#   ./deploy-cpanel.sh --local        # forçar modo servidor (Passenger local)
#   ./deploy-cpanel.sh --dry-run      # modo remoto sem enviar ficheiros
#
# CONFIGURAÇÃO (modo remoto, opcional):
#   CPANEL_HOST, CPANEL_USER, CPANEL_PORT (22/7822), CPANEL_DIR, APP_URL
# ==============================================================

set -euo pipefail

CPANEL_HOST="${CPANEL_HOST:-}"
CPANEL_USER="${CPANEL_USER:-}"
CPANEL_PORT="${CPANEL_PORT:-7822}"
CPANEL_DIR="${CPANEL_DIR:-$(basename "$PWD")}"
APP_URL="${APP_URL:-}"
MODE="${1:-auto}"

SSH_CMD="ssh -p $CPANEL_PORT -o ConnectTimeout=15"

# ---------------------------------------------------------------
# Localizar Node.js/npm (com activação automática do cPanel)
# ---------------------------------------------------------------
ensure_node() {
    if command -v npm >/dev/null 2>&1; then
        echo "✓ Node $(node --version) / npm $(npm --version)"
        return 0
    fi

    echo "➜ npm não está no PATH — a procurar ambiente Node do cPanel..."

    local VENV="" REL="${PWD#"$HOME"/}"

    # 1) ambiente virtual correspondente a esta pasta
    for cand in "$HOME/nodevenv/$REL"/*/bin/activate; do
        [ -f "$cand" ] && VENV="$cand" && break
    done

    # 2) qualquer ambiente virtual de Node criado pelo cPanel
    if [ -z "$VENV" ] && [ -d "$HOME/nodevenv" ]; then
        VENV=$(find "$HOME/nodevenv" -maxdepth 6 -type f -name activate -path '*/bin/*' 2>/dev/null | sort -V | tail -1)
    fi

    if [ -n "$VENV" ]; then
        echo "➜ A activar ambiente virtual do cPanel: $VENV"
        # shellcheck disable=SC1090
        source "$VENV"
        echo "✓ Node $(node --version) / npm $(npm --version)"
        return 0
    fi

    cat <<'EOF'
✗ Node.js/npm não encontrados neste servidor.

  Cria primeiro a aplicação Node no cPanel:
    1. cPanel → "Setup Node.js App" → Create Application
         • Application root:       <esta pasta, ex. repositories/diria-ia>
         • Application startup file: server.js
         • Node.js version:        20 (ou superior)
    2. Volta a executar:  ./deploy-cpanel.sh

  O script activa depois automaticamente o ambiente em ~/nodevenv/...
  (Se o cPanel não tiver "Setup Node.js App", o plano de hospedagem
   não suporta Node.js e será preciso outro servidor/plano.)
EOF
    exit 1
}

# ---------------------------------------------------------------
# Build local (frontend Vite + backend esbuild)
# ---------------------------------------------------------------
build() {
    ensure_node

    echo "➜ Instalando dependências (com devDependencies, precisa para o build)..."
    npm install --no-audit --no-fund

    echo "➜ Compilando frontend (vite → dist/)..."
    npm run build

    echo "➜ Compilando backend (esbuild → server.js)..."
    npm run build:server

    if [ ! -f dist/index.html ] || [ ! -f server.js ]; then
        echo "✗ Build falhou: dist/index.html ou server.js não foram gerados."
        exit 1
    fi
    echo "✓ Build completo: dist/ + server.js"
}

# ---------------------------------------------------------------
# Reiniciar app no próprio servidor (Passenger/cPanel)
# ---------------------------------------------------------------
restart_local() {
    echo "➜ Reiniciando aplicação (Passenger/cPanel)..."
    mkdir -p tmp
    touch tmp/restart.txt
    echo "✓ Aplicação reiniciada."
}

health_check() {
    local target="${1:-}"
    if [ -z "$target" ]; then
        echo "➜ Testa em: https://<o-teu-dominio>/api/health"
        return 0
    fi
    echo "➜ Health check: $target/api/health"
    curl -sf --max-time 20 "$target/api/health" && echo || \
        echo "⚠ Ainda não respondeu — confirma o Setup Node.js App no cPanel."
}

# ---------------------------------------------------------------
# Modo A — correr directamente no servidor cPanel
# ---------------------------------------------------------------
deploy_local() {
    build
    restart_local
    echo "=================================================="
    echo "🎉 Build concluído no servidor!"
    health_check "$APP_URL"
    echo "=================================================="
}

# ---------------------------------------------------------------
# Modo B — enviar da máquina local para o cPanel por SSH/rsync
# ---------------------------------------------------------------
deploy_remote() {
    if [ -z "$CPANEL_HOST" ] || [ -z "$CPANEL_USER" ]; then
        echo "✗ Modo remoto exige CPANEL_HOST e CPANEL_USER:"
        echo "    export CPANEL_HOST=meudominio.com"
        echo "    export CPANEL_USER=usuario"
        echo "  (ou corre ./deploy-cpanel.sh sem essas variáveis, dentro do servidor)"
        exit 1
    fi
    if ! command -v rsync >/dev/null 2>&1; then
        echo "✗ rsync não está instalado neste computador."
        exit 1
    fi

    local DEST="$CPANEL_USER@$CPANEL_HOST:$CPANEL_DIR/"
    local RSYNC_FLAGS=(-avz --delete)
    [ "$MODE" = "--dry-run" ] && RSYNC_FLAGS+=(--dry-run)

    echo "➜ Sincronizando ficheiros → $DEST (SSH porta $CPANEL_PORT)..."
    rsync "${RSYNC_FLAGS[@]}" \
        -e "ssh -p $CPANEL_PORT" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'data/' \
        --exclude '.aistudio' \
        --exclude '*.log' \
        --exclude 'tmp/' \
        ./ "$DEST"

    if [ "$MODE" = "--dry-run" ]; then
        echo "✓ Dry-run concluído (nada foi enviado)."
        exit 0
    fi

    echo "➜ Instalando dependências no servidor (produção)..."
    $SSH_CMD "$CPANEL_USER@$CPANEL_HOST" \
        "cd ~/$CPANEL_DIR && npm install --omit=dev --no-audit --no-fund 2>&1 | tail -3"

    echo "➜ Verificando .env no servidor..."
    local ENV_STATUS
    ENV_STATUS=$($SSH_CMD "$CPANEL_USER@$CPANEL_HOST" \
        "cd ~/$CPANEL_DIR && if [ -f .env ]; then echo OK; else echo FALTA; fi")
    if [ "$ENV_STATUS" = "FALTA" ]; then
        echo "⚠  Não existe .env no servidor. Cria-o com:"
        echo "    $SSH_CMD $CPANEL_USER@$CPANEL_HOST \"nano ~/$CPANEL_DIR/.env\""
        echo "  Conteúdo mínimo:"
        echo "    GEMINI_API_KEY=<tua_chave>"
        echo "    NODE_ENV=production"
        echo "    DB_HOST=127.0.0.1 / DB_USER / DB_PASSWORD / DB_NAME"
        echo "  (ou executa lá dentro: bash cpanel-setup.sh)"
    else
        echo "✓ .env encontrado no servidor."
    fi

    echo "➜ Reiniciando aplicação (Passenger/cPanel)..."
    $SSH_CMD "$CPANEL_USER@$CPANEL_HOST" \
        "mkdir -p ~/$CPANEL_DIR/tmp && touch ~/$CPANEL_DIR/tmp/restart.txt" >/dev/null
    echo "✓ Aplicação reiniciada."

    echo "=================================================="
    echo "🎉 Deploy concluído!"
    health_check "${APP_URL:-https://$CPANEL_HOST}"
    echo "=================================================="
}

# ---------------------------------------------------------------
# Despacho
# ---------------------------------------------------------------
case "$MODE" in
    --build)
        build
        ;;
    --local | --server)
        deploy_local
        ;;
    --remote | --dry-run)
        build
        deploy_remote
        ;;
    auto | "")
        if [ -n "$CPANEL_HOST" ] && [ -n "$CPANEL_USER" ]; then
            build
            deploy_remote
        else
            deploy_local
        fi
        ;;
    --help | -h)
        sed -n '2,25p' "$0"
        ;;
    *)
        echo "Opção desconhecida: $MODE (usa --help)"
        exit 1
        ;;
esac
