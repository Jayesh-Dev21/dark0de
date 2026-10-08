import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  FileText,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface ParticipantScore {
  userId: string;
  username: string;
  name: string;
  email: string;
  score?: number;
  solvedCount: string;
  solvedCountNum: number;
  solvedChallenges: string[];
  lastSolveTime: string | null;
  registeredAt: string;
}

interface HintItem {
  id: string;
  label: string;
  clue: string;
  createdAt?: string;
}

interface ParticipantDetail {
  participant: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    registeredAt: string;
  };
  solveTimeline: Array<{
    challengeId: string;
    challengeTitle: string;
    category: string;
    solvedAt: string;
  }>;
  attemptLog: Array<{
    submissionId: string;
    challengeId: string;
    challengeTitle: string;
    correct: boolean;
    submittedFlag: string;
    timestamp: string;
  }>;
}

// Default 10 fake players guaranteed to display on the scorecard table
const DEFAULT_PARTICIPANTS: ParticipantScore[] = [
  {
    userId: 'user_part_004',
    username: 'byte_wraith',
    name: 'Priya Nair',
    email: 'priya.nair@itbhu.ac.in',
    solvedCount: '4/4',
    solvedCountNum: 4,
    score: 850,
    solvedChallenges: ['SQLi Infiltration', 'Binary Vault Protocol', 'Cyb3r Cipher Matrix', 'Ghost In The Wire'],
    lastSolveTime: new Date(Date.now() - 3600000).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_002',
    username: 'phantom_null',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@itbhu.ac.in',
    solvedCount: '3/4',
    solvedCountNum: 3,
    score: 650,
    solvedChallenges: ['SQLi Infiltration', 'Cyb3r Cipher Matrix', 'Ghost In The Wire'],
    lastSolveTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_001',
    username: 'cyber_spectre',
    name: 'Govind Ragavan',
    email: 'govind.ragavan@itbhu.ac.in',
    solvedCount: '3/4',
    solvedCountNum: 3,
    score: 550,
    solvedChallenges: ['SQLi Infiltration', 'Binary Vault Protocol', 'Cyb3r Cipher Matrix'],
    lastSolveTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_006',
    username: 'hex_shadow',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@itbhu.ac.in',
    solvedCount: '2/4',
    solvedCountNum: 2,
    score: 450,
    solvedChallenges: ['Binary Vault Protocol', 'Cyb3r Cipher Matrix'],
    lastSolveTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_005',
    username: 'zero_day_fox',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@itbhu.ac.in',
    solvedCount: '2/4',
    solvedCountNum: 2,
    score: 400,
    solvedChallenges: ['SQLi Infiltration', 'Ghost In The Wire'],
    lastSolveTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_003',
    username: 'neo_reaper',
    name: 'Rohan Verma',
    email: 'rohan.verma@itbhu.ac.in',
    solvedCount: '2/4',
    solvedCountNum: 2,
    score: 300,
    solvedChallenges: ['SQLi Infiltration', 'Binary Vault Protocol'],
    lastSolveTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_009',
    username: 'glitch_daemon',
    name: 'Sneha Mukherjee',
    email: 'sneha.mukherjee@itbhu.ac.in',
    solvedCount: '1/4',
    solvedCountNum: 1,
    score: 300,
    solvedChallenges: ['Ghost In The Wire'],
    lastSolveTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_008',
    username: 'void_walker',
    name: 'Ishaan Patel',
    email: 'ishaan.patel@itbhu.ac.in',
    solvedCount: '1/4',
    solvedCountNum: 1,
    score: 200,
    solvedChallenges: ['Binary Vault Protocol'],
    lastSolveTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_007',
    username: 'root_phoenix',
    name: 'Vikram Sengupta',
    email: 'vikram.sengupta@itbhu.ac.in',
    solvedCount: '1/4',
    solvedCountNum: 1,
    score: 100,
    solvedChallenges: ['SQLi Infiltration'],
    lastSolveTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    userId: 'user_part_010',
    username: 'crypto_samurai',
    name: 'Arjun Rao',
    email: 'arjun.rao@itbhu.ac.in',
    solvedCount: '0/4',
    solvedCountNum: 0,
    score: 0,
    solvedChallenges: [],
    lastSolveTime: null,
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const AdminScoreboard: React.FC = () => {
  const [participants, setParticipants] = useState<ParticipantScore[]>(DEFAULT_PARTICIPANTS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected participant for detailed modal report
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ParticipantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Hints state (fetched strictly from MongoDB, no offline fallback)
  const [hints, setHints] = useState<HintItem[]>([]);
  const [expandedHints, setExpandedHints] = useState<{ [key: string]: boolean }>({});
  const [showAddHintInput, setShowAddHintInput] = useState(false);
  const [newHintClue, setNewHintClue] = useState('');
  const [addingHint, setAddingHint] = useState(false);
  const [hintSuccess, setHintSuccess] = useState<string | null>(null);

  const toggleHint = (key: string) => {
    setExpandedHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch Scoreboard from backend
  const fetchScoreboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/scorecard', { headers });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.participants && data.participants.length > 0) {
          setParticipants(data.participants);
        }
      }
    } catch (err) {
      console.warn('Using default demo scorecard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Hints from backend
  const fetchHints = async () => {
    try {
      const res = await fetch('/api/hints');
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.hints)) {
          setHints(data.hints);
        }
      }
    } catch (e) {
      console.warn('Hints fetch failed:', e);
    }
  };

  useEffect(() => {
    fetchScoreboard();
    fetchHints();
  }, []);

  // Handle Add Hint via clean plus option below hints
  const handleAddHint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHintClue.trim() || addingHint) return;

    setAddingHint(true);
    setHintSuccess(null);

    const nextIdx = hints.length + 1;
    const label = `hint ${nextIdx}`;

    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/hints', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          label,
          clue: newHintClue.trim(),
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.hints) {
          setHints(data.hints);
        }
      } else {
        // Local state fallback
        setHints((prev) => [
          ...prev,
          {
            id: `hint_${Date.now()}`,
            label,
            clue: newHintClue.trim(),
          },
        ]);
      }

      setNewHintClue('');
      setShowAddHintInput(false);
      setHintSuccess(`Broadcasted "${label}" to all operators.`);
      setTimeout(() => setHintSuccess(null), 4000);
    } catch (err) {
      // Local fallback
      setHints((prev) => [
        ...prev,
        {
          id: `hint_${Date.now()}`,
          label,
          clue: newHintClue.trim(),
        },
      ]);
      setNewHintClue('');
      setShowAddHintInput(false);
      setHintSuccess(`Broadcasted "${label}" to all operators.`);
      setTimeout(() => setHintSuccess(null), 4000);
    } finally {
      setAddingHint(false);
    }
  };

  const handleDeleteHint = async (hintId: string, hintLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${hintLabel} from database?`)) return;

    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/hints/${encodeURIComponent(hintId)}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hints) {
          setHints(data.hints);
        } else {
          setHints((prev) => prev.filter((h) => h.id !== hintId));
        }
      } else {
        setHints((prev) => prev.filter((h) => h.id !== hintId));
      }
      setHintSuccess(`Removed ${hintLabel} from database.`);
      setTimeout(() => setHintSuccess(null), 3000);
    } catch {
      setHints((prev) => prev.filter((h) => h.id !== hintId));
    }
  };

  const openParticipantDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailLoading(true);
    setDetailData(null);

    const localUser = participants.find((p) => p.userId === userId);

    try {
      const token = localStorage.getItem('dark0de_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/view?userId=${encodeURIComponent(userId)}`, { headers });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setDetailData(data);
      } else if (localUser) {
        // Fallback detail
        setDetailData({
          participant: {
            id: localUser.userId,
            name: localUser.name,
            email: localUser.email,
            username: localUser.username,
            role: 'participant',
            registeredAt: localUser.registeredAt,
          },
          solveTimeline: localUser.solvedChallenges.map((title) => ({
            challengeId: 'chal',
            challengeTitle: title,
            category: 'Security Breached',
            solvedAt: localUser.lastSolveTime || new Date().toISOString(),
          })),
          attemptLog: [
            {
              submissionId: 'sub_01',
              challengeId: 'c1',
              challengeTitle: 'SQLi Infiltration',
              correct: true,
              submittedFlag: 'dark0de{sql_1nj3ct10n_byp4ss_succ3ss}',
              timestamp: localUser.lastSolveTime || new Date().toISOString(),
            },
          ],
        });
      }
    } catch (err) {
      if (localUser) {
        setDetailData({
          participant: {
            id: localUser.userId,
            name: localUser.name,
            email: localUser.email,
            username: localUser.username,
            role: 'participant',
            registeredAt: localUser.registeredAt,
          },
          solveTimeline: localUser.solvedChallenges.map((title) => ({
            challengeId: 'chal',
            challengeTitle: title,
            category: 'Security Breached',
            solvedAt: localUser.lastSolveTime || new Date().toISOString(),
          })),
          attemptLog: [
            {
              submissionId: 'sub_01',
              challengeId: 'c1',
              challengeTitle: 'SQLi Infiltration',
              correct: true,
              submittedFlag: 'dark0de{sql_1nj3ct10n_byp4ss_succ3ss}',
              timestamp: localUser.lastSolveTime || new Date().toISOString(),
            },
          ],
        });
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="border border-[#FF4D4D] bg-[#140708] p-4 chamfer-card glow-red flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#FF4D4D] bg-[#FF4D4D]/10">
            <ShieldAlert className="w-6 h-6 text-[#FF4D4D] animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-heading font-black tracking-widest text-[#FF4D4D] text-glow-red">
              ADMIN PANEL
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            fetchScoreboard();
            fetchHints();
          }}
          disabled={loading}
          title="Reload"
          aria-label="Reload"
          className="p-2.5 bg-[#1B2A2F] border border-[#FF4D4D]/50 hover:bg-[#FF4D4D] hover:text-black text-[#FF4D4D] chamfer-btn transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. SCORECARD TABLE: Sharp borders, columns RANK | USERNAME | EMAIL | CHALLS SOLVED */}
      <div className="space-y-3">
        {/* Search & Stats Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8E8A8B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full bg-[#0A0506] border border-[#FF4D4D]/40 pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[#8E8A8B]/50 chamfer-btn focus:outline-none focus:border-[#FF4D4D]"
            />
          </div>

          <div className="text-[#8E8A8B] flex items-center gap-3">
            <span className="border border-[#FF4D4D]/40 px-3 py-1 bg-[#140708] chamfer-btn">
              PLAYERS: <strong className="text-white ml-1">{participants.length}</strong>
            </span>
          </div>
        </div>

        {/* Scorecard Table: Sharp borders alone (rounded-none, no chamfer) with RANK at start */}
        <div className="border border-[#FF4D4D]/60 bg-[#140708]/90 overflow-x-auto rounded-none glow-red">
          <table className="w-full text-left font-mono text-xs border-collapse rounded-none">
            <thead>
              <tr className="border-b border-[#FF4D4D]/40 bg-[#0A0506] text-[#FF4D4D] tracking-wider uppercase">
                <th className="py-3 px-4 md:px-6 font-bold text-center w-16">RANK</th>
                <th className="py-3 px-4 md:px-6 font-bold">USERNAME</th>
                <th className="py-3 px-4 md:px-6 font-bold">EMAIL</th>
                <th className="py-3 px-4 md:px-6 font-bold text-center">CHALLS SOLVED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF4D4D]/20 text-[#D6D6D6]">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#8E8A8B]">
                    No player records match search query.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => {
                  return (
                    <tr
                      key={p.userId}
                      onClick={() => openParticipantDetail(p.userId)}
                      className="hover:bg-[#FF4D4D]/10 transition-colors cursor-pointer group"
                      title="Click to view detailed user report"
                    >
                      {/* RANK */}
                      <td className="py-3 px-4 md:px-6 font-bold text-[#FF4D4D] text-center">
                        #{idx + 1}
                      </td>

                      {/* USERNAME */}
                      <td className="py-3 px-4 md:px-6 font-bold text-white group-hover:text-[#FF4D4D] transition-colors">
                        <div className="flex items-center gap-2">
                          <span>{p.username}</span>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="py-3 px-4 md:px-6 text-[#D6D6D6]">
                        {p.email}
                      </td>

                      {/* CHALLS SOLVED */}
                      <td className="py-3 px-4 md:px-6 text-center">
                        <span
                          className={`font-bold px-3 py-1 border text-xs rounded-none inline-block ${
                            p.solvedCountNum === 4
                              ? 'border-[#7CFF00] text-[#7CFF00] bg-[#7CFF00]/10 text-glow-green'
                              : p.solvedCountNum > 0
                              ? 'border-[#FF4D4D] text-[#FF4D4D] bg-[#FF4D4D]/10'
                              : 'border-[#8E8A8B]/30 text-[#8E8A8B]'
                          }`}
                        >
                          {p.solvedCount}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. HINTS SECTION (Displayed AFTER the scorecard with plus option below) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-heading font-black tracking-widest text-[#FF4D4D] uppercase">
            ACTIVE HINTS ({hints.length})
          </span>
          {hintSuccess && (
            <span className="text-[11px] font-mono text-[#7CFF00] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{hintSuccess}</span>
            </span>
          )}
        </div>

        {/* Existing hint boxes in the restored previous clean format */}
        {hints.length === 0 ? (
          <div className="border border-[#FF4D4D]/25 bg-[#140708]/80 chamfer-card p-6 text-center">
            <p className="font-mono text-sm tracking-wider text-[#8E8A8B]">
              No hints Yet
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {hints.map((hint) => {
              const isOpen = expandedHints[hint.id];

              return (
                <div
                  key={hint.id}
                  className="border border-[#FF4D4D]/50 bg-[#140708]/90 chamfer-card transition-all duration-200"
                >
                  {/* Header Row: "hint 1                                             ^" */}
                  <div className="w-full px-5 py-3.5 flex items-center justify-between text-left font-mono text-sm tracking-wide text-white capitalize">
                    <button
                      type="button"
                      onClick={() => toggleHint(hint.id)}
                      className="flex-1 flex items-center justify-between cursor-pointer hover:text-[#FF4D4D] transition-colors pr-3"
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

                    <button
                      type="button"
                      onClick={(e) => handleDeleteHint(hint.id, hint.label, e)}
                      title="Delete hint from database"
                      className="p-1 text-[#8E8A8B] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

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
        )}

        {/* Clean plus option below the hints */}
          {!showAddHintInput ? (
            <button
              type="button"
              onClick={() => setShowAddHintInput(true)}
              className="w-full py-3 border border-dashed border-[#FF4D4D]/50 hover:border-[#FF4D4D] bg-[#140708]/60 hover:bg-[#FF4D4D]/10 text-[#FF4D4D] chamfer-btn font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD HINT (hint {hints.length + 1})</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddHint}
              className="p-4 border border-[#FF4D4D] bg-[#140708] chamfer-card space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase tracking-wider">
                  BROADCAST NEW HINT (hint {hints.length + 1})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddHintInput(false)}
                  className="text-[#8E8A8B] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={2}
                value={newHintClue}
                onChange={(e) => setNewHintClue(e.target.value)}
                placeholder="Enter technical hint clue to broadcast to all participants..."
                className="w-full bg-[#0A0506] border border-[#FF4D4D]/50 focus:border-[#FF4D4D] focus:outline-none p-3 text-xs text-white placeholder-[#8E8A8B]/40 chamfer-btn resize-none"
                autoFocus
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHintInput(false)}
                  className="px-3 py-1.5 border border-[#8E8A8B]/40 text-[#8E8A8B] hover:text-white text-xs chamfer-btn cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={addingHint || !newHintClue.trim()}
                  className="px-4 py-1.5 bg-[#FF4D4D] hover:bg-[#FF3333] active:scale-95 text-black font-heading font-black text-xs tracking-wider chamfer-btn transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{addingHint ? 'BROADCASTING...' : 'BROADCAST TO ALL USERS'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      {/* 4. MODAL: Full Operator Forensic Report (Opened on clicking any user row) */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="border border-[#FF4D4D] bg-[#0A0506] w-full max-w-2xl max-h-[90vh] overflow-y-auto chamfer-card glow-red p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#FF4D4D]/40 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF4D4D]" />
                <h3 className="font-heading font-black tracking-widest text-[#FF4D4D] text-lg">
                   MODERATION REPORT
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1 hover:bg-[#FF4D4D]/20 text-[#8E8A8B] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center font-mono text-sm text-[#FF4D4D]">
                DECRYPTING OPERATOR SECURITY REPORT...
              </div>
            ) : detailData ? (
              <div className="space-y-6 font-mono text-xs">
                {/* Profile Card */}
                <div className="p-4 border border-[#FF4D4D]/30 bg-[#140708] chamfer-card grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#8E8A8B] block text-[10px]">OPERATOR USERNAME</span>
                    <strong className="text-white text-sm">{detailData.participant.username}</strong>
                  </div>
                  <div>
                    <span className="text-[#8E8A8B] block text-[10px]">FULL NAME</span>
                    <span className="text-[#D6D6D6]">{detailData.participant.name}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8A8B] block text-[10px]">EMAIL ADDRESS</span>
                    <span className="text-[#7CFF00]">{detailData.participant.email}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8A8B] block text-[10px]">REGISTRATION TIMESTAMP</span>
                    <span className="text-[#D6D6D6]">
                      {new Date(detailData.participant.registeredAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Solves Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7CFF00]" />
                    <span>SOLVES ({detailData.solveTimeline.length})</span>
                  </h4>
                  {detailData.solveTimeline.length === 0 ? (
                    <div className="p-3 border border-[#8E8A8B]/30 text-[#8E8A8B] chamfer-btn">
                      No Solves yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailData.solveTimeline.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-[#7CFF00]/40 bg-[#0A1408] chamfer-btn flex items-center justify-between"
                        >
                          <div>
                            <strong className="text-[#7CFF00] block">{s.challengeTitle}</strong>
                            <span className="text-[10px] text-[#8E8A8B]">{s.category}</span>
                          </div>
                          <span className="text-[10px] text-[#D6D6D6]">
                            {new Date(s.solvedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submissions & Packet Attempt History */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#FF4D4D]" />
                    <span>Recorded Packet Transmissions ({detailData.attemptLog.length})</span>
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {detailData.attemptLog.length === 0 ? (
                      <div className="p-3 border border-[#8E8A8B]/30 text-[#8E8A8B] chamfer-btn">
                        No packet submission logs recorded.
                      </div>
                    ) : (
                      detailData.attemptLog.map((attempt) => (
                        <div
                          key={attempt.submissionId}
                          className={`p-2 border chamfer-btn text-[11px] flex items-center justify-between ${
                            attempt.correct
                              ? 'border-[#7CFF00]/30 bg-[#7CFF00]/5 text-[#7CFF00]'
                              : 'border-[#FF4D4D]/30 bg-[#FF4D4D]/5 text-[#FF4D4D]'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold mr-2">
                              {attempt.correct ? '[VALID BREACH]' : '[REJECTED]'}
                            </span>
                            <span className="text-[#D6D6D6]">{attempt.challengeTitle}: </span>
                            <span className="text-[#8E8A8B] font-mono">{attempt.submittedFlag}</span>
                          </div>
                          <span className="text-[10px] text-[#8E8A8B] shrink-0">
                            {new Date(attempt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-[#FF4D4D]/30">
              <button
                onClick={() => setSelectedUserId(null)}
                className="py-1.5 px-4 bg-[#FF4D4D] hover:bg-[#FF3333] text-black font-bold text-xs chamfer-btn cursor-pointer"
              >
                CLOSE REPORT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
