import React, { useState } from 'react';
import { Lead } from './types';
import { enrichDecisionMakers, generateSalesKit, analyzeCompetitors, checkLocationData } from './geminiService';
import { Icons } from './constants';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'enrichment' | 'sales_machine'>('details');
  const [loading, setLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<string | null>(null);

  const handleEnrichment = async () => {
    setLoading(true);
    const dms = await enrichDecisionMakers(lead.companyName);
    const comps = await analyzeCompetitors(lead.companyName);
    
    // Feature: Maps Grounding
    const locData = await checkLocationData(lead.companyName, lead.location || '');
    setMapsResult(locData);

    const updated = {
      ...lead,
      decisionMakers: dms,
      competitors: comps,
      score: Math.min(lead.score + 25, 100)
    };
    onUpdate(updated);
    setLoading(false);
  };

  const handleSalesMachine = async () => {
    setLoading(true);
    const kit = await generateSalesKit(lead.companyName, lead.sector || 'Geral');
    const updated = { ...lead, salesKit: kit || undefined };
    onUpdate(updated);
    setLoading(false);
  };

  const handleSave = () => {
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
          <div className="flex gap-4">
             <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {lead.companyName.charAt(0)}
             </div>
             <div>
                <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    {lead.companyName}
                    <a href={lead.website} target="_blank" className="text-slate-400 hover:text-indigo-500 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </a>
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">📍 {lead.location}</span>
                    <span className="flex items-center gap-1">🏢 {lead.sector}</span>
                    <span className="flex items-center gap-1">💰 {lead.revenueEstimate || 'N/A'}</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
              >
                  💾 Salvar Lead
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                <Icons.X />
              </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === 'details' ? 'border-indigo-500 text-indigo-600 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            📋 Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('enrichment')}
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === 'enrichment' ? 'border-indigo-500 text-indigo-600 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            ⚡ Enriquecimento (IA)
          </button>
          <button 
            onClick={() => setActiveTab('sales_machine')}
            className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${activeTab === 'sales_machine' ? 'border-indigo-500 text-indigo-600 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            🚀 Máquina de Vendas
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/20">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="md:col-span-2 space-y-6">
                 {/* Stack Card */}
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🛠️ Tech Stack & Dados</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {lead.techStack?.map(tech => (
                            <span key={tech} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-medium dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">{tech}</span>
                        )) || <span className="text-slate-400 italic">Nenhuma tecnologia identificada.</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                         <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                             <span className="text-xs text-slate-500 uppercase font-bold">Telefone</span>
                             <p className="font-medium">{lead.phone || '—'}</p>
                         </div>
                         <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                             <span className="text-xs text-slate-500 uppercase font-bold">CNPJ</span>
                             <p className="font-medium">{lead.cnpj || 'Consultar'}</p>
                         </div>
                    </div>
                 </div>

                 {/* Tags */}
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">🏷️ Tags & Notas</h3>
                     <div className="flex flex-wrap gap-2">
                        {lead.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium dark:bg-slate-700 dark:text-slate-300">#{tag}</span>
                        ))}
                        <button className="px-3 py-1 border border-dashed border-slate-300 text-slate-400 rounded-full text-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors">+ Adicionar</button>
                     </div>
                     <textarea 
                        className="w-full mt-4 p-3 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Adicione notas sobre o lead aqui..."
                        rows={3}
                     ></textarea>
                 </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 relative">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-200 dark:text-slate-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"/>
                            <path className={`${lead.score > 70 ? 'text-green-500' : 'text-yellow-500'}`} strokeDasharray={`${lead.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"/>
                          </svg>
                          <span className="absolute text-2xl font-bold">{lead.score}</span>
                      </div>
                      <h3 className="font-bold text-lg">Lead Score</h3>
                      <p className="text-sm text-slate-500">Probabilidade de Conversão</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Status do Pipeline</label>
                      <select 
                        value={lead.status}
                        onChange={(e) => onUpdate({...lead, status: e.target.value as any})}
                        className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 font-medium"
                      >
                        <option value="new">🔵 Novo</option>
                        <option value="qualifying">🟡 Em Qualificação</option>
                        <option value="contacted">🟠 Contactado</option>
                        <option value="negotiation">🟣 Negociação</option>
                        <option value="won">🟢 Ganho</option>
                        <option value="lost">🔴 Perdido</option>
                      </select>
                  </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENRICHMENT */}
          {activeTab === 'enrichment' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              {!lead.decisionMakers && !lead.competitors && !mapsResult ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 mb-4">
                     <Icons.Robot />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Dados Ausentes</h3>
                  <p className="text-slate-500 mb-6 max-w-md">Utilize a Inteligência Artificial para descobrir quem são os tomadores de decisão, concorrentes e validar localização real.</p>
                  <button 
                    onClick={handleEnrichment} 
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Icons.Refresh /> : '⚡ Enriquecer com Maps Grounding'} 
                  </button>
                </div>
              ) : (
                <>
                  {/* Google Maps Grounding Result */}
                  {mapsResult && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                          <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            🗺️ Google Maps Grounding
                          </h3>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                              {mapsResult}
                          </p>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Decision Makers */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-600">👥 Decisores Identificados</h3>
                        <ul className="space-y-3">
                            {lead.decisionMakers?.map((dm, idx) => (
                            <li key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                        {dm.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{dm.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{dm.role}</p>
                                    </div>
                                </div>
                                {dm.linkedin && (
                                <a href={dm.linkedin} target="_blank" className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Buscar no LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                                )}
                            </li>
                            ))}
                        </ul>
                      </div>
                      
                      {/* Competitors */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500">⚔️ Concorrência</h3>
                        <div className="space-y-3">
                            {lead.competitors?.map((comp, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold">{comp.name}</span>
                                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Rival</span>
                                    </div>
                                    <p className="text-sm text-slate-500">💪 Ponto Forte: {comp.strength}</p>
                                </div>
                            ))}
                        </div>
                      </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: SALES MACHINE */}
          {activeTab === 'sales_machine' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
               {!lead.salesKit ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 mb-4">
                     <Icons.Calendar />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Máquina de Vendas Desligada</h3>
                  <p className="text-slate-500 mb-6 max-w-md">Gere scripts de ligação, emails frios e uma cadência completa personalizada para este lead.</p>
                  <button 
                    onClick={handleSalesMachine} 
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Icons.Refresh /> : '🚀 Gerar Estratégia de Prospecção'} 
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cadence Timeline */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">📅 Cadência Sugerida</h3>
                        <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900 ml-3 space-y-8">
                            {lead.salesKit.cadence.map((step, idx) => (
                                <div key={idx} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800"></div>
                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mb-1 inline-block uppercase">Dia {step.day} • {step.channel.toUpperCase()}</span>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{step.subject || `Ação via ${step.channel}`}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                        "{step.content}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Phone Script */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📞 Script de Ligação</h3>
                            <div className="space-y-4 text-sm font-mono leading-relaxed opacity-90">
                                <div className="whitespace-pre-wrap">{lead.salesKit.phoneScript}</div>
                            </div>
                        </div>
                        
                        {/* Objections */}
                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">🛡️ Contorno de Objeções</h3>
                            <div className="space-y-4">
                                {lead.salesKit.objectionHandling.map((obj, idx) => (
                                    <div key={idx}>
                                        <p className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">"{obj.objection}"</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">Resp: {obj.response}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
