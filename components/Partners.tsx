
import React, { useState, useMemo } from 'react';
import { AppState, Partner } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2,
  Info,
  Calendar
} from 'lucide-react';

interface PartnersProps {
  state: AppState;
  onAddPartner: (p: Omit<Partner, 'id'>) => void;
  onDeletePartner: (id: string) => void;
  onAddMovement: (m: any) => void;
}

const Partners: React.FC<PartnersProps> = ({ state, onAddPartner, onDeletePartner }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', description: '' });

  const filteredPartners = useMemo(() => {
    return state.partners.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.partners, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) return;
    onAddPartner(newPartner);
    setNewPartner({ name: '', description: '' });
    setIsFormOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">Clientes Cloud</h1>
          <p className="text-slate-500 text-sm font-medium">Sincronizado con Supabase.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-primary-600/30 active:scale-95"
        >
          <Plus size={16} /> Agregar Cliente
        </button>
      </div>

      {isFormOpen && (
        <div className="glass p-8 rounded-[2rem] border border-primary-500/20 animate-in zoom-in-95">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre Completo</label>
                <input 
                  required
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-primary-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción / Notas</label>
                <input 
                  type="text"
                  value={newPartner.description}
                  onChange={(e) => setNewPartner({...newPartner, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 py-4 bg-primary-600 text-white font-black uppercase text-xs rounded-xl shadow-lg">Guardar en Cloud</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-4 border border-white/10 text-slate-500 font-black uppercase text-xs rounded-xl">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all shadow-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(p => (
          <div key={p.id} className="glass p-6 rounded-[2rem] border border-white/5 hover:border-primary-500/30 transition-all group shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center font-black text-xl">
                {p.name.charAt(0)}
              </div>
              <button onClick={() => onDeletePartner(p.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-black text-white italic tracking-tight mb-2 uppercase">{p.name}</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6 h-12 overflow-hidden">{p.description || "Sin descripción disponible."}</p>
            
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase">
                <Calendar size={12} /> {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                <Info size={12} /> Sincronizado
              </div>
            </div>
          </div>
        ))}
        {filteredPartners.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <Users size={48} className="mx-auto text-slate-800 mb-4" />
             <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs">No hay clientes sincronizados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
