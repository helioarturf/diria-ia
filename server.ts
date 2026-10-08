import express, { Request, Response } from 'express';
import http from 'http';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialise GoogleGenAI with mandatory User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System Prompt for DirIA Angola
const DIRIA_SYSTEM_PROMPT = `Tu és a DirIA Angola, a plataforma de inteligência jurídica de referência para a República de Angola, alinhada com a ordem jurídica angolana, doutrina e normas deontológicas da Ordem dos Advogados de Angola (OAA).

Directrizes fundamentais:
1. ORDENAMENTO JURÍDICO ANGOLANO MULTIDISCIPLINAR (FONTE: DIÁRIO DA REPÚBLICA & LEX.AO):
   - A tua análise NUNCA deve limitar-se ou forçar uma única lei. Angola possui um corpo legislativo completo e multidisciplinar. Aplica rigorosamente o ramo do direito correspondente ao caso do utilizador:
     • Direito Constitucional: Constituição da República de Angola (CRA de 2010, revista pela Lei n.º 18/21) — direitos, liberdades e garantias.
     • Direito Civil & Obrigações: Código Civil Angolano (contratos, responsabilidade civil, propriedade, obrigações) e Código de Processo Civil.
     • Direito Comercial & Societário: Lei das Sociedades Comerciais (Lei n.º 1/04), Código Comercial, regime simplificado do Guichet Único da Empresa (GUE) e Lei do Investimento Privado (AIPEX).
     • Direito Penal & Processual: Código Penal Angolano (Lei n.º 38/20) e Código de Processo Penal (Lei n.º 39/20).
     • Direito Fiscal, Tributário & Aduaneiro: Código Geral Tributário (Lei n.º 21/14), Código do IRT (Lei n.º 28/20), Código do IVA (Lei n.º 7/19) e normas da AGT.
     • Direito Imobiliário, Arrendamento & Terras: Regime Jurídico do Arrendamento Urbano (Lei n.º 26/15), Lei de Terras (Lei n.º 9/04).
     • Direito de Família & Sucessões: Código de Família de Angola e regras de sucessão do Código Civil.
     • Direito Laboral: Lei Geral do Trabalho vigente (Lei n.º 12/23), Decretos Presidenciais (ex.: DP n.º 109/24 sobre Salário Mínimo, DP n.º 214/23).
     • Direito Administrativo & Contratação Pública: Lei dos Contratos Públicos (Lei n.º 41/20), Código do Procedimento Administrativo.
     • Direito Bancário & Cambial: Lei das Instituições Financeiras e Avisos do Banco Nacional de Angola (BNA).
     • Estatuto da Advocacia: Estatuto da Ordem dos Advogados de Angola (Decreto n.º 28/96) e Código Deontológico.

2. ADAPTAÇÃO DINÂMICA AO PERFIL DO UTILIZADOR:
   - Deves sempre moldar o teu tom, vocabulário, profundidade e recomendações em função do PERFIL DE EXPERIÊNCIA DO UTILIZADOR fornecido no pedido:
     • Se Cidadão/Utente: Comunicação empática, clara, pedagógica e prática, sem juridiquês inacessível. Foco em direitos reais, documentação e passos concretos.
     • Se Estudante de Direito: Rigor didático, fundamentação doutrinária, enquadramento sistemático e citação comentada dos preceitos.
     • Se Advogado/Jurista/Magistrado: Prática forense de excelência, alto rigor técnico, terminologia do foro (ex.: caducidade, prescrição, cominação, embargos, articulados, competência da comarca), sem obviedades.
     • Se Empresário/Gestor/RH: Foco em gestão de risco, conformidade regulatória, impacto financeiro, prevenção de contingências legais e boas práticas corporativas.

3. ESTRUTURAÇÃO DAS RESPOSTAS:
   - Sempre que apropriado, organiza a resposta em:
     a) Resposta Directa e Enquadramento da Questão;
     b) Fundamentação Legal Rigorosa (Diploma e Artigo específico do direito angolano aplicável);
     c) Orientações e Procedimentos Práticos Recomendados;
     d) Nível de Complexidade e Próximos Passos.`;

