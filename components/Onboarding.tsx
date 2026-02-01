
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ChevronRight, LayoutDashboard, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, language, setLanguage }) => {
  const [step, setStep] = useState(0);
  const t = translations[language];

  const steps = [
    {
      title: t.welcomeTitle,
      description: t.welcomeDesc,
      icon: <LayoutDashboard className="w-20 h-20 text-primary-600" />,
      color: "from-blue-500 to-primary-600"
    },
    {
      title: language === 'es' ? "Aprende Contabilidad" : "Learn Accounting",
      description: language === 'es' ? "Entiende la partida doble mientras registras tus movimientos financieros reales." : "Understand double-entry while recording your real financial moves.",
      icon: <GraduationCap className="w-20 h-20 text-emerald-600" />,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: language === 'es' ? "Privacidad Total" : "Total Privacy",
      description: language === 'es' ? "Tus datos nunca salen de tu dispositivo. Sin cuentas, sin rastreo." : "Your data never leaves your device. No accounts, no tracking.",
      icon: <ShieldCheck className="w-20 h-20 text-amber-600" />,
      color: "from-amber-500 to-orange-600"
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center gap-2 mb-4">
          {(['en', 'es', 'pt', 'fr'] as Language[]).map(l => (
            <button 
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === l ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50" />
          <div className="relative transform transition-all duration-500 scale-110">
            {steps[step].icon}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            {steps[step].title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {steps[step].description}
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-600' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>

        <div className="pt-6 flex flex-col gap-3">
          <button 
            onClick={nextStep}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-2xl font-bold shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 transition-all group"
          >
            {step === steps.length - 1 ? t.getStarted : (language === 'es' ? 'Siguiente' : 'Next')}
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          {step < steps.length - 1 && (
            <button 
              onClick={onComplete}
              className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-2 transition-colors font-medium"
            >
              {t.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
