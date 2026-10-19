# DirIA Angola — Publicação em alojamento PHP (InfinityFree / cPanel)

Esta pasta contém o **backend PHP** que substitui o servidor Node.js (`server.ts`),
permitindo publicar a DirIA Angola em alojamentos partilhados só com PHP + MySQL
(como o InfinityFree).

O frontend React **não foi alterado** — é o mesmo build do Vite (`dist/`), e
continua a chamar `/api/chat`, `/api/tts`, `/api/db/status`, etc.

---

## 1. Arquitectura

O código-fonte vive em `php/htdocs/` — exactamente a estrutura que vai para o
alojamento (a pasta `dist/` do React é sobreposta no empacotamento):

```
php/htdocs/                 <- raiz pública do site (htdocs do alojamento)
├── .htaccess               rotas: /api/* -> PHP ; resto -> SPA
├── setup.php               assistente de instalação (apagar no fim)
└── api/
    ├── index.php           front controller (equivalente a server.ts)
    ├── config.php          valores por omissão
    ├── config.local.php    credenciais reais (gerado pelo setup.php)
    └── lib/
        ├── bootstrap.php   includes + polyfills + erros
        ├── http.php        JSON in/out
        ├── prompt.php      prompt de sistema + síntese jurídica de reserva
        ├── schema.php      DDL MySQL (9 tabelas)
        ├── seed.php        advogados + consulta demo
        ├── db.php          PDO/MySQL (status, provisionamento, seed)
        └── gemini.php      cliente Google Gemini (cURL)
```

No pacote final, `dist/index.html` e `dist/assets/` são adicionados à mesma
pasta `htdocs/`.

Endpoints disponíveis (iguais aos do Node):
`POST /api/chat` · `POST /api/tts` · `POST /api/generate-draft` ·
`POST /api/analyze-document` · `GET /api/health` · `GET /api/db/status` ·
`POST /api/db/auto-provision` · `GET /api/db/schema-sql`

---

## 2. Gerar o pacote (na tua máquina)

```bash
npm run build:php          # compila o React e cria diria-infinityfree.zip
npm run build:php:fast     # reutiliza o dist/ já existente
```

Se o `npm` não estiver no PATH, indica a pasta dos binários do Node:

```bash
NODE_BIN_DIR=/caminho/para/node/bin npm run build:php
```

Resultado:

- pasta `deploy-infinityfree/htdocs/` — pronta a enviar
- `diria-infinityfree.zip` — o mesmo, compactado

### Testar antes de publicar

Os testes não precisam de MySQL nem de chave de API:

```bash
php php/_test_units.php      # 54 verificações: esquema, seed, fallbacks, rotas
bash php/_test_api.sh        # 35 verificações: endpoints a correr no PHP

# testar o pacote já montado (inclui o frontend)
DOCROOT=deploy-infinityfree/htdocs bash php/_test_api.sh
```

Sem PHP instalado? Define `PHP_BIN` com o caminho do binário.

### Publicar numa subpasta (ex.: `https://dominio.ao/diria/`)

Por omissão a aplicação assume a **raiz do domínio** (`https://dominio.ao/`).
Se precisares de a colocar numa subpasta, compila com `BASE_PATH`:

```bash
BASE_PATH=/diria/ npm run build:php
```

Isto faz com que:

- os assets sejam pedidos a `/diria/assets/...`;
- as chamadas à API sejam feitas a `/diria/api/...` (resolvidas em
  `src/lib/api.ts`, que respeita a base do build).

Depois coloca o conteúdo de `deploy-infinityfree/htdocs/` na subpasta
`htdocs/diria/` do alojamento. O `.htaccess` já funciona em subpasta (não fixa
`RewriteBase`).

---

## 3. Publicar no InfinityFree (passo a passo)

### 3.1 Criar a base de dados

No painel de controlo do InfinityFree (`Control Panel → MySQL Databases`):

1. **Create Database** → nome, por exemplo, `diria`.
2. **Create User** → nome, por exemplo, `diria`, com password forte.
3. **Add User to Database** → associa o utilizador à base de dados com `ALL PRIVILEGES`.

Anota os **nomes reais** que o painel mostra (têm o prefixo da conta):

| Campo | Exemplo |
|---|---|
| Host | `sql123.infinityfree.com` |
| Base de dados | `if0_35949895_diria` |
| Utilizador | `if0_35949895` |
| Password | *(a que definiste)* |

> O host **não** é `localhost`. Usa exactamente o valor mostrado no painel.

### 3.2 Enviar os ficheiros

`Control Panel → Online File Manager` (ou FTP com FileZilla):

1. Entra na pasta `htdocs/`.
2. Apaga os ficheiros por omissão do alojamento (`index2.html`, `default.php`,
   `default.html`), se existirem — caso contrário continuam a responder no lugar da aplicação.
3. Carrega o `diria-infinityfree.zip`.
4. Extrai o ZIP dentro de `htdocs/` e apaga o ficheiro `.zip`.

O resultado tem de ficar assim: `htdocs/index.html`, `htdocs/api/...`,
`htdocs/assets/...`, `htdocs/setup.php`.

> Se o File Manager já tiver um `.htaccess` com conteúdo, **adiciona** as regras
> do nosso `.htaccess` no fim em vez de apagar tudo.

> O File Manager **esconde ficheiros começados por ponto**. Activa
> **Show Hidden Files** (canto superior direito) e confirma que o `.htaccess`
> ficou em `htdocs/`. Sem ele, `/api/*` devolve 404.

