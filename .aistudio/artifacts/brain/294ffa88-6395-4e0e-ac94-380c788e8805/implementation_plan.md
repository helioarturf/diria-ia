# Painel do Advogado & Escritório de Advocacia (DirIA Angola)

Plataforma profissional integrada para juristas singulares e sociedades de advogados gerirem solicitações de consultas de utentes, agenda de audiências/mediação IGT, notas processuais e relatórios analíticos de desempenho.

## Decisões Confirmadas & Preferências do Utilizador

> [!IMPORTANT]
> Decisões alinhadas na Fase 1 com o utilizador:
> 1. **Modo de Acesso**: Acesso directo e intuitivo através de botão dedicado na Barra Lateral (`Sidebar`) e no Perfil, permitindo alternar facilmente entre a visão do utente e a visão profissional do escritório.
> 2. **Gestão de Solicitações & Agenda**: Fluxo interactivo completo para aceitar ou recusar pedidos, atribuir datas/horários definitivos, indicar modalidade (Presencial ou Online) e adicionar notas internas do caso.
> 3. **Relatórios & Métricas em Destaque**: Painel analítico com foco em volume de consultas atendidas, índice de satisfação/avaliações recebidas da OAA e taxa de resolução de litígios.

---

## 1. Visão Geral & Conceito Principal

- **O que faz**: Proporciona aos advogados e escritórios de advocacia em Angola um ambiente de gestão operacional conectado directamente ao ecossistema da DirIA. Quando os cidadãos solicitam agendamentos através do Directório OAA, esses pedidos chegam instantaneamente à caixa de entrada do jurista/escritório.
- **Público-Alvo**: Advogados singulares, advogados estagiários, sócios e gestores de sociedades de advogados com inscrição activa na OAA.
- **Valor Agregado**: Centralização de solicitações, gestão unificada de prazos processuais e sessões de mediação na IGT, acompanhamento do feedback dos clientes e análise do impacto da sua assessoria jurídica.

---

## 2. Experiência do Utilizador & Design Visual

### Fluxos Principais

1. **Acesso ao Painel**:
   - Clique em **"Painel do Advogado"** na barra lateral (ou cabeçalho), abrindo uma consola profissional em ecrã expandido com paleta sóbria (slate/navy/emerald) e tipografia editorial focada em produtividade.
   - Seletor de jurista/escritório activo (ex.: *Dr. António Bemba*, *Dra. Kátia dos Santos*, *Talatona Legal Partners* ou o jurista registado pelo utilizador).

2. **Gestão de Solicitações de Consulta**:
   - Separador **"Solicitações de Consulta"** listando pedidos pendentes, confirmados e arquivados.
   - Cada solicitação exibe dados do mandante (nome, telefone, província), assunto prévio (ex: *Despedimento ilícito*, *Cobrança de salários*, *Contrato comercial*), data preferencial e modalidade.
   - Ações: **Aceitar** (define data/hora e sala de reunião ou link de videochamada), **Recusar** (com motivo formal), ou **Adicionar Notas do Caso** (anotações confidenciais do advogado).

3. **Gestão de Agenda Forense & Mediação**:
   - Separador **"Agenda do Escritório"** com filtros de vista diária e semanal.
   - Eventos pré-configurados e capacidade de adicionar novos compromissos: *Sessão de Mediação IGT Luanda*, *Audiência na Sala de Trabalho do Tribunal de Comarca*, *Reunião Preliminar com Mandante*, *Leitura de Sentença*.
   - Marcação rápida de estado: *Agendado*, *Concluído*, *Adiado*.

4. **Relatório de Consultas & Desempenho**:
   - Métricas em destaque com números tabulares (`font-mono tabular-nums`):
     - **Volume de Consultas**: Total atendido no mês vs. histórico acumulado.
     - **Taxa de Resolução**: Percentual de litígios resolvidos extrajudicialmente ou em juízo.
     - **Avaliação Média OAA**: Nota média em estrelas e discriminação dos critérios (*Clareza Jurídica*, *Agilidade*, *Eficácia*).
     - **Distribuição Temática**: Percentual por Direito Laboral, Comercial, Família, Civil e Imobiliário.
   - Exportação de relatório em formato texto/resumo executivo.

