import React from 'react';
import { Shield, Terminal, Clock, AlertTriangle, Key } from 'lucide-react';

export const RulesBriefing: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border border-[#FF4D4D]/40 bg-[#140708] p-5 chamfer-card glow-red">
        <div className="text-[10px] font-mono text-[#8E8A8B] uppercase tracking-widest">
          // COMPETITION PROTOCOLS
        </div>
        <h2 className="text-2xl font-heading font-black tracking-wider text-[#FF4D4D] text-glow-red mt-1">
          OPERATIONAL BRIEFING &amp; RULES
        </h2>
        <p className="text-xs font-mono text-[#D6D6D6] mt-1">
          Standard Operating Procedures for dark0de 2026 cybersecurity engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Card 1: Flag Format */}
        <div className="border border-[#FF4D4D]/30 bg-[#140708]/90 p-5 chamfer-card space-y-3">
          <div className="flex items-center gap-2 text-[#FF4D4D] font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>01. FLAG SIGNATURE FORMAT</span>
          </div>
          <p className="text-[#D6D6D6] leading-relaxed">
            All captured flags follow the strict token format:
          </p>
          <div className="p-2.5 bg-[#0A0506] border border-[#FF4D4D]/50 text-[#7CFF00] font-bold">
            dark0de&#123;secret_token_here&#125;
          </div>
          <p className="text-[#8E8A8B] text-[11px]">
            Flags are verified cryptographically via SHA-256 digests. Case-sensitivity is strictly preserved inside braces.
          </p>
        </div>

        {/* Card 2: 24-Hour Authoritative Clock */}
        <div className="border border-[#FF4D4D]/30 bg-[#140708]/90 p-5 chamfer-card space-y-3">
          <div className="flex items-center gap-2 text-[#FF4D4D] font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>02. 48-HOUR ENGAGEMENT WINDOW</span>
          </div>
          <p className="text-[#D6D6D6] leading-relaxed">
            The competition operates on a continuous 24-hour authoritative countdown anchored directly to the security gateway.
          </p>
          <p className="text-[#8E8A8B] text-[11px]">
            Upon zero, all flag submission ports lock automatically. Only administrators retain access to scorecard telemetry.
          </p>
        </div>

        {/* Card 3: Anti-DOS & Rate Limiting */}
        <div className="border border-[#FF4D4D]/30 bg-[#140708]/90 p-5 chamfer-card space-y-3">
          <div className="flex items-center gap-2 text-[#FF4D4D] font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>03. RATE LIMITING &amp; DEFENSE</span>
          </div>
          <p className="text-[#D6D6D6] leading-relaxed">
            To prevent brute-force automation, submissions are constrained to <strong className="text-white">10 attempts per minute</strong>.
          </p>
          <p className="text-[#8E8A8B] text-[11px]">
            Exceeding limits triggers an automated 429 cooldown period enforced by database audit logs.
          </p>
        </div>

        {/* Card 4: Academic Integrity */}
        <div className="border border-[#FF4D4D]/30 bg-[#140708]/90 p-5 chamfer-card space-y-3">
          <div className="flex items-center gap-2 text-[#FF4D4D] font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>04. IDENTITY &amp; INTEGRITY</span>
          </div>
          <p className="text-[#D6D6D6] leading-relaxed">
            Access is restricted to verified operators carrying registered <strong className="text-[#00E5FF]">@itbhu.ac.in</strong> email credentials.
          </p>
          <p className="text-[#8E8A8B] text-[11px]">
            Sharing flags or attacking scoring infrastructure results in immediate forfeiture and revocation of clearance.
          </p>
        </div>
      </div>
    </div>
  );
};
