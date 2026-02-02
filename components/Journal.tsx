
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
        <h1 className="text-3xl font-black tracking-tight neon-glow uppercase italic">{t.journal}</h1>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary-500/30 shadow-[0_0_40px_rgba(255,0,85,0.1)] neon-border">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-slate-800">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="bg-gradient-to-r from-primary-600/90 to-primary-800/90 text-white font-black text-xs text-center uppercase tracking-[0.2em] shadow-lg">
                <th className="border-r border-primary-500/20 p-5 w-20">N°</th>
                <th className="border-r border-primary-500/20 p-5 text-left">DETALLE (Cuentas)</th>
                <th className="border-r border-primary-500/20 p-5 w-40">DEBE ($)</th>
                <th className="p-5 w-40">HABER ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {entries.map((entry, entryIdx) => {
                const debits = entry.debitParts || (entry.debitAccount ? [{ accountId: entry.debitAccount, amount: entry.amount }] : []);
                const credits = entry.creditParts || (entry.creditAccount ? [{ accountId: entry.creditAccount, amount: entry.amount }] : []);
                
                return (
                  <React.Fragment key={entry.id}>
                    {/* Date Header: Neon Spreadsheet Style */}
                    <tr className="bg-blue-600/40 border-y border-blue-500/30 group">
                      <td className="p-3 text-center font-black text-xs text-blue-400 border-r border-blue-500/10">
                        {entryIdx + 1}
                      </td>
                      <td className="p-3 text-center font-black text-[11px] uppercase tracking-[0.3em] text-white flex items-center justify-center gap-3">
                        <Calendar size={14} className="text-blue-400" />
                        Fecha {new Date(entry.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-3 border-r border-blue-500/10"></td>
                      <td className="p-3"></td>
                    </tr>
                    
                    {/* Debits (+A / +RN) */}
                    {debits.map((p, idx) => (
                      <tr key={`debit-${idx}`} className="group hover:bg-emerald-500/5 transition-colors border-b border-white/5">
                        <td className="border-r border-white/5"></td>
                        <td className="p-4 text-sm font-bold flex justify-between items-center">
                          <span className="text-slate-100 uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                            {getAccount(p.accountId)?.name || p.accountId} 
                            <span className="text-[11px] text-emerald-500/80 font-black tracking-widest">{getAccountIndicator(p.accountId, true)}</span>
                          </span>
                          {idx === 0 && (
                            <button 
                              onClick={() => onDelete(entry.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                              title="Eliminar asiento"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right font-black text-emerald-400 text-base border-r border-white/5 bg-emerald-500/5 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]">
                          {p.amount.toLocaleString()}
                        </td>
                        <td className="p-4"></td>
                      </tr>
                    ))}
                    
                    {/* Credits (+P / +PN / +RP / -A) */}
                    {credits.map((p, idx) => (
                      <tr key={`credit-${idx}`} className="hover:bg-primary-500/5 transition-colors border-b border-white/5">
                        <td className="border-r border-white/5"></td>
                        <td className="p-4 text-sm font-bold pl-16">
                          <span className="text-slate-400 uppercase tracking-tighter flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_#ff0055]" />
                            {getAccount(p.accountId)?.name || p.accountId} 
                            <span className="text-[11px] text-primary-400/80 font-black tracking-widest">{getAccountIndicator(p.accountId, false)}</span>
                          </span>
                        </td>
                        <td className="p-4 border-r border-white/5"></td>
                        <td className="p-4 text-right font-black text-primary-400 text-base bg-primary-500/5 shadow-[inset_0_0_15px_rgba(255,0,85,0.05)]">
                          {p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {/* S/F Footer row */}
                    <tr className="border-b border-white/10 bg-black/20">
                      <td className="border-r border-white/5"></td>
                      <td className="p-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] pl-6">S / F - O</td>
                      <td className="border-r border-white/5"></td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          
          {entries.length === 0 && (
            <div className="p-32 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/20 animate-pulse">
                <Trash2 size={32} className="text-slate-700" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-sm">
                Sin registros en el libro diario
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
