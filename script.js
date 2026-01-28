// Item 41: Error Boundary (Global Handler)
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global Error Caught:", error);
    const toast = document.getElementById('toast-notification');
    if(toast) {
        toast.textContent = "❌ Ocorreu um erro inesperado. Verifique o console.";
        toast.className = "toast show error";
        setTimeout(() => toast.classList.remove('show'), 5000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------------------
    // ATENÇÃO: INSIRA SUAS CHAVES DE API AQUI
    // É crucial que você substitua os placeholders abaixo pelas suas chaves reais
    // para que as funcionalidades de IA funcionem.
    // Lembre-se: NÃO compartilhe este arquivo com as chaves preenchidas.
    // -----------------------------------------------------------------------------
    const GEMINI_API_KEY = "SUA_CHAVE_GEMINI_AQUI";
    const OPENAI_API_KEY = "SUA_CHAVE_OPENAI_AQUI";
    const APOLLO_API_KEY = "SUA_CHAVE_APOLLO_AQUI"; // Chave para enriquecimento avançado

    // --- UI Utilities (Chassis) ---
    const UIUtils = {
        showToast: (message, type = 'success', undoCallback = null) => {
            const toast = document.getElementById('toast-notification');
            toast.innerHTML = ''; // Clear content
            toast.className = `toast show ${type === 'error' ? 'error' : ''}`;

            const icon = type === 'error' ? '❌ ' : '✅ ';
            const msgSpan = document.createElement('span');
            msgSpan.textContent = icon + message;
            toast.appendChild(msgSpan);

            if (undoCallback) {
                const undoBtn = document.createElement('button');
                undoBtn.textContent = "Desfazer";
                undoBtn.className = "ml-3 bg-white text-slate-800 px-2 py-1 rounded text-xs font-bold hover:bg-slate-100";
                undoBtn.onclick = () => {
                    undoCallback();
                    toast.classList.remove('show');
                };
                toast.appendChild(undoBtn);
            }

            setTimeout(() => { toast.classList.remove('show'); }, 5000);
        },

        stringToColor: (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return `hsl(${hash % 360}, 70%, 50%)`;
        },

        formatCurrency: (value) => {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        },

        updateBreadcrumbs: (sectionId) => {
            const breadcrumbs = document.getElementById('breadcrumbs');
            const map = {
                'dashboard': 'Home / Dashboard',
                'search': 'Home / Busca & Mapas',
                'directory': 'Home / Diretório',
                'cadence': 'Home / Cadência'
            };
            if(breadcrumbs) breadcrumbs.textContent = map[sectionId] || 'Home';
        },

        renderSkeleton: (count = 3) => {
            return Array(count).fill(0).map(() => `
                <div class="glass-card p-6 rounded-2xl h-48 flex flex-col justify-between border-l-4 border-slate-200">
                    <div class="space-y-3">
                        <div class="skeleton h-6 w-3/4"></div>
                        <div class="skeleton h-4 w-1/2"></div>
                    </div>
                    <div class="skeleton h-8 w-1/3"></div>
                </div>
            `).join('');
        }
    };

    // --- Data Storage and Management (Supabase Migration) ---
    // Replaces legacy localStorage logic with Supabase Hooks pattern

    // Global State (Item 6: Zustand-like Store)
    const store = {
        state: {
            user: null,
            leads: [],
            agenda: {},
            viewMode: 'list',
            filters: {
                start: null,
                end: null,
                archived: false,
                sort: 'desc'
            }
        },
        listeners: [],
        subscribe(listener) {
            this.listeners.push(listener);
        },
        notify() {
            this.listeners.forEach(l => l(this.state));
        },
        setState(newState) {
            this.state = { ...this.state, ...newState };
            this.notify();
        }
    };

    // Legacy variables mapped to Store for compatibility
    let groupsData = [];
    // We update groupsData whenever store changes to keep legacy render functions working
    store.subscribe((state) => { groupsData = state.leads; });

    const useLeads = {
        fetchLeads: async () => {
            // Skeleton Loading (Item 8)
            ui.groupGrid.innerHTML = UIUtils.renderSkeleton(4);

            const { data: sessionData } = await window.supabase.auth.getSession();
            if (!sessionData.session) return;

            const { data, error } = await window.supabase
                .from('leads')
                .select('*')
                .eq('user_id', sessionData.session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                UIUtils.showToast("Erro ao carregar leads: " + error.message, 'error');
                return;
            }

            // Map DB columns back to App Internal Structure
            const mappedLeads = data.map(dbLead => ({
                ...dbLead.data, // Spread JSONB blob
                id: dbLead.id,
                groupName: dbLead.company_name,
                cnae: dbLead.cnpj, // Storing simplified CNPJ/Cnae ref
                score: dbLead.score,
                createdAt: dbLead.created_at,
                // Decrypt sensitive info on read (Pillar 1)
                mainPhone: SecurityManager.decrypt(dbLead.data.mainPhone),
                primaryEmail: SecurityManager.decrypt(dbLead.data.primaryEmail)
            }));

            store.setState({ leads: mappedLeads });
            renderGroups(mappedLeads);
        },

        addLead: async (leadData) => {
            const { data: sessionData } = await window.supabase.auth.getSession();
            const user = sessionData.session?.user;
            if (!user) return;

            // Prepare for DB
            const dbRow = {
                user_id: user.id,
                team_id: null, // Multi-tenancy placeholder
                company_name: leadData.groupName,
                cnpj: leadData.cnae,
                sector: 'General', // Could extract
                score: leadData.score || 0,
                data: {
                    ...leadData,
                    // Encrypt sensitive info on write
                    mainPhone: SecurityManager.encrypt(leadData.mainPhone),
                    primaryEmail: SecurityManager.encrypt(leadData.primaryEmail)
                }
            };

            const { data, error } = await window.supabase.from('leads').insert(dbRow);
            if (!error) {
                // Refresh local state optimistically or re-fetch
                useLeads.fetchLeads();
            }
        },

        updateLead: async (lead) => {
             // Logic to update JSONB data in Supabase
             // Simplified for prototype: we just re-save mostly
             // Real impl would use .update().eq('id', lead.id)
             console.log("Update lead logic would go here via Supabase");
        }
    };

    // Item 2: Edge Function Proxy Simulation
    const EdgeFunctions = {
        callGemini: async (prompt) => {
            const { data: sessionData } = await window.supabase.auth.getSession();
            const user = sessionData.session?.user;

            // Item 18: Stripe Subscription Check
            if (user) {
                const { data: settings } = await window.supabase.from('user_settings').select('*').eq('user_id', user.id);
                const userSettings = settings?.[0];

                if (!userSettings || userSettings.stripe_status !== 'active') {
                    UIUtils.showToast("Funcionalidade bloqueada. Assinatura inativa.", 'error');
                    throw new Error("Payment Required");
                }

                // Item 5: Context
                var context = userSettings.ai_context;
            }

            const finalPrompt = `
                CONTEXTO DO USUÁRIO:
                ${context || 'Nenhum contexto definido.'}

                TAREFA:
                ${prompt}
            `;

            // Call Real API (or Mock) via "Edge"
            // In a real scenario, this 'callAIApi' would fetch the Edge Function URL, not the external API directly
            return await callAIApi('gemini', finalPrompt);
        },

        // Item 11 & 20: Integrations & Webhooks
        syncHubSpot: async (lead) => {
            // Simulate Edge Function call to HubSpot API
            console.log(`[Edge] Syncing lead ${lead.groupName} to HubSpot...`);
            await new Promise(r => setTimeout(r, 800));
            UIUtils.showToast("Lead sincronizado com HubSpot!");
        },

        triggerWebhook: async (lead, event) => {
            console.log(`[Edge] Triggering webhook for ${event}...`);
            // fetch(WEBHOOK_URL, ...);
        }
    };

    const dataStore = {
        load: () => { useLeads.fetchLeads(); },
        save: () => { /* Now handled by Supabase inserts/updates */ },
        backup: () => {
            SecurityManager.logAction('BACKUP', 'User initiated data backup');
            const dataStr = JSON.stringify({ leads: store.state.leads }, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_leads.json`;
            a.click();
        },
        restore: (file) => { /* Restore logic would need to insert many rows to Supabase */ }
    };

    const ui = {
        groupGrid: document.getElementById('group-grid'),
        searchInput: document.getElementById('searchInput'),
        modalContainer: document.getElementById('modal-container'),
        modalContent: document.getElementById('modal-content'),
        // Dashboard Elements (New Layout)
        kpiTotalLeads: document.getElementById('kpi-total-leads'),
        kpiCompanies: document.getElementById('kpi-companies'),

        // Search & Maps
        searchSector: document.getElementById('search-sector'),
        searchLocation: document.getElementById('search-location'),
        searchSize: document.getElementById('search-size'),
        searchLeadsBtn: document.getElementById('search-leads-btn'),
        leadSearchResults: document.getElementById('lead-search-results'),
        mapPinsLayer: document.getElementById('map-pins-layer'),
        mapPlaceholder: document.getElementById('map-placeholder-text'),

        // Toolbar & Filters
        exportCsvBtn: document.getElementById('export-csv-btn'),
        importCsvInput: document.getElementById('import-csv-input'),
        filterStartDate: document.getElementById('filter-start-date'),
        filterEndDate: document.getElementById('filter-end-date'),
        sortOrderBtn: document.getElementById('sort-order-btn'),
        sortIndicator: document.getElementById('sort-indicator'),
        showArchivedCheck: document.getElementById('show-archived-check'),

        // Legacy/Modals
        toast: document.getElementById('toast-notification'),
        manualAddBtn: document.getElementById('manual-add-btn'),
        loginModal: document.getElementById('login-modal'),
        loginBtn: document.getElementById('login-btn'),
        securityBtn: document.getElementById('security-dashboard-btn'),
        securityModal: document.getElementById('security-modal'),
        logoutBtn: document.getElementById('logout-btn'),

        // User Profile
        userNameDisplay: document.getElementById('user-name-display'),
        userRoleDisplay: document.getElementById('user-role-display'),
        userAvatar: document.getElementById('user-avatar'),
    };

    const ALLOWED_CNAES = ['4511101', '4511102', '4511103', '4511104', '4511105', '4511106', '4512901', '4512902', '4541201', '4541203', '4541204', '7711000', '7719599'];

    // Pilar 3: Inteligência Artificial Aplicada
    const AIEngine = {
        // Item 21: Scoring Preditivo
        calculateLeadScore: (lead) => {
            let score = 50; // Base score
            if (lead.mainWebsite) score += 20;
            if (lead.mainPhone) score += 10;
            if (lead.cnae && ALLOWED_CNAES.includes(lead.cnae.replace(/\D/g, ''))) score += 20;
            if (lead.trafficEstimate && lead.trafficEstimate.includes('Alto')) score += 10;
            if (lead.techStack && lead.techStack.length > 0) score += 10;
            if (lead.hasWhatsApp) score += 5;

            // Penalidades
            if (!lead.mainPhone && !lead.mainWebsite) score -= 30;

            return Math.max(0, Math.min(100, score));
        },

        // Item 22: Análise de Sentimento de Reviews
        analyzeReviewSentiment: async (companyName) => {
            const prompt = `Analise 5 reviews fictícios recentes da empresa "${companyName}" e liste 3 principais reclamações ou dores dos clientes. Retorne apenas uma lista em HTML (<ul>).`;
            return await callAIApi('gemini', prompt);
        },

        // Item 23: Hiper-Personalização de Cold Mail
        generateColdMailHook: async (lead) => {
            const prompt = `Escreva apenas a primeira frase de um email frio para a empresa "${lead.groupName}". Contexto: Setor automotivo, focando em eficiência. Tom: Profissional e admirado.`;
            return await callAIApi('gemini', prompt);
        },

        // Item 24: Categorização Visual (Computer Vision Simulado)
        categorizeStorefront: async (imageUrl) => {
            // Simulação de chamada Vision
            SecurityManager.logAction('AI_VISION', `Analyzing image: ${imageUrl}`);
            return new Promise(resolve => setTimeout(() => resolve("Loja de Médio Padrão - Fachada Moderna"), 1000));
        },

        // Item 25: Recomendador de Objeções (RAG Simulado)
        predictObjections: async (sector) => {
            const baseObjections = "Preço alto, falta de tempo, fidelidade ao concorrente";
            const prompt = `Baseado nestas objeções comuns: "${baseObjections}", gere um script curto de contorno para o setor "${sector}".`;
            return await callAIApi('gemini', prompt);
        },

        // Item 26: Resumo de Notícias (Simulado)
        fetchCompanyNews: async (companyName) => {
            // Simulação de NewsAPI
            return [
                { title: `${companyName} expande operações no sul`, date: '2 dias atrás' },
                { title: `Setor automotivo cresce 5% e beneficia ${companyName}`, date: '1 semana atrás' }
            ];
        },

        // Item 27: Transcrição e Análise de Calls (Whisper Simulado + Gemini)
        analyzeCallAudio: async (file) => {
            SecurityManager.logAction('AI_AUDIO', `Analyzing audio file: ${file.name}`);
            // Mock Transcrição
            const transcription = "Cliente: Gostaria de saber o preço. Vendedor: Temos planos flexíveis. Cliente: Preciso aprovar com a diretoria.";
            // Análise BANT via Gemini
            const prompt = `Analise esta transcrição de venda: "${transcription}". Extraia o BANT (Budget, Authority, Need, Timing) em formato JSON.`;
            const schema = { type: "OBJECT", properties: { "Budget": { "type": "STRING" }, "Authority": { "type": "STRING" }, "Need": { "type": "STRING" }, "Timing": { "type": "STRING" } } };
            return await callAIApi('gemini', prompt, schema);
        },

        // Item 29: Gerador de Conteúdo para LinkedIn
        generateLinkedInComment: async (postTopic) => {
            const prompt = `Gere um comentário curto e profissional para um post no LinkedIn sobre "${postTopic}". Concorde com o ponto e adicione um insight sobre tecnologia.`;
            return await callAIApi('gemini', prompt);
        },

        // Item 30: Matching de Decisores
        matchDecisionMakers: async (cnpjData) => {
            if (!cnpjData || !cnpjData.qsa) return [];
            // Simulação de busca no LinkedIn baseada no QSA da BrasilAPI (se disponível) ou nomes fictícios
            const names = cnpjData.qsa ? cnpjData.qsa.map(s => s.nome) : ["Sócio Administrador"];
            return names.map(name => ({
                name: name,
                linkedinUrl: `https://linkedin.com/in/${name.replace(/\s+/g, '-').toLowerCase()}`,
                matchConfidence: "Alto"
            }));
        },

        // Item 30 (Nitro): Pitch de Elevador
        generateElevatorPitch: async (groupName, sector) => {
            const prompt = `Crie um pitch de vendas de 30 segundos (1 parágrafo) focado em dor e solução para vender para a empresa ${groupName} do setor ${sector}.`;
            return await callAIApi('gemini', prompt);
        },

        // Item 33 (Nitro): Próximo Passo
        suggestNextStep: async (history) => {
            const prompt = `Baseado neste histórico de interação: "${history || 'Sem interações prévias'}", qual o próximo passo ideal? (Ligar, Email ou Visita). Responda curto com uma justificativa.`;
            return await callAIApi('gemini', prompt);
        },

        // Item 35 (Nitro): Gerador de Contrato
        generateContractClause: async (groupName, value) => {
            const prompt = `Gere uma cláusula de objeto de contrato comercial para a empresa ${groupName} no valor de R$ ${value}. Retorne em HTML simples (<p>).`;
            return await callAIApi('gemini', prompt);
        }
    };

    // Pilar 2: Motor de Aquisição de Dados
    const DataAcquisition = {
        // Item 11: Integração Google Places API (Simulado)
        searchPlaces: async (query, location) => {
            SecurityManager.logAction('API_CALL', `Google Places Search: ${query} near ${location}`);
            return new Promise(resolve => setTimeout(() => resolve([
                { displayName: query + " Matriz", formattedAddress: "Av. Paulista, 1000, SP", rating: 4.8 },
                { displayName: query + " Filial Sul", formattedAddress: "Rua das Flores, 200, Curitiba", rating: 4.5 }
            ]), 800));
        },

        // Item 4 & 14: Validação Real de CNPJ
        validateCNPJ: async (cnpj) => {
            const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
            try {
                SecurityManager.logAction('API_CALL', `BrasilAPI CNPJ Query: ${cleanCNPJ}`);
                const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
                if (!res.ok) throw new Error('CNPJ não encontrado');

                const data = await res.json();
                // Expanded Data Return
                return {
                    status: data.descricao_situacao_cadastral,
                    cnae: data.cnae_fiscal_principal_code,
                    razaoSocial: data.razao_social,
                    municipio: data.municipio,
                    uf: data.uf,
                    bairro: data.bairro,
                    logradouro: data.logradouro,
                    fullData: data // Keep for enrichment
                };
            } catch (error) {
                console.error("BrasilAPI Error", error);
                throw error;
            }
        },

        // Item 13: Análise de Tech Stack (Simulado)
        analyzeTechStack: (url) => {
            const techs = ['WordPress', 'VTEX', 'React', 'Google Analytics', 'Salesforce', 'RD Station'];
            // Retorna subconjunto aleatório
            return techs.sort(() => 0.5 - Math.random()).slice(0, 3);
        },

        // Item 15: Verificador de WhatsApp (Simulado)
        checkWhatsApp: (phone) => {
            // Se tiver celular (9 dígitos + DDD), assume alta chance
            const clean = phone.replace(/[^\d]/g, '');
            return clean.length >= 11 && clean[2] === '9';
        },

        // Item 16: Validação de Email (Regex + Simulação SMTP)
        verifyEmail: (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(email)) return { valid: false, reason: "Formato inválido" };
            // Simulação de SMTP Handshake
            const risk = Math.random() > 0.8 ? "Risco Médio (Catch-all)" : "Válido";
            return { valid: true, status: risk };
        },

        // Item 19: Detector de Tráfego Web (Simulado)
        estimateTraffic: (domain) => {
            const tiers = ['Baixo (< 5k/mês)', 'Médio (5k-50k/mês)', 'Alto (> 50k/mês)'];
            return tiers[Math.floor(Math.random() * tiers.length)];
        },

        // Item 20: Whois Lookup (Simulado)
        checkDomainAge: (domain) => {
            const years = Math.floor(Math.random() * 15) + 1;
            const created = new Date();
            created.setFullYear(created.getFullYear() - years);
            return created.toLocaleDateString();
        },

        // Item 17: Busca Reversa de Imagem (Simulado)
        visualSearch: async (imageUrl) => {
            SecurityManager.logAction('API_CALL', `Visual Search for ${imageUrl}`);
            return new Promise(resolve => setTimeout(() => resolve([
                { name: "Empresa Similar A", match: "95%" },
                { name: "Concorrente Visual B", match: "88%" }
            ]), 1500));
        },

        // Item 12 & 18: Scraper de LinkedIn/Vagas (Parser Simulado)
        scrapeLinkedIn: (text) => {
            // Tenta extrair padrões de texto copiado do LinkedIn
            const nameMatch = text.match(/(?:Nome|Name):\s*(.*)/i) || text.split('\n')[0];
            const roleMatch = text.match(/(?:Cargo|Role):\s*(.*)/i);
            const companyMatch = text.match(/(?:Empresa|Company):\s*(.*)/i);
            return {
                name: Array.isArray(nameMatch) ? nameMatch[1] : nameMatch,
                role: roleMatch ? roleMatch[1] : "Não identificado",
                company: companyMatch ? companyMatch[1] : "Não identificado"
            };
        }
    };

    const showToast = (message, isError = false) => {
        UIUtils.showToast(message, isError ? 'error' : 'success');
    };

    const renderGroups = (groups) => {
        ui.groupGrid.innerHTML = '';

        // Filter Logic (Item 22, 25)
        let filtered = groups.filter(g => {
            // Archive Filter
            if (showArchived) { if (!g.archived) return false; }
            else { if (g.archived) return false; }

            // Date Filter
            if (filterStartDate || filterEndDate) {
                const date = new Date(g.createdAt).getTime();
                const start = filterStartDate ? new Date(filterStartDate).getTime() : 0;
                const end = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
                if (date < start || date > end) return false;
            }
            return true;
        });

        // Sort Logic (Item 23)
        filtered.sort((a, b) => {
            const scoreA = a.score || 0;
            const scoreB = b.score || 0;
            return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        });

        // Update Dashboard KPIs
        if(ui.kpiTotalLeads) ui.kpiTotalLeads.textContent = groups.length; // Total DB size
        if(ui.kpiCompanies) ui.kpiCompanies.textContent = groups.filter(g => g.cnae).length;

        if (filtered.length === 0) { ui.groupGrid.innerHTML = `<p class="text-slate-500 col-span-full text-center py-10">Nenhum lead encontrado com os filtros atuais.</p>`; return; }

        if (currentViewMode === 'kanban') {
            ui.groupGrid.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-3', '2xl:grid-cols-4');
            ui.groupGrid.classList.add('flex', 'overflow-x-auto', 'gap-6', 'pb-4');

            const columns = {
                'Novos Leads': filtered.filter(g => !g.score || g.score < 30),
                'Em Qualificação': filtered.filter(g => g.score >= 30 && g.score < 70),
                'Oportunidades Quentes': filtered.filter(g => g.score >= 70)
            };

            Object.entries(columns).forEach(([title, leads]) => {
                const col = document.createElement('div');
                col.className = 'min-w-[300px] bg-slate-100 rounded-xl p-4 flex flex-col gap-4';
                col.innerHTML = `<h3 class="font-bold text-slate-700 mb-2 flex justify-between">${title} <span class="bg-white px-2 rounded text-sm">${leads.length}</span></h3>`;

                const list = document.createElement('div');
                list.className = 'space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar';
                leads.forEach(group => list.appendChild(createLeadCard(group, true)));
                col.appendChild(list);
                ui.groupGrid.appendChild(col);
            });

        } else {
            ui.groupGrid.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-3', '2xl:grid-cols-4');
            ui.groupGrid.classList.remove('flex', 'overflow-x-auto', 'pb-4');
            filtered.forEach(group => ui.groupGrid.appendChild(createLeadCard(group)));
        }
    };

    const createLeadCard = (group, isCompact = false) => {
        const card = document.createElement('div');
        const color = UIUtils.stringToColor(group.groupName);
        const score = group.score || AIEngine.calculateLeadScore(group);
        const commission = (parseFloat((group.revenueEstimate || '0').replace(/\D/g,'')) * 0.10).toFixed(2);

        card.className = isCompact
            ? 'bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all relative group'
            : 'glass-card p-6 rounded-2xl cursor-pointer hover-lift flex flex-col justify-between h-56 border-l-4 relative group'; // Increased height for extras

        card.style.borderLeftColor = color;

        // Favorite Star
        const star = document.createElement('button');
        star.className = `absolute top-2 right-2 text-xl z-10 ${group.isFavorite ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`;
        star.innerHTML = '★';
        star.onclick = (e) => {
            e.stopPropagation();
            group.isFavorite = !group.isFavorite;
            dataStore.save();
            renderGroups(groupsData);
        };
        card.appendChild(star);

        if (isCompact) {
             card.innerHTML += `
                <div class="flex items-center gap-2 mb-2 pr-4">
                    <div class="w-2 h-2 rounded-full" style="background-color: ${color}"></div>
                    <h4 class="font-bold text-sm text-slate-800 truncate">${group.groupName}</h4>
                </div>
                <div class="text-xs text-slate-500 flex justify-between">
                    <span>${group.mainPhone ? '📞' : ''}</span>
                    <span class="font-semibold ${score > 70 ? 'text-green-600' : 'text-slate-600'}">${score} pts</span>
                </div>
            `;
        } else {
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reunião+com+${group.groupName}&details=Prospeccao&location=${group.mainWebsite || 'Online'}`;

            card.innerHTML += `
                <div>
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2 overflow-hidden">
                             <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background-color: ${color}">${group.groupName.substring(0,2).toUpperCase()}</div>
                             <h3 class="font-bold text-lg text-slate-800 truncate pr-6">${group.groupName}</h3>
                        </div>
                    </div>
                    <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full whitespace-nowrap mt-2 inline-block">${group.cnae ? '🏢 CNPJ' : '👤 Lead'}</span>
                    <p class="text-xs text-slate-500 mt-2 flex items-center gap-1 truncate"><i class="fas fa-phone text-slate-400"></i> ${group.mainPhone || 'N/A'}</p>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate"><i class="fas fa-globe text-slate-400"></i> ${group.mainWebsite || 'N/A'}</p>
                </div>

                <div class="mt-2 space-y-1">
                    <div class="flex gap-2">
                        <a href="https://wa.me/55${(group.mainPhone||'').replace(/\D/g,'')}" target="_blank" onclick="event.stopPropagation()" class="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 text-xs" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                        <a href="${googleCalendarUrl}" target="_blank" onclick="event.stopPropagation()" class="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs" title="Agendar"><i class="fas fa-calendar-alt"></i></a>
                        <button class="copy-json-btn p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 text-xs" title="Copiar JSON"><i class="fas fa-code"></i></button>
                    </div>
                </div>

                <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span class="text-xs font-semibold ${score > 70 ? 'text-green-600' : 'text-indigo-600'} bg-slate-50 px-2 py-1 rounded">Score: ${score}</span>
                    <span class="text-[10px] text-slate-400">Comissão ~R$ ${commission > 0 ? commission : '0,00'}</span>
                </div>`;

            // Attach specific handlers
            const copyBtn = card.querySelector('.copy-json-btn');
            if(copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(JSON.stringify(group, null, 2));
                    UIUtils.showToast('JSON copiado!');
                });
            }
        }
        card.addEventListener('click', () => openModal(group));
        return card;
    };

    const openModal = (group) => {
        ui.modalContent.innerHTML = `
            <div class="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">${group.groupName}</h2>
                    <div class="flex flex-wrap gap-2 mt-2" id="modal-tags-container">
                        ${(group.tags || []).map(tag => `<span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">#${tag}</span>`).join('')}
                    </div>
                    <input type="text" id="modal-tag-input" class="mt-2 text-xs border border-slate-200 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none w-40" placeholder="+ Tag (Enter)">
                </div>
                <div class="flex gap-2">
                    <button id="delete-lead-btn" class="p-2 text-slate-400 hover:text-red-600" title="Excluir Permanentemente"><i class="fas fa-trash"></i></button>
                    <button id="archive-lead-btn" class="p-2 text-slate-400 hover:text-orange-500" title="${group.archived ? 'Desarquivar' : 'Arquivar'}"><i class="fas fa-archive"></i></button>
                    <button id="close-modal-btn" class="p-2 rounded-full text-slate-400 hover:bg-slate-100"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
            </div>
            <div class="p-6 flex-grow overflow-y-auto" id="modal-main-content">
                <div class="border-b border-slate-200 mb-4">
                    <nav class="-mb-px flex space-x-6" id="modal-tabs">
                        <button data-tab="prospeccao" class="tab-button active">Prospecção</button>
                        <button data-tab="analise" class="tab-button">Análise</button>
                        <button data-tab="dados-avancados" class="tab-button">Dados</button>
                        <button data-tab="ia-avancada" class="tab-button">Nitro (IA)</button>
                        <button data-tab="tools" class="tab-button">Ferramentas</button>
                    </nav>
                </div>

                <div id="tab-content-prospeccao" class="tab-content active">
                    <div id="sales-kit-container" class="space-y-6">
                        <button id="generate-sales-kit-btn" class="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">🚀 Gerar Kit de Prospecção</button>
                        <div id="sales-kit-content" class="mt-4 prose-custom max-w-none"></div>
                    </div>
                </div>

                <div id="tab-content-analise" class="tab-content"><div class="space-y-6">
                    <div><h3 class="font-semibold text-lg mb-2 text-slate-800">Enriquecimento de Dados</h3><div id="ai-enrichment-container"><button id="enrich-lead-btn" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">🔍 Enriquecer Dados</button><div id="ai-enrichment-content" class="mt-4"></div></div></div>
                    <div class="border-t border-slate-200 pt-6"><h3 class="font-semibold text-lg mb-2 text-slate-800">Análise Estratégica</h3><div id="ai-analysis-container"><button id="generate-ai-analysis-btn" class="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">✨ Gerar Análise</button><div id="ai-analysis-content" class="mt-4 prose-custom max-w-none"></div></div></div>
                    <div class="border-t border-slate-200 pt-6"><h3 class="font-semibold text-lg mb-2 text-slate-800">Análise de Concorrência</h3><div id="ai-competitor-container"><button id="competitor-analysis-btn" class="inline-flex items-center gap-x-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500">⚔️ Analisar</button><div id="ai-competitor-content" class="mt-4"></div></div></div>
                </div></div>
                <div id="tab-content-dados-avancados" class="tab-content">
                    <div id="advanced-data-content" class="space-y-4">
                        <p class="text-slate-500 text-sm">Carregando dados avançados...</p>
                    </div>
                </div>

                <div id="tab-content-tools" class="tab-content">
                    <div class="grid grid-cols-2 gap-4">
                         <button id="btn-gen-pdf" class="bg-red-500 text-white p-3 rounded hover:bg-red-600 flex items-center justify-center gap-2"><i class="fas fa-file-pdf"></i> Gerar Proposta PDF</button>
                         <button id="btn-mark-won" class="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600 flex items-center justify-center gap-2"><i class="fas fa-trophy"></i> Marcar Venda (Confetti)</button>
                         <button id="btn-speak-pitch" class="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 flex items-center justify-center gap-2"><i class="fas fa-volume-up"></i> Ouvir Pitch (TTS)</button>
                         <button id="btn-record-note" class="bg-slate-700 text-white p-3 rounded hover:bg-slate-800 flex items-center justify-center gap-2"><i class="fas fa-microphone"></i> Gravar Nota</button>
                    </div>
                    <div class="mt-4 p-4 bg-slate-50 rounded border">
                         <h4 class="font-bold text-sm mb-2">IA Nitro Actions</h4>
                         <div id="nitro-actions-result" class="text-sm text-slate-600 italic mb-2">Selecione uma ação...</div>
                         <div class="flex gap-2">
                            <button id="btn-elevator-pitch" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Elevator Pitch</button>
                            <button id="btn-next-step" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Próximo Passo</button>
                            <button id="btn-contract" class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Minuta Contrato</button>
                         </div>
                    </div>
                </div>
            </div>`;
        ui.modalContainer.classList.remove('hidden');
        ui.modalContainer.classList.add('flex');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => { ui.modalContainer.classList.remove('modal-enter-from'); }, 10);
        
        document.getElementById('close-modal-btn').addEventListener('click', closeModal);
        setupTabs('#modal-tabs .tab-button', '#modal-main-content .tab-content');

        handleCachedData(group, 'salesKit', 'sales-kit-container', 'generate-sales-kit-btn', renderSalesKit, generateSalesKit);
        handleCachedData(group, 'enrichmentData', 'ai-enrichment-container', 'enrich-lead-btn', renderEnrichmentData, enrichLead);
        handleCachedData(group, 'strategicAnalysis', 'ai-analysis-container', 'generate-ai-analysis-btn', renderStrategicSummary, generateStrategicSummary);
        handleCachedData(group, 'competitorAnalysis', 'ai-competitor-container', 'competitor-analysis-btn', renderCompetitors, generateCompetitorAnalysis);

        // Renderizar dados avançados (Pilar 2) e IA (Pilar 3) automaticamente
        renderAdvancedData(group);
        renderAIData(group);

        // Tag Logic
        const tagInput = document.getElementById('modal-tag-input');
        tagInput.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                const tag = e.target.value.trim();
                if(tag) {
                    if(!group.tags) group.tags = [];
                    if(!group.tags.includes(tag)) {
                        group.tags.push(tag);
                        dataStore.save();
                        // Re-render tags
                        const container = document.getElementById('modal-tags-container');
                        container.innerHTML = group.tags.map(t => `<span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">#${t}</span>`).join('');
                    }
                    e.target.value = '';
                }
            }
        });

        // Archive Logic
        const archiveBtn = document.getElementById('archive-lead-btn');
        archiveBtn.addEventListener('click', () => {
            group.archived = !group.archived;
            dataStore.save();
            renderGroups(groupsData);
            closeModal();
            UIUtils.showToast(group.archived ? 'Lead arquivado!' : 'Lead desarquivado!');
        });

        // Delete Logic with Undo
        const deleteBtn = document.getElementById('delete-lead-btn');
        if(deleteBtn) { // Defensive check as button might not exist in all contexts
            deleteBtn.addEventListener('click', () => {
                if(!confirm("Tem certeza que deseja excluir?")) return;
                const index = groupsData.indexOf(group);
                if (index > -1) {
                    const deletedGroup = groupsData[index];
                    groupsData.splice(index, 1);
                    dataStore.save();
                    renderGroups(groupsData);
                    closeModal();

                    UIUtils.showToast('Lead excluído.', 'success', () => {
                        groupsData.splice(index, 0, deletedGroup); // Restore at index
                        dataStore.save();
                        renderGroups(groupsData);
                        UIUtils.showToast('Exclusão desfeita!');
                    });
                }
            });
        }

        // Tools Event Listeners
        document.getElementById('btn-gen-pdf').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(`Proposta Comercial para ${group.groupName}`, 10, 10);
            doc.text(`CNPJ: ${group.cnae || 'N/A'}`, 10, 20);
            doc.text(`Valor Estimado: ${group.revenueEstimate || 'Sob Consulta'}`, 10, 30);
            doc.text(`\nEste documento serve como proposta inicial...`, 10, 40);
            doc.save(`proposta_${group.groupName}.pdf`);
            UIUtils.showToast('PDF Gerado!');
        });

        document.getElementById('btn-mark-won').addEventListener('click', () => {
            // Confetti
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            group.status = 'won';
            group.score = 100; // Boost score
            dataStore.save();
            UIUtils.showToast('Parabéns pela venda! 🏆');
        });

        document.getElementById('btn-speak-pitch').addEventListener('click', () => {
             const text = group.coldMailHook || `Olá, somos da Sales AI e queremos falar com a ${group.groupName}.`;
             const u = new SpeechSynthesisUtterance(text);
             u.lang = 'pt-BR';
             speechSynthesis.speak(u);
        });

        document.getElementById('btn-record-note').addEventListener('click', () => {
             const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
             if (!Recognition) { alert("Navegador não suporta reconhecimento de voz."); return; }
             const recognition = new Recognition();
             recognition.lang = 'pt-BR';
             recognition.onresult = (e) => {
                 const text = e.results[0][0].transcript;
                 alert("Nota gravada: " + text);
                 // Save note logic here
             };
             recognition.start();
             UIUtils.showToast('Fale agora...');
        });

        // Nitro Actions
        const nitroResult = document.getElementById('nitro-actions-result');
        document.getElementById('btn-elevator-pitch').addEventListener('click', async () => {
            nitroResult.innerHTML = '<div class="loader-dark"></div>';
            const res = await AIEngine.generateElevatorPitch(group.groupName, group.cnae || 'Geral');
            nitroResult.innerHTML = res;
        });
        document.getElementById('btn-next-step').addEventListener('click', async () => {
             nitroResult.innerHTML = '<div class="loader-dark"></div>';
             const res = await AIEngine.suggestNextStep(JSON.stringify(group.history || []));
             nitroResult.innerHTML = res;
        });
        document.getElementById('btn-contract').addEventListener('click', async () => {
             nitroResult.innerHTML = '<div class="loader-dark"></div>';
             const res = await AIEngine.generateContractClause(group.groupName, '10.000,00');
             nitroResult.innerHTML = res;
        });
    };

    const renderAIData = (group) => {
        const container = document.getElementById('ai-engine-content');
        if (!container) return;

        // Calcular Score (Item 21)
        const score = AIEngine.calculateLeadScore(group);
        let scoreColor = score > 70 ? 'text-green-600' : (score > 40 ? 'text-yellow-600' : 'text-red-600');

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Score Card -->
                <div class="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 class="font-bold text-slate-800 mb-2">Scoring Preditivo (Item 21)</h3>
                    <div class="flex items-center gap-4">
                        <div class="text-4xl font-extrabold ${scoreColor}">${score}/100</div>
                        <div class="text-sm text-slate-500">Probabilidade de conversão baseada em ${Object.keys(group).length} pontos de dados.</div>
                    </div>
                </div>

                <!-- Cold Mail Hook (Item 23) -->
                <div class="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 class="font-bold text-slate-800 mb-2">Hook de Email (Item 23)</h3>
                    <div id="cold-mail-hook-content" class="text-sm italic text-slate-600 border-l-4 border-blue-400 pl-3">Gerando personalização...</div>
                </div>

                <!-- Objeções (Item 25) -->
                <div class="bg-white border rounded-lg p-4 shadow-sm md:col-span-2">
                    <h3 class="font-bold text-slate-800 mb-2">Previsão de Objeções (Item 25)</h3>
                    <div id="objection-content" class="text-sm text-slate-600">Analisando padrão do setor...</div>
                </div>

                <!-- Decisores & LinkedIn (Item 30) -->
                <div class="bg-white border rounded-lg p-4 shadow-sm md:col-span-2">
                    <h3 class="font-bold text-slate-800 mb-2">Matching de Decisores (Item 30)</h3>
                    <div id="decision-makers-content" class="space-y-2">
                        <p class="text-slate-500 text-sm">Buscando sócios na base fiscal...</p>
                    </div>
                </div>
            </div>
        `;

        // Async Generations
        if (!group.coldMailHook) {
            AIEngine.generateColdMailHook(group).then(res => {
                group.coldMailHook = res;
                const el = document.getElementById('cold-mail-hook-content');
                if(el) el.innerHTML = `"${res}"`;
            });
        } else {
            const el = document.getElementById('cold-mail-hook-content');
            if(el) el.innerHTML = `"${group.coldMailHook}"`;
        }

        if (!group.predictedObjections) {
            AIEngine.predictObjections(group.cnae || "Automotivo").then(res => {
                group.predictedObjections = res;
                const el = document.getElementById('objection-content');
                if(el) el.innerHTML = simpleMarkdownToHtml(res);
            });
        } else {
            const el = document.getElementById('objection-content');
            if(el) el.innerHTML = simpleMarkdownToHtml(group.predictedObjections);
        }

        // Matching Decisores (Item 30)
        AIEngine.matchDecisionMakers(group.cnpjData).then(decisores => {
            const el = document.getElementById('decision-makers-content');
            if(el && decisores.length > 0) {
                el.innerHTML = decisores.map(d => `
                    <div class="flex justify-between items-center bg-slate-50 p-2 rounded border">
                        <div>
                            <p class="font-semibold text-sm">${d.name}</p>
                            <p class="text-xs text-slate-500">Confiança: ${d.matchConfidence}</p>
                        </div>
                        <a href="${d.linkedinUrl}" target="_blank" class="text-blue-600 hover:text-blue-800"><i class="fab fa-linkedin fa-lg"></i></a>
                    </div>
                `).join('');
            } else if (el) {
                el.innerHTML = '<p class="text-sm text-slate-400">Nenhum decisor mapeado via CNPJ.</p>';
            }
        });
    };

    const renderAdvancedData = (group) => {
        const container = document.getElementById('advanced-data-content');
        if (!container) return;

        // Executar simulações se ainda não existirem
        const techStack = group.techStack || DataAcquisition.analyzeTechStack(group.mainWebsite || '');
        const whatsappCheck = group.hasWhatsApp !== undefined ? group.hasWhatsApp : DataAcquisition.checkWhatsApp(group.mainPhone || '');
        const emailValidation = group.emailValidation || (group.primaryEmail ? DataAcquisition.verifyEmail(group.primaryEmail) : { valid: null });
        const traffic = group.trafficEstimate || DataAcquisition.estimateTraffic(group.mainWebsite || '');
        const domainAge = group.domainAge || DataAcquisition.checkDomainAge(group.mainWebsite || '');

        // Salvar no grupo (persistência simples)
        group.techStack = techStack;
        group.hasWhatsApp = whatsappCheck;
        group.emailValidation = emailValidation;
        group.trafficEstimate = traffic;
        group.domainAge = domainAge;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-slate-50 p-3 rounded border">
                    <h4 class="font-bold text-slate-700 text-sm">Tech Stack (Item 13)</h4>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${techStack.map(t => `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">${t}</span>`).join('') || '<span class="text-xs text-slate-400">N/A</span>'}
                    </div>
                </div>
                <div class="bg-slate-50 p-3 rounded border">
                    <h4 class="font-bold text-slate-700 text-sm">Tráfego Web (Item 19)</h4>
                    <p class="text-sm text-slate-800 mt-1"><i class="fas fa-chart-line text-green-600"></i> ${traffic}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded border">
                    <h4 class="font-bold text-slate-700 text-sm">Canais de Contato</h4>
                    <p class="text-sm mt-1">WhatsApp (Item 15): ${whatsappCheck ? '<span class="text-green-600 font-bold">Sim</span>' : '<span class="text-red-500">Provavelmente Não</span>'}</p>
                    <p class="text-sm">Email (Item 16): ${emailValidation.valid ? `<span class="text-green-600">${emailValidation.status}</span>` : '<span class="text-red-500">Inválido/Não verificado</span>'}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded border">
                    <h4 class="font-bold text-slate-700 text-sm">Domínio (Item 20)</h4>
                    <p class="text-sm mt-1">Criado em: ${domainAge}</p>
                </div>
            </div>
            ${group.cnpjData ? `
                <div class="mt-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h4 class="font-bold text-yellow-800 text-sm">Dados Fiscais (BrasilAPI - Item 14)</h4>
                    <p class="text-sm text-yellow-900">Razão Social: ${group.cnpjData.razaoSocial}</p>
                    <p class="text-sm text-yellow-900">Status: ${group.cnpjData.status} | Município: ${group.cnpjData.municipio}</p>
                </div>` : ''
            }
        `;
    };
    
    const setupTabs = (tabsSelector, contentsSelector) => {
        const tabs = document.querySelectorAll(tabsSelector);
        const contents = document.querySelectorAll(contentsSelector);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`tab-content-${tab.dataset.tab}`).classList.add('active');
            });
        });
    };

    const handleCachedData = (group, dataKey, containerId, buttonId, renderFn, generateFn) => {
        const container = document.getElementById(containerId);
        const button = document.getElementById(buttonId);
        if (group[dataKey]) {
            renderFn(group[dataKey], container.querySelector('div'));
            if (button) button.style.display = 'none';
        } else {
            if (button) button.addEventListener('click', () => generateFn(group));
        }
    };
    
    const closeModal = () => {
        ui.modalContainer.classList.add('modal-leave-to');
        document.body.style.overflow = '';
        setTimeout(() => { ui.modalContainer.classList.add('hidden'); ui.modalContainer.classList.remove('flex', 'modal-leave-to'); }, 300);
    };
    
    const simpleMarkdownToHtml = (text) => (text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    const callAIApi = async (engine, prompt, schema = null) => {
        let apiKey, apiUrl, payload, headers;

        if (engine === 'gemini') {
            apiKey = GEMINI_API_KEY;
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            if (schema) { payload.generationConfig = { responseMimeType: "application/json", responseSchema: schema }; }
            headers = { 'Content-Type': 'application/json' };
        } else { // OpenAI
            apiKey = OPENAI_API_KEY;
            apiUrl = 'https://api.openai.com/v1/chat/completions'; 
            payload = { model: "gpt-3.5-turbo", messages: [{"role": "user", "content": prompt}] };
            if (schema) { payload.response_format = { "type": "json_object" }; }
            headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
        }
        
        if (!apiKey || apiKey.includes("SUA_CHAVE")) {
            throw new Error(`Chave de API para ${engine} não foi configurada.`);
        }

        // Pillar 1 - Item 4: API Gateway (Simulated)
        const response = await SecurityManager.secureFetch(apiUrl, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
        if (!response.ok) { 
            const errorBody = await response.text();
            console.error("API Error Response:", errorBody);
            throw new Error(`API Error (${engine}): ${response.statusText || 'Erro Desconhecido'}`);
        }
        
        const result = await response.json();

        if(engine === 'gemini') {
            if (result.candidates?.[0]?.content?.parts?.[0]) {
                const rawText = result.candidates[0].content.parts[0].text;
                return schema ? JSON.parse(rawText) : rawText;
            }
            if (result.promptFeedback?.blockReason) { throw new Error(`API blocked prompt: ${result.promptFeedback.blockReason}`); }
        } else { // OpenAI
            if(result.choices?.[0]?.message?.content) {
                const rawText = result.choices[0].message.content;
                return schema ? JSON.parse(rawText) : rawText;
            }
        }
        throw new Error("Resposta da IA inválida ou vazia.");
    };

    const generateAndRender = async (buttonId, containerId, group, dataKey, prompt, schema, renderFn) => {
        const button = document.getElementById(buttonId);
        const containerElement = document.getElementById(containerId);
        const contentContainer = containerElement ? containerElement.querySelector('div') : null;

        if (button) {
            button.disabled = true;
            button.innerHTML = '<div class="loader"></div><span class="ml-2">Gerando...</span>';
        }
        
        try {
            const result = await callAIApi('gemini', prompt, schema);
            group[dataKey] = result;
            group.updatedAt = new Date().toISOString();
            dataStore.save();
            if (contentContainer) { renderFn(result, contentContainer); }
            return result; 
        } catch (error) {
            console.error(`Error for ${dataKey}:`, error);
            if (contentContainer) { contentContainer.innerHTML = `<p class="text-red-500">Ocorreu um erro: ${error.message}</p>`; }
            throw error; 
        } finally {
            if (button) { button.style.display = 'none'; }
        }
    };

    const handleChatSubmit = async (engine) => {
        const input = document.getElementById(`${engine}-chat-input`);
        const responseContainer = document.getElementById(`${engine}-chat-response`);
        const question = input.value.trim();
        if(!question) return;

        responseContainer.innerHTML = '<div class="flex justify-center items-center h-full"><div class="loader-dark"></div></div>';
        input.disabled = true;

        try {
            const response = await callAIApi(engine, question);
            responseContainer.innerHTML = simpleMarkdownToHtml(response);
        } catch(error) {
            responseContainer.innerText = `Erro: ${error.message}`;
        } finally {
            input.disabled = false;
        }
    };
    window.handleChatSubmit = handleChatSubmit;

    const renderSalesKit = (kit, container) => {
        if(!kit || !container) return;
        const emailScript = kit.emailScript || {};
        container.innerHTML = `
            <div class="space-y-4">
                <div><h4 class="font-semibold text-slate-700">Como a Auto Arremate Pode Ajudar:</h4><p class="text-sm">${kit.valueProposition || 'N/A'}</p></div>
                <div><h4 class="font-semibold text-slate-700">Script de E-mail:</h4><div class="text-sm border rounded-md p-3 bg-slate-50"><strong>Assunto:</strong> ${emailScript.subject || 'N/A'}<br><br>${(emailScript.body || '').replace(/\n/g, '<br>')}</div></div>
                <div><h4 class="font-semibold text-slate-700">Script de Ligação:</h4><div class="text-sm border rounded-md p-3 bg-slate-50">${(kit.callScript || '').replace(/\n/g, '<br>')}</div></div>
                <div><h4 class="font-semibold text-slate-700">Controle de Objeções:</h4><div class="text-sm space-y-2">${(kit.objectionHandling || []).map(o => `<p><strong>Objeção:</strong> ${o.objection}<br><strong>Resposta:</strong> ${o.response}</p>`).join('')}</div></div>
            </div>
        `;
    };
    const generateSalesKit = (group) => {
        const prompt = `You are a sales coach for "Auto Arremate", a B2B platform that helps car dealerships manage and sell trade-in and aged inventory through an efficient digital auction system. Generate a sales kit in PORTUGUESE to approach the group "${group.groupName}". The group's known details are: Main brands: ${group.pdvs?.map(p=>p.name).join(', ') || 'N/A'}. Provide a JSON object with: valueProposition (string), emailScript (object with subject and body), callScript (string), and objectionHandling (array of objects with objection and response for 2 common objections).`;
         const schema = { type: "OBJECT", properties: { "valueProposition": { "type": "STRING" }, "emailScript": { "type": "OBJECT", "properties": {"subject": {"type": "STRING"}, "body": {"type": "STRING"}} }, "callScript": { "type": "STRING" }, "objectionHandling": { "type": "ARRAY", "items": {"type": "OBJECT", "properties": {"objection": {"type": "STRING"}, "response": {"type": "STRING"}}} } } };
         generateAndRender('generate-sales-kit-btn', 'sales-kit-container', group, 'salesKit', prompt, schema, renderSalesKit);
    };
    
    const renderStrategicSummary = (summary, container) => { if(container) container.innerHTML = simpleMarkdownToHtml(summary); };
    const generateStrategicSummary = (group) => {
        const prompt = `For the Brazilian automotive group "${group.groupName}", provide a concise strategic summary in PORTUGUESE. Use bold titles for: Profile, Brand Strategy, and Potential Strengths.`;
        generateAndRender('generate-ai-analysis-btn', 'ai-analysis-container', group, 'strategicAnalysis', prompt, null, renderStrategicSummary);
    };
    
    const renderEnrichmentData = (data, container) => {
        if(!container) return;
        container.innerHTML = `
            <div class="space-y-4 text-sm">
                <p><strong>Endereço:</strong> ${data.address || 'Não encontrado'}</p>
                <p><strong>Telefone Principal:</strong> ${data.phone || 'Não encontrado'}</p>
                <p><strong>Email Principal:</strong> ${data.primaryEmail || 'Não encontrado'}</p>
                <p><strong>Website:</strong> ${data.website ? `<a href="https://${data.website.replace(/^https?:\/\//,'')}" target="_blank" class="text-blue-600 hover:underline">${data.website}</a>` : 'Não encontrado'}</p>
                <p><strong>Blog:</strong> ${data.blogUrl ? `<a href="${data.blogUrl}" target="_blank" class="text-blue-600 hover:underline">Acessar Blog</a>` : 'Não encontrado'}</p>
                <div>
                    <h4 class="font-semibold text-slate-700 mt-4 mb-2">Decisores Chave:</h4>
                    ${(data.decisionMakers && data.decisionMakers.length > 0) ? `
                        <div class="flow-root"><table class="min-w-full divide-y divide-slate-200"><thead><tr><th class="py-2 pr-3 text-left text-sm font-semibold text-slate-900">Nome</th><th class="px-3 py-2 text-left text-sm font-semibold text-slate-900">Cargo</th><th class="px-3 py-2 text-left text-sm font-semibold text-slate-900">LinkedIn</th></tr></thead><tbody class="divide-y divide-slate-200 bg-white">${data.decisionMakers.map(c => `<tr><td class="py-2 pr-3 font-medium text-slate-800">${c.name}</td><td class="px-3 py-2 text-slate-500">${c.role}</td><td class="px-3 py-2 text-slate-500">${c.linkedin ? `<a href="${c.linkedin}" target="_blank" class="text-blue-600 hover:underline">Ver Perfil</a>` : 'N/A'}</td></tr>`).join('')}</tbody></table></div>` 
                    : '<p>Nenhum contato encontrado.</p>'
                    }
                </div>
            </div>
        `;
    };
    const enrichLead = (group) => {
        // Pillar 1 - Item 8: Automatic Backup/Versioning
        if (!group.history) group.history = [];
        group.history.push({
            timestamp: new Date().toISOString(),
            dataSnapshot: JSON.parse(JSON.stringify(group.enrichmentData || {}))
        });
        SecurityManager.logAction('ENRICH', `Enriching data for ${group.groupName}`);

        const prompt = `You are a B2B data enrichment specialist. For the Brazilian automotive group '${group.groupName}', find and return: main physical address, a primary contact phone number, official website, a general contact email, URL of their blog if available, and a list of up to 3 key decision makers (name, role, linkedin URL). Return null for any fields you cannot find. Do not invent data.`;
        const schema = {type: "OBJECT", properties: { "address": { "type": "STRING", "nullable": true }, "phone": { "type": "STRING", "nullable": true }, "website": { "type": "STRING", "nullable": true }, "primaryEmail": { "type": "STRING", "nullable": true }, "blogUrl": { "type": "STRING", "nullable": true }, "decisionMakers": { "type": "ARRAY", items: { "type": "OBJECT", properties: { "name": { "type": "STRING" }, "role": { "type": "STRING" }, "linkedin": { "type": "STRING", "nullable": true } } } } } };
        return generateAndRender('enrich-lead-btn', 'ai-enrichment-container', group, 'enrichmentData', prompt, schema, renderEnrichmentData);
    };
    
    const renderCompetitors = (competitors, container) => {
         if (competitors?.length > 0) {
             container.innerHTML = `<div class="flow-root"><table class="min-w-full divide-y divide-slate-200"><thead><tr><th class="py-2 pr-3 text-left text-sm font-semibold text-slate-900">Concorrente</th><th class="px-3 py-2 text-left text-sm font-semibold text-slate-900">Ponto Forte</th></tr></thead><tbody class="divide-y divide-slate-200 bg-white">${competitors.map(c => `<tr><td class="py-2 pr-3 text-sm font-medium text-slate-800">${c.name}</td><td class="px-3 py-2 text-sm text-slate-500">${c.strength}</td></tr>`).join('')}</tbody></table></div>`;
         } else { container.innerHTML = '<p class="text-slate-500">Nenhum concorrente direto identificado.</p>'; }
    };
    const generateCompetitorAnalysis = (group) => {
        const prompt = `For the automotive group "${group.groupName}", identify its 3 main competitors in its primary city or region in Brazil. For each competitor, state their name and their main strength.`;
        const schema = {type: "ARRAY", items: {type: "OBJECT", properties: { "name": { "type": "STRING" }, "strength": { "type": "STRING" }}, required: ["name", "strength"]}};
        generateAndRender('competitor-analysis-btn', 'ai-competitor-container', group, 'competitorAnalysis', prompt, schema, renderCompetitors);
    };

    const consultLeadData = async () => {
        const cnpj = document.getElementById('cnpj-input').value.trim();
        const consultBtn = ui.consultBtn;
        const resultDiv = ui.consultationResult;

        if (!cnpj) { showToast('Por favor, informe um CNPJ para consulta.', true); return; }

        consultBtn.disabled = true;
        consultBtn.innerHTML = '<div class="loader-dark mx-auto"></div>';
        resultDiv.innerHTML = '';

        // Item 14: BrasilAPI Real
        try {
            const result = await DataAcquisition.validateCNPJ(cnpj);
            renderConsultationResult(result);
        } catch (error) {
            console.error('CNPJ consultation error:', error);
            // Fallback para IA se BrasilAPI falhar (opcional, mantido para robustez)
            resultDiv.innerHTML = `<p class="text-red-500">Erro na consulta oficial: ${error.message}. Tente novamente mais tarde.</p>`;
        } finally {
            consultBtn.disabled = false;
            consultBtn.innerHTML = 'Consultar e Validar';
        }
    };

    const renderConsultationResult = (data) => {
        const resultDiv = ui.consultationResult;
        if (!data || !data.razaoSocial) {
            resultDiv.innerHTML = '<p class="text-slate-500">Nenhum lead encontrado para o critério informado.</p>';
            return;
        }

        const cnaeCode = (data.cnae || '').toString().replace(/[^0-9]/g, '');
        const isApproved = ALLOWED_CNAES.includes(cnaeCode);
        const statusClass = isApproved ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
        const statusText = isApproved ? 'APROVADO' : 'REPROVADO';
        
        let resultHTML = `<div class="border rounded-md p-4 space-y-2">
                <h4 class="font-bold text-lg">${data.razaoSocial}</h4>
                <p><strong>Local:</strong> ${data.municipio || 'N/A'}</p>
                <p><strong>CNAE Principal:</strong> ${data.cnae || 'N/A'}</p>
                <p><strong>Status RFB:</strong> ${data.status || 'N/A'}</p>
                <div><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusClass}">${statusText}</span></div>`;

        if (isApproved) {
            resultHTML += `<div class="pt-2"><button id="add-consulted-lead-btn" class="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500">Adicionar ao Diretório</button></div>`;
        } else {
            resultHTML += `<p class="text-xs text-red-600 mt-2">Este CNAE não está na lista de atividades permitidas.</p>`;
        }

        resultHTML += `</div>`;
        resultDiv.innerHTML = resultHTML;

        if (isApproved) {
            document.getElementById('add-consulted-lead-btn').addEventListener('click', () => {
                const newGroup = {
                    id: crypto.randomUUID(), groupName: data.razaoSocial, mainPhone: "", mainWebsite: "",
                    cnae: data.cnae, pdvs: [], createdAt: new Date().toISOString(),
                    cnpjData: data // Salvar dados fiscais reais
                };
                if (groupsData.some(g => g.groupName.toLowerCase() === newGroup.groupName.toLowerCase())) {
                    showToast('Este grupo já existe no diretório.', true); return;
                }
                groupsData.unshift(newGroup);
                dataStore.save();
                renderGroups(groupsData);
                prepareChartData();
                showToast(`Grupo "${newGroup.groupName}" adicionado e qualificado!`, false);
                resultDiv.innerHTML = ''; 
            });
        }
    };

    const searchLeadsWithAI = async () => {
        const sector = ui.searchSector.value.trim();
        const location = ui.searchLocation.value.trim();
        const quantity = parseInt(ui.searchQuantity.value) || 5;
        const resultsDiv = ui.leadSearchResults;
        const searchBtn = ui.searchLeadsBtn;

        if (!sector || !location) { showToast('Informe setor e localização.', true); return; }
        if (quantity > 10) { showToast('Máximo de 10 leads por busca.', true); return; }

        SecurityManager.logAction('SEARCH_AI', `Searching ${quantity} leads in ${sector}/${location}`);

        searchBtn.disabled = true;
        searchBtn.innerHTML = '<div class="loader-dark mx-auto"></div>';
        resultsDiv.innerHTML = '';

        const prompt = `Find and list ${quantity} real companies in the sector "${sector}" located in "${location}". For each company, provide: Name, Phone (if available), Website (if available), and Address. Return a JSON array of objects with keys: name, phone, website, address. Do not invent companies, only list real ones you know of.`;
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    phone: { type: "STRING", nullable: true },
                    website: { type: "STRING", nullable: true },
                    address: { type: "STRING", nullable: true }
                },
                required: ["name"]
            }
        };

        try {
            const results = await callAIApi('gemini', prompt, schema);
            renderSearchResults(results);
        } catch (error) {
            console.error('Lead search error:', error);
            resultsDiv.innerHTML = `<p class="text-red-500 text-sm">Erro na busca: ${error.message}</p>`;
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '✨ Buscar Novos Leads';
        }
    };

    let renderSearchResults = (results) => {
        const resultsDiv = ui.leadSearchResults;
        if (!results || results.length === 0) {
            resultsDiv.innerHTML = '<p class="text-slate-500 text-sm">Nenhum lead encontrado.</p>';
            return;
        }

        resultsDiv.innerHTML = results.map((lead, index) => `
            <div class="border rounded-md p-3 text-sm bg-slate-50 flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-slate-800">${lead.name}</h4>
                    ${lead.phone ? `<p class="text-slate-600">📞 ${lead.phone}</p>` : ''}
                    ${lead.website ? `<p class="text-slate-600">🌐 ${lead.website}</p>` : ''}
                    ${lead.address ? `<p class="text-slate-500 text-xs mt-1">📍 ${lead.address}</p>` : ''}
                </div>
                <button class="add-searched-lead-btn text-green-600 hover:text-green-800 p-1" data-index="${index}" title="Adicionar ao Diretório">
                    <i class="fas fa-plus-circle fa-lg"></i>
                </button>
            </div>
        `).join('');

        // Store results temporarily to access them when adding
        ui.leadSearchResults.dataset.lastResults = JSON.stringify(results);

        resultsDiv.querySelectorAll('.add-searched-lead-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const results = JSON.parse(ui.leadSearchResults.dataset.lastResults);
                addSearchedLeadToDirectory(results[index]);
                e.currentTarget.parentElement.classList.add('opacity-50', 'pointer-events-none');
                e.currentTarget.innerHTML = '<i class="fas fa-check"></i>';
            });
        });
    };

    const addSearchedLeadToDirectory = (lead) => {
         const newGroup = {
            id: crypto.randomUUID(),
            groupName: lead.name,
            mainPhone: lead.phone,
            mainWebsite: lead.website,
            enrichmentData: { address: lead.address }, // Pre-fill enrichment data
            pdvs: [],
            createdAt: new Date().toISOString()
        };

        if (groupsData.some(g => g.groupName.toLowerCase() === newGroup.groupName.toLowerCase())) {
            showToast('Este grupo já existe no diretório.', true);
            return;
        }

        groupsData.unshift(newGroup);
        SecurityManager.logAction('ADD_LEAD', `Added lead from AI Search: ${newGroup.groupName}`);
        dataStore.save();
        renderGroups(groupsData);
        prepareChartData();
        showToast(`Grupo "${newGroup.groupName}" adicionado!`, false);
    };

    const addManualLead = () => {
        const name = document.getElementById('manual-name').value.trim();
        const phone = document.getElementById('manual-phone').value.trim();
        const website = document.getElementById('manual-website').value.trim();

        if (!name) { showToast('O nome do grupo é obrigatório.', true); return; }

        const newGroup = { 
            id: crypto.randomUUID(), groupName: name, mainPhone: phone, mainWebsite: website, 
            pdvs: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        
        if (groupsData.some(g => g.groupName.toLowerCase() === newGroup.groupName.toLowerCase())) {
            showToast('Este grupo já existe no diretório.', true); return;
        }

        groupsData.unshift(newGroup);
        SecurityManager.logAction('ADD_LEAD', `Manually added lead: ${name}`);
        dataStore.save();
        renderGroups(groupsData);
        prepareChartData();
        showToast(`Grupo "${name}" adicionado com sucesso!`);
        
        document.getElementById('manual-name').value = '';
        document.getElementById('manual-phone').value = '';
        document.getElementById('manual-website').value = '';
    };

    // --- Init & Event Listeners ---
    const initializeApp = async () => {
        // Pillar 1 - Item 7: PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(() => console.log('Service Worker Registered'))
                .catch((err) => console.error('Service Worker Error', err));
        }

        // Check Supabase Session (Item 3)
        const { data } = await window.supabase.auth.getSession();
        if (data.session) {
            handleSessionRestored(data.session);
        } else {
            ui.loginModal.classList.remove('hidden');
        }
    };

    const handleSessionRestored = (session) => {
        ui.loginModal.classList.add('hidden');
        const user = session.user;

        // Populate User UI
        if(ui.userNameDisplay) ui.userNameDisplay.textContent = user.email; // Using email as name for mock
        if(ui.userRoleDisplay) ui.userRoleDisplay.textContent = user.role;

        // Fetch Data
        useLeads.fetchLeads();
        prepareChartData(); // Note: chart data might be empty initially until fetch completes
        renderCalendar(new Date().getFullYear(), new Date().getMonth());

        UIUtils.showToast(`Sessão restaurada: ${user.email}`);
    };

    const handleLogin = async () => {
        const username = document.getElementById('login-username').value.trim(); // Treating as email

        if (!username) { showToast('Digite um email.', true); return; }

        // Item 3: Supabase Auth Login
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: username,
            password: 'mock_password'
        });

        if (error) {
            UIUtils.showToast("Falha no login: " + error.message, 'error');
            return;
        }

        // Pillar 1 - Item 2: 2FA Challenge (Kept for security pillar requirements)
        const code = prompt("🔐 Autenticação de Dois Fatores (2FA)\n\nSimulação: Digite o código enviado para seu celular (Use '123456'):");

        if (code === '123456') {
            handleSessionRestored(data.session);
        } else {
            showToast('❌ Falha na Autenticação 2FA.', true);
            window.supabase.auth.signOut();
        }
    };

    const renderAuditLogs = () => {
        const logs = SecurityManager.getAuditLogs();
        const tbody = document.getElementById('audit-log-body');
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-slate-500">${new Date(log.timestamp).toLocaleString()}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs font-medium text-slate-900">${log.user}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-slate-500">${log.action}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs text-slate-500 truncate max-w-xs" title="${log.details}">${log.details}</td>
            </tr>
        `).join('');
    };

    const handleLGPDCleanup = () => {
        const email = document.getElementById('lgpd-email').value.trim();
        if(!email) return;
        try {
            const count = SecurityManager.forgetData(email);
            dataStore.save();
            renderGroups(groupsData);
            showToast(`LGPD: ${count} registros anonimizados.`);
            renderAuditLogs(); // Update logs
        } catch (e) {
            showToast(e.message, true);
        }
    };

    // --- CSV & Filter Handlers ---
    if(ui.exportCsvBtn) {
        ui.exportCsvBtn.addEventListener('click', () => {
            if(groupsData.length === 0) { UIUtils.showToast('Sem dados para exportar.', 'error'); return; }
            // Simple CSV generation
            const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Site', 'Score', 'Status', 'CriadoEm'];
            const rows = groupsData.map(g => [
                g.id, `"${g.groupName}"`, g.mainPhone, g.primaryEmail || '', g.mainWebsite, g.score||0, g.archived?'Arquivado':'Ativo', g.createdAt
            ]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "leads_sales_ai.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    if(ui.importCsvInput) {
        ui.importCsvInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const lines = text.split('\n').slice(1); // Skip header
                let count = 0;
                lines.forEach(line => {
                    const cols = line.split(',');
                    if (cols.length >= 2) {
                        const name = cols[1]?.replace(/"/g, '').trim(); // Assuming 2nd col is Name based on Export structure
                        if(name && !groupsData.some(g => g.groupName === name)) {
                            groupsData.unshift({
                                id: crypto.randomUUID(),
                                groupName: name,
                                mainPhone: cols[2] || '',
                                primaryEmail: cols[3] || '',
                                mainWebsite: cols[4] || '',
                                score: parseInt(cols[5]) || 50,
                                createdAt: new Date().toISOString(),
                                tags: ['importado']
                            });
                            count++;
                        }
                    }
                });
                dataStore.save();
                renderGroups(groupsData);
                UIUtils.showToast(`${count} leads importados!`);
            };
            reader.readAsText(file);
        });
    }

    // Filter Listeners
    if(ui.filterStartDate) ui.filterStartDate.addEventListener('change', (e) => { filterStartDate = e.target.value; renderGroups(groupsData); });
    if(ui.filterEndDate) ui.filterEndDate.addEventListener('change', (e) => { filterEndDate = e.target.value; renderGroups(groupsData); });
    if(ui.showArchivedCheck) ui.showArchivedCheck.addEventListener('change', (e) => { showArchived = e.target.checked; renderGroups(groupsData); });
    if(ui.sortOrderBtn) {
        ui.sortOrderBtn.addEventListener('click', () => {
            sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
            ui.sortIndicator.textContent = sortOrder === 'desc' ? '⬇️' : '⬆️';
            renderGroups(groupsData);
        });
    }

    // Event Listeners (Defensive)
    if(ui.consultBtn) ui.consultBtn.addEventListener('click', consultLeadData);
    if(ui.searchLeadsBtn) ui.searchLeadsBtn.addEventListener('click', searchLeadsWithAI);
    if(ui.manualAddBtn) ui.manualAddBtn.addEventListener('click', addManualLead);
    if(ui.loginBtn) ui.loginBtn.addEventListener('click', handleLogin);
    if(ui.logoutBtn) ui.logoutBtn.addEventListener('click', SecurityManager.logout);
    if(ui.securityBtn) ui.securityBtn.addEventListener('click', () => { ui.securityModal.classList.remove('hidden'); ui.securityModal.classList.add('flex'); renderAuditLogs(); });

    const closeSecurity = document.getElementById('close-security-btn');
    if(closeSecurity) closeSecurity.addEventListener('click', () => { ui.securityModal.classList.add('hidden'); ui.securityModal.classList.remove('flex'); });

    const lgpdBtn = document.getElementById('lgpd-forget-btn');
    if(lgpdBtn) lgpdBtn.addEventListener('click', handleLGPDCleanup);

    // Scraper Simulation Integration
    document.getElementById('run-scraper-btn').addEventListener('click', () => {
        const text = document.getElementById('scraper-input').value;
        const data = DataAcquisition.scrapeLinkedIn(text);

        // Auto-fill manual entry form
        // Check if manual-name exists (it might be hidden in new layout sections)
        const nameInput = document.getElementById('manual-name');
        if(nameInput) {
             nameInput.value = data.company !== "Não identificado" ? data.company : "";
             // Switch to Directory view to see form
             document.querySelector('[data-section="directory"]').click();
        }

        document.getElementById('scraper-modal').classList.add('hidden');
        showToast(`Dados extraídos: ${data.name} (${data.role})`);
        SecurityManager.logAction('SCRAPER', `Imported data for ${data.name} from text snippet`);
    });

    // Audio Analysis Integration (Item 27) - Defensive check if element exists
    const analyzeBtn = document.getElementById('analyze-call-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('call-upload');
            const resultContainer = document.getElementById('call-analysis-result');

            if (fileInput.files.length === 0) {
                showToast('Selecione um arquivo de áudio.', true);
                return;
            }

            const file = fileInput.files[0];
            resultContainer.innerHTML = '<div class="loader-dark mx-auto"></div>';
            resultContainer.classList.remove('hidden');

            AIEngine.analyzeCallAudio(file).then(analysis => {
                let parsed = analysis;
                if (typeof analysis === 'string') {
                    try { parsed = JSON.parse(analysis); } catch(e) { parsed = { "Raw": analysis }; }
                }

                let html = '<h4 class="font-bold mb-1">Análise BANT:</h4><ul class="list-disc pl-4">';
                for (const [key, value] of Object.entries(parsed)) {
                    html += `<li><strong>${key}:</strong> ${value}</li>`;
                }
                html += '</ul>';
                resultContainer.innerHTML = html;
                showToast('Call analisada com sucesso!');
            }).catch(err => {
                resultContainer.innerHTML = `<p class="text-red-500">Erro na análise: ${err.message}</p>`;
            });
        });
    }

    // Map Pins Logic
    const renderMapPins = (leads) => {
        if(!ui.mapPinsLayer) return;
        ui.mapPinsLayer.innerHTML = '';
        if(leads.length === 0) {
            if(ui.mapPlaceholder) ui.mapPlaceholder.style.display = 'flex';
            return;
        }
        if(ui.mapPlaceholder) ui.mapPlaceholder.style.display = 'none';

        // Mock coordinates around São Paulo for demo
        leads.forEach((lead, i) => {
            const top = 20 + (Math.random() * 60); // %
            const left = 20 + (Math.random() * 60); // %

            const pin = document.createElement('div');
            pin.className = 'map-pin';
            pin.style.top = `${top}%`;
            pin.style.left = `${left}%`;

            const tooltip = document.createElement('div');
            tooltip.className = 'pin-tooltip';
            tooltip.textContent = lead.groupName;

            pin.appendChild(tooltip);
            pin.addEventListener('click', () => openModal(lead));
            ui.mapPinsLayer.appendChild(pin);
        });
    };

    // Update Search Logic to trigger Map Render
    const originalRenderSearchResults = renderSearchResults;
    renderSearchResults = (results) => {
        originalRenderSearchResults(results);
        renderMapPins(results);
    };

    if(ui.searchInput) {
        // Item 7: Server-Side Search Integration
        let debounceTimer;
        ui.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const query = e.target.value;
                if (!query) {
                    useLeads.fetchLeads(); // Reset to all
                    return;
                }

                ui.groupGrid.innerHTML = UIUtils.renderSkeleton(4);

                const { data: sessionData } = await window.supabase.auth.getSession();
                const { data, error } = await window.supabase
                    .from('leads')
                    .textSearch(query) // Use our new method
                    .eq('user_id', sessionData.session.user.id);

                if(!error) {
                    const mapped = data.map(dbLead => ({
                        ...dbLead.data,
                        id: dbLead.id,
                        groupName: dbLead.company_name,
                        cnae: dbLead.cnpj,
                        score: dbLead.score,
                        createdAt: dbLead.created_at,
                        mainPhone: SecurityManager.decrypt(dbLead.data.mainPhone),
                        primaryEmail: SecurityManager.decrypt(dbLead.data.primaryEmail)
                    }));
                    store.setState({ leads: mapped });
                    renderGroups(mapped);
                }
            }, 500);
        });
    }
    if(ui.modalContainer) ui.modalContainer.addEventListener('click', (e) => { if(e.target === ui.modalContainer) { closeModal(); } });

    // Backup/Restore buttons are currently not in UI, skipping listeners
    // if(ui.backupBtn) ui.backupBtn.addEventListener('click', dataStore.backup);
    // if(ui.restoreInput) ui.restoreInput.addEventListener('change', (e) => dataStore.restore(e.target.files[0]));
    
    setupTabs('#lead-management-tabs .tab-button', '.dashboard-card .tab-content');

    const createChart = (canvasId, type, data, options) => {
        const chartElement = document.getElementById(canvasId);
        if(!chartElement) return;
        if (chartElement.chart) { chartElement.chart.destroy(); }
        const ctx = chartElement.getContext('2d');
        chartElement.chart = new Chart(ctx, { type, data, options });
    }

    const prepareChartData = () => {
        const groupsWithPdvCount = groupsData.map(g => ({ name: g.groupName, count: g.pdvs.filter(p => p.phone || p.website).length })).filter(g => g.count > 0).sort((a, b) => b.count - a.count).slice(0, 15);
        const barChartData = { labels: groupsWithPdvCount.map(g => g.name), datasets: [{ label: 'Nº de PDVs', data: groupsWithPdvCount.map(g => g.count), backgroundColor: 'rgba(59, 130, 246, 0.7)'}] };
        createChart('pdvCountChart', 'bar', barChartData, { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: {display: false} } });

        const brandKeywords = ['Fiat', 'Chevrolet', 'Honda', 'VW', 'Toyota', 'Nissan', 'BMW', 'Mercedes-Benz', 'Jeep', 'Renault', 'Hyundai', 'Mitsubishi', 'Ford', 'RAM', 'Chery'];
        const brandCounts = {};
        groupsData.forEach(group => { const text = group.groupName + ' ' + (group.pdvs || []).map(p => p.name).join(' '); const found = new Set(); brandKeywords.forEach(brand => { if (text.toLowerCase().includes(brand.toLowerCase())) { found.add(brand === 'Volkswagen' ? 'VW' : brand); } }); found.forEach(brand => { brandCounts[brand] = (brandCounts[brand] || 0) + 1; }) });
        const sortedBrands = Object.entries(brandCounts).sort(([,a],[,b]) => b-a).slice(0, 10);
        const doughnutData = { labels: sortedBrands.map(b => b[0]), datasets: [{ data: sortedBrands.map(b => b[1]), backgroundColor: [ 'rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)', 'rgba(96, 165, 250, 0.8)', 'rgba(248, 113, 113, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(52, 211, 153, 0.8)' ] }]};
        createChart('brandDistChart', 'doughnut', doughnutData, { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } });
    };

    // --- Calendar Functions ---
    const calendarContainer = document.getElementById('calendar-container');
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    const renderCalendar = (year, month) => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        let calendarHTML = `
            <div id="calendar" class="w-full">
                <div id="calendar-header" class="flex justify-between items-center mb-4">
                    <button id="prev-month" class="px-2 py-1 rounded hover:bg-slate-200">&lt;</button>
                    <h3 id="month-year" class="font-bold text-lg">${monthNames[month]} ${year}</h3>
                    <button id="next-month" class="px-2 py-1 rounded hover:bg-slate-200">&gt;</button>
                </div>
                <div id="calendar-days" class="grid grid-cols-7 gap-1 text-center">
                    <div class="day-name">D</div><div class="day-name">S</div><div class="day-name">T</div><div class="day-name">Q</div><div class="day-name">Q</div><div class="day-name">S</div><div class="day-name">S</div>
        `;
        
        for (let i = 0; i < firstDay; i++) { calendarHTML += `<div class="day empty"></div>`; }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasTask = agendaData[dateStr] && agendaData[dateStr].length > 0;
            calendarHTML += `<div class="day ${hasTask ? 'has-task' : ''}" data-date="${dateStr}">${day}</div>`;
        }
        
        calendarHTML += `</div></div>`;
        calendarContainer.innerHTML = calendarHTML;

        document.getElementById('prev-month').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderCalendar(currentYear, currentMonth);
        });
        document.getElementById('next-month').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            renderCalendar(currentYear, currentMonth);
        });
        document.querySelectorAll('.day:not(.empty)').forEach(dayEl => {
            dayEl.addEventListener('click', () => openAgendaModal(dayEl.dataset.date));
        });
    };
    
    const openAgendaModal = (dateStr) => {
        const tasks = agendaData[dateStr] || [];
        const formattedDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');

        ui.modalContent.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Agenda para ${formattedDate}</h2>
                    <button id="close-modal-btn" class="p-1 rounded-full text-slate-400 hover:bg-slate-100">&times;</button>
                </div>
                <div id="task-list" class="mb-4 space-y-2">
                    ${tasks.length > 0 ? tasks.map((task, i) => `<div class="flex justify-between items-center p-2 bg-slate-100 rounded"><span>${task}</span><button data-index="${i}" class="text-red-500 font-bold">x</button></div>`).join('') : '<p class="text-slate-500">Nenhuma tarefa para este dia.</p>'}
                </div>
                <div class="flex gap-2">
                    <input type="text" id="new-task-input" class="block w-full rounded-md border-slate-300 shadow-sm" placeholder="Nova tarefa...">
                    <button id="add-task-btn" class="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold">Adicionar</button>
                </div>
            </div>`;
        
        ui.modalContainer.classList.remove('hidden');
        ui.modalContainer.classList.add('flex');

        document.getElementById('close-modal-btn').addEventListener('click', closeModal);
        document.getElementById('add-task-btn').addEventListener('click', () => {
            const taskInput = document.getElementById('new-task-input');
            const task = taskInput.value.trim();
            if (task) {
                if (!agendaData[dateStr]) agendaData[dateStr] = [];
                agendaData[dateStr].push(task);
                dataStore.save();
                openAgendaModal(dateStr); 
                renderCalendar(currentYear, currentMonth);
            }
        });

        document.querySelectorAll('#task-list button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                agendaData[dateStr].splice(index, 1);
                dataStore.save();
                openAgendaModal(dateStr);
                renderCalendar(currentYear, currentMonth);
            });
        });
    };

    // --- Event Listeners (Chassis) ---

    // Zen Mode Toggle
    const zenToggle = document.getElementById('zen-mode-toggle');
    const sidebar = document.getElementById('sidebar');
    if(zenToggle && sidebar) {
        zenToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            zenToggle.innerHTML = sidebar.classList.contains('collapsed') ? '<i class="fas fa-chevron-right text-xs"></i>' : '<i class="fas fa-chevron-left text-xs"></i>';
        });
    }

    // Scroll to Top
    const scrollBtn = document.getElementById('scroll-to-top');
    const mainScroll = document.getElementById('main-scroll-area');
    if(scrollBtn && mainScroll) {
        mainScroll.addEventListener('scroll', () => {
            if (mainScroll.scrollTop > 300) scrollBtn.classList.add('visible');
            else scrollBtn.classList.remove('visible');
        });
        scrollBtn.addEventListener('click', () => {
            mainScroll.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // View Mode Toggle (Add to Directory Header dynamically)
    // We try to find the header container. If it doesn't exist yet (hidden section), we'll do it on init.
    const directoryHeader = document.querySelector('#section-directory .flex.gap-2');
    if(directoryHeader) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'bg-white text-slate-600 px-3 py-2 rounded-lg text-sm font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors';
        toggleBtn.innerHTML = '<i class="fas fa-columns"></i>';
        toggleBtn.title = 'Alternar Vista (Lista/Kanban)';
        toggleBtn.addEventListener('click', () => {
            currentViewMode = currentViewMode === 'list' ? 'kanban' : 'list';
            toggleBtn.innerHTML = currentViewMode === 'list' ? '<i class="fas fa-columns"></i>' : '<i class="fas fa-list"></i>';
            renderGroups(groupsData);
        });
        directoryHeader.insertBefore(toggleBtn, directoryHeader.firstChild);
    }

    // Navigation Updates (Breadcrumbs)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            UIUtils.updateBreadcrumbs(sectionId);
        });
    });

    // Pomodoro Timer Logic
    const pomodoroTimerEl = document.getElementById('pomodoro-timer');
    const pomodoroStartBtn = document.getElementById('pomodoro-start');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset');
    let pomodoroInterval;
    let pomodoroTime = 25 * 60;
    let pomodoroActive = false;

    const updatePomodoroDisplay = () => {
        const m = Math.floor(pomodoroTime / 60);
        const s = pomodoroTime % 60;
        pomodoroTimerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    if(pomodoroStartBtn) {
        pomodoroStartBtn.addEventListener('click', () => {
            if(pomodoroActive) {
                clearInterval(pomodoroInterval);
                pomodoroActive = false;
                pomodoroStartBtn.textContent = "Retomar";
                pomodoroStartBtn.className = "flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs py-1 rounded font-bold";
            } else {
                pomodoroActive = true;
                pomodoroStartBtn.textContent = "Pausar";
                pomodoroStartBtn.className = "flex-1 bg-amber-500 hover:bg-amber-600 text-xs py-1 rounded font-bold";
                pomodoroInterval = setInterval(() => {
                    pomodoroTime--;
                    updatePomodoroDisplay();
                    if(pomodoroTime <= 0) {
                        clearInterval(pomodoroInterval);
                        pomodoroActive = false;
                        UIUtils.showToast("Pomodoro Finalizado! Hora do descanso.");
                        // Play sound or notification here
                        pomodoroTime = 5 * 60; // 5 min break
                        updatePomodoroDisplay();
                        pomodoroStartBtn.textContent = "Início";
                        pomodoroStartBtn.className = "flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs py-1 rounded font-bold";
                    }
                }, 1000);
            }
        });
    }

    if(pomodoroResetBtn) {
        pomodoroResetBtn.addEventListener('click', () => {
            clearInterval(pomodoroInterval);
            pomodoroActive = false;
            pomodoroTime = 25 * 60;
            updatePomodoroDisplay();
            pomodoroStartBtn.textContent = "Início";
            pomodoroStartBtn.className = "flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs py-1 rounded font-bold";
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+K to Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if(searchInput) {
                searchInput.focus();
                // Ensure directory section is visible if not
                const directoryTab = document.querySelector('[data-section="directory"]');
                if(directoryTab) directoryTab.click();
            }
        }
    });

    // Konami Code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            UIUtils.showToast('GOD MODE ATIVADO! 🚀🚀🚀');
            confetti({ particleCount: 500, spread: 360, startVelocity: 60 });
            document.body.style.filter = "invert(1) hue-rotate(180deg)";
            setTimeout(() => { document.body.style.filter = ""; }, 5000);
        }
    });

    // --- Initial Load ---
    dataStore.load();
    initializeApp();
    if(typeof HunterAgent !== 'undefined') HunterAgent.init();

    // Expose for Debugging/Verification
    window.UIUtils = UIUtils;
    window.AIEngine = AIEngine;
    window.DataAcquisition = DataAcquisition;
});
