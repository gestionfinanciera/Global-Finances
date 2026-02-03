
import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Package, 
  Bot,
  Zap,
  Target,
  ScanLine
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#0F0D1E] text-slate-100 selection:bg-primary-500/30 overflow-x-hidden font-['Inter']">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-pink/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-1 h-64 bg-gradient-to-b from-transparent via-primary-500/20 to-transparent blur-sm" />
      </div>

      {/* Minimal Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/30 rotate-3 transition-transform hover:rotate-0">G</div>
          <span className="font-black text-xl tracking-tighter neon-glow italic uppercase">Global Finances</span>
        </div>
        <div>
          <button 
            onClick={onStart}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-500 hover:border-primary-400 transition-all active:scale-95"
          >
            Entrar al Sistema
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-12 pb-32">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Financial Operating System v4.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white italic">
              GESTIÓN SIN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-pink neon-glow">FRICCIÓN.</span><br />
              ÉXITO REAL.
            </h1>
            
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-medium">
              Toma el mando de tu futuro económico con herramientas contables de precisión, inteligencia artificial y una interfaz diseñada para la victoria.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStart}
                className="px-10 py-6 bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 group"
              >
                Comenzar ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative glass p-4 rounded-[3rem] border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <div className="bg-[#1A1625] rounded-[2.5rem] p-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Patrimonio Neto Estimado</p>
                       <p className="text-5xl font-black text-white italic tracking-tighter">$4,210,000.00</p>
                    </div>
                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/20"><TrendingUp size={28} /></div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Liquidez Inmediata</p>
                       <p className="text-2xl font-black text-emerald-400">$1.8M</p>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                       </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Pasivos Corrientes</p>
                       <p className="text-2xl font-black text-rose-500">$540k</p>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[25%] bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Análisis en tiempo real activo</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Float Badge AI */}
            <div className="absolute -bottom-8 -left-8 glass p-6 rounded-[2rem] border border-primary-500/30 animate-bounce duration-[4000ms] shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20"><Bot size={24} /></div>
                <div>
                  <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em]">Cyber Advisor</p>
                  <p className="text-xs font-bold text-white">"Detecté un excedente para inversión"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-48">
          <div className="text-center space-y-6 mb-24">
             <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
                POTENCIA <span className="text-primary-500">INDUSTRIAL</span><br />
                EN TUS MANOS.
             </h2>
             <p className="text-slate-500 font-medium max-w-xl mx-auto">Diseñado para quienes no se conforman con lo básico. Control total sin complicaciones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<BookOpen size={24} />} 
              title="Libro Diario Pro" 
              desc="Contabilidad profesional de partida doble. Precisión absoluta en cada asiento." 
            />
            <FeatureCard 
              icon={<TrendingUp size={24} />} 
              title="Cash Flow Predictivo" 
              desc="Anticipa tus necesidades de caja con proyecciones dinámicas de 60 días." 
            />
            <FeatureCard 
              icon={<Bot size={24} />} 
              title="Asesoría con IA" 
              desc="Consultas ilimitadas con nuestra IA especializada en finanzas e impuestos." 
            />
            <FeatureCard 
              icon={<Package size={24} />} 
              title="Control de Inventario" 
              desc="Gestiona productos, stock y valorización de mercadería en tiempo real." 
            />
            <FeatureCard 
              icon={<ScanLine size={24} />} 
              title="Escáner Inteligente" 
              desc="Convierte tickets y facturas físicas en asientos digitales automáticamente." 
            />
            <FeatureCard 
              icon={<Target size={24} />} 
              title="Gestión de Presupuestos" 
              desc="Establece metas de gasto y recibe alertas preventivas antes de desviarte." 
            />
          </div>
        </div>

        {/* Motivational Call to Action */}
        <div className="max-w-5xl mx-auto px-6 mt-48">
          <div className="glass p-16 rounded-[4rem] border border-primary-500/20 relative overflow-hidden text-center bg-gradient-to-br from-primary-900/20 to-transparent">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent shadow-[0_0_20px_#A855F7]" />
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8 leading-tight">
              ¿ESTÁS LISTO PARA EL<br />
              <span className="text-primary-500">SIGUIENTE NIVEL?</span>
            </h3>
            <p className="text-slate-400 font-medium mb-14 max-w-xl mx-auto italic text-lg leading-relaxed">
              "La claridad financiera no es un lujo, es una ventaja competitiva. Global Finances es la herramienta que te permitirá ver lo que otros ignoran."
            </p>
            <button 
              onClick={onStart}
              className="px-20 py-8 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] hover:bg-primary-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-6 mx-auto group"
            >
              Iniciar Experiencia <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      <footer className="py-16 border-t border-white/5 text-center bg-black/20">
        <div className="flex justify-center gap-10 mb-8">
          <a href="#" className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-primary-500 transition-colors">Términos</a>
          <a href="#" className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-primary-500 transition-colors">Privacidad</a>
          <a href="#" className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-primary-500 transition-colors">Soporte Pro</a>
        </div>
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em]">Global Finances • MMXXVI • NEXT-GEN FINANCIAL OS</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="glass p-10 rounded-[3rem] border border-white/5 hover:border-primary-500/40 transition-all group hover:-translate-y-3 bg-[#1A1625]/40 shadow-xl">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary-500 mb-8 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-xl group-hover:shadow-primary-500/20">
      {icon}
    </div>
    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-primary-400 transition-colors">{title}</h3>
    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">{desc}</p>
  </div>
);

export default Landing;
