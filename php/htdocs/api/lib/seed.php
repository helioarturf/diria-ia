<?php
/**
 * DirIA Angola — Dados iniciais (seed) do directório de advogados e consulta demo.
 */

declare(strict_types=1);

/**
 * Directório inicial de advogados da OAA (cópia de DEFAULT_LAWYERS em server/db.ts).
 *
 * @return array<int,array<string,mixed>>
 */
function diria_default_lawyers(): array
{
    return [
        [
            'id' => 'lawyer-1',
            'name' => 'Dr. Manuel Domingos Gaspar',
            'oaa_number' => 'OAA 3.412',
            'location' => 'Luanda — Ingombota',
            'specialty' => 'Direito Laboral & Contencioso Social',
            'phone' => '+244 923 445 110',
            'email' => 'm.gaspar.adv@oaa.ao',
            'photo_url' => 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop&crop=face',
            'available' => 1,
            'entity_type' => 'Advogado Singular',
            'province' => 'Luanda',
            'address' => 'Rua Rainha Ginga, Edifício Rei Katyavala, 4.º Andar',
            'bio' => 'Patrono com mais de 16 anos de prática forense perante as Salas de Trabalho dos Tribunais de Comarca de Luanda e Viana.',
            'verified_oaa' => 1,
            'rating' => 4.9,
            'review_count' => 38,
        ],
        [
            'id' => 'lawyer-2',
            'name' => 'Dra. Ana Paula Tchissola',
            'oaa_number' => 'OAA 4.890',
            'location' => 'Luanda — Talatona / Belas',
            'specialty' => 'Direito Comercial & Societário',
            'phone' => '+244 931 880 234',
            'email' => 'ana.tchissola@legalangola.co.ao',
            'photo_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
            'available' => 1,
            'entity_type' => 'Sociedade de Advogados / Escritório',
            'province' => 'Luanda',
            'address' => 'Condomínio Cidade Financeira, Bloco 2, Talatona',
            'bio' => 'Especialista em investimento privado (AIPEX), constituição célere de sociedades no GUE e assessoria de fusões e aquisições.',
            'verified_oaa' => 1,
            'rating' => 5.0,
            'review_count' => 42,
        ],
        [
            'id' => 'lawyer-3',
            'name' => 'Dr. Afonso Kiala',
            'oaa_number' => 'OAA 2.115',
            'location' => 'Benguela — Centro',
            'specialty' => 'Direito Imobiliário & Arrendamento',
            'phone' => '+244 924 112 990',
            'email' => 'afonso.kiala@benguela-adv.ao',
            'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
            'available' => 1,
            'entity_type' => 'Advogado Singular',
            'province' => 'Benguela',
            'address' => 'Avenida Norton de Matos, Benguela Comarca',
            'bio' => 'Mais de 20 anos na defesa de litígios fundiários, desapropriações e contratos de arrendamento sob a Lei 26/15.',
            'verified_oaa' => 1,
            'rating' => 4.8,
            'review_count' => 29,
        ],
    ];
}

/**
 * Consulta demonstrativa inicial (cópia de INITIAL_CONSULTATION em server/db.ts).
 *
 * @return array<string,mixed>
 */
function diria_initial_consultation(): array
{
    return [
        'id' => 'consult-1',
        'title' => 'Rescisão Contratual & Compensação',
        'category' => 'Direito Laboral',
        'messages' => [
            [
                'id' => 'msg-1',
                'role' => 'user',
                'content' => 'Fui despedido sem aviso prévio após 4 anos numa empresa privada em Viana. Tenho direito legal a indemnização?',
                'citation_law' => null,
                'citation_article' => null,
                'citation_text' => null,
                'complexity' => null,
                'suggestions' => null,
                'audio_duration' => null,
            ],
            [
                'id' => 'msg-2',
                'role' => 'assistant',
                'content' => 'Sim. Nos termos da legislação laboral de Angola, a cessação do contrato promovida pelo empregador sem justa causa comprovada constitui despedimento ilícito, gerando obrigação compensatória imediata.\n\nTendo 4 anos de antiguidade, o cálculo inicial contempla o salário-base mensal multiplicado pelo coeficiente temporal, acrescido do salário de pré-aviso devido.',
                'citation_law' => 'Lei Geral do Trabalho de Angola (Lei n.º 12/23)',
                'citation_article' => 'Art.º 232.º',
                'citation_text' => 'A cessação sem justa causa confere ao trabalhador compensação pecuniária correspondente ao tempo efectivo de serviço, acrescida do vencimento correspondente ao aviso prévio em falta e proporcionais de férias e subsídio de Natal.',
                'complexity' => 'Elevada',
                'suggestions' => [
                    'Como formalizar queixa na IGT Luanda?',
                    'Minuta de interpelação para devolução de documentos e créditos',
                ],
                'audio_duration' => '0:24',
            ],
        ],
    ];
}

/** Utilizador administrador inicial. */
function diria_initial_user(): array
{
    return [
        'id' => 'user-admin',
        'name' => 'Administrador DirIA',
        'email' => 'admin@diria.ao',
        'role' => 'Advogado / Jurista',
        'province' => 'Luanda',
    ];
}
