import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ override: true });

function resolveMongoURI(): string {
  const envUri = process.env.MONGODB_URI;
  // If env contains the placeholder user:pass@cluster0.mongodb.net, use the real Atlas cluster
  if (envUri && !envUri.includes('user:pass@cluster0.mongodb.net')) {
    // If URI was supplied without database path (e.g. ends in / or /?retryWrites...), point to dark0de
    if (envUri.match(/mongodb\.net\/(?:\?|$)/)) {
      return envUri.replace(/mongodb\.net\/(?:\?|$)/, (match) => match.replace('/', '/dark0de' + (match.includes('?') ? '?' : '')));
    }
    return envUri;
  }
  return 'mongodb+srv://govindaragavan10_db_user:j9Adx2Qkdq3QSWba@cluster0.gxwnjkx.mongodb.net/dark0de?retryWrites=true&w=majority';
}

export const MONGODB_URI = resolveMongoURI();

let cachedConn: typeof mongoose | null = null;

export async function connectMongoDB(): Promise<typeof mongoose | null> {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }

  // Fail fast, do not hang requests when database is unreachable
  mongoose.set('bufferCommands', false);

  const opts = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 2000,
  };

  try {
    cachedConn = await mongoose.connect(MONGODB_URI, opts);
    console.log(`[dark0de] Connected to MongoDB Atlas (Database: ${cachedConn.connection.name})`);
    return cachedConn;
  } catch (err: any) {
    console.warn(`[dark0de] MongoDB Atlas connection unavailable (${err.message}). Using in-memory fallback store.`);
    return null;
  }
}
