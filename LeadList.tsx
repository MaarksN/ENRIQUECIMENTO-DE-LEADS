import React, { useState } from 'react';
import { Lead } from '../types';
import { Icons } from '../constants';
import { searchNewLeads } from '../services/geminiService';

interface LeadListProps {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onAddLeads: (leads: Lead[]) => void;
}

const LeadList: React.FC<LeadListProps> = ({ leads, onSelect, onAddLeads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  
  // Advanced AI Search Form State
  const [aiSector, setAiSector] = useState('Varejo Automotivo');
  const [aiLocation, setAiLocation] = useState('São Paulo, SP');
  const [aiKeywords, setAiKeywords] = useState('Peças, Pneus, Serviços');
  const [aiSize, setAiSize] = useState('Pequena/Média');

  const filteredLeads = leads.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingAI(true);
    
    // Increased quality request
    const results = await searchNewLeads(aiSector, aiLocation, aiKeywords, aiSize, 3);
    
    // Convert Partial<Lead> to full Lead with defaults
    const newLeads: Lead[] = results.map(r => ({
      id: crypto.randomUUID(),
      companyName: r.companyName || 'Empresa Desconhecida',
      sector: r.sector || aiSector,
      location: r.location || aiLocation,
      score: r.score || 50,
      status: 'new',
      tags: r.tags || ['✨ IA Gold'],
      website: r.website,
      phone: r.phone,
      techStack: r.techStack,
      revenueEstimate: r.revenueEstimate,
      // @ts-ignore - Adding dynamic property for UI feedback
      matchReason: r.matchReason, 
      createdAt: new Date().toISOString(),
      ...r
    }));

    onAddLeads(newLeads);
    setIsSearchingAI(false);
    setShowAISearch(false);
  };

  const openGoogleMaps = (location: string, company: string) => {
    const query = encodeURIComponent(`${company} ${location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-4xl md:text-5xl font-black dark:text-white mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
            Oportunidades
          </h2>
          <p className="text-lg text-slate-500 font-medium">Gerencie seu pipeline e descubra novos negócios.</p>
        </div>
        <div className="flex gap-4">
             <button 
                onClick={() => setShowAISearch(!showAISearch)}
                className={`relative px-8 py-4 rounded-3xl font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 overflow-hidden ${showAISearch ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/30'}`}
             >
                 {/* Shiny effect overlay */}
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <Icons.Robot />
                {showAISearch ? 'Fechar Busca' : 'Nova Prospecção IA'}
             </button>
        </div>
      </div>

      {/* Advanced AI Search Panel (The "Best" Lead Gen UI) */}
      {showAISearch && (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 p-10 rounded-[2.5rem] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-6 relative overflow-hidden group">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-8 text-white flex items-center gap-3">
               <span className="p-3 bg-white/10 rounded-2xl backdrop-blur-md text-amber-400 border border-white/20"><Icons.Sparkles /></span>
               Inteligência de Prospecção Suprema
            </h3>
            
            <form onSubmit={handleAISearch} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-white/80 font-bold text-lg ml-2">🏭 Setor Alvo</label>
                    <input 
                        type="text" 
                        value={aiSector}
                        onChange={e => setAiSector(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-3xl px-6 py-5 text-xl text-white placeholder-white/40 focus:bg-white/20 focus:border-amber-400 outline-none transition-all shadow-inner"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-white/80 font-bold text-lg ml-2">📍 Região</label>
                    <input 
                        type="text" 
                        value={aiLocation}
                        onChange={e => setAiLocation(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-3xl px-6 py-5 text-xl text-white placeholder-white/40 focus:bg-white/20 focus:border-amber-400 outline-none transition-all shadow-inner"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-white/80 font-bold text-lg ml-2">🔑 Critérios Específicos</label>
                    <input 
                        type="text" 
                        value={aiKeywords}
                        onChange={e => setAiKeywords(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-3xl px-6 py-5 text-xl text-white placeholder-white/40 focus:bg-white/20 focus:border-amber-400 outline-none transition-all shadow-inner"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-white/80 font-bold text-lg ml-2">📏 Porte</label>
                    <select 
                        value={aiSize}
                        onChange={e => setAiSize(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-3xl px-6 py-5 text-xl text-white focus:bg-white/20 focus:border-amber-400 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                        <option className="text-slate-900">Pequena</option>
                        <option className="text-slate-900">Pequena/Média</option>
                        <option className="text-slate-900">Média/Grande</option>
                        <option className="text-slate-900">Enterprise</option>
                    </select>
                </div>

                <div className="md:col-span-2 pt-4">
                    <button 
                        type="submit" 
                        disabled={isSearchingAI}
                        className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white py-6 rounded-3xl font-black text-2xl shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:grayscale relative overflow-hidden"
                    >
                         {isSearchingAI ? (
                             <span className="flex items-center justify-center gap-4 animate-pulse">
                                 <Icons.Refresh /> Analisando Mercado Global...
                             </span>
                         ) : (
                             <span className="flex items-center justify-center gap-4">
                                 🚀 INICIAR VARREDURA INTELIGENTE
                             </span>
                         )}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
          <Icons.Search />
        </div>
        <input 
          type="text" 
          placeholder="Filtrar sua lista..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none dark:text-white"
        />
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 gap-6">
        {filteredLeads.map((lead) => (
          <div 
            key={lead.id} 
            className={`group relative bg-white dark:bg-slate-800 p-8 rounded-[2rem] border transition-all duration-300 hover:scale-[1.01] ${
                lead.score > 80 
                ? 'border-amber-400 dark:border-amber-500/50 shadow-2xl shadow-amber-500/10' 
                : 'border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {/* High Score Badge */}
            {lead.score > 80 && (
                <div className="absolute -top-4 right-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10">
                    <Icons.Sparkles /> Alta Prioridade
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between gap-8">
                {/* Left: Avatar & Info */}
                <div className="flex gap-6 items-start flex-1">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl ${
                        lead.score > 80 ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                        lead.score > 50 ? 'bg-gradient-to-br from-blue-400 to-purple-600' :
                        'bg-gradient-to-br from-slate-400 to-slate-600'
                    }`}>
                        {lead.companyName.charAt(0)}
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {lead.companyName}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                             <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">🏢 {lead.sector}</span>
                             <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">📍 {lead.location}</span>
                        </div>
                        
                        {/* The Match Reason - AI Insight */}
                        {(lead as any).matchReason && (
                            <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <p className="text-sm text-indigo-800 dark:text-indigo-300 italic flex gap-2">
                                    <Icons.Robot /> "{(lead as any).matchReason}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions & Score */}
                <div className="flex flex-col items-end gap-6 min-w-[180px]">
                    <div className="text-right">
                        <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {lead.score}<span className="text-lg text-slate-300">/100</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Score</p>
                    </div>

                    <div className="flex gap-3">
                         <button 
                             onClick={() => openGoogleMaps(lead.location || '', lead.companyName)}
                             className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                             title="Ver no Mapa"
                         >
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                         </button>
                         <button 
                             onClick={() => onSelect(lead)}
                             className="px-6 py-3 rounded-2xl font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white transition-all shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                         >
                             Detalhes <span className="text-xl">➔</span>
                         </button>
                    </div>
                </div>
            </div>
            
            {/* Tech Stack Footer */}
            {lead.techStack && lead.techStack.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex gap-2 overflow-x-auto pb-2">
                    {lead.techStack.map(t => (
                         <span key={t} className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                             {t}
                         </span>
                    ))}
                </div>
            )}
          </div>
        ))}
        
        {filteredLeads.length === 0 && (
          <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="inline-block p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <Icons.Search />
            </div>
            <h3 className="text-3xl font-bold text-slate-400 dark:text-slate-500">Nenhum lead encontrado</h3>
            <p className="text-slate-400 mt-2">Use a Inteligência Suprema acima para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadList;
