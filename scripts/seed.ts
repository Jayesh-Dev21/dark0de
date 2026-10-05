import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Solve, Hint } from '../src/server/models.js';
import { MONGODB_URI } from '../src/server/mongo.js';

dotenv.config();

const ADMIN_ACCOUNTS = [
  { name: 'Govind Ragavan', email: 'govind.ragavan@itbhu.ac.in', username: 'govind', password: 'govind123..' },
  { name: 'System Administrator', email: 'admin@itbhu.ac.in', username: 'admin', password: 'govind123..' },
  { name: 'Pranshu Kashyap', email: 'pranshu.kashyap@itbhu.ac.in', username: 'pranshu', password: 'password123' },
  { name: 'Amogh Anand', email: 'amogh.anand@itbhu.ac.in', username: 'amogh', password: 'password123' },
  { name: 'Vadyant', email: 'vadyant@itbhu.ac.in', username: 'vadyant', password: 'password123' },
  { name: 'Krishna', email: 'krishna@itbhu.ac.in', username: 'krishna', password: 'password123' },
  { name: 'Purushottaman', email: 'purushottaman@itbhu.ac.in', username: 'purushottaman', password: 'password123' },
  { name: 'Avishi', email: 'avishi@itbhu.ac.in', username: 'avishi', password: 'password123' },
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

  // 1. Seed & Update All Admin Accounts
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

  console.log('[dark0de Seed] Admin accounts successfully synchronized.');
  await mongoose.disconnect();
  console.log('[dark0de Seed] Complete.');
}

runSeed().catch((err) => {
  console.error('[dark0de Seed] Unhandled error:', err);
  process.exit(1);
});