> A aplicação tem de ficar na **raiz do domínio**. Para a colocar numa subpasta,
> compila com `BASE_PATH=/diria/ npm run build:php` (ver secção «Publicar numa
> subpasta» acima).

### 3.3 Instalar

1. Abre `https://o-teu-dominio/setup.php`.
2. Confirma a secção **1 · Ambiente** (verde em tudo).
3. Preenche os dados do MySQL e a `GEMINI_API_KEY`.
4. Clica **Instalar / Actualizar**.
5. Clica **Testar rotas da API** — confirma que o `.htaccess` encaminha
   `/api/*` para o backend (a falha mais comum).
6. Clica **Testar ligação ao Gemini** (opcional, mas recomendado).

O assistente:
- cria as 9 tabelas;
- insere o directório de advogados, a consulta demo e o utilizador admin;
- grava as credenciais em `api/config.local.php`.

### 3.4 Verificar

A forma mais rápida e completa é correr o verificador a partir da tua máquina:

```bash
bash verify-deploy.sh https://o-teu-dominio
```

Ele testa (e explica o que falha): a página, os assets, o `.htaccess`, a base de
dados, o `/api/chat` e se o `setup.php`/credenciais ficaram expostos.

Alternativamente, abre os endereços à mão:

| URL | Esperado |
|---|---|
| `/api/health` | `{"status":"ok",...,"database":{"mode":"mysql","connected":true,...}}` |
| `/api/db/status` | `"mode":"mysql"`, `"tablesCount":9` |
| `/` | A aplicação React |

### 3.5 Terminar

Apaga (ou renomeia) o `setup.php` do alojamento.

---

## 4. Chave da API Google Gemini

Cria uma chave em <https://aistudio.google.com/apikey> e cola-a no `setup.php`.

Se a API falhar, a aplicação **não quebra**: o backend responde com a *síntese
jurídica integrada* (textos legais pré-escritos por ramo do direito), tal como
acontecia no servidor Node.

### Modelos

Os nomes por omissão (`gemini-3.8-flash`, `gemini-3.8-flash-lite-tts`) vêm da
configuração original do AI Studio. Se a Google devolver
`404 model not found`, substitui no `setup.php` pelos identificadores públicos
actuais, por exemplo:

- Chat: `gemini-2.5-flash`
- Voz (TTS): `gemini-2.5-flash-preview-tts`

---

## 5. Limitações do InfinityFree (importante)

| Tema | Situação |
|---|---|
| Node.js | ❌ Não existe (daí esta versão em PHP) |
| SSH / terminal | ❌ Não existe — instalação pelo `setup.php` |
| Composer | ❌ Não existe — o backend não tem dependências externas |
| Acesso remoto ao MySQL deles | ❌ Só a partir do PHP da própria conta |
| **Supabase / PostgreSQL externo** | ❌ Sem extensão `pdo_pgsql` e com portas de saída bloqueadas |
| Chamadas HTTPS de saída (Gemini) | ⚠️ Normalmente permitidas, mas algumas APIs são bloqueadas pelo firewall |
| Sistemas automáticos a chamar a API | ⚠️ O sistema anti-bot pode devolver 403 a clientes que não sejam o browser |

> Conclusão: para base de dados, usa o **MySQL do próprio InfinityFree**.
> O Supabase só funcionaria via API REST (HTTPS) e sem garantias.

---

## 6. Resolução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| `404` em `/api/*` | `.htaccess` ausente ou mod_rewrite desactivado | Confirma que `htdocs/.htaccess` existe e não foi substituído |
| `mode: "not-initialized"` | Credenciais erradas | Verifica host/utilizador/base no painel; volta a correr o `setup.php` |
| `Access denied for user` | Password ou privilégios | Recria a associação utilizador↔base de dados |
| `pdo_mysql` em falta | Extensão desactivada | Activa em `PHP Configuration` (raro no InfinityFree) |
| Respostas sem IA | Chave inválida ou API bloqueada | Testa no `setup.php`; confirma a chave no Google AI Studio |
| Áudio não gera | Modelo TTS incorrecto | Usa `gemini-2.5-flash-preview-tts` |
| Erro 500 no site | Sintaxe/`Options` inválidos no `.htaccess` | Comenta as linhas suspeitas e testa |
| Página abre mas sem estilos | Publicado numa subpasta sem `BASE_PATH` | Recompila com `BASE_PATH=/subpasta/` |
| API responde 404 na subpasta | Build sem `BASE_PATH` | As chamadas iam para `/api/...` em vez de `/subpasta/api/...` |

### Teste rápido por linha de comandos (na tua máquina)

```bash
# Diagnóstico completo, com explicação de cada falha:
bash verify-deploy.sh https://o-teu-dominio

# Ou, à mão:
curl -s https://o-teu-dominio/api/health
curl -s https://o-teu-dominio/api/db/status
curl -s -X POST https://o-teu-dominio/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Fui despedido sem aviso prévio."}]}'
```

---

## 7. Diferenças face à versão Node

| Aspecto | Node (`server.ts`) | PHP (`php/api/index.php`) |
|---|---|---|
| Servidor | Express | Apache + front controller |
| BD | `mysql2` | PDO MySQL |
| IA | `@google/genai` | Google Generative Language REST + cURL |
| Fallback sem BD | Ficheiro `data/diria_db.json` | Estado `not-initialized` no painel |
| Frontend | igual | **igual (sem alterações)** |
| Prompt/fallbacks | iguais | **iguais (copiados)** |
