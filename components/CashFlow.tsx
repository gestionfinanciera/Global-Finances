
import React, { useMemo, useState } from 'react';
import { AppState, AccountType, CashFlowItem, Language } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import CashFlowForm from './CashFlowForm';

interface CashFlowProps {
  state: AppState;
  onAddItem: (item: Omit<CashFlowItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const CashFlow: React.FC<CashFlowProps> = ({ state, onAddItem, onDeleteItem, onToggleStatus }) => {
  const t = translations[state.language];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('income');

  // Calculate actual current liquid balance from Journal Entries
  const currentLiquidBalance = useMemo(() => {
    let balance = 0;
    const liquidAccountIds = ['acc_cash', 'acc_bank', 'acc_petty_cash'];
    
    state.entries.forEach(entry => {
      // Simple entry logic
      if (entry.debitAccount && liquidAccountIds.includes(entry.debitAccount)) balance += entry.amount;
      if (entry.creditAccount && liquidAccountIds.includes(entry.creditAccount)) balance -= entry.amount;

      // Multi-line logic
      entry.debitParts?.forEach(p => {
        if (liquidAccountIds.includes(p.accountId)) balance += p.amount;
      });
      entry.creditParts?.forEach(p => {
        if (liquidAccountIds.includes(p.accountId)) balance -= p.amount;
      });
    });
    
    return balance;
  }, [state.entries]);

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);

    const upcoming = state.cashFlowItems.filter(item => {
      const d = new Date(item.date);
      return d >= now && d <= thirtyDaysLater && item.status === 'pending';
    });

    const income = upcoming.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const expense = upcoming.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);

    return {
      current: currentLiquidBalance,
      income,
      expense,
      projected: currentLiquidBalance + income - expense
    };
  }, [state.cashFlowItems, currentLiquidBalance]);

  const timelineData = useMemo(() => {
    const data = [];
    const now = new Date();
    let rollingBalance = currentLiquidBalance;

    // Sort all upcoming pending items
    const sortedProjections = [...state.cashFlowItems]
      .filter(i => i.status === 'pending' && new Date(i.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Point zero (Today)
    data.push({
      date: t.today || 'Hoy',
      balance: rollingBalance
    });

    sortedProjections.forEach(item => {
      if (item.type === 'income') rollingBalance += item.amount;
      else rollingBalance -= item.amount;

      data.push({
        date: new Date(item.date).toLocaleDateString(state.language, { day: '2-digit', month: 'short' }),
        balance: rollingBalance,
        desc: item.description
      });
    });

    return data;
  }, [state.cashFlowItems, currentLiquidBalance, state.language]);

  const sortedList = useMemo(() => {
    let rolling = currentLiquidBalance;
    return [...state.cashFlowItems]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => {
        if (item.type === 'income') rolling += item.amount;
        else rolling -= item.amount;
        return { ...item, rollingBalance: rolling };
      });
  }, [state.cashFlowItems, currentLiquidBalance]);

  const openForm = (type: 'income' | 'expense') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">{t.cashFlow}</h1>
          <p className="text-slate-500 text-sm font-medium">Anticipa tus movimientos de efectivo.</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => openForm('income')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-xl font-bold text-xs uppercase transition-all hover:bg-emerald-600/30 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
           >
             <TrendingUp size={14} /> {t.newIncome}
           </button>
           <button 
            onClick={() => openForm('expense')}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 text-rose-500 border border-rose-500/30 rounded-xl font-bold text-xs uppercase transition-all hover:bg-rose-600/30 active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
           >
             <TrendingDown size={14} /> {t.newExpense}
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CashFlowKpi title={t.currentBalance} value={stats.current} icon={<Wallet className="text-emerald-400" />} color="emerald" />
        <CashFlowKpi title={t.upcomingIncome} value={stats.income} icon={<TrendingUp className="text-blue-400" />} color="blue" />
        <CashFlowKpi title={t.upcomingExpense} value={stats.expense} icon={<TrendingDown className="text-rose-400" />} color="rose" />
        <CashFlowKpi title={t.projectedBalance} value={stats.projected} icon={<Calendar className="text-amber-400" />} color="amber" isAlert={stats.projected < 0} />
      </div>

      {/* Main Chart */}
      <div className="glass p-6 rounded-[2.5rem] border border-primary-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-lg font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
             <div className="w-2 h-8 bg-primary-600 rounded-full" />
             Evolución de Disponibilidad
           </h2>
           <div className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase">Proyección 60 días</div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#475569', fontWeight: 800}}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#475569', fontWeight: 800}}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,0,85,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#ff0055', fontWeight: 900, fontSize: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#ff0055" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projections Table */}
      <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Listado de Proyecciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-5">Fecha</th>
                <th className="p-5">Descripción</th>
                <th className="p-5">Categoría</th>
                <th className="p-5">Monto</th>
                <th className="p-5">Estado</th>
                <th className="p-5 text-right">Saldo Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedList.map((item) => (
                <tr key={item.id} className={`group hover:bg-white/[0.02] transition-colors ${item.rollingBalance < 0 ? 'bg-rose-500/5' : ''}`}>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-200">{new Date(item.date).toLocaleDateString(state.language)}</span>
                      {new Date(item.date) < new Date() && item.status === 'pending' && (
                        <span className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-1">
                          <AlertTriangle size={10} /> Vencido
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-slate-100 transition-colors uppercase tracking-tight">{item.description}</span>
                  </td>
                  <td className="p-5">
                    <span className="text-[10px] font-black uppercase py-1 px-3 bg-white/5 rounded-full border border-white/5 text-slate-500">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`text-sm font-black ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-5">
                    <button 
                      onClick={() => onToggleStatus(item.id)}
                      className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                        item.status === 'realized' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-primary-500/30 hover:text-primary-400'
                      }`}
                    >
                      {item.status === 'realized' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.status === 'realized' ? t.realized : t.pending}
                    </button>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`text-sm font-black ${item.rollingBalance < 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                      ${item.rollingBalance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {state.cashFlowItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">No hay proyecciones registradas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <CashFlowForm 
          type={formType}
          onClose={() => setIsFormOpen(false)}
          onSubmit={(data) => {
            onAddItem(data);
            setIsFormOpen(false);
          }}
          language={state.language}
        />
      )}
    </div>
  );
};

interface KpiProps { title: string; value: number; icon: React.ReactNode; color: string; isAlert?: boolean; }
const CashFlowKpi: React.FC<KpiProps> = ({ title, value, icon, color, isAlert }) => (
  <div className={`glass p-5 rounded-3xl border ${isAlert ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'} transition-all hover:scale-[1.02] shadow-xl`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        <p className={`text-xl font-black ${isAlert ? 'text-rose-500 neon-glow' : 'text-white'}`}>
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

export default CashFlow;
