
import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, LayoutGrid, Shield, Palette, ArrowRight, Zap, Globe, Share2, Twitter, Github, Linkedin, Heart, Mail, Play, Smartphone, Lock, CheckCircle2, MousePointer2 } from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Restored Iconic Font for Header
const HeaderLogoText = () => (
  <div className="relative group flex flex-col items-center justify-center">
      <span 
        className="text-4xl text-white drop-shadow-md text-glow cursor-pointer group-hover:text-emerald-300 transition-colors duration-300 relative z-10 pt-1" 
        style={{ fontFamily: "'Grand Hotel', cursive" }}
      >
        Bloxm
      </span>
      <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-emerald-400/80 blur-[1px] transition-all duration-500 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
  </div>
);

const WordRotator: React.FC = () => {
    const words = ["Soul.", "Hub.", "Brain.", "Space.", "Vibe."];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Increased line-height and padding to prevent clipping of ascenders/descenders
    return (
        <span className="relative inline-flex flex-col h-[1.3em] overflow-hidden align-bottom ml-2 md:ml-3 leading-none pb-1">
             {words.map((word, i) => (
                 <span 
                    key={word} 
                    className={`absolute top-0 left-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                        i === index 
                            ? "transform translate-y-0 opacity-100 blur-0 scale-100" 
                            : i === (index - 1 + words.length) % words.length 
                                ? "transform -translate-y-[120%] opacity-0 blur-sm scale-95"
                                : "transform translate-y-[120%] opacity-0 blur-sm scale-95"
                    } text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white whitespace-nowrap px-1 py-1`}
                 >
                    {word}
                 </span>
             ))}
             {/* Dynamic spacer to allow layout to breathe naturally without hard jumps */}
             <span className="opacity-0 pointer-events-none px-1 py-1 select-none">{words[index]}</span> 
        </span>
    );
};

const SpotlightCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.06), transparent 40%)`,
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax & Tilt Logic using RAF for 60fps performance
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
         if (blob1Ref.current && blob2Ref.current) {
            const x = (e.clientX / window.innerWidth) * 20;
            const y = (e.clientY / window.innerHeight) * 20;
            blob1Ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            blob2Ref.current.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
         }

         if (heroRef.current) {
            const { left, top, width, height } = heroRef.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            
            // Subtle rotation, clamped to prevent extreme angles
            const rotateX = Math.max(-8, Math.min(8, (mouseY / height) * -4)); 
            const rotateY = Math.max(-8, Math.min(8, (mouseX / width) * 4));

            heroRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
         }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-100 font-sans">
      
      {/* Background Elements */}
      <div ref={blob1Ref} className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none will-change-transform mix-blend-screen" />
      <div ref={blob2Ref} className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none will-change-transform mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Navigation */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center bg-transparent">
        <div 
            className="flex items-center gap-3 group cursor-pointer select-none"
            onClick={onLogin}
        >
          <div className="w-9 h-9 relative transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
             <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
             <Logo />
          </div>
          <HeaderLogoText />
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onLogin}
            className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
          >
            Start Building
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          
          {/* Hero Copy */}
          <div className="flex-1 text-center md:text-left animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-forwards">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-8 shadow-sm backdrop-blur-md">
              <Zap className="w-3 h-3 fill-current" />
              <span>v2.0 Now Live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] text-white">
              Your Digital <br className="hidden md:block"/>
              <WordRotator />
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
              The intelligent personal hub builder. Drag, drop, and liquefy your online presence with AI-powered design and privacy-first vaults.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onGetStarted}
                className="group relative px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 transition-opacity" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-spring" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Claim Your Corner <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={onLogin}
                className="px-8 py-4 rounded-2xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-zinc-400 text-zinc-400 group-hover:text-white group-hover:fill-white transition-colors" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center md:justify-start gap-8">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#09090b] bg-zinc-800 overflow-hidden relative z-0 hover:z-10 transition-all hover:scale-110">
                       <img src={`https://picsum.photos/seed/${i + 50}/100/100`} alt="User" className="w-full h-full object-cover opacity-90" />
                    </div>
                  ))}
               </div>
               <div className="text-xs font-medium text-zinc-500">
                  <span className="text-white font-bold">10,000+</span> creators joined
               </div>
            </div>
          </div>

          {/* Hero Visual - 3D Tilt */}
          <div className="flex-1 w-full perspective-[2000px] relative hidden md:block">
             <div 
                ref={heroRef}
                className="relative w-full aspect-square transition-transform duration-100 ease-out preserve-3d"
             >
                {/* Back Glow */}
                <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full -z-10 animate-pulse-slow" />

                {/* Main Card */}
                <div className="absolute inset-0 glass-panel rounded-[2.5rem] border border-white/10 bg-[#09090b]/60 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-6">
                    {/* Header Mockup */}
                    <div className="flex justify-between items-center opacity-80">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                          <div className="w-3 h-3 rounded-full bg-green-500/50" />
                       </div>
                       <div className="h-2 w-20 bg-white/10 rounded-full" />
                    </div>

                    {/* Content Grid Mockup */}
                    <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full">
                       {/* Profile */}
                       <div className="row-span-2 bg-gradient-to-br from-zinc-800 to-black rounded-3xl border border-white/5 p-6 relative overflow-hidden group">
                           <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 mb-4 border border-emerald-500/30 group-hover:scale-105 transition-transform" />
                           <div className="space-y-2">
                              <div className="h-4 w-3/4 bg-white/20 rounded-md" />
                              <div className="h-3 w-1/2 bg-white/10 rounded-md" />
                           </div>
                           <div className="absolute bottom-4 right-4 p-2 bg-white/10 rounded-full backdrop-blur-md">
                              <Globe className="w-4 h-4 text-white" />
                           </div>
                       </div>
                       
                       {/* Stat Card */}
                       <div className="bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden group">
                          <Twitter className="w-8 h-8 text-[#1DA1F2] group-hover:scale-110 transition-transform" />
                       </div>

                       {/* Image Card */}
                       <div className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-50" />
                          <Sparkles className="w-8 h-8 text-purple-400 absolute bottom-4 right-4 group-hover:rotate-12 transition-transform" />
                       </div>

                       {/* Wide Card */}
                       <div className="col-span-2 bg-zinc-900/80 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                <Shield className="w-5 h-5 text-orange-400" />
                             </div>
                             <div>
                                <div className="h-3 w-24 bg-white/20 rounded mb-1" />
                                <div className="h-2 w-16 bg-white/10 rounded" />
                             </div>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-zinc-400 uppercase font-bold">Locked</div>
                       </div>
                    </div>
                </div>

                {/* Floating Elements (Parallax Layers) */}
                <div className="absolute -right-8 top-12 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl translate-z-[50px] animate-float">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">AI Generated</div>
                          <div className="text-sm font-bold text-white">Cyberpunk Theme</div>
                      </div>
                   </div>
                </div>

                <div className="absolute -left-12 bottom-24 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl translate-z-[80px] animate-float-delayed">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Secure Vault</div>
                          <div className="text-sm font-bold text-white">Private Files</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Marquee (Replaces Static Logos) */}
      <div className="py-10 border-y border-white/5 bg-black/40 backdrop-blur-md overflow-hidden relative">
         <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
         <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />
         
         <div className="flex animate-marquee w-max">
             {[...Array(2)].map((_, groupIndex) => (
                 <div key={groupIndex} className="flex gap-16 md:gap-24 px-8 md:px-12">
                     {[
                        { icon: Sparkles, label: "AI Powered" },
                        { icon: Shield, label: "Secure Vaults" },
                        { icon: LayoutGrid, label: "Bento Grid" },
                        { icon: Palette, label: "Custom Themes" },
                        { icon: Smartphone, label: "Fully Responsive" },
                        { icon: Zap, label: "Lightning Fast" },
                        { icon: Lock, label: "Encrypted" },
                        { icon: Globe, label: "Custom Domain" },
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-300 group cursor-default">
                           <item.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                           <span className="text-lg md:text-xl font-bold text-white tracking-tight whitespace-nowrap">{item.label}</span>
                        </div>
                     ))}
                 </div>
             ))}
         </div>
      </div>

      {/* Features - Bento Grid Style */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-[#09090b]/50 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the <span className="text-emerald-400">future</span>.</h2>
               <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Every pixel is engineered to help you tell your story. Powerful enough for developers, simple enough for everyone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
               
               {/* AI Magic - Large */}
               <SpotlightCard className="md:col-span-2 row-span-2 glass-panel rounded-[2.5rem] border border-white/10 p-10 flex flex-col justify-between group bg-[#0c0c0e]">
                  <div className="space-y-4 relative z-10">
                     <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-7 h-7 text-purple-400" />
                     </div>
                     <h3 className="text-3xl font-bold text-white">AI Magic Build</h3>
                     <p className="text-zinc-400 leading-relaxed text-lg max-w-sm">
                        Prompt your dream site in plain English. Our AI generates layout, copy, and visuals instantly.
                     </p>
                  </div>
                  <div className="relative mt-8 h-48 bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden group-hover:border-purple-500/30 transition-colors">
                      <div className="absolute inset-4 bg-zinc-800 rounded-xl animate-pulse">
                         <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
                      </div>
                      {/* Terminal UI Mockup */}
                      <div className="absolute top-8 left-8 right-8 bottom-0 bg-[#1e1e20] rounded-t-xl p-4 font-mono text-xs text-zinc-400 shadow-2xl translate-y-2 group-hover:translate-y-0 transition-transform">
                          <div className="flex gap-1.5 mb-3">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                             <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                          </div>
                          <p><span className="text-emerald-400">➜</span> generate "Cyberpunk Portfolio"</p>
                          <p className="text-zinc-500 mt-1">Generating layout...</p>
                          <p className="text-zinc-500">Optimizing images...</p>
                          <p className="text-white mt-1">Done! (0.4s)</p>
                      </div>
                  </div>
               </SpotlightCard>

               {/* Vault - Tall */}
               <SpotlightCard className="md:col-span-1 row-span-2 glass-panel rounded-[2.5rem] border border-white/10 p-8 flex flex-col relative group overflow-hidden bg-[#0c0c0e]">
                  <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6 relative z-10">
                     <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Private Vaults</h3>
                  <p className="text-zinc-400 text-sm mb-8 relative z-10">Password-protect folders for sensitive links, notes, and files.</p>
                  
                  <div className="flex-1 relative flex items-center justify-center">
                      <div className="relative w-40 h-40">
                         {/* Animated Lock Ring */}
                         <div className="absolute inset-0 border-2 border-dashed border-red-500/30 rounded-full animate-spin-slow" />
                         <div className="absolute inset-4 bg-red-500/10 rounded-full blur-xl animate-pulse" />
                         <div className="absolute inset-0 flex items-center justify-center">
                             <Lock className="w-12 h-12 text-red-400" />
                         </div>
                      </div>
                  </div>
               </SpotlightCard>

               {/* Themes - Standard */}
               <SpotlightCard className="glass-panel rounded-[2.5rem] border border-white/10 p-8 flex flex-col justify-between group bg-gradient-to-br from-[#18181b] to-black">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                     <Palette className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Infinite Themes</h3>
                    <p className="text-zinc-400 text-sm">Glassmorphism, gradients, or image backgrounds.</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                     <div className="w-6 h-6 rounded-full bg-emerald-500 border border-white/20" />
                     <div className="w-6 h-6 rounded-full bg-purple-500 border border-white/20" />
                     <div className="w-6 h-6 rounded-full bg-blue-500 border border-white/20" />
                     <div className="w-6 h-6 rounded-full bg-red-500 border border-white/20" />
                  </div>
               </SpotlightCard>

               {/* Responsive - Standard */}
               <SpotlightCard className="glass-panel rounded-[2.5rem] border border-white/10 p-8 flex flex-col justify-between group bg-[#0c0c0e]">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4">
                     <Smartphone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Mobile First</h3>
                    <p className="text-zinc-400 text-sm">Your hub liquefies perfectly to fit any screen size.</p>
                  </div>
               </SpotlightCard>

               {/* Bento Grid - Wide */}
               <SpotlightCard className="md:col-span-2 glass-panel rounded-[2.5rem] border border-white/10 p-8 flex items-center justify-between group relative overflow-hidden bg-[#0c0c0e]">
                  <div className="relative z-10 max-w-xs">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
                        <LayoutGrid className="w-6 h-6 text-emerald-400" />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop Grid</h3>
                     <p className="text-zinc-400 text-sm">Resize widgets. Rearrange flow. Total creative control.</p>
                  </div>
                  
                  {/* Grid Animation Mockup */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-zinc-900 to-transparent flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="grid grid-cols-2 gap-3 transform rotate-6 scale-90">
                         <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10" />
                         <div className="w-24 h-24 rounded-xl bg-emerald-500/20 border border-emerald-500/30 animate-pulse" />
                         <div className="col-span-2 h-16 rounded-xl bg-white/5 border border-white/10" />
                      </div>
                  </div>
               </SpotlightCard>

               {/* Analytics/More - Standard */}
               <SpotlightCard className="md:col-span-2 glass-panel rounded-[2.5rem] border border-white/10 p-8 flex flex-col justify-center items-center text-center group bg-gradient-to-r from-[#18181b] via-zinc-900 to-zinc-800">
                  <h3 className="text-3xl font-bold text-white mb-2">Ready to start?</h3>
                  <p className="text-zinc-400 mb-6">Join the waitlist for premium analytics and custom domains.</p>
                  <button onClick={onLogin} className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      Create Free Account
                  </button>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-900/10 radial-gradient-center" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                  Claim your <span className="text-emerald-400 italic">name</span> before it's gone.
              </h2>
              <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                  Bloxm is free for early adopters. Secure your unique URL and start building your digital legacy today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative group w-full max-w-xs">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button 
                        onClick={onGetStarted}
                        className="relative w-full px-8 py-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                      >
                        <Zap className="w-5 h-5 fill-black" />
                        Get Started Free
                      </button>
                  </div>
              </div>
              <p className="mt-6 text-sm text-zinc-500">No credit card required. Cancel anytime.</p>
          </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative bg-[#020202] border-t border-white/5 pt-24 pb-12 overflow-hidden z-20">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_80px_rgba(16,185,129,0.4)]" />
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center gap-3 mb-2 select-none">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                   <div className="w-6 h-6">
                       <Logo />
                   </div>
                </div>
                {/* Replaced with consistent header font style */}
                <HeaderLogoText />
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                The ultimate personal hub builder. Combine powerful bento grids, secure vaults, and AI-driven design to create your perfect corner of the internet.
              </p>
              
              <div className="flex items-center gap-3 pt-4">
                 {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                   <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-emerald-400 transition-all border border-white/5 hover:border-emerald-500/30 group">
                     <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                   </a>
                 ))}
              </div>
            </div>

            {/* Nav Columns */}
            <div className="md:col-span-2 space-y-6">
               <h4 className="text-white font-bold text-sm tracking-wider uppercase">Product</h4>
               <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                  {['Features', 'Templates', 'Showcase', 'Pricing', 'Changelog'].map(item => (
                    <li key={item}><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                       <span className="w-0 group-hover:w-2 h-px bg-emerald-500 transition-all" />
                       {item}
                    </a></li>
                  ))}
               </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
               <h4 className="text-white font-bold text-sm tracking-wider uppercase">Resources</h4>
               <ul className="space-y-4 text-sm text-zinc-500 font-medium">
                  {['Documentation', 'Community', 'Help Center', 'API Reference', 'Blog'].map(item => (
                    <li key={item}><a href="#" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                       <span className="w-0 group-hover:w-2 h-px bg-emerald-500 transition-all" />
                       {item}
                    </a></li>
                  ))}
               </ul>
            </div>

             <div className="md:col-span-3 space-y-6">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Newsletter</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Join 10,000+ creators building their digital legacy. No spam, just updates.
                </p>
                <div className="relative group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-30 group-focus-within:opacity-100 transition duration-500 blur"></div>
                   <div className="relative flex">
                        <input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="w-full bg-[#09090b] border border-white/10 rounded-l-xl py-3 pl-4 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                        />
                        <button className="bg-white hover:bg-zinc-200 text-black px-4 rounded-r-xl font-bold transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                   </div>
                </div>
             </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-zinc-500 font-medium">
                 <span>&copy; 2025 Bloxm Inc.</span>
                 <span className="hidden md:block w-1 h-1 bg-zinc-700 rounded-full" />
                 <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
                 <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
             </div>

             <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/10 transition-colors">
                <span>Crafted by</span>
                <a href="#" className="text-zinc-300 hover:text-white transition-colors font-bold flex items-center gap-1.5">
                   Tharunkumar <Heart className="w-3 h-3 text-red-500/60 fill-current animate-pulse" />
                </a>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
