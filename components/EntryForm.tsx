
import React, { useState } from 'react';
import { X, DollarSign, Wallet, FileText, LayoutGrid, Database, Sparkles, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Language, JournalEntry, JournalEntryPart } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { geminiService } from '../services/geminiService';

interface EntryFormProps {
  onClose: () => void;
  onSubmit: (entry: Omit<JournalEntry, 'id'>) => void;
  language: Language;
}

type Tab = 'income' | 'expense' | 'manual' | 'opening';

interface MultiRow {
  id: string;
  accountId: string;
  amount: string;
  side: 'debit' | 'credit';
}

const EntryForm: React.FC<EntryFormProps> = ({ onClose, onSubmit, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<Tab>('income');
  const [isPredicting, setIsPredicting] = useState(false);
  
  // Standard fields for simple modes
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    debitAccount: '',
    creditAccount: ''
  });

  // Multi-line fields for Opening Inventory / Complex mode
  const [openingRows, setOpeningRows] = useState<MultiRow[]>([
    { id: crypto.randomUUID(), accountId: 'acc_cash', amount: '', side: 'debit' },
    { id: crypto.randomUUID(), accountId: 'acc_cap_paid', amount: '', side: 'credit' },
  ]);

  const handlePredict = async () => {
    if (!formData.description.trim()) {
      alert(language === 'es' ? "Escribe una descripción primero" : "Write a description first");
      return;
    }
    
    setIsPredicting(true);
    try {
      const prediction = await geminiService.predictAccounts(formData.description);
      if (prediction) {
        setFormData(prev => ({
          ...prev,
          debitAccount: prediction.debitAccount,
          creditAccount: prediction.creditAccount
        }));
        // If in simple tab but AI predicts complex accounts, maybe switch to manual?
        // For now, just update the selects in the current simple view.
        if (activeTab === 'opening') {
            // For opening, AI prediction isn't as direct since it's multi-row, 
            // but we can suggest the first pair.
            updateOpeningRow(openingRows.find(r => r.side === 'debit')?.id || '', 'accountId', prediction.debitAccount);
            updateOpeningRow(openingRows.find(r => r.side === 'credit')?.id || '', 'accountId', prediction.creditAccount);
        }
      }
    } catch (error) {
      console.error("Auto-fill error:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  const addOpeningRow = (side: 'debit' | 'credit') => {
    setOpeningRows([...openingRows, { 
      id: crypto.randomUUID(), 
      accountId: '', 
      amount: '', 
      side 
    }]);
  };

  const removeOpeningRow = (id: string) => {
    if (openingRows.length <= 2) return;
    setOpeningRows(openingRows.filter(r => r.id !== id));
  };

  const updateOpeningRow = (id: string, field: keyof MultiRow, value: string) => {
    setOpeningRows(openingRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const totalDebits = openingRows.filter(r => r.side === 'debit').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const totalCredits = openingRows.filter(r => r.side === 'credit').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'opening') {
      if (!isBalanced) {
        alert(language === 'es' ? "El asiento de apertura debe estar balanceado (Debe = Haber)" : "Opening entry must be balanced (Debit = Credit)");
        return;
      }
      
      const debitParts = openingRows.filter(r => r.side === 'debit').map(r => ({ accountId: r.accountId, amount: parseFloat(r.amount) }));
      const creditParts = openingRows.filter(r => r.side === 'credit').map(r => ({ accountId: r.accountId, amount: parseFloat(r.amount) }));

      onSubmit({
        date: formData.date,
        description: formData.description || (language === 'es' ? "Asiento de Apertura" : "Opening Entry"),
        amount: totalDebits,
        debitParts,
        creditParts
      });
      return;
    }

    if (!formData.description || !formData.amount || !formData.debitAccount || !formData.creditAccount) {
      alert(language === 'es' ? "Por favor completa todos los campos" : "Please fill all fields");
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

  // Helper to pre-set accounts based on tab
  const setMode = (tab: Tab) => {
      setActiveTab(tab);
      if (tab === 'income') {
          setFormData(prev => ({ ...prev, debitAccount: 'acc_bank', creditAccount: 'acc_sales_merch' }));
      } else if (tab === 'expense') {
          setFormData(prev => ({ ...prev, debitAccount: 'acc_office_supplies', creditAccount: 'acc_bank' }));
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl my-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold">{t.addEntry}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
          <TabButton active={activeTab === 'income'} onClick={() => setMode('income')} icon={<DollarSign size={16} />} label={t.income} />
          <TabButton active={activeTab === 'expense'} onClick={() => setMode('expense')} icon={<Wallet size={16} />} label={t.expense} />
          <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} icon={<LayoutGrid size={16} />} label={t.manualEntry} />
          <TabButton active={activeTab === 'opening'} onClick={() => setActiveTab('opening')} icon={<Database size={16} />} label={t.openingBalance} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.date}</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
              />
            </div>
            {activeTab !== 'opening' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.amount}</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-3 pl-8 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.description}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={language === 'es' ? "¿Qué sucedió?" : "What happened?"}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="flex-1 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm"
              />
              <button
                type="button"
                onClick={handlePredict}
                disabled={isPredicting || !formData.description}
                className="px-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                title={language === 'es' ? "Rellenar cuentas con IA" : "Auto-fill accounts with AI"}
              >
                {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>

          {activeTab === 'opening' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{t.debit} (Activos)</span>
                    <button type="button" onClick={() => addOpeningRow('debit')} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"><Plus size={16} /></button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {openingRows.filter(r => r.side === 'debit').map(row => (
                      <div key={row.id} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                        <select 
                          value={row.accountId}
                          onChange={(e) => updateOpeningRow(row.id, 'accountId', e.target.value)}
                          className="flex-1 p-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">{language === 'es' ? "Cuenta" : "Account"}</option>
                          {CHART_OF_ACCOUNTS.filter(a => a.type === 'Asset' || a.type === 'Expense').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) => updateOpeningRow(row.id, 'amount', e.target.value)}
                          className="w-20 p-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button type="button" onClick={() => removeOpeningRow(row.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest">{t.credit} (Pasivo/Capital)</span>
                    <button type="button" onClick={() => addOpeningRow('credit')} className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"><Plus size={16} /></button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {openingRows.filter(r => r.side === 'credit').map(row => (
                      <div key={row.id} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                        <select 
                          value={row.accountId}
                          onChange={(e) => updateOpeningRow(row.id, 'accountId', e.target.value)}
                          className="flex-1 p-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs outline-none focus:ring-1 focus:ring-rose-500"
                        >
                          <option value="">{language === 'es' ? "Cuenta" : "Account"}</option>
                          {CHART_OF_ACCOUNTS.filter(a => a.type !== 'Asset' && a.type !== 'Expense').map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) => updateOpeningRow(row.id, 'amount', e.target.value)}
                          className="w-20 p-2 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs font-bold outline-none focus:ring-1 focus:ring-rose-500"
                        />
                        <button type="button" onClick={() => removeOpeningRow(row.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl flex items-center justify-between border ${isBalanced ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'} transition-colors`}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className={isBalanced ? 'text-emerald-500' : 'text-rose-500'} />
                  <span className={`text-xs font-bold ${isBalanced ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {isBalanced ? (language === 'es' ? "Balanceado" : "Balanced") : (language === 'es' ? "Desbalanceado" : "Unbalanced")}
                  </span>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">Total Debe: ${totalDebits.toFixed(2)}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-rose-600 dark:text-rose-400">Total Haber: ${totalCredits.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.debit} (Recibe)</label>
                <select 
                  value={formData.debitAccount}
                  onChange={(e) => setFormData({...formData, debitAccount: e.target.value})}
                  className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                >
                  <option value="">{language === 'es' ? "Seleccionar Cuenta" : "Select Account"}</option>
                  {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{t.credit} (Entrega)</label>
                <select 
                  value={formData.creditAccount}
                  onChange={(e) => setFormData({...formData, creditAccount: e.target.value})}
                  className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all"
                >
                  <option value="">{language === 'es' ? "Seleccionar Cuenta" : "Select Account"}</option>
                  {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm">{t.cancel}</button>
            <button 
              type="submit"
              disabled={activeTab === 'opening' && !isBalanced}
              className="flex-[2] py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/20 transition-all transform active:scale-95 text-sm disabled:opacity-50 disabled:active:scale-100"
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
    type="button"
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 min-w-[80px] border-b-2 transition-all ${
      active ? 'border-primary-600 text-primary-600 font-semibold bg-primary-50/50 dark:bg-primary-900/10' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className="text-[9px] font-bold uppercase tracking-tighter text-center">{label}</span>
  </button>
);

export default EntryForm;
