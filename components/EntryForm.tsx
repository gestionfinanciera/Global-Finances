
import React, { useState } from 'react';
import { X, DollarSign, Wallet, FileText, LayoutGrid, Database, Sparkles, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Language, JournalEntry, JournalEntryPart } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { geminiService, PredictedEntry } from '../services/geminiService';

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
      const result: PredictedEntry | null = await geminiService.predictAccounts(formData.description);
      
      if (result) {
        // Update description with refined one
        setFormData(prev => ({ ...prev, description: result.description }));

        // Check if we have multiple accounts (multi-line)
        if (result.debitParts.length > 1 || result.creditParts.length > 1 || result.isOpening) {
          // Switch to opening mode to show multiple rows
          setActiveTab('opening');
          const newRows: MultiRow[] = [];
          
          result.debitParts.forEach(p => {
            newRows.push({ id: crypto.randomUUID(), accountId: p.accountId, amount: p.amount.toString(), side: 'debit' });
          });
          result.creditParts.forEach(p => {
            newRows.push({ id: crypto.randomUUID(), accountId: p.accountId, amount: p.amount.toString(), side: 'credit' });
          });
          
          setOpeningRows(newRows);
        } else if (result.debitParts.length === 1 && result.creditParts.length === 1) {
          // Simple case: Fill simple form
          setFormData(prev => ({
            ...prev,
            amount: result.debitParts[0].amount.toString(),
            debitAccount: result.debitParts[0].accountId,
            creditAccount: result.creditParts[0].accountId
          }));
        }
      }
    } catch (error) {
      console.error("Auto-fill error:", error);
      alert(language === 'es' ? "Hubo un error analizando la descripción." : "Error analyzing description.");
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
        alert(language === 'es' ? "El asiento debe estar balanceado (Debe = Haber)" : "Entry must be balanced (Debit = Credit)");
        return;
      }
      
      const debitParts = openingRows.filter(r => r.side === 'debit').map(r => ({ accountId: r.accountId, amount: parseFloat(r.amount) }));
      const creditParts = openingRows.filter(r => r.side === 'credit').map(r => ({ accountId: r.accountId, amount: parseFloat(r.amount) }));

      onSubmit({
        date: formData.date,
        description: formData.description || (language === 'es' ? "Registro Multi-cuenta" : "Multi-account Entry"),
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
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl my-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-500/10 rounded-lg"><Sparkles size={18} className="text-primary-500" /></div>
             <h2 className="text-xl font-bold tracking-tight">{t.addEntry}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto scrollbar-hide">
          <TabButton active={activeTab === 'income'} onClick={() => setMode('income')} icon={<DollarSign size={16} />} label={t.income} />
          <TabButton active={activeTab === 'expense'} onClick={() => setMode('expense')} icon={<Wallet size={16} />} label={t.expense} />
          <TabButton active={activeTab === 'manual'} onClick={() => setActiveTab('manual')} icon={<LayoutGrid size={16} />} label={t.manualEntry} />
          <TabButton active={activeTab === 'opening'} onClick={() => setActiveTab('opening')} icon={<Database size={16} />} label={t.openingBalance} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.date}</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-medium"
              />
            </div>
            {activeTab !== 'opening' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.amount}</label>
                <div className="relative group">
                  <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full p-4 pl-10 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-black"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.description}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={language === 'es' ? "Describe el movimiento (ej: Venta de 2 PCs por 500k c/u)" : "Describe the move (e.g. Sale of 2 PCs for 500k each)"}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="flex-1 p-4 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={handlePredict}
                disabled={isPredicting || !formData.description}
                className="px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-primary-600/20 active:scale-95 group overflow-hidden relative"
                title={language === 'es' ? "Analizar y rellenar con IA" : "Analyze and fill with AI"}
              >
                {isPredicting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                <span className="sr-only">IA</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 italic px-1">
              {language === 'es' ? "Tip: Describe cantidades y precios, la IA balanceará el asiento." : "Tip: Describe quantities and prices, AI will balance the entry."}
            </p>
          </div>

          {activeTab === 'opening' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.1em]">{t.debit} (Izquierda)</span>
                    <button type="button" onClick={() => addOpeningRow('debit')} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all active:scale-90"><Plus size={18} /></button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {openingRows.filter(r => r.side === 'debit').map(row => (
                      <div key={row.id} className="flex gap-2 group animate-in slide-in-from-left-2 duration-200">
                        <select 
                          value={row.accountId}
                          onChange={(e) => updateOpeningRow(row.id, 'accountId', e.target.value)}
                          className="flex-1 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        >
                          <option value="">{language === 'es' ? "Cuenta" : "Account"}</option>
                          {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) => updateOpeningRow(row.id, 'amount', e.target.value)}
                          className="w-24 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        <button type="button" onClick={() => removeOpeningRow(row.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b dark:border-slate-700 pb-2">
                    <span className="text-xs font-black text-rose-500 uppercase tracking-[0.1em]">{t.credit} (Derecha)</span>
                    <button type="button" onClick={() => addOpeningRow('credit')} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"><Plus size={18} /></button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {openingRows.filter(r => r.side === 'credit').map(row => (
                      <div key={row.id} className="flex gap-2 group animate-in slide-in-from-right-2 duration-200">
                        <select 
                          value={row.accountId}
                          onChange={(e) => updateOpeningRow(row.id, 'accountId', e.target.value)}
                          className="flex-1 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                        >
                          <option value="">{language === 'es' ? "Cuenta" : "Account"}</option>
                          {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input 
                          type="number"
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) => updateOpeningRow(row.id, 'amount', e.target.value)}
                          className="w-24 p-3 rounded-xl border dark:bg-slate-700 dark:border-slate-600 text-xs font-black outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                        />
                        <button type="button" onClick={() => removeOpeningRow(row.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-3xl flex items-center justify-between border-2 ${isBalanced ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'} transition-all shadow-inner`}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className={isBalanced ? 'text-emerald-500' : 'text-rose-500'} />
                  <div>
                    <span className={`text-xs font-black uppercase tracking-widest ${isBalanced ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {isBalanced ? (language === 'es' ? "ASIENTO BALANCEADO" : "BALANCED ENTRY") : (language === 'es' ? "ASIENTO DESBALANCEADO" : "UNBALANCED ENTRY")}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">{language === 'es' ? "Asegúrate de que la suma de ambos lados sea idéntica." : "Ensure both sides sum up to the exact same amount."}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-4 text-xs font-black">
                    <span className="text-emerald-600 dark:text-emerald-400">Σ Debe: ${totalDebits.toFixed(2)}</span>
                    <span className="text-rose-600 dark:text-rose-400">Σ Haber: ${totalCredits.toFixed(2)}</span>
                  </div>
                  {!isBalanced && (
                    <span className="text-[10px] text-rose-500 font-bold">Diferencia: ${(totalDebits - totalCredits).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  {t.debit} (Cuenta que recibe)
                </label>
                <select 
                  value={formData.debitAccount}
                  onChange={(e) => setFormData({...formData, debitAccount: e.target.value})}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold transition-all shadow-sm"
                >
                  <option value="">{language === 'es' ? "Seleccionar Cuenta" : "Select Account"}</option>
                  {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-rose-500" />
                   {t.credit} (Cuenta que entrega)
                </label>
                <select 
                  value={formData.creditAccount}
                  onChange={(e) => setFormData({...formData, creditAccount: e.target.value})}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-bold transition-all shadow-sm"
                >
                  <option value="">{language === 'es' ? "Seleccionar Cuenta" : "Select Account"}</option>
                  {CHART_OF_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-6 rounded-2xl border dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm active:scale-95">{t.cancel}</button>
            <button 
              type="submit"
              disabled={activeTab === 'opening' && !isBalanced}
              className="flex-[2] py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-black shadow-xl shadow-primary-600/30 transition-all transform active:scale-95 text-sm disabled:opacity-50 disabled:active:scale-100"
            >
              {t.save} (Guardar Asiento)
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
    className={`flex-1 flex flex-col items-center gap-2 py-4 px-4 min-w-[100px] border-b-4 transition-all ${
      active ? 'border-primary-600 text-primary-600 font-black bg-primary-50/50 dark:bg-primary-900/10' : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
    }`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
      {icon}
    </div>
    <span className="text-[10px] uppercase tracking-wider text-center">{label}</span>
  </button>
);

export default EntryForm;
