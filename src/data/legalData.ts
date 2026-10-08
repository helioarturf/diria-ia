import { Lawyer, LegalCode } from '../types';

export const INITIAL_LAWYERS: Lawyer[] = [
  {
    id: 'lawyer-1',
    name: 'Dr. António Bemba',
    oaaNumber: '4120',
    location: 'Ingombota, Luanda',
    specialty: 'Laboral & Contencioso',
    phone: '+244 923 445 110',
    email: 'antonio.bemba.adv@oaa.ao',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3bXFr46db8P63idUcGifJg_U0ROSIVXJRsoUijBTeOf8Rq0_efwqGMxYyyEhRh9-3Zl3YmQnWbLgo3B18TneFQRJqc8-u7BpPqFgdoMQ5gtKh_22Q4ch4X19tRcFIPKUyN_9o3iLwY19N7wofxAdFA4M1Vuhc9uC2qGJDqdEtQ1L9O7r_cyJdpRrGg8RPxcA2UEg3T-PBIqx0NAZa0N7PSLXz4AHCen_iA8RtpdU',
    available: true,
  },
  {
    id: 'lawyer-2',
    name: 'Dra. Kátia dos Santos',
    oaaNumber: '892',
    location: 'Talatona, Luanda',
    specialty: 'Mediação IGT & Indemnizações',
    phone: '+244 912 788 340',
    email: 'katia.santos@oaa.ao',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_FMNZRMcXpiPvIfhONk5QrjrQqgSM-h9YM7wyUPhT3Bj1k-dqoMaZAqXMfmygWDHstaRda76NtoL8UALir6njNAPJ8ShuoWaRkpDH2KAhU6H1ZcOoQHmEFY5CQqfkPB5ED1eXlEX06ZTitCh-DMCNJfTwGAR12MCm4liDtiL6qz6Xv0DbIzFKxj3PkBcp9etQJenUW_xyC459pB8CPuzeZAg1KjKhFGjW3LHFJF4',
    available: true,
  },
  {
    id: 'lawyer-3',
    name: 'Dr. Mateus Cassoma',
    oaaNumber: '5312',
    location: 'Maianga, Luanda',
    specialty: 'Comercial, Fiscal & M&A',
    phone: '+244 934 512 889',
    email: 'm.cassoma@advocaciangola.ao',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'lawyer-4',
    name: 'Dra. Esperança Muafumo',
    oaaNumber: '3104',
    location: 'Viana, Luanda',
    specialty: 'Trabalho, Família & Sucessões',
    phone: '+244 925 109 231',
    email: 'esperanca.muafumo@oaa.ao',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'lawyer-5',
    name: 'Dr. João Baptista Ndaliko',
    oaaNumber: '2750',
    location: 'Benguela, Centro',
    specialty: 'Penal Económico & Contratos',
    phone: '+244 940 221 773',
    email: 'j.ndaliko@oaa.ao',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'lawyer-6',
    name: 'Dra. Carla Chitumba',
    oaaNumber: '4419',
    location: 'Lubango, Huíla',
    specialty: 'Direito Imobiliário & Terras',
    phone: '+244 919 883 450',
    email: 'carla.chitumba@oaa.ao',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    available: true,
  },
];

