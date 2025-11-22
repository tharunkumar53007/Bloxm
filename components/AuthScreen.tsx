import React, { useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Logo } from './Logo';

interface AuthScreenProps {
  onLogin: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay for realism
    setTimeout(() => {
      onLogin(email);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient Liquid Background - Aesthetic Green */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-600/20 rounded-full blur-[120px] animate-float mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-teal-600/15 rounded-full blur-[120px] animate-float-delayed mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 mb-6 filter drop-shadow-[0_0_25px_rgba(52,211,153,0.4)] animate-heartbeat">
             <Logo />
          </div>
          <h1 className="text-5xl text-white mb-2 text-glow" style={{ fontFamily: "'Grand Hotel', cursive" }}>Bloxm</h1>
          <p className="text-zinc-300 text-sm font-medium tracking-wide">Enter your aesthetic workspace.</p>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden backdrop-blur-2xl">
          {/* Inner Gloss Reflection */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-70" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Email Access</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-300 transition-colors duration-300" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:bg-zinc-900/80 focus:border-emerald-500/50 transition-all shadow-inner relative z-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Passkey</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-300 transition-colors duration-300" />
                <input 
                  type="password" 
                  required
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:bg-zinc-900/80 focus:border-emerald-500/50 transition-all shadow-inner relative z-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] border border-emerald-400/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Enter Hub'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-xs font-medium">
              By entering, you agree to our <span className="underline cursor-pointer hover:text-emerald-300 transition-colors">Terms</span> & <span className="underline cursor-pointer hover:text-emerald-300 transition-colors">Privacy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};