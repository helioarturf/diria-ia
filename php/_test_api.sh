#!/usr/bin/env bash
# =============================================================================
# DirIA Angola — Testes end-to-end da API PHP (servidor embutido do PHP).
#
# Não precisa de MySQL nem de chave Gemini: valida o router, os fallbacks
# jurídicos, os códigos de erro e o assistente de instalação.
#
# Uso:
#   bash php/_test_api.sh
#   PHP_BIN=/caminho/para/php bash php/_test_api.sh
#   DOCROOT=deploy-infinityfree/htdocs bash php/_test_api.sh   # testa o pacote
# =============================================================================

set -uo pipefail

PHP_BIN="${PHP_BIN:-php}"
PORT="${PORT:-8099}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCROOT="${DOCROOT:-$ROOT/php/htdocs}"
LOG="$(mktemp -t diria-php-test.XXXXXX.log)"
BASE="http://127.0.0.1:${PORT}"

PASS=0
FAIL=0

cleanup() {
  [ -n "${SERVER_PID:-}" ] && kill "$SERVER_PID" 2>/dev/null
  rm -f "$LOG"
}
trap cleanup EXIT

# --- Arranque -----------------------------------------------------------------
# DB_HOST/DB_PORT apontam para uma porta fechada: exercita o caminho
# "not-initialized" sem depender de um servidor MySQL real.
(
  cd "$ROOT/php" || exit 1
  DIRIA_DOCROOT="$DOCROOT" \
  DB_HOST=127.0.0.1 DB_PORT=1 DB_NAME=diria_test DB_USER=diria_test DB_PASSWORD=x \
  GEMINI_API_KEY= GEMINI_MODEL=gemini-test \
    "$PHP_BIN" -S "127.0.0.1:${PORT}" -t "$DOCROOT" _test_router.php
) >"$LOG" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 40); do
  sleep 0.25
  curl -s -o /dev/null --max-time 2 "$BASE/api/health" && break
done

# --- Helpers ------------------------------------------------------------------
request() { # request METHOD PATH [JSON]
  local method="$1" path="$2" data="${3:-}"
  if [ -n "$data" ]; then
    curl -s -w '\n%{http_code}' --max-time 15 -X "$method" "$BASE$path" \
      -H 'Content-Type: application/json' -d "$data"
  else
    curl -s -w '\n%{http_code}' --max-time 15 -X "$method" "$BASE$path"
  fi
}

check() { # check LABEL EXPECTED SUBSTRING IN BODY
  local label="$1" expected="$2" body="$3"
  if grep -qF -- "$expected" <<<"$body"; then
    printf '  \033[32m✔\033[0m %s\n' "$label"
    PASS=$((PASS + 1))
  else
    printf '  \033[31m✖\033[0m %s\n' "$label"
    printf '      esperava: %s\n' "$expected"
    printf '      recebido: %s\n' "$(head -c 400 <<<"$body")"
    FAIL=$((FAIL + 1))
  fi
}

check_status() { # check_status LABEL EXPECTED_CODE RESPONSE
  local label="$1" expected="$2" response="$3"
  local code="${response##*$'\n'}"
  local body="${response%$'\n'*}"
  if [ "$code" = "$expected" ]; then
    printf '  \033[32m✔\033[0m %s (HTTP %s)\n' "$label" "$code"
    PASS=$((PASS + 1))
  else
    printf '  \033[31m✖\033[0m %s (esperava HTTP %s, veio %s)\n' "$label" "$expected" "$code"
    printf '      %s\n' "$(head -c 300 <<<"$body")"
    FAIL=$((FAIL + 1))
  fi
}

echo
echo "=== DirIA Angola · API PHP ==="
echo

# 1. Health
R="$(request GET /api/health)"
check_status "GET /api/health" 200 "$R"
check "health: status ok"       '"status":"ok"'          "$R"
check "health: runtime PHP"     '"runtime":"php-'        "$R"
check "health: sem BD"          '"mode":"not-initialized"' "$R"

# 2. Estado da base de dados
R="$(request GET /api/db/status)"
check_status "GET /api/db/status" 200 "$R"
check "status: success"    '"success":true'   "$R"
check "status: connected=false" '"connected":false' "$R"
check "status: lista de tabelas" '"tables":[]' "$R"

