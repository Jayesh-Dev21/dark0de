import React, { useState } from 'react';
import { Terminal, Send, AlertTriangle } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaDiscord } from 'react-icons/fa';
interface HudFooterProps {
  currentUsername?: string;
}

export const HudFooter: React.FC<HudFooterProps> = ({ currentUsername }) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([
    'DARK0DE KERNEL v5.2.0-CYBER INITIALIZED',
    'TYPE "help" FOR AVAILABLE MAINFRAME DIRECTIVES.',
  ]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    let response = '';
    switch (cmd) {
      case 'help':
        response = 'COMMANDS: help, status, targets, whoami, time, clear, motd';
        break;
      case 'status':
        response = 'SYSTEM STATUS: OPERATIONAL // KERNEL LINK: ENCRYPTED // PORTS: LOCKED';
        break;
      case 'targets':
        response = 'ACTIVE EXPLOITS: 4 OBJECTIVES LOADED [WEB, REV, CRYPTO, FORENSICS]';
        break;
      case 'whoami':
        response = `OPERATOR IDENTITY: ${currentUsername || 'ANONYMOUS_PROBE'} // LEVEL 1 CLEARANCE`;
        break;
      case 'time':
        response = `AUTHORITATIVE CLOCK: ${new Date().toISOString()}`;
        break;
      case 'motd':
        response = '"THE DOORS WERE ALREADY OPEN. YOU JUST DECIDED TO WALK THROUGH."';
        break;
      case 'clear':
        setHistory([]);
        setCommand('');
        return;
      default:
        response = `COMMAND NOT FOUND: "${cmd}". TYPE "help" FOR MAN PAGES.`;
    }

    setHistory((prev) => [...prev.slice(-6), `root@dark0de:~# ${command}`, response]);
    setCommand('');
  };

  return (
    <footer className="w-full border-t border-[#FF4D4D]/30 bg-[#0A0506]/95 text-[#8E8A8B] font-mono text-xs select-none mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col items-center gap-3 text-center">
        <span className="tracking-widest">FOLLOW US ON</span>
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://www.instagram.com/cops.iitbhu/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-[#FF4D4D] hover:text-white transition-colors"
          >
            <FaInstagram className="w-6 h-6" />
          </a>
          <a
            href="https://www.linkedin.com/company/cops-iitbhu/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-[#FF4D4D] hover:text-white transition-colors"
          >
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a
            href="https://discord.gg/GznxBjk9k"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="text-[#FF4D4D] hover:text-white transition-colors"
          >
            <FaDiscord className="w-6 h-6" />
          </a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} COPS IITBHU. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
