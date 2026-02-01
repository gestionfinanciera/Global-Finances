
import React, { useState } from 'react';
import { X, DollarSign, Wallet, FileText, LayoutGrid, Database } from 'lucide-react';
import { Language, JournalEntry, AccountType } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';

interface EntryFormProps {
  onClose: () => void;
  onSubmit: (entry: Omit<JournalEntry, 'id'>) => void;
  language: Language;
}

type Tab = 'income' | 'expense' | 'manual' | 'opening';

const EntryForm: React.FC<EntryFormProps> = ({ onClose, onSubmit, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<Tab>('income');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    debitAccount: '',
    creditAccount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.debitAccount || !formData.creditAccount) {
      alert("Please fill all fields");
      return;
    }

    onSubmit({
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      debitAccount: formData.debitAccount,
      creditAccount: formData.creditAccount
    });
  };

  const setIncomeMode = () => {
    setActiveTab('income');
    setFormData(prev => ({ 
      ...prev, 
      debitAccount: 'acc_bank', 
      creditAccount: 'acc_sales',
      description: 'Sale Income'
    }));
  };

  const setExpenseMode = () => {
    setActiveTab('expense');
    setFormData(prev => ({ 
      ...prev, 
      debitAccount: 'acc_supplies', 
      creditAccount: 'acc_bank',
      description: 'General Expense'
    }));
  };

  const setManualMode = () => {
    setActiveTab('manual');
  };

  const setOpeningMode = () => {
    setActiveTab('opening');
    setFormData(prev => ({ 
      ...prev, 
      debitAccount: 'acc_bank', 
      creditAccount: 'acc_equity',
      description: 'Opening Balance'
    }));
  };

  // Set initial state
  useState(() => setIncomeMode());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold">{t.addEntry}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-700">
          <TabButton active={activeTab === 'income'} onClick={setIncomeMode} icon={<DollarSign size={16} />} label={t.income} />
          <TabButton active={activeTab === 'expense'} onClick={setExpenseMode} icon={<Wallet size={16} />} label={t.expense} />
          <TabButton active={activeTab === 'manual'} onClick={setManualMode} icon={<LayoutGrid size={16} />} label={t.manualEntry} />
          <TabButton active={activeTab === 'opening'} onClick={setOpeningMode} icon={<Database size={16} />} label={t.openingBalance} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.date}</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.amount}</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-3 pl-8 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.description}</label>
            <input 
              type="text" 
              placeholder="What happened?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                {t.debit} (Receives)
              </label>
              <select 
                value={formData.debitAccount}
                onChange={(e) => setFormData({...formData, debitAccount: e.target.value})}
                className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                disabled={activeTab === 'income' || activeTab === 'opening'}
              >
                <option value="">Select Account</option>
                {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                {t.credit} (Gives)
              </label>
              <select 
                value={formData.creditAccount}
                onChange={(e) => setFormData({...formData, creditAccount: e.target.value})}
                className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                disabled={activeTab === 'expense' || activeTab === 'opening'}
              >
                <option value="">Select Account</option>
                {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {t.cancel}
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/20 transition-all transform active:scale-95"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 py-3 border-b-2 transition-all ${
      active ? 'border-primary-600 text-primary-600 font-semibold bg-primary-50/50 dark:bg-primary-900/10' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className="text-[10px] uppercase tracking-tighter">{label}</span>
  </button>
);

export default EntryForm;
