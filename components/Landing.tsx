
import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  TrendingUp, 
  Package, 
  Bot,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#0F0D1E] text-slate-100 selection:bg-primary-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-pink/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-1 h-64 bg-gradient-to-b from-transparent via-primary-500/20 to-transparent blur-sm" />
      </div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/30 rotate-3">G</div>
          <span className="font-black text-xl tracking-tighter neon-glow italic uppercase">Global Finances</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary-400 transition-colors">Tecnología</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary-400 transition-colors">Seguridad</a>
          <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary-400 transition-colors">Educación</a>
        </div>
      </nav>

      <main className="relative z-10 pt-12 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Próxima Generación de Finanzas</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white italic">
              EL ADN DE TU <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-pink neon-glow">PATRIMONIO</span><br />
              BAJO TU CONTROL.
            </h1>
            
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-medium">
              Transforma la gestión de tu negocio o finanzas personales con contabilidad de nivel empresarial, inteligencia artificial y proyecciones en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStart}
                className="px-8 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 group"
              >
                Empezar Experiencia <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-white/5 bg-white/5">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0F0D1E]" />
                  <div className="w-8 h-8 rounded-full bg-primary-600 border-2 border-[#0F0D1E]" />
                  <div className="w-8 h-8 rounded-full bg-accent-pink border-2 border-[#0F0D1E]" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">+1k Usuarios Pro</span>
              </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative glass p-4 rounded-[3rem] border border-white/10 shadow-2xl rotate-2">
              <div className="bg-[#1A1625] rounded-[2.5rem] p-8 space-y-6">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Total</p>
                       <p className="text-4xl font-black text-white italic">$2,450,000.00</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500"><TrendingUp size={24} /></div>
                 </div>
                 <div className="space-y-3">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full w-[70%] bg-gradient-to-r from-primary-500 to-accent-pink" />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase">
                       <span>Presupuesto Consumido</span>
                       <span>70%</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-[8px] font-black text-slate-600 uppercase">Cash Flow (30d)</p>
                       <p className="text-lg font-black text-emerald-400">+$840k</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-[8px] font-black text-slate-600 uppercase">Impuestos AFIP</p>
                       <p className="text-lg font-black text-rose-500">$124k</p>
                    </div>
                 </div>
              </div>
            </div>
            {/* Float Badge */}
            <div className="absolute -bottom-6 -left-6 glass p-5 rounded-3xl border border-primary-500/30 animate-bounce duration-[3000ms]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center text-white"><Bot size={20} /></div>
                <div>
                  <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest">Cyber Advisor</p>
                  <p className="text-[11px] font-bold text-white">"Tu rentabilidad subió 15%"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 mt-48">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Todo lo que necesitas para <span className="text-primary-500">escalar</span>.</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Herramientas profesionales diseñadas para ser entendidas por humanos, no solo por contadores.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen size={24} />} 
              title="Libro Diario Pro" 
              desc="Contabilidad de partida doble real. Cada asiento cuenta una historia sobre tu crecimiento." 
            />
            <FeatureCard 
              icon={<TrendingUp size={24} />} 
              title="Cash Flow Predictivo" 
              desc="Mira el futuro de tus finanzas. Anticipa baches de liquidez y oportunidades de inversión." 
            />
            <FeatureCard 
              icon={<Bot size={24} />} 
              title="Cyber Advisor IA" 
              desc="Un asesor financiero que vive en tu bolsillo. Respuestas inmediatas sobre AFIP e impuestos." 
            />
            <FeatureCard 
              icon={<Package size={24} />} 
              title="Gestión de Stock" 
              desc="Control de inventario valorizado. No pierdas dinero por falta o exceso de mercadería." 
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} />} 
              title="Privacidad Total" 
              desc="Tus datos no están en la nube. Viven en tu dispositivo. Eres el único dueño de tu información." 
            />
            <FeatureCard 
              icon={<Zap size={24} />} 
              title="Escáner IA" 
              desc="Toma una foto a tus tickets o facturas y deja que la IA se encargue de registrarlos." 
            />
          </div>
        </div>

        {/* Social Proof / Motivation */}
        <div className="max-w-5xl mx-auto px-6 mt-48">
          <div className="glass p-12 rounded-[3rem] border border-primary-500/20 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6">¿Listo para dominar tus números?</h3>
            <p className="text-slate-400 font-medium mb-10 max-w-xl mx-auto italic">"La mayoría de las personas no logran el éxito financiero porque no miden lo que importa. Global Finances es el tablero de control de tu vida económica."</p>
            <button 
              onClick={onStart}
              className="px-12 py-6 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-primary-500 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Iniciar mi Nueva Vida Financiera
            </button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Global Finances • 2026 • Professional Financial OS</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-primary-500/30 transition-all group hover:-translate-y-2">
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary-500 mb-6 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-xl">
      {icon}
    </div>
    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-primary-400 transition-colors">{title}</h3>
    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">{desc}</p>
  </div>
);

export default Landing;