export const ANGOLAN_LEGAL_CODES: LegalCode[] = [
  {
    id: 'lgt-12-23',
    title: 'Lei Geral do Trabalho',
    number: 'Lei n.º 12/23',
    promulgationYear: '2023 (Em vigor desde Março 2024)',
    category: 'Direito Laboral',
    status: 'Vigente',
    description: 'Diploma estruturante que revogou a Lei 7/15. Regula contratos de trabalho, indemnizações por despedimento, teletrabalho, licenças de parentalidade e direitos do trabalhador.',
    keyArticles: [
      {
        article: 'Art.º 232.º',
        topic: 'Despedimento Individual por Justa Causa e Ilicitude',
        summary: 'Determina que a cessação sem justa causa comprovada confere compensação pecuniária por antiguidade e salários devidos.',
      },
      {
        article: 'Art.º 236.º',
        topic: 'Cálculo da Compensação por Despedimento',
        summary: 'Fixa a fórmula de compensação graduada em função do salário-base e tempo de antiguidade na empresa.',
      },
      {
        article: 'Art.º 208.º',
        topic: 'Aviso Prévio de Rescisão',
        summary: 'Obrigatoriedade de comunicação prévia de 30 a 60 dias conforme a categoria profissional.',
      },
      {
        article: 'Art.º 127.º',
        topic: 'Direito a Férias e Retribuição',
        summary: '22 dias úteis de férias remuneradas com subsídio de férias correspondente a 100% do salário-base.',
      },
    ],
  },
  {
    id: 'cra-2010',
    title: 'Constituição da República de Angola',
    number: 'CRA 2010 (Revista pela Lei 18/21)',
    promulgationYear: '2010 / 2021',
    category: 'Direito Constitucional',
    status: 'Vigente',
    description: 'Lei Magna de Angola. Garante o Estado Democrático de Direito, direitos, liberdades e garantias fundamentais, acesso ao direito e tutela jurisdicional efectiva.',
    keyArticles: [
      {
        article: 'Art.º 29.º',
        topic: 'Acesso ao Direito e Tutela Jurisdicional Efectiva',
        summary: 'A todos é assegurado o acesso ao direito e aos tribunais para defesa dos seus direitos e interesses legalmente protegidos.',
      },
      {
        article: 'Art.º 76.º',
        topic: 'Trabalho e Direitos dos Trabalhadores',
        summary: 'O trabalho é um direito e um dever de todos. Todo o trabalhador tem direito a retribuição justa, descanso e segurança no trabalho.',
      },
      {
        article: 'Art.º 193.º',
        topic: 'Advocacia e Ordem dos Advogados de Angola',
        summary: 'A advocacia é uma instituição essencial à administração da justiça, gozando os advogados de imunidades necessárias.',
      },
    ],
  },
  {
    id: 'codigo-penal',
    title: 'Código Penal Angolano',
    number: 'Lei n.º 38/20',
    promulgationYear: '2020',
    category: 'Direito Penal',
    status: 'Vigente',
    description: 'Código penal moderno que substituiu o secular código de 1886. Tipifica crimes contra pessoas, património, ordem económica, corrupção e crimes informáticos.',
    keyArticles: [
      {
        article: 'Art.º 340.º',
        topic: 'Apropriação e Retenção Ilícita de Documentos',
        summary: 'Criminaliza a retenção arbitrária de documentos de identificação ou profissionais de terceiros.',
      },
      {
        article: 'Art.º 360.º',
        topic: 'Coacção e Ameaça',
        summary: 'Proíbe a intimidação ou constrangimento ilegítimo de outrem para omitir o exercício de direitos civis ou queixa à autoridade.',
      },
    ],
  },
  {
    id: 'sociedades-comerciais',
    title: 'Lei das Sociedades Comerciais',
    number: 'Lei n.º 1/04',
    promulgationYear: '2004',
    category: 'Direito Comercial',
    status: 'Vigente',
    description: 'Regula a constituição, funcionamento e dissolução de sociedades em nome colectivo, por quotas (Lda), unipessoais e anónimas (SA) na República de Angola.',
    keyArticles: [
      {
        article: 'Art.º 214.º',
        topic: 'Sociedades por Quotas e Capital Social',
        summary: 'Requisitos de constituição, divisão de quotas e responsabilidade limitada ao valor das quotas subscritas.',
      },
      {
        article: 'Art.º 270.º',
        topic: 'Sociedade Unipessoal por Quotas',
        summary: 'Permite a constituição de sociedade comercial por um único sócio pessoa singular ou colectiva.',
      },
    ],
  },
  {
    id: 'arrendamento-urbano',
    title: 'Regime Jurídico do Arrendamento Urbano',
    number: 'Lei n.º 26/15',
    promulgationYear: '2015',
    category: 'Direito Civil & Imobiliário',
    status: 'Vigente',
    description: 'Regula contratos de arrendamento para habitação e para fins comerciais na província de Luanda e demais províncias angolanas.',
    keyArticles: [
      {
        article: 'Art.º 18.º',
        topic: 'Rendas e Pagamento Antecipado',
        summary: 'Fixa os limites de antecipação de rendas exigíveis pelo senhorio e regras de recibo de quitação.',
      },
      {
        article: 'Art.º 35.º',
        topic: 'Oposição à Renovação e Prazos de Denúncia',
        summary: 'Exige notificação escrita e prazos de antecedência para denúncia unilateral do contrato de arrendamento.',
      },
    ],
  },
];

