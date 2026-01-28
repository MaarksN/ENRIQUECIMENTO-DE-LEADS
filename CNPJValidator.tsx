import React, { useState } from 'react';
import { Icons } from '../constants';

const CNPJValidator: React.FC = () => {
  const [cnpj, setCnpj] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Simulation for Demo purposes as BrasilAPI might need proxy in some envs
    // In production, use: fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, '')}`)
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate API Response based on mock logic
    const success = Math.random() > 0.3;
    
    if (success) {
      setResult({
        status: 'success',
        data: {
          razao_social: "EMPRESA EXEMPLO S.A.",
          cnpj: cnpj,
          situacao_cadastral: "ATIVA",
          cnae_fiscal_principal_code: "4511-1/01",
          cnae_fiscal_principal: "Comércio a varejo de automóveis, camionetas e utilitários novos"
        }
      });
    } else {
      setResult({ status: 'error', message: 'CNPJ Inválido ou Baixado na Receita Federal.' });
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <Icons.Check /> Validação de CNPJ (#14)
      </h2>
      <p className="text-sm text-slate-500 mb-6">Valide a existência legal da empresa antes de prospectar.</p>

      <form onSubmit={handleValidate} className="flex gap-2">
        <input 
          type="text" 
          placeholder="00.000.000/0000-00" 
          value={cnpj}
          onChange={e => setCnpj(e.target.value)}
          className="flex-1 rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white px-3 py-2 border focus:ring-2 focus:ring-primary-500 outline-none"
        />
        <button 
          type="submit" 
          disabled={loading || !cnpj}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          {result.status === 'success' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
                <Icons.Check /> CNPJ Ativo
              </div>
              <div className="text-sm dark:text-slate-300">
                <p><span className="font-semibold">Razão Social:</span> {result.data.razao_social}</p>
                <p><span className="font-semibold">Atividade:</span> {result.data.cnae_fiscal_principal}</p>
                <p><span className="font-semibold">CNAE:</span> {result.data.cnae_fiscal_principal_code}</p>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                <Icons.X /> {result.message}
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CNPJValidator;