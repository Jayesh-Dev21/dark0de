import React, { useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface AccessGrantedModalProps {
  username: string;
  role: string;
  onProceed: () => void;
}

export const AccessGrantedModal: React.FC<AccessGrantedModalProps> = ({
  username,
  role,
  onProceed,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        onProceed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onProceed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cyber-grid-bg select-none">
      <div className="w-full max-w-md border-2 border-[#7CFF00] bg-[#0A1408]/95 p-6 md:p-8 chamfer-card glow-green relative text-[#7CFF00]">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between text-xs font-mono tracking-widest border-b border-[#7CFF00]/40 pb-3 mb-6">
          <span>01_ACCESS_TERMINAL</span>
          <span className="animate-pulse">● SECURE LINK</span>
        </div>

        {/* Big Neon Green Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-widest text-[#7CFF00] text-glow-green">
            ACCESS
          </h1>
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-widest text-[#7CFF00] text-glow-green">
            GRANTED
          </h1>
        </div>

        {/* Fingerprint Biometric HUD with Concentric Rings */}
        <div className="flex justify-center my-6 relative">
          <div className="w-48 h-48 rounded-full border border-[#7CFF00]/30 flex items-center justify-center relative">
            {/* Outer dotted radar ring */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#7CFF00]/40 animate-spin" style={{ animationDuration: '24s' }} />
            {/* Middle ring */}
            <div className="absolute inset-6 rounded-full border border-[#7CFF00]/60" />
            {/* Inner glow */}
            <div className="absolute inset-10 rounded-full bg-[#7CFF00]/10 blur-sm" />

            {/* High-fidelity SVG Fingerprint */}
            <svg
              className="w-24 h-24 text-[#7CFF00] relative z-10 drop-shadow-[0_0_8px_#7CFF00]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.2 7 9.5" />
              <path d="M12 6a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.2" />
              <path d="M12 10a2 2 0 0 0-2 2c0 1.1.9 2 2 2" />
              <path d="M12 14c-1.1 0-2 .9-2 2v2" />
              <path d="M12 18v3" />
              <path d="M16 8a4 4 0 0 1 0 8" />
              <path d="M19 6a8 8 0 0 1 0 12" />
              <path d="M22 12a10 10 0 0 1-2.5 6.5" />
            </svg>
          </div>
        </div>

        {/* User Clearance Stats Box */}
        <div className="border border-[#7CFF00]/50 bg-[#0A0506]/80 p-4 mb-4 font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#7CFF00]/70">USER:</span>
            <span className="font-bold tracking-wider text-white uppercase">{username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7CFF00]/70">CLEARANCE:</span>
            <span className="font-bold tracking-wider text-[#7CFF00]">
              {role === 'admin' ? 'ROOT // ∞' : 'PARTICIPANT // LEVEL 1'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7CFF00]/70">STATUS:</span>
            <span className="font-bold tracking-wider text-[#7CFF00] animate-pulse">
              UNSTOPPABLE
            </span>
          </div>
        </div>

        {/* Tactical Inscription Box */}
        <div className="border border-[#7CFF00]/30 bg-[#0A1408]/60 p-4 mb-6 flex items-center justify-between font-mono text-xs">
          <p className="text-[11px] text-[#7CFF00]/90 leading-relaxed uppercase tracking-wider pr-2">
            "THE DOORS WERE ALREADY OPEN. YOU JUST DECIDED TO WALK THROUGH."
          </p>
          <div className="w-8 h-8 border border-[#7CFF00] rotate-45 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 -rotate-45 text-[#7CFF00]" />
          </div>
        </div>

        {/* Proceed Action Button */}
        <button
          onClick={onProceed}
          className="w-full py-3.5 px-6 bg-[#7CFF00] hover:bg-[#8FFF1A] text-black font-heading font-black tracking-widest text-sm flex items-center justify-center gap-2 chamfer-btn transition-transform active:scale-95 shadow-[0_0_20px_#7CFF00] cursor-pointer"
        >
          <span>&gt; PROCEED TO MAINFRAME</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Subtle Press Enter hint */}
        <div className="text-center mt-3 text-[10px] font-mono text-[#7CFF00]/60 tracking-widest">
          [PRESS ENTER OR SPACE TO CONTINUE]
        </div>
      </div>
    </div>
  );
};
