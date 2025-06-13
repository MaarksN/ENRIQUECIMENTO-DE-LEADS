document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------------------
    // ATENÇÃO: INSIRA SUAS CHAVES DE API AQUI
    // É crucial que você substitua os placeholders abaixo pelas suas chaves reais
    // para que as funcionalidades de IA funcionem.
    // Lembre-se: NÃO compartilhe este arquivo com as chaves preenchidas.
    // -----------------------------------------------------------------------------
    const GEMINI_API_KEY = "AIzaSyDTzwUbOWORIM9NvLq2gnsR4gnppAkM-oI"; 
    const OPENAI_API_KEY = "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";

    // --- Data Storage and Management ---
    let groupsData = [];
    let agendaData = {};

    const dataStore = {
        load: () => {
            const storedGroups = localStorage.getItem('vendasIA_groups');
            const storedAgenda = localStorage.getItem('vendasIA_agenda');
            groupsData = storedGroups ? JSON.parse(storedGroups) : [];
            agendaData = storedAgenda ? JSON.parse(storedAgenda) : {};
        },
        save: () => {
            localStorage.setItem('vendasIA_groups', JSON.stringify(groupsData));
            localStorage.setItem('vendasIA_agenda', JSON.stringify(agendaData));
        },
        backup: () => {
            const dataStr = JSON.stringify({ groups: groupsData, agenda: agendaData }, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_portal_vendas_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Backup realizado com sucesso!');
        },
        restore: (file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.groups && data.agenda) {
                        groupsData = data.groups;
                        agendaData = data.agenda;
                        dataStore.save();
                        initializeApp();
                        showToast('Backup restaurado com sucesso!');
                    } else {
                        showToast('Arquivo de backup inválido.', true);
                    }
                } catch (e) {
                    showToast('Erro ao ler o arquivo de backup.', true);
                    console.error("Restore error:", e);
                }
            };
            reader.readAsText(file);
        }
    };

    const ui = {
        groupGrid: document.getElementById('group-grid'),
        searchInput: document.getElementById('searchInput'),
        modalContainer: document.getElementById('modal-container'),
        modalContent: document.getElementById('modal-content'),
        marketSummaryBtn: document.getElementById('generate-market-summary-btn'),
        marketSummaryContainer: document.getElementById('market-summary-container'),
        toast: document.getElementById('toast-notification'),
        consultBtn: document.getElementById('consult-cnpj-btn'),
        consultationResult: document.getElementById('consultation-result'),
        manualAddBtn: document.getElementById('manual-add-btn'),
        backupBtn: document.getElementById('backup-btn'),
        restoreInput: document.getElementById('restore-input'),
    };

    const ALLOWED_CNAES = ['4511101', '4511102', '4511103', '4511104', '4511105', '4511106', '4512901', '4512902', '4541201', '4541203', '4541204', '7711000', '7719599'];

    const showToast = (message, isError = false) => {
        ui.toast.textContent = message;
        ui.toast.className = `toast show ${isError ? 'error' : ''}`;
        setTimeout(() => { ui.toast.classList.remove('show'); }, 3000);
    };

    const renderGroups = (groups) => {
        ui.groupGrid.innerHTML = '';
        if (groups.length === 0) { ui.groupGrid.innerHTML = `<p class="text-slate-500 col-span-full text-center">Nenhum lead no diretório.</p>`; return; }
        groups.forEach(group => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between';
            card.innerHTML = `<div><h3 class="font-bold text-lg text-slate-900 truncate">${group.groupName}</h3><p class="text-sm text-slate-500">${group.mainPhone ? '📞 ' + group.mainPhone : ' '}</p></div><div class="mt-4 text-right"><span class="text-sm font-medium text-blue-600">Ver detalhes &rarr;</span></div>`;
            card.addEventListener('click', () => openModal(group));
            ui.groupGrid.appendChild(card);
        });
    };

    const openModal = (group) => {
        ui.modalContent.innerHTML = `
            <div class="p-6 border-b border-slate-200 flex justify-between items-start">
                <div><h2 class="text-2xl font-bold text-slate-900">${group.groupName}</h2></div>
                <button id="close-modal-btn" class="p-1 rounded-full text-slate-400 hover:bg-slate-100"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div class="p-6 flex-grow overflow-y-auto" id="modal-main-content">
                <div class="border-b border-slate-200 mb-4">
                    <nav class="-mb-px flex space-x-6" id="modal-tabs">
                        <button data-tab="prospeccao" class="tab-button active">Prospecção</button>
                        <button data-tab="analise" class="tab-button">Análise</button>
                    </nav>
                </div>
                <div id="tab-content-prospeccao" class="tab-content active"><div id="sales-kit-container" class="space-y-6"><button id="generate-sales-kit-btn" class="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">🚀 Gerar Kit de Prospecção</button><div id="sales-kit-content" class="mt-4 prose-custom max-w-none"></div></div></div>
                <div id="tab-content-analise" class="tab-content"><div class="space-y-6">
                    <div><h3 class="font-semibold text-lg mb-2 text-slate-800">Enriquecimento de Dados</h3><div id="ai-enrichment-container"><button id="enrich-lead-btn" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">🔍 Enriquecer Dados</button><div id="ai-enrichment-content" class="mt-4"></div></div></div>
                    <div class="border-t border-slate-200 pt-6"><h3 class="font-semibold text-lg mb-2 text-slate-800">Análise Estratégica</h3><div id="ai-analysis-container"><button id="generate-ai-analysis-btn" class="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">✨ Gerar Análise</button><div id="ai-analysis-content" class="mt-4 prose-custom max-w-none"></div></div></div>
                    <div class="border-t border-slate-200 pt-6"><h3 class="font-semibold text-lg mb-2 text-slate-800">Análise de Concorrência</h3><div id="ai-competitor-container"><button id="competitor-analysis-btn" class="inline-flex items-center gap-x-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500">⚔️ Analisar</button><div id="ai-competitor-content" class="mt-4"></div></div></div>
                </div></div>
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

        const response = await fetch(apiUrl, { method: 'POST', headers: headers, body: JSON.stringify(payload) });
        if (!response.ok) { 
            const errorBody = await response.text();
            console.error("API Error Response:", errorBody);
            throw new Error(`API Error (${engine}): ${response.statusText || 'Something went wrong'}`); 
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

        const prompt = `Simulate a query to a Brazilian company database for CNPJ "${cnpj}". Return a single JSON object with the company's "razaoSocial" (company name), "telefone", "website", and "cnaePrincipal" (primary business activity code, numbers only). If no data is found, return an empty object. Example CNAE: 4511101.`;
        const schema = {type: "OBJECT", properties: { "razaoSocial": { "type": "STRING" }, "telefone": { "type": "STRING" }, "website": { "type": "STRING" }, "cnaePrincipal": { "type": "STRING" } }};

        try {
            const result = await callAIApi('gemini', prompt, schema);
            renderConsultationResult(result);
        } catch (error) {
            console.error('CNPJ consultation error:', error);
            resultDiv.innerHTML = `<p class="text-red-500">Erro na consulta: ${error.message}</p>`;
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

        const cnaeCode = (data.cnaePrincipal || '').replace(/[^0-9]/g, '');
        const isApproved = ALLOWED_CNAES.includes(cnaeCode);
        const statusClass = isApproved ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
        const statusText = isApproved ? 'APROVADO' : 'REPROVADO';
        const meiNote = cnaeCode === '7719599' ? '<p class="text-xs text-amber-600 mt-1">Nota MEI: Verifique se a atividade principal está alinhada.</p>' : '';
        
        let resultHTML = `<div class="border rounded-md p-4 space-y-2">
                <h4 class="font-bold text-lg">${data.razaoSocial}</h4>
                <p><strong>Telefone:</strong> ${data.telefone || 'N/A'}</p>
                <p><strong>Website:</strong> ${data.website ? `<a href="https://${data.website.replace(/^https?:\/\//,'')}" target="_blank" class="text-blue-600">${data.website}</a>` : 'N/A'}</p>
                <p><strong>CNAE Principal:</strong> ${data.cnaePrincipal || 'N/A'}</p>
                <div><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusClass}">${statusText}</span>${meiNote}</div>`;

        if (isApproved) {
            resultHTML += `<div class="pt-2"><button id="add-consulted-lead-btn" class="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500">Adicionar ao Diretório</button></div>`;
        } else {
            resultHTML += `<p class="text-xs text-red-600 mt-2">Este CNAE não está na lista de atividades permitidas para compradores B2B.</p>`;
        }

        resultHTML += `</div>`;
        resultDiv.innerHTML = resultHTML;

        if (isApproved) {
            document.getElementById('add-consulted-lead-btn').addEventListener('click', () => {
                const newGroup = {
                    id: crypto.randomUUID(), groupName: data.razaoSocial, mainPhone: data.telefone, mainWebsite: data.website,
                    cnae: data.cnaePrincipal, pdvs: [], createdAt: new Date().toISOString()
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
        dataStore.save();
        renderGroups(groupsData);
        prepareChartData();
        showToast(`Grupo "${name}" adicionado com sucesso!`);
        
        document.getElementById('manual-name').value = '';
        document.getElementById('manual-phone').value = '';
        document.getElementById('manual-website').value = '';
    };

    // --- Init & Event Listeners ---
    const initializeApp = () => {
        renderGroups(groupsData);
        prepareChartData();
        renderCalendar(new Date().getFullYear(), new Date().getMonth());
    };
    
    ui.consultBtn.addEventListener('click', consultLeadData);
    ui.manualAddBtn.addEventListener('click', addManualLead);
    ui.searchInput.addEventListener('input', (e) => { renderGroups(groupsData.filter(g => g.groupName.toLowerCase().includes(e.target.value.toLowerCase()))); });
    ui.modalContainer.addEventListener('click', (e) => { if(e.target === ui.modalContainer) { closeModal(); } });
    ui.backupBtn.addEventListener('click', dataStore.backup);
    ui.restoreInput.addEventListener('change', (e) => dataStore.restore(e.target.files[0]));
    
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

    // --- Initial Load ---
    dataStore.load();
    initializeApp();
});
