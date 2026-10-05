import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Solve, Hint } from './models.js';
import { hashFlag, FIXED_CHALLENGES } from './challenges.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  requireAdmin,
  AuthenticatedRequest,
} from './auth.js';

const router = express.Router();

// Helper: validate @itbhu.ac.in domain
function isValidItbhuEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith('@itbhu.ac.in') && normalized.length > '@itbhu.ac.in'.length;
}

// Event window configuration
export function getEventWindow() {
  const now = Date.now();
  let startsAt = process.env.EVENT_START ? new Date(process.env.EVENT_START).getTime() : 0;
  let endsAt = process.env.EVENT_END ? new Date(process.env.EVENT_END).getTime() : 0;

  // Default fallback: 24h event active now
  if (!startsAt || isNaN(startsAt) || !endsAt || isNaN(endsAt) || endsAt <= now) {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    startsAt = now - 2 * 60 * 60 * 1000;
    endsAt = startsAt + twentyFourHours;
  }

  return {
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
    serverNow: now,
  };
}

// --- PUBLIC ROUTES ---

// GET /api/health - verify database connectivity and system status
router.get('/health', (_req, res) => {
  const readyState = mongoose.connection.readyState;
  const statusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const isHealthy = readyState === 1;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    database: statusMap[readyState] || 'unknown',
    databaseName: mongoose.connection.name || 'dark0de',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/event - public event status and window
router.get('/event', (_req, res) => {
  res.json(getEventWindow());
});

// POST /api/signup
router.post('/signup', async (req, res: Response): Promise<void> => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      res.status(400).json({ error: 'All fields (name, email, username, password) are required' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    // Enforce @itbhu.ac.in rule
    if (!isValidItbhuEmail(trimmedEmail)) {
      res.status(400).json({ error: 'Only @itbhu.ac.in email addresses can register' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Check existing email or username in MongoDB
    const existingUser = await User.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        res.status(409).json({ error: 'Email is already registered' });
        return;
      }
      res.status(409).json({ error: 'Username is already taken' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      username: trimmedUsername,
      passwordHash,
      role: 'participant',
    });

    const token = signToken({ userId: newUser._id.toString(), role: 'participant' });
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/login - No rate limiting
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const trimmedUsername = username.trim();

    const user = await User.findOne({
      $or: [
        { username: trimmedUsername },
        { email: trimmedUsername.toLowerCase() },
      ],
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });
    setAuthCookie(res, token);

    res.json({
      message: 'Access granted',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// POST /api/logout
router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// --- AUTHENTICATED USER ROUTES ---

// GET /api/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// GET /api/challenges - Fixed challenges list with user solve status from MongoDB
router.get('/challenges', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userSolves = await Solve.find({ userId }).lean();
    const solvedIds = new Set(userSolves.map((s: any) => s.challengeId));

    const result = FIXED_CHALLENGES.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      points: c.points,
      isSolved: solvedIds.has(c.id),
    }));

    res.json({ challenges: result });
  } catch (err) {
    console.error('Fetch challenges error:', err);
    res.status(500).json({ error: 'Failed to retrieve challenges' });
  }
});

// GET /api/hints - fetch all active hints from MongoDB
router.get('/hints', async (_req, res) => {
  try {
    const dbHints = await Hint.find().sort({ createdAt: 1 }).lean();
    res.json({
      hints: dbHints.map((h: any) => ({
        id: h._id.toString(),
        label: h.label,
        clue: h.clue,
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    console.error('Fetch hints error:', err);
    res.status(500).json({ error: 'Failed to retrieve hints from database' });
  }
});

// POST /api/hints - add a new hint in MongoDB (admin only)
router.post('/hints', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clue, label } = req.body;
    if (!clue || typeof clue !== 'string' || !clue.trim()) {
      res.status(400).json({ error: 'Hint intel text cannot be empty' });
      return;
    }

    const totalHints = await Hint.countDocuments();
    const finalLabel = label && label.trim() ? label.trim().toLowerCase() : `hint ${totalHints + 1}`;

    const newHintDoc = await Hint.create({
      label: finalLabel,
      clue: clue.trim(),
    });

    const allHints = await Hint.find().sort({ createdAt: 1 }).lean();
    res.status(201).json({
      hint: {
        id: (newHintDoc as any)._id.toString(),
        label: newHintDoc.label,
        clue: newHintDoc.clue,
      },
      hints: allHints.map((h: any) => ({
        id: h._id.toString(),
        label: h.label,
        clue: h.clue,
        createdAt: h.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('Add hint error:', err);
    res.status(500).json({ error: 'Failed to broadcast hint' });
  }
});

// POST /api/submit - Flag submission directly against fixed challenges
router.post('/submit', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'participant') {
      res.status(403).json({ error: 'Only participants can submit challenge flags' });
      return;
    }

    const userId = req.user!.userId;
    const { challengeId, flag } = req.body;

    if (typeof flag !== 'string' || !flag.trim()) {
      res.status(400).json({ error: 'Flag string is required' });
      return;
    }

    // Check event window
    const now = Date.now();
    const eventWindow = getEventWindow();
    const startTime = new Date(eventWindow.startsAt).getTime();
    const endTime = new Date(eventWindow.endsAt).getTime();

    if (now < startTime) {
      res.status(403).json({ error: 'Event has not started' });
      return;
    }
    if (now > endTime) {
      res.status(403).json({ error: 'Event has ended' });
      return;
    }

    const trimmedFlag = flag.trim();
    const submittedHash = hashFlag(trimmedFlag);

    // Match against FIXED_CHALLENGES
    let matchedChallenge = challengeId && challengeId !== 'auto'
      ? FIXED_CHALLENGES.find((c) => c.id === challengeId && (c.flagHash === submittedHash || c.acceptedHashes?.includes(submittedHash)))
      : FIXED_CHALLENGES.find((c) => c.flagHash === submittedHash || c.acceptedHashes?.includes(submittedHash));

    if (!matchedChallenge) {
      res.json({
        status: 'incorrect',
        message: 'INVALID SIGNATURE: Flag rejected by security kernel.',
      });
      return;
    }

    // Check if already solved in MongoDB
    const isAlreadySolved = await Solve.findOne({
      userId,
      challengeId: matchedChallenge.id,
    });

    if (isAlreadySolved) {
      res.json({
        status: 'already_solved',
        message: 'CORRECT But you already submitted this.',
      });
      return;
    }

    // Record solve in MongoDB
    await Solve.create({
      userId,
      challengeId: matchedChallenge.id,
      solvedAt: new Date(),
    });

    res.json({
      status: 'correct',
      message: 'SOLVED',
      challengeId: matchedChallenge.id,
      challengeTitle: matchedChallenge.title,
    });
  } catch (err: any) {
    console.error('Submit flag error:', err);
    res.status(500).json({ error: 'System malfunction processing submission' });
  }
});

// --- ADMIN ONLY ROUTES ---

// GET /api/scorecard - Admin leaderboard from MongoDB
router.get('/scorecard', requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalChallenges = FIXED_CHALLENGES.length;
    const challengeTitleMap = new Map(FIXED_CHALLENGES.map((c) => [c.id, c.title]));

    const participants = await User.find({ role: 'participant' }).select('-passwordHash').lean();
    const allSolves = await Solve.find().lean();

    const participantStats = participants.map((p: any) => {
      const pSolves = allSolves.filter((s: any) => s.userId.toString() === p._id.toString());
      const solvedCount = pSolves.length;
      const solvedChallenges = pSolves.map((s: any) => challengeTitleMap.get(s.challengeId) || s.challengeId);

      let lastSolveTime: Date | null = null;
      if (pSolves.length > 0) {
        const sorted = pSolves.sort((a: any, b: any) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime());
        lastSolveTime = sorted[0].solvedAt;
      }

      return {
        userId: p._id.toString(),
        username: p.username,
        name: p.name,
        email: p.email,
        solvedCount: `${solvedCount}/${totalChallenges}`,
        solvedCountNum: solvedCount,
        solvedChallenges,
        lastSolveTime: lastSolveTime ? new Date(lastSolveTime).toISOString() : null,
        registeredAt: p.createdAt,
      };
    });

    // Sort by solved count desc, then earliest last solve time
    participantStats.sort((a, b) => {
      if (b.solvedCountNum !== a.solvedCountNum) {
        return b.solvedCountNum - a.solvedCountNum;
      }
      if (!a.lastSolveTime && !b.lastSolveTime) return 0;
      if (!a.lastSolveTime) return 1;
      if (!b.lastSolveTime) return -1;
      return new Date(a.lastSolveTime).getTime() - new Date(b.lastSolveTime).getTime();
    });

    res.json({
      participants: participantStats,
      totalChallenges,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Scorecard error:', err);
    res.status(500).json({ error: 'Failed to generate admin scorecard' });
  }
});

// GET /api/view?userId=... - Admin inspect single participant from MongoDB
router.get('/view', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.query.userId as string;

    if (!targetUserId) {
      res.status(400).json({ error: 'userId query parameter is required' });
      return;
    }

    const challengeMap = new Map(FIXED_CHALLENGES.map((c) => [c.id, c]));

    const user = await User.findById(targetUserId).select('-passwordHash').lean();
    if (!user) {
      res.status(404).json({ error: 'Participant not located in system' });
      return;
    }

    const solves = await Solve.find({ userId: targetUserId }).sort({ solvedAt: 1 }).lean();

    const solveTimeline = solves.map((s: any) => ({
      challengeId: s.challengeId,
      challengeTitle: challengeMap.get(s.challengeId)?.title || 'Unknown Target',
      category: challengeMap.get(s.challengeId)?.category || 'General',
      solvedAt: s.solvedAt,
    }));

    res.json({
      participant: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        registeredAt: user.createdAt,
      },
      solveTimeline,
      attemptLog: [],
    });
  } catch (err) {
    console.error('Participant inspect view error:', err);
    res.status(500).json({ error: 'Failed to load participant telemetry' });
  }
});

export default router;
