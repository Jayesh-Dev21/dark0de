import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, X } from 'lucide-react';
import { CountdownDisplay } from './CountdownBar.js';

interface NavbarProps {
  user: {
    username: string;
    role: string;
    name?: string;
  } | null;
  onEventStatusChange?: (status: 'upcoming' | 'active' | 'ended') => void;
  onLogout: () => void;
  onKnow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onEventStatusChange,
  onLogout,
  onKnow,
}) => {
    const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!showRules) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowRules(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showRules]);
  return (
    <>
    <header className="w-full border-b border-[#FF4D4D]/30 bg-[#0A0506]/95 backdrop-blur-md px-4 lg:px-8 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
                {/* Left: Brand Wordmark + Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/dark0de_logo.jpg"
            alt="dark0de logo"
            className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover border border-[#FF4D4D]/40"
          />
          <div className="text-xl md:text-2xl font-heading font-black tracking-widest text-[#FF4D4D] text-glow-red">
            dark0de
          </div>
        </div>
                {/* Middle: Rules */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowRules(true)}
            className="py-1.5 px-3 border border-[#FF4D4D]/50 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-black chamfer-btn font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RULES</span>
          </button>
          <button
            onClick={onKnow}
            className="py-1.5 px-3 border border-[#FF4D4D]/50 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-black chamfer-btn font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">KNOWLEDGE</span>
          </button>
        </div>
        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          {!user ? (
            /* Login page: Countdown displayed right to dark0de */
            <CountdownDisplay onEventStatusChange={onEventStatusChange} />
          ) : (
            /* Main user page: Countdown placed directly to the LEFT of logout button */
            <div className="flex items-center gap-3 md:gap-5">
              {/* Countdown placed to the left of logout button */}
              <CountdownDisplay onEventStatusChange={onEventStatusChange} />

              {/* User Call Sign (no admin logo after name) */}
              <div className="flex items-center gap-2 font-mono">
                <span className="hidden sm:inline text-xs font-bold text-white uppercase tracking-wider">
                  {user.username}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Terminate Session"
                className="py-1.5 px-3 bg-[#1B2A2F] hover:bg-[#FF4D4D] hover:text-black text-[#FF4D4D] border border-[#FF4D4D]/50 chamfer-btn font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
          {showRules && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowRules(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Event rules"
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto border border-[#FF4D4D]/60 bg-[#140708] p-6 chamfer-card glow-red font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRules(false)}
              aria-label="Close rules"
              className="absolute top-3 right-3 text-[#FF4D4D] hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-heading font-black tracking-wider text-[#FF4D4D] text-glow-red mb-4">
              RULES OF dark0de
            </h2>

            <ol className="space-y-3 text-xs text-[#D6D6D6] leading-relaxed list-decimal pl-5">
              <li>Flags use the format <span className="text-[#7CFF00]">dark0de&#123;...&#125;</span>.</li>
              <li>Only <span className="text-white">@itbhu.ac.in</span> emails can register. One account per person.</li>
              <li>The event runs for 24 hours. Submissions close when the countdown ends.</li>
              <li>Do not attack the website, the server or other participants. No DoS, no brute-forcing logins or flags.</li>
              <li>Do not share flags, hints or solutions during the event if found you may be disqualified.</li>
              <li>The organizers' decisions are final. Rule breakers may be disqualified.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
};
