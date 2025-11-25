
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, X, CheckCircle2, MousePointer2 } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  actionNeeded?: boolean; // If true, maybe wait for user click (advanced, keeping simple for now)
}

interface TutorialOverlayProps {
  isOpen: boolean;
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, steps, onComplete, onSkip }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const step = steps[currentStepIndex];

  const updateRect = () => {
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Add some padding to the highlight
      const padding = 8;
      setTargetRect({
        ...rect,
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2),
        bottom: rect.bottom + padding,
        right: rect.right + padding,
        x: rect.x - padding,
        y: rect.y - padding,
        toJSON: () => {}
      });
    } else {
        // Fallback if element not found (e.g. scrolled out of view or dynamic)
        setTargetRect(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow DOM to settle if opening immediately
      setTimeout(updateRect, 100);
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
    }
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStepIndex, step.targetId]);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
        setIsAnimating(false);
    }, 300);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden">
        {/* The Spotlight Layer using CSS box-shadow for a 'hole' effect */}
        {targetRect && (
            <div 
                className="absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] pointer-events-none"
                style={{
                    top: targetRect.top,
                    left: targetRect.left,
                    width: targetRect.width,
                    height: targetRect.height,
                    borderRadius: '16px',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 4px rgba(52, 211, 153, 0.5)' // Dark overlay + Green ring
                }}
            />
        )}
        
        {/* If no target found, just full overlay */}
        {!targetRect && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        )}

        {/* Info Card */}
        <div 
            className={`absolute transition-all duration-500 ease-out flex flex-col items-center justify-center pointer-events-auto ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            style={{
                top: targetRect ? 
                    (step.position === 'top' ? Math.max(20, targetRect.top - 200) : 
                     step.position === 'left' ? targetRect.top :
                     step.position === 'right' ? targetRect.top :
                     targetRect.bottom + 20) 
                    : '50%',
                left: targetRect ? 
                    (step.position === 'left' ? Math.max(20, targetRect.left - 340) :
                     step.position === 'right' ? targetRect.right + 20 :
                     Math.max(20, targetRect.left + (targetRect.width/2) - 160)) 
                    : '50%',
                transform: !targetRect ? 'translate(-50%, -50%)' : 'none',
                maxWidth: '320px',
                width: '100%'
            }}
        >
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(52,211,153,0.3)] bg-[#09090b]/90 backdrop-blur-xl relative overflow-hidden">
                 {/* Decorative Blobs */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10" />
                 
                 <div className="flex justify-between items-start mb-4 relative z-10">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                            {currentStepIndex + 1}
                        </div>
                        <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Tutorial</span>
                     </div>
                     <button onClick={onSkip} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                     </button>
                 </div>

                 <h3 className="text-xl font-bold text-white mb-2 relative z-10">{step.title}</h3>
                 <p className="text-zinc-400 text-sm leading-relaxed mb-6 relative z-10">
                    {step.description}
                 </p>

                 <div className="flex items-center justify-between relative z-10">
                     <div className="flex gap-1">
                         {steps.map((_, idx) => (
                             <div 
                                key={idx} 
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentStepIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-white/10'}`} 
                             />
                         ))}
                     </div>
                     <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                     >
                        {currentStepIndex === steps.length - 1 ? (
                            <>
                                All Set <CheckCircle2 className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Next <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                     </button>
                 </div>
            </div>
            
            {/* Simple Pointer Arrow if highlighting */}
            {targetRect && (
                <div 
                    className={`absolute ${
                        step.position === 'top' ? 'bottom-[-30px] left-1/2 -translate-x-1/2 rotate-180' : 
                        step.position === 'left' ? 'right-[-30px] top-8 -rotate-90' :
                        step.position === 'right' ? 'left-[-30px] top-8 rotate-90' :
                        'top-[-30px] left-1/2 -translate-x-1/2'
                    } text-emerald-400 animate-bounce pointer-events-none drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]`}
                >
                    <MousePointer2 className="w-8 h-8 fill-emerald-500/20" />
                </div>
            )}
        </div>
    </div>,
    document.body
  );
};
