
import React, { useMemo } from 'react';
import { JournalEntry, Language, AccountType } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface ReportsProps {
  entries: JournalEntry[];
  language: Language;
}

const Reports: React.FC<ReportsProps> = ({ entries, language }) => {
  const t = translations[language];

  const categoryTotals = useMemo(() => {
    const categories: Record<string, { income: number, expense: number }> = {};
    
    entries.forEach(e => {
      const debitAcc = CHART_OF_ACCOUNTS.find(a => a.id === e.debitAccount);
      const creditAcc = CHART_OF_ACCOUNTS.find(a => a.id === e.creditAccount);

      if (debitAcc?.type === AccountType.EXPENSE) {
        if (!categories[debitAcc.name]) categories[debitAcc.name] = { income: 0, expense: 0 };
        categories[debitAcc.name].expense += e.amount;
      }
      if (creditAcc?.type === AccountType.INCOME) {
        if (!categories[creditAcc.name]) categories[creditAcc.name] = { income: 0, expense: 0 };
        categories[creditAcc.name].income += e.amount;
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      ...data,
      net: data.income - data.expense
    }));
  }, [entries]);

  // Primary neon colors
  const COLORS = ['#ff0055', '#e11d48', '#be123c', '#9f1239', '#881337', '#fb7185'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold neon-glow">{t.reports}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-6">Income vs Expense by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryTotals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="expense" fill="#ff0055" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-6">Net Impact Table</h2>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-slate-500 uppercase text-[10px] font-bold border-b dark:border-slate-700/50">
                <tr>
                  <th className="text-left pb-2">{t.category}</th>
                  <th className="text-right pb-2">{t.income}</th>
                  <th className="text-right pb-2">{t.expense}</th>
                  <th className="text-right pb-2">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {categoryTotals.map((cat, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-medium">{cat.name}</td>
                    <td className="py-3 text-right text-emerald-500">${cat.income.toFixed(2)}</td>
                    <td className="py-3 text-right text-primary-500">${cat.expense.toFixed(2)}</td>
                    <td className={`py-3 text-right font-bold ${cat.net >= 0 ? 'text-primary-400' : 'text-primary-600'}`}>
                      ${cat.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {categoryTotals.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