5. **Directório de Clientes & Avaliações Recebidas**:
   - Visualização das avaliações públicas deixadas pelos utentes com capacidade de registar notas de acompanhamento do cliente.

---

## 3. Arquitetura Técnica & Modelo de Dados

### Diagrama de Componentes e Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────┐
│                       DirIA Angola App                       │
└──────┬───────────────────────┬───────────────────────────────┘
       │                       │
       ▼                       ▼
┌──────────────┐       ┌───────────────────────────────────────┐
│ User Portal  │       │       Lawyer / Firm Portal            │
│ (Utente)     │       │   (Painel do Advogado/Escritório)     │
└──────┬───────┘       └───────────────────┬───────────────────┘
       │ Agendamento                       │
       ▼                                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Shared State & LocalStorage (consultationRequests, reviews) │
│  - requests: id, lawyerId, clientName, phone, date, status   │
│  - scheduleEvents: hearings, IGT sessions, client consults   │
│  - lawyerPerformance: resolution rate, monthly volume, stats │
└──────────────────────────────────────────────────────────────┘
```

### Novos Modelos de Dados em `src/types.ts`:
- `ConsultationRequest`:
  - `id`: string
  - `lawyerId`: string
  - `lawyerName`: string
  - `clientName`: string
  - `clientPhone`: string
  - `preferredDate`: string
  - `scheduledDate?: string`
  - `scheduledTime?: string`
  - `modality`: 'Presencial' | 'Videoconferência (Online)'
  - `subject`: string
  - `status`: 'Pendente' | 'Confirmada' | 'Realizada' | 'Cancelada'
  - `createdAt`: string
  - `caseNotes?: string`
  - `estimatedFee?: string`
- `LawyerScheduleEvent`:
  - `id`: string
  - `lawyerId`: string
  - `title`: string
  - `type`: 'Audiência Judicial' | 'Mediação IGT' | 'Consulta Cliente' | 'Diligência Notarial / Registo'
  - `date`: string
  - `time`: string
  - `location`: string
  - `clientName?: string`
  - `status`: 'Agendado' | 'Realizado' | 'Adiado'

---

## 4. Plano Passo a Passo de Execução

1. **Atualizar `src/types.ts`**:
   - Declarar as interfaces `ConsultationRequest` e `LawyerScheduleEvent`.
2. **Atualizar `src/data/userPortalData.ts`**:
   - Adicionar dados iniciais representativos de solicitações de consulta angolanas e eventos de agenda (ex.: IGT Luanda, Tribunal de Comarca de Belas, Comarca de Luanda).
3. **Criar `src/components/LawyerPortalModal.tsx`**:
   - Implementar o componente com separadores: *Visão Geral & Indicadores*, *Solicitações de Consulta*, *Agenda Forense*, *Relatórios Analíticos* e *Avaliações & Clientes*.
   - Ações interactivas: aceitar/recusar com formulário de horário, criar novo evento na agenda, adicionar notas ao processo e filtrar por estado.
4. **Integrar com `ScheduleConsultationModal.tsx`**:
   - Ao submeter um pedido de agendamento na vista do utente, gerar um novo registo em `consultationRequests`, que aparecerá de imediato no painel do advogado.
5. **Atualizar `Sidebar.tsx` e `Header.tsx`**:
   - Adicionar botão **"Painel do Advogado"** com ícone `gavel` ou `shield_person` e badge "OAA Pro".
6. **Integrar no `App.tsx`**:
   - Manter estado persistido no `localStorage` de solicitações e eventos de agenda.
   - Fornecer handlers completos para aceitar, recusar e gerir a agenda.
7. **Verificação & Compilação**:
   - Executar `compile_applet` e `lint_applet` para assegurar integridade completa sem erros de tipo.
