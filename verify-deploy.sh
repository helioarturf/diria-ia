#!/usr/bin/env bash
# =============================================================================
# DirIA Angola — Verificação pós-publicação
#
# Testa um deploy já publicado (InfinityFree, cPanel, ou local) e diz
# exactamente o que está bem e o que falta resolver.
#
# Uso:
#   bash verify-deploy.sh https://o-teu-dominio
#   bash verify-deploy.sh https://o-teu-dominio/diria     # em subpasta
#   bash verify-deploy.sh http://127.0.0.1:8099           # servidor local
# =============================================================================

set -uo pipefail

BASE="${1:-}"
BASE="${BASE%/}"

# Origem (esquema + host) sem a subpasta: os assets do build são absolutos a
# partir da raiz do domínio (ex.: /diria/assets/x.js), não a partir de BASE.
ORIGIN="$(printf '%s' "$BASE" | sed -E 's#^([a-zA-Z][a-zA-Z0-9+.-]*://[^/]+).*#\1#')"
[ -n "$ORIGIN" ] || ORIGIN="$BASE"

if [ -z "$BASE" ]; then
  cat <<'USO'
Uso: bash verify-deploy.sh <URL do deploy>

Exemplos:
  bash verify-deploy.sh https://osmeusite.kesug.com
  bash verify-deploy.sh https://cahota.ao/diria
  bash verify-deploy.sh http://127.0.0.1:8099
USO
  exit 2
fi

PASS=0
FAIL=0
WARN=0

ok()    { printf '  \033[32m✔\033[0m %s\n' "$1"; PASS=$((PASS + 1)); }
bad()   { printf '  \033[31m✖\033[0m %s\n' "$1"; [ -n "${2:-}" ] && printf '      → %s\n' "$2"; FAIL=$((FAIL + 1)); }
warn()  { printf '  \033[33m!\033[0m %s\n' "$1"; [ -n "${2:-}" ] && printf '      → %s\n' "$2"; WARN=$((WARN + 1)); }
info()  { printf '  \033[36m•\033[0m %s\n' "$1"; }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

fetch() { # devolve "corpo\nCODIGO"
  curl -s -L --max-time 25 -w '\n%{http_code}' "$1" 2>/dev/null
}
code_of() { printf '%s' "${1##*$'\n'}"; }
body_of() { printf '%s' "${1%$'\n'*}"; }
ctype_of() { curl -s -L --max-time 25 -o /dev/null -w '%{content_type}' "$1" 2>/dev/null; }

printf '\n\033[1mDirIA Angola · verificação de %s\033[0m\n' "$BASE"

# --- 0. Alcançabilidade ------------------------------------------------------
head_ '0 · Alcançabilidade'
ROOT="$(fetch "$BASE/")"
ROOT_CODE="$(code_of "$ROOT")"

if [ "$ROOT_CODE" != "200" ]; then
  bad "Não foi possível abrir $BASE/ (HTTP $ROOT_CODE)" \
      "Confirma o domínio, se a conta está activa e se os ficheiros estão em htdocs/."
  printf '\n\033[31mVerificação interrompida: o site não responde.\033[0m\n\n'
  exit 1
fi

if grep -q 'id="root"' <<<"$(body_of "$ROOT")"; then
  ok "A aplicação React está a ser servida (HTTP 200)"
else
  warn "Respondeu 200 mas não encontrei o contentor da aplicação React" \
       "Pode ser uma página por omissão do alojamento. Apaga index2.html/default.php de htdocs/."
fi

# --- 1. Assets (base do build) ----------------------------------------------
head_ '1 · Assets do frontend'
ASSET="$(grep -oE '(src|href)="/[^"]*\.(js|css)"' <<<"$(body_of "$ROOT")" | head -1 | sed -E 's/.*="([^"]*)".*/\1/')"

