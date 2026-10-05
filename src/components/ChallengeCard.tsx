import React, { useState } from 'react';
import { Lock, Unlock, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export interface ChallengeData {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  isSolved: boolean;
}

interface ChallengeCardProps {
  challenge: ChallengeData;
  isEventClosed: boolean;
  onSolveSuccess: (challengeId: string) => void;
  onNewAttempt?: (attempt: { challengeTitle: string; correct: boolean; timestamp: Date; submittedFlag: string }) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  isEventClosed,
  onSolveSuccess,
  onNewAttempt,
}) => {
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | 'already_solved' | 'error';
    message: string;
  } | null>(null);
  const [glitching, setGlitching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || submitting || challenge.isSolved || isEventClosed) return;

    setSubmitting(true);
    setFeedback(null);

    // Visual glitch response
    setGlitching(true);
    setTimeout(() => setGlitching(false), 300);

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
          challengeId: challenge.id,
          flag: flag.trim(),
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFeedback({
          type: 'error',
          message: 'Transmission interrupted. Please retry.',
        });
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.error || 'Gateway transmission rejected.',
        });
        onNewAttempt?.({
          challengeTitle: challenge.title,
          correct: false,
          timestamp: new Date(),
          submittedFlag: flag.trim(),
        });
        return;
      }

      if (data.status === 'correct') {
        setFeedback({
          type: 'correct',
          message: data.message || 'BREACH GRANTED: Flag verified!',
        });
        onSolveSuccess(challenge.id);
        onNewAttempt?.({
          challengeTitle: challenge.title,
          correct: true,
          timestamp: new Date(),
          submittedFlag: flag.trim(),
        });
        setFlag('');
      } else if (data.status === 'already_solved') {
        setFeedback({
          type: 'already_solved',
          message: data.message || 'Target already breached.',
        });
      } else {
        setFeedback({
          type: 'incorrect',
          message: data.message || 'INVALID SIGNATURE: Flag rejected.',
        });
        onNewAttempt?.({
          challengeTitle: challenge.title,
          correct: false,
          timestamp: new Date(),
          submittedFlag: flag.trim(),
        });
      }
    } catch (err: any) {
      console.error('Submit flag error:', err);
      setFeedback({
        type: 'error',
        message: 'Network packet dropped. Try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isSolved = challenge.isSolved;
  const isInputDisabled = isSolved || isEventClosed || submitting;

  return (
    <div
      className={`border bg-[#140708]/90 p-5 md:p-6 chamfer-card relative transition-all duration-200 flex flex-col justify-between ${
        isSolved
          ? 'border-[#7CFF00]/80 shadow-[0_0_20px_rgba(124,255,0,0.2)]'
          : 'border-[#FF4D4D]/50 hover:border-[#FF4D4D] glow-red'
      } ${glitching ? 'translate-x-1 opacity-90' : ''}`}
    >
      {/* Corner Bracket Accents */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-[#8E8A8B]">
        TARGET//{challenge.id.substring(0, 8).toUpperCase()}
      </div>

      <div>
        {/* Top Meta Line: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3 pt-3">
          <div className="text-[11px] font-mono tracking-wider text-[#8E8A8B] uppercase">
            {challenge.category} <span className="text-[#FF4D4D]">/</span> {challenge.points} PTS
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase border ${
              isSolved
                ? 'border-[#7CFF00] text-[#7CFF00] bg-[#7CFF00]/10 text-glow-green'
                : 'border-[#FF4D4D] text-[#FF4D4D] bg-[#FF4D4D]/10 text-glow-red'
            }`}
          >
            {isSolved ? (
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

        {/* Title */}
        <h3 className="text-xl font-heading font-black tracking-wider text-white mb-2">
          {challenge.title}
        </h3>

        {/* Description */}
        <p className="text-xs font-mono text-[#D6D6D6]/80 leading-relaxed mb-6">
          {challenge.description}
        </p>
      </div>

      {/* Flag Submission Area */}
      <div>
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-2.5 mb-3 text-xs font-mono flex items-center gap-2 border ${
              feedback.type === 'correct'
                ? 'bg-[#7CFF00]/10 border-[#7CFF00] text-[#7CFF00]'
                : 'bg-[#FF4D4D]/10 border-[#FF4D4D] text-[#FF4D4D]'
            }`}
          >
            {feedback.type === 'correct' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-[#7CFF00]" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF4D4D]" />
            )}
            <span className="text-[11px] leading-tight">{feedback.message}</span>
          </div>
        )}

        {isSolved ? (
          <div className="border border-[#7CFF00]/40 bg-[#0A1408] p-3 text-center font-mono text-xs text-[#7CFF00]">
            ✓ OBJECTIVE SECURED // REWARD CLAIMED
          </div>
        ) : isEventClosed ? (
          <div className="border border-[#8E8A8B]/40 bg-[#0A0506] p-3 text-center font-mono text-xs text-[#8E8A8B]">
            EVENT CLOSED // TRANSMISSIONS TERMINATED
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-[10px] font-mono text-[#8E8A8B] tracking-wider uppercase">
              Submit Flag Signature
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="dark0de{...}"
                disabled={isInputDisabled}
                className="flex-1 bg-[#0A0506] border border-[#FF4D4D]/50 focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] px-3 py-2 text-xs font-mono text-white placeholder-[#8E8A8B]/40 chamfer-btn transition-colors disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={isInputDisabled || !flag.trim()}
                className="px-4 py-2 bg-[#FF4D4D] hover:bg-[#FF3333] active:scale-95 text-black font-heading font-black text-xs tracking-wider flex items-center gap-1.5 chamfer-btn transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_10px_rgba(255,77,77,0.3)]"
              >
                <span>{submitting ? 'CHECKING...' : 'BREACH'}</span>
                <Send className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
