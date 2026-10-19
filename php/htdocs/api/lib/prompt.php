<?php
/**
 * DirIA Angola — Prompt de sistema e síntese jurídica integrada (fallback).
 *
 * Replica fielmente o comportamento de server.ts quando a API Gemini falha,
 * garantindo que a aplicação continua a responder com enquadramento legal.
 */

declare(strict_types=1);

/** Prompt de sistema alinhado com o ordenamento jurídico angolano. */
function diria_system_prompt(): string
{
    return <<<'PROMPT'
Tu és a DirIA Angola, a plataforma de inteligência jurídica de referência para a República de Angola, alinhada com a ordem jurídica angolana, doutrina e normas deontológicas da Ordem dos Advogados de Angola (OAA).

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
     d) Nível de Complexidade e Próximos Passos.
PROMPT;
}

/**
 * Síntese jurídica integrada, usada quando o modelo de IA não devolve texto.
 *
 * @param array<int,array<string,mixed>> $messages
 * @param array<string,mixed>|null       $userProfile
 */
function diria_fallback_reply(array $messages, ?array $userProfile): string
{
    $lastMsg = (string) ($messages[count($messages) - 1]['content'] ?? '');
    $lower = mb_strtolower($lastMsg);
    $userRole = (string) ($userProfile['role'] ?? 'Cidadão / Utente');
    $province = (string) ($userProfile['province'] ?? 'Luanda');

    if (diria_contains_any($lower, ['desped', 'trabalho', 'salário', 'igt'])) {
        return "### Enquadramento Jurídico — Direito Laboral Angolano\n\nNos termos da **Lei Geral do Trabalho (Lei n.º 12/23)** e regulamentação complementar aplicável a {$province}:\n\n1. **Garantias Contratuais e Cessação:** Todo o despedimento ou alteração contratual deve cumprir o procedimento disciplinar prévio (Art.º 232.º e seguintes da Lei 12/23), sob pena de ilicitude.\n2. **Compensação e Liquidação:** Havendo cessação, o trabalhador tem direito à compensação por caducidade ou indemnização por despedimento ilícito, acrescida dos subsídios de férias e de Natal proporcionais.\n3. **Instâncias Competentes:** Em caso de incumprimento, pode ser apresentada queixa à **Inspecção Geral do Trabalho (IGT)** para tentativa de conciliação ou propositura de acção na Sala de Trabalho do Tribunal de Comarca.\n\n*Nota adaptada ao perfil {$userRole}: Recomenda-se a junção dos recibos de remuneração e carta de notificação para instrução do processo.*";
    }

    if (diria_contains_any($lower, ['arrend', 'renda', 'senhorio', 'casa', 'imóvel'])) {
        return "### Enquadramento Jurídico — Direito Imobiliário & Arrendamento\n\nConforme o **Regime Jurídico do Arrendamento Urbano (Lei n.º 26/15)** e **Código Civil Angolano**:\n\n1. **Formalização Contratual:** O contrato de arrendamento urbano deve constar de documento escrito, com reconhecimento de assinaturas e pagamento do respectivo Imposto de Selo perante a AGT.\n2. **Limites ao Senhorio:** A denúncia do contrato e a exigência de caução sujeitam-se aos limites estritos da Lei 26/15. Despejos sumários sem mandado judicial constituem acto ilícito.\n3. **Procedimentos:** Recomenda-se interpelação por notificação avulsa ou carta registada com aviso de recepção.\n\n*Orientação para {$userRole}: Deve ser solicitada a emissão dos recibos de quitação e o comprovativo de liquidação tributária.*";
    }

    if (diria_contains_any($lower, ['empresa', 'sociedade', 'quotas', 'comerc'])) {
        return "### Enquadramento Jurídico — Direito Comercial & Societário\n\nÀ luz da **Lei das Sociedades Comerciais (Lei n.º 1/04)** e procedimentos do **Guichet Único da Empresa (GUE)**:\n\n1. **Constituição:** Requer emissão do Certificado de Admissibilidade de Firma, redacção do Pacto Social e registo definitivo na Conservatória do Registo Comercial.\n2. **Obrigações Fiscais e Sociais:** Enquadramento na Repartição Fiscal da AGT e inscrição na segurança social (INSS) no prazo legal.\n3. **Deliberações Sociais:** A alteração de pacto social, cessão de quotas ou destituição de gerentes exigem acta de Assembleia Geral conforme quórum legal.\n\n*Nota para o perfil {$userRole}: Pode obter minutas pré-aprovadas para simplificar o registo comercial.*";
    }

    if (diria_contains_any($lower, ['crime', 'polícia', 'sic', 'queixa'])) {
        return "### Enquadramento Jurídico — Direito Penal & Processo Penal\n\nNos termos do **Código Penal Angolano (Lei n.º 38/20)** e **Código de Processo Penal (Lei n.º 39/20)**:\n\n1. **Direito de Participação:** O ofendido pode lavrar auto de notícia junto de qualquer esquadra da Polícia Nacional ou piquete do Serviço de Investigação Criminal (SIC).\n2. **Garantias Constitucionais:** O Art.º 29.º da Constituição da República de Angola garante o direito de defesa, assistência jurídica e presunção de inocência.\n3. **Assistência Técnica:** Tratando-se de processo-crime, a intervenção de advogado inscrito na OAA é fundamental para acompanhar os actos de instrução preparatória.";
    }

    return "### Parecer Preliminar DirIA Angola\n\nCom base no **Ordenamento Jurídico da República de Angola** e adaptado ao perfil **{$userRole}**:\n\n1. **Acesso ao Direito e aos Tribunais:** Nos termos do Art.º 29.º da Constituição da República de Angola (CRA), a todos é assegurado o recurso às instâncias competentes para salvaguarda dos seus direitos fundamentais.\n2. **Fundamentação Legal:** A análise da matéria rege-se pelas normas substantivas e processuais em vigor, designadamente o Código Civil e diplomas conexos.\n3. **Recomendações Práticas:** Recomenda-se reunir os elementos de prova documental e, se necessário, consultar o Directório de Advogados da Ordem dos Advogados de Angola (OAA).";
}

