#!/usr/bin/env bash
# =============================================================================
# DirIA Angola — Publicação automática no InfinityFree (FTP)
#
# Compila o frontend, monta deploy-infinityfree/htdocs/ e envia o conteúdo
# directamente para o servidor FTP — sem ZIP nem extracção manual.
#
# Ficheiros SEMPRE excluídos do envio:
#   api/config.local.php   (credenciais — nunca saem daqui)
#   setup.php              (a não ser que INCLUDE_SETUP=1)
#
# Não usa --delete: ficheiros que existam no servidor e não existam aqui
# (como a config.local.php já instalada) ficam intactos.
#
# Variáveis de ambiente:
#   IF_HOST        obrigatório — ex.: ftpupload.net ou 185.27.134.11
#   IF_USER        obrigatório — ex.: if0_12345678
#   IF_PASS        obrigatório
#   IF_PORT        por omissão 21
#   IF_DIR         pasta remota; vazio = autodeteta (htdocs/ ou raiz)
#   IF_DOMAIN      ex.: https://o-teu-dominio — se definido, verifica depois
#   SUBPATH        ex.: diria → compila com BASE_PATH=/diria/; vazio = raiz
#   INCLUDE_SETUP  1 = envia também o setup.php (primeira instalação)
#   SKIP_BUILD     1 = usa a pasta deploy-infinityfree/ existente
#   DRY_RUN        1 = lista os ficheiros que seriam enviados, sem enviar
#   USE_LFTP       1 = enviar com lftp (mais rápido, opcional; por omissão curl)
#
# Uso:
#   IF_HOST=... IF_USER=... IF_PASS=... bash deploy-infinityfree.sh
#   DRY_RUN=1 bash deploy-infinityfree.sh          # só lista
#
# Requisitos: bash, npm e curl (já vem no sistema)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
fail() { printf '%b✖ %s%b\n' "$RED" "$*" "$NC" >&2; exit 1; }
ok()   { printf '%b✔ %s%b\n' "$GREEN" "$*" "$NC"; }
info() { printf '%b• %s%b\n' "$BLUE" "$*" "$NC"; }
warn() { printf '%b! %s%b\n' "$YELLOW" "$*" "$NC"; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

IF_HOST="${IF_HOST:-}"
IF_USER="${IF_USER:-}"
IF_PASS="${IF_PASS:-}"
IF_PORT="${IF_PORT:-21}"
IF_DIR="${IF_DIR:-}"
IF_DOMAIN="${IF_DOMAIN:-}"
SUBPATH="${SUBPATH:-}"
INCLUDE_SETUP="${INCLUDE_SETUP:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
DRY_RUN="${DRY_RUN:-0}"
USE_LFTP="${USE_LFTP:-0}"

HTDOCS="$ROOT_DIR/deploy-infinityfree/htdocs"

# --- 1. Compilar -------------------------------------------------------------
if [ "$SKIP_BUILD" != "1" ]; then
  if [ -n "$SUBPATH" ]; then
    info "Compilar para subpasta /$SUBPATH/ (BASE_PATH=/$SUBPATH/)"
    BASE_PATH="/$SUBPATH/" bash build-php-package.sh
  else
    info "Compilar para a raiz do domínio"
    bash build-php-package.sh
  fi
else
  info "SKIP_BUILD=1 — a reutilizar a pasta existente."
fi

[ -d "$HTDOCS" ] || fail "Pasta em falta: $HTDOCS (corre sem SKIP_BUILD=1)."
[ -f "$HTDOCS/index.html" ] || fail "$HTDOCS/index.html em falta."
[ -f "$HTDOCS/.htaccess" ] || fail "$HTDOCS/.htaccess em falta — as rotas da API partiriam."
[ -f "$HTDOCS/api/index.php" ] || fail "$HTDOCS/api/index.php em falta."
[ ! -f "$HTDOCS/api/config.local.php" ] || fail "config.local.php não pode ser empacotado."

# --- 2. Lista de ficheiros a enviar -----------------------------------------
# Filtra os ficheiros que nunca podem sair da máquina.
selected_files() {
  local f rel
  while IFS= read -r -d '' f; do
    rel="${f#"$HTDOCS"/}"
    case "$rel" in
      api/config.local.php) continue ;;
      setup.php) [ "$INCLUDE_SETUP" = "1" ] || continue ;;
    esac
    printf '%s\0' "$rel"
  done < <(find "$HTDOCS" -type f -print0)
}

TOTAL=0
while IFS= read -r -d '' _; do TOTAL=$((TOTAL + 1)); done < <(selected_files)

if [ "$TOTAL" -eq 0 ]; then
  fail "Nenhum ficheiro para enviar."
fi

if [ "$DRY_RUN" = "1" ]; then
  ok "DRY_RUN — $TOTAL ficheiros que seriam enviados:"
  while IFS= read -r -d '' rel; do printf '    %s\n' "$rel"; done < <(selected_files)
  exit 0
fi

[ -n "$IF_HOST" ] || fail "IF_HOST em falta (verifica o servidor FTP no painel)."
[ -n "$IF_USER" ] || fail "IF_USER em falta."
[ -n "$IF_PASS" ] || fail "IF_PASS em falta."

