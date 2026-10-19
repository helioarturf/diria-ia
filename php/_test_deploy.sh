#!/usr/bin/env bash
# =============================================================================
# Teste de integração do deploy-infinityfree.sh
#
# Arranca um servidor FTP local (php/_test_ftp_server.py) e publica nele o
# pacote compilado, verificando o que chega ao "servidor".
#
# Cobre: autodeteção de pasta, IF_DIR explícito, exclusões (setup.php,
# config.local.php), preservação de ficheiros existentes, conteúdo idêntico,
# credenciais inválidas e DRY_RUN.
#
# Requisitos: bash, curl, python3 (usa SKIP se não houver python3)
#
# Uso: bash php/_test_deploy.sh
# =============================================================================

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER="$REPO/php/_test_ftp_server.py"
PORT="${PORT:-2222}"
REMOTE="${TMPDIR:-/tmp}/diria_ftp_test_$$"

if ! command -v python3 >/dev/null 2>&1; then
  printf '\033[33m! python3 ausente — teste de deploy saltado.\033[0m\n'
  exit 0
fi

if [ ! -f "$REPO/deploy-infinityfree/htdocs/index.html" ]; then
  printf '\033[36m• Pasta de deploy em falta — a compilar (npm run build:php)...\033[0m\n'
  if ! bash "$REPO/build-php-package.sh" >/dev/null 2>&1; then
    printf '\033[33m! Não foi possível compilar (Node em falta?) — teste saltado.\033[0m\n'
    exit 0
  fi
fi

PASS=0
FAIL=0
ok()  { printf '\033[32m✔ %s\033[0m\n' "$1"; PASS=$((PASS + 1)); }
bad() { printf '\033[31m✖ %s\033[0m\n' "$1"; FAIL=$((FAIL + 1)); }
assert_eq() { if [ "$2" = "$3" ]; then ok "$1 ($2)"; else bad "$1 — esperado [$3], obtido [$2]"; fi; }
assert()    { if [ "$2" -eq 0 ]; then ok "$1"; else bad "$1"; fi; }

stop_server() { (fuser -k "${PORT}"/tcp >/dev/null 2>&1 || true); sleep 1; }

start_server() { # $1 = "com htdocs" | "sem htdocs"
  stop_server
  rm -rf "$REMOTE"
  if [ "$1" = "com htdocs" ]; then
    mkdir -p "$REMOTE/htdocs"
    printf '<html>default do alojamento</html>' > "$REMOTE/htdocs/index2.html"
  else
    mkdir -p "$REMOTE"
    printf 'default' > "$REMOTE/default.php"
  fi
  python3 "$SERVER" "$REMOTE" "$PORT" >/dev/null 2>&1 &
  sleep 1.5
}

run_deploy() { # argumentos extras em forma VAR=valor
  ( cd "$REPO" && env IF_HOST=127.0.0.1 IF_PORT="$PORT" IF_USER=if0_test IF_PASS=secret \
      SKIP_BUILD=1 "$@" bash deploy-infinityfree.sh 2>&1 )
}

trap 'stop_server; rm -rf "$REMOTE"' EXIT

echo
echo "═══ 1. Autodeteção (a conta FTP tem htdocs/) ═══"
start_server "com htdocs"
OUT="$(run_deploy)"; RC=$?
assert_eq "código de saída" "$RC" "0"
grep -q "Autodetecção: pasta remota" <<<"$OUT" && ok "escolheu htdocs/" || bad "não escolheu htdocs/"
grep -q "IF_DOMAIN não definido" <<<"$OUT" && ok "sem IF_DOMAIN avisa e não verifica" || bad "faltou o aviso do IF_DOMAIN"

[ -f "$REMOTE/htdocs/.htaccess" ]          && ok ".htaccess enviado"       || bad ".htaccess NÃO enviado"
[ -f "$REMOTE/htdocs/api/index.php" ]      && ok "api/index.php enviado"   || bad "api/index.php NÃO enviado"
[ -f "$REMOTE/htdocs/index.html" ]         && ok "index.html enviado"      || bad "index.html NÃO enviado"
[ ! -f "$REMOTE/htdocs/setup.php" ]        && ok "setup.php não enviado (já instalado)" || bad "setup.php NÃO devia ser enviado"
[ ! -f "$REMOTE/htdocs/api/config.local.php" ] && ok "config.local.php não enviado" || bad "config.local.php NÃO devia ser enviado"
[ -f "$REMOTE/htdocs/index2.html" ]        && ok "ficheiro do alojamento preservado (sem --delete)" || bad "ficheiro do alojamento foi apagado"
[ ! -f "$REMOTE/index.html" ]              && ok "nada enviado para fora de htdocs/" || bad "ficheiros na raiz errada"

