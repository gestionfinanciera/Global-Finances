
import React, { useState, useMemo } from 'react';
import { AppState, Partner, PartnerMovement, PartnerType } from '../types';
import { 
  Users, 
  Truck, 
  Search, 
  Plus, 
  ChevronRight, 
  AlertCircle, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  FileText,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import PartnerForm from './PartnerForm';
import PartnerMovementForm from './PartnerMovementForm';

interface PartnersProps {
  state: AppState;
  onAddPartner: (p: Omit<Partner, 'id'>) => void;
  onDeletePartner: (id: string) => void;
  onAddMovement: (m: Omit<PartnerMovement, 'id'>) => void;
}

const Partners: React.FC<PartnersProps> = ({ state, onAddPartner, onDeletePartner, onAddMovement }) => {
  const [activeTab, setActiveTab] = useState<PartnerType>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false);

  const filteredPartners = useMemo(() => {
    return state.partners.filter(p => 
      p.type === activeTab && 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.taxId.includes(searchTerm))
    );
  }, [state.partners, activeTab, searchTerm]);

  const stats = useMemo(() => {
    const list = state.partners.filter(p => p.type === activeTab);
    const movs = state.partnerMovements.filter(m => {
      const p = state.partners.find(part => part.id === m.partnerId);
      return p?.type === activeTab;
    });

    let totalDebt = 0;
    let overdueDebt = 0;
    const now = new Date();

    movs.forEach(m => {
      // Lógica de deuda: 
      // Para cliente: Factura suma (+), Pago resta (-)
      // Para proveedor: Factura suma (+), Pago resta (-) -> pero se muestra como "debemos"
      const factor = (m.type === 'invoice' || m.type === 'debit_note') ? 1 : -1;
      const net = m.amount * factor;
      totalDebt += net;
      
      if (net > 0 && new Date(m.dueDate) < now) {
        overdueDebt += net;
      }
    });

    return {
      total: list.length,
      debt: totalDebt,
      overdue: overdueDebt
    };
  }, [state.partners, state.partnerMovements, activeTab]);

  const selectedPartner = useMemo(() => 
    state.partners.find(p => p.id === selectedPartnerId), 
    [state.partners, selectedPartnerId]
  );

  const selectedPartnerMovements = useMemo(() => 
    state.partnerMovements
      .filter(m => m.partnerId === selectedPartnerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.partnerMovements, selectedPartnerId]
  );

  const partnerBalance = useMemo(() => {
    return selectedPartnerMovements.reduce((sum, m) => {
       const factor = (m.type === 'invoice' || m.type === 'debit_note') ? 1 : -1;
       return sum + (m.amount * factor);
    }, 0);
  }, [selectedPartnerMovements]);

  if (selectedPartner) {
    return (
      <div className="p-4 md:p-6 space-y-8 animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setSelectedPartnerId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Volver a la lista</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl ${activeTab === 'client' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-orange-600 shadow-orange-500/20'}`}>
                {selectedPartner.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-white">{selectedPartner.name}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedPartner.taxId}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <InfoRow icon={<Mail size={14} />} label="Email" value={selectedPartner.email} />
              <InfoRow icon={<Phone size={14} />} label="Teléfono" value={selectedPartner.phone || 'No asig.'} />
              <InfoRow icon={<FileText size={14} />} label="Cond. Fiscal" value={selectedPartner.taxCondition} />
              <InfoRow icon={<Calendar size={14} />} label="Días Crédito" value={`${selectedPartner.creditDays} días`} />
              <InfoRow icon={<DollarSign size={14} />} label="Límite Crédito" value={`$${selectedPartner.creditLimit.toLocaleString()}`} />
            </div>

            <button 
              onClick={() => { if(window.confirm('¿Eliminar contacto?')) { onDeletePartner(selectedPartner.id); setSelectedPartnerId(null); } }}
              className="w-full mt-6 py-4 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
            >
              Eliminar Contacto
            </button>
          </div>

          {/* Ledger / Account Movements */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="glass p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saldo Actual</p>
                  <p className={`text-3xl font-black ${partnerBalance > 0 ? (activeTab === 'client' ? 'text-blue-400' : 'text-orange-400') : 'text-emerald-400'}`}>
                    ${Math.abs(partnerBalance).toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase mt-1">
                    {partnerBalance > 0 ? (activeTab === 'client' ? 'Nos debe' : 'Le debemos') : 'Al día / A favor'}
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsMovementFormOpen(true)}
                    className="flex-1 h-full glass rounded-3xl border border-primary-500/30 flex flex-col items-center justify-center gap-2 hover:bg-primary-600/10 transition-all group"
                  >
                    <Plus className="text-primary-500 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nuevo Movimiento</span>
                  </button>
               </div>
            </div>

            <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Historial de Cuenta Corriente</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-5">Fecha</th>
                      <th className="p-5">Tipo / Nro</th>
                      <th className="p-5 text-right">Debe</th>
                      <th className="p-5 text-right">Haber</th>
                      <th className="p-5 text-right">Vence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedPartnerMovements.map(m => {
                      const isAddition = m.type === 'invoice' || m.type === 'debit_note';
                      return (
                        <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-5 text-xs font-bold text-slate-400">{new Date(m.date).toLocaleDateString()}</td>
                          <td className="p-5">
                            <p className="text-xs font-black text-white uppercase">{m.type === 'invoice' ? 'Factura' : m.type === 'payment' ? 'Pago' : m.type}</p>
                            <p className="text-[9px] font-bold text-slate-500">#{m.documentNumber}</p>
                          </td>
                          <td className="p-5 text-right font-black text-blue-400 text-sm">
                            {isAddition ? `$${m.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-5 text-right font-black text-emerald-400 text-sm">
                            {!isAddition ? `$${m.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-5 text-right">
                             <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${new Date(m.dueDate) < new Date() && m.status !== 'paid' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                               {new Date(m.dueDate).toLocaleDateString()}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedPartnerMovements.length === 0 && (
                      <tr><td colSpan={5} className="p-20 text-center text-[10px] font-black uppercase text-slate-600 tracking-widest">Sin movimientos registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {isMovementFormOpen && (
          <PartnerMovementForm 
            partner={selectedPartner}
            onClose={() => setIsMovementFormOpen(false)}
            onSubmit={(m) => { onAddMovement(m); setIsMovementFormOpen(false); }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">Clientes y Prov.</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión de cuentas corrientes y saldos.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-xs uppercase transition-all shadow-xl shadow-primary-600/30 active:scale-95"
        >
          <Plus size={16} /> Agregar {activeTab === 'client' ? 'Cliente' : 'Proveedor'}
        </button>
      </div>

      {/* Selector de Pestaña */}
      <div className="flex bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-white/5 max-w-md">
        <button 
          onClick={() => setActiveTab('client')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase transition-all ${activeTab === 'client' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Users size={16} /> Clientes
        </button>
        <button 
          onClick={() => setActiveTab('supplier')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-xs uppercase transition-all ${activeTab === 'supplier' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Truck size={16} /> Proveedores
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title={`Total ${activeTab === 'client' ? 'Clientes' : 'Prov.'}`} value={stats.total} icon={<Users size={20} />} color="blue" isCurr={false} />
        <KpiCard title={activeTab === 'client' ? 'Por Cobrar' : 'Por Pagar'} value={stats.debt} icon={<DollarSign size={20} />} color={activeTab === 'client' ? 'emerald' : 'rose'} />
        <KpiCard title="Saldo Vencido" value={stats.overdue} icon={<AlertCircle size={20} />} color="rose" isAlert={stats.overdue > 0} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder={`Buscar por nombre, CUIT o email...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all shadow-xl"
        />
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(p => {
          // Calcular saldo rápido
          const balance = state.partnerMovements
            .filter(m => m.partnerId === p.id)
            .reduce((s, m) => s + (m.amount * (m.type === 'invoice' || m.type === 'debit_note' ? 1 : -1)), 0);
          const hasOverdue = state.partnerMovements.some(m => m.partnerId === p.id && m.status !== 'paid' && new Date(m.dueDate) < new Date());

          return (
            <div 
              key={p.id}
              onClick={() => setSelectedPartnerId(p.id)}
              className={`glass p-6 rounded-[2rem] border transition-all cursor-pointer group hover:scale-[1.02] shadow-xl ${hasOverdue ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5 hover:border-primary-500/30'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl ${activeTab === 'client' ? 'bg-blue-600/20 text-blue-400' : 'bg-orange-600/20 text-orange-400'}`}>
                  {p.name.charAt(0)}
                </div>
                {hasOverdue && <div className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg animate-pulse"><AlertCircle size={14} /></div>}
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mb-1 group-hover:text-primary-400 transition-colors">{p.name}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{p.taxId}</p>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase">Saldo Actual</p>
                  <p className={`text-xl font-black ${balance > 0 ? (activeTab === 'client' ? 'text-blue-400' : 'text-orange-400') : 'text-emerald-400'}`}>
                    ${Math.abs(balance).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          );
        })}
        {filteredPartners.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <Users size={48} className="mx-auto text-slate-800 mb-4" />
             <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-xs">No se encontraron {activeTab === 'client' ? 'clientes' : 'proveedores'}</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <PartnerForm 
          type={activeTab}
          onClose={() => setIsFormOpen(false)}
          onSubmit={(p) => { onAddPartner(p); setIsFormOpen(false); }}
        />
      )}
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; isCurr?: boolean; isAlert?: boolean }> = ({ title, value, icon, color, isCurr = true, isAlert }) => (
  <div className={`glass p-6 rounded-[2rem] border ${isAlert ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'} transition-all hover:scale-[1.02] shadow-xl`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500 border border-${color}-500/20`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{title}</p>
        <p className={`text-xl font-black ${isAlert ? 'text-rose-500 neon-glow' : 'text-white'}`}>
          {isCurr ? `$${value.toLocaleString()}` : value}
        </p>
      </div>
    </div>
  </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-primary-500">{icon}</div>
    <div className="flex-1">
      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-300 truncate max-w-[180px]">{value}</p>
    </div>
  </div>
);

export default Partners;
