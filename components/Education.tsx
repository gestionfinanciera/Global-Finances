
import React, { useState, useMemo } from 'react';
import { Language, AccountType } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { ChevronDown, Calculator, Lightbulb, FileText, Info, Search, Scale, TrendingUp, TrendingDown, ReceiptText, BookOpenCheck } from 'lucide-react';

interface EducationProps { language: Language; }

const Education: React.FC<EducationProps> = ({ language }) => {
  const t = translations[language];
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeEduTab, setActiveEduTab] = useState<'concepts' | 'accounts'>('concepts');
  const [calcData, setCalcData] = useState({ amount: '', tax: '15', discount: '0' });

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
    [AccountType.EXPENSE]: 'primary',
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
          <h1 className="text-3xl font-bold neon-glow mb-2">{t.education}</h1>
          <p className="text-slate-500 text-sm">Aprende los pilares de la contabilidad profesional.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveEduTab('concepts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeEduTab === 'concepts' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Conceptos Clave
          </button>
          <button 
            onClick={() => setActiveEduTab('accounts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeEduTab === 'accounts' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Manual de Cuentas
          </button>
        </div>
      </div>

      {activeEduTab === 'concepts' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Debe y Haber Section */}
          <section className="glass p-8 rounded-3xl border border-primary-500/20 bg-gradient-to-br from-primary-900/10 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary-600/20 rounded-2xl">
                <BookOpenCheck className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold">El Corazón: Debe y Haber</h2>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Cada cuenta tiene dos lados: el <b>Debe</b> (izquierdo) y el <b>Haber</b> (derecho). 
              Dependiendo del tipo de cuenta, un mismo lado puede significar aumento (+) o disminución (-).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div className="mt-8 p-6 bg-black/30 rounded-2xl border border-white/10 overflow-hidden">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary-500 mb-4 text-center">Cuadro de Movimientos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-white/10">
                      <th className="py-2 text-left px-4">Tipo de Cuenta</th>
                      <th className="py-2 px-4">DEBE (Izquierda)</th>
                      <th className="py-2 px-4">HABER (Derecha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <BehaviorRow label="🟢 Activo" inc="Aumenta (+)" dec="Disminuye (-)" color="text-emerald-500" />
                    <BehaviorRow label="🔴 Pasivo" inc="Disminuye (-)" dec="Aumenta (+)" color="text-rose-500" />
                    <BehaviorRow label="🟡 Patrimonio" inc="Disminuye (-)" dec="Aumenta (+)" color="text-amber-500" />
                    <BehaviorRow label="🟠 Res. Positivo" inc="Disminuye (-)" dec="Aumenta (+)" color="text-primary-400" />
                    <BehaviorRow label="🔵 Res. Negativo" inc="Aumenta (+)" dec="Disminuye (-)" color="text-primary-500" />
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Ecuación Contable */}
          <section className="glass p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-6">
              <Scale className="text-emerald-500" />
              <h2 className="text-xl font-bold">La Ecuación Fundamental</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              <div className="text-center group">
                <div className="w-32 h-32 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center glass shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-2xl font-black text-emerald-500">Activo</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lo que tienes</span>
                </div>
              </div>
              <span className="text-4xl font-black text-slate-700">=</span>
              <div className="text-center group">
                <div className="w-32 h-32 rounded-full border-4 border-rose-500 flex flex-col items-center justify-center glass shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-2xl font-black text-rose-500">Pasivo</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lo que debes</span>
                </div>
              </div>
              <span className="text-4xl font-black text-slate-700">+</span>
              <div className="text-center group">
                <div className="w-32 h-32 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center glass shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-2xl font-black text-amber-500">P. Neto</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Lo tuyo</span>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-slate-400 italic">"Activo = Pasivo + Patrimonio Neto. Nada aparece de la nada: o lo debes a otros o es capital propio."</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="glass p-6 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Lightbulb size={20} />
                <h3 className="font-bold">Partida Doble</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada operación afecta al menos a dos cuentas. Los montos registrados en el Debe deben ser iguales a los del Haber. La balanza siempre debe estar en equilibrio.
              </p>
            </section>
            <section className="glass p-6 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-4 text-primary-500">
                <ReceiptText size={20} />
                <h3 className="font-bold">Principio de Devengado</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Los gastos e ingresos se registran en el momento en que se generan, independientemente de si el dinero ya se pagó o cobró físicamente.
              </p>
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="glass p-6 rounded-3xl shadow-lg border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/10 rounded-lg">
                  <FileText className="text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Plan de Cuentas</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar cuenta o concepto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-12">
              {(Object.keys(groupedAccounts) as AccountType[]).map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] text-${typeColors[type]}-500 flex items-center gap-2`}>
                      <div className={`w-3 h-3 rounded-full bg-${typeColors[type]}-500 shadow-[0_0_10px_rgba(var(--tw-color-${typeColors[type]}-500),0.4)]`} />
                      {typeLabels[type]}
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedAccounts[type].map(acc => (
                      <div 
                        key={acc.id} 
                        className={`group border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03] ${expandedAcc === acc.id ? 'bg-white/[0.05] border-white/20 ring-1 ring-white/10' : ''}`}
                      >
                        <button 
                          onClick={() => setExpandedAcc(expandedAcc === acc.id ? null : acc.id)}
                          className="w-full p-4 flex items-center justify-between text-left"
                        >
                          <span className={`text-sm font-semibold transition-colors ${expandedAcc === acc.id ? 'text-primary-400' : 'text-slate-300'}`}>
                            {acc.name}
                          </span>
                          <div className={`transition-transform duration-300 ${expandedAcc === acc.id ? 'rotate-180' : ''}`}>
                            <ChevronDown size={14} className="text-slate-500" />
                          </div>
                        </button>
                        {expandedAcc === acc.id && (
                          <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="h-[1px] bg-white/10 mb-3" />
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
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

          <section className="glass p-6 rounded-3xl shadow-lg border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary-500/10 transition-all"></div>
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="text-primary-500" />
              <h2 className="text-xl font-bold">Calculadora de Márgenes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monto Base ($)</label>
                <input 
                  type="number" 
                  value={calcData.amount}
                  onChange={(e) => setCalcData({...calcData, amount: e.target.value})}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none text-lg font-bold transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IVA / Tax (%)</label>
                <input 
                  type="number" 
                  value={calcData.tax}
                  onChange={(e) => setCalcData({...calcData, tax: e.target.value})}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none text-lg font-bold transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descuento (%)</label>
                <input 
                  type="number" 
                  value={calcData.discount}
                  onChange={(e) => setCalcData({...calcData, discount: e.target.value})}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary-500 outline-none text-lg font-bold transition-all"
                />
              </div>
            </div>
            <div className="p-6 bg-primary-500/10 rounded-2xl text-center border border-primary-500/20 shadow-inner">
              <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mb-1">Costo / Ingreso Proyectado</p>
              <p className="text-4xl font-black text-primary-500 neon-glow">${result.toFixed(2)}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const TAccount: React.FC<{ title: string, plusSide: string, minusSide: string, desc: string, color: string }> = ({ title, plusSide, minusSide, desc, color }) => (
  <div className="space-y-3">
    <h4 className={`text-xs font-black uppercase tracking-tighter text-${color}-500 text-center`}>{title}</h4>
    <div className="bg-white/5 border-2 border-slate-700/50 rounded-xl overflow-hidden relative shadow-sm">
      <div className="grid grid-cols-2 text-center text-[10px] font-black tracking-widest text-slate-500 py-2 bg-slate-800/30 border-b border-slate-700/50">
        <span className="border-r border-slate-700/50 uppercase">DEBE</span>
        <span className="uppercase">HABER</span>
      </div>
      <div className="h-24 grid grid-cols-2">
        <div className={`flex items-center justify-center border-r border-slate-700/50 font-bold ${plusSide === 'Debe' ? `text-${color}-500 bg-${color}-500/5` : 'text-slate-600'}`}>
          {plusSide === 'Debe' ? '+' : '-'}
        </div>
        <div className={`flex items-center justify-center font-bold ${plusSide === 'Haber' ? `text-${color}-500 bg-${color}-500/5` : 'text-slate-600'}`}>
          {plusSide === 'Haber' ? '+' : '-'}
        </div>
      </div>
    </div>
    <p className="text-[10px] text-slate-500 text-center leading-tight">{desc}</p>
  </div>
);

const BehaviorRow: React.FC<{ label: string, inc: string, dec: string, color: string }> = ({ label, inc, dec, color }) => (
  <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
    <td className={`py-3 text-left px-4 font-bold text-xs ${color}`}>{label}</td>
    <td className={`py-3 px-4 font-medium ${inc.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{inc}</td>
    <td className={`py-3 px-4 font-medium ${dec.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{dec}</td>
  </tr>
);

export default Education;
