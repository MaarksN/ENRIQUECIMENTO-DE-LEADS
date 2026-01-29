import { AIToolConfig } from '../../types';

export const TOOLS_REGISTRY: AIToolConfig[] = [
  {
    id: 'prospecting_cold_email',
    name: 'Gerador de Cold Email',
    description: 'Crie emails de prospecção altamente personalizados baseados no perfil do lead.',
    category: 'prospecting',
    inputs: [
      { name: 'companyName', label: 'Nome da Empresa', type: 'text', placeholder: 'Ex: Acme Corp' },
      { name: 'decisionMaker', label: 'Nome do Decisor', type: 'text', placeholder: 'Ex: João Silva' },
      { name: 'valueProp', label: 'Proposta de Valor', type: 'textarea', placeholder: 'Qual o principal benefício do seu produto?' }
    ],
    promptTemplate: `Escreva um email de prospecção (Cold Email) para {{decisionMaker}} da empresa {{companyName}}.

    A proposta de valor principal é: {{valueProp}}.

    O email deve ser curto, persuasivo e focado em marcar uma reunião. Use a estrutura AIDA (Atenção, Interesse, Desejo, Ação).`,
    systemRole: 'Especialista em Cold Mailling e Copywriting B2B'
  },
  {
    id: 'strategy_objection_handling',
    name: 'Matriz de Objeções',
    description: 'Antecipe e contorne as principais objeções do seu cliente.',
    category: 'strategy',
    inputs: [
      { name: 'product', label: 'Produto/Serviço', type: 'text', placeholder: 'Ex: CRM de Vendas' },
      { name: 'targetAudience', label: 'Público Alvo', type: 'text', placeholder: 'Ex: Gerentes de Marketing' }
    ],
    promptTemplate: `Crie uma lista com as 5 principais objeções que um {{targetAudience}} poderia ter ao comprar {{product}}.
    Para cada objeção, forneça uma resposta curta e matadora para contornar a situação e avançar a negociação.`,
    systemRole: 'Especialista em Negociação e Vendas Consultivas'
  },
  {
    id: 'copywriting_linkedin_post',
    name: 'Post para LinkedIn',
    description: 'Crie posts engajadores para atrair leads no LinkedIn.',
    category: 'copywriting',
    inputs: [
      { name: 'topic', label: 'Tópico do Post', type: 'text', placeholder: 'Ex: Inteligência Artificial em Vendas' },
      { name: 'tone', label: 'Tom de Voz', type: 'select', options: ['Profissional', 'Inspirador', 'Polêmico', 'Educativo'] }
    ],
    promptTemplate: `Escreva um post para LinkedIn sobre "{{topic}}".
    Tom de voz: {{tone}}.
    Inclua 3 hashtags relevantes no final. O post deve incentivar comentários e compartilhamentos.`,
    systemRole: 'Especialista em Marketing de Conteúdo e LinkedIn'
  }
];
