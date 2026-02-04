
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, PieChart, GraduationCap, Settings, 
  PlusCircle, MessageSquare, ScanLine, TrendingUp, Target, 
  Users, Receipt, Package, Briefcase, LogOut, Loader2, AlertCircle
} from 'lucide-react';
import { AppState, Language, JournalEntry, Partner, Project, TaxConfig } from './types';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import CashFlow from './components/CashFlow';
import Budget from './components/Budget';
import Partners from './components/Partners';
import Projects from './components/Projects';
import Taxes from './components/Taxes';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Education from './components/Education';
import EntryForm from './components/EntryForm';
import ChatBot from './components/ChatBot';
import ImageAnalyzer from './components/ImageAnalyzer';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const INITIAL_TAX_CONFIGS: TaxConfig[] = [
  { id: 'tax_iva', name: 'IVA', fullName: 'Impuesto al Valor Agregado', category: 'national', frequency: 'monthly', defaultRate: 21, dueDateDay: 11 },
  { id: 'tax_iibb', name: 'IIBB', fullName: 'Ingresos Brutos', category: 'provincial', frequency: 'monthly', defaultRate: 3.5, dueDateDay: 18 },
  { id: 'tax_gan', name: 'Ganancias', fullName: 'Impuesto a las Ganancias', category: 'national', frequency: 'monthly', defaultRate: 0, dueDateDay: 20 },
];

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [state, setState] = useState<AppState>({
    entries: [], cashFlowItems: [], budgets: [], partners: [], projects: [],
    partnerMovements: [], taxConfigs: INITIAL_TAX_CONFIGS, taxObligations: [],
    products: [], stockMovements: [], language: Language.ES, theme: 'dark', isOnboarded: false
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    // Escuchar cambios de autenticación en Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sincronizar datos con Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: entries } = await supabase.from('entries').select('*');
      const { data: partners } = await supabase.from('partners').select('*');
      const { data: projects } = await supabase.from('projects').select('*');

      setState(prev => ({
        ...prev,
        entries: entries || [],
        partners: partners || [],
        projects: projects || []
      }));
    };

    fetchData();

    // Suscripción en tiempo real opcional (por brevedad usamos fetch simple aquí)
  }, [user]);

  const addEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const { data, error } = await supabase.from('entries').insert([{ ...entry, user_id: user.id }]).select();
    if (!error && data) {
      setState(prev => ({ ...prev, entries: [...prev.entries, data[0] as JournalEntry] }));
      setIsEntryModalOpen(false);
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
    }
  };

  const addPartner = async (p: Omit<Partner, 'id'>) => {
    const { data, error } = await supabase.from('partners').insert([{ ...p, user_id: user.id }]).select();
    if (!error && data) {
      setState(prev => ({ ...prev, partners: [...prev.partners, data[0] as Partner] }));
    }
  };

  const deletePartner = async (id: string) => {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, partners: prev.partners.filter(p => p.id !== id) }));
    }
  };

  const addProject = async (proj: Omit<Project, 'id'>) => {
    const { data, error } = await supabase.from('projects').insert([{ ...proj, user_id: user.id }]).select();
    if (!error && data) {
      setState(prev => ({ ...prev, projects: [...prev.projects, data[0] as Project] }));
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0F0D1E] flex flex-col items-center justify-center gap-4">
        <Loader2 size={48} className="text-primary-500 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Supabase Cloud Loading</span>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthComplete={() => {}} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onAddClick={() => setIsEntryModalOpen(true)} />;
      case 'journal': return <Journal entries={state.entries} onDelete={deleteEntry} onReset={() => {}} language={Language.ES} />;
      case 'cashFlow': return <CashFlow state={state} onAddItem={() => {}} onDeleteItem={() => {}} onToggleStatus={() => {}} />;
      case 'partners': return <Partners state={state} onAddPartner={addPartner} onDeletePartner={deletePartner} onAddMovement={() => {}} />;
      case 'projects': return <Projects state={state} onAddProject={addProject} onDeleteProject={deleteProject} />;
      case 'reports': return <Reports entries={state.entries} language={Language.ES} />;
      case 'education': return <Education language={Language.ES} />;
      case 'settings': return (
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold neon-glow tracking-tighter uppercase italic text-center">Perfil Supabase</h1>
          <div className="glass p-8 rounded-[2.5rem] text-center border border-primary-500/20">
             <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-4">{user.email?.charAt(0).toUpperCase()}</div>
             <p className="text-slate-400 font-bold mb-8 italic">{user.email}</p>
             <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center justify-center gap-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 p-5 rounded-2xl transition-all font-black uppercase tracking-widest border border-rose-500/20">
               <LogOut size={20} /> Desconectar de Supabase
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
    { id: 'partners', label: 'Contactos', icon: Users },
    { id: 'projects', label: 'Proyectos', icon: Briefcase },
    { id: 'reports', label: 'Reportes', icon: PieChart },
    { id: 'education', label: 'Educación', icon: GraduationCap },
    { id: 'settings', label: 'Perfil', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <aside className="w-72 bg-[#1A1625] border-r border-primary-500/20 hidden md:flex flex-col">
          <div className="flex items-center gap-4 p-8">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl">G</div>
            <span className="font-black text-xl tracking-tighter neon-glow uppercase italic">Global Finances</span>
          </div>
          <nav className="flex-1 px-6 py-4 space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-primary-500/10 text-primary-400 font-black' : 'text-slate-500 hover:bg-white/5'}`}>
                <item.icon size={20} />
                <span className="uppercase text-[10px] tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-cyber-bg">
        <div className="max-w-6xl mx-auto p-4 md:p-8">{renderContent()}</div>
      </main>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button onClick={() => setIsScannerOpen(true)} className="w-14 h-14 bg-cyber-card border border-primary-500/30 rounded-full flex items-center justify-center shadow-2xl text-primary-400 hover:bg-primary-900 transition-all"><ScanLine size={24} /></button>
        <button onClick={() => setIsChatOpen(true)} className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all"><MessageSquare size={28} /></button>
      </div>

      {isEntryModalOpen && <EntryForm onClose={() => setIsEntryModalOpen(false)} onSubmit={addEntry} language={Language.ES} />}
      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} language={Language.ES} />}
      {isScannerOpen && <ImageAnalyzer onClose={() => setIsScannerOpen(false)} onResult={(res) => { if(Array.isArray(res)) res.forEach(addEntry); setActiveTab('journal'); }} language={Language.ES} />}
    </div>
  );
};

export default App;