export const PRESET_DRAFTS = [
  {
    id: 'draft-igt',
    title: 'Reclamação à Inspecção Geral do Trabalho (IGT)',
    category: 'Laboral',
    badge: 'Lei n.º 12/23',
    description: 'Minuta oficial para apresentar denúncia e pedido de mediação urgente por falta de pagamento ou despedimento sem justa causa.',
    content: `À INSPECÇÃO GERAL DO TRABALHO (IGT)
DELEGAÇÃO PROVINCIAL DE LUANDA
Sala de Mediação e Conciliação de Conflitos Laborais

RECLAMANTE: [Nome Completo do Trabalhador], de nacionalidade angolana, portador do B.I. n.º [Número do B.I.], emitido em Luanda, residente em [Bairro/Município, ex: Viana, Luanda], contacto: [Telefone/E-mail].

RECLAMADA: [Denominação Social da Empresa / Entidade Empregadora], com sede em [Endereço da Empresa], NIF [Número de Identificação Fiscal], representada pelo seu corpo directivo.

OBJECTO: DENÚNCIA POR DESPEDIMENTO ILÍCITO SEM PRÉ-AVISO, RETENÇÃO DE CARTEIRA PROFISSIONAL E FALTA DE QUITAÇÃO DE CRÉDITOS LABORAIS

Vem mui respeitosamente expor e requerer a V. Exas. o seguinte:

1.º
O Reclamante foi admitido ao serviço da Reclamada em [Data de Admissão], para exercer as funções de [Função/Cargo], auferindo ultimamente a retribuição mensal base de [Valor em Kwanzas, ex: Kz 250.000,00].

2.º
No dia [Data do Despedimento], o Reclamante foi sumariamente impedido de aceder ao seu posto de trabalho e notificado verbalmente da cessação unilateral das funções, sem qualquer nota de culpa, processo disciplinar ou aviso prévio legal, em manifesta violação ao disposto no Art.º 232.º da Lei Geral do Trabalho (Lei n.º 12/23).

3.º
Ademais, a Entidade Empregadora recusa-se a devolver a Carteira de Trabalho do Reclamante e a emitir as respectivas Guias de Segurança Social (INSS), coagindo o Reclamante com ameaças inadmissíveis, constituindo grave contra-ordenação laboral nos termos legais.

4.º
O Reclamante tem a receber:
a) Indemnização por cessação do contrato de trabalho por tempo de serviço (Art. 236.º da LGT): Kz [Valor];
b) Compensação por falta de aviso prévio (Art. 208.º da LGT): Kz [Valor];
c) Proporcionais de férias e subsídio de férias vencidas: Kz [Valor];
d) Proporcional de subsídio de Natal: Kz [Valor].

TERMOS EM QUE,
Requer a V. Exas. se dignem notificar a Reclamada para a competente Sessão de Conciliação e Mediação neste órgão, e, caso persista a recusa, seja lavrado o respectivo Auto de Notícia e emitida certidão para efeitos de propositura de Acção na Sala de Trabalho do Tribunal de Comarca.

Pede Deferimento.
Luanda, aos [Dia] de [Mês] de [Ano].

__________________________________________
[Assinatura do Reclamante]`,
  },
  {
    id: 'draft-interpelacao',
    title: 'Carta de Interpelação Extrajudicial ao Empregador',
    category: 'Laboral',
    badge: 'Art.º 232.º LGT',
    description: 'Notificação formal com prazo peremptório de 5 a 8 dias úteis para pagamento de salários e devolução de pertences sob cominação legal.',
    content: `CARTA REGISTADA COM AVISO DE RECEPÇÃO / ENTREGA PROTOCOLADA

A: [Nome da Empresa Empregadora]
Ao cuidado da Direcção de Recursos Humanos e Administração
Endereço: [Rua, Bairro, Município, Luanda]

DE: [Nome do Trabalhador]
B.I. n.º [Número do BI]
Residente em: [Endereço]

ASSUNTO: INTERPELAÇÃO EXTRAJUDICIAL PARA PAGAMENTO DE CRÉDITOS LABORAIS E RESTITUIÇÃO IMEDIATA DE DOCUMENTOS PESSOAIS

Exmos. Senhores,

Serve a presente para interpelar formalmente essa entidade patronal relativamente à cessação ilícita do contrato individual de trabalho outorgado com o signatário, ocorrida em [Data], sem observância dos ditames imperativos da Lei Geral do Trabalho de Angola (Lei n.º 12/23, de 27 de Dezembro).

Constatando-se que até à presente data não foram liquidadas as quantias legalmente devidas a título de compensação por antiguidade, remuneração compensatória de pré-aviso em falta, bem como proporcionais de férias e subsídio de Natal;

E considerando, outrossim, que foi retida indevidamente por essa empresa a Carteira de Trabalho e declarações conexas, constituindo acto ilegítimo tipificado na legislação pátria;

Fica V. Exa. formalmente INTERPELADA para, no prazo impreterível de 5 (cinco) dias úteis a contar da recepção desta, proceder a:
1. Depósito integral dos créditos laborais na conta bancária IBAN [Inserir IBAN];
2. Entrega imediata da Carteira de Trabalho devidamente actualizada.

Decorrido o prazo supra sem a devida regularização, serão de imediato acionadas as instâncias competentes, designadamente a Inspecção Geral do Trabalho (IGT) e a Sala do Trabalho da Comarca de Luanda, com o consequente apuramento de juros de mora e responsabilidades civis e disciplinares conexas.

Sem outro assunto de momento, subscrevo-me com a máxima consideração.

Luanda, aos [Dia] de [Mês] de [Ano].

__________________________________________
[Nome e Assinatura do Trabalhador]`,
  },
  {
    id: 'draft-arrendamento',
    title: 'Contrato de Arrendamento Urbano para Habitação',
    category: 'Civil & Imobiliário',
    badge: 'Lei n.º 26/15',
    description: 'Minuta completa nos termos da Lei do Arrendamento Urbano de Angola com estipulação de renda, caução e cláusulas resolutivas.',
    content: `CONTRATO DE ARRENDAMENTO URBANO PARA FINS HABITACIONAIS
(Ao abrigo da Lei n.º 26/15, Regime Jurídico do Arrendamento Urbano de Angola)

ENTRE OS OUTORGANTES:

PRIMEIRO OUTORGANTE (SENHORIO): [Nome do Senhorio], [Estado Civil], portador do B.I. n.º [Número], emitido em [Local], NIF [Número], residente em [Endereço Completo].

SEGUNDO OUTORGANTE (INQUILINO): [Nome do Inquilino], [Estado Civil], portador do B.I. n.º [Número], emitido em [Local], NIF [Número], residente em [Endereço Completo].

É reciprocamente acordado e outorgado o presente contrato que se rege pelas cláusulas seguintes:

CLÁUSULA PRIMEIRA (Objecto):
O Primeiro Outorgante é legítimo proprietário e possuidor do imóvel sito em [Morada Completa do Imóvel, Município e Província], que dá de arrendamento ao Segundo Outorgante exclusivamente para fins habitacionais.

CLÁUSULA SEGUNDA (Prazo e Renovação):
O arrendamento é celebrado pelo prazo certo de [1 ou 2] ano(s), com início em [Data de Início] e termo em [Data de Fim], renovando-se automaticamente por iguais períodos caso não seja denunciado com a antecedência legal prevista no Art. 35.º da Lei 26/15.

CLÁUSULA TERCEIRA (Renda e Pagamento):
1. A renda mensal é fixada no montante de Kz [Valor em algarismos] ([Valor por extenso em Kwanzas]).
2. A renda deve ser paga até ao dia [1 a 8] do mês anterior àquele a que disser respeito, mediante transferência bancária para o IBAN [Inserir IBAN].

CLÁUSULA QUARTA (Caução):
Na data de assinatura deste instrumento, o Inquilino entrega a quantia de Kz [Valor] a título de caução destinada a garantir o bom estado de conservação do imóvel.

Feito em Luanda, em dois exemplares de igual valor probatório, aos [Dia] de [Mês] de [Ano].

PRIMEIRO OUTORGANTE: _____________________________________
SEGUNDO OUTORGANTE: _____________________________________`,
  },
  {
    id: 'draft-procuracao',
    title: 'Procuração Forense para Advogado da OAA',
    category: 'Forense',
    badge: 'CRA Art. 193.º',
    description: 'Instrumento de mandato judicial outorgando poderes forenses gerais e especiais para representação em Tribunais Angolanos.',
    content: `PROCURAÇÃO FORENSE

SAIBAM quantos este público instrumento de procuração virem que no dia [Data], compareceu perante o Cartório Notarial da Comarca de Luanda:

MANDANTE: [Nome Completo], de nacionalidade angolana, maior, estado civil [Estado Civil], portador do Bilhete de Identidade n.º [Número de BI], emitido pelo Arquivo de Identificação de Luanda, em [Data de Emissão], residente habitual em [Endereço, Província de Luanda].

Pelo presente instrumento, constitui seus bastantes procuradores com reserva de substabelecer:
MANDATÁRIO: Dr. [Nome do Advogado], Advogado inscrito na Ordem dos Advogados de Angola sob a Cédula Profissional n.º [Número da Cédula], com escritório profissional sito na Rua [Endereço do Escritório], Luanda.

A quem confere os mais amplos poderes forenses em direito permitidos, incluindo os gerais de representação judiciária e os especiais para:
a) Propor quaisquer acções cíveis, laborais, tributárias ou administrativas perante os Tribunais da República de Angola;
b) Confessar, desistir, transigir, firmar acordos em sede de conciliação ou audiência preliminar;
c) Receber custas de parte, indemnizações e requerer certidões junto da Inspecção Geral do Trabalho, Direcções Provinciais e Conservatórias;
d) Substabelecer a presente procuração, no todo ou em parte, com ou sem reserva de iguais poderes.

Feito e aprovado em Luanda, República de Angola, aos [Dia] de [Mês] de [Ano].

__________________________________________
[Assinatura do Mandante]`,
  },
];
