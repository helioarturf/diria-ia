# DirIA Angola — Passo-a-passo para InfinityFree (PHP)

Usa o pacote gerado: `diria-infinityfree.zip` (já existente no repositório: `php/htdocs` foi empacotado na raiz). Também tens `verify-deploy.sh` para diagnóstico.

## 1. Criar a base de dados

No painel do InfinityFree → `MySQL Databases`:

1. `Create Database` (ex.: `diria`).
2. `Create User` (ex.: `diria`) com password forte.
3. `Add User to Database` → associa com `ALL PRIVILEGES`.

Anota:
- **Host:** `sqlXXX.infinityfree.com` (exatamente o que aparece)
- **Base de dados:** `if0_XXXXXXXXX_diria` (pode ter prefixo)
- **Utilizador:** `if0_XXXXXXXXX` (pode ter prefixo)
- **Password:** a que definiste

## 1. Criar a base de dados

No painel do InfinityFree → `MySQL Databases`:

1. `Create Database` (ex.: `diria`).
2. `Create User` (ex.: `diria`) com password forte.
3. `Add User to Database` → associa com `ALL PRIVILEGES`.

Anota:
- **Host:** `sqlXXX.infinityfree.com` (exatamente o que aparece)
- **Base de dados:** `if0_XXXXXXXXX_diria` (pode ter prefixo)
- **Utilizador:** `if0_XXXXXXXXX` (pode ter prefixo)
- **Password:** a que definiste

## 2. Enviar os ficheiros

Podes fazer **automático** (FTP) ou **manual** (File Manager).

### 2a. Automático (FTP) — recomendado

Na tua máquina, no directório do projecto:

```bash
IF_HOST=ftpupload.net IF_USER=if0_XXXXXXXXX IF_PASS=XXXXXXXXXXXX bash deploy-infinityfree.sh
# ou com domínio para verificar logo
IF_HOST=ftpupload.net IF_USER=if0_XXXXXXXXX IF_PASS=XXXXXXXXXXXX IF_DOMAIN=https://o-teu-dominio bash deploy-infinityfree.sh
```

O `ftpupload.net` varia consoante a tua conta (InfinityFree mostra o servidor FTP no painel: `Control Panel → FTP Accounts`).

Depois extrai o `diria-infinityfree.zip` em `htdocs/` via File Manager e apaga-o.

### 2b. Manual (File Manager)

1. `Online File Manager` → entra em `htdocs/`.
2. Apaga `index2.html`, `default.php`, `default.html` se existirem.
3. Carrega `diria-infinityfree.zip` para `htdocs/`.
4. Extrai-o em `htdocs/` (ficam: `assets/`, `api/`, `index.html`, `setup.php`, `.htaccess`).
5. Apaga o `.zip`.
6. No File Manager, activa **Show Hidden Files** (canto superior direito) e confirma que o ficheiro `.htaccess` está presente (pode estar oculto).

## 3. Instalar pelo setup.php

1. Abre `https://o-teu-dominio/setup.php`.
2. Verifica a secção **1 · Ambiente** (verde).
3. Secção **2 · Estado da base de dados**: depois de preencher, será actualizado.
4. Secção **3 · Credenciais**:
   - Host: `sqlXXX.infinityfree.com`
   - Porta: `3306`
   - Nome da BD: o nome completo com prefixo
   - Utilizador: o nome completo com prefixo
   - Password: a que definiste
   - GEMINI_API_KEY: opcional (sem ela funciona com síntese jurídica integrada)
   - Modelos: podem ficar os valores por omissão
5. Clica **Instalar / Actualizar**. Esperas a mensagem "Tabelas criadas", "Advogados no directório".
6. Clica **Testar rotas da API** (novo). Deve aparecer "Rotas da API OK".
7. Clica **Testar ligação ao Gemini** (só se tiveres chave).

## 4. Diagnosticar (método mais seguro)

Na tua máquina (neste projecto ou onde tiveres o `verify-deploy.sh`):

```bash
bash verify-deploy.sh https://o-teu-dominio
```

Verás: assets carregam, `/api/health`/`/api/db/status` correctos, `/api/chat` responde, flags de segurança (setup.php visível, config.local.php não acessível).

## 5. Finalizar

Quando tudo estiver verde:

1. Apaga `setup.php` de `htdocs/`.
2. Abre `https://o-teu-dominio/` e testa a app.

## Pontos a ter em conta

- **.htaccess oculto:** razão número 1 para 404 em `/api/*`. Usa "Show Hidden Files".
- **Na raiz:** aplica a este domínio. Se tiveres de pôr em subpasta, repara no guia existente.
- **Dados reais:** o DB tem de existir primeiro (passo 1). O `setup.php` **não** cria a base de dados, só tabelas e dados iniciais.
- **Gemini 404 "model not found":** se acontecer, no `setup.php` muda os modelos para `gemini-2.5-flash` e `gemini-2.5-flash-preview-tts` (ajustado recentemente).
- **Sem PHP local:** já tem o zip pronto. Se necessário, `BASE_PATH=/diria/ npm run build:php` gera a versão para subpasta.

Pronto. Segue por estes passos. Se algo falhar, mostra o output do `verify-deploy.sh` (ou das mensagens do `setup.php`) que eu debito à resolução.