LOCAL_N="$(find "$REPO/deploy-infinityfree/htdocs" -type f -not -name 'setup.php' | wc -l | tr -d ' ')"
REMOTE_N="$(find "$REMOTE/htdocs" -type f -not -name 'index2.html' | wc -l | tr -d ' ')"
assert_eq "número de ficheiros" "$REMOTE_N" "$LOCAL_N"

L="$(md5sum "$REPO/deploy-infinityfree/htdocs/api/lib/db.php" | cut -d' ' -f1)"
R="$(md5sum "$REMOTE/htdocs/api/lib/db.php" | cut -d' ' -f1)"
assert_eq "conteúdo idêntico (db.php)" "$R" "$L"
L="$(md5sum "$REPO/deploy-infinityfree/htdocs/index.html" | cut -d' ' -f1)"
R="$(md5sum "$REMOTE/htdocs/index.html" | cut -d' ' -f1)"
assert_eq "conteúdo idêntico (index.html)" "$R" "$L"

echo
echo "═══ 2. INCLUDE_SETUP=1 (primeira instalação) ═══"
OUT="$(run_deploy INCLUDE_SETUP=1)"
grep -q "O setup.php SERÁ enviado" <<<"$OUT" && ok "aviso de envio do setup.php" || bad "faltou o aviso"
[ -f "$REMOTE/htdocs/setup.php" ] && ok "setup.php enviado" || bad "setup.php NÃO enviado"
[ ! -f "$REMOTE/htdocs/api/config.local.php" ] && ok "config.local.php continua ausente" || bad "config.local.php presente"

echo
echo "═══ 3. Servidor sem pasta htdocs (raiz directa) ═══"
start_server "sem htdocs"
OUT="$(run_deploy)"; RC=$?
assert_eq "código de saída" "$RC" "0"
grep -q "a conta FTP já aponta para a raiz" <<<"$OUT" && ok "escolheu a raiz" || bad "não escolheu a raiz"
[ -f "$REMOTE/.htaccess" ]     && ok ".htaccess enviado para a raiz" || bad ".htaccess NÃO enviado para a raiz"
[ -f "$REMOTE/api/index.php" ] && ok "api/ enviado para a raiz"      || bad "api/ NÃO enviado para a raiz"
[ -f "$REMOTE/default.php" ]   && ok "ficheiro do alojamento preservado" || bad "default.php foi apagado"
[ ! -f "$REMOTE/setup.php" ]   && ok "setup.php não enviado" || bad "setup.php NÃO devia ser enviado"

echo
echo "═══ 4. IF_DIR explícito ═══"
stop_server
mkdir -p "$REMOTE/site"
python3 "$SERVER" "$REMOTE" "$PORT" >/dev/null 2>&1 &
sleep 1.5
OUT="$(run_deploy IF_DIR=site)"; RC=$?
assert_eq "código de saída" "$RC" "0"
[ -f "$REMOTE/site/.htaccess" ] && ok "enviado para IF_DIR=site" || bad "não foi enviado para IF_DIR=site"
grep -q "Autodetecção" <<<"$OUT" && bad "não devia autodetetar com IF_DIR definido" || ok "não autodeta quando IF_DIR está definido"

echo
echo "═══ 5. Credenciais erradas ═══"
stop_server
mkdir -p "$REMOTE"
python3 "$SERVER" "$REMOTE" "$PORT" >/dev/null 2>&1 &
sleep 1.5
OUT="$( (cd "$REPO" && env IF_HOST=127.0.0.1 IF_PORT="$PORT" IF_USER=if0_test IF_PASS=errado \
      SKIP_BUILD=1 bash deploy-infinityfree.sh 2>&1) )"
RC=$?
[ "$RC" -ne 0 ] && ok "falha com credenciais erradas (exit $RC)" || bad "não falhou com credenciais erradas"
grep -q "Não consegui listar a raiz FTP" <<<"$OUT" && ok "mensagem de erro acionável" || bad "mensagem de erro errada"

echo
echo "═══ 6. DRY_RUN (não envia) ═══"
OUT="$( (cd "$REPO" && DRY_RUN=1 SKIP_BUILD=1 IF_HOST=x IF_USER=x IF_PASS=x bash deploy-infinityfree.sh) )"
RC=$?
assert_eq "código de saída" "$RC" "0"
grep -q "DRY_RUN" <<<"$OUT" && ok "listou sem enviar" || bad "DRY_RUN não listou"

echo
printf '\033[1m%d verificações OK, %d falharam.\033[0m\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
