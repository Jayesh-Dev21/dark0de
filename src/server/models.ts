import mongoose from 'mongoose';

// 1. User Schema (Collection: users)
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'participant' | 'admin';
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['participant', 'admin'],
      default: 'participant',
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'users' }
);

// 2. Solve Schema with unique compound index (Collection: solves)
export interface ISolve extends mongoose.Document {
  userId: string;
  challengeId: string;
  solvedAt: Date;
}

const SolveSchema = new mongoose.Schema<ISolve>(
  {
    userId: { type: String, required: true, index: true },
    challengeId: { type: String, required: true, index: true },
    solvedAt: { type: Date, default: Date.now },
  },
  { collection: 'solves' }
);

// Unique compound index preventing duplicate solves
SolveSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// 3. Hint Schema (Collection: hints)
export interface IHint extends mongoose.Document {
  label: string;
  clue: string;
  createdAt: Date;
}

const HintSchema = new mongoose.Schema<IHint>(
  {
    label: { type: String, required: true, trim: true },
    clue: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'hints' }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Solve = mongoose.models.Solve || mongoose.model<ISolve>('Solve', SolveSchema);
export const Hint = mongoose.models.Hint || mongoose.model<IHint>('Hint', HintSchema);
