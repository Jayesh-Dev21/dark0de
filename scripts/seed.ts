import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Solve, Hint } from '../src/server/models.js';
import { MONGODB_URI } from '../src/server/mongo.js';

dotenv.config();

const ADMIN_ACCOUNTS = [
  { name: 'Govind Ragavan', email: 'govind.ragavan@itbhu.ac.in', username: 'govind', password: 'password123' },
  { name: 'Pranshu Kashyap', email: 'pranshu.kashyap@itbhu.ac.in', username: 'pranshu', password: 'password123' },
  { name: 'Amogh Anand', email: 'amogh.anand@itbhu.ac.in', username: 'amogh', password: 'password123' },
  { name: 'Vadyant', email: 'vadyant@itbhu.ac.in', username: 'vadyant', password: 'password123' },
  { name: 'Krishna', email: 'krishna@itbhu.ac.in', username: 'krishna', password: 'password123' },
  { name: 'Purushottaman', email: 'purushottaman@itbhu.ac.in', username: 'purushottaman', password: 'password123' },
  { name: 'Avishi', email: 'avishi@itbhu.ac.in', username: 'avishi', password: 'password123' },
  { name: 'System Administrator', email: 'admin@itbhu.ac.in', username: 'admin', password: 'dark0de_admin_pass_change_me!' },
];

const DEFAULT_HINTS = [
  {
    label: 'hint 1',
    clue: "The biometric login gateway processes input directly into the SQL query without parameter binding. Inspect the input authentication logic: try classical boolean bypass patterns (admin' OR 1=1--).",
  },
  {
    label: 'hint 2',
    clue: 'Examine the disassembled ELF binary. The stack canary check is disabled. Overflowing the 64-byte local buffer redirects instruction pointer execution to the internal secret routine at address 0x080484b4.',
  },
  {
    label: 'hint 3',
    clue: 'The intercepted cipher transmission was encrypted with a rolling XOR cipher using a repeating pseudo-random keystream. Analyze byte frequencies against expected ASCII syntax to reconstruct the decryption key.',
  },
  {
    label: 'hint 4',
    clue: 'Inspect the raw PCAP stream. Look for abnormal high-frequency TXT and sub-domain query packets directed to internal DNS servers containing base64 encoded payloads.',
  },
];

async function runSeed() {
  console.log('[dark0de Seed] Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[dark0de Seed] Connected to database: "${mongoose.connection.name}"`);
  } catch (connErr: any) {
    console.error('[dark0de Seed] Connection failed:', connErr.message);
    process.exit(1);
  }

  // 1. Seed All Admin Accounts
  for (const adm of ADMIN_ACCOUNTS) {
    const adminHash = await bcrypt.hash(adm.password, 10);
    const existing = await User.findOne({
      $or: [{ username: adm.username }, { email: adm.email }],
    });

    if (!existing) {
      await User.create({
        name: adm.name,
        email: adm.email,
        username: adm.username,
        passwordHash: adminHash,
        role: 'admin',
      });
      console.log(`[dark0de Seed] [users] Created admin: ${adm.username} (${adm.name})`);
    } else {
      existing.name = adm.name;
      existing.passwordHash = adminHash;
      existing.role = 'admin';
      await existing.save();
      console.log(`[dark0de Seed] [users] Updated admin: ${adm.username} (${adm.name})`);
    }
  }

  // 2. Hints
  for (const h of DEFAULT_HINTS) {
    const existing = await Hint.findOne({ label: h.label });
    if (!existing) {
      await Hint.create({
        label: h.label,
        clue: h.clue,
      });
      console.log(`[dark0de Seed] [hints] Inserted: ${h.label}`);
    }
  }

  console.log('[dark0de Seed] Active MongoDB collections updated.');
  await mongoose.disconnect();
  console.log('[dark0de Seed] Complete.');
}

runSeed().catch((err) => {
  console.error('[dark0de Seed] Unhandled error:', err);
  process.exit(1);
});
