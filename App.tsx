
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
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Trash2
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
    if (saved) return JSON.parse(saved);
    return {
      entries: [],
      reminders: [],
      language: Language.EN,
      theme: 'light',
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
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const t = translations[state.language];

  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    setIsEntryModalOpen(false);
  };

  const addEntriesBatch = (newEntries: Omit<JournalEntry, 'id'>[]) => {
    const entriesWithIds = newEntries.map(e => {
        // Calculate total amount if missing (from debitParts)
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
        language: Language.EN,
        theme: 'light',
        isOnboarded: true
      });
    }
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
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
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">{t.settings}</h1>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm space-y-4 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium mb-1">Language / Idioma</label>
              <select 
                value={state.language} 
                onChange={(e) => changeLanguage(e.target.value as Language)}
                className="w-full p-3 rounded-2xl border dark:bg-slate-700 dark:border-slate-600 outline-none"
              >
                <option value={Language.EN}>English</option>
                <option value={Language.ES}>Español</option>
                <option value={Language.PT}>Português</option>
                <option value={Language.FR}>Français</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Dark Mode</span>
              <button onClick={toggleTheme} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 transition-colors">
                {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
            <hr className="dark:border-slate-700" />
            <button 
              onClick={resetData}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-4 rounded-2xl transition-all font-bold border border-transparent hover:border-red-200"
            >
              <Trash2 size={20} />
              {t.resetData}
            </button>
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
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <span className="font-bold text-lg">Global Finances</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-3 p-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">G</div>
            <span className="font-bold text-xl tracking-tight">Global Finances</span>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-semibold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button 
              onClick={() => setIsEntryModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-primary-600/20 transition-all transform active:scale-95"
            >
              <PlusCircle size={20} />
              {t.addEntry}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto pb-24 md:pb-8">
          {renderContent()}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
          title={t.analyzeImage}
        >
          <ScanLine size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-primary-700 transition-all transform hover:scale-105 active:scale-95"
          title={t.aiChat}
        >
          <MessageSquare size={28} />
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
                // If single receipt, add it or open entry form
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