# --- 3. Resolver a pasta remota ---------------------------------------------
# Alguns alojamentos já dão acesso à raiz do htdocs, outros mostram uma pasta
# htdocs/ dentro do root. Se IF_DIR não vier definido, decide por listagem.
remote_listing() {
  curl -sS --connect-timeout 20 --max-time 40 \
    --user "$IF_USER:$IF_PASS" \
    --list-only "ftp://$IF_HOST:$IF_PORT/$1"
}

if [ -n "$IF_DIR" ]; then
  REMOTE_DIR="$IF_DIR"
else
  # Sem IF_DIR definido: decide entre a raiz do alojamento e uma pasta htdocs/.
  # Falha em vez de adivinhar — enviar para o sítio errado é um erro silencioso.
  if ! LISTING="$(remote_listing "")"; then
    fail "Não consegui listar a raiz FTP de $IF_USER@$IF_HOST:$IF_PORT — verifica host/user/password ou define IF_DIR explicitamente."
  fi

  if grep -qE '(^|/)htdocs/?$' <<<"$LISTING"; then
    REMOTE_DIR="htdocs"
    info "Autodetecção: pasta remota 'htdocs/'."
  else
    REMOTE_DIR="."
    info "Autodetecção: a conta FTP já aponta para a raiz do site."
  fi
fi

# Caminho absoluto para o lftp (o curl trata-o à parte).
if [ "$REMOTE_DIR" = "." ]; then
  REMOTE_ABS="/"
else
  REMOTE_ABS="/${REMOTE_DIR#/}"
fi

info "A enviar $TOTAL ficheiros para $IF_HOST:$IF_PORT:$REMOTE_ABS"
if [ "$INCLUDE_SETUP" = "1" ]; then
  info "O setup.php SERÁ enviado (INCLUDE_SETUP=1)."
else
  info "setup.php não é enviado (já instalado). Usa INCLUDE_SETUP=1 na 1.ª vez."
fi

# --- 4. Enviar ---------------------------------------------------------------
if [ "$USE_LFTP" = "1" ]; then
  # lftp: mais rápido e com retentativas para muitos ficheiros (opcional).
  command -v lftp >/dev/null 2>&1 || fail "USE_LFTP=1 mas o lftp não está instalado (sudo apt install lftp)."
  info "Motor: lftp (mirror sem --delete → nada é apagado no servidor)"

  EXCLUDES=(--exclude-glob 'setup.php')
  if [ "$INCLUDE_SETUP" = "1" ]; then
    EXCLUDES=()
  fi

  lftp -u "$IF_USER,$IF_PASS" "ftp://$IF_HOST:$IF_PORT" <<EOF
set ssl:verify-certificate no
set ftp:passive-mode on
set ftp:use-feat no
set net:max-retries 2
set net:timeout 25
set mirror:parallel-files 1
mirror -R --no-perms --no-umask --verbose=1 ${EXCLUDES[*]:-} "$HTDOCS" "$REMOTE_ABS"
bye
EOF
  ok "Envio concluído (lftp)."

elif command -v curl >/dev/null 2>&1; then
  info "Motor: curl (por omissão — já vem no CI, sem dependências extra)"

  SENT=0
  while IFS= read -r -d '' rel; do
    REL_PATH="${REMOTE_ABS%/}/$rel"
    curl -sS --retry 2 --retry-all-errors --retry-delay 2 \
      --connect-timeout 20 --max-time 120 \
      --user "$IF_USER:$IF_PASS" \
      --ftp-create-dirs \
      -T "$HTDOCS/$rel" \
      "ftp://$IF_HOST:$IF_PORT$REL_PATH" >/dev/null \
      || fail "Falhou o envio de: $rel"
    SENT=$((SENT + 1))
    printf '    %d/%d  %s\n' "$SENT" "$TOTAL" "$rel"
  done < <(selected_files)

  ok "Envio concluído: $SENT/$TOTAL ficheiros."
else
  fail "curl não encontrado — instala o curl ou usa USE_LFTP=1 com lftp."
fi

# --- 5. Verificação ----------------------------------------------------------
if [ -n "$IF_DOMAIN" ]; then
  info "A verificar $IF_DOMAIN ..."
  VERIFY_RC=0
  bash "$ROOT_DIR/verify-deploy.sh" "$IF_DOMAIN" || VERIFY_RC=$?
  case "$VERIFY_RC" in
    0)
      ok "Deploy verificado."
      ;;
    3)
      # Anti-bot da InfinityFree: os ficheiros estão lá, este cliente é que
      # não passa o desafio. Não é erro de deploy.
      warn "Verificação inconclusiva: o anti-bot da InfinityFree bloqueou este cliente."
      warn "Abre $IF_DOMAIN num browser para confirmar — o envio foi completo."
      ;;
    *)
      warn "A verificação encontrou problemas (mensagem acima)."
      warn "Se for a 1.ª instalação, abre $IF_DOMAIN/setup.php com INCLUDE_SETUP=1."
      exit 1
      ;;
  esac
else
  warn "IF_DOMAIN não definido — verificação automática saltada."
fi
