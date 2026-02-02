
import React, { useState } from 'react';
import { X, Save, Users, Truck, Info, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { PartnerType, Partner } from '../types';

interface PartnerFormProps {
  type: PartnerType;
  onClose: () => void;
  onSubmit: (p: Omit<Partner, 'id'>) => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ type, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    fantasyName: '',
    taxId: '',
    taxCondition: 'Responsable Inscripto',
    email: '',
    phone: '',
    address: '',
    creditLimit: '0',
    creditDays: '30',
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.taxId) return;

    onSubmit({
      type,
      name: formData.name,
      fantasyName: formData.fantasyName,
      taxId: formData.taxId,
      taxCondition: formData.taxCondition,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      creditLimit: parseFloat(formData.creditLimit) || 0,
      creditDays: parseInt(formData.creditDays) || 0,
      observations: formData.observations,
      active: true
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className={`p-6 border-b border-white/5 flex items-center justify-between ${type === 'client' ? 'bg-blue-500/5' : 'bg-orange-500/5'}`}>
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${type === 'client' ? 'bg-blue-600/20 text-blue-500' : 'bg-orange-600/20 text-orange-500'}`}>
                {type === 'client' ? <Users size={20} /> : <Truck size={20} />}
             </div>
             <h2 className="text-xl font-black uppercase tracking-tight italic neon-glow">
               Nuevo {type === 'client' ? 'Cliente' : 'Proveedor'}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-auto scrollbar-thin">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Datos Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Razón Social *</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">CUIT / CUIL *</label>
                    <input 
                      required
                      type="text"
                      placeholder="30-XXXXXXXX-X"
                      value={formData.taxId}
                      onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                    />
                 </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Condición Fiscal</label>
                <select 
                  value={formData.taxCondition}
                  onChange={(e) => setFormData({...formData, taxCondition: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-slate-300 outline-none focus:border-primary-500"
                >
                  <option>Responsable Inscripto</option>
                  <option>Monotributista</option>
                  <option>Consumidor Final</option>
                  <option>Exento</option>
                </select>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Teléfono</label>
                    <input 
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Condiciones Comerciales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Límite de Crédito ($)</label>
                    <input 
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Días de Crédito</label>
                    <input 
                      type="number"
                      value={formData.creditDays}
                      onChange={(e) => setFormData({...formData, creditDays: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-primary-500"
                    />
                 </div>
              </div>
           </div>
        </form>

        <div className="p-6 border-t border-white/5 flex gap-4 bg-black/20">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-500 font-bold text-[10px] uppercase hover:bg-white/5 transition-all tracking-widest">Cancelar</button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="flex-[2] py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase shadow-xl shadow-primary-600/30 hover:bg-primary-500 transition-all flex items-center justify-center gap-2 tracking-widest"
          >
            <Save size={16} /> Guardar Contacto
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerForm;
