# DirIA Angola — Publicação no cPanel (`cahota.ao`)

Existem **duas vias** para publicar no cPanel partilhado. A via A é agora a mais
simples, porque deixa de depender do Node.js/Passenger e reaproveita o MySQL que
já está a funcionar na conta.

---

## Via A — PHP + MySQL do cPanel (recomendada)

O cPanel já tem PHP e MySQL operacionais. Com o backend PHP que passou a existir
em `php/htdocs/`, basta colocar os ficheiros no alojamento.

### A.1 Gerar o pacote (na tua máquina)

```bash
# na raiz do domínio (https://cahota.ao/)
npm run build:php

# ou numa subpasta (https://cahota.ao/diria/)
BASE_PATH=/diria/ npm run build:php
```

### A.2 Criar o destino

No cPanel, escolhe **uma** das opções:

- **Subpasta** — `File Manager` → entra em `public_html` → cria a pasta `diria`.
  Fica acessível em `https://cahota.ao/diria/` (usa `BASE_PATH=/diria/`).
- **Subdomínio** — `Domains → Create A New Domain` → `diria.cahota.ao` com
  document root `public_html/diria`. Fica na raiz desse subdomínio (usa o build
  por omissão, sem `BASE_PATH`).

### A.3 Enviar os ficheiros

Carrega o `diria-infinityfree.zip` para a pasta escolhida e extrai-o aí.
O resultado deve ser: `index.html`, `assets/`, `api/`, `setup.php`, `.htaccess`.

### A.4 Instalar

Abre `https://cahota.ao/diria/setup.php` (ou no subdomínio) e preenche:

| Campo | Valor no cPanel |
|---|---|
| Servidor MySQL | `localhost` |
| Base de dados | `cahota_diria` |
| Utilizador | o utilizador criado em `MySQL Databases` |
| Password | a que definiste |
| GEMINI_API_KEY | a tua chave |

O assistente cria as tabelas, insere o directório de advogados e grava as
credenciais em `api/config.local.php`.

> O `.env` da versão Node (em `~/repositories/diria-ia`) **não** é usado por esta
> via — as credenciais ficam em `api/config.local.php`.

### A.5 Verificar e limpar

```bash
curl -s https://cahota.ao/diria/api/health
curl -s https://cahota.ao/diria/api/db/status
```

Depois apaga o `setup.php` do alojamento.

**Vantagens:** sem Passenger, sem `npm install` no servidor, sem os erros de
`edgesOut`, sem o problema de DNS do `diria.ao`. Apenas PHP + MySQL, que já
funcionam.

---

## Via B — Node.js + Passenger (via original)

Útil se quiseres manter o backend Node. Requer Node.js no cPanel e um domínio
que resolva.

### B.1 Pré-requisitos no cPanel

1. **Domínio a resolver.** O `diria.ao` é um addon domain que não resolve
   (`curl: (6) Could not resolve host`). Escolhe uma das soluções:
   - cria o subdomínio `diria.cahota.ao` (resolve imediatamente), ou
   - aponta os nameservers de `diria.ao`, no registador, para os do `cahota.ao`
     (consulta-os com `dig NS cahota.ao`).
2. **Node.js** — `Setup Node.js App → Create Application`:

   | Campo | Valor |
   |---|---|
   | Node.js version | 20.x (ou superior) |
   | Application mode | Production |
   | Application root | `repositories/diria-ia` |
   | Application URL | o domínio/subdomínio que resolve |
   | Application startup file | `server.js` |

   Se o cPanel recusar com *"Web application is inaccessible by its address"*, é
   o domínio que não resolve — resolve primeiro o ponto 1.

### B.2 Enviar e compilar

```bash
# no servidor (Terminal do cPanel)
cd ~/repositories/diria-ia
git pull
./deploy-cpanel.sh --build
```

O script instala dependências (`npm ci`, com recuperação automática de
`node_modules` corrompido), compila o frontend (`dist/`) e empacota o backend
(`server.js`, ~41 KB).

Confirmações rápidas:

```bash
ls -la server.js            # deve rondar 41000 bytes, não 323
ls -la dist/index.html      # tem de existir
```

> `server.js` com ~323 bytes é o ficheiro de exemplo do cPanel — foi sobrescrito
> e não é a aplicação.

### B.3 Variáveis de ambiente

`Setup Node.js App → Environment variables` (ou `~/repositories/diria-ia/.env`):

```
GEMINI_API_KEY=<a tua chave>
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cahota_diria
DB_USER=<utilizador>
DB_PASSWORD=<password>
```

> O `dotenv` não sobrepõe variáveis já definidas, por isso o `PORT` do Passenger
> ganha ao `PORT=3000` do `.env`. A aplicação escuta em `0.0.0.0` — está correto.

### B.4 Reiniciar e verificar

```bash
mkdir -p tmp && touch tmp/restart.txt
curl -s https://<o-teu-dominio>/api/health
```

Espera-se `"status":"ok"` e, com o MySQL ligado, `"mode":"mysql"`.

### B.5 Diagnóstico

```bash
cd ~/repositories/diria-ia
tail -30 stderr.log
ls ~/.npm/_logs/ | tail -3
```

Sintomas conhecidos:

| Sintoma | Causa | Solução |
|---|---|---|
| `ReferenceError: require is not defined in ES module scope` | correu o `server.js` de exemplo do cPanel | `./deploy-cpanel.sh --build` |
| `npm error Cannot read properties of null (reading 'edgesOut')` | `node_modules` corrompido | `rm -rf node_modules && npm install` (o script faz isso) |
| App não abre, `http=000` | domínio não resolve | ver B.1 |
| cPanel recusa criar a app | endereço inacessível | ver B.1 |

---

## Qual escolher?

| Critério | Via A (PHP) | Via B (Node) |
|---|---|---|
| Depende de Node/Passenger | Não | Sim |
| Depende do DNS de `diria.ao` | Não | Sim |
| Reaproveita o MySQL existente | Sim | Sim |
| Código a manter | `php/htdocs/` | `server.ts` |
| Recomendada para publicar já | ✅ | — |

As duas vias partilham o mesmo frontend e os mesmos endpoints `/api/*`, por isso
é possível alternar sem tocar na aplicação React.
