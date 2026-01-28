import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Icons } from './constants';
import Dashboard from './Dashboard';
import LeadList from './LeadList';
import LeadModal from './LeadModal';
import CNPJValidator from './CNPJValidator';
import AILab from './AILab';
import { Lead } from './types';
import useLocalStorage from './src/hooks/useLocalStorage';

const ToolsHub = React.lazy(() => import('./src/components/ToolsHub'));

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
  const [view, setView] = useState<'dashboard' | 'leads' | 'validation' | 'ailab' | 'tools'>('dashboard');
  const [leads, setLeads] = useLocalStorage<Lead[]>('leads_db', MOCK_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [collapsed, setCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // Dynamic Favicon
  useEffect(() => {
    document.title = leads.length > 0 ? `(${leads.length}) Sales App` : 'Sales App';
  }, [leads]);

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
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          style: {
            background: 'green',
          },
        },
        error: {
          style: {
            background: 'red',
          },
        },
      }}/>
      
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
             <Icons.Sparkles />
           </div>
           <span className="font-bold text-slate-800 dark:text-white">Sales App</span>
        </div>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 text-slate-600 dark:text-slate-300">
          {showMobileMenu ? <Icons.X /> : <Icons.Menu />}
        </button>
      </div>

      {/* Sidebar - Updated Design */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${showMobileMenu ? 'fixed inset-y-0 left-0 flex z-50' : 'hidden md:flex'} flex-col shadow-2xl z-10`}>
        <div className={`p-6 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800/50 ${collapsed ? 'py-4' : 'py-8'}`}>
          <div className={`${collapsed ? 'w-10 h-10' : 'w-16 h-16'} mb-4 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all`}>
             <Icons.Sparkles />
          </div>
          {!collapsed && (
            <>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 bg-clip-text text-transparent uppercase leading-tight text-center tracking-tighter">
                SALES PROSPECTOR
              </h1>
              <span className="text-xs font-bold tracking-[0.2em] text-slate-400 mt-1">AI INTELLIGENCE</span>
            </>
          )}
        </div>

        <div className="px-6 py-6">
            {!collapsed && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Data & Hora</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs font-medium text-slate-500">
                    {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
            )}

            <nav className="space-y-3">
            <button 
                onClick={() => setView('dashboard')}
                title="Dashboard"
                className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'gap-4 w-full px-6 py-4'} text-base font-bold rounded-3xl transition-all duration-300 ${view === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'} ${collapsed ? 'hover:pl-0 hover:scale-110' : ''}`}
            >
                <Icons.Dashboard /> {!collapsed && 'Dashboard'}
            </button>
            <button 
                onClick={() => setView('leads')}
                title="Leads & IA"
                className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'gap-4 w-full px-6 py-4'} text-base font-bold rounded-3xl transition-all duration-300 ${view === 'leads' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'} ${collapsed ? 'hover:pl-0 hover:scale-110' : ''}`}
            >
                <Icons.Leads /> {!collapsed && 'Leads & IA'}
            </button>
            <button 
                onClick={() => setView('ailab')}
                title="Laboratório IA"
                className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'gap-4 w-full px-6 py-4'} text-base font-bold rounded-3xl transition-all duration-300 ${view === 'ailab' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'} ${collapsed ? 'hover:pl-0 hover:scale-110' : ''}`}
            >
                <Icons.Lab /> {!collapsed && 'Laboratório IA'}
            </button>
            <button
                onClick={() => setView('tools')}
                title="100 Power Tools"
                className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'gap-4 w-full px-6 py-4'} text-base font-bold rounded-3xl transition-all duration-300 ${view === 'tools' ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/30 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'} ${collapsed ? 'hover:pl-0 hover:scale-110' : ''}`}
            >
                <Icons.Sparkles /> {!collapsed && '100 Power Tools'}
            </button>
            <button 
                onClick={() => setView('validation')}
                title="Validação CNPJ"
                className={`group flex items-center ${collapsed ? 'justify-center p-3' : 'gap-4 w-full px-6 py-4'} text-base font-bold rounded-3xl transition-all duration-300 ${view === 'validation' ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg dark:from-slate-700 dark:to-slate-600 transform scale-105' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:pl-7'} ${collapsed ? 'hover:pl-0 hover:scale-110' : ''}`}
            >
                <Icons.Check /> {!collapsed && 'Validação CNPJ'}
            </button>
            </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all"
          >
             {collapsed ? <span className="rotate-180">➔</span> : <span className="rotate-0">◀ Recolher</span>}
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-2xl transition-all`}
            title="Alternar Tema"
          >
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            {!collapsed && (darkMode ? 'Modo Claro' : 'Modo Escuro')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B1120] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 font-medium">
             <span>Home</span>
             <span className="text-slate-300">/</span>
             <span className="capitalize">{view}</span>
          </div>

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
          {view === 'tools' && (
             <React.Suspense fallback={<div className="p-10 text-center text-slate-500">Carregando Ferramentas...</div>}>
                 <ToolsHub />
             </React.Suspense>
          )}

          {/* 404 Fallback */}
          {!['dashboard', 'leads', 'ailab', 'validation', 'tools'].includes(view) && (
            <div className="text-center p-20">
               <div className="text-6xl mb-4">😕</div>
               <h2 className="text-3xl font-bold mb-6 dark:text-white">Página não encontrada</h2>
               <button onClick={() => setView('dashboard')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all">
                 Voltar ao Dashboard
               </button>
            </div>
          )}
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