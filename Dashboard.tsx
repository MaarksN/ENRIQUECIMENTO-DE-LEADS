import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
}

const data = [
  { name: 'Seg', leads: 4 },
  { name: 'Ter', leads: 7 },
  { name: 'Qua', leads: 5 },
  { name: 'Qui', leads: 10 },
  { name: 'Sex', leads: 8 },
  { name: 'Sáb', leads: 2 },
];

const pieData = [
  { name: 'Novos', value: 400 },
  { name: 'Qualificados', value: 300 },
  { name: 'Negociação', value: 300 },
  { name: 'Perdidos', value: 200 },
];

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Dashboard de Performance (#45)</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total de Leads</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalLeads}</p>
          <span className="text-xs text-green-500">+12% vs mês anterior</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Leads Qualificados</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.qualifiedLeads}</p>
          <span className="text-xs text-green-500">+5% conversão</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Taxa de Conversão</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.conversionRate}%</p>
          <span className="text-xs text-red-500">-2% vs mês anterior</span>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">Receita Projetada</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">R$ {stats.projectedRevenue.toLocaleString()}</p>
          <span className="text-xs text-green-500">Baseado no pipeline</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-80">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Leads Capturados (Semana)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="leads" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 h-80">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Distribuição do Funil</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
