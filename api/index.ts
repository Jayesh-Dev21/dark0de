import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from '../src/server/routes.js';
import { connectMongoDB } from '../src/server/mongo.js';

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure MongoDB Atlas connection on Vercel serverless invocations
app.use(async (_req, _res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (err) {
    console.error('[dark0de] Serverless MongoDB connection error:', err);
    next(err);
  }
});

// Support both /api path prefix and root mount in Vercel serverless environments
app.use('/api', routes);
app.use('/', routes);

export default app;
