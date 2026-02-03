
import React, { useState, useMemo } from 'react';
import { Language, AccountType } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { ChevronDown, Calculator, Lightbulb, FileText, Search, Scale, BookOpenCheck, ReceiptText } from 'lucide-react';

interface EducationProps { language: Language; }

const Education: React.FC<EducationProps> = ({ language }) => {
  const t = translations[language];
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeEduTab, setActiveEduTab] = useState<'concepts' | 'accounts'>('concepts');
  const [calcData, setCalcData] = useState({ amount: '', tax: '21', discount: '0' });

  const result = parseFloat(calcData.amount || '0') * (1 + parseFloat(calcData.tax) / 100) * (1 - parseFloat(calcData.discount) / 100);

  const filteredAccounts = useMemo(() => {
    return CHART_OF_ACCOUNTS.filter(acc => 
      acc.name.toLowerCase().includes(search.toLowerCase()) || 
      acc.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const groupedAccounts = useMemo(() => {
    return filteredAccounts.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr);
      return acc;
    }, {} as Record<AccountType, typeof CHART_OF_ACCOUNTS>);
  }, [filteredAccounts]);

  const typeColors: Record<AccountType, string> = {
    [AccountType.ASSET]: 'emerald',
    [AccountType.LIABILITY]: 'rose',
    [AccountType.EQUITY]: 'amber',
    [AccountType.INCOME]: 'primary',
    [AccountType.EXPENSE]: 'accent-pink',
  };

  const typeLabels: Record<AccountType, string> = {
    [AccountType.ASSET]: language === 'es' ? 'Activo (Recursos)' : 'Asset (Resources)',
    [AccountType.LIABILITY]: language === 'es' ? 'Pasivo (Obligaciones)' : 'Liability (Obligations)',
    [AccountType.EQUITY]: language === 'es' ? 'Patrimonio Neto (Capital)' : 'Equity (Own Capital)',
    [AccountType.INCOME]: language === 'es' ? 'Resultado Positivo (Ingresos)' : 'Income',
    [AccountType.EXPENSE]: language === 'es' ? 'Resultado Negativo (Gastos)' : 'Expenses',
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black neon-glow uppercase italic tracking-tighter">{t.education}</h1>
          <p className="text-slate-500 text-sm font-medium">Domina la contabilidad de partida doble.</p>
        </div>
        <div className="flex bg-[#1A1625] p-1 rounded-2xl border border-white/5 shadow-inner">
          <button 
            onClick={() => setActiveEduTab('concepts')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeEduTab === 'concepts' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Conceptos
          </button>
          <button 
            onClick={() => setActiveEduTab('accounts')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeEduTab === 'accounts' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Manual Cuentas
          </button>
        </div>
      </div>

      {activeEduTab === 'concepts' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="glass p-8 rounded-[2.5rem] border border-primary-500/20 bg-gradient-to-br from-primary-900/10 to-transparent">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-primary-500/20 rounded-[1.5rem] border border-primary-500/30">
                <BookOpenCheck className="text-primary-400" size={28} />
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">El Corazón: Debe y Haber</h2>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-3xl">
              Cada cuenta tiene dos lados: el <b>Debe</b> (izquierdo) y el <b>Haber</b> (derecho). 
              Dependiendo del tipo de cuenta, un mismo lado puede significar aumento (+) o disminución (-).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TAccount 
                title="ACTIVOS Y GASTOS" 
                plusSide="Debe" 
                minusSide="Haber" 
                desc="Aumentan por el Debe, disminuyen por el Haber."
                color="emerald"
              />
              <TAccount 
                title="PASIVOS Y PATRIMONIO" 
                plusSide="Haber" 
                minusSide="Debe" 
                desc="Aumentan por el Haber, disminuyen por el Debe."
                color="rose"
              />
              <TAccount 
                title="INGRESOS" 
                plusSide="Haber" 
                minusSide="Debe" 
                desc="Nacen y aumentan por el Haber."
                color="amber"
              />
            </div>

            <div className="mt-12 p-1 rounded-[2rem] bg-gradient-to-r from-primary-500/20 to-accent-pink/20">
               <div className="bg-[#0F0D1E] rounded-[1.9rem] p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-6 text-center">Reglas de Registro</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-slate-500 font-black uppercase tracking-widest">
                          <th className="py-2 text-left px-4">Tipo de Cuenta</th>
                          <th className="py-2 px-4">DEBE (Izquierda)</th>
                          <th className="py-2 px-4">HABER (Derecha)</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        <BehaviorRow label="🟢 Activo" inc="Aumenta (+)" dec="Disminuye (-)" color="text-emerald-500" />
                        <BehaviorRow label="🔴 Pasivo" inc="Disminuye (-)" dec="Aumenta (+)" color="text-rose-500" />
                        <BehaviorRow label="🟡 Patrimonio" inc="Disminuye (-)" dec="Aumenta (+)" color="text-amber-500" />
                        <BehaviorRow label="🟠 Res. Positivo" inc="Disminuye (-)" dec="Aumenta (+)" color="text-primary-400" />
                        <BehaviorRow label="🔵 Res. Negativo" inc="Aumenta (+)" dec="Disminuye (-)" color="text-accent-pink" />
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          </section>

          <section className="glass p-10 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />
            <div className="flex items-center gap-4 mb-10">
              <Scale className="text-emerald-400" size={32} />
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">La Ecuación Fundamental</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              <div className="text-center group">
                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-emerald-500/50 flex flex-col items-center justify-center glass shadow-2xl shadow-emerald-500/10 group-hover:scale-105 group-hover:border-emerald-500 transition-all duration-500">
                  <span className="text-3xl font-black text-white uppercase tracking-tighter">Activo</span>
                  <span className="text-[10px] uppercase font-black text-emerald-500 mt-2">Lo que tienes</span>
                </div>
              </div>
              <span className="text-5xl font-black text-slate-700">=</span>
              <div className="text-center group">
                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-rose-500/50 flex flex-col items-center justify-center glass shadow-2xl shadow-rose-500/10 group-hover:scale-105 group-hover:border-rose-500 transition-all duration-500">
                  <span className="text-3xl font-black text-white uppercase tracking-tighter">Pasivo</span>
                  <span className="text-[10px] uppercase font-black text-rose-500 mt-2">Lo que debes</span>
                </div>
              </div>
              <span className="text-5xl font-black text-slate-700">+</span>
              <div className="text-center group">
                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-amber-500/50 flex flex-col items-center justify-center glass shadow-2xl shadow-amber-500/10 group-hover:scale-105 group-hover:border-amber-500 transition-all duration-500">
                  <span className="text-3xl font-black text-white uppercase tracking-tighter italic">P. Neto</span>
                  <span className="text-[10px] uppercase font-black text-amber-500 mt-2">Lo tuyo</span>
                </div>
              </div>
            </div>
            <p className="mt-10 text-center text-xs font-bold text-slate-500 uppercase tracking-widest italic">"Nada aparece de la nada: o lo debes a otros o es capital propio."</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EduCard icon={<Lightbulb className="text-amber-500" />} title="Partida Doble" desc="Cada operación afecta al menos a dos cuentas. Los montos registrados en el Debe deben ser iguales a los del Haber. La balanza siempre debe estar en equilibrio." />
            <EduCard icon={<ReceiptText className="text-primary-400" />} title="Devengado" desc="Los gastos e ingresos se registran en el momento en que se generan, independientemente de si el dinero ya se pagó o cobró físicamente." />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary-500/20 rounded-2xl border border-primary-500/30">
                  <FileText className="text-primary-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Plan de Cuentas</h2>
              </div>
              
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar cuenta o concepto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-80 pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm font-bold text-white transition-all shadow-xl"
                />
              </div>
            </div>
            
            <div className="space-y-16">
              {(Object.keys(groupedAccounts) as AccountType[]).map((type) => (
                <div key={type} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <h3 className={`text-xs font-black uppercase tracking-[0.4em] text-${typeColors[type]} flex items-center gap-3`}>
                      <div className={`w-1.5 h-6 bg-${typeColors[type]} rounded-full shadow-[0_0_10px_currentcolor]`} />
                      {typeLabels[type]}
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedAccounts[type].map(acc => (
                      <div 
                        key={acc.id} 
                        className={`group border rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${expandedAcc === acc.id ? 'bg-primary-500/5 border-primary-500/40 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                      >
                        <button 
                          onClick={() => setExpandedAcc(expandedAcc === acc.id ? null : acc.id)}
                          className="w-full p-5 flex items-center justify-between text-left"
                        >
                          <span className={`text-xs font-black uppercase tracking-tight transition-colors ${expandedAcc === acc.id ? 'text-primary-400' : 'text-slate-300 group-hover:text-white'}`}>
                            {acc.name}
                          </span>
                          <div className={`transition-transform duration-500 ${expandedAcc === acc.id ? 'rotate-180 text-primary-400' : 'text-slate-600'}`}>
                            <ChevronDown size={16} />
                          </div>
                        </button>
                        {expandedAcc === acc.id && (
                          <div className="px-5 pb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="h-[1px] bg-white/5 mb-4" />
                            <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-wide">
                              {acc.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 blur-[60px] -mr-20 -mt-20 group-hover:bg-primary-500/20 transition-all"></div>
            <div className="flex items-center gap-4 mb-10">
              <Calculator className="text-primary-400" size={32} />
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Calculadora de Márgenes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
              <CalcInput label="Monto Base ($)" value={calcData.amount} onChange={(val) => setCalcData({...calcData, amount: val})} placeholder="0.00" />
              <CalcInput label="IVA / Tax (%)" value={calcData.tax} onChange={(val) => setCalcData({...calcData, tax: val})} />
              <CalcInput label="Descuento (%)" value={calcData.discount} onChange={(val) => setCalcData({...calcData, discount: val})} />
            </div>
            <div className="p-10 bg-primary-500/5 rounded-[2.5rem] text-center border border-primary-500/10 shadow-inner">
              <p className="text-[10px] text-primary-500 font-black uppercase tracking-[0.4em] mb-3">Resultado Proyectado</p>
              <p className="text-6xl font-black text-white italic tracking-tighter neon-glow">${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

// --- Subcomponentes ---

const TAccount: React.FC<{ title: string, plusSide: string, minusSide: string, desc: string, color: string }> = ({ title, plusSide, minusSide, desc, color }) => (
  <div className="space-y-4">
    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] text-center ${color === 'emerald' ? 'text-emerald-500' : color === 'rose' ? 'text-rose-500' : 'text-amber-500'}`}>{title}</h4>
    <div className="bg-[#1A1625]/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="grid grid-cols-2 text-center text-[9px] font-black tracking-[0.4em] text-slate-500 py-3 border-b border-white/5">
        <span className="border-r border-white/5 uppercase">DEBE</span>
        <span className="uppercase">HABER</span>
      </div>
      <div className="h-32 grid grid-cols-2">
        <div className={`flex items-center justify-center border-r border-white/5 text-3xl font-black transition-colors ${plusSide === 'Debe' ? (color === 'emerald' ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5') : 'text-slate-800'}`}>
          {plusSide === 'Debe' ? '+' : '-'}
        </div>
        <div className={`flex items-center justify-center text-3xl font-black transition-colors ${plusSide === 'Haber' ? (color === 'emerald' ? 'text-emerald-500 bg-emerald-500/5' : color === 'rose' ? 'text-rose-500 bg-rose-500/5' : 'text-amber-500 bg-amber-500/5') : 'text-slate-800'}`}>
          {plusSide === 'Haber' ? '+' : '-'}
        </div>
      </div>
    </div>
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight text-center leading-tight px-2">{desc}</p>
  </div>
);

const BehaviorRow: React.FC<{ label: string, inc: string, dec: string, color: string }> = ({ label, inc, dec, color }) => (
  <tr className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-xl border-b border-transparent">
    <td className={`py-4 text-left px-6 rounded-l-2xl font-black uppercase text-[10px] tracking-widest ${color}`}>{label}</td>
    <td className={`py-4 px-6 font-bold ${inc.includes('+') ? 'text-emerald-500' : 'text-slate-500'}`}>{inc}</td>
    <td className={`py-4 px-6 rounded-r-2xl font-bold ${dec.includes('+') ? 'text-emerald-500' : 'text-slate-500'}`}>{dec}</td>
  </tr>
);

const EduCard = ({ icon, title, desc }: any) => (
  <div className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-primary-500/20 transition-all group">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary-500/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{title}</h3>
    </div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{desc}</p>
  </div>
);

const CalcInput = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
    <input 
      type="number" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-500 outline-none text-lg font-black text-white transition-all shadow-inner"
      placeholder={placeholder}
    />
  </div>
);

export default Education;
