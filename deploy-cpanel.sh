#!/usr/bin/env bash
# ==============================================================
# DirIA Angola — Deploy automático para cPanel (build + rsync + restart)
#
# CONFIGURAÇÃO — edita as variáveis abaixo ou exporta-as no terminal:
#   export CPANEL_HOST=meudominio.com     # domínio/host do cPanel
#   export CPANEL_USER=usuario            # utilizador cPanel
#   export CPANEL_PORT=7822               # porta SSH (22 ou 7822)
#   export CPANEL_DIR=diria-ia            # pasta da app em /home/usuario/
#   export APP_URL=https://diria.tudominio.com   # opcional: health check
#
# USO:
#   ./deploy-cpanel.sh            # build local + envio + restart
#   ./deploy-cpanel.sh --build    # apenas build local (sem enviar)
#   ./deploy-cpanel.sh --dry-run  # mostra o que seria enviado, sem enviar
# ==============================================================

set -euo pipefail

# ---- Configuração ----
CPANEL_HOST="${CPANEL_HOST:-}"
CPANEL_USER="${CPANEL_USER:-}"
CPANEL_PORT="${CPANEL_PORT:-7822}"
CPANEL_DIR="${CPANEL_DIR:-diria-ia}"
APP_URL="${APP_URL:-}"
MODE="${1:-deploy}"

SSH_CMD="ssh -p $CPANEL_PORT -o ConnectTimeout=15"

echo "=================================================="
echo "🇦🇴 DirIA Angola — Deploy para cPanel"
echo "   host=$CPANEL_HOST user=$CPANEL_USER port=$CPANEL_PORT dir=$CPANEL_DIR"
echo "=================================================="

# ---------------------------------------------------------------
# 1. Build local (frontend Vite + backend esbuild)
# ---------------------------------------------------------------
build() {
    echo "➜ Instalando dependências..."
    npm install --silent

    echo "➜ Compilando frontend (vite → dist/)..."
    npm run build --silent

    echo "➜ Compilando backend (esbuild → server.js)..."
    npm run build:server --silent

    if [ ! -f dist/index.html ] || [ ! -f server.js ]; then
        echo "✗ Build falhou: dist/index.html ou server.js não foram gerados."
        exit 1
    fi
    echo "✓ Build completo: dist/ + server.js"
}

# ---------------------------------------------------------------
# 2. Envio dos ficheiros + dependências + restart
# ---------------------------------------------------------------
deploy() {
    if [ -z "$CPANEL_HOST" ] || [ -z "$CPANEL_USER" ]; then
        echo "✗ Falta configurar o servidor. Exporta as variáveis:"
        echo "    export CPANEL_HOST=meudominio.com"
        echo "    export CPANEL_USER=usuario"
        echo "  (e opcionalmente CPANEL_PORT, CPANEL_DIR, APP_URL)"
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
        "mkdir -p ~/$CPANEL_DIR/tmp && touch ~/$CPANEL_DIR/tmp/restart.txt && echo OK" \
        > /dev/null && echo "✓ Aplicação reiniciada."

    echo "=================================================="
    echo "🎉 Deploy concluído!"
    if [ -n "$APP_URL" ]; then
        echo "➜ Health check: $APP_URL/api/health"
        curl -sf --max-time 15 "$APP_URL/api/health" && echo || \
            echo "⚠ Ainda não respondeu — confirma o Setup Node.js App no cPanel."
    else
        echo "➜ Testa em: https://$CPANEL_HOST/api/health"
    fi
    echo "=================================================="
}

case "$MODE" in
    --build)
        build
        ;;
    --dry-run | --deploy | "")
        build
        deploy
        ;;
    *)
        # Primeira execução sem argumentos também faz build+deploy
        build
        deploy
        ;;
esac
