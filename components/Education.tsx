
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { CHART_OF_ACCOUNTS } from '../accounts';
import { ChevronDown, ChevronUp, Calculator, Lightbulb, User, FileText } from 'lucide-react';

interface EducationProps {
  language: Language;
}

const Education: React.FC<EducationProps> = ({ language }) => {
  const t = translations[language];
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [calcData, setCalcData] = useState({ amount: '', tax: '15', discount: '0' });

  const result = parseFloat(calcData.amount || '0') * (1 + parseFloat(calcData.tax) / 100) * (1 - parseFloat(calcData.discount) / 100);

  return (
    <div className="p-4 md:p-6 space-y-8">
      <h1 className="text-2xl font-bold">{t.education}</h1>

      <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="text-primary-600" />
          <h2 className="text-xl font-bold">{t.calculators}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Amount ($)</label>
            <input 
              type="number" 
              value={calcData.amount}
              onChange={(e) => setCalcData({...calcData, amount: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Tax (%)</label>
            <input 
              type="number" 
              value={calcData.tax}
              onChange={(e) => setCalcData({...calcData, tax: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Discount (%)</label>
            <input 
              type="number" 
              value={calcData.discount}
              onChange={(e) => setCalcData({...calcData, discount: e.target.value})}
              className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
            />
          </div>
        </div>
        <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl text-center">
          <p className="text-sm text-primary-600 font-medium">Total Result</p>
          <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">${result.toFixed(2)}</p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-primary-600" />
          <h2 className="text-xl font-bold">Account Guide</h2>
        </div>
        <div className="space-y-2">
          {CHART_OF_ACCOUNTS.map(acc => (
            <div key={acc.id} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
              <button 
                onClick={() => setExpandedAcc(expandedAcc === acc.id ? null : acc.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    acc.type === 'Asset' ? 'bg-emerald-100 text-emerald-700' :
                    acc.type === 'Liability' ? 'bg-rose-100 text-rose-700' :
                    acc.type === 'Equity' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {acc.type}
                  </span>
                  <span className="font-semibold">{acc.name}</span>
                </div>
                {expandedAcc === acc.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedAcc === acc.id && (
                <div className="px-4 pb-4 pt-1 text-sm text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  {acc.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="text-amber-500" />
            <h2 className="text-xl font-bold">Financial Tips</h2>
          </div>
          <ul className="space-y-4">
            <TipItem text="Always record transactions immediately to avoid forgetting details." />
            <TipItem text="Keep your business and personal expenses in separate accounts." />
            <TipItem text="Double-entry ensures every dollar is accounted for: Assets = Liabilities + Equity." />
            <TipItem text="Review your monthly balance to identify unnecessary recurring costs." />
          </ul>
        </section>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-primary-600" />
            <h2 className="text-xl font-bold">About the App</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            Global Finances was created with the mission to democratize financial education. Most people feel overwhelmed by accounting, but it's the language of money.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
            <p className="italic text-slate-500 dark:text-slate-400 text-sm">
              "My goal is that after using this app, you not only have your finances in order, but you also understand why every number exists."
            </p>
            <p className="mt-2 font-bold text-sm">— Senior Developer & Finance Enthusiast</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
    <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
  </li>
);

export default Education;
