
import React, { useMemo, useState } from 'react';
import { AppState, AccountType, Language, MonthlyBudget } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { 
  Target, 
  BarChart3, 
  PieChart as PieChartIcon, 
  AlertCircle, 
  Settings2, 
  ChevronRight, 
  TrendingDown, 
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import BudgetForm from './BudgetForm';

interface BudgetProps {
  state: AppState;
  onUpdateBudget: (budget: MonthlyBudget) => void;
}

const Budget: React.FC<BudgetProps> = ({ state, onUpdateBudget }) => {
  const t = translations[state.language];
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const currentBudget = useMemo(() => {
    return state.budgets.find(b => b.month === selectedMonth) || { month: selectedMonth, categories: [] };
  }, [state.budgets, selectedMonth]);

  // Real spending calculation from journal entries for the selected month
  const actualSpending = useMemo(() => {
    const expenses: Record<string, number> = {};
    const [year, month] = selectedMonth.split('-').map(Number);
    
    state.entries.forEach(entry => {
      const d = new Date(entry.date);
      if (d.getFullYear() === year && (d.getMonth() + 1) === month) {
        const processPart = (accId: string, amt: number) => {
          const acc = CHART_OF_ACCOUNTS.find(a => a.id === accId);
          if (acc?.type === AccountType.EXPENSE) {
            expenses[accId] = (expenses[accId] || 0) + amt;
          }
        };

        if (entry.debitAccount) processPart(entry.debitAccount, entry.amount);
        entry.debitParts?.forEach(p => processPart(p.accountId, p.amount));
      }
    });
    return expenses;
  }, [state.entries, selectedMonth]);

  const comparisonData = useMemo(() => {
    return currentBudget.categories.map(cat => {
      const acc = CHART_OF_ACCOUNTS.find(a => a.id === cat.accountId);
      const spent = actualSpending[cat.accountId] || 0;
      const pct = cat.budgeted > 0 ? (spent / cat.budgeted) * 100 : 0;
      let status: 'green' | 'yellow' | 'red' = 'green';
      if (pct > 100) status = 'red';
      else if (pct > 80) status = 'yellow';

      return {
        id: cat.accountId,
        name: acc?.name || cat.accountId,
        budgeted: cat.budgeted,
        spent,
        diff: cat.budgeted - spent,
        pct,
        status
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [currentBudget, actualSpending]);

  const totals = useMemo(() => {
    const budgeted = comparisonData.reduce((s, c) => s + c.budgeted, 0);
    const spent = comparisonData.reduce((s, c) => s + c.spent, 0);
    const pct = budgeted > 0 ? (spent / budgeted) * 100 : 0;
    return { budgeted, spent, available: budgeted - spent, pct };
  }, [comparisonData]);

  const COLORS = ['#ff0055', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">{t.budget}</h1>
          <p className="text-slate-500 text-sm font-medium">Controla tus gastos y planifica tu ahorro.</p>
        </div>
        <div className="flex gap-3">
           <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-primary-500 uppercase tracking-widest outline-none focus:border-primary-500 transition-all"
           />
           <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white border border-primary-500/30 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 shadow-lg shadow-primary-600/30"
           >
             <Settings2 size={14} /> {t.configureBudget}
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetKpi title={t.budgeted} value={totals.budgeted} info={`${comparisonData.length} categorías`} color="blue" />
        <BudgetKpi title={t.spent} value={totals.spent} info={`${totals.pct.toFixed(1)}% ${t.used}`} color={totals.pct > 100 ? 'rose' : totals.pct > 80 ? 'amber' : 'emerald'} />
        <BudgetKpi title={t.available} value={totals.available} info={totals.available >= 0 ? 'Sobra' : 'Falta'} color={totals.available >= 0 ? 'emerald' : 'rose'} />
      </div>

      {/* Traffic Lights Quick View */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
          Semáforo de Gastos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {comparisonData.map(item => (
            <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2 group hover:bg-white/10 transition-all">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentcolor] ${
                item.status === 'green' ? 'text-emerald-500 bg-emerald-500' : 
                item.status === 'yellow' ? 'text-amber-500 bg-amber-500' : 'text-rose-500 bg-rose-500'
              }`} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full">{item.name}</p>
              <p className="text-sm font-black text-white">{item.pct.toFixed(0)}%</p>
            </div>
          ))}
          {comparisonData.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-600 text-xs font-black uppercase tracking-widest">
              Configura un presupuesto para empezar
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparison Table */}
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Presupuesto vs Real</h2>
            <LayoutGrid size={16} className="text-slate-600" />
          </div>
          <div className="flex-1 overflow-auto max-h-[500px] scrollbar-thin">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <th className="p-5">Categoría</th>
                  <th className="p-5 text-right">Presup.</th>
                  <th className="p-5 text-right">Real</th>
                  <th className="p-5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonData.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-tight">{item.name}</span>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.status === 'green' ? 'bg-emerald-500' : item.status === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min(item.pct, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right text-xs font-bold text-slate-400">${item.budgeted.toLocaleString()}</td>
                    <td className="p-5 text-right text-xs font-black text-slate-100">${item.spent.toLocaleString()}</td>
                    <td className="p-5">
                      <div className="flex justify-center">
                         <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${
                           item.status === 'green' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                           item.status === 'yellow' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                           'bg-rose-500/10 text-rose-500 border-rose-500/20'
                         }`}>
                           {item.pct.toFixed(0)}%
                         </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Side */}
        <div className="space-y-8">
           <div className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl h-[300px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Comparativa de Barras</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#64748b', fontWeight: 800}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,0,85,0.2)' }}
                    labelStyle={{ color: '#ff0055', fontWeight: 900, fontSize: '10px' }}
                  />
                  <Bar dataKey="budgeted" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="spent" radius={[4, 4, 0, 0]} barSize={20}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'red' ? '#f43f5e' : entry.status === 'yellow' ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>

           <div className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl h-[300px]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Distribución del Presupuesto</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={comparisonData.filter(d => d.budgeted > 0)}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="budgeted"
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {isFormOpen && (
        <BudgetForm 
          month={selectedMonth}
          existingBudget={currentBudget}
          onClose={() => setIsFormOpen(false)}
          onSave={(budget) => {
            onUpdateBudget(budget);
            setIsFormOpen(false);
          }}
          language={state.language}
        />
      )}
    </div>
  );
};

interface BudgetKpiProps { title: string; value: number; info: string; color: string; }
const BudgetKpi: React.FC<BudgetKpiProps> = ({ title, value, info, color }) => (
  <div className="glass p-6 rounded-[2rem] border border-white/5 shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-${color}-500/10 transition-all`} />
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
    <p className="text-2xl font-black text-white italic tracking-tighter mb-2">
      ${Math.abs(value).toLocaleString()}
    </p>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 shadow-[0_0_5px_currentcolor]`} />
      <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-500/80`}>{info}</span>
    </div>
  </div>
);

export default Budget;
