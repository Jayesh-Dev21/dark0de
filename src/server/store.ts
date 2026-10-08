import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Solve, Hint } from './models.js';
import { connectMongoDB } from './mongo.js';

export interface DataUser {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'participant' | 'admin';
  createdAt: Date;
}

export interface DataSolve {
  id: string;
  userId: string;
  challengeId: string;
  solvedAt: Date;
}

export interface DataHint {
  id: string;
  label: string;
  clue: string;
  createdAt: Date;
}

// In-Memory Data Store fallback (used when MongoDB Atlas is unreachable)
const initialAdmins = [
  { name: 'Govind Ragavan', email: 'govind.ragavan@itbhu.ac.in', username: 'govind', password: 'govind123..' },
  { name: 'System Administrator', email: 'admin@itbhu.ac.in', username: 'admin', password: 'govind123..' },
  { name: 'Pranshu Kashyap', email: 'pranshu.kashyap@itbhu.ac.in', username: 'pranshu', password: 'password123' },
  { name: 'Amogh Anand', email: 'amogh.anand@itbhu.ac.in', username: 'amogh', password: 'password123' },
  { name: 'Vadyant', email: 'vadyant@itbhu.ac.in', username: 'vadyant', password: 'password123' },
  { name: 'Krishna', email: 'krishna@itbhu.ac.in', username: 'krishna', password: 'password123' },
  { name: 'Purushottaman', email: 'purushottaman@itbhu.ac.in', username: 'purushottaman', password: 'password123' },
  { name: 'Avishi', email: 'avishi@itbhu.ac.in', username: 'avishi', password: 'password123' },
];

const memoryUsers: Map<string, DataUser> = new Map();
const memorySolves: DataSolve[] = [];
// Hints depend completely on MongoDB database (no static seeds)
const memoryHints: DataHint[] = [];

// Initialize default memory admins and demo participant
for (const adm of initialAdmins) {
  const id = `adm_${adm.username}`;
  memoryUsers.set(id, {
    id,
    name: adm.name,
    email: adm.email.toLowerCase(),
    username: adm.username,
    passwordHash: bcrypt.hashSync(adm.password, 10),
    role: 'admin',
    createdAt: new Date(),
  });
}

// Add demo participant for quick testing
memoryUsers.set('usr_player', {
  id: 'usr_player',
  name: 'Operative Zero',
  email: 'player@itbhu.ac.in',
  username: 'player',
  passwordHash: bcrypt.hashSync('player123', 10),
  role: 'participant',
  createdAt: new Date(),
});

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function ensureDbConnection(): Promise<boolean> {
  if (isDbConnected()) return true;
  try {
    await connectMongoDB();
    return isDbConnected();
  } catch {
    return false;
  }
}

export async function findUserByUsernameOrEmail(identifier: string): Promise<DataUser | null> {
  const norm = identifier.trim().toLowerCase();
  const raw = identifier.trim();

  if (isDbConnected()) {
    try {
      const u = await User.findOne({
        $or: [{ username: raw }, { email: norm }],
      }).lean();
      if (u) {
        return {
          id: (u as any)._id.toString(),
          name: u.name,
          email: u.email,
          username: u.username,
          passwordHash: u.passwordHash,
          role: u.role,
          createdAt: u.createdAt,
        };
      }
    } catch (err) {
      console.warn('[store] DB findUser error, checking memory:', err);
    }
  }

  for (const user of memoryUsers.values()) {
    if (user.username.toLowerCase() === norm || user.email.toLowerCase() === norm) {
      return user;
    }
  }
  return null;
}

export async function findUserById(id: string): Promise<DataUser | null> {
  if (isDbConnected()) {
    try {
      const u = await User.findById(id).select('-passwordHash').lean();
      if (u) {
        return {
          id: (u as any)._id.toString(),
          name: u.name,
          email: u.email,
          username: u.username,
          passwordHash: '',
          role: u.role,
          createdAt: u.createdAt,
        };
      }
    } catch (err) {
      console.warn('[store] DB findUserById error, checking memory:', err);
    }
  }

  const u = memoryUsers.get(id);
  return u || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'participant' | 'admin';
}): Promise<DataUser> {
  if (isDbConnected()) {
    try {
      const doc = await User.create({
        name: data.name,
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        role: data.role,
      });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        username: doc.username,
        passwordHash: doc.passwordHash,
        role: doc.role,
        createdAt: doc.createdAt,
      };
    } catch (err) {
      console.warn('[store] DB createUser error, storing in memory:', err);
    }
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser: DataUser = {
    id,
    name: data.name,
    email: data.email,
    username: data.username,
    passwordHash: data.passwordHash,
    role: data.role,
    createdAt: new Date(),
  };
  memoryUsers.set(id, newUser);
  return newUser;
}

