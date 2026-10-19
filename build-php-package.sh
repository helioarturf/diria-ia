#!/usr/bin/env bash
# =============================================================================
# DirIA Angola — Empacotador para alojamento PHP partilhado (InfinityFree/cPanel)
#
# Gera uma pasta pronta a enviar por FTP/File Manager:
#
#   deploy-infinityfree/htdocs/
#     ├── .htaccess          (rotas: /api -> PHP; resto -> SPA)
#     ├── index.html         (build do React)
#     ├── assets/            (build do React)
#     ├── setup.php          (assistente de instalação)
#     └── api/
#         ├── index.php      (front controller /api/*)
#         ├── config.php
#         └── lib/*.php
#
# E um ZIP: diria-infinityfree.zip
#
# Uso:
#   ./build-php-package.sh              # compila o frontend e empacota
#   ./build-php-package.sh --skip-build # reutiliza a pasta dist/ existente
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$ROOT_DIR/deploy-infinityfree"
HTDOCS="$OUT_DIR/htdocs"
ZIP_FILE="$ROOT_DIR/diria-infinityfree.zip"
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help)
      sed -n '2,25p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Opção desconhecida: $arg" >&2
      exit 1
      ;;
  esac
done

log()  { printf '\033[1;33m[DirIA]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[ERRO]\033[0m %s\n' "$*" >&2; exit 1; }

# --- 1. Verificações ---------------------------------------------------------
[ -d "$ROOT_DIR/php/htdocs/api" ] || fail "Pasta php/htdocs/api não encontrada."
[ -f "$ROOT_DIR/php/htdocs/setup.php" ] || fail "php/htdocs/setup.php não encontrado."

# --- 2. Build do frontend (Vite -> dist/) ------------------------------------
build_frontend() {
  local npm_bin
  if command -v npm >/dev/null 2>&1; then
    npm_bin="npm"
  else
    # Procura instalações portáteis de Node (o projeto não exige Node global)
    for candidate in \
      "${NODE_BIN_DIR:-}" \
      "$ROOT_DIR/node-portable/bin" \
      "$ROOT_DIR/../node-portable/bin" \
      "$HOME/node-portable/bin"
    do
      if [ -n "$candidate" ] && [ -x "$candidate/npm" ]; then
        npm_bin="$candidate/npm"
        export PATH="$candidate:$PATH"
        break
      fi
    done
  fi

  [ -n "${npm_bin:-}" ] || return 1

  log "A compilar o frontend (vite build)..."
  ( cd "$ROOT_DIR" && "$npm_bin" run build )
}

if [ "$SKIP_BUILD" -eq 1 ]; then
  log "A saltar a compilação (--skip-build)."
  [ -f "$ROOT_DIR/dist/index.html" ] || fail "dist/index.html não existe. Corre sem --skip-build."
else
  build_frontend || fail "Não foi possível executar 'npm run build'. Instala o Node, define NODE_BIN_DIR ou usa --skip-build."
fi

[ -f "$ROOT_DIR/dist/index.html" ] || fail "Build do frontend incompleto (dist/index.html em falta)."

# --- 3. Montar a pasta de deploy --------------------------------------------
log "A preparar $HTDOCS ..."
rm -rf "$OUT_DIR"
mkdir -p "$HTDOCS"

cp -R "$ROOT_DIR/dist/." "$HTDOCS/"
cp -R "$ROOT_DIR/php/htdocs/." "$HTDOCS/"

# Nunca empacotar credenciais reais
rm -f "$HTDOCS/api/config.local.php"

# --- 4. Empacotar ZIP -------------------------------------------------------
rm -f "$ZIP_FILE"
if command -v zip >/dev/null 2>&1; then
  ( cd "$HTDOCS" && zip -rq "$ZIP_FILE" . -x '.*' )
  # Inclui explicitamente o .htaccess (essencial para as rotas)
  ( cd "$HTDOCS" && zip -q "$ZIP_FILE" .htaccess )
  log "ZIP criado: $ZIP_FILE"
else
  log "Comando 'zip' indisponível — usa a pasta $HTDOCS (ou compacta-a manualmente)."
fi

# --- 5. Resumo --------------------------------------------------------------
API_FILES=$(find "$HTDOCS/api" -name '*.php' | wc -l | tr -d ' ')
ASSETS=$(find "$HTDOCS/assets" -type f 2>/dev/null | wc -l | tr -d ' ')

cat <<EOF

✅ Pacote pronto.

  Pasta a enviar : $HTDOCS
  ZIP            : ${ZIP_FILE}
  Ficheiros PHP  : $API_FILES
  Assets         : $ASSETS

Próximos passos:
  1. Envia o conteúdo de htdocs/ para a pasta htdocs/ da InfinityFree
     (File Manager: carregar diria-infinityfree.zip e extrair).
  2. Abre https://o-teu-dominio/setup.php
     → preenche host/nome/utilizador/password do MySQL e a chave GEMINI_API_KEY.
  3. Confirma https://o-teu-dominio/api/health  (espera-se "mode":"mysql").
  4. Apaga o setup.php do alojamento.

EOF
