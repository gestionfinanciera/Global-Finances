
import React, { useMemo } from 'react';
import { AppState, AccountType, Language, JournalEntry } from '../types';
import { translations } from '../translations';
import { ArrowUpCircle, ArrowDownCircle, Wallet, ListChecks } from 'lucide-react';
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
  Pie
} from 'recharts';
import { CHART_OF_ACCOUNTS } from '../accounts';

interface DashboardProps {
  state: AppState;
  onAddClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAddClick }) => {
  const t = translations[state.language];

  const getEntryTotals = (entry: JournalEntry) => {
    let income = 0;
    let expense = 0;
    
    // Handle simple entries
    if (entry.debitAccount) {
      const debitAcc = CHART_OF_ACCOUNTS.find(a => a.id === entry.debitAccount);
      if (debitAcc?.type === AccountType.EXPENSE) expense += entry.amount;
    }
    if (entry.creditAccount) {
      const creditAcc = CHART_OF_ACCOUNTS.find(a => a.id === entry.creditAccount);
      if (creditAcc?.type === AccountType.INCOME) income += entry.amount;
    }

    // Handle multi-line entries
    if (entry.debitParts) {
      entry.debitParts.forEach(p => {
        const acc = CHART_OF_ACCOUNTS.find(a => a.id === p.accountId);
        if (acc?.type === AccountType.EXPENSE) expense += p.amount;
      });
    }
    if (entry.creditParts) {
      entry.creditParts.forEach(p => {
        const acc = CHART_OF_ACCOUNTS.find(a => a.id === p.accountId);
        if (acc?.type === AccountType.INCOME) income += p.amount;
      });
    }

    return { income, expense };
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthEntries = state.entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    let income = 0;
    let expenses = 0;

    monthEntries.forEach(e => {
      const totals = getEntryTotals(e);
      income += totals.income;
      expenses += totals.expense;
    });

    return {
      income,
      expenses,
      balance: income - expenses,
      count: monthEntries.length
    };
  }, [state.entries]);

  const chartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString(state.language, { month: 'short' });
      
      const mEntries = state.entries.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      });

      let mInc = 0;
      let mExp = 0;
      mEntries.forEach(e => {
        const totals = getEntryTotals(e);
        mInc += totals.income;
        mExp += totals.expense;
      });

      months.push({ name: monthName, income: mInc, expense: mExp });
    }
    return months;
  }, [state.entries, state.language]);

  const expenseDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    state.entries.forEach(e => {
      const addExp = (accId: string, amt: number) => {
        const acc = CHART_OF_ACCOUNTS.find(a => a.id === accId);
        if (acc?.type === AccountType.EXPENSE) {
          dist[acc.name] = (dist[acc.name] || 0) + amt;
        }
      };

      if (e.debitAccount) addExp(e.debitAccount, e.amount);
      if (e.debitParts) e.debitParts.forEach(p => addExp(p.accountId, p.amount));
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [state.entries]);

  const COLORS = ['#ff0055', '#e11d48', '#be123c', '#9f1239', '#881337', '#fb7185'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight neon-glow">
            {state.language === Language.ES ? '¡Hola!' : 'Hello!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {state.language === Language.ES ? 'Aquí tienes tu resumen financiero.' : "Here's your financial summary."}
          </p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-primary-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-primary-500/40 hover:bg-primary-600 transition-all md:w-auto neon-border"
        >
          {t.addEntry}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t.income} value={stats.income} icon={<ArrowUpCircle className="text-emerald-500" />} color="bg-emerald-50 dark:bg-emerald-950/40" />
        <KpiCard title={t.expense} value={stats.expenses} icon={<ArrowDownCircle className="text-primary-500" />} color="bg-primary-50 dark:bg-primary-950/40" />
        <KpiCard title={t.balance} value={stats.balance} icon={<Wallet className="text-primary-400" />} color="bg-slate-100 dark:bg-slate-900/60" />
        <KpiCard title={t.transactions} value={stats.count} isCurrency={false} icon={<ListChecks className="text-amber-500" />} color="bg-amber-50 dark:bg-amber-950/40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-6">Financial Evolution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                  cursor={{fill: 'rgba(255,0,85,0.05)'}} 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }} 
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ff0055" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-6">Expense Distribution</h2>
          <div className="h-64 flex flex-col items-center justify-center">
            {expenseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">{t.noEntries}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isCurrency?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, isCurrency = true }) => {
  return (
    <div className="glass p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-transform hover:translate-y-[-2px]">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} border border-white/5`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold">
          {isCurrency ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : value}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
