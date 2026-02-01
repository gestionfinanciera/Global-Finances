
import React from 'react';
import { JournalEntry, Language, AccountType, JournalEntryPart } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { Trash2, Info } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  language: Language;
}

const Journal: React.FC<JournalProps> = ({ entries, onDelete, language }) => {
  const t = translations[language];

  const getAccountName = (id?: string) => CHART_OF_ACCOUNTS.find(a => a.id === id)?.name || id;
  const getAccountType = (id?: string) => CHART_OF_ACCOUNTS.find(a => a.id === id)?.type || '';

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.journal}</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-sm font-medium border-b dark:border-slate-700">
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">{t.description}</th>
                <th className="px-6 py-4">{t.debit} (Dr)</th>
                <th className="px-6 py-4">{t.credit} (Cr)</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {entries.map(entry => {
                const debits = entry.debitParts || (entry.debitAccount ? [{ accountId: entry.debitAccount, amount: entry.amount }] : []);
                const credits = entry.creditParts || (entry.creditAccount ? [{ accountId: entry.creditAccount, amount: entry.amount }] : []);
                const maxRows = Math.max(debits.length, credits.length);

                return (
                  <React.Fragment key={entry.id}>
                    {[...Array(maxRows)].map((_, idx) => (
                      <tr key={`${entry.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        {idx === 0 && (
                          <>
                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap align-top" rowSpan={maxRows}>
                              {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-medium align-top" rowSpan={maxRows}>
                              {entry.description}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-2">
                          {debits[idx] && (
                            <div className="flex flex-col">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{getAccountName(debits[idx].accountId)}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">+{getAccountType(debits[idx].accountId)}</span>
                              <span className="font-mono text-xs font-bold">${debits[idx].amount.toFixed(2)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-2 pl-12">
                          {credits[idx] && (
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{getAccountName(credits[idx].accountId)}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">-{getAccountType(credits[idx].accountId)}</span>
                              <span className="font-mono text-xs font-bold text-slate-400">${credits[idx].amount.toFixed(2)}</span>
                            </div>
                          )}
                        </td>
                        {idx === 0 && (
                          <td className="px-6 py-4 text-center align-top" rowSpan={maxRows}>
                            <button 
                              onClick={() => onDelete(entry.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    {t.noEntries}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Journal;
