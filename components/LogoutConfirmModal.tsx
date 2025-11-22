import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-sm glass-panel rounded-[2.5rem] p-8 border border-white/10 border-t-red-500/20 shadow-[0_20px_60px_-10px_rgba(220,38,38,0.15)] animate-in zoom-in-95 duration-300 flex flex-col items-center text-center overflow-hidden">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] rounded-full pointer-events-none -z-10" />

            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)] border border-red-500/20 relative group">
                <div className="absolute inset-0 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <LogOut className="w-10 h-10 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)] ml-1" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                Log Out?
            </h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[260px]">
                Are you sure you want to sign out of your session?
            </p>

            <div className="flex gap-3 w-full">
                <button
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/5"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-700 hover:from-red-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-900/30 hover:shadow-red-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-red-400/20"
                >
                    <LogOut className="w-4 h-4" />
                    Log Out
                </button>
            </div>
        </div>
    </div>
  );
};