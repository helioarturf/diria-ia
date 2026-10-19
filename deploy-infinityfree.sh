#!/usr/bin/env bash
# DirIA Angola — Deploy automatizado para InfinityFree (FTP)
#
# Usa FTP com lftp (muito comum no Linux). Também funciona com curl FTP se lftp
# não estiver instalado. Cria o pacote com npm run build:php e envia-o para
# o htdocs/ do InfinityFree, limpando primeiro os ficheiros por omissão.
#
# Configuração via variáveis de ambiente:
#   IF_HOST=ftpupload.net (ou IP do servidor FTP)
#   IF_USER=if0_XXXXXXXXX
#   IF_PASS=XXXXXXXXXXXX
#   IF_PORT=21 (opcional)
#   IF_DIR=htdocs (por omissão; se tiveres addon domain noutra pasta, ajusta)
#   IF_DOMAIN=https://o-teu-dominio (para verificar após upload)
#   SUBPATH= (ex.: diria → usa BASE_PATH=/diria/; vazio → raiz)
#   DRY_RUN=1 (ver o que seria feito sem enviar)
#
# Uso:
#   IF_HOST=... IF_USER=... IF_PASS=... bash deploy-infinityfree.sh
#   IF_DOMAIN=... bash deploy-infinityfree.sh  # opcional, verifica após upload
#
# Requisitos: bash, npm, lftp (recomendado) OU curl, unzip

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

IF_HOST="${IF_HOST:-}"
IF_USER="${IF_USER:-}"
IF_PASS="${IF_PASS:-}"
IF_PORT="${IF_PORT:-21}"
IF_DIR="${IF_DIR:-htdocs}"
SUBPATH="${SUBPATH:-}"
DRY_RUN="${DRY_RUN:-0}"

fail() { echo -e "${RED}✖ $*${NC}" >&2; exit 1; }
ok()   { echo -e "${GREEN}✔ $*${NC}"; }
info() { echo -e "${BLUE}• $*${NC}"; }
warn() { echo -e "${YELLOW}! $*${NC}"; }

[ -n "$IF_HOST" ] || fail "IF_HOST em falta (ex.: ftpupload.net)"
[ -n "$IF_USER" ] || fail "IF_USER em falta"
[ -n "$IF_PASS" ] || fail "IF_PASS em falta"

cd "$(dirname "$0")"

# 1. Gerar pacote
ZIP="diria-infinityfree.zip"
if [ -n "$SUBPATH" ]; then
  info "Gerando pacote para subpasta /$SUBPATH/ (BASE_PATH=/$SUBPATH/)"
  export BASE_PATH="/$SUBPATH/"
  bash build-php-package.sh
else
  info "Gerando pacote para raiz do domínio (BASE_PATH=/)"
  bash build-php-package.sh
fi
[ -f "$ZIP" ] || fail "Pacote não foi gerado: $ZIP"

if [ "$DRY_RUN" = "1" ]; then
  warn "DRY_RUN ativo: não será enviado via FTP"
  info "Pacote pronto: $ZIP"
  exit 0
fi

# 2. Enviar via FTP
info "Enviando para $IF_HOST:$IF_PORT → $IF_DIR/"

if command -v lftp >/dev/null 2>&1; then
  info "Usando lftp"
  lftp -u "$IF_USER","$IF_PASS" "ftp://$IF_HOST:$IF_PORT" <<EOF
set ssl:verify-certificate no
set ftp:passive-mode on
cd $IF_DIR
mrm index2.html default.php default.html 2>/dev/null
rm $ZIP 2>/dev/null
lcd .
put $ZIP
bye
EOF
  ok "Enviado com lftp"
elif command -v curl >/dev/null 2>&1; then
  info "Usando curl (FTP)"
  curl -T "$ZIP" "ftp://$IF_USER:$IF_PASS@$IF_HOST:$IF_PORT/$IF_DIR/$ZIP" --connect-timeout 30 >/dev/null 2>&1 || fail "curl FTP falhou"
  ok "Enviado com curl"
else
  fail "Instala lftp ou curl para usar este script"
fi

warn "Falta extrair o ZIP no File Manager ou usar PHP para o extrair."
warn "No InfinityFree, o File Manager permite extrair. Alternativamente, podes extrair depois no painel."
warn "Após extrair, abre setup.php e depois corre: bash verify-deploy.sh \$IF_DOMAIN"

echo
ok "Upload concluído. Próximos passos:"
info "1. Online File Manager → $IF_DIR → extrair $ZIP → apagar ZIP"
info "2. Abrir https://<teu-dominio>/setup.php"
info "3. bash verify-deploy.sh https://<teu-dominio>"

if [ -n "${IF_DOMAIN:-}" ]; then
  info "Sugestão: bash verify-deploy.sh $IF_DOMAIN"
fi