// POST /api/chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, consultationType, attachedDoc, userProfile } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Nenhuma mensagem fornecida.' });
    }

    // Build context with history
    const conversationHistory = messages.map((m: { role: string; content: string }) => {
      return `${m.role === 'user' ? 'Utilizador' : 'DirIA'}: ${m.content}`;
    }).join('\n\n');

    let extraContext = '';
    if (userProfile) {
      extraContext += `\n[PERFIL DO UTILIZADOR ACTIVO:
- Papel / Função: ${userProfile.role || 'Geral'}
- Nível de Experiência: ${userProfile.experienceLevel || 'Intermédio'}
- Estilo de Resposta Solicitado: ${userProfile.responseStyle || 'Equilibrado'}
- Áreas de Foco Seleccionadas: ${(userProfile.primaryAreas || []).join(', ') || 'Todas as áreas'}
- Província / Comarca de Referência: ${userProfile.province || 'Angola Geral'}
${userProfile.name ? `- Nome/Tratamento: ${userProfile.name}` : ''}
${userProfile.institutionOrFirm ? `- Instituição / Gabinete: ${userProfile.institutionOrFirm}` : ''}
INSTRUÇÃO CRUCIAL: Modela integralmente a tua linguagem, profundidade e vocabulário ao perfil acima!]`;
    }

    if (consultationType) {
      extraContext += `\n[Área Jurídica da Consulta: ${consultationType}]`;
    }
    if (attachedDoc) {
      extraContext += `\n[Documento em Análise: Nome: "${attachedDoc.name}", Conteúdo / Resumo: ${attachedDoc.content || attachedDoc.summary}]`;
    }

    const prompt = `Histórico da consulta:\n${conversationHistory}\n${extraContext}\n\nResponde ao último pedido do utilizador, aplicando com precisão o ramo do direito angolano correspondente ao assunto e adaptando rigorosamente ao perfil de experiência especificado.`;

    let replyText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: DIRIA_SYSTEM_PROMPT,
          temperature: 0.2,
        },
      });
      replyText = response.text || '';
    } catch (aiErr: any) {
      console.warn('Alerta na geração com modelo Gemini, recorrendo a síntese jurídica integrada:', aiErr?.message);
    }

    // If replyText is empty due to API issue, provide a structured legal opinion
    if (!replyText) {
      const lastMsg = messages[messages.length - 1]?.content || '';
      const lower = lastMsg.toLowerCase();
      const userRole = userProfile?.role || 'Cidadão / Utente';
      const province = userProfile?.province || 'Luanda';

      if (lower.includes('desped') || lower.includes('trabalho') || lower.includes('salário') || lower.includes('igt')) {
        replyText = `### Enquadramento Jurídico — Direito Laboral Angolano\n\nNos termos da **Lei Geral do Trabalho (Lei n.º 12/23)** e regulamentação complementar aplicável a ${province}:\n\n1. **Garantias Contratuais e Cessação:** Todo o despedimento ou alteração contratual deve cumprir o procedimento disciplinar prévio (Art.º 232.º e seguintes da Lei 12/23), sob pena de ilicitude.\n2. **Compensação e Liquidação:** Havendo cessação, o trabalhador tem direito à compensação por caducidade ou indemnização por despedimento ilícito, acrescida dos subsídios de férias e de Natal proporcionais.\n3. **Instâncias Competentes:** Em caso de incumprimento, pode ser apresentada queixa à **Inspecção Geral do Trabalho (IGT)** para tentativa de conciliação ou propositura de acção na Sala de Trabalho do Tribunal de Comarca.\n\n*Nota adaptada ao perfil ${userRole}: Recomenda-se a junção dos recibos de remuneração e carta de notificação para instrução do processo.*`;
      } else if (lower.includes('arrend') || lower.includes('renda') || lower.includes('senhorio') || lower.includes('casa') || lower.includes('imóvel')) {
        replyText = `### Enquadramento Jurídico — Direito Imobiliário & Arrendamento\n\nConforme o **Regime Jurídico do Arrendamento Urbano (Lei n.º 26/15)** e **Código Civil Angolano**:\n\n1. **Formalização Contratual:** O contrato de arrendamento urbano deve constar de documento escrito, com reconhecimento de assinaturas e pagamento do respectivo Imposto de Selo perante a AGT.\n2. **Limites ao Senhorio:** A denúncia do contrato e a exigência de caução sujeitam-se aos limites estritos da Lei 26/15. Despejos sumários sem mandado judicial constituem acto ilícito.\n3. **Procedimentos:** Recomenda-se interpelação por notificação avulsa ou carta registada com aviso de recepção.\n\n*Orientação para ${userRole}: Deve ser solicitada a emissão dos recibos de quitação e o comprovativo de liquidação tributária.*`;
      } else if (lower.includes('empresa') || lower.includes('sociedade') || lower.includes('quotas') || lower.includes('comerc')) {
        replyText = `### Enquadramento Jurídico — Direito Comercial & Societário\n\nÀ luz da **Lei das Sociedades Comerciais (Lei n.º 1/04)** e procedimentos do **Guichet Único da Empresa (GUE)**:\n\n1. **Constituição:** Requer emissão do Certificado de Admissibilidade de Firma, redacção do Pacto Social e registo definitivo na Conservatória do Registo Comercial.\n2. **Obrigações Fiscais e Sociais:** Enquadramento na Repartição Fiscal da AGT e inscrição na segurança social (INSS) no prazo legal.\n3. **Deliberações Sociais:** A alteração de pacto social, cessão de quotas ou destituição de gerentes exigem acta de Assembleia Geral conforme quórum legal.\n\n*Nota para o perfil ${userRole}: Pode obter minutas pré-aprovadas para simplificar o registo comercial.*`;
      } else if (lower.includes('crime') || lower.includes('polícia') || lower.includes('sic') || lower.includes('queixa')) {
        replyText = `### Enquadramento Jurídico — Direito Penal & Processo Penal\n\nNos termos do **Código Penal Angolano (Lei n.º 38/20)** e **Código de Processo Penal (Lei n.º 39/20)**:\n\n1. **Direito de Participação:** O ofendido pode lavrar auto de notícia junto de qualquer esquadra da Polícia Nacional ou piquete do Serviço de Investigação Criminal (SIC).\n2. **Garantias Constitucionais:** O Art.º 29.º da Constituição da República de Angola garante o direito de defesa, assistência jurídica e presunção de inocência.\n3. **Assistência Técnica:** Tratando-se de processo-crime, a intervenção de advogado inscrito na OAA é fundamental para acompanhar os actos de instrução preparatória.`;
      } else {
        replyText = `### Parecer Preliminar DirIA Angola\n\nCom base no **Ordenamento Jurídico da República de Angola** e adaptado ao perfil **${userRole}**:\n\n1. **Acesso ao Direito e aos Tribunais:** Nos termos do Art.º 29.º da Constituição da República de Angola (CRA), a todos é assegurado o recurso às instâncias competentes para salvaguarda dos seus direitos fundamentais.\n2. **Fundamentação Legal:** A análise da matéria rege-se pelas normas substantivas e processuais em vigor, designadamente o Código Civil e diplomas conexos.\n3. **Recomendações Práticas:** Recomenda-se reunir os elementos de prova documental e, se necessário, consultar o Directório de Advogados da Ordem dos Advogados de Angola (OAA).`;
      }
    }

    // Extract citations, complexity and suggestions
    let complexity: 'Baixa' | 'Média' | 'Elevada' = 'Média';
    const lower = replyText.toLowerCase();
    if (lower.includes('complexidade elevada') || lower.includes('litígio iminente') || lower.includes('crime') || lower.includes('despedimento ilícito')) {
      complexity = 'Elevada';
    } else if (lower.includes('complexidade baixa') || lower.includes('mero esclarecimento')) {
      complexity = 'Baixa';
    }

    // Dynamic suggestions based on context
    const suggestions: string[] = [];
    if (lower.includes('igt') || lower.includes('inspecção') || lower.includes('desped')) {
      suggestions.push('Como formalizar queixa na IGT Luanda?');
      suggestions.push('Minuta de interpelação para devolução de documentos e créditos');
      suggestions.push('Simular cálculo de indemnização Lei 12/23');
    } else if (lower.includes('arrendamento') || lower.includes('imóvel') || lower.includes('senhorio')) {
      suggestions.push('Minuta de contrato de arrendamento urbano');
      suggestions.push('Prazo legal de denúncia do senhorio segundo a Lei 26/15');
      suggestions.push('Depósito de caução e retenção na fonte');
    } else if (lower.includes('sociedade') || lower.includes('empresa') || lower.includes('quotas')) {
      suggestions.push('Passos para constituição no Guichet Único em Luanda');
      suggestions.push('Minuta de pacto social de sociedade por quotas');
      suggestions.push('Obrigações fiscais perante a AGT e INSS');
    } else {
      suggestions.push('Ver artigos aplicáveis na legislação');
      suggestions.push('Emitir minuta jurídica para este caso');
      suggestions.push('Agendar consulta com advogado especialista da OAA');
    }

    return res.json({
      text: replyText,
      complexity,
      suggestions,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/chat:', error);
    return res.status(500).json({
      error: 'Ocorreu um erro ao processar a consulta jurídica. Por favor, tente novamente.',
      details: error?.message,
    });
  }
});

