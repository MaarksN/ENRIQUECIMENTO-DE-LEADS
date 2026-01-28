import React, { useState, useMemo } from 'react';
import { Icons } from '../../constants';
import { TOOLS_REGISTRY } from '../config/toolsRegistry';
import { AIToolConfig, ToolInput } from '../../types';
import { executeAITool } from '../../geminiService';
import { toast } from 'react-hot-toast';

const ToolsHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTool, setActiveTool] = useState<AIToolConfig | null>(null);

  // Estado do Formulário Dinâmico
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Filtragem inteligente das ferramentas
  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const handleToolSelect = (tool: AIToolConfig) => {
    setActiveTool(tool);
    setResult(null);
    setFormValues({}); // Limpa o formulário anterior
  };

  const handleExecute = async () => {
    if (!activeTool) return;
    setLoading(true);
    setResult(null);

    try {
      // Validação básica: verifica se campos obrigatórios estão preenchidos
      const missingFields = activeTool.inputs.filter(input => !formValues[input.name]);
      if (missingFields.length > 0) {
        throw new Error(`Por favor, preencha o campo: ${missingFields[0].label}`);
      }

      // Executa o motor de IA
      const output = await executeAITool(activeTool.promptTemplate, formValues, activeTool.systemRole);
      setResult(output);
      toast.success('Ferramenta executada com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza Inputs Dinamicamente baseado no tipo (text, textarea, select)
  const renderInput = (input: ToolInput) => {
    const commonClasses = "w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white";

    switch (input.type) {
      case 'textarea':
        return (
          <textarea
            rows={5}
            className={commonClasses}
            placeholder={input.placeholder}
            value={formValues[input.name] || ''}
            onChange={(e) => setFormValues(prev => ({ ...prev, [input.name]: e.target.value }))}
          />
        );
      case 'select':
        return (
          <select
            className={commonClasses}
            value={formValues[input.name] || ''}
            onChange={(e) => setFormValues(prev => ({ ...prev, [input.name]: e.target.value }))}
          >
            <option value="">Selecione...</option>
            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return (
          <input
            type={input.type} // text ou number
            className={commonClasses}
            placeholder={input.placeholder}
            value={formValues[input.name] || ''}
            onChange={(e) => setFormValues(prev => ({ ...prev, [input.name]: e.target.value }))}
          />
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                <Icons.Sparkles className="text-amber-500" />
                100 Power Tools
            </h2>
            <p className="text-slate-500">Suite de ferramentas de inteligência comercial.</p>
        </div>

        {/* Barra de Busca */}
        <div className="relative w-full md:w-96">
            <Icons.Search className="absolute left-3 top-3 text-slate-400" />
            <input
                type="text"
                placeholder="Buscar (ex: objeção, script, email)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'prospecting', 'enrichment', 'copywriting', 'strategy', 'closing'].map(cat => (
            <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                {cat === 'all' ? 'Todas' : cat}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

        {/* Esquerda: Grade de Ferramentas */}
        <div className={`${activeTool ? 'lg:col-span-5 hidden lg:block' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min`}>
            {filteredTools.map(tool => (
                <div
                    key={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
                        activeTool?.id === tool.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                >
                    <div className="flex justify-between mb-3">
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                            tool.category === 'prospecting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            tool.category === 'closing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                            {tool.category}
                        </span>
                        <span className="text-slate-300 font-mono text-xs">#{tool.id.split('_')[1]}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 dark:text-white leading-tight">{tool.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{tool.description}</p>
                </div>
            ))}
        </div>

        {/* Direita: Área de Execução (Workspace) */}
        {activeTool && (
            <div className="lg:col-span-7 fixed inset-0 lg:static z-50 bg-white dark:bg-[#0B1120] lg:bg-transparent lg:z-auto overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="p-6 h-full flex flex-col">

                    {/* Botão Voltar (Mobile) */}
                    <div className="lg:hidden flex justify-between items-center mb-6">
                        <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-slate-500 font-bold">
                            <Icons.ChevronLeft /> Voltar para Lista
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 flex-1 flex flex-col">
                        <div className="mb-6 pb-6 border-b dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Icons.Sparkles size={24} />
                                </div>
                                <h2 className="text-2xl font-bold dark:text-white">{activeTool.name}</h2>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">{activeTool.description}</p>
                        </div>

                        {/* Formulário Gerado Automaticamente */}
                        <div className="space-y-6 mb-8">
                            {activeTool.inputs.map(input => (
                                <div key={input.name}>
                                    <label className="block text-sm font-bold mb-2 dark:text-slate-300">
                                        {input.label}
                                    </label>
                                    {renderInput(input)}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleExecute}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            {loading ? <Icons.Refresh className="animate-spin" /> : <Icons.Zap />}
                            {loading ? 'Processando Inteligência...' : 'Executar Ferramenta'}
                        </button>

                        {/* Área de Resultado */}
                        {result && (
                            <div className="mt-8 pt-8 border-t dark:border-slate-700 animate-in slide-in-from-bottom fade-in duration-500">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                        <Icons.Check className="text-green-500" /> Resultado Gerado:
                                    </h3>
                                    <button
                                        onClick={() => {navigator.clipboard.writeText(result); toast.success('Copiado para área de transferência!')}}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        COPIAR TEXTO
                                    </button>
                                </div>
                                <div className="bg-slate-50 dark:bg-[#05050A] p-6 rounded-xl border border-slate-200 dark:border-slate-700 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap overflow-auto max-h-[500px] shadow-inner">
                                    {result}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ToolsHub;
