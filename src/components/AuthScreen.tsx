import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: { id: string; username: string; role: 'participant' | 'admin'; name?: string }, token: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Instant inline email domain validation for @itbhu.ac.in
  const isEmailDirty = email.length > 0;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@itbhu\.ac\.in$/.test(email.trim().toLowerCase());
  const showEmailInlineError = mode === 'signup' && isEmailDirty && !isEmailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim() || !username.trim() || !email.trim() || !password) {
        setError('All fields are required for terminal clearance registration.');
        return;
      }
      if (!isEmailValid) {
        setError('Only @itbhu.ac.in email addresses can register');
        return;
      }
      if (password.length < 6) {
        setError('Password must contain at least 6 characters.');
        return;
      }
    } else {
      if (!username.trim() || !password) {
        setError('Please supply both username and password.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/signup' : '/api/login';
      const body = mode === 'signup'
        ? { name: name.trim(), username: username.trim(), email: email.trim().toLowerCase(), password }
        : { username: username.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('Authentication gateway temporarily unavailable. Please retry.');
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication sequence failed.');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('dark0de_token', data.token);
      }
      onAuthSuccess(data.user, data.token);
    } catch (err: any) {
      console.error('Auth request error:', err);
      setError('Connection to security gateway timed out.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = (adminUser = 'govind') => {
    setMode('login');
    setUsername(adminUser);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* Login Box with previous chamfered HUD border */}
      <div className="border border-[#FF4D4D]/60 bg-[#140708]/90 p-6 md:p-8 chamfer-card glow-red relative">
        {/* Large LOG IN / SIGN UP Heading */}
        <div className="mb-6 mt-1">
          <h1 className="text-3xl md:text-4xl font-heading font-black tracking-widest text-[#FF4D4D] text-glow-red">
            {mode === 'login' ? 'LOG IN' : 'SIGN UP'}
          </h1>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mb-5 p-3 border border-[#FF4D4D] bg-[#FF4D4D]/10 text-[#FF4D4D] text-xs font-mono chamfer-btn flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-mono text-[#8E8A8B] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0506] border border-[#FF4D4D]/50 focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#8E8A8B]/40 chamfer-btn transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-[#8E8A8B] uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0A0506] border border-[#FF4D4D]/50 focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#8E8A8B]/40 chamfer-btn transition-colors"
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-mono text-[#8E8A8B] uppercase tracking-wider">
                  Academic Email Address
                </label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@itbhu.ac.in"
                className={`w-full bg-[#0A0506] border px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#8E8A8B]/40 chamfer-btn transition-colors focus:outline-none ${
                  showEmailInlineError
                    ? 'border-[#FF1A1A] focus:ring-1 focus:ring-[#FF1A1A]'
                    : isEmailValid && isEmailDirty
                    ? 'border-[#7CFF00] focus:ring-1 focus:ring-[#7CFF00]'
                    : 'border-[#FF4D4D]/50 focus:border-[#FF4D4D]'
                }`}
                required
              />
              {/* Instant Inline Error */}
              {showEmailInlineError && (
                <p className="mt-1 text-[11px] font-mono text-[#FF4D4D] flex items-center gap-1">
                  <span>⚠ Only @itbhu.ac.in email addresses can register</span>
                </p>
              )}
              {isEmailValid && isEmailDirty && (
                <p className="mt-1 text-[11px] font-mono text-[#7CFF00] flex items-center gap-1">
                  <span>✓ Domain verified (@itbhu.ac.in)</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-[#8E8A8B] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0A0506] border border-[#FF4D4D]/50 focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D] px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#8E8A8B]/40 chamfer-btn transition-colors"
              required
            />
          </div>

          {/* Solid Red LOG IN / SIGN UP Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 bg-[#FF4D4D] hover:bg-[#FF3333] active:scale-[0.99] text-black font-heading font-black tracking-widest text-sm flex items-center justify-between chamfer-btn transition-all shadow-[0_0_15px_rgba(255,77,77,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'AUTHENTICATING...' : mode === 'login' ? 'LOG IN' : 'SIGN UP'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        {/* Display DON'T HAVE AN ACCOUNT? SIGN UP below the login button */}
        <div className="mt-5 text-center text-xs font-mono text-[#8E8A8B]">
          {mode === 'login' ? (
            <span>
              DON'T HAVE AN ACCOUNT?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-[#00E5FF] hover:underline font-bold transition-colors cursor-pointer"
              >
                SIGN UP
              </button>
            </span>
          ) : (
            <span>
              ALREADY REGISTERED?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#00E5FF] hover:underline font-bold transition-colors cursor-pointer"
              >
                LOG IN
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
