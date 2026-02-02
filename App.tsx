
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PieChart, 
  GraduationCap, 
  Settings, 
  PlusCircle, 
  MessageSquare, 
  ScanLine,
  Menu,
  X,
  Trash2,
  Globe
} from 'lucide-react';
import { AppState, Language, JournalEntry, Reminder } from './types';
import { translations } from './translations';
import { CHART_OF_ACCOUNTS } from './accounts';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Reports from './components/Reports';
import Education from './components/Education';
import EntryForm from './components/EntryForm';
import ChatBot from './components/ChatBot';
import ImageAnalyzer from './components/ImageAnalyzer';
import Onboarding from './components/Onboarding';

const STORAGE_KEY = 'global_finances_data';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, theme: 'dark' }; // Force dark theme on load
    }
    return {
      entries: [],
      reminders: [],
      language: Language.ES,
      theme: 'dark',
      isOnboarded: false
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.add('dark');
  }, [state]);

  const t = translations[state.language];

  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    setIsEntryModalOpen(false);
  };

  const addEntriesBatch = (newEntries: Omit<JournalEntry, 'id'>[]) => {
    const entriesWithIds = newEntries.map(e => {
        const total = e.amount || (e.debitParts ? e.debitParts.reduce((s, p) => s + p.amount, 0) : 0);
        return { ...e, amount: total, id: crypto.randomUUID() };
    });
    setState(prev => ({ ...prev, entries: [...entriesWithIds, ...prev.entries] }));
  };

  const deleteEntry = (id: string) => {
    setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  };

  const resetData = () => {
    if (window.confirm(t.warningReset)) {
      setState({
        entries: [],
        reminders: [],
        language: state.language,
        theme: 'dark',
        isOnboarded: true
      });
    }
  };

  const changeLanguage = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, isOnboarded: true }));
  };

  if (!state.isOnboarded) {
    return <Onboarding onComplete={completeOnboarding} language={state.language} setLanguage={changeLanguage} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onAddClick={() => setIsEntryModalOpen(true)} />;
      case 'journal': return <Journal entries={state.entries} onDelete={deleteEntry} language={state.language} />;
      case 'reports': return <Reports entries={state.entries} language={state.language} />;
      case 'education': return <Education language={state.language} />;
      case 'settings': return (
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold neon-glow">{t.settings}</h1>
          <div className="glass p-8 rounded-[2rem] shadow-2xl space-y-8 border border-primary-500/20">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                <Globe size={14} className="text-primary-500" />
                Language / Idioma
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[Language.EN, Language.ES, Language.PT, Language.FR].map(lang => (
                   <button 
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`py-3 px-4 rounded-xl font-bold transition-all border ${state.language === lang ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-600/20' : 'bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/10'}`}
                   >
                     {lang.toUpperCase()}
                   </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <button 
                onClick={resetData}
                className="w-full flex items-center justify-center gap-3 text-rose-500 hover:bg-rose-500/10 p-5 rounded-2xl transition-all font-black uppercase tracking-widest border border-rose-500/20 hover:border-rose-500/40"
              >
                <Trash2 size={20} />
                {t.resetData}
              </button>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'journal', label: t.journal, icon: BookOpen },
    { id: 'reports', label: t.reports, icon: PieChart },
    { id: 'education', label: t.education, icon: GraduationCap },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-primary-500/20 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/30">G</div>
          <span className="font-black text-lg tracking-tight neon-glow">Global Finances</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-primary-500">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-primary-500/20 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-4 p-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary-500/30">G</div>
            <span className="font-black text-2xl tracking-tighter neon-glow">Global Finances</span>
          </div>
          
          <nav className="flex-1 px-6 py-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-primary-600/10 text-primary-500 font-black shadow-[inset_0_0_10px_rgba(255,0,85,0.1)] border border-primary-500/20' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <item.icon size={22} className={activeTab === item.id ? 'text-primary-500' : ''} />
                <span className="uppercase text-xs tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5">
            <button 
              onClick={() => setIsEntryModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-500 text-white font-black py-4 px-6 rounded-2xl shadow-2xl shadow-primary-600/30 transition-all transform active:scale-95 uppercase text-xs tracking-[0.2em]"
            >
              <PlusCircle size={20} />
              {t.addEntry}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#020617]">
        <div className="max-w-6xl mx-auto pb-24 md:pb-8">
          {renderContent()}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="w-14 h-14 bg-slate-800 border border-primary-500/30 rounded-full flex items-center justify-center shadow-2xl text-primary-400 hover:bg-slate-700 hover:text-primary-300 transition-all group active:scale-90"
          title={t.analyzeImage}
        >
          <ScanLine size={28} className="group-hover:rotate-12 transition-transform" />
        </button>
        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(255,0,85,0.4)] hover:bg-primary-500 transition-all transform hover:scale-105 active:scale-90 border-2 border-primary-400/20"
          title={t.aiChat}
        >
          <MessageSquare size={32} />
        </button>
      </div>

      {/* Modals & Overlays */}
      {isEntryModalOpen && (
        <EntryForm 
          onClose={() => setIsEntryModalOpen(false)} 
          onSubmit={addEntry} 
          language={state.language}
        />
      )}

      {isChatOpen && (
        <ChatBot 
          onClose={() => setIsChatOpen(false)} 
          language={state.language} 
        />
      )}

      {isScannerOpen && (
        <ImageAnalyzer 
          onClose={() => setIsScannerOpen(false)} 
          onResult={(data) => {
            if (Array.isArray(data)) {
                addEntriesBatch(data);
            } else {
                addEntry({
                    date: data.date,
                    description: data.description,
                    amount: data.amount,
                    debitAccount: data.recommendedAccount,
                    creditAccount: 'acc_bank'
                });
            }
            setIsScannerOpen(false);
            setActiveTab('journal');
          }}
          language={state.language}
        />
      )}
    </div>
  );
};

export default App;
