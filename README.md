# Portal de Inteligência de Vendas com IA

Este é um portal completo de prospecção e gerenciamento de leads, construído como uma aplicação de página única (SPA) em HTML, CSS e JavaScript. Ele utiliza as APIs do Google Gemini e da OpenAI para enriquecimento de dados, análise de mercado, geração de scripts de vendas e qualificação de leads por CNAE.

## Funcionalidades Principais

- **Dashboard Centralizado:** Todas as ferramentas são organizadas em cards para fácil acesso.
- **Diretório de Leads:** Visualize e gerencie sua lista de contatos.
- **Cadastro e Qualificação:** Adicione leads manualmente ou qualifique-os automaticamente através de uma consulta por CNPJ, com validação de CNAE.
- **Enriquecimento com IA:** Obtenha dados detalhados (endereço, contatos, decisores) para cada lead usando Gemini e OpenAI. A estrutura está pronta para ser estendida para usar a **Apollo.io** para dados ainda mais profundos.
- **Kit de Prospecção:** Gere scripts de e-mail, ligação e controle de objeções personalizados para cada prospect.
- **Análise de Mercado:** Gere um resumo executivo sobre o cenário automotivo com base nos seus dados.
- **Chatbots de IA:** Converse diretamente com o Gemini e o ChatGPT para obter insights rápidos.
- **Visualização de Dados:** Gráficos que mostram a distribuição do seu portfólio de leads.
- **Backup e Restauração:** Faça o backup de seus dados para um arquivo local e restaure-os quando necessário.
- **Persistência de Dados:** Todas as informações são salvas automaticamente no `localStorage` do seu navegador.

## 🔐 Pilar 1: Infraestrutura & Segurança

A plataforma agora conta com uma camada de segurança simulada para demonstrar arquitetura empresarial:

1.  **Autenticação Multi-Tenant:** Sistema de login com isolamento de dados por Organização.
    *   **Usuário de Teste:** Digite qualquer nome (ex: `Tester`).
    *   **Papéis (RBAC):** Escolha entre `Admin` (Acesso Total) ou `Vendedor` (Limitado).
    *   **2FA (Simulado):** Ao logar, um prompt pedirá um código. **Use o código `123456`**.
2.  **Criptografia:** Dados sensíveis (Email, Telefone) são criptografados antes de serem salvos no `localStorage`.
3.  **Logs de Auditoria:** Todas as ações críticas (Login, Exportação, Enriquecimento) são registradas e visíveis no Painel de Segurança (apenas Admins).
4.  **Conformidade LGPD:** Ferramenta "Esquecer Dados" para anonimizar registros de um email específico.

## 📡 Pilar 2: Motor de Aquisição de Dados

Novas ferramentas para capturar e validar dados de leads:

1.  **Validação de CNPJ (BrasilAPI):** Consulta em tempo real na Receita Federal para validar status e CNAE.
2.  **Importador de Dados (Scraper Simulado):** Modal "Importar" que aceita texto copiado do LinkedIn ou vagas de emprego e extrai automaticamente Nome, Cargo e Empresa.
3.  **Enriquecimento Avançado:**
    *   **Tech Stack:** Simulação de detecção de tecnologias (VTEX, Salesforce, etc.).
    *   **Tráfego Web:** Estimativa de visitas mensais.
    *   **Domínio:** Verificação de idade do domínio (Whois).
    *   **Validação de Contato:** Verificação de formato e probabilidade de WhatsApp.

## 🚀 Configuração Rápida (MUITO IMPORTANTE)

Para que a aplicação funcione corretamente, você **PRECISA** inserir suas chaves de API.

1. **Abra o arquivo `script.js`** em um editor de texto (como Bloco de Notas, VS Code, etc.).
2. **Localize as seguintes linhas** no topo do arquivo:
   ```javascript
   const GEMINI_API_KEY = "SUA_CHAVE_GEMINI_AQUI"; 
   const OPENAI_API_KEY = "SUA_CHAVE_OPENAI_AQUI";
   const APOLLO_API_KEY = "SUA_CHAVE_APOLLO_AQUI"; // Chave para enriquecimento avançado
   ```