# 3. Esquema SQL (download)
R="$(request GET /api/db/schema-sql)"
check "schema: tabela lawyers"  'CREATE TABLE IF NOT EXISTS `lawyers`'  "$R"
check "schema: tabela messages" 'CREATE TABLE IF NOT EXISTS `messages`' "$R"
check "schema: 9 tabelas"       'cpanel_system_logs'                    "$R"

# 4. Chat — fallback Direito Laboral (sem chave de IA)
R="$(request POST /api/chat '{"messages":[{"role":"user","content":"Fui despedido sem aviso prévio após 4 anos."}],"consultationType":"Direito Laboral","userProfile":{"role":"Cidadão / Utente","province":"Luanda"}}')"
check_status "POST /api/chat (laboral)" 200 "$R"
check "chat: enquadramento laboral" 'Direito Laboral Angolano' "$R"
check "chat: complexidade"          '"complexity":"Elevada"'   "$R"
check "chat: campo suggestions"     '"suggestions":['         "$R"
check "chat: sugestão IGT"          'IGT'          "$R"

# 5. Chat — fallback Arrendamento
R="$(request POST /api/chat '{"messages":[{"role":"user","content":"O senhorio quer aumentar a renda da casa."}]}')"
check_status "POST /api/chat (arrendamento)" 200 "$R"
check "chat: enquadramento imobiliário" 'Direito Imobiliário' "$R"
check "chat: sugestão caução"           'caução' "$R"

# 6. Chat — sem mensagens
R="$(request POST /api/chat '{"messages":[]}')"
check_status "POST /api/chat sem mensagens" 400 "$R"
check "chat: erro de validação" 'Nenhuma mensagem fornecida' "$R"

# 7. TTS — sem chave de IA
R="$(request POST /api/tts '{"text":"Bom dia Angola"}')"
check_status "POST /api/tts sem chave" 500 "$R"
check "tts: mensagem de erro" 'síntese de voz' "$R"

# 8. Rota inexistente
R="$(request GET /api/nao-existe)"
check_status "GET /api/nao-existe" 404 "$R"
check "404: mensagem" 'Rota não encontrada' "$R"

# 9. Método errado
R="$(request GET /api/db/auto-provision)"
check_status "GET /api/db/auto-provision (método errado)" 405 "$R"

# 10. Provisionamento com credenciais inválidas
R="$(request POST /api/db/auto-provision '{"host":"127.0.0.1","port":1,"database":"x","user":"y","password":"z"}')"
check_status "POST /api/db/auto-provision inválido" 500 "$R"
check "provision: erro legível" 'MySQL' "$R"

# 11. Assistente de instalação
R="$(request GET /setup.php)"
check_status "GET /setup.php" 200 "$R"
check "setup: título"        'Instalação'          "$R"
check "setup: ambiente"      'Ambiente do alojamento' "$R"
check "setup: formulário"    'name="db_host"'       "$R"

# 11b. Instalação com credenciais inválidas -> erro legível em HTML
R="$(curl -s -w '\n%{http_code}' --max-time 20 -X POST "$BASE/setup.php" \
  --data-urlencode 'action=install' --data-urlencode 'db_host=127.0.0.1' \
  --data-urlencode 'db_port=1' --data-urlencode 'db_name=x' \
  --data-urlencode 'db_user=u' --data-urlencode 'db_password=p' \
  --data-urlencode 'gemini_api_key=')"
check_status "POST /setup.php (credenciais inválidas)" 200 "$R"
check "setup POST: erro de MySQL legível" 'Não foi possível ligar ao MySQL' "$R"
check "setup POST: alerta de chave em falta" 'Sem chave da API Google' "$R"

# 12. Pré-visualização do frontend (se existir dist/)
if [ -f "$DOCROOT/index.html" ]; then
  R="$(request GET /)"
  check_status "GET / (SPA)" 200 "$R"
  check "spa: html" '<div id="root"' "$R"
else
  echo "  \033[33m•\033[0m GET / (SPA) — ignorado (sem dist/ empacotado)"
fi

# --- Resumo -------------------------------------------------------------------
echo
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m%d verificações passaram.\033[0m\n\n' "$PASS"
  exit 0
fi

printf '\033[31m%d falharam\033[0m, %d passaram.\n' "$FAIL" "$PASS"
echo
echo "--- log do servidor ---"
tail -30 "$LOG"
exit 1
