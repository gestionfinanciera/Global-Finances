
import React, { useMemo, useState } from 'react';
import { AppState, TaxConfig, TaxObligation, AccountType, JournalEntry } from '../types';
import { 
  Receipt, 
  Calendar, 
  Calculator, 
  History, 
  AlertCircle, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  FileText,
  Plus,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import TaxCalculator from './TaxCalculator';

interface TaxesProps {
  state: AppState;
  onAddObligation: (ob: Omit<TaxObligation, 'id'>) => void;
  onUpdateObligation: (id: string, updates: Partial<TaxObligation>) => void;
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

const Taxes: React.FC<TaxesProps> = ({ state, onAddObligation, onUpdateObligation, onAddEntry }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'calendar' | 'my_taxes' | 'calculators' | 'history'>('summary');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [cuitEnding, setCuitEnding] = useState('0-1-2-3');

  const now = new Date();
  const viewingMonth = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
  const currentMonthStr = `${viewingMonth.getFullYear()}-${String(viewingMonth.getMonth() + 1).padStart(2, '0')}`;

  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];

    const monthObligations = state.taxObligations.filter(o => o.period === currentMonthStr);
    const pending = monthObligations.filter(o => o.status === 'pending');
    const paid = monthObligations.filter(o => o.status === 'paid');
    
    const expiresToday = state.taxObligations.filter(o => o.dueDate === today && o.status !== 'paid');
    const expiresSoon = state.taxObligations.filter(o => o.dueDate > today && o.dueDate <= next7DaysStr && o.status !== 'paid');

    const totalYear = state.taxObligations
      .filter(o => o.dueDate.startsWith(String(now.getFullYear())))
      .reduce((s, o) => s + o.amount, 0);

    return {
      today: expiresToday.reduce((s, o) => s + o.amount, 0),
      todayCount: expiresToday.length,
      next7: expiresSoon.reduce((s, o) => s + o.amount, 0),
      next7Count: expiresSoon.length,
      month: monthObligations.reduce((s, o) => s + o.amount, 0),
      paid: paid.reduce((s, o) => s + o.amount, 0),
      totalYear
    };
  }, [state.taxObligations, currentMonthStr]);

  const pieData = useMemo(() => {
    const dist: Record<string, number> = {};
    state.taxObligations.filter(o => o.status === 'paid').forEach(o => {
      const config = state.taxConfigs.find(c => c.id === o.taxId);
      const name = config?.name || 'Otro';
      dist[name] = (dist[name] || 0) + o.amount;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [state.taxObligations, state.taxConfigs]);

  const COLORS = ['#ff0055', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const renderContent = () => {
    switch(activeTab) {
      case 'summary': return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <Kpi title="Vence Hoy" value={kpis.today} info={`${kpis.todayCount} impuestos`} color="rose" isAlert={kpis.today > 0} />
             <Kpi title="Próx. 7 Días" value={kpis.next7} info={`${kpis.next7Count} impuestos`} color="amber" />
             <Kpi title="Pagado Mes" value={kpis.paid} info="Estado del mes" color="emerald" />
             <Kpi title="Total Año" value={kpis.totalYear} info="Proyección 2026" color="slate" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                Carga Tributaria 2026
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Alertas Activas</h3>
               <div className="space-y-4 flex-1">
                  {state.taxObligations.filter(o => o.status !== 'paid' && new Date(o.dueDate) <= new Date()).map(o => (
                    <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 animate-pulse">
                       <AlertCircle className="text-rose-500" size={20} />
                       <div className="flex-1">
                          <p className="text-xs font-black text-white uppercase">{state.taxConfigs.find(c => c.id === o.taxId)?.name} vencido</p>
                          <p className="text-[10px] font-bold text-rose-500/80">Monto: ${o.amount.toLocaleString()} • Venció {o.dueDate}</p>
                       </div>
                       <button className="text-[10px] font-black uppercase text-rose-500 border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/10">Solucionar</button>
                    </div>
                  ))}
                  {state.taxObligations.filter(o => o.status !== 'paid').length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center space-y-2">
                       <CheckCircle2 size={32} />
                       <p className="text-[10px] font-black uppercase tracking-widest">No hay deudas fiscales pendientes</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      );
      case 'calendar': return <TaxCalendarView state={state} viewingMonth={viewingMonth} offset={selectedMonthOffset} setOffset={setSelectedMonthOffset} cuitEnding={cuitEnding} setCuitEnding={setCuitEnding} />;
      case 'my_taxes': return <MyTaxesList state={state} onUpdate={onUpdateObligation} onAddEntry={onAddEntry} />;
      case 'calculators': return <TaxCalculator state={state} onSave={onAddObligation} />;
      case 'history': return <TaxHistory state={state} />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">Impuestos</h1>
          <p className="text-slate-500 text-sm font-medium">Control fiscal y vencimientos AFIP.</p>
        </div>
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide max-w-full">
           <TabBtn active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} label="Resumen" icon={<Receipt size={14} />} />
           <TabBtn active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} label="Calendario" icon={<Calendar size={14} />} />
           <TabBtn active={activeTab === 'my_taxes'} onClick={() => setActiveTab('my_taxes')} label="Mis Impuestos" icon={<FileText size={14} />} />
           <TabBtn active={activeTab === 'calculators'} onClick={() => setActiveTab('calculators')} label="Calculadoras" icon={<Calculator size={14} />} />
           <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Histórico" icon={<History size={14} />} />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

// --- Subcomponentes ---

const Kpi = ({ title, value, info, color, isAlert }: any) => (
  <div className={`glass p-6 rounded-[2rem] border ${isAlert ? 'border-rose-500/50 bg-rose-500/5 animate-pulse' : 'border-white/5'} transition-all hover:scale-[1.02] shadow-xl`}>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <p className={`text-2xl font-black ${isAlert ? 'text-rose-500 neon-glow' : 'text-white'}`}>${value.toLocaleString()}</p>
    <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 flex items-center gap-1">
      <div className={`w-1 h-1 rounded-full bg-${color}-500`} /> {info}
    </p>
  </div>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${active ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon} {label}
  </button>
);

const TaxCalendarView = ({ state, viewingMonth, offset, setOffset, cuitEnding, setCuitEnding }: any) => {
  const monthName = viewingMonth.toLocaleString('es-AR', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth(), 1).getDay();
  const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Ajuste para Lunes = 0

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDay }, (_, i) => i);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <button onClick={() => setOffset(offset - 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-black uppercase italic text-white tracking-tighter w-48 text-center">{monthName}</h2>
              <button onClick={() => setOffset(offset + 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><ChevronRight size={20} /></button>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CUIT Terminado en:</span>
              <select value={cuitEnding} onChange={(e) => setCuitEnding(e.target.value)} className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black text-primary-500 uppercase outline-none focus:border-primary-500">
                <option>0-1-2-3</option>
                <option>4-5-6</option>
                <option>7-8-9</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
           {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
             <div key={d} className="bg-slate-900/50 p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">{d}</div>
           ))}
           {emptyDays.map(i => <div key={`e-${i}`} className="bg-slate-950/20 p-8"></div>)}
           {days.map(d => {
             const dateStr = `${viewingMonth.getFullYear()}-${String(viewingMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
             const obs = state.taxObligations.filter(o => o.dueDate === dateStr);
             return (
               <div key={d} className="bg-slate-950/40 p-4 min-h-[120px] border-r border-b border-white/5 hover:bg-white/[0.02] transition-colors relative group">
                  <span className="text-xs font-black text-slate-600 group-hover:text-slate-400">{d}</span>
                  <div className="mt-2 space-y-1">
                    {obs.map(o => (
                      <div key={o.id} className={`p-1.5 rounded-lg text-[8px] font-black uppercase truncate border ${o.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-primary-500/10 border-primary-500/30 text-primary-500 animate-pulse'}`}>
                        {state.taxConfigs.find(c => c.id === o.taxId)?.name}
                      </div>
                    ))}
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

const MyTaxesList = ({ state, onUpdate, onAddEntry }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
    {state.taxConfigs.map(tax => {
      const current = state.taxObligations.find(o => o.taxId === tax.id && o.status !== 'paid') || 
                      state.taxObligations.filter(o => o.taxId === tax.id).sort((a,b) => b.dueDate.localeCompare(a.dueDate))[0];
      
      const handlePay = () => {
        if (!current) return;
        const confirm = window.confirm(`¿Registrar pago de ${tax.name} por $${current.amount}?`);
        if (confirm) {
          onUpdate(current.id, { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] });
          // Crear asiento contable automáticamente
          onAddEntry({
            date: new Date().toISOString().split('T')[0],
            description: `Pago impuesto ${tax.name} - Periodo ${current.period}`,
            amount: current.amount,
            debitAccount: 'acc_vat_payable', // Ajustar según impuesto
            creditAccount: 'acc_bank'
          });
        }
      };

      return (
        <div key={tax.id} className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-xl hover:border-primary-500/20 transition-all group">
          <div className="flex items-start justify-between mb-6">
             <div className="p-3 rounded-2xl bg-white/5 text-primary-500"><Receipt size={24} /></div>
             {current?.status === 'overdue' && <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-black uppercase animate-pulse">Vencido</span>}
          </div>
          <h3 className="text-xl font-black text-white tracking-tighter mb-1">{tax.name}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">{tax.fullName}</p>
          
          <div className="space-y-4 mb-8">
             <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-600 uppercase">Estado:</span>
                <span className={`text-[10px] font-black uppercase ${current?.status === 'paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{current?.status || 'Pendiente'}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-600 uppercase">Vencimiento:</span>
                <span className="text-[10px] font-black text-slate-300 uppercase">{current?.dueDate || '--/--/--'}</span>
             </div>
             <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase">Monto Estimado:</span>
                <span className="text-lg font-black text-white">${current?.amount.toLocaleString() || '0'}</span>
             </div>
          </div>

          <div className="flex gap-2">
             <button onClick={handlePay} disabled={current?.status === 'paid' || !current} className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-30 text-white font-black text-[10px] uppercase transition-all shadow-lg active:scale-95">Marcar Pagado</button>
             <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"><Plus size={16} /></button>
          </div>
        </div>
      );
    })}
  </div>
);

const TaxHistory = ({ state }: any) => (
  <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
    <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Historial de Pagos y Presentaciones</h2>
        <div className="flex gap-2">
          <button className="text-[10px] font-black uppercase text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg hover:text-white transition-all">Excel</button>
          <button className="text-[10px] font-black uppercase text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg hover:text-white transition-all">PDF</button>
        </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-500">
            <th className="p-5">Fecha Pago</th>
            <th className="p-5">Impuesto</th>
            <th className="p-5">Periodo</th>
            <th className="p-5 text-right">Monto</th>
            <th className="p-5 text-center">Estado</th>
            <th className="p-5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {state.taxObligations.filter(o => o.status === 'paid').sort((a,b) => b.paymentDate!.localeCompare(a.paymentDate!)).map(o => (
            <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="p-5 text-xs font-bold text-slate-400">{o.paymentDate}</td>
              <td className="p-5 text-xs font-black text-white uppercase">{state.taxConfigs.find(c => c.id === o.taxId)?.name}</td>
              <td className="p-5 text-xs font-bold text-slate-500 uppercase">{o.period}</td>
              <td className="p-5 text-right font-black text-emerald-400 text-sm">${o.amount.toLocaleString()}</td>
              <td className="p-5">
                <div className="flex justify-center"><CheckCircle2 className="text-emerald-500" size={16} /></div>
              </td>
              <td className="p-5 text-right">
                <button className="p-2 text-slate-600 hover:text-primary-500 transition-colors"><FileText size={16} /></button>
              </td>
            </tr>
          ))}
          {state.taxObligations.filter(o => o.status === 'paid').length === 0 && (
            <tr><td colSpan={6} className="p-20 text-center text-[10px] font-black uppercase text-slate-600 tracking-[0.4em]">Sin historial de pagos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Taxes;
