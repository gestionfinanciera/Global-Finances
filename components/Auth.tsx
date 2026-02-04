
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2, Sparkles, Mail, Lock, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onAuthComplete: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        setIsLogin(true);
        setLoading(false);
        return;
      }
      onAuthComplete();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F0D1E] relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="orb w-96 h-96 bg-primary-900/20 -top-20 -left-20"></div>
      <div className="orb w-80 h-80 bg-accent-pink/10 -bottom-20 -right-20"></div>

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary-500 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary-500/30 mx-auto mb-6 rotate-3">G</div>
          <h1 className="text-4xl font-black neon-glow uppercase italic tracking-tighter">Global Finances</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Sistema de Gestión Financiera Cloud</p>
        </div>

        <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-8">
            <button 
              onClick={() => setIsLogin(true)} 
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isLogin ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => setIsLogin(false)} 
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!isLogin ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                <Mail size={12} /> Email
              </label>
              <input 
                required
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pl-1">
                <Lock size={12} /> Contraseña
              </label>
              <input 
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all shadow-inner"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase text-center animate-pulse">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black text-xs uppercase shadow-2xl shadow-primary-600/30 rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
              {isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-slate-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Conexión Segura Supabase</span>
          </div>
        </div>

        <p className="mt-8 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Global Finances • MMXXVI</p>
      </div>
    </div>
  );
};

export default Auth;
