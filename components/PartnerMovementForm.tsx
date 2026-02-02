
import React, { useState } from 'react';
import { X, Save, FileText, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Partner, PartnerMovement } from '../types';

interface PartnerMovementFormProps {
  partner: Partner;
  onClose: () => void;
  onSubmit: (m: Omit<PartnerMovement, 'id'>) => void;
}

const PartnerMovementForm: React.FC<PartnerMovementFormProps> = ({ partner, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'invoice' as any,
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    amount: '',
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentNumber || !formData.amount) return;

    onSubmit({
      partnerId: partner.id,
      type: formData.type,
      documentNumber: formData.documentNumber,
      date: formData.date,
      dueDate: formData.dueDate,
      amount: parseFloat(formData.amount),
      observations: formData.observations,
      status: formData.type === 'payment' ? 'paid' : 'pending'
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary-500/5">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary-600/20 text-primary-500">
                <FileText size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black uppercase tracking-tight italic neon-glow">Nuevo Movimiento</h2>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{partner.name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
             <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'invoice'})}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'invoice' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}
             >
                Factura
             </button>
             <button 
                type="button"
                onClick={() => setFormData({...formData, type: 'payment'})}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'payment' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
             >
                Pago
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Número Doc.</label>
                <input 
                  required
                  type="text"
                  placeholder="001-XXXX"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Monto ($)</label>
                <input 
                  required
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-black text-white outline-none focus:border-primary-500"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Fecha Emisión</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                />
             </div>
             {formData.type === 'invoice' && (
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Fecha Venc.</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                  />
               </div>
             )}
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all flex items-center justify-center gap-2 tracking-widest"
            >
              <Save size={16} /> Registrar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerMovementForm;
