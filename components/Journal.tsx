
import React from 'react';
import { JournalEntry, Language, AccountType, JournalEntryPart } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { Trash2 } from 'lucide-react';

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

  const totalDebe = entries.reduce((sum, entry) => {
    const debits = entry.debitParts || (entry.debitAccount ? [{ accountId: entry.debitAccount, amount: entry.amount }] : []);
    return sum + debits.reduce((s, p) => s + p.amount, 0);
  }, 0);

  const totalHaber = entries.reduce((sum, entry) => {
    const credits = entry.creditParts || (entry.creditAccount ? [{ accountId: entry.creditAccount, amount: entry.amount }] : []);
    return sum + credits.reduce((s, p) => s + p.amount, 0);
  }, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t.journal} (Libro Diario)</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border-4 border-slate-800 dark:border-slate-700 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="bg-orange-500 text-white font-black text-sm text-center uppercase">
                <th className="border-2 border-slate-800 p-3 w-16">N°</th>
                <th className="border-2 border-slate-800 p-3 text-left">Detalle</th>
                <th className="border-2 border-slate-800 p-3 w-32">Debe ($)</th>
                <th className="border-2 border-slate-800 p-3 w-32">Haber ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {entries.map((entry, entryIdx) => {
                const debits = entry.debitParts || (entry.debitAccount ? [{ accountId: entry.debitAccount, amount: entry.amount }] : []);
                const credits = entry.creditParts || (entry.creditAccount ? [{ accountId: entry.creditAccount, amount: entry.amount }] : []);
                
                return (
                  <React.Fragment key={entry.id}>
                    {/* Date Header for the transaction block */}
                    <tr className="bg-blue-400/90 dark:bg-blue-600">
                      <td className="border-2 border-slate-800 p-2 text-center font-black text-sm">{entryIdx + 1}</td>
                      <td className="border-2 border-slate-800 p-2 text-center font-black text-sm uppercase tracking-wider text-white">
                        Fecha {new Date(entry.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="border-2 border-slate-800 p-2"></td>
                      <td className="border-2 border-slate-800 p-2"></td>
                    </tr>
                    
                    {/* Debits */}
                    {debits.map((p, idx) => (
                      <tr key={`debit-${idx}`} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="border-2 border-slate-800"></td>
                        <td className="border-2 border-slate-800 p-2 text-sm font-bold flex justify-between items-center">
                          <span className="text-slate-900 dark:text-slate-100 uppercase">
                            {getAccount(p.accountId)?.name || p.accountId} {getAccountIndicator(p.accountId, true)}
                          </span>
                          {idx === 0 && (
                            <button 
                              onClick={() => onDelete(entry.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                              title="Eliminar asiento"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                        <td className="border-2 border-slate-800 p-2 text-right font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          {p.amount.toLocaleString()}
                        </td>
                        <td className="border-2 border-slate-800 p-2"></td>
                      </tr>
                    ))}
                    
                    {/* Credits */}
                    {credits.map((p, idx) => (
                      <tr key={`credit-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="border-2 border-slate-800"></td>
                        <td className="border-2 border-slate-800 p-2 text-sm font-bold pl-8">
                          <span className="text-slate-600 dark:text-slate-400 uppercase">
                            {getAccount(p.accountId)?.name || p.accountId} {getAccountIndicator(p.accountId, false)}
                          </span>
                        </td>
                        <td className="border-2 border-slate-800 p-2"></td>
                        <td className="border-2 border-slate-800 p-2 text-right font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          {p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {/* S/F Footer row as in the image */}
                    <tr>
                      <td className="border-2 border-slate-800"></td>
                      <td className="border-2 border-slate-800 p-1 text-[10px] font-black text-slate-400 uppercase pl-2">S/F - O</td>
                      <td className="border-2 border-slate-800"></td>
                      <td className="border-2 border-slate-800"></td>
                    </tr>
                  </React.Fragment>
                );
              })}
              
              {/* Grand Total Row */}
              <tr className="bg-slate-300 dark:bg-slate-700 font-black text-sm">
                <td className="border-2 border-slate-800"></td>
                <td className="border-2 border-slate-800 p-3 text-right uppercase">Resultado de todo</td>
                <td className="border-2 border-slate-800 p-3 text-right">{totalDebe.toLocaleString()}</td>
                <td className="border-2 border-slate-800 p-3 text-right">{totalHaber.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          {entries.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">
              No hay registros en el diario
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