3. **Substitua** `"SUA_CHAVE_GEMINI_AQUI"`, `"SUA_CHAVE_OPENAI_AQUI"` e `"SUA_CHAVE_APOLLO_AQUI"` pelas suas chaves de API correspondentes.
4. Salve o arquivo `script.js`.
5. Abra o arquivo `index.html` no seu navegador.

### ⚠️ AVISO DE SEGURANÇA

**NUNCA** compartilhe o arquivo `script.js` com suas chaves preenchidas. **NUNCA** suba este arquivo para um repositório público no GitHub ou hospede em um site público. Suas chaves de API são secretas e dão acesso às suas contas pagas. Mantê-las seguras é sua responsabilidade.

---

## Como Treinar e Melhorar a IA

Você perguntou como "treinar a inteligência" por trás do portal. A resposta é que você já está fazendo isso através de uma técnica poderosa chamada **Engenharia de Prompt** e **RAG (Retrieval-Augmented Generation)**.

1. **Engenharia de Prompt (O que você já faz):**
   * **Como funciona:** Toda vez que você pede para a IA "Gerar Kit de Prospecção" ou "Enriquecer Dados", o código pega as informações daquele lead específico (nome do grupo, etc.) e as insere em um "molde" de pergunta que eu criei (o "prompt").
   * **Como Melhorar:** Você pode editar os prompts dentro do arquivo `script.js`. Por exemplo, na função `generateSalesKit`, você pode mudar o texto do prompt para pedir um tom mais formal, ou para focar em um benefício específico da "Auto Arremate". Quanto mais específico e detalhado for o seu pedido no prompt, melhor será a resposta da IA.

2. **Retrieval-Augmented Generation (RAG):**
   * **Como funciona:** Este é um nome técnico para o que a aplicação faz: ela **recupera** dados (ex: o CNPJ que você digitou) e **aumenta** o prompt com essa informação antes de enviá-lo para a IA. É uma forma de dar contexto à IA sem precisar retreiná-la. O "Resumo de Mercado" é um ótimo exemplo: ele pega os dados de *todos* os seus leads para gerar uma análise completa.
   * **Como Melhorar:** Quanto mais dados de qualidade você tiver no seu diretório, melhores serão as análises geradas. Ao adicionar e enriquecer leads, você está, na prática, criando uma base de conhecimento para a IA consultar.

3. **Fine-Tuning (Nível Avançado):**
   * Este é o processo de realmente treinar o modelo da IA com um grande volume de dados (milhares de exemplos). É um processo complexo, caro e que exige conhecimento técnico avançado, geralmente realizado por empresas especializadas. Para as necessidades deste portal, a **Engenharia de Prompt** e o **RAG** que já estão implementados são as formas mais eficazes e acessíveis de aprimorar os resultados.

## Automação de Contatos

Você também pediu para automatizar os contatos. Dentro de um arquivo HTML, a forma mais direta de fazer isso é:

* **E-mail:** O portal poderia ter um botão "Enviar E-mail" que usa o script gerado e abre o programa de e-mail padrão do seu computador (`mailto:`) com o destinatário, assunto e corpo já preenchidos.
* **WhatsApp/Telefone:** Botões "Ligar" ou "Enviar WhatsApp" podem ser criados para iniciar a chamada ou abrir o WhatsApp com o número do lead.

A automação completa (enviar e-mails e mensagens em massa sem intervenção manual) e a integração com APIs como **Apollo.io, Slack ou Jira** exigem serviços de terceiros e, obrigatoriamente, um **backend** para gerenciar essas operações de forma segura. O `script.js` possui um espaço reservado para a chave da Apollo, mas a chamada real a essa API deve ser feita a partir de um servidor para proteger sua chave e lidar com as políticas de segurança da web (CORS).