/**
 * Classifica a complexidade da resposta tal como o servidor Node.
 */
function diria_extract_complexity(string $replyText): string
{
    $lower = mb_strtolower($replyText);

    if (diria_contains_any($lower, ['complexidade elevada', 'litígio iminente', 'crime', 'despedimento ilícito'])) {
        return 'Elevada';
    }
    if (diria_contains_any($lower, ['complexidade baixa', 'mero esclarecimento'])) {
        return 'Baixa';
    }
    return 'Média';
}

/**
 * Sugestões dinâmicas apresentadas por baixo da resposta.
 *
 * @return array<int,string>
 */
function diria_extract_suggestions(string $replyText): array
{
    $lower = mb_strtolower($replyText);

    if (diria_contains_any($lower, ['igt', 'inspecção', 'desped'])) {
        return [
            'Como formalizar queixa na IGT Luanda?',
            'Minuta de interpelação para devolução de documentos e créditos',
            'Simular cálculo de indemnização Lei 12/23',
        ];
    }
    if (diria_contains_any($lower, ['arrendamento', 'imóvel', 'senhorio'])) {
        return [
            'Minuta de contrato de arrendamento urbano',
            'Prazo legal de denúncia do senhorio segundo a Lei 26/15',
            'Depósito de caução e retenção na fonte',
        ];
    }
    if (diria_contains_any($lower, ['sociedade', 'empresa', 'quotas'])) {
        return [
            'Passos para constituição no Guichet Único em Luanda',
            'Minuta de pacto social de sociedade por quotas',
            'Obrigações fiscais perante a AGT e INSS',
        ];
    }

    return [
        'Ver artigos aplicáveis na legislação',
        'Emitir minuta jurídica para este caso',
        'Agendar consulta com advogado especialista da OAA',
    ];
}

/** Devolve true se alguma das agulhas existir no texto (já em minúsculas). */
function diria_contains_any(string $haystack, array $needles): bool
{
    foreach ($needles as $needle) {
        if ($needle !== '' && mb_strpos($haystack, $needle) !== false) {
            return true;
        }
    }
    return false;
}
