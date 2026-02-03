
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
  TrendingUp,
  Target,
  Users,
  Receipt,
  Package
} from 'lucide-react';
import { AppState, Language, JournalEntry, CashFlowItem, MonthlyBudget, Partner, PartnerMovement, TaxConfig, TaxObligation, Product, StockMovement } from './types';
import { translations } from './translations';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import CashFlow from './components/CashFlow';
import Budget from './components/Budget';
import Partners from './components/Partners';
import Taxes from './components/Taxes';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Education from './components/Education';
import EntryForm from './components/EntryForm';
import ChatBot from './components/ChatBot';
import ImageAnalyzer from './components/ImageAnalyzer';
import Onboarding from './components/Onboarding';

const STORAGE_KEY = 'global_finances_data_v4';

const INITIAL_TAX_CONFIGS: TaxConfig[] = [
  { id: 'tax_iva', name: 'IVA', fullName: 'Impuesto al Valor Agregado', category: 'national', frequency: 'monthly', defaultRate: 21, dueDateDay: 11 },
  { id: 'tax_iibb', name: 'IIBB', fullName: 'Ingresos Brutos', category: 'provincial', frequency: 'monthly', defaultRate: 3.5, dueDateDay: 18 },
  { id: 'tax_gan', name: 'Ganancias', fullName: 'Impuesto a las Ganancias', category: 'national', frequency: 'monthly', defaultRate: 0, dueDateDay: 20 },
  { id: 'tax_ss', name: 'Seg. Social', fullName: 'Cargas Sociales SUSS', category: 'national', frequency: 'monthly', defaultRate: 0, dueDateDay: 13 },
  { id: 'tax_mun', name: 'Municipal', fullName: 'Tasa Municipal', category: 'municipal', frequency: 'bimonthly', defaultRate: 0, dueDateDay: 30 },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...parsed, 
        theme: 'dark', 
        language: Language.ES,
        products: parsed.products || [],
        stockMovements: parsed.stockMovements || []
      };
    }
    return {
      entries: [],
      cashFlowItems: [],
      budgets: [],
      partners: [],
      partnerMovements: [],
      taxConfigs: INITIAL_TAX_CONFIGS,
      taxObligations: [],
      products: [],
      stockMovements: [],
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

  const t = translations[Language.ES];

  const addEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
    setIsEntryModalOpen(false);
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newP = { ...p, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, products: [...prev.products, newP] }));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const addMovement = (m: Omit<StockMovement, 'id'>) => {
    const newM = { ...m, id: crypto.randomUUID() };
    setState(prev => ({
      ...prev,
      stockMovements: [...prev.stockMovements, newM],
      products: prev.products.map(p => {
        if (p.id === m.productId) {
          return { ...p, stockActual: m.resultingStock };
        }
        return p;
      })
    }));
  };

  const resetData = () => {
    if (window.confirm(t.warningReset)) {
      setState({
        entries: [],
        cashFlowItems: [],
        budgets: [],
        partners: [],
        partnerMovements: [],
        taxConfigs: INITIAL_TAX_CONFIGS,
        taxObligations: [],
        products: [],
        stockMovements: [],
        language: Language.ES,
        theme: 'dark',
        isOnboarded: true
      });
    }
  };

  if (!state.isOnboarded) {
    return <Onboarding onComplete={() => setState(prev => ({ ...prev, isOnboarded: true }))} language={Language.ES} setLanguage={() => {}} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onAddClick={() => setIsEntryModalOpen(true)} />;
      case 'journal': return <Journal entries={state.entries} onDelete={(id) => setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }))} onReset={() => setState(prev => ({ ...prev, entries: [] }))} language={Language.ES} />;
      case 'cashFlow': return <CashFlow state={state} onAddItem={(i) => setState(prev => ({ ...prev, cashFlowItems: [...prev.cashFlowItems, { ...i, id: crypto.randomUUID() }] }))} onDeleteItem={(id) => setState(prev => ({ ...prev, cashFlowItems: prev.cashFlowItems.filter(i => i.id !== id) }))} onToggleStatus={(id) => setState(prev => ({ ...prev, cashFlowItems: prev.cashFlowItems.map(i => i.id === id ? { ...i, status: i.status === 'pending' ? 'realized' : 'pending' } : i) }))} />;
      case 'budget': return <Budget state={state} onUpdateBudget={(b) => setState(prev => { const idx = prev.budgets.findIndex(x => x.month === b.month); const next = [...prev.budgets]; if (idx >= 0) next[idx] = b; else next.push(b); return { ...prev, budgets: next }; })} />;
      case 'partners': return <Partners state={state} onAddPartner={(p) => setState(prev => ({ ...prev, partners: [...prev.partners, { ...p, id: crypto.randomUUID() }] }))} onDeletePartner={(id) => setState(prev => ({ ...prev, partners: prev.partners.filter(p => p.id !== id) }))} onAddMovement={(m) => setState(prev => ({ ...prev, partnerMovements: [...prev.partnerMovements, { ...m, id: crypto.randomUUID() }] }))} />;
      case 'taxes': return <Taxes state={state} onAddObligation={(o) => setState(prev => ({ ...prev, taxObligations: [...prev.taxObligations, { ...o, id: crypto.randomUUID() }] }))} onUpdateObligation={(id, up) => setState(prev => ({ ...prev, taxObligations: prev.taxObligations.map(x => x.id === id ? { ...x, ...up } : x) }))} onAddEntry={addEntry} />;
      case 'inventory': return (
        <Inventory 
          state={state} 
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onAddMovement={addMovement}
        />
      );
      case 'reports': return <Reports entries={state.entries} language={Language.ES} />;
      case 'education': return <Education language={Language.ES} />;
      case 'settings': return (
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold neon-glow tracking-tighter uppercase italic">Ajustes</h1>
          <div className="glass p-8 rounded-[2rem] shadow-2xl space-y-8 border border-primary-500/20">
             <button onClick={resetData} className="w-full flex items-center justify-center gap-3 text-rose-500 hover:bg-rose-500/10 p-5 rounded-2xl transition-all font-black uppercase tracking-widest border border-rose-500/20">
               <Trash2 size={20} /> Reiniciar Datos
             </button>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'journal', label: 'Diario', icon: BookOpen },
    { id: 'cashFlow', label: 'Caja', icon: TrendingUp },
    { id: 'budget', label: 'Presupuesto', icon: Target },
    { id: 'partners', label: 'Contactos', icon: Users },
    { id: 'taxes', label: 'Impuestos', icon: Receipt },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'reports', label: 'Reportes', icon: PieChart },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <header className="md:hidden flex items-center justify-between p-4 bg-[#1A1625] border-b border-primary-500/20 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/30">G</div>
          <span className="font-black text-lg tracking-tight neon-glow">Global Finances</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 text-primary-500">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#1A1625] border-r border-primary-500/20 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-4 p-8">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary-500/30">G</div>
            <span className="font-black text-2xl tracking-tighter neon-glow">Global Finances</span>
          </div>
          
          <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-primary-500/10 text-primary-400 font-black border-l-4 border-accent-pink shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-4 border-transparent'}`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-primary-500' : ''} />
                <span className="uppercase text-[10px] tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5">
            <button onClick={() => setIsEntryModalOpen(true)} className="w-full flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-700 text-white font-black py-4 px-6 rounded-2xl shadow-2xl shadow-primary-500/20 transition-all transform active:scale-95 uppercase text-xs tracking-[0.2em]">
              <PlusCircle size={20} /> Nuevo Asiento
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-cyber-bg">
        <div className="max-w-6xl mx-auto pb-24 md:pb-8">{renderContent()}</div>
      </main>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button onClick={() => setIsScannerOpen(true)} className="w-14 h-14 bg-cyber-card border border-primary-500/30 rounded-full flex items-center justify-center shadow-2xl text-primary-400 hover:bg-primary-900 transition-all active:scale-90" title="Escanear">
          <ScanLine size={28} />
        </button>
        <button onClick={() => setIsChatOpen(true)} className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:bg-primary-600 transition-all transform hover:scale-105 active:scale-90 border-2 border-primary-300/20" title="Asistente">
          <MessageSquare size={32} />
        </button>
      </div>

      {isEntryModalOpen && <EntryForm onClose={() => setIsEntryModalOpen(false)} onSubmit={addEntry} language={Language.ES} />}
      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} language={Language.ES} />}
      {isScannerOpen && <ImageAnalyzer onClose={() => setIsScannerOpen(false)} onResult={(res) => { if(Array.isArray(res)) setState(prev => ({ ...prev, entries: [...prev.entries, ...res.map(r => ({ ...r, id: crypto.randomUUID() }))] })); setActiveTab('journal'); }} language={Language.ES} />}
    </div>
  );
};

export default App;
