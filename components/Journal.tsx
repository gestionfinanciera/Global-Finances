
import React from 'react';
import { JournalEntry, Language, AccountType, JournalEntryPart } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { Trash2, Calendar } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  language: Language;
}

const Journal: React.FC<JournalProps> = ({ entries, onDelete, language }) => {
  const t = translations[language];

  const getAccount = (id?: string) => CHART_OF_ACCOUNTS.find(a => a.id === id);

  const getAccountIndicator = (accountId: string, isDebit: boolean) => {
    const acc = getAccount(accountId);
    if (!acc) return '';
    
    switch (acc.type) {
      case AccountType.ASSET:
        return isDebit ? '(+A)' : '(-A)';
      case AccountType.LIABILITY:
        return isDebit ? '(-P)' : '(+P)';
      case AccountType.EQUITY:
        return isDebit ? '(-PN)' : '(+PN)';
      case AccountType.INCOME:
        return isDebit ? '(-RP)' : '(+RP)';
      case AccountType.EXPENSE:
        return isDebit ? '(+RN)' : '(-RN)';
      default:
        return '';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight neon-glow">{t.journal} (Libro Diario)</h1>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl overflow-hidden border border-primary-500/30 shadow-[0_0_20px_rgba(255,0,85,0.15)] neon-border">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-slate-800">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="bg-gradient-to-r from-primary-600 to-primary-800 text-white font-black text-xs text-center uppercase tracking-widest">
                <th className="border-r border-primary-500/20 p-4 w-16">N°</th>
                <th className="border-r border-primary-500/20 p-4 text-left">Detalle de Cuentas</th>
                <th className="border-r border-primary-500/20 p-4 w-32">Debe ($)</th>
                <th className="p-4 w-32">Haber ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {entries.map((entry, entryIdx) => {
                const debits = entry.debitParts || (entry.debitAccount ? [{ accountId: entry.debitAccount, amount: entry.amount }] : []);
                const credits = entry.creditParts || (entry.creditAccount ? [{ accountId: entry.creditAccount, amount: entry.amount }] : []);
                
                return (
                  <React.Fragment key={entry.id}>
                    {/* Date Header: Neon Styled */}
                    <tr className="bg-slate-800/80 border-y border-primary-500/30">
                      <td className="p-2 text-center font-black text-xs text-primary-400 border-r border-primary-500/10">
                        {entryIdx + 1}
                      </td>
                      <td className="p-2 text-center font-black text-[10px] uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2">
                        <Calendar size={12} className="text-primary-500" />
                        Fecha {new Date(entry.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-2 border-r border-primary-500/10"></td>
                      <td className="p-2"></td>
                    </tr>
                    
                    {/* Debits */}
                    {debits.map((p, idx) => (
                      <tr key={`debit-${idx}`} className="group hover:bg-primary-500/5 transition-colors border-b border-primary-500/5">
                        <td className="border-r border-primary-500/10"></td>
                        <td className="p-3 text-sm font-bold flex justify-between items-center">
                          <span className="text-slate-100 uppercase tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                            {getAccount(p.accountId)?.name || p.accountId} 
                            <span className="text-[10px] text-emerald-500/80 font-black">{getAccountIndicator(p.accountId, true)}</span>
                          </span>
                          {idx === 0 && (
                            <button 
                              onClick={() => onDelete(entry.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-primary-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all"
                              title="Eliminar asiento"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-emerald-400 text-sm border-r border-primary-500/10 bg-emerald-500/5">
                          {p.amount.toLocaleString()}
                        </td>
                        <td className="p-3"></td>
                      </tr>
                    ))}
                    
                    {/* Credits */}
                    {credits.map((p, idx) => (
                      <tr key={`credit-${idx}`} className="hover:bg-primary-500/5 transition-colors border-b border-primary-500/5">
                        <td className="border-r border-primary-500/10"></td>
                        <td className="p-3 text-sm font-bold pl-12">
                          <span className="text-slate-400 uppercase tracking-tight flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_5px_#ff0055]" />
                            {getAccount(p.accountId)?.name || p.accountId} 
                            <span className="text-[10px] text-primary-400/80 font-black">{getAccountIndicator(p.accountId, false)}</span>
                          </span>
                        </td>
                        <td className="p-3 border-r border-primary-500/10"></td>
                        <td className="p-3 text-right font-black text-primary-400 text-sm bg-primary-500/5">
                          {p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {/* S/F Footer row */}
                    <tr className="border-b border-primary-500/20">
                      <td className="border-r border-primary-500/10"></td>
                      <td className="p-2 text-[9px] font-black text-slate-600 uppercase tracking-widest pl-4">S/F - O</td>
                      <td className="border-r border-primary-500/10"></td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          
          {entries.length === 0 && (
            <div className="p-24 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/20">
                <Trash2 size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">
                No hay registros en el diario
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
