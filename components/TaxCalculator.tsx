
import React, { useState, useMemo } from 'react';
import { AppState, AccountType, TaxObligation } from '../types';
// Added TrendingDown to the imports from lucide-react
import { Calculator, Zap, Save, RefreshCw, AlertTriangle, FileCheck, TrendingDown } from 'lucide-react';
import { CHART_OF_ACCOUNTS } from '../accounts';

interface TaxCalculatorProps {
  state: AppState;
  onSave: (ob: Omit<TaxObligation, 'id'>) => void;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ state, onSave }) => {
  const [selectedTax, setSelectedTax] = useState('tax_iva');
  const [method, setMethod] = useState<'auto' | 'manual'>('auto');

  // Lógica de cálculo de IVA Automático
  const ivaCalculated = useMemo(() => {
    let sales = 0;
    let purchases = 0;
    
    state.entries.forEach(entry => {
      // Simplificado: Buscamos cuentas de Ventas e Insumos/Caja
      // En una implementación real, buscaríamos la cuenta específica "IVA Debito" e "IVA Credito"
      // Aquí simulamos basándonos en tipos de cuenta
      entry.creditParts?.forEach(p => {
        const acc = CHART_OF_ACCOUNTS.find(a => a.id === p.accountId);
        if (acc?.type === AccountType.INCOME) sales += p.amount;
      });
      entry.debitParts?.forEach(p => {
        const acc = CHART_OF_ACCOUNTS.find(a => a.id === p.accountId);
        if (acc?.type === AccountType.EXPENSE) purchases += p.amount;
      });
    });

    const debito = sales * 0.21;
    const credito = purchases * 0.21;
    return { sales, purchases, debito, credito, total: Math.max(0, debito - credito) };
  }, [state.entries]);

  const handleSave = () => {
    const now = new Date();
    onSave({
      taxId: selectedTax,
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      amount: selectedTax === 'tax_iva' ? ivaCalculated.total : 0,
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().split('T')[0],
      status: 'pending'
    });
    alert('Cálculo guardado y obligación generada en el calendario.');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="space-y-1">
               <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-3">
                  <Calculator className="text-primary-500" /> Calculadoras Fiscales
               </h2>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calcula tus impuestos del periodo actual.</p>
            </div>
            <select 
              value={selectedTax}
              onChange={(e) => setSelectedTax(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-2xl px-6 py-3 text-xs font-black text-white uppercase outline-none focus:border-primary-500 transition-all min-w-[240px]"
            >
              {state.taxConfigs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>

         {selectedTax === 'tax_iva' ? (
           <div className="space-y-8">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 max-w-xs">
                 <button onClick={() => setMethod('auto')} className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${method === 'auto' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}>Automático</button>
                 <button onClick={() => setMethod('manual')} className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${method === 'manual' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}>Manual</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4">
                       <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                          <Zap size={14} /> Débito Fiscal (Ventas)
                       </h4>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">Ventas Gravadas:</span>
                          <span className="text-sm font-black text-white">${ivaCalculated.sales.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <span className="text-xs font-bold text-emerald-400">IVA 21%:</span>
                          <span className="text-lg font-black text-emerald-400">+${ivaCalculated.debito.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl space-y-4">
                       <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                          <TrendingDown size={14} /> Crédito Fiscal (Compras)
                       </h4>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">Compras Gravadas:</span>
                          <span className="text-sm font-black text-white">${ivaCalculated.purchases.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <span className="text-xs font-bold text-rose-400">IVA 21%:</span>
                          <span className="text-lg font-black text-rose-400">-${ivaCalculated.credito.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center text-center space-y-6">
                    <div>
                       <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Resultado Liquidación IVA</p>
                       <p className="text-5xl font-black text-white italic tracking-tighter neon-glow">${ivaCalculated.total.toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-slate-600 uppercase mt-4">Periodo actual (Vencimiento estimado: 15 del próx. mes)</p>
                    </div>

                    <div className="pt-6 flex gap-3">
                       <button className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-slate-400 font-black text-[10px] uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"><RefreshCw size={16} /> Recalcular</button>
                       <button onClick={handleSave} className="flex-[2] py-4 px-6 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all flex items-center justify-center gap-2">
                          <Save size={16} /> Guardar y Proyectar
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         ) : (
           <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-white/5 text-slate-600"><AlertTriangle size={48} /></div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Calculadora de {selectedTax} en desarrollo...</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default TaxCalculator;