export async function getUserSolves(userId: string): Promise<DataSolve[]> {
  if (isDbConnected()) {
    try {
      const dbSolves = await Solve.find({ userId }).lean();
      return dbSolves.map((s: any) => ({
        id: s._id.toString(),
        userId: s.userId,
        challengeId: s.challengeId,
        solvedAt: s.solvedAt,
      }));
    } catch (err) {
      console.warn('[store] DB getUserSolves error, falling back to memory:', err);
    }
  }

  return memorySolves.filter((s) => s.userId === userId);
}

export async function hasUserSolved(userId: string, challengeId: string): Promise<boolean> {
  if (isDbConnected()) {
    try {
      const existing = await Solve.findOne({ userId, challengeId }).lean();
      if (existing) return true;
    } catch (err) {
      console.warn('[store] DB hasUserSolved error, falling back to memory:', err);
    }
  }

  return memorySolves.some((s) => s.userId === userId && s.challengeId === challengeId);
}

export async function recordSolve(userId: string, challengeId: string): Promise<DataSolve> {
  if (isDbConnected()) {
    try {
      const doc = await Solve.create({
        userId,
        challengeId,
        solvedAt: new Date(),
      });
      return {
        id: doc._id.toString(),
        userId: doc.userId,
        challengeId: doc.challengeId,
        solvedAt: doc.solvedAt,
      };
    } catch (err) {
      console.warn('[store] DB recordSolve error, saving to memory:', err);
    }
  }

  const newSolve: DataSolve = {
    id: `sol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    challengeId,
    solvedAt: new Date(),
  };
  memorySolves.push(newSolve);
  return newSolve;
}

export async function getAllSolves(): Promise<DataSolve[]> {
  if (isDbConnected()) {
    try {
      const dbSolves = await Solve.find().lean();
      return dbSolves.map((s: any) => ({
        id: s._id.toString(),
        userId: s.userId,
        challengeId: s.challengeId,
        solvedAt: s.solvedAt,
      }));
    } catch (err) {
      console.warn('[store] DB getAllSolves error, falling back to memory:', err);
    }
  }

  return [...memorySolves];
}

export async function getAllParticipants(): Promise<DataUser[]> {
  if (isDbConnected()) {
    try {
      const dbParticipants = await User.find({ role: 'participant' }).select('-passwordHash').lean();
      return dbParticipants.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        username: p.username,
        passwordHash: '',
        role: p.role,
        createdAt: p.createdAt,
      }));
    } catch (err) {
      console.warn('[store] DB getAllParticipants error, falling back to memory:', err);
    }
  }

  return Array.from(memoryUsers.values()).filter((u) => u.role === 'participant');
}

export async function getAllHints(): Promise<DataHint[]> {
  await ensureDbConnection();

  if (isDbConnected()) {
    try {
      const dbHints = await Hint.find().sort({ createdAt: 1 }).lean();
      return dbHints.map((h: any) => ({
        id: h._id.toString(),
        label: h.label,
        clue: h.clue,
        createdAt: h.createdAt,
      }));
    } catch (err) {
      console.error('[store] DB getAllHints error:', err);
    }
  }

  // Purely dynamic memory store (no static hardcoded hints)
  return [...memoryHints].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function countHints(): Promise<number> {
  await ensureDbConnection();

  if (isDbConnected()) {
    try {
      return await Hint.countDocuments();
    } catch (err) {
      console.error('[store] DB countHints error:', err);
    }
  }
  return memoryHints.length;
}

export async function createHint(label: string, clue: string): Promise<DataHint> {
  await ensureDbConnection();

  if (isDbConnected()) {
    try {
      const doc = await Hint.create({ label, clue });
      return {
        id: doc._id.toString(),
        label: doc.label,
        clue: doc.clue,
        createdAt: doc.createdAt,
      };
    } catch (err) {
      console.error('[store] DB createHint error:', err);
    }
  }

  const newHint: DataHint = {
    id: `hnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    label,
    clue,
    createdAt: new Date(),
  };
  memoryHints.push(newHint);
  return newHint;
}

export async function deleteHint(id: string): Promise<boolean> {
  await ensureDbConnection();

  if (isDbConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const res = await Hint.findByIdAndDelete(id);
        if (res) return true;
      } else {
        const res = await Hint.deleteOne({ _id: id });
        if (res.deletedCount > 0) return true;
      }
    } catch (err) {
      console.error('[store] DB deleteHint error:', err);
    }
  }

  const idx = memoryHints.findIndex((h) => h.id === id);
  if (idx !== -1) {
    memoryHints.splice(idx, 1);
    return true;
  }
  return false;
}
