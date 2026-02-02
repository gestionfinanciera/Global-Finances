
import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Tag, Save } from 'lucide-react';
import { Language, CashFlowItem } from '../types';
import { translations } from '../translations';

interface CashFlowFormProps {
  type: 'income' | 'expense';
  onClose: () => void;
  onSubmit: (item: Omit<CashFlowItem, 'id'>) => void;
  language: Language;
}

const CashFlowForm: React.FC<CashFlowFormProps> = ({ type, onClose, onSubmit, language }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: type === 'income' ? 'Ventas' : 'Servicios',
    isRecurring: false
  });

  const categories = type === 'income' 
    ? ['Ventas', 'Cobro Factura', 'Servicios', 'Inversiones', 'Otros']
    : ['Alquiler', 'Impuestos', 'Sueldos', 'Proveedores', 'Servicios', 'Otros'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.date) return;

    onSubmit({
      type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      isRecurring: formData.isRecurring,
      status: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className={`p-6 border-b border-white/5 flex items-center justify-between ${type === 'income' ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                {type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight italic neon-glow">
               {type === 'income' ? t.newIncome : t.newExpense}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} className="text-primary-500" />
              Fecha Estimada
            </label>
            <input 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={12} className="text-primary-500" />
              Monto del Movimiento
            </label>
            <input 
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Tag size={12} className="text-primary-500" />
              Descripción
            </label>
            <input 
              type="text"
              placeholder="Ej: Pago de alquiler marzo"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.category === cat ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
              className="w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-primary-600 transition-all"
            />
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Es un movimiento recurrente (Mensual)</span>
          </label>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-400 font-bold text-xs uppercase hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 rounded-2xl bg-primary-600 text-white font-black text-xs uppercase shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> {t.save} Proyección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashFlowForm;
