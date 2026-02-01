
import React, { useState, useMemo } from 'react';
import { Language, AccountType } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { ChevronDown, ChevronUp, Calculator, Lightbulb, FileText, Info, Search, Scale, TrendingUp, TrendingDown, ReceiptText } from 'lucide-react';

interface EducationProps { language: Language; }

const Education: React.FC<EducationProps> = ({ language }) => {
  const t = translations[language];
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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
    [AccountType.ASSET]: 'Activo (Recursos)',
    [AccountType.LIABILITY]: 'Pasivo (Obligaciones)',
    [AccountType.EQUITY]: 'Patrimonio Neto (Capital Propio)',
    [AccountType.INCOME]: 'Resultado Positivo (Ingresos)',
    [AccountType.EXPENSE]: 'Resultado Negativo (Gastos)',
  };

  const typeGlows: Record<AccountType, string> = {
    [AccountType.ASSET]: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    [AccountType.LIABILITY]: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    [AccountType.EQUITY]: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    [AccountType.INCOME]: 'shadow-[0_0_15px_rgba(255,0,85,0.3)]',
    [AccountType.EXPENSE]: 'shadow-[0_0_15px_rgba(255,0,85,0.3)]',
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold neon-glow mb-2">{t.education}</h1>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <Scale size={16} className="text-primary-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Educación Contable Profesional</span>
        </div>
      </div>

      {/* Conceptual Cards: Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glass p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-transparent">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-500">
            <TrendingUp size={20} />
            Ingresos (Resultados +)
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Representan el flujo de riqueza que **genera** la empresa. Se acreditan (Haber) para aumentar el patrimonio neto al final del ciclo.
          </p>
        </section>

        <section className="glass p-8 rounded-3xl border border-primary-500/20 bg-gradient-to-br from-primary-900/10 to-transparent">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-500">
            <TrendingDown size={20} />
            Gastos (Resultados -)
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Representan el **consumo** de recursos para operar. Se debitan (Debe) y su efecto final es disminuir el patrimonio neto.
          </p>
        </section>
      </div>

      {/* Important Note: Cash vs Expense */}
      <section className="glass p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
        <div className="p-3 bg-amber-500/10 rounded-2xl">
          <ReceiptText className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-amber-500 mb-1">¡Atención! Dinero ≠ Gasto</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No toda salida de dinero es un gasto contable. Pagar una deuda vieja es cancelar un Pasivo. Comprar una máquina es adquirir un Activo. Un **gasto** real es cuando consumes algo que no recuperas (ej: luz, sueldos, alquiler).
          </p>
        </div>
      </section>

      {/* Manual de Cuentas with Search */}
      <section className="glass p-6 rounded-3xl shadow-lg border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <FileText className="text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Manual de Cuentas Real</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cuenta o concepto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="space-y-12">
          {(Object.keys(groupedAccounts) as AccountType[]).map((type) => (
            <div key={type} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] text-${typeColors[type]}-500 flex items-center gap-2`}>
                  <div className={`w-3 h-3 rounded-full bg-${typeColors[type]}-500 ${typeGlows[type]}`} />
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

      {/* Calculator Section */}
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

      {/* Expert Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glass p-8 rounded-3xl shadow-lg border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="text-amber-400" />
            <h2 className="text-xl font-bold">Tips de Gastos</h2>
          </div>
          <ul className="space-y-5">
            <TipItem text="El Costo de Ventas (CMV) es tu gasto principal: si es muy alto, tu negocio no es rentable aunque vendas mucho." />
            <TipItem text="La Depreciación es un 'gasto fantasma': no sale dinero hoy, pero refleja que tus máquinas valen menos cada día." />
            <TipItem text="Controlar los Gastos de Administración es la forma más rápida de aumentar tu Utilidad Neta." />
            <TipItem text="Recuerda: Al final del año, Ganancias - Gastos = Resultado del Ejercicio (lo que sumas a tu riqueza)." />
          </ul>
        </section>

        <section className="glass p-8 rounded-3xl shadow-lg border border-white/10 bg-primary-900/10">
          <div className="flex items-center gap-3 mb-6">
            <Info className="text-primary-500" />
            <h2 className="text-xl font-bold">Filosofía Global Finances</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Global Finances es tu mentor personal. El Plan de Cuentas está diseñado para que dejes de ver 'números' y empieces a ver la realidad económica de tu vida y de tu empresa.
          </p>
          <div className="p-5 bg-black/40 rounded-2xl border border-white/10 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-full" />
            <p className="italic text-slate-300 text-sm">
              "El conocimiento financiero es la mejor inversión que puedes hacer. Cada registro es un paso hacia tu libertad."
            </p>
            <p className="mt-3 font-bold text-xs text-primary-500 uppercase tracking-widest text-right">Global Finances Team</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0 shadow-[0_0_8px_#ff0055]" />
    <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
  </li>
);

export default Education;
