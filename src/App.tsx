import React, { useEffect, useState, useCallback } from 'react';
import { BootSequence } from './components/BootSequence.js';
import { Navbar } from './components/Navbar.js';
import { AuthScreen } from './components/AuthScreen.js';
import { AdminScoreboard } from './components/AdminScoreboard.js';
import { ChallengeData } from './components/ChallengeCard.js';
import { HudFooter } from './components/HudFooter.js';  
import {KnowPage} from './components/Knowledge.js';

import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
interface UserProfile {
  id: string;
  username: string;
  role: 'participant' | 'admin';
  name?: string;
  email?: string;
}

interface HintItem {
  id: string;
  label: string;
  clue: string;
  createdAt?: string;
}

const DEFAULT_HINT_ITEMS: HintItem[] = [
  {
    id: 'hint_1',
    label: 'hint 1',
    clue: "The biometric login gateway processes input directly into the SQL query without parameter binding. Inspect the input authentication logic: try classical boolean bypass patterns (admin' OR 1=1--).",
  },
  {
    id: 'hint_2',
    label: 'hint 2',
    clue: 'Examine the disassembled ELF binary. The stack canary check is disabled. Overflowing the 64-byte local buffer redirects instruction pointer execution to the internal secret routine at address 0x080484b4.',
  },
  {
    id: 'hint_3',
    label: 'hint 3',
    clue: 'The intercepted cipher transmission was encrypted with a rolling XOR cipher using a repeating pseudo-random keystream. Analyze byte frequencies against expected ASCII syntax to reconstruct the decryption key.',
  },
  {
    id: 'hint_4',
    label: 'hint 4',
    clue: 'Inspect the raw PCAP stream. Look for abnormal high-frequency TXT and sub-domain query packets directed to internal DNS servers containing base64 encoded payloads.',
  },
];