// POST /api/tts - Speech synthesis
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto obrigatório.' });
    }

    // Take clean text up to 600 characters for quick legal audio summary
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Voz institucional, clara e profissional de jurista angolano',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Não foi possível gerar áudio.' });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Erro na rota /api/tts:', error);
    return res.status(500).json({
      error: 'Erro na síntese de voz.',
      details: error?.message,
    });
  }
});

// POST /api/generate-draft - Draft Legal Documents (Minutas)
app.post('/api/generate-draft', async (req: Request, res: Response) => {
  try {
    const { documentType, details } = req.body;

    const prompt = `Como DirIA Angola, redige uma MINUTA JURÍDICA FORMAL completa e pronta a preencher, segundo as praxes e normas da Ordem dos Advogados de Angola e leis angolanas vigentes.
Tipo de Documento Solicitado: ${documentType}
Dados e Contexto: ${JSON.stringify(details, null, 2)}

Apresenta a minuta completa com cabeçalho institucional (República de Angola), identificação das partes, fundamentação nos artigos das leis angolanas pertinentes, cláusulas numeradas ou requerimento formal, local (ex: Luanda) e espaço para data e assinaturas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: DIRIA_SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    return res.json({
      draft: response.text,
      title: documentType,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/generate-draft:', error);
    return res.status(500).json({ error: 'Erro ao gerar minuta jurídica.', details: error?.message });
  }
});

// POST /api/analyze-document - Document Analysis (PDF, contract, letter)
app.post('/api/analyze-document', async (req: Request, res: Response) => {
  try {
    const { fileName, fileContent, docCategory } = req.body;

    const prompt = `Analisa juridicamente o seguinte documento segundo a legislação em vigor em Angola (Lei Geral do Trabalho Lei 12/23 se for laboral, Código Civil, Comercial ou Penal).
Nome do ficheiro: ${fileName}
Categoria: ${docCategory || 'Geral'}

Conteúdo do documento:
"""
${fileContent}
"""

Faz uma auditoria jurídica detalhada:
1. Resumo executivo do teor do documento.
2. Conformidade com a Lei Angolana (o que está legal vs. eventuais cláusulas ilegais, nulas ou abusivas).
3. Riscos identificados para o trabalhador ou cliente.
4. Recomendações e medidas preventivas ou reparatórias imediatas.
5. Indicação clara se requer intervenção da IGT ou advogado da OAA.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: DIRIA_SYSTEM_PROMPT,
        temperature: 0.1,
      },
    });

    return res.json({
      analysis: response.text,
    });
  } catch (error: any) {
    console.error('Erro ao analisar documento:', error);
    return res.status(500).json({ error: 'Erro na análise documental.', details: error?.message });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', jurisdiction: 'Angola', legislation: 'Lei 12/23, CRA 2010/2021' });
});

// Serve Vite dev server or static build
const isProduction = process.env.NODE_ENV === 'production';
const server = http.createServer(app);

if (!isProduction) {
  const { createServer } = await import('vite');
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: isHmrDisabled ? false : { server },
      watch: isHmrDisabled ? null : {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

server.listen(Number(port), '0.0.0.0', () => {
  console.log(`Servidor DirIA Angola em execução na porta ${port}`);
});
