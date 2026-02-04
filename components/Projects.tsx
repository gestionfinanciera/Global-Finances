
import React, { useState, useMemo } from 'react';
import { AppState, Project } from '../types';
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface ProjectsProps {
  state: AppState;
  onAddProject: (p: Omit<Project, 'id'>) => void;
  onDeleteProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ state, onAddProject, onDeleteProject }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    start_date: '',
    end_date: '',
    status: 'Planificación'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client_id) return;
    onAddProject(formData);
    setFormData({ name: '', description: '', client_id: '', start_date: '', end_date: '', status: 'Planificación' });
    setIsFormOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">Proyectos Activos</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión de hitos y entregables cloud.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent-pink hover:bg-pink-600 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-accent-pink/20 active:scale-95"
        >
          <Plus size={16} /> Nuevo Proyecto
        </button>
      </div>

      {isFormOpen && (
        <div className="glass p-8 rounded-[2rem] border border-accent-pink/20 animate-in zoom-in-95">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Proyecto</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-accent-pink" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</label>
                <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-accent-pink">
                  <option value="">Seleccionar Cliente Cloud...</option>
                  {state.partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-accent-pink">
                  <option>Planificación</option>
                  <option>En Curso</option>
                  <option>Revisión</option>
                  <option>Completado</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha Inicio</label>
                <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-accent-pink" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha Entrega</label>
                <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-accent-pink" />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notas Adicionales</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-accent-pink" />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 py-4 bg-accent-pink text-white font-black uppercase text-xs rounded-xl shadow-lg">Crear Proyecto</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-4 border border-white/10 text-slate-500 font-black uppercase text-xs rounded-xl">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {state.projects.map(p => {
          const client = state.partners.find(part => part.id === p.client_id);
          return (
            <div key={p.id} className="glass p-8 rounded-[3rem] border border-white/5 hover:border-accent-pink/30 transition-all group shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => onDeleteProject(p.id)} className="text-slate-800 hover:text-rose-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-accent-pink/10 text-accent-pink rounded-3xl">
                  <Briefcase size={28} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{p.name}</h3>
                   <span className="text-[10px] font-black text-accent-pink uppercase tracking-widest">{client?.name || 'Cliente Desconocido'}</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">{p.description || "Sin descripción de proyecto."}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                   <Calendar size={18} className="text-slate-600" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Cronograma</span>
                      <span className="text-xs font-bold text-slate-300">{p.start_date || '?'} → {p.end_date || '?'}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 justify-end">
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Estado Cloud</span>
                      <span className={`text-xs font-black uppercase ${p.status === 'Completado' ? 'text-emerald-500' : 'text-accent-pink animate-pulse'}`}>{p.status}</span>
                   </div>
                   {p.status === 'Completado' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Clock className="text-accent-pink" size={20} />}
                </div>
              </div>
            </div>
          );
        })}
        {state.projects.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
             <AlertCircle size={48} className="mx-auto text-slate-800 mb-4" />
             <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs">No hay proyectos registrados en Supabase</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
