import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttemptItem {
  challengeTitle: string;
  correct: boolean;
  timestamp: Date;
  submittedFlag: string;
}

interface BreachLogProps {
  attempts: AttemptItem[];
  solvedChallengesCount: number;
}

export const BreachLog: React.FC<BreachLogProps> = ({ attempts, solvedChallengesCount }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-[#FF4D4D]/40 bg-[#140708] p-5 chamfer-card glow-red flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-[#8E8A8B] uppercase tracking-widest">
            // LOCAL TERMINAL AUDIT
          </div>
          <h2 className="text-2xl font-heading font-black tracking-wider text-[#FF4D4D] text-glow-red mt-1">
            MY BREACH LOG
          </h2>
          <p className="text-xs font-mono text-[#D6D6D6] mt-1">
            Chronological audit of all flag validation transmissions sent from this workstation.
          </p>
        </div>

        <div className="border border-[#7CFF00]/40 bg-[#0A1408] px-4 py-2 font-mono text-center chamfer-btn">
          <span className="text-[10px] text-[#7CFF00]/70 block">CONFIRMED BREACHES</span>
          <span className="text-lg font-bold text-[#7CFF00] text-glow-green">
            {solvedChallengesCount} / 4 TARGETS
          </span>
        </div>
      </div>

      {/* Attempts List */}
      <div className="border border-[#FF4D4D]/30 bg-[#140708]/90 p-5 chamfer-card">
        {attempts.length === 0 ? (
          <div className="text-center py-12 font-mono text-xs text-[#8E8A8B]">
            <ShieldCheck className="w-8 h-8 text-[#8E8A8B]/50 mx-auto mb-2" />
            <p>NO SUBMISSION TELEMETRY LOGGED IN THIS SESSION.</p>
            <p className="text-[11px] mt-1">Select a challenge from the grid and inject your flag signature.</p>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {attempts.map((att, i) => (
              <div
                key={i}
                className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  att.correct
                    ? 'border-[#7CFF00]/60 bg-[#7CFF00]/10 text-[#7CFF00]'
                    : 'border-[#FF4D4D]/40 bg-[#FF4D4D]/10 text-[#FF4D4D]'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {att.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-[#7CFF00] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#FF4D4D] shrink-0" />
                  )}
                  <span className="text-white font-bold">{att.challengeTitle}</span>
                  <span className="text-[11px] text-[#8E8A8B] font-mono truncate max-w-[200px]">
                    FLAG: {att.submittedFlag}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#8E8A8B]">
                  <span className={att.correct ? 'text-[#7CFF00] font-bold' : 'text-[#FF4D4D]'}>
                    {att.correct ? 'BREACH CONFIRMED' : 'REJECTED'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(att.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
