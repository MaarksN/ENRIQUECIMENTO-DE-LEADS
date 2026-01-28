/**
 * SALES PROSPECTOR AI - MASTER TOOLS CONFIGURATION
 * Registro de ferramentas avançadas de IA para prospecção.
 */

const ADVANCED_TOOLS = {
  // --- CATEGORIA 1: GERAÇÃO E INTELIGÊNCIA ---
  "ai-voice-pitch": {
    id: "ai-voice-pitch",
    name: "Gerador de Pitch de Voz",
    category: "Inteligência",
    description: "Cria roteiros otimizados para áudio.",
    icon: "🎙️",
    inputs: ["name", "role", "company", "sector", "objective", "product", "benefits"],
    prompt: (d) => `Atue como um especialista em comunicação persuasiva. Gere um roteiro de áudio para ${d.name} (${d.role}) da ${d.company}.
    Contexto: O lead atua no setor ${d.sector} e o objetivo é ${d.objective}.
    Instruções: Use um tom amigável mas profissional. Inclua marcações de [PAUSA], [ENTONAÇÃO ALTA] e um Call to Action (CTA) claro.
    Considere que o produto é ${d.product} e foque nos benefícios: ${d.benefits}.
    O roteiro deve ter entre 30 e 45 segundos de fala natural.`,
    schema: { script: "string", emphasis_points: "array", duration_est: "string", pacing_instructions: "string" }
  },
  "ice-breaker": {
    id: "ice-breaker",
    name: "Quebra-Gelo Contextual",
    category: "Inteligência",
    description: "Gera frases de abertura baseadas em notícias.",
    icon: "❄️",
    inputs: ["name", "role", "company", "news"],
    prompt: (d) => `Atue como um SDR de elite especializado em personalização. Analise o lead ${d.name} e a notícia recente: "${d.news}".
    Combine isso com o cargo do lead (${d.role}) e o histórico da empresa ${d.company}.
    Gere 3 opções de frases de abertura que não pareçam automatizadas.
    Evite clichês como 'Espero que este email o encontre bem'.
    Foque em curiosidade, parabenização ou insights sobre a notícia.`,
    schema: { options: "array", context_used: "string", psychological_trigger: "string" }
  },
  "disc-analyzer": {
    id: "disc-analyzer",
    name: "Analisador de Perfil DISC",
    category: "Inteligência",
    description: "Prevê o perfil psicológico do lead.",
    icon: "🧠",
    inputs: ["name", "role", "bio"],
    prompt: (d) => `Analise a biografia e o histórico de ${d.name} (${d.role}): "${d.bio}".
    Classifique o lead no modelo DISC (Dominância, Influência, Estabilidade, Conformidade).
    Explique por que ele se encaixa nessa categoria.
    Forneça 3 dicas de como falar com ele e 3 coisas que o irritariam.
    Sugira o melhor canal de comunicação (Email, LinkedIn ou Call) para este perfil.`,
    schema: { profile: "string", detailed_analysis: "string", tips: "array", forbidden_methods: "array", best_channel: "string" }
  },
  "intent-radar": {
    id: "intent-radar",
    name: "Radar de Intenção",
    category: "Inteligência",
    description: "Detecta sinais de compra em notícias.",
    icon: "📡",
    inputs: ["company", "sector", "news", "metrics", "product"],
    prompt: (d) => `Atue como um analista de mercado. Varra o contexto da empresa ${d.company} (${d.sector}).
    Notícias recentes: "${d.news}". Gatilhos financeiros: "${d.metrics}".
    Identifique se há sinais de 'Intenção de Compra' para o produto ${d.product}.
    Atribua um score de 0 a 100 e justifique com base em 3 sinais específicos.
    Classifique a urgência em: Baixa, Média ou Alta.`,
    schema: { intent_score: "number", signals: "array", urgency: "string", justification: "string" }
  },
  "roi-calculator": {
    id: "roi-calculator",
    name: "Calculadora de ROI IA",
    category: "Inteligência",
    description: "Gera prova de valor financeira.",
    icon: "💰",
    inputs: ["company", "product", "metrics", "sector"],
    prompt: (d) => `Atue como um consultor financeiro. Calcule o ROI estimado para a ${d.company} ao implementar ${d.product}.
    Dados do cliente: ${d.metrics} (faturamento, tamanho do time, custos atuais).
    Utilize benchmarks do setor ${d.sector} para prever: 1. Economia anual em R$; 2. Ganho de produtividade em %; 3. Período de Payback (meses).
    Apresente uma justificativa baseada em dados para cada número.`,
    schema: { estimate_summary: "string", annual_saving: "string", productivity_gain: "string", payback_period: "string", data_sources: "array" }
  },

  // --- CATEGORIA 2: DADOS (Adaptado da lista) ---
  "technographics": {
    id: "technographics",
    name: "Localizador de Tecnologias",
    category: "Dados",
    description: "Identifica a stack tecnológica.",
    icon: "💻",
    inputs: ["company", "product"],
    prompt: (d) => `Analise a presença digital e o site da ${d.company}.
    Identifique a provável stack tecnológica (CMS, CRM, Analytics, Hospedagem, ERP).
    Com base nessas tecnologias, sugira 2 pontos de integração ou 1 ponto de substituição onde nosso produto ${d.product} se destaca.
    Foque em como ajudamos a otimizar o que eles já usam.`,
    schema: { detected_stack: "array", integration_opportunities: "array", competitive_edge: "string" }
  },
  "org-chart-mapper": {
    id: "org-chart-mapper",
    name: "Mapeador de Hierarquia",
    category: "Dados",
    description: "Visualiza estrutura de decisão.",
    icon: "👔",
    inputs: ["name", "role", "company", "department"],
    prompt: (d) => `Com base no lead ${d.name} (${d.role}) da empresa ${d.company}, mapeie a provável estrutura organizacional do departamento de ${d.department}.
    Identifique: 1. Quem provavelmente é o superior imediato; 2. Quem são os pares influenciadores; 3. Quem seriam os usuários finais.
    Sugira como o ${d.name} pode atuar como campeão interno para convencer os demais.`,
    schema: { hierarchy_map: "array", key_influencers: "array", champion_strategy: "string" }
  },
  "lookalike-builder": {
    id: "lookalike-builder",
    name: "Gerador de Públicos",
    category: "Dados",
    description: "Encontra empresas perfil semelhante.",
    icon: "👯",
    inputs: ["bestClient", "sector", "size"],
    prompt: (d) => `Analise meu cliente de sucesso: ${d.bestClient} (Setor: ${d.sector}, Tamanho: ${d.size}).
    Identifique os 3 atributos principais que tornam esta empresa um cliente ideal.
    Com base nisso, gere uma lista de 5 empresas similares no Brasil que possuem as mesmas dores e potencial.
    Justifique por que cada empresa foi escolhida.`,
    schema: { traits_of_success: "array", lookalike_list: "array", rationale: "string" }
  },
  "compliance-checker": {
    id: "compliance-checker",
    name: "Validador LGPD/GDPR",
    category: "Dados",
    description: "Valida script contra normas.",
    icon: "⚖️",
    inputs: ["script"],
    prompt: (d) => `Atue como um DPO (Data Protection Officer). Analise este script de vendas: "${d.script}".
    Verifique a conformidade com a LGPD (Brasil) e GDPR (Europa).
    Identifique se há coleta indevida de dados sensíveis ou falta de transparência.
    Sugira ajustes para tornar a abordagem 'Privacy-First' sem perder a eficácia comercial.`,
    schema: { risk_level: "string", non_compliant_parts: "array", suggestions: "string", safety_score: "number" }
  },
  "auto-crm-sync": {
    id: "auto-crm-sync",
    name: "Sync CRM Inteligente",
    category: "Dados",
    description: "Limpa e formata dados para CRM.",
    icon: "🔄",
    inputs: ["raw"],
    prompt: (d) => `Analise estes dados brutos do lead: ${d.raw}.
    1. Padronize nomes (Capitalize); 2. Classifique o cargo em uma categoria (Executivo, Gerencial, Operacional);
    3. Identifique o setor correto; 4. Estime o faturamento anual baseado no porte.
    Retorne um objeto limpo e pronto para importação via API.`,
    schema: { cleaned_data: "object", data_quality_score: "number", enrichment_notes: "string" }
  },

  // --- CATEGORIA 5: COMPORTAMENTO E DECISÃO ---
  "lead-readiness": {
    id: "lead-readiness",
    name: "Preditivo de Prontidão",
    category: "Comportamental",
    description: "Mede o 'Timing' para fechamento.",
    icon: "⏱️",
    inputs: ["name", "role", "company", "news", "history"],
    prompt: (d) => `Atue como um analista de inteligência de vendas. Avalie a prontidão de compra do lead ${d.name} (${d.role}) da ${d.company}.
    Considere: Notícias (${d.news}), Histórico de interações (${d.history}), cargo e porte da empresa.
    Atribua um score de 0 a 100 para a prontidão.
    Recomende uma das ações: A) Abordagem Imediata, B) Nutrição (Nurturing), C) Aguardar Próximo Trimestre. Justifique.`,
    schema: { score: "number", phase: "string", recommendation: "string", reasoning: "string" }
  },
  "timing-optimizer": {
    id: "timing-optimizer",
    name: "Otimizador de Horários",
    category: "Comportamental",
    description: "Indica o minuto exato para contato.",
    icon: "📅",
    inputs: ["role", "city"],
    prompt: (d) => `Com base no cargo ${d.role} e na cidade ${d.city}, identifique o melhor horário para:
    1. Enviar um E-mail; 2. Enviar um WhatsApp; 3. Fazer uma Ligação.
    Considere picos de reuniões matinais para executivos e rotinas operacionais de tarde.
    Explique o porquê de cada horário sugerido.`,
    schema: { email_time: "string", whatsapp_time: "string", call_time: "string", logic_explanation: "string" }
  },
  "objection-anticipator": {
    id: "objection-anticipator",
    name: "Antecipador de Objeções",
    category: "Comportamental",
    description: "Prepara para 'Nãos' prováveis.",
    icon: "🛡️",
    inputs: ["name", "company", "product", "sector"],
    prompt: (d) => `Atue como o lead ${d.name} da empresa ${d.company}.
    Imagine que você está ouvindo uma proposta de ${d.product}.
    Liste as 3 objeções mais realistas que você faria, considerando seu setor (${d.sector}) e o momento econômico.
    Para cada objeção, forneça a 'Resposta de Ouro' que o vendedor deve usar para contorná-la.`,
    schema: { objections: "array", rebuttal_strategy: "string" }
  },
  "tone-optimizer": {
    id: "tone-optimizer",
    name: "Otimizador de Tom",
    category: "Comportamental",
    description: "Ajusta formalidade da mensagem.",
    icon: "🎭",
    inputs: ["company", "name", "text", "tone"],
    prompt: (d) => `Analise a cultura da empresa ${d.company} e o perfil do lead ${d.name}.
    Reescreva este texto: "${d.text}" para que soe perfeitamente alinhado ao tom ${d.tone}.
    Explique quais palavras foram alteradas para garantir o rapport.
    O objetivo é que o lead sinta que está falando com um par (peer-to-peer).`,
    schema: { original_text: "string", optimized_text: "string", tone_analysis: "string", changes_made: "array" }
  },
  "buying-committee": {
    id: "buying-committee",
    name: "Identificador de Comitê",
    category: "Comportamental",
    description: "Mapeia influenciadores e decisores.",
    icon: "👥",
    inputs: ["product", "company", "role"],
    prompt: (d) => `Em uma venda de ${d.product} para a empresa ${d.company}, além do ${d.role}, quem são os outros cargos fundamentais no comitê de decisão?
    Identifique quem é o 'Dono do Orçamento', o 'Usuário Técnico' e o 'Aprovador de Segurança/Legal'.
    Sugira uma abordagem específica para cada um deles.`,
    schema: { stakeholders: "array", decision_power_map: "object" }
  },
  "priority-ranker": {
    id: "priority-ranker",
    name: "Ranker de Stakeholders",
    category: "Comportamental",
    description: "Prioriza lista de contatos.",
    icon: "🔢",
    inputs: ["company", "leads"],
    prompt: (d) => `Analise esta lista de contatos da ${d.company}: [${d.leads}].
    Ordene-os pela ordem lógica de prospecção.
    Justifique: Quem é a 'Porta de Entrada' (mais fácil acesso) e quem é o 'Alvo Final' (decisor).
    Sugira como usar a informação do primeiro contato para abrir caminho até o decisor final.`,
    schema: { priority_list: "array", strategy_path: "string" }
  },
  "personality-pitch": {
    id: "personality-pitch",
    name: "Pitch por Perfil",
    category: "Comportamental",
    description: "Cria discurso por personalidade.",
    icon: "🗣️",
    inputs: ["disc", "name", "product"],
    prompt: (d) => `Com base no perfil psicológico ${d.disc} de ${d.name}, crie um pitch de 2 parágrafos para o produto ${d.product}.
    Se o perfil for 'D', foque em resultados e ROI. Se for 'I', foque em inovação e status.
    Se for 'S', foque em segurança e suporte. Se for 'C', foque em dados e detalhes técnicos.`,
    schema: { pitch: "string", key_triggers_used: "array" }
  },
  "empathy-mapping": {
    id: "empathy-mapping",
    name: "Mapa de Empatia IA",
    category: "Comportamental",
    description: "Entenda o que o lead sente.",
    icon: "❤️",
    inputs: ["role", "sector", "product"],
    prompt: (d) => `Gere um mapa de empatia completo para o cargo de ${d.role} no setor ${d.sector}.
    O que este profissional vê no mercado hoje? O que ele ouve de seus pares? Quais são suas dores reais (Pains) e o que ele considera sucesso (Gains)?
    Como nosso produto ${d.product} se encaixa especificamente para aliviar essas dores?`,
    schema: { sees: "array", hears: "array", pains: "array", gains: "array", product_fit: "string" }
  },
  "conflict-resolver": {
    id: "conflict-resolver",
    name: "Mediador de Conflitos",
    category: "Comportamental",
    description: "Responde a leads irritados.",
    icon: "☮️",
    inputs: ["name", "text"],
    prompt: (d) => `Atue como um especialista em resolução de conflitos. O lead ${d.name} enviou a seguinte mensagem negativa: "${d.text}".
    Analise a causa raiz da frustração.
    Gere uma resposta que utilize a técnica 'Feel-Felt-Found' para validar a emoção dele, mostrar empatia e redirecionar para uma solução positiva sem ser defensivo.`,
    schema: { root_cause_analysis: "string", response_script: "string", technique_applied: "string" }
  },
  "trust-builder": {
    id: "trust-builder",
    name: "Gerador de Prova Social",
    category: "Comportamental",
    description: "Escolhe o melhor case de sucesso.",
    icon: "🤝",
    inputs: ["company", "sector", "size", "cases"],
    prompt: (d) => `Analise a empresa ${d.company} (${d.sector}, Porte ${d.size}).
    Dos meus cases de sucesso disponíveis [${d.cases}], selecione os 2 mais impactantes para este lead.
    Justifique a escolha baseada em similaridade de dores.
    Crie uma frase curta de 'Social Proof' que o vendedor pode usar para citar esses cases durante a conversa.`,
    schema: { selected_cases: "array", justification: "string", social_proof_line: "string" }
  },

  // --- CATEGORIA 6: MERCADO E ESTRATÉGIA ---
  "competitor-detector": {
    id: "competitor-detector",
    name: "Detector de Concorrentes",
    category: "Estratégia",
    description: "Battlecard contra rivais.",
    icon: "⚔️",
    inputs: ["name", "competitor", "sector"],
    prompt: (d) => `O lead ${d.name} mencionou ou utiliza o concorrente ${d.competitor}.
    Atue como um estrategista competitivo. Liste 3 fraquezas conhecidas de ${d.competitor} no setor ${d.sector} e 3 forças nossas que anulam essas fraquezas.
    Gere um 'Battlecard' rápido para o vendedor usar durante a objeção: 'Já usamos o concorrente'.`,
    schema: { competitor_weaknesses: "array", our_advantages: "array", battlecard_script: "string" }
  },
  "price-sensitivity": {
    id: "price-sensitivity",
    name: "Estimador de Sensibilidade",
    category: "Estratégia",
    description: "Preveja prioridade: preço ou valor.",
    icon: "💲",
    inputs: ["company", "revenue"],
    prompt: (d) => `Analise a sensibilidade a preço da empresa ${d.company}.
    Considere o faturamento estimado (${d.revenue}), o momento do setor e o histórico de compras.
    Classifique a sensibilidade de 1 a 5.
    Recomende: Devo focar no 'Desconto e Economia' ou no 'Valor Agregado e Qualidade'? Justifique.`,
    schema: { sensitivity_score: "number", focus_area: "string", justification: "string" }
  },
  "expansion-finder": {
    id: "expansion-finder",
    name: "Buscador de Expansão",
    category: "Estratégia",
    description: "Cross-sell e Upsell.",
    icon: "🚀",
    inputs: ["company", "currentProduct", "time", "upsellProduct"],
    prompt: (d) => `Dado que a ${d.company} já utiliza nosso produto ${d.currentProduct} há ${d.time}, identifique a próxima etapa lógica de evolução.
    O que eles estão perdendo por não terem ${d.upsellProduct}?
    Gere um pitch de expansão focado no sucesso que eles já tiveram e como levar isso para o próximo nível.`,
    schema: { expansion_target: "string", value_proposition: "string", pitch: "string" }
  },
  "market-saturation": {
    id: "market-saturation",
    name: "Analisador de Saturação",
    category: "Estratégia",
    description: "Mede ruído de ofertas no setor.",
    icon: "📢",
    inputs: ["role", "sector", "category"],
    prompt: (d) => `Qual a saturação de ofertas para o cargo de ${d.role} no setor ${d.sector}?
    Identifique se este lead recebe muitas abordagens de ${d.category}.
    Se a saturação for alta, sugira um 'Ângulo Disruptivo' para se destacar.
    Se for baixa, sugira uma 'Abordagem Educativa'.`,
    schema: { saturation_level: "string", market_noise_score: "number", strategy_pivot: "string" }
  },
  "sales-angle": {
    id: "sales-angle",
    name: "Gerador de Ângulo",
    category: "Estratégia",
    description: "Melhor gancho narrativo.",
    icon: "📐",
    inputs: ["name"],
    prompt: (d) => `Atue como um redator publicitário de alta conversão. Para o lead ${d.name}, gere 3 ângulos de venda distintos:
    1. O Ângulo do Medo (O que ele perde se não agir); 2. O Ângulo da Ganância (O que ele ganha em lucro/tempo); 3. O Ângulo do Status (Como ele será visto na empresa).
    Recomende qual ângulo tem mais chance de sucesso baseado no perfil DISC do lead.`,
    schema: { angle_fear: "string", angle_gain: "string", angle_status: "string", recommended: "string" }
  },
  "deal-complexity": {
    id: "deal-complexity",
    name: "Score de Complexidade",
    category: "Estratégia",
    description: "Calcula esforço para fechar.",
    icon: "🧩",
    inputs: ["company", "value"],
    prompt: (d) => `Analise a complexidade deste negócio com a ${d.company}.
    Considere: Valor da proposta (${d.value}), número de departamentos envolvidos, requisitos técnicos e burocracia de compras (Procurement).
    Atribua um score de 1 a 10.
    Estime o ciclo de vendas (em dias) e aponte os 2 principais gargalos que podem atrasar o fechamento.`,
    schema: { complexity_score: "number", estimated_cycle_days: "number", bottlenecks: "array" }
  },
  "swot-competitor": {
    id: "swot-competitor",
    name: "SWOT Comparativa IA",
    category: "Estratégia",
    description: "Matriz estratégica dinâmica.",
    icon: "📊",
    inputs: ["competitor", "name", "company"],
    prompt: (d) => `Gere uma matriz SWOT (Forças, Fraquezas, Oportunidades, Ameaças) focada na nossa solução contra o concorrente ${d.competitor}.
    Foque especificamente no cenário do lead ${d.name} da empresa ${d.company}.
    Como nossas forças anulam as oportunidades do concorrente neste caso específico?`,
    schema: { strengths: "array", weaknesses: "array", opportunities: "array", threats: "array", strategic_insight: "string" }
  },
  "blue-ocean-strategy": {
    id: "blue-ocean-strategy",
    name: "Estratégia Oceano Azul",
    category: "Estratégia",
    description: "Encontra nicho sem concorrência.",
    icon: "🌊",
    inputs: ["product", "sector"],
    prompt: (d) => `Atue como um estrategista do Oceano Azul. Para o nosso produto ${d.product}, identifique um sub-nicho ou uma aplicação no setor ${d.sector} onde a concorrência é irrelevante.
    Quais funcionalidades devemos 'Aumentar', 'Reduzir', 'Eliminar' ou 'Criar' para dominar este novo espaço?
    Gere o pitch para esse novo posicionamento.`,
    schema: { new_niche: "string", eric_framework: "object", blue_ocean_pitch: "string" }
  },
  "macro-economic-impact": {
    id: "macro-economic-impact",
    name: "Impacto Macroeconômico",
    category: "Estratégia",
    description: "Conexão economia x orçamento.",
    icon: "🌐",
    inputs: ["company", "sector", "product"],
    prompt: (d) => `Analise como o cenário macroeconômico atual (Ex: taxa de juros, inflação, dólar) afeta diretamente o orçamento da empresa ${d.company} no setor ${d.sector}.
    Crie um argumento de venda que mostre como nosso produto ${d.product} é um 'Hedge' (proteção) ou uma forma de sobreviver/lucrar neste cenário específico.`,
    schema: { economic_threat: "string", our_solution_as_hedge: "string", talking_points: "array" }
  },
  "value-proposition-canvas": {
    id: "value-proposition-canvas",
    name: "Canvas Proposta Valor",
    category: "Estratégia",
    description: "Estrutura valor do produto.",
    icon: "🖼️",
    inputs: ["name"],
    prompt: (d) => `Atue como um Product Manager. Preencha o Canvas de Proposta de Valor para o lead ${d.name}.
    Lado do Cliente: Tarefas (Jobs to be done), Dores, Ganhos.
    Lado do Produto: Funcionalidades, Aliviadores de Dor, Criadores de Ganho.
    Identifique o 'Fit' perfeito e gere o 'Value Statement' final de uma frase.`,
    schema: { customer_profile: "object", value_map: "object", fit_statement: "string" }
  },

  // --- CATEGORIA 7: AUTOMAÇÃO ---
  "auto-follow-up": {
    id: "auto-follow-up",
    name: "Motor de Follow-up",
    category: "Automação",
    description: "Cria sequência de contatos.",
    icon: "📩",
    inputs: ["name"],
    prompt: (d) => `Crie uma sequência de 3 e-mails de follow-up para o lead ${d.name}.
    E-mail 1 (Dia 3): Educativo (envie um insight).
    E-mail 2 (Dia 7): Prova Social (cite um caso similar).
    E-mail 3 (Dia 12): Direto (peça um sim ou não).
    Garanta que as mensagens sejam curtas, personalizadas e com foco em ajudar, não em cobrar.`,
    schema: { sequence: "array", goal_of_sequence: "string" }
  },
  "silence-breaker": {
    id: "silence-breaker",
    name: "Quebrador de Silêncio",
    category: "Automação",
    description: "Interrupção de silêncio.",
    icon: "🔊",
    inputs: ["name"],
    prompt: (d) => `O lead ${d.name} parou de responder há mais de 15 dias. Gere 2 opções de 'Quebrador de Silêncio'.
    Opção 1: Humor leve (Ex: 'Você foi sequestrado por alienígenas?').
    Opção 2: Honestidade radical (Ex: 'Presumo que suas prioridades mudaram').
    Objetivo: Obter uma resposta rápida, mesmo que seja um 'Não' definitivo.`,
    schema: { option_humor: "string", option_radical_honesty: "string", advice: "string" }
  },
  "multi-thread-planner": {
    id: "multi-thread-planner",
    name: "Planejador Multi-thread",
    category: "Automação",
    description: "Ataque a vários cargos.",
    icon: "🧵",
    inputs: ["company", "role1", "role2"],
    prompt: (d) => `Para a empresa ${d.company}, planeje uma estratégia multi-thread.
    Fale com o ${d.role1} (Dores técnicas) e simultaneamente com o ${d.role2} (Dores financeiras).
    Como as mensagens devem se complementar sem parecer spam?
    Gere o script de abertura para ambos os cargos garantindo a coerência da narrativa.`,
    schema: { strategy: "string", scripts: "array", coordination_tips: "string" }
  },
  "auto-disqualifier": {
    id: "auto-disqualifier",
    name: "Desqualificador Auto",
    category: "Automação",
    description: "Filtro de Bad Fit.",
    icon: "⛔",
    inputs: ["name", "company"],
    prompt: (d) => `Atue como um gestor de vendas rigoroso. Analise os dados do lead ${d.name} (${d.company}).
    Identifique 'Red Flags': Empresa muito pequena? Setor em crise? Cargo sem poder?
    Decida se devemos desqualificar este lead agora para economizar tempo do SDR. Justifique com 2 motivos claros.`,
    schema: { disqualify: "boolean", red_flags: "array", justification: "string" }
  },
  "lead-recycling": {
    id: "lead-recycling",
    name: "Motor de Reciclagem",
    category: "Automação",
    description: "Reativa leads antigos.",
    icon: "♻️",
    inputs: ["name", "reason", "company", "news"],
    prompt: (d) => `Temos este lead ${d.name} que 'esfriou' há 6 meses. O motivo foi: "${d.reason}".
    Considerando que agora a empresa dele (${d.company}) está em um novo momento (${d.news}), gere um script de reabordagem que reconheça o passado mas traga um fato novo e relevante para hoje.
    O objetivo é parecer um 'Follow-up de Longo Prazo' inteligente.`,
    schema: { recycling_script: "string", new_hook_used: "string" }
  },
  "opportunity-reviver": {
    id: "opportunity-reviver",
    name: "Reviver de Negócios",
    category: "Automação",
    description: "Salva negócio perdido.",
    icon: "🩺",
    inputs: ["company", "competitor"],
    prompt: (d) => `O negócio com a ${d.company} foi perdido para o concorrente ${d.competitor}.
    Gere um script de 'E-mail de Despedida Elegante' que deixe a porta aberta.
    Dê 2 sugestões de quando e como entrar em contato novamente para perguntar como está sendo a experiência com o concorrente (plantando a dúvida).`,
    schema: { farewell_script: "string", follow_up_trigger: "string", timing_advice: "string" }
  },
  "smart-outreach-scheduler": {
    id: "smart-outreach-scheduler",
    name: "Agendador de Outreach",
    category: "Automação",
    description: "Cronograma de cadência.",
    icon: "📆",
    inputs: ["sector"],
    prompt: (d) => `Crie um cronograma de 15 dias para uma cadência de prospecção para o setor ${d.sector}.
    Quais dias da semana e horários têm maior taxa de conversão para este público?
    Defina o intervalo entre: 1. LinkedIn; 2. Email 1; 3. Ligação; 4. Email 2.
    Justifique o espaçamento para não saturar o lead.`,
    schema: { schedule: "array", logic_behind_spacing: "string" }
  },
  "whatsapp-automation-script": {
    id: "whatsapp-automation-script",
    name: "Script Automação Zap",
    category: "Automação",
    description: "Mensagens curtas para robôs.",
    icon: "📱",
    inputs: ["name"],
    prompt: (d) => `Atue como um copywriter de WhatsApp. Gere 3 variações de mensagens curtas (máx 200 caracteres) para ${d.name}.
    As mensagens devem ser formatadas para parecerem escritas à mão (sem links no primeiro contato, sem excesso de emojis).
    Inclua uma pergunta aberta no final para forçar a resposta.`,
    schema: { variation_1: "string", variation_2: "string", variation_3: "string", tips_to_avoid_spam: "array" }
  },
  "linkedin-connector-ai": {
    id: "linkedin-connector-ai",
    name: "Conector LinkedIn IA",
    category: "Automação",
    description: "Mensagem de conexão.",
    icon: "🔗",
    inputs: ["name", "about"],
    prompt: (d) => `Analise o perfil do LinkedIn de ${d.name}: "${d.about}".
    Gere um convite de conexão de até 300 caracteres que cite um ponto específico da carreira dele ou um post recente.
    Não tente vender no convite. O objetivo é apenas que ele aceite a conexão para iniciarmos o relacionamento.`,
    schema: { invitation_text: "string", anchor_point: "string" }
  },
  "email-subject-ab-test": {
    id: "email-subject-ab-test",
    name: "Teste A/B Assuntos",
    category: "Automação",
    description: "5 assuntos focados em abertura.",
    icon: "🅰️",
    inputs: ["name", "company"],
    prompt: (d) => `Gere 5 opções de assuntos de e-mail para o lead ${d.name} da ${d.company}.
    Opção 1: Curiosidade; Opção 2: Benefício Direto; Opção 3: Personalizado (com o nome); Opção 4: Pergunta; Opção 5: Urgência.
    Qual dessas você prevê que terá a maior taxa de abertura e por quê?`,
    schema: { subjects: "array", winner_prediction: "string", reason: "string" }
  },

  // --- CATEGORIA 8: PERFORMANCE ---
  "script-effectiveness": {
    id: "script-effectiveness",
    name: "Analisador de Eficácia",
    category: "Performance",
    description: "Nota do seu script atual.",
    icon: "📝",
    inputs: ["script"],
    prompt: (d) => `Atue como um copywriter sénior. Analise este script: "${d.script}".
    Dê uma nota de 0 a 10. Avalie: 1. Clareza do Gancho; 2. Proposta de Valor; 3. Call to Action.
    Aponte 2 frases que devem ser removidas e sugira 2 frases mais fortes para substituí-las.`,
    schema: { score: "number", strengths: "array", weaknesses: "array", improved_version: "string" }
  },
  "sdr-coaching": {
    id: "sdr-coaching",
    name: "Mentor de Vendas IA",
    category: "Performance",
    description: "Treinamento diário.",
    icon: "🏋️",
    inputs: ["history"],
    prompt: (d) => `Analise o histórico de conversas do vendedor [${d.history}].
    Identifique o principal erro repetitivo (Ex: Fala demais do produto, não ouve o lead, desiste rápido).
    Gere um exercício prático de 5 minutos para o vendedor treinar essa habilidade amanhã.
    Dê uma palavra de incentivo baseada na melhor conversa dele.`,
    schema: { main_flaw: "string", coaching_exercise: "string", motivation: "string" }
  },
  "win-loss-analyzer": {
    id: "win-loss-analyzer",
    name: "Analisador Win-Loss",
    category: "Performance",
    description: "Motivo real de ganhar ou perder.",
    icon: "🏆",
    inputs: ["reasons"],
    prompt: (d) => `Analise estas 5 oportunidades marcadas como 'Perdidas'.
    Motivos declarados: [${d.reasons}].
    Identifique a 'Causa Raiz' oculta. O problema é nosso preço? É nossa mensagem? É o perfil de lead que estamos buscando?
    Sugira uma mudança estratégica para o próximo mês para aumentar a taxa de conversão em 10%.`,
    schema: { root_cause_analysis: "string", pattern_detected: "string", strategic_pivot: "string" }
  },
  "pipeline-bottleneck": {
    id: "pipeline-bottleneck",
    name: "Detector de Gargalos",
    category: "Performance",
    description: "Onde os leads morrem.",
    icon: "🍾",
    inputs: ["metrics"],
    prompt: (d) => `Analise as métricas do funil: ${JSON.stringify(d.metrics)}.
    Onde está o maior gargalo? (Ex: Muitos leads param na etapa de 'Proposta').
    Por que isso está acontecendo? Gere um plano de ação de 3 passos para 'desentupir' o pipeline nesta etapa específica.`,
    schema: { bottleneck_stage: "string", reason: "string", action_plan: "array" }
  },
  "forecast-accuracy": {
    id: "forecast-accuracy",
    name: "Precisão de Forecast",
    category: "Performance",
    description: "Previsão de venda.",
    icon: "🔮",
    inputs: ["pipeline_value"],
    prompt: (d) => `Com base no pipeline atual (${d.pipeline_value}) e na velocidade histórica, quanto realmente fecharemos este mês?
    Classifique a confiança dessa previsão em: Baixa, Média ou Alta.
    Quais são os 3 deals específicos que o gestor deve focar hoje para garantir a meta?`,
    schema: { predicted_revenue: "number", confidence_level: "string", priority_deals: "array" }
  },
  "burnout-risk": {
    id: "burnout-risk",
    name: "Risco de Fadiga",
    category: "Performance",
    description: "Monitora saúde mental.",
    icon: "🔋",
    inputs: ["user"],
    prompt: (d) => `Analise o padrão de atividade do vendedor ${d.user} (Volume de ligações, tempo de resposta, tom dos registros).
    Há sinais de esgotamento ou queda brusca de entusiasmo?
    Se sim, sugira ao gestor uma abordagem empática ou um dia de folga estratégico.
    O objetivo é manter a performance de longo prazo, não apenas o curto prazo.`,
    schema: { fatigue_risk_score: "number", signs_detected: "array", manager_advice: "string" }
  },
  "sales-velocity-calculator": {
    id: "sales-velocity-calculator",
    name: "Calculadora Velocidade",
    category: "Performance",
    description: "Mede velocidade de receita.",
    icon: "🏎️",
    inputs: ["count", "value", "conv", "cycle"],
    prompt: (d) => `Calcule a 'Velocidade de Vendas' para este time: leads no funil (${d.count}), ticket médio (${d.value}), taxa de conversão (${d.conv}%) e ciclo de venda (${d.cycle} dias).
    Interprete o resultado. Como podemos aumentar essa velocidade? (Ex: Diminuir o ciclo em 5 dias ou aumentar o ticket?)
    Mostre o impacto financeiro de cada mudança.`,
    schema: { velocity_result: "number", interpretation: "string", optimization_impact: "object" }
  },
  "objection-handling-score": {
    id: "objection-handling-score",
    name: "Nota de Contorno",
    category: "Performance",
    description: "Avalia resposta a objeção.",
    icon: "🙅",
    inputs: ["objection", "reply"],
    prompt: (d) => `Analise este diálogo. Lead: "${d.objection}". Vendedor: "${d.reply}".
    Dê uma nota de 0 a 10 para o contorno de objeção.
    O vendedor foi empático? Ele fez uma pergunta de controle depois?
    Reescreva a resposta do vendedor para que ela seja uma 'Resposta Nota 10'.`,
    schema: { score: "number", feedback: "string", perfect_reply: "string" }
  },
  "meeting-quality-analyzer": {
    id: "meeting-quality-analyzer",
    name: "Analisador de Reunião",
    category: "Performance",
    description: "Nota da demo/call.",
    icon: "🎥",
    inputs: ["transcript"],
    prompt: (d) => `Analise a transcrição desta reunião: "${d.transcript}".
    1. O vendedor descobriu a dor real? 2. Ele falou mais do que o lead (Talk/Listen Ratio)?
    3. Ficou claro o próximo passo (Next Steps)?
    Dê uma nota geral e liste os 3 momentos onde o deal quase foi perdido.`,
    schema: { score: "number", talk_listen_ratio: "string", critical_moments: "array", next_steps_clear: "boolean" }
  },
  "ideal-customer-refiner": {
    id: "ideal-customer-refiner",
    name: "Refinador de ICP",
    category: "Performance",
    description: "Ajusta alvo.",
    icon: "🎯",
    inputs: [],
    prompt: (d) => `Analise os últimos 10 negócios fechados (Wins).
    Quais são os padrões comuns (Setor, Cargo, Dor, Tecnologia usada)?
    Com base nisso, como devemos mudar nosso Perfil de Cliente Ideal (ICP) para o próximo trimestre?
    Identifique um tipo de lead que devemos parar de buscar imediatamente porque não converte.`,
    schema: { new_icp_definition: "object", target_segments: "array", negative_icp_traits: "array" }
  },

  // --- CATEGORIA 9: ADICIONAIS DE ELITE ---
  "referral-generator": {
    id: "referral-generator",
    name: "Gerador de Indicação",
    category: "Estratégia",
    description: "Pede indicações naturalmente.",
    icon: "🗣️",
    inputs: ["name", "sector", "role"],
    prompt: (d) => `O cliente ${d.name} acabou de ter um resultado positivo com o nosso produto.
    Gere um e-mail para pedir uma indicação.
    Não peça 'qualquer pessoa'. Peça especificamente por 2 contatos no setor ${d.sector} ou cargos de ${d.role}.
    Facilite a vida dele dando um texto pronto que ele só precise dar 'Forward'.`,
    schema: { referral_email: "string", forward_ready_text: "string", logic: "string" }
  },
  "video-script-ai": {
    id: "video-script-ai",
    name: "Roteiro de Vídeo",
    category: "Inteligência",
    description: "Vídeo rápido de prospecção.",
    icon: "📹",
    inputs: ["name"],
    prompt: (d) => `Crie um roteiro para um vídeo de 60 segundos para o lead ${d.name}.
    Instruções de cena: O que mostrar na tela (Ex: o site do lead)?
    Script de fala: Abertura impactante + Problema + Nossa Solução + CTA.
    Foque em ser visual e direto.`,
    schema: { scene_instructions: "array", spoken_script: "string", duration_est: "string" }
  },
  "churn-predictor": {
    id: "churn-predictor",
    name: "Preditivo Cancelamento",
    category: "Performance",
    description: "Risco de saída de cliente.",
    icon: "📉",
    inputs: ["company"],
    prompt: (d) => `Analise os dados de uso do cliente ${d.company}.
    Houve queda no login? Falta de abertura de e-mails? Reclamações no suporte?
    Atribua um 'Risco de Churn' de 0 a 100.
    Gere um plano de 'Salva-Vidas' imediato para o Customer Success agir hoje.`,
    schema: { churn_risk: "number", red_flags: "array", recovery_plan: "string" }
  },
  "partnership-identifier": {
    id: "partnership-identifier",
    name: "Identificador Parcerias",
    category: "Estratégia",
    description: "Empresas para Co-selling.",
    icon: "👯‍♀️",
    inputs: ["product", "sector"],
    prompt: (d) => `Para o nosso produto ${d.product}, quais outras empresas (não concorrentes) vendem para os mesmos leads no setor ${d.sector}?
    Sugira 3 parceiros ideais para fazermos 'Co-selling' (venda conjunta).
    Explique como uma indicação mútua beneficiaria o cliente final.`,
    schema: { potential_partners: "array", co_selling_pitch: "string" }
  },
  "product-market-fit": {
    id: "product-market-fit",
    name: "Analisador Fit Produto",
    category: "Estratégia",
    description: "Valida relevância.",
    icon: "🧩",
    inputs: ["feature", "sector"],
    prompt: (d) => `Analise a funcionalidade "${d.feature}" do nosso produto.
    No setor ${d.sector}, essa funcionalidade resolve um problema 'Nice-to-have' (Desejável) ou um 'Pain-killer' (Necessário)?
    Se for Nice-to-have, como podemos re-posicioná-la para parecer uma necessidade urgente?`,
    schema: { fit_level: "string", positioning_pivot: "string", target_pain: "string" }
  },
  "competitive-pricing-ai": {
    id: "competitive-pricing-ai",
    name: "Precificação Competitiva",
    category: "Estratégia",
    description: "Preço ideal para ganhar.",
    icon: "🏷️",
    inputs: ["competitor", "price", "company"],
    prompt: (d) => `O concorrente ${d.competitor} cobra aproximadamente ${d.price}.
    Para ganhar o negócio na ${d.company}, qual deve ser nosso posicionamento de preço?
    Devemos ser: A) Premium; B) Mais Barato; C) Valor Igual com mais entrega.
    Justifique com base na força da marca e maturidade do cliente.`,
    schema: { recommended_positioning: "string", price_anchor_script: "string" }
  },
  "sales-playbook-generator": {
    id: "sales-playbook-generator",
    name: "Gerador de Playbook",
    category: "Estratégia",
    description: "Manual de acertos.",
    icon: "📘",
    inputs: [],
    prompt: (d) => `Com base nos nossos 10 melhores fechamentos deste mês, gere um 'Mini-Playbook' para novos vendedores.
    O que funcionou? Qual foi o gancho? Como contornamos as objeções?
    Estruture em: 1. Perfil do Lead; 2. Abordagem Vencedora; 3. Momento do Fechamento.`,
    schema: { playbook_sections: "array", key_learnings: "array" }
  },
  "user-behavior-analysis": {
    id: "user-behavior-analysis",
    name: "Análise Comportamento",
    category: "Performance",
    description: "Engajamento com proposta.",
    icon: "🖱️",
    inputs: [],
    prompt: (d) => `O lead abriu sua proposta 5 vezes e passou 80% do tempo na página de 'Preços'.
    O que isso significa psicologicamente?
    Ele está comparando? Ele está assustado?
    Gere um script de follow-up que ataque essa dúvida de preço de forma sutil, sem dizer que você estava espionando o comportamento dele.`,
    schema: { behavioral_insight: "string", recommended_action: "string", follow_up_script: "string" }
  },
  "ai-email-replier": {
    id: "ai-email-replier",
    name: "Sugestão Resposta Email",
    category: "Automação",
    description: "Resposta rápida.",
    icon: "↩️",
    inputs: ["email"],
    prompt: (d) => `O lead enviou este e-mail: "${d.email}".
    Qual o objetivo oculto dele? (Ex: Ele quer um desconto mas não disse explicitamente).
    Gere uma resposta que: 1. Valide o ponto dele; 2. Mantenha o valor do produto; 3. Proponha um próximo passo claro (CTA).`,
    schema: { hidden_intent: "string", suggested_reply: "string", tactical_advice: "string" }
  },
  "cold-calling-navigator": {
    id: "cold-calling-navigator",
    name: "Navegador Cold Call",
    category: "Automação",
    description: "Guia em tempo real.",
    icon: "🧭",
    inputs: ["name"],
    prompt: (d) => `O vendedor está em uma Cold Call com ${d.name}.
    Se o lead disser 'Estou em reunião', o que o vendedor diz?
    Se o lead disser 'Não tenho interesse', como o vendedor faz a pergunta de descoberta?
    Crie uma árvore de decisão de 3 níveis para esta chamada específica.`,
    schema: { decision_tree: "object", opener: "string", objection_handlers: "array" }
  }
};

window.ADVANCED_TOOLS = ADVANCED_TOOLS;