export default function App() {
  const [bootCompleted, setBootCompleted] = useState<boolean>(() => {
    return sessionStorage.getItem('dark0de_boot_done') === 'true';
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [eventStatus, setEventStatus] = useState<'upcoming' | 'active' | 'ended'>('active');
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [challengesLoading, setChallengesLoading] = useState<boolean>(false);
  const [showKnow, setShowKnow] = useState(false);
  // Dynamic hints state from /api/hints with resilient fallback
  const [hints, setHints] = useState<HintItem[]>(DEFAULT_HINT_ITEMS);

  // Single flag submission states (textarea)
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | 'already_solved' | 'error';
    message: string;
  } | null>(null);

  // Hints expansion state
  const [expandedHints, setExpandedHints] = useState<{ [key: string]: boolean }>({});

  const toggleHint = (key: string) => {
    setExpandedHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Verify session from /api/me
  const verifySession = useCallback(async () => {
    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/me', { headers });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Load hints from /api/hints
  const fetchHints = useCallback(async () => {
    try {
      const res = await fetch('/api/hints');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.hints) && data.hints.length > 0) {
          setHints(data.hints);
        }
      }
    } catch (err) {
      // Retain existing default hints during dev server warmup or transient drops
    }
  }, []);

  useEffect(() => {
    fetchHints();
    // Poll hints every 10 seconds so participants get newly added admin hints live
    const interval = setInterval(fetchHints, 10000);
    return () => clearInterval(interval);
  }, [fetchHints]);

  // Load challenges when user is authenticated
  const fetchChallenges = useCallback(async () => {
    if (!user || user.role !== 'participant') return;
    setChallengesLoading(true);
    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/challenges', { headers });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      // Ignore network errors during reload
    } finally {
      setChallengesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user, fetchChallenges]);

  const handleBootComplete = () => {
    setBootCompleted(true);
    sessionStorage.setItem('dark0de_boot_done', 'true');
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile, _token: string) => {
    setUser(authenticatedUser);
    fetchChallenges();
    fetchHints();
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('dark0de_token');
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  // Flag Submit Handler using textarea
  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim() || submitting || eventStatus === 'ended') return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          challengeId: 'auto',
          flag: flagInput.trim(),
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFeedback({
          type: 'error',
          message: 'Gateway transmission failed. Please retry.',
        });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.error || 'Gateway transmission rejected.',
        });
        return;
      }

      if (data.status === 'correct') {
        setFeedback({
          type: 'correct',
          message: data.message || 'CORRECT',
        });
        setFlagInput('');
        fetchChallenges();
      } else if (data.status === 'already_solved') {
        setFeedback({
          type: 'already_solved',
          message: data.message || 'CORRECT But you already submitted this.',
        });
      } else {
        setFeedback({
          type: 'incorrect',
          message: data.message || 'INVALID SIGNATURE: Flag rejected by security kernel.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Network packet dropped. Try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const solvedCount = challenges.filter((c) => c.isSolved).length;
  const totalCount = challenges.length || 4;
  const isEventClosed = eventStatus === 'ended';

  return (
    <div className="min-h-screen bg-[#0A0506] text-[#D6D6D6] cyber-grid-bg relative flex flex-col selection:bg-[#FF4D4D] selection:text-black">
      {/* Subtle Scanline Layer */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-60 z-30" />

      {/* Boot Sequence on initial load */}
      {!bootCompleted && <BootSequence onComplete={handleBootComplete} />}

      {/* Navbar with Countdown: right of dark0de when logged out; left of logout button when logged in */}
      <Navbar
  user={user}
  onEventStatusChange={setEventStatus}
  onLogout={handleLogout}
  onKnow={() => setShowKnow((v) => !v)}
/>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 relative z-10">
        { showKnow ? (
  <KnowPage onBack={() => setShowKnow(false)} />
) : authChecking ? (
          <div className="flex items-center justify-center py-24 font-mono text-sm text-[#FF4D4D]">
            <span className="animate-spin inline-block mr-2">◒</span>
            <span>CONNECTING TO SECURITY GATEWAY...</span>
          </div>
        ) : !user ? (
          /* Unauthenticated: Auth Screen directly (no box above, nothing below) */
          <div>
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          </div>
        ) : user.role === 'admin' ? (
          /* Admin View: No submit box, no challenges solved box. Direct scorecard + Add Hint module */
          <div>
            <AdminScoreboard />
          </div>
        ) : (
          /* Main Page for Regular Participant Users */
          <div className="space-y-6">
            {/* 1. Flag Submission: Only a textarea and submit button next to it (no outer box) */}
            <div>
              {/* Feedback Alert if present */}
              {feedback && (
                <div
                  className={`p-3 mb-3 text-xs font-mono flex items-center gap-2 chamfer-btn border ${
                    feedback.type === 'correct'
                      ? 'bg-[#7CFF00]/10 text-[#7CFF00] text-glow-green border-[#7CFF00]'
                      : feedback.type === 'already_solved'
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]'
                      : 'bg-[#FF4D4D]/10 text-[#FF4D4D] border-[#FF4D4D]'
                  }`}
                >
                  {feedback.type === 'correct' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7CFF00]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF4D4D]" />
                  )}
                  <span className="font-bold">{feedback.message}</span>
                </div>
              )}

              {isEventClosed ? (
                <div className="border border-[#FF4D4D]/50 bg-[#0A0506] p-4 text-center font-mono text-xs text-[#8E8A8B] chamfer-btn">
                  EVENT CLOSED // FLAG INJECTION PORTS TERMINATED
                </div>
              ) : (
                <form onSubmit={handleFlagSubmit} className="w-full flex flex-col sm:flex-row gap-2 items-stretch">
                  <textarea
                    rows={1}
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="Enter flag here (dark0de{...})..."
                    disabled={submitting}
                    className="flex-1 bg-[#0A0506] border border-[#FF4D4D]/50 focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] px-3 py-2 text-xs font-mono text-white placeholder-[#8E8A8B]/40 chamfer-btn resize-none transition-colors h-10 leading-normal"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !flagInput.trim()}
                    className="px-4 py-2 bg-[#FF4D4D] hover:bg-[#FF3333] active:scale-95 text-black font-heading font-black text-xs tracking-wider flex items-center justify-center gap-1.5 chamfer-btn transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_10px_rgba(255,77,77,0.3)] shrink-0 sm:w-28 h-10"
                  >
                    <span>{submitting ? 'CHECKING...' : 'SUBMIT'}</span>
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </form>
              )}
            </div>

            {/* 2. Challenges Solved Box with sharp borders */}
            <div className="border border-[#FF4D4D]/60 bg-[#140708]/90 p-5 md:p-6 rounded-none glow-red">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FF4D4D]/30 pb-3 mb-4">
                <div>
                  <h3 className="text-lg md:text-xl font-heading font-black tracking-wider text-white">
                    CHALLENGES SOLVED
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="border border-[#7CFF00] bg-[#0A1408] px-3.5 py-1 rounded-none font-mono">
                    <span className="text-xl font-bold text-[#7CFF00] text-glow-green">
                      {solvedCount}
                    </span>
                    <span className="text-[#8E8A8B] text-xs ml-1">/ {totalCount}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar with sharp border */}
              <div className="mb-4">
                <div className="w-full bg-[#0A0506] border border-[#FF4D4D]/40 p-1 flex gap-1 h-5 rounded-none">
                  {Array.from({ length: totalCount }).map((_, idx) => {
                    const isPassed = idx < solvedCount;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-none transition-all duration-300 ${
                          isPassed
                            ? 'bg-[#7CFF00] shadow-[0_0_8px_#7CFF00]'
                            : 'bg-[#140708]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Targets List with sharp borders */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {challengesLoading ? (
                  <div className="col-span-2 text-center py-3 text-[#8E8A8B]">
                    UPDATING CHALLENGES...
                  </div>
                ) : (
                  challenges.map((chal, i) => (
                    <div
                      key={chal.id}
                      className={`p-2.5 border rounded-none flex items-center justify-between ${
                        chal.isSolved
                          ? 'border-[#7CFF00]/50 bg-[#0A1408] text-[#7CFF00]'
                          : 'border-[#FF4D4D]/40 bg-[#0A0506] text-[#D6D6D6]'
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="text-[10px] text-[#8E8A8B] block">
                          CHALLENGE 0{i + 1}
                        </span>
                        <strong className="text-white text-xs truncate block">
                          {chal.title}
                        </strong>
                      </div>

                      <div
                        className={`px-2 py-0.5 text-[10px] font-bold tracking-widest border rounded-none shrink-0 flex items-center gap-1 ${
                          chal.isSolved
                            ? 'text-[#7CFF00] bg-[#7CFF00]/10 text-glow-green border-[#7CFF00]'
                            : 'text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/40'
                        }`}
                      >
                        {chal.isSolved ? (
                          <>
                            <Unlock className="w-3 h-3 text-[#7CFF00]" />
                            <span>BREACHED</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-[#FF4D4D]" />
                            <span>LOCKED</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div> */}
            </div>

            {/* 3. Long Boxes for Hints: Structure: "hint 1                                     ^" with restored chamfered border */}
            <div className="space-y-2.5">
              {hints.map((hint) => {
                const isOpen = expandedHints[hint.id];

                return (
                  <div
                    key={hint.id}
                    className="border border-[#FF4D4D]/50 bg-[#140708]/90 chamfer-card transition-all duration-200"
                  >
                    {/* Header Row: "hint 1                                             ^" */}
                    <button
                      type="button"
                      onClick={() => toggleHint(hint.id)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#FF4D4D]/5 transition-colors font-mono text-sm tracking-wide text-white capitalize"
                    >
                      <span className="font-mono text-xs md:text-sm font-semibold tracking-wider text-[#D6D6D6]">
                        {hint.label}
                      </span>

                      <div className="text-[#8E8A8B]">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#FF4D4D]" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Clue Content */}
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 border-t border-[#FF4D4D]/30">
                        <div className="p-3 bg-[#0A0506] border border-[#FF4D4D]/40 chamfer-btn text-xs font-mono text-[#D6D6D6] leading-relaxed">
                          <span className="text-[#FF4D4D] font-bold mr-2">&gt;&gt;</span>
                          {hint.clue}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
         <HudFooter currentUsername={user?.username} />
    </div>
  );
}
