
import React, { useRef, useEffect } from 'react';
import { Sparkles, LayoutGrid, Shield, Palette, ArrowRight, Zap, Globe, Share2 } from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!blob1Ref.current || !blob2Ref.current) return;
      const x = (e.clientX / window.innerWidth) * 20;
      const y = (e.clientY / window.innerHeight) * 20;

      blob1Ref.current.style.transform = `translate(${x}px, ${y}px)`;
      blob2Ref.current.style.transform = `translate(${-x}px, ${-y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-100">
      
      {/* Background Blobs */}
      <div ref={blob1Ref} className="absolute top-0 left-0 w-[80vw] h-[80vw] bg-emerald-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-1000 ease-out will-change-transform" />
      <div ref={blob2Ref} className="absolute bottom-0 right-0 w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none transition-transform duration-1000 ease-out will-change-transform" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            <Logo />
          </div>
          <span className="text-3xl font-normal text-white text-glow" style={{ fontFamily: "'Grand Hotel', cursive" }}>Bloxm</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="hidden md:block px-6 py-2.5 rounded-full text-zinc-300 hover:text-white font-medium transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2.5 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-32 flex flex-col md:flex-row items-center gap-12 md:gap-20">
        
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Zap className="w-3 h-3" />
            The Future of Personal Sites
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            Craft Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white drop-shadow-sm">Digital Soul.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
            The all-in-one bento grid builder. Drag, drop, and liquefy your online presence with AI-powered design and privacy-first vaults.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Claim Your Corner
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white font-bold text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5 text-zinc-400" />
              Explore Demos
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center md:justify-start gap-6 text-zinc-500 text-sm font-medium">
             <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Private Vaults</span>
             </div>
             <div className="w-1 h-1 bg-zinc-700 rounded-full" />
             <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Magic</span>
             </div>
             <div className="w-1 h-1 bg-zinc-700 rounded-full" />
             <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-400" />
                <span>Bento Layout</span>
             </div>
          </div>
        </div>

        {/* 3D Mockup */}
        <div className="flex-1 w-full relative perspective-[2000px] group hidden md:block">
           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 blur-[60px] rounded-full animate-pulse -z-10" />
           
           <div className="relative transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[2deg] transition-transform duration-700 ease-out preserve-3d">
              {/* Mock Browser Window */}
              <div className="glass-panel rounded-[2rem] border border-white/10 p-2 shadow-2xl bg-[#09090b]/80 backdrop-blur-xl">
                 <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 mb-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="ml-4 h-6 w-48 bg-white/5 rounded-full" />
                 </div>
                 
                 {/* Mock Grid */}
                 <div className="grid grid-cols-3 grid-rows-3 gap-4 p-4 aspect-square">
                    {/* Large Profile Block */}
                    <div className="col-span-2 row-span-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group/item">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full" />
                       <div className="w-16 h-16 rounded-full bg-zinc-700 border border-white/10 mb-4" />
                       <div>
                          <div className="h-8 w-3/4 bg-white/10 rounded-lg mb-2" />
                          <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                       </div>
                    </div>

                    {/* Map Block */}
                    <div className="col-span-1 row-span-1 bg-zinc-800/50 rounded-3xl border border-white/5 relative overflow-hidden">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent)]" />
                       <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.1 }} />
                    </div>

                    {/* Social Block */}
                    <div className="col-span-1 row-span-1 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 rounded-3xl flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#1DA1F2] opacity-80" />
                    </div>

                    {/* Text Block */}
                    <div className="col-span-2 row-span-1 bg-zinc-900 border border-white/5 rounded-3xl p-4 flex items-center gap-4">
                        <div className="flex-1 h-2 bg-white/10 rounded-full" />
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                    </div>
                    
                    {/* Image Block */}
                    <div className="col-span-1 row-span-1 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5" />
                    </div>
                 </div>
              </div>

              {/* Floating Elements for 3D Effect */}
              <div className="absolute -right-12 top-1/4 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl animate-float-delayed z-20 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-400 font-bold uppercase">AI Generated</div>
                        <div className="text-sm font-bold text-white">Cyberpunk Theme</div>
                    </div>
                 </div>
              </div>

               <div className="absolute -left-8 bottom-1/4 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl animate-float z-20 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-400 font-bold uppercase">Vault Locked</div>
                        <div className="text-sm font-bold text-white">Private Folder</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need.</h2>
              <p className="text-zinc-400">Curate your corner of the internet with powerful tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  {
                      icon: LayoutGrid,
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                      title: "Bento Grid System",
                      desc: "Drag, drop, and resize widgets in a fluid, responsive grid that feels alive."
                  },
                  {
                      icon: Sparkles,
                      color: "text-purple-400",
                      bg: "bg-purple-500/10",
                      title: "AI Magic Build",
                      desc: "Describe your vibe, and watch AI generate a layout, content, and theme instantly."
                  },
                  {
                      icon: Shield,
                      color: "text-red-400",
                      bg: "bg-red-500/10",
                      title: "Secure Vaults",
                      desc: "Create password-protected folders for your private links, notes, and files."
                  },
                  {
                      icon: Palette,
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                      title: "Infinite Themes",
                      desc: "Choose from glassmorphism, gradients, or image backgrounds with one click."
                  },
                  {
                      icon: Globe,
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                      title: "Custom Links",
                      desc: "Embed social posts, YouTube videos, and rich media directly on your grid."
                  },
                  {
                      icon: Share2,
                      color: "text-pink-400",
                      bg: "bg-pink-500/10",
                      title: "Easy Sharing",
                      desc: "Generate a unique link to share your curated hub with the world."
                  }
              ].map((feature, i) => (
                  <div key={i} className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 group">
                      <div className={`w-12 h-12 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-black/40 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 opacity-50">
                   <div className="w-6 h-6 grayscale">
                        <Logo />
                   </div>
                   <span className="font-bold text-sm">Bloxm &copy; 2024</span>
              </div>
              <div className="flex gap-6 text-sm text-zinc-500 font-medium">
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
              </div>
          </div>
      </footer>

    </div>
  );
};
