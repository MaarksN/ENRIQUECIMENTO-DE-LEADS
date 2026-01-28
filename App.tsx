import React, { useState, useEffect } from 'react';
import { Icons } from './constants';
import Dashboard from './components/Dashboard';
import LeadList from './components/LeadList';
import LeadModal from './components/LeadModal';
import CNPJValidator from './components/CNPJValidator';
import AILab from './components/AILab';
import { Lead } from './types';

// Mock Data for Initial State
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    companyName: 'Concessionária Estrela',
    sector: 'Concessionárias',
    location: 'São Paulo, SP',
    score: 85,
    status: 'negotiation',
    tags: ['quente', 'luxo'],
    website: 'www.estrelaauto.com.br',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    companyName: 'Auto Center Brasil',
    sector: 'Revenda Multimarcas',
    location: 'Curitiba, PR',
    score: 60,
    status: 'new',
    tags: ['revenda'],
    website: 'www.autocenterbr.com',
    createdAt: new Date().toISOString()
  },
];

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'dashboard' | 'leads' | 'validation' | 'ailab'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // #42 Dark Mode Implementation
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter(l => l.score > 70).length,
    conversionRate: 12.5,
    projectedRevenue: 450000
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    setSelectedLead(updated);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Sidebar - Updated Design */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col shadow-2xl z-10">
        <div className="p-8 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800/50">
          <div className="w-16 h-16 mb-4 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
             <Icons.Sparkles />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent uppercase leading-tight text-center tracking-tighter">
            SALES PROSPECTOR
          </h1>
          <span className="text-xs font-bold tracking-[0.2em] text-slate-400 mt-1">AI INTELLIGENCE</span>
        </div>

        <div className="px-6 py-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Data & Hora</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs font-medium text-slate-500">
                    {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            <nav className="space-y-3">
            <button 
                onClick={() => setView('dashboard')}
                className={`group flex items-center gap-4 w-full px-6 py-4 text-base font-bold rounded-3xl transition-all duration-300 ${view === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'}`}
            >
                <Icons.Dashboard /> Dashboard
            </button>
            <button 
                onClick={() => setView('leads')}
                className={`group flex items-center gap-4 w-full px-6 py-4 text-base font-bold rounded-3xl transition-all duration-300 ${view === 'leads' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'}`}
            >
                <Icons.Leads /> Leads & IA
            </button>
            <button 
                onClick={() => setView('ailab')}
                className={`group flex items-center gap-4 w-full px-6 py-4 text-base font-bold rounded-3xl transition-all duration-300 ${view === 'ailab' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'}`}
            >
                <Icons.Lab /> Laboratório IA
            </button>
            <button 
                onClick={() => setView('validation')}
                className={`group flex items-center gap-4 w-full px-6 py-4 text-base font-bold rounded-3xl transition-all duration-300 ${view === 'validation' ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg dark:from-slate-700 dark:to-slate-600 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'}`}
            >
                <Icons.Check /> Validação CNPJ
            </button>
            </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all"
          >
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            {darkMode ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B1120]">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
          {view === 'dashboard' && <Dashboard stats={stats} />}
          {view === 'leads' && (
            <LeadList 
              leads={leads} 
              onSelect={setSelectedLead} 
              onAddLeads={(newLeads) => setLeads(prev => [...newLeads, ...prev])}
            />
          )}
          {view === 'ailab' && <AILab />}
          {view === 'validation' && <CNPJValidator />}
        </div>
      </main>

      {/* Modal */}
      {selectedLead && (
        <LeadModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
        />
      )}

    </div>
  );
};

export default App;