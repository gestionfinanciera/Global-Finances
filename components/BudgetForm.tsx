
import React, { useState, useMemo } from 'react';
import { X, Save, Target, Plus, Trash2, PieChart } from 'lucide-react';
import { Language, MonthlyBudget, AccountType } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';

interface BudgetFormProps {
  month: string;
  existingBudget: MonthlyBudget;
  onClose: () => void;
  onSave: (budget: MonthlyBudget) => void;
  language: Language;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ month, existingBudget, onClose, onSave, language }) => {
  const t = translations[language];
  const [categories, setCategories] = useState(() => {
    // Start with existing categories or default ones based on expense accounts
    if (existingBudget.categories.length > 0) return [...existingBudget.categories];
    
    // Suggest default budgets for common expense accounts if empty
    return CHART_OF_ACCOUNTS
      .filter(a => a.type === AccountType.EXPENSE)
      .slice(0, 5)
      .map(a => ({ accountId: a.id, budgeted: 0 }));
  });

  const expenseAccounts = useMemo(() => 
    CHART_OF_ACCOUNTS.filter(a => a.type === AccountType.EXPENSE), []
  );

  const addCategory = () => {
    setCategories([...categories, { accountId: '', budgeted: 0 }]);
  };

  const removeCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const updateCategory = (idx: number, field: 'accountId' | 'budgeted', value: string | number) => {
    const next = [...categories];
    next[idx] = { ...next[idx], [field]: value };
    setCategories(next);
  };

  const total = categories.reduce((s, c) => s + (c.budgeted || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      month,
      categories: categories.filter(c => c.accountId && c.budgeted > 0)
    });
  };

  const [yearStr, monthStr] = month.split('-');
  const dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
  const monthName = dateObj.toLocaleString(language, { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary-500/5">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary-600/20 text-primary-500 shadow-[0_0_15px_rgba(255,0,85,0.2)]">
                <Target size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black uppercase tracking-tight italic neon-glow">
                 {t.configureBudget}
               </h2>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{monthName}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex gap-4 items-end animate-in slide-in-from-left-2 duration-200 group">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Cuenta de Gasto</label>
                  <select
                    value={cat.accountId}
                    onChange={(e) => updateCategory(idx, 'accountId', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-slate-300 outline-none focus:border-primary-500 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    {expenseAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Presupuesto ($)</label>
                  <input
                    type="number"
                    value={cat.budgeted || ''}
                    placeholder="0"
                    onChange={(e) => updateCategory(idx, 'budgeted', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-black text-white outline-none focus:border-primary-500 transition-all"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => removeCategory(idx)}
                  className="p-3 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={addCategory}
            className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <Plus size={14} /> Añadir Categoría
          </button>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between shadow-inner">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-600/10 rounded-2xl text-primary-500 border border-primary-500/20">
                  <PieChart size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Presupuestado</p>
                  <p className="text-xl font-black text-white tracking-tighter">${total.toLocaleString()}</p>
                </div>
             </div>
             <p className="text-[9px] font-bold text-slate-600 uppercase max-w-[120px] text-right italic">Suma total de gastos planificados para el periodo.</p>
          </div>
        </form>

        <div className="p-6 border-t border-white/5 flex gap-4 bg-black/20">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-500 font-bold text-[10px] uppercase hover:bg-white/5 transition-all tracking-widest"
          >
            {t.cancel}
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="flex-[2] py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all flex items-center justify-center gap-2 tracking-widest"
          >
            <Save size={16} /> {t.save} Presupuesto
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
