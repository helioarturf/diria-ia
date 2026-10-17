import { UserDocument, LawyerReview, Lawyer, ConsultationRequest, LawyerScheduleEvent } from '../types';

export const INITIAL_USER_DOCUMENTS: UserDocument[] = [
  {
    id: 'doc-1',
    title: 'Reclamação Oficial à Inspecção Geral do Trabalho (IGT)',
    category: 'Direito Laboral',
    type: 'Minuta',
    createdAt: '12 de Outubro de 2026',
    updatedAt: '15 de Outubro de 2026',
    status: 'Finalizado',
    description: 'Denúncia e pedido de mediação urgente por cessação ilícita de contrato e cálculo de indemnização pecuniária nos termos da Lei 12/23.',
    fileSize: '14.2 KB',
    tags: ['Lei 12/23', 'IGT Luanda', 'Indemnização', 'Mediação'],
    content: `À INSPECÇÃO GERAL DO TRABALHO (IGT)
DELEGAÇÃO PROVINCIAL DE LUANDA
Sala de Mediação e Resolução de Conflitos Laborais

RECLAMANTE: [Nome Completo do Trabalhador], angolano, maior, titular do B.I. n.º 005432190LA042, residente no Município de Viana, Luanda, telefone +244 923 000 111.

RECLAMADA: [Denominação Social da Empresa Lda.], sociedade por quotas, com sede no Município de Talatona, Luanda, NIF 5418099231.

OBJECTO: DENÚNCIA POR DESPEDIMENTO SEM JUSTA CAUSA, RETENÇÃO DE CARTEIRA PROFISSIONAL E FALTA DE QUITAÇÃO DE CRÉDITOS LABORAIS (LEI N.º 12/23)

Vem expor e requerer a V. Exas. o seguinte:
1.º O Reclamante prestou serviço à Reclamada desde 1 de Fevereiro de 2022 até 30 de Setembro de 2026, exercendo a categoria de Técnico Superior, auferindo o vencimento mensal ilíquido de Kz 350.000,00.
2.º No dia 30 de Setembro de 2026, foi verbalmente comunicado da cessação imediata do vínculo sem prévia nota de culpa ou processo disciplinar, em total violação do Art.º 232.º da Lei Geral do Trabalho.
3.º Não foram liquidados os proporcionais de férias, subsídio de férias, 13.º mês e a respectiva compensação legal por antiguidade (Art.º 236.º da LGT).

Nestes termos, requer a notificação da Reclamada para a competente Sessão de Conciliação sob cominação da lei.

Luanda, aos 12 de Outubro de 2026.
O Reclamante`,
  },
  {
    id: 'doc-2',
    title: 'Carta de Interpelação Extrajudicial para Pagamento de Salários em Atraso',
    category: 'Direito Laboral',
    type: 'Notificação',
    createdAt: '08 de Outubro de 2026',
    updatedAt: '08 de Outubro de 2026',
    status: 'Finalizado',
    description: 'Interpelação formal com fixação de prazo peremptório de 8 dias úteis sob cominação de juros moratórios e acção judicial.',
    fileSize: '8.7 KB',
    tags: ['Interpelação', 'Salários', 'Mora Empregador'],
    content: `CARTA REGISTADA COM AVISO DE RECEPÇÃO / PROTOCOLO DIRECTO

A: Direcção Geral & Recursos Humanos de [Empresa Empregadora Lda.]
Endereço: Rua Rainha Ginga, Edifício Kilamba, 4.º Andar, Luanda - Angola

Assunto: INTERPELAÇÃO EXTRAJUDICIAL PARA PAGAMENTO DE REMUNERAÇÕES EM ATRASO E CRÉDITOS CONTRATUAIS

Exmos. Senhores,
Serve a presente missiva para, nos termos dos artigos 150.º e seguintes da Lei n.º 12/23 (Lei Geral do Trabalho), intimar V. Exas. a proceder à liquidação integral dos salários referentes aos meses decorridos e não quitados.

Fixa-se o prazo improrrogável de 8 (oito) dias úteis a contar da recepção desta para a regularização bancária dos montantes devidos, sob pena de recurso imediato à Sala de Trabalho do Tribunal de Comarca de Luanda e participação à IGT para instauração de auto de transgressão.

Com os melhores cumprimentos,
[Assinatura do Trabalhador / Mandatário]`,
  },
  {
    id: 'doc-3',
    title: 'Cálculo e Simulação de Rescisão Contratual (Lei n.º 12/23)',
    category: 'Direito Laboral',
    type: 'Cálculo Laboral',
    createdAt: '04 de Outubro de 2026',
    updatedAt: '04 de Outubro de 2026',
    status: 'Finalizado',
    description: 'Relatório discriminado de compensação por antiguidade (4 anos e 8 meses), aviso prévio, proporcionais de férias, subsídios e deduções de INSS.',
    fileSize: '6.1 KB',
    tags: ['Simulação', 'Compensação Art. 236', 'INSS 3%'],
    content: `MEMÓRIA DISCRIMINADA DE CÁLCULO DE RESCISÃO LABORAL
Conforme a Lei Geral do Trabalho de Angola (Lei n.º 12/23)

Dados do Vínculo:
- Salário-Base Mensal: Kz 350.000,00
- Antiguidade: 4 anos e 8 meses
- Cumprimento de Aviso Prévio: Não (devido pela empregadora)

Valores Apurados:
1. Compensação por Tempo de Serviço (Art.º 236.º): Kz 1.225.000,00
2. Salário de Aviso Prévio não concedido (30 dias): Kz 350.000,00
3. Férias Proporcionais não gozadas (8 meses): Kz 175.000,00
4. Subsídio de Férias Proporcional: Kz 175.000,00
5. Subsídio de Natal Proporcional (8 meses): Kz 233.333,33
Total Ilíquido: Kz 2.158.333,33
Dedução Obrigatória INSS (3%): Kz 64.750,00
Total Líquido Estimado a Receber: Kz 2.093.583,33`,
  },
  {
    id: 'doc-4',
    title: 'Contrato de Prestação de Serviços Jurídicos & Consultoria',
    category: 'Direito Comercial',
    type: 'Contrato',
    createdAt: '28 de Setembro de 2026',
    updatedAt: '02 de Outubro de 2026',
    status: 'Em Revisão',
    description: 'Minuta de contrato comercial com cláusulas de confidencialidade, tabela de honorários e foro da Comarca de Luanda.',
    fileSize: '18.4 KB',
    tags: ['Contrato', 'Honorários', 'Confidencialidade', 'Comarca Luanda'],
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS E CONSULTORIA FORENSE

ENTRE:
PRIMEIRO OUTORGANTE (CONTRATANTE): [Nome do Cliente / Denominação Comercial], NIF [Número de Identificação Fiscal], com sede em Luanda.
SEGUNDO OUTORGANTE (CONTRATADO): [Nome do Advogado / Sociedade de Advogados], com Cédula Profissional OAA n.º [Número], com escritório sito em Luanda.

É livremente acordado e reciprocamente aceite o presente contrato regido pelas seguintes cláusulas:

CLÁUSULA PRIMEIRA (OBJECTO):
O Segundo Outorgante obriga-se a prestar ao Primeiro Outorgante serviços de assessoria jurídica especializada no âmbito do contencioso societário e laboral.

CLÁUSULA SEGUNDA (HONORÁRIOS E DESPESAS):
1. A retribuição pelos serviços convencionados é fixada em regime misto (avença mensal de Kz [...] e honorários de sucesso de [...]%).

CLÁUSULA TERCEIRA (FORO COMPETENTE):
Para resolução de quaisquer litígios emergentes deste contrato, as partes elegem expressamente o foro da Comarca de Luanda, com renúncia a qualquer outro.

Feito em duplicado na Cidade de Luanda, aos 28 de Setembro de 2026.`,
  },
  {
    id: 'doc-5',
    title: 'Minuta de Procuração Forense com Poderes Gerais e Especiais',
    category: 'Direito Civil',
    type: 'Petição Forense',
    createdAt: '19 de Setembro de 2026',
    updatedAt: '19 de Setembro de 2026',
    status: 'Finalizado',
    description: 'Procuração forense com outorga de poderes para confessar, transigir, desistir e substabelecer perante qualquer Tribunal de Angola.',
    fileSize: '7.9 KB',
    tags: ['Procuração', 'OAA', 'Poderes Especiais', 'Tribunais'],
    content: `PROCURAÇÃO FORENSE

SAIBAM quantos este público instrumento de Procuração virem que:
[Outorgante], de nacionalidade angolana, titular do B.I. n.º [Número], residente em Luanda;
Constitui e nomeia seu bastante procurador o Ilustre Advogado Dr. [Nome do Advogado], portador da Cédula Profissional n.º [Número] da Ordem dos Advogados de Angola, com escritório sito em [Endereço],
A quem confere os mais amplos poderes forenses gerais em direito permitidos, e os especiais para confessar, desistir ou transigir em juízo ou fora dele, receber custas e indemnizações, e substabelecer com ou sem reserva.

Luanda, aos [Data].`,
  },
];

export const INITIAL_LAW_FIRMS: Lawyer[] = [
  {
    id: 'firm-1',
    name: 'Talatona Legal Partners - Sociedade de Advogados, RL',
    oaaNumber: 'SOC-104/OAA',
    location: 'Talatona, Luanda (Via S8, Edifício Platinum)',
    specialty: 'Comercial, Fiscal, Petróleo & Gás, M&A',
    phone: '+244 923 100 800',
    email: 'contacto@talatonalegal.ao',
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
    available: true,
    entityType: 'Sociedade de Advogados / Escritório',
    province: 'Luanda',
    address: 'Via S8, Condomínio Platinum Park, Bloco B, Talatona',
    bio: 'Sociedade de advogados líder em operações corporativas transfronteiriças, arbitragem comercial e estruturação fiscal em Angola.',
    website: 'https://talatonalegal.ao',
    verifiedOaa: true,
    rating: 4.9,
    reviewCount: 38,
    isFavorite: true,
  },
  {
    id: 'firm-2',
    name: 'Faria, Ndaliko & Associados - Sociedade Civil de Advogados',
    oaaNumber: 'SOC-078/OAA',
    location: 'Ingombota, Luanda (Largo do Kinaxixi)',
    specialty: 'Laboral, Contencioso Cível & Mediação IGT',
    phone: '+244 912 900 440',
    email: 'geral@fariandaliko.ao',
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&auto=format&fit=crop&q=80',
    available: true,
    entityType: 'Sociedade de Advogados / Escritório',
    province: 'Luanda',
    address: 'Largo do Kinaxixi, Edifício Vernon, 5.º Andar',
    bio: 'Referência angolana em litígios laborais, indemnizações, reestruturação empresarial e negociação colectiva.',
    website: 'https://fariandaliko.ao',
    verifiedOaa: true,
    rating: 4.8,
    reviewCount: 29,
    isFavorite: false,
  },
  {
    id: 'firm-3',
    name: 'Benguela & Litoral Advocacia Associada',
    oaaNumber: 'SOC-042/OAA',
    location: 'Benguela, Centro & Lobito',
    specialty: 'Direito Marítimo, Portuário, Comercial & Terras',
    phone: '+244 934 771 220',
    email: 'secretaria@benguelaadvogados.ao',
    photoUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=300&auto=format&fit=crop&q=80',
    available: true,
    entityType: 'Sociedade de Advogados / Escritório',
    province: 'Benguela',
    address: 'Avenida Norton de Matos, Prédio Lusitânia, 2.º Andar, Benguela',
    bio: 'Escritório regional de referência em questões alfandegárias, portuárias, logística e contencioso imobiliário.',
    website: 'https://benguelaadvogados.ao',
    verifiedOaa: true,
    rating: 4.7,
    reviewCount: 19,
    isFavorite: false,
  },
];

export const INITIAL_LAWYER_REVIEWS: LawyerReview[] = [
  {
    id: 'rev-1',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    authorName: 'Paulo Miranda',
    authorRole: 'Empresário / Luanda',
    rating: 5,
    date: '10 de Outubro de 2026',
    comment: 'O Dr. António conduziu o processo de rescisão com enorme mestria técnica. Explicou cada detalhe da Lei 12/23 e conseguimos o acordo de quitação na mediação sem precisar de anos em tribunal.',
    tags: ['Muito Recomendado', 'Resolução Rápida', 'Direito Laboral'],
    criteria: {
      clarity: 5,
      efficiency: 5,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-2',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    authorName: 'Maria Domingos',
    authorRole: 'Directora de RH',
    rating: 5,
    date: '28 de Setembro de 2026',
    comment: 'Excelente parecer forense emitido para a nossa empresa em Viana. Rigoroso e com base nos preceitos vigentes da OAA.',
    tags: ['Parecer Técnico', 'Pontualidade'],
    criteria: {
      clarity: 5,
      efficiency: 4,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-3',
    lawyerId: 'lawyer-2',
    lawyerName: 'Dra. Kátia dos Santos',
    authorName: 'Edivaldo Gaspar',
    authorRole: 'Técnico Especialista',
    rating: 5,
    date: '14 de Outubro de 2026',
    comment: 'A Dra. Kátia é imbatível na mediação da IGT. Estava com salários retidos há 5 meses e em menos de duas semanas a empregadora liquidou a indemnização total!',
    tags: ['Mediação IGT', 'Recuperação de Créditos', 'Assertiva'],
    criteria: {
      clarity: 5,
      efficiency: 5,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-4',
    lawyerId: 'lawyer-2',
    lawyerName: 'Dra. Kátia dos Santos',
    authorName: 'Sara Kembua',
    authorRole: 'Cidadã / Belas',
    rating: 4,
    date: '20 de Setembro de 2026',
    comment: 'Muito atenciosa e clara na explicação dos artigos da nova lei do trabalho. Recomendo com toda a certeza.',
    tags: ['Atenciosa', 'Clareza Jurídica'],
    criteria: {
      clarity: 5,
      efficiency: 4,
      resolution: 4,
    },
    verified: true,
  },
  {
    id: 'rev-5',
    lawyerId: 'firm-1',
    lawyerName: 'Talatona Legal Partners - Sociedade de Advogados, RL',
    authorName: 'Dr. Jaime Figueiredo',
    authorRole: 'Gestor de Fundos de Investimento',
    rating: 5,
    date: '05 de Outubro de 2026',
    comment: 'Estruturação societária de altíssimo padrão. A equipa de Talatona tem uma visão internacional combinada com profundo domínio da lei fiscal angolana e BNA.',
    tags: ['Sociedade de Topo', 'Direito Societário', 'M&A'],
    criteria: {
      clarity: 5,
      efficiency: 5,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-6',
    lawyerId: 'firm-2',
    lawyerName: 'Faria, Ndaliko & Associados - Sociedade Civil de Advogados',
    authorName: 'Armando Caxito',
    authorRole: 'Engenheiro Civil',
    rating: 5,
    date: '02 de Outubro de 2026',
    comment: 'Contratámos o escritório para defender um litígio colectivo de 18 trabalhadores. A defesa elaborada foi brilhante e todos receberam os seus direitos.',
    tags: ['Defesa Colectiva', 'Honorários Transparentes', 'Tribunais'],
    criteria: {
      clarity: 5,
      efficiency: 4,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-7',
    lawyerId: 'lawyer-3',
    lawyerName: 'Dr. Mateus Cassoma',
    authorName: 'Inês Tavares',
    authorRole: 'Sócia Gerente',
    rating: 5,
    date: '25 de Setembro de 2026',
    comment: 'Elaborou os estatutos da nossa sociedade comercial e os contratos com fornecedores em tempo recorde. Muito profissional.',
    tags: ['Comercial', 'Estatutos', 'Ágil'],
    criteria: {
      clarity: 5,
      efficiency: 5,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-8',
    lawyerId: 'lawyer-4',
    lawyerName: 'Dra. Esperança Muafumo',
    authorName: 'Manuel Chissingui',
    authorRole: 'Utente / Viana',
    rating: 5,
    date: '18 de Setembro de 2026',
    comment: 'Muito humana e experiente em questões sucessórias e partilha de bens em Luanda. Conseguiu resolver tudo em harmonia familiar.',
    tags: ['Família & Sucessões', 'Empatia', 'Dedicação'],
    criteria: {
      clarity: 5,
      efficiency: 5,
      resolution: 5,
    },
    verified: true,
  },
  {
    id: 'rev-9',
    lawyerId: 'firm-3',
    lawyerName: 'Benguela & Litoral Advocacia Associada',
    authorName: 'Bernardo Samahina',
    authorRole: 'Armador & Operador Logístico',
    rating: 5,
    date: '12 de Setembro de 2026',
    comment: 'O melhor escritório de Benguela e Lobito para direito marítimo e aduaneiro. Apoio permanente e muito seguro.',
    tags: ['Benguela', 'Direito Aduaneiro', 'Logística'],
    criteria: {
      clarity: 5,
      efficiency: 4,
      resolution: 5,
    },
    verified: true,
  },
];

export const INITIAL_CONSULTATION_REQUESTS: ConsultationRequest[] = [
  {
    id: 'req-1',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    clientName: 'Mateus Gaspar Kilamba',
    clientPhone: '+244 923 881 902',
    preferredDate: '2026-10-20',
    scheduledDate: '2026-10-20',
    scheduledTime: '10:30',
    modality: 'Presencial',
    subject: 'Despedimento colectivo e falta de quitação de indemnização na fábrica de Viana (Art.º 232.º e 236.º da LGT)',
    status: 'Confirmada',
    createdAt: '15 de Outubro de 2026',
    caseNotes: 'Cliente tem 5 anos e 2 meses de antiguidade. Reclamou à IGT mas precisa de patrocínio judiciário para a Sala de Trabalho.',
    estimatedFee: 'Kz 250.000,00',
  },
  {
    id: 'req-2',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    clientName: 'Dra. Sandra de Carvalho',
    clientPhone: '+244 912 334 550',
    preferredDate: '2026-10-22',
    modality: 'Videoconferência (Online)',
    subject: 'Revisão urgente de cláusula de não-concorrência e exclusividade em contrato de administração',
    status: 'Pendente',
    createdAt: '16 de Outubro de 2026',
    caseNotes: 'Aguardando validação da disponibilidade de agenda na próxima quinta-feira.',
  },
  {
    id: 'req-3',
    lawyerId: 'firm-1',
    lawyerName: 'Talatona Legal Partners - Sociedade de Advogados, RL',
    clientName: 'Eng. Rui Calandula',
    clientPhone: '+244 934 700 812',
    preferredDate: '2026-10-24',
    scheduledDate: '2026-10-24',
    scheduledTime: '15:00',
    modality: 'Presencial',
    subject: 'Constituição de sociedade por quotas com investimento misto estrangeiro e registo no BNA',
    status: 'Confirmada',
    createdAt: '14 de Outubro de 2026',
    caseNotes: 'Reunião de pré-enquadramento agendada na Sala VIP do Edifício Platinum Park.',
    estimatedFee: 'Kz 600.000,00',
  },
  {
    id: 'req-4',
    lawyerId: 'lawyer-2',
    lawyerName: 'Dra. Kátia dos Santos',
    clientName: 'Afonso Kiala Pedro',
    clientPhone: '+244 940 119 443',
    preferredDate: '2026-10-18',
    modality: 'Presencial',
    subject: 'Atraso reiterado de salários há 4 meses e pedido de rescisão com justa causa pelo trabalhador',
    status: 'Pendente',
    createdAt: '16 de Outubro de 2026',
    caseNotes: 'Caso urgente com iminência de prescrição dos prazos da IGT.',
  },
  {
    id: 'req-5',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    clientName: 'Carlos Manuel Sebastião',
    clientPhone: '+244 919 448 221',
    preferredDate: '2026-10-10',
    scheduledDate: '2026-10-10',
    scheduledTime: '11:00',
    modality: 'Presencial',
    subject: 'Parecer para suspensão preventiva em procedimento disciplinar',
    status: 'Realizada',
    createdAt: '08 de Outubro de 2026',
    caseNotes: 'Consulta realizada. Auto de conciliação obtido com sucesso perante a IGT Luanda.',
    estimatedFee: 'Kz 180.000,00',
  },
];

export const INITIAL_SCHEDULE_EVENTS: LawyerScheduleEvent[] = [
  {
    id: 'ev-1',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    title: 'Sessão de Mediação IGT Luanda (Sala 3)',
    type: 'Mediação IGT',
    date: '2026-10-20',
    time: '09:30',
    location: 'Delegação Provincial da IGT, Mutamba, Luanda',
    clientName: 'Carlos Manuel Sebastião vs Empreiteira Lda.',
    status: 'Agendado',
    notes: 'Levar cópias autenticadas da folha de remunerações e cartão de segurado do INSS.',
  },
  {
    id: 'ev-2',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    title: 'Consulta Presencial com Novo Mandante',
    type: 'Consulta Cliente',
    date: '2026-10-20',
    time: '10:30',
    location: 'Escritório Ingombota, Rua Rainha Ginga',
    clientName: 'Mateus Gaspar Kilamba',
    status: 'Agendado',
    notes: 'Análise documental de despedimento sem justa causa.',
  },
  {
    id: 'ev-3',
    lawyerId: 'lawyer-1',
    lawyerName: 'Dr. António Bemba',
    title: 'Audiência de Julgamento - Sala de Trabalho',
    type: 'Audiência Judicial',
    date: '2026-10-23',
    time: '11:00',
    location: 'Tribunal de Comarca de Luanda (Palácio D. Ana Joaquina)',
    clientName: 'Processo n.º 412/26-ST',
    status: 'Agendado',
    notes: 'Inquirição das testemunhas arroladas na petição inicial.',
  },
  {
    id: 'ev-4',
    lawyerId: 'firm-1',
    lawyerName: 'Talatona Legal Partners',
    title: 'Reunião de Assembleia Extraordinária & Sócios',
    type: 'Reunião de Sócios',
    date: '2026-10-21',
    time: '14:30',
    location: 'Edifício Platinum Park, Bloco B, Talatona',
    clientName: 'Grupo Agro-Industrial Kwanza Sul',
    status: 'Agendado',
    notes: 'Deliberação de aumento de capital social por entradas em espécie.',
  },
  {
    id: 'ev-5',
    lawyerId: 'lawyer-2',
    lawyerName: 'Dra. Kátia dos Santos',
    title: 'Diligência perante a Conservatória do Registo Comercial',
    type: 'Diligência Notarial / Registo',
    date: '2026-10-19',
    time: '10:00',
    location: 'Guichet Único da Empresa (GUE), Luanda',
    clientName: 'Sociedade Mineira do Cuango Lda.',
    status: 'Agendado',
    notes: 'Registo e publicação no Diário da República III Série.',
  },
];