if [ -z "$ASSET" ]; then
  ASSET="$(grep -oE '(src|href)="[^"]*\.(js|css)"' <<<"$(body_of "$ROOT")" | head -1 | sed -E 's/.*="([^"]*)".*/\1/')"
fi

if [ -z "$ASSET" ]; then
  warn "Não encontrei referências a JS/CSS no HTML" "Build inesperado — confirma o index.html."
else
  # Subpasta em que a aplicação está publicada (vazio se estiver na raiz).
  SUBPATH="$(printf '%s' "$BASE" | sed -E 's#^[a-zA-Z][a-zA-Z0-9+.-]*://[^/]+##')"
  SUBPATH="${SUBPATH%/}"

  ASSET_URL="$ASSET"
  case "$ASSET" in
    http*) ;;
    /*) ASSET_URL="$ORIGIN$ASSET" ;;
    *) ASSET_URL="$BASE/$ASSET" ;;
  esac

  ASSET_CODE="$(curl -s -L --max-time 25 -o /dev/null -w '%{http_code}' "$ASSET_URL" 2>/dev/null)"

  if [ "$ASSET_CODE" = "200" ]; then
    ok "Asset carrega: $ASSET"
  else
    MISMATCH=""
    if [ -n "$SUBPATH" ]; then
      case "$ASSET" in
        "$SUBPATH"/*) ;;
        *) MISMATCH="1" ;;
      esac
    fi

    if [ -n "$MISMATCH" ]; then
      # Publicado em subpasta mas o build aponta para a raiz do domínio.
      bad "Build compilado para a raiz do domínio, mas publicado em $SUBPATH/" \
          "Recompila com: BASE_PATH=$SUBPATH/ npm run build:php"
    else
      bad "Asset não carrega (HTTP $ASSET_CODE): $ASSET_URL" \
          "Confirma que a pasta assets/ foi enviada para o servidor."
    fi
  fi
fi

# --- 2. Rewrite da API -------------------------------------------------------
head_ '2 · Rotas da API (.htaccess)'
HEALTH="$(fetch "$BASE/api/health")"
HEALTH_CODE="$(code_of "$HEALTH")"

if [ "$HEALTH_CODE" = "200" ] && grep -q '"status":"ok"' <<<"$(body_of "$HEALTH")"; then
  ok "/api/health responde em JSON (rewrite a funcionar)"
  info "Runtime: $(grep -oE '"runtime":"[^"]*"' <<<"$(body_of "$HEALTH")" | cut -d'"' -f4)"
else
  bad "/api/health devolveu HTTP $HEALTH_CODE" \
      "Falta o .htaccess em htdocs/ ou o mod_rewrite não está activo. Confirma htdocs/.htaccess."
  printf '\n\033[31mSem as rotas da API, o resto não pode ser verificado.\033[0m\n\n'
  exit 1
fi

STATUS="$(fetch "$BASE/api/db/status")"
if grep -q '"success":true' <<<"$(body_of "$STATUS")"; then
  ok "/api/db/status responde"
else
  bad "/api/db/status não devolveu o estado esperado"
fi

SCHEMA="$(fetch "$BASE/api/db/schema-sql")"
if grep -q 'CREATE TABLE IF NOT EXISTS `lawyers`' <<<"$(body_of "$SCHEMA")"; then
  ok "/api/db/schema-sql entrega o esquema SQL"
else
  bad "/api/db/schema-sql não entregou o esquema"
fi

# --- 3. Base de dados -------------------------------------------------------
head_ '3 · Base de dados MySQL'
MODE="$(grep -oE '"mode":"[^"]*"' <<<"$(body_of "$STATUS")" | cut -d'"' -f4)"
TABLES="$(grep -oE '"tablesCount":[0-9]*' <<<"$(body_of "$STATUS")" | cut -d: -f2)"

if [ "$MODE" = "mysql" ]; then
  ok "Ligação MySQL activa"
  if [ "${TABLES:-0}" -ge 9 ]; then
    ok "$TABLES tabelas criadas"
  else
    warn "Apenas ${TABLES:-0} tabelas (esperadas 9)" "Corre o setup.php novamente."
  fi
  LAWYERS="$(grep -oE '"lawyers":[0-9]+' <<<"$(body_of "$STATUS")" | head -1 | cut -d: -f2)"
  [ "${LAWYERS:-0}" -gt 0 ] && ok "Conteúdo inicial inserido ($LAWYERS advogados)" \
                            || warn "Sem advogados no directório" "Corre o setup.php novamente."
  ERR="$(grep -oE '"error":"[^"]*"' <<<"$(body_of "$STATUS")" | head -1 | cut -d'"' -f4)"
  [ -n "$ERR" ] && info "Erro reportado: $ERR"
else
  bad "Base de dados não ligada (mode: ${MODE:-desconhecido})" \
      "Abre $BASE/setup.php e preenche as credenciais MySQL (host sqlXXX.infinityfree.com)."
  DETAILS="$(grep -oE '"details":"[^"]*"' <<<"$(body_of "$STATUS")" | head -1 | cut -d'"' -f4)"
  [ -n "$DETAILS" ] && info "Detalhe: $DETAILS"
fi

# --- 4. Chat (IA ou fallback) ------------------------------------------------
head_ '4 · Endpoint de consulta jurídica'
CHAT="$(curl -s -L --max-time 40 -w '\n%{http_code}' -X POST "$BASE/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Fui despedido sem aviso prévio após 4 anos."}]}' 2>/dev/null)"
CHAT_CODE="$(code_of "$CHAT")"

if [ "$CHAT_CODE" = "200" ] && grep -q '"text"' <<<"$(body_of "$CHAT")"; then
  ok "/api/chat responde com parecer jurídico"
  if grep -qE 'Enquadramento Jurídico|Parecer Preliminar' <<<"$(body_of "$CHAT")"; then
    info "Resposta da síntese integrada (sem IA): falta ou falhou a GEMINI_API_KEY"
  else
    info "Resposta gerada por IA (Gemini a funcionar)"
  fi
  COMPLEXITY="$(grep -oE '"complexity":"[^"]*"' <<<"$(body_of "$CHAT")" | cut -d'"' -f4)"
  [ -n "$COMPLEXITY" ] && info "Complexidade classificada: $COMPLEXITY"
else
  bad "/api/chat devolveu HTTP $CHAT_CODE" "Vê o log de erros do alojamento."
fi

# --- 5. Segurança -----------------------------------------------------------
head_ '5 · Segurança pós-instalação'
SETUP="$(fetch "$BASE/setup.php")"
if [ "$(code_of "$SETUP")" = "200" ]; then
  warn "O setup.php continua acessível" \
       "Apaga-o (ou descomenta o bloco <Files \"setup.php\"> no .htaccess)."
else
  ok "setup.php já não está acessível"
fi

CONFIG="$(fetch "$BASE/api/config.local.php")"
if [ "$(code_of "$CONFIG")" = "200" ]; then
  bad "O api/config.local.php está publicamente acessível!" \
      "O .htaccess não está a aplicar as regras — as credenciais estão expostas."
else
  ok "Credenciais protegidas (api/config.local.php inacessível)"
fi

# --- Resumo -----------------------------------------------------------------
printf '\n'
if [ "$FAIL" -eq 0 ]; then
  if [ "$WARN" -eq 0 ]; then
    printf '\033[32m✔ Deploy totalmente operacional.\033[0m\n\n'
  else
    printf '\033[32m✔ Deploy funcional\033[0m (%d avisos por resolver).\n\n' "$WARN"
  fi
  exit 0
fi

printf '\033[31m✖ %d problema(s)\033[0m, %d verificação(ões) OK, %d aviso(s).\n' "$FAIL" "$PASS" "$WARN"
printf 'Corre %s/setup.php para corrigir a base de dados.\n\n' "$BASE"
exit 1
