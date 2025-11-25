
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Lock, Mail, AlertCircle, Loader2, User, KeyRound, UserCircle2, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';
import { signInWithGoogle, logInWithEmailAndPassword, registerWithEmailAndPassword, loginAsGuest } from '../services/firebase';

interface AuthScreenProps {
  onLogin?: (email: string) => void; 
  onBypassLogin?: () => void;
  onBack?: () => void;
}

// Simple Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBypassLogin, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP State
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for parallax
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!blob1Ref.current || !blob2Ref.current || !blob3Ref.current) return;
        
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Normalized coordinates (-1 to 1)
        const x = (clientX - centerX) / centerX;
        const y = (clientY - centerY) / centerY;
        
        // Physics-based Parallax Offsets
        const xOffset1 = x * -30;
        const yOffset1 = y * -30;
        
        const xOffset2 = x * 50;
        const yOffset2 = y * 50;
        
        const xOffset3 = x * 80;
        const yOffset3 = y * 80;

        blob1Ref.current.style.transform = `translate3d(${xOffset1}px, ${yOffset1}px, 0)`;
        blob2Ref.current.style.transform = `translate3d(${xOffset2}px, ${yOffset2}px, 0)`;
        blob3Ref.current.style.transform = `translate3d(${xOffset3}px, ${yOffset3}px, 0)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuthError = (err: any) => {
      let msg = "An unexpected error occurred.";
      
      // Safety check for null/undefined
      if (!err) {
          setError(msg);
          return;
      }

      // 1. Attempt to extract string message
      if (typeof err === 'string') {
          msg = err;
      } else if (err.code && typeof err.code === 'string') {
          // Firebase specific codes
          switch (err.code) {
              case 'auth/email-already-in-use': msg = "Email already registered."; break;
              case 'auth/invalid-credential': msg = "Invalid email or password."; break;
              case 'auth/wrong-password': msg = "Invalid password."; break;
              case 'auth/user-not-found': msg = "User not found."; break;
              case 'auth/weak-password': msg = "Password must be 6+ chars."; break;
              case 'auth/unauthorized-domain': msg = "Domain not authorized in Firebase Console."; break;
              case 'auth/popup-closed-by-user': msg = "Sign-in cancelled."; break;
              case 'auth/network-request-failed': msg = "Network error. Check connection."; break;
              case 'auth/too-many-requests': msg = "Too many attempts. Please wait."; break;
              case 'auth/operation-not-allowed': msg = "Login method not enabled."; break;
              case 'auth/admin-restricted-operation': msg = "Guest login restricted. Try Google."; break;
              default: msg = `Error (${err.code})`;
          }
      } else if (err.message) {
          // Handle Error object or similar structure
          if (typeof err.message === 'string') {
              msg = err.message;
          } else {
              msg = "Error occurred.";
          }
      } else {
          // Fallback for other objects
          try {
              const s = JSON.stringify(err);
              if (s !== '{}') msg = "Error: " + s.slice(0, 100);
          } catch { /* ignore */ }
      }

      // 2. Final clean up of unwanted patterns (e.g. [object Object])
      if (typeof msg !== 'string') {
         msg = "An error occurred.";
      }
      
      if (msg.includes('[object Object]')) {
          msg = msg.replace(/\[object Object\]/g, "Unknown Error");
      }

      if (msg.trim() === '') {
          msg = "An unexpected error occurred.";
      }
      
      setError(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Registration Flow
    if (isRegistering) {
        // Step 1: Initial Validation & Send OTP
        if (!showOtpStep) {
            if (!username.trim()) { setError("Username is required"); return; }
            if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
            if (password !== confirmPassword) { setError("Passwords do not match"); return; }

            setLoading(true);
            // Simulate sending OTP
            setTimeout(() => {
                setLoading(false);
                setShowOtpStep(true);
            }, 1000);
            return;
        }

        // Step 2: Verify OTP & Create Account
        if (showOtpStep) {
            if (otp !== '123456') { // Mock validation
                setError("Invalid verification code. (Try 123456)");
                return;
            }
        }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmailAndPassword(username, email, password);
      } else {
        await logInWithEmailAndPassword(email, password);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
       // Only ignore specific "cancelled" errors, but handle others
       if (err.code !== 'auth/popup-closed-by-user') {
          handleAuthError(err);
       }
    }
  };

  const handleGuestLogin = async () => {
      setError(null);
      setLoading(true);
      try {
          // Attempt Firebase Anonymous Auth first
          await loginAsGuest();
      } catch (err: any) {
          // If Firebase fails (e.g. auth/admin-restricted-operation or unauthorized domain),
          // Fallback to local guest mode so the user can still use the app.
          console.warn("Firebase Anonymous Auth failed, using offline fallback.", err);
          
          if (onBypassLogin) {
              onBypassLogin();
          } else {
              handleAuthError(err); // Show the specific error if fallback isn't available
          }
      } finally {
          setLoading(false);
      }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError(null);
      setShowOtpStep(false);
      setOtp('');
      if (!isRegistering) {
          // Switching TO Register
          setPassword('');
          setConfirmPassword('');
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Physics Based Parallax Layers */}
      <div 
        ref={blob1Ref}
        className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] pointer-events-none transition-transform duration-[2000ms] will-change-transform ease-out"
        style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
         <div className="w-full h-full bg-emerald-600/20 rounded-full blur-[120px] animate-float mix-blend-screen opacity-60" />
      </div>

      <div 
        ref={blob2Ref}
        className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] pointer-events-none transition-transform duration-[1500ms] will-change-transform ease-out"
        style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
         <div className="w-full h-full bg-teal-600/15 rounded-full blur-[120px] animate-float-delayed mix-blend-screen opacity-50" />
      </div>

       <div 
        ref={blob3Ref}
        className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] pointer-events-none transition-transform duration-[1000ms] will-change-transform ease-out"
        style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
         <div className="w-full h-full bg-indigo-500/10 rounded-full blur-[100px] animate-pulse mix-blend-screen opacity-40" />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md z-10 animate-in zoom-in-95 duration-500 relative">
        
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute -top-12 left-0 text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </button>
        )}

        <div className="mb-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 mb-6 filter drop-shadow-[0_0_25px_rgba(52,211,153,0.4)] animate-heartbeat">
             <Logo />
          </div>
          <h1 className="text-5xl text-white mb-2 text-glow" style={{ fontFamily: "'Grand Hotel', cursive" }}>Bloxm</h1>
          <p className="text-zinc-300 text-sm font-medium tracking-wide">
            {showOtpStep ? "Check your email for the code." : (isRegistering ? "Create your aesthetic workspace." : "Enter your aesthetic workspace.")}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden backdrop-blur-2xl">
          {/* Inner Gloss Reflection */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-70" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-2xl mb-6 flex items-start gap-3 animate-in slide-in-from-top-2 select-text shadow-inner">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span className="font-bold text-sm leading-relaxed">{error}</span>
            </div>
          )}

          <div className="relative z-10 space-y-4">
            
            {/* Main Buttons (Hidden if in OTP mode) */}
            {!showOtpStep && (
                <>
                    <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white text-black font-semibold py-3.5 rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01]"
                    >
                    <GoogleIcon />
                    <span>Continue with Google</span>
                    </button>

                    <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full bg-zinc-800/50 border border-white/5 text-zinc-300 font-semibold py-3.5 rounded-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                    >
                    <UserCircle2 className="w-5 h-5" />
                    <span>Continue as Guest</span>
                    </button>

                    <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-xs text-zinc-500 font-medium">OR</span>
                    <div className="flex-grow border-t border-white/10"></div>
                    </div>
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* OTP Input View */}
              {showOtpStep ? (
                  <div className="animate-in slide-in-from-right duration-300">
                       <div className="text-center mb-6">
                           <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                               <Mail className="w-8 h-8 text-emerald-400" />
                           </div>
                           <h3 className="text-white font-bold text-lg">Verify Email</h3>
                           <p className="text-zinc-400 text-xs mt-1">We sent a verification code to <span className="text-emerald-300">{email}</span></p>
                       </div>
                       
                       <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Verification Code</label>
                       <div className="relative group">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-300 transition-colors duration-300" />
                            <input 
                                type="text" 
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:bg-zinc-900/80 focus:border-emerald-500/50 transition-all shadow-inner relative z-10 tracking-widest text-lg"
                                placeholder="123456"
                                maxLength={6}
                            />
                        </div>
                        <div className="text-center mt-2">
                             <button type="button" onClick={() => setShowOtpStep(false)} className="text-xs text-zinc-500 hover:text-white underline">Wrong email?</button>
                        </div>
                  </div>
              ) : (
                /* Standard Form Fields */
                <>
                    {isRegistering && (
                        <div className="animate-in slide-in-from-top-2">
                        <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Username</label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-300 transition-colors duration-300" />
                            <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:bg-zinc-900/80 focus:border-emerald-500/50 transition-all shadow-inner relative z-10"
                            placeholder="Your Name"
                            />
                        </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Email</label>
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
                        <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Password</label>
                        <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-300 transition-colors duration-300" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:bg-zinc-900/80 focus:border-emerald-500/50 transition-all shadow-inner relative z-10"
                            placeholder="••••••••"
                        />
                        </div>
                    </div>

                    {isRegistering && (
                         <div className="animate-in slide-in-from-top-2">
                            <label className="block text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest ml-4">Confirm Password</label>
                            <div className="relative group">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-300 transition-colors duration-300" />
                            <input 
                                type="password" 
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:bg-zinc-900/80 focus:border-emerald-500/50 transition-all shadow-inner relative z-10"
                                placeholder="••••••••"
                            />
                            </div>
                        </div>
                    )}
                </>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] border border-emerald-400/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {showOtpStep ? 'Verify & Create Account' : (isRegistering ? 'Next' : 'Sign In')}
                </span>
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <button 
                onClick={toggleMode}
                className="text-zinc-400 text-sm font-medium hover:text-white transition-colors"
             >
                {isRegistering ? "Already have an account?" : "Don't have an account?"} <span className="text-emerald-400 underline decoration-emerald-500/30 hover:decoration-emerald-400 underline-offset-2 ml-1">{isRegistering ? "Sign In" : "Sign Up"}</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
