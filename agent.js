// -----------------------------------------------------------------------------
// Hunter Agent - The Autonomous Sales Engineer
// -----------------------------------------------------------------------------

const HunterAgent = {
    state: {
        active: false,
        status: 'IDLE', // IDLE, SCANNING, ENRICHING, SCORING, ACTIVATING
        logs: [],
        foundLeads: [],
        config: {
            icp_segment: 'Tecnologia',
            icp_location: 'São Paulo, SP',
            icp_size: 'Media',
            min_score: 70
        }
    },

    init: () => {
        console.log("🤖 Hunter Agent Initialized");
        HunterAgent.renderUI();
    },

    toggle: () => {
        HunterAgent.state.active = !HunterAgent.state.active;
        if(HunterAgent.state.active) {
            HunterAgent.log("⚡ Agent Activated. Starting 24/7 Cycle...");
            HunterAgent.loop();
        } else {
            HunterAgent.log("🛑 Agent Paused.");
            HunterAgent.updateStatus('IDLE');
        }
        HunterAgent.updateControlUI();
    },

    log: (msg) => {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ${msg}`;
        HunterAgent.state.logs.unshift(entry);
        if (HunterAgent.state.logs.length > 50) HunterAgent.state.logs.pop();

        const logContainer = document.getElementById('agent-terminal-logs');
        if(logContainer) {
            const p = document.createElement('div');
            p.className = 'text-xs text-green-400 font-mono mb-1 border-b border-green-900/30 pb-1';
            p.textContent = entry;
            logContainer.prepend(p);
        }
    },

    updateStatus: (status) => {
        HunterAgent.state.status = status;
        const badge = document.getElementById('agent-status-badge');
        if(badge) {
            badge.textContent = status;
            badge.className = `px-2 py-1 rounded text-xs font-bold ${status === 'IDLE' ? 'bg-slate-600' : 'bg-green-600 animate-pulse'}`;
        }
    },

    loop: async () => {
        if (!HunterAgent.state.active) return;

        try {
            // ETAPA 2: Busca Inteligente
            HunterAgent.updateStatus('SCANNING');
            HunterAgent.log(`🔍 Scanning for companies in ${HunterAgent.state.config.icp_segment} / ${HunterAgent.state.config.icp_location}...`);

            // Simulating "AI Search" delay
            await new Promise(r => setTimeout(r, 2000));

            // Generate a Lead Candidate via AI (Simulated for consistency or use Gemini if keys present)
            const candidateName = HunterAgent.generateMockCompanyName(HunterAgent.state.config.icp_segment);
            HunterAgent.log(`💡 Detected potential lead: ${candidateName}`);

            // ETAPA 3: Enriquecimento
            HunterAgent.updateStatus('ENRICHING');
            await new Promise(r => setTimeout(r, 1500));

            const enrichedData = {
                name: candidateName,
                segment: HunterAgent.state.config.icp_segment,
                size: HunterAgent.state.config.icp_size,
                location: HunterAgent.state.config.icp_location,
                website: `www.${candidateName.toLowerCase().replace(/\s/g,'')}.com.br`,
                decisionMaker: "Diretor Comercial",
                painPoints: ["Processos manuais", "Baixa conversão", "Falta de dados"]
            };
            HunterAgent.log(`✅ Data enriched for ${candidateName}`);

            // ETAPA 4: Qualificação (Score)
            HunterAgent.updateStatus('SCORING');
            const score = Math.floor(Math.random() * 40) + 60; // 60-100
            enrichedData.score = score;

            if (score >= HunterAgent.state.config.min_score) {
                HunterAgent.log(`🎯 Lead Qualified! Score: ${score}/100`);

                // ETAPA 5: Ativação (Message Gen)
                HunterAgent.updateStatus('ACTIVATING');
                const message = HunterAgent.generateMessage(enrichedData);
                enrichedData.activationMessage = message;
                enrichedData.status = 'READY';
                enrichedData.id = crypto.randomUUID();
                enrichedData.createdAt = new Date().toISOString();

                // Save to State & Global Groups
                HunterAgent.state.foundLeads.unshift(enrichedData);

                // Add to main app data (Integration)
                if (typeof groupsData !== 'undefined') {
                    const group = {
                        id: enrichedData.id,
                        groupName: enrichedData.name,
                        mainWebsite: enrichedData.website,
                        score: enrichedData.score,
                        status: 'new',
                        tags: ['Auto-Hunter'],
                        createdAt: new Date().toISOString(),
                        coldMailHook: message // Saving the message
                    };
                    groupsData.unshift(group);
                    if(typeof dataStore !== 'undefined') dataStore.save();
                    if(typeof renderGroups !== 'undefined') renderGroups(groupsData); // Refresh main view if visible
                }

                HunterAgent.renderOpportunity(enrichedData);
                UIUtils.showToast(`🤖 Agent found: ${candidateName} (${score})`);
            } else {
                HunterAgent.log(`⚠️ Lead disqualified (Score ${score} < ${HunterAgent.state.config.min_score})`);
            }

        } catch (e) {
            HunterAgent.log(`❌ Error in cycle: ${e.message}`);
        }

        // Loop Delay (Random 5-10s)
        if(HunterAgent.state.active) {
            const delay = Math.floor(Math.random() * 5000) + 5000;
            HunterAgent.updateStatus('IDLE');
            setTimeout(HunterAgent.loop, delay);
        }
    },

    generateMockCompanyName: (segment) => {
        const prefixes = ["Nova", "Tech", "Global", "Alfa", "Prime", "Ultra", "Mega"];
        const suffixes = ["Solutions", "Systems", "Ltda", "Brasil", "Corp", "Log", "Varejo"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    },

    generateMessage: (lead) => {
        // Modelo 8: Mensagem Gerada
        return `Olá, tudo bem?

Analisei o posicionamento da ${lead.name} e notei que vocês estão em um momento de crescimento que costuma gerar gargalos em ${lead.painPoints[0].toLowerCase()}.

Hoje ajudamos empresas do seu perfil (${lead.segment}) a resolver exatamente esse ponto com mais eficiência e previsibilidade.

Faz sentido conversarmos rapidamente para entender se isso também é uma prioridade para vocês?`;
    },

    updateControlUI: () => {
        const btn = document.getElementById('agent-toggle-btn');
        if(btn) {
            btn.textContent = HunterAgent.state.active ? "⏸ Pausar Agente" : "▶ Iniciar Agente";
            btn.className = HunterAgent.state.active
                ? "w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg transition-all"
                : "w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all";
        }
    },

    renderOpportunity: (lead) => {
        const feed = document.getElementById('agent-opportunity-feed');
        if(!feed) return;

        const card = document.createElement('div');
        card.className = "bg-slate-800 border border-slate-700 p-4 rounded-lg animate-fade-in mb-3";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-white text-lg">${lead.name}</h4>
                <span class="text-green-400 font-mono font-bold">${lead.score} pts</span>
            </div>
            <p class="text-slate-400 text-xs mb-2">${lead.segment} • ${lead.location}</p>

            <div class="bg-slate-900/50 p-2 rounded border border-slate-700 mb-2">
                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Dor Identificada:</p>
                <p class="text-sm text-slate-300">"${lead.painPoints[0]}"</p>
            </div>

            <div class="bg-slate-900/50 p-2 rounded border border-slate-700">
                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Abordagem Gerada:</p>
                <p class="text-xs text-slate-300 italic">"${lead.activationMessage}"</p>
            </div>

            <div class="mt-3 flex justify-end gap-2">
                <button class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded" onclick="alert('Enviado para CRM!')">📤 Enviar CRM</button>
            </div>
        `;
        feed.prepend(card);
    },

    renderUI: () => {
        // Will be called by main script to inject into section-agent if needed,
        // but typically we manipulate existing DOM elements in the HTML.
    }
};

// Expose to window
window.HunterAgent = HunterAgent;
