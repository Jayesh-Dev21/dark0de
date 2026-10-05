import React, { useEffect, useState } from 'react';

interface CountdownDisplayProps {
  onEventStatusChange?: (status: 'upcoming' | 'active' | 'ended') => void;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ onEventStatusChange }) => {
  const [startsAt, setStartsAt] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>('--:--:--');
  const [status, setStatus] = useState<'loading' | 'upcoming' | 'active' | 'ended'>('loading');
  const [isFinalHour, setIsFinalHour] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchEventWindow() {
      try {
        const clientNow = Date.now();
        const res = await fetch('/api/event');
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType || !contentType.includes('application/json')) {
          throw new Error('Failed to fetch event time');
        }
        const data = await res.json();

        if (isMounted) {
          const serverNow = data.serverNow || clientNow;
          const offset = serverNow - clientNow;
          setTimeOffset(offset);

          const startTs = new Date(data.startsAt).getTime();
          const endTs = new Date(data.endsAt).getTime();

          setStartsAt(startTs);
          setEndsAt(endTs);
        }
      } catch (err) {
        if (isMounted) {
          const now = Date.now();
          setStartsAt(now - 1000 * 60 * 60);
          setEndsAt(now + 1000 * 60 * 60 * 23);
          setTimeOffset(0);
        }
      }
    }

    fetchEventWindow();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (startsAt === null || endsAt === null) return;

    const interval = setInterval(() => {
      const currentServerTime = Date.now() + timeOffset;

      if (currentServerTime < startsAt) {
        setStatus('upcoming');
        onEventStatusChange?.('upcoming');
        const diff = Math.max(0, startsAt - currentServerTime);
        setDisplayTime(formatDuration(diff));
        setIsFinalHour(false);
      } else if (currentServerTime <= endsAt) {
        setStatus('active');
        onEventStatusChange?.('active');
        const diff = Math.max(0, endsAt - currentServerTime);
        setDisplayTime(formatDuration(diff));
        setIsFinalHour(diff <= 3600 * 1000);
      } else {
        setStatus('ended');
        onEventStatusChange?.('ended');
        setDisplayTime('00:00:00');
        setIsFinalHour(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startsAt, endsAt, timeOffset, onEventStatusChange]);

  function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return (
    <div className="flex items-center gap-2 font-mono text-xs select-none">
      {status === 'upcoming' && (
        <span className="text-[#8E8A8B] text-[10px] hidden sm:inline tracking-wider">
          STARTS IN:
        </span>
      )}
      {status === 'active' && (
        <span
          className={`text-[10px] hidden sm:inline tracking-wider ${
            isFinalHour ? 'text-[#FF1A1A] font-bold' : 'text-[#FF4D4D]'
          }`}
        >
          {isFinalHour ? '⚠ ENDS IN:' : 'ENDS IN:'}
        </span>
      )}

      <div
        className={`font-mono text-xs md:text-sm tracking-widest font-bold px-2.5 py-1 chamfer-btn ${
          status === 'ended'
            ? 'text-[#8E8A8B] bg-[#140708] border border-[#8E8A8B]/30'
            : isFinalHour
            ? 'text-[#FF1A1A] bg-[#FF1A1A]/10 border border-[#FF1A1A] pulse-final-hour'
            : 'text-[#FF4D4D] bg-[#FF4D4D]/10 border border-[#FF4D4D]/50 text-glow-red'
        }`}
      >
        {status === 'ended' ? 'EVENT CLOSED' : displayTime}
      </div>
    </div>
  );
};
