# dark0de CTF — Cybersecurity Competition Platform

A futuristic cyberpunk HUD / hacker-terminal Capture The Flag (CTF) event platform built on the MERN stack (MongoDB, Express, React, Node.js) and engineered for seamless deployment on Vercel.

## 🚀 Key Features

- **Cyberpunk HUD Aesthetics**: Inspired by high-tech game interfaces with dark maroon-black theme (`#0A0506` to `#140708`), neon coral-red accents (`#FF4D4D`), muted teal panels (`#1B2A2F`), neon green access granted screens (`#7CFF00`), chamfered corners, scanlines, and vertical ruler tick marks.
- **Boot-Up Sequence**: Realistic hacker boot loader with "ATTENTION", loading tick progress bar, and automatic initialization into login screen (with skip option and `prefers-reduced-motion` support).
- **Biometric Access Card**: Full-screen neon green fingerprint terminal authorization screen upon login.
- **24-Hour Authoritative Server Countdown**: Pinned countdown timer fetching `/api/event` offset to eliminate clock drift, pulsing in the final hour, and locking flag submissions when the event closes.
- **Strict @itbhu.ac.in Email Validation**: Client-side instant inline validation and server-side strict enforcement ensuring only `@itbhu.ac.in` domain accounts can register.
- **SHA-256 Flag Verification**: Secure server-side hashing; flags are never exposed to the client. Atomic solve records with unique compound index `(userId, challengeId)` prevent race conditions and double counting.
- **Rate Limiting**:
  - Max 10 flag submissions per minute per user (backed by database records).
  - Max 5 failed login attempts per 5 minutes per IP/username.
- **Admin Clearance Scoreboard & Participant Deep-Dive**:
  - Real-time ranked scoreboard with solve counts (`X/4`), solved challenge tags, and earliest solve times.
  - Interactive participant inspector showing profile, chronological solve timeline, and detailed attempt logs.
- **Embedded HUD Shell Terminal**: Interactive footer command prompt (`root@dark0de : ~ #`) with commands like `help`, `status`, `flags`, `time`, and `clear`.

---

## 🛠 Local Setup & Development

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas cluster URI (optional for local testing; automatic in-memory store handles local testing out-of-the-box)

### 2. Environment Variables
Create or edit `.env` (refer to `.env.example`):
```bash
# Server & Client URL
APP_URL="http://localhost:3000"

# MongoDB Atlas URI (leave default/empty to run the built-in in-memory engine)
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/dark0de?retryWrites=true&w=majority"

# JWT Secret
JWT_SECRET="your_custom_jwt_secret_key"

# Admin account credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="dark0de_admin_pass_change_me!"

# 24-Hour Event Window (ISO strings)
EVENT_START="2026-10-04T00:00:00.000Z"
EVENT_END="2026-10-05T00:00:00.000Z"
```

### 3. Install & Seed
```bash
# Install dependencies
npm install

# Seed the admin account and 4 default challenges into MongoDB
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Vercel Deployment

This project is configured out-of-the-box for Vercel using serverless functions in `/api` and client SPA static building via Vite.

### Steps to Deploy on Vercel:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "dark0de CTF release"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository.
   - Framework Preset: **Vite** (or Other).
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configure Environment Variables in Vercel**:
   Under Project Settings -> Environment Variables, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `ADMIN_USERNAME`: Desired admin call sign (e.g. `admin`).
   - `ADMIN_PASSWORD`: Desired admin password.
   - `EVENT_START`: Event start timestamp (e.g. `2026-10-04T00:00:00.000Z`).
   - `EVENT_END`: Event end timestamp (e.g. `2026-10-05T00:00:00.000Z`).

4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend into `dist/` and route all `/api/*` traffic through the serverless function defined in `api/index.ts` via `vercel.json`.

5. **Post-Deploy Database Seed**:
   Run `npm run seed` locally with the production `MONGODB_URI` set in `.env` to populate the initial admin and challenge records into your Atlas database.

---

## 🎯 Challenges & Default Flags

| # | Title | Category | Placeholder Flag |
|---|---|---|---|
| 1 | SQLi Infiltration | Web Exploitation | `dark0de{sql_1nj3ct10n_byp4ss_succ3ss}` |
| 2 | Binary Vault Protocol | Reverse Engineering | `dark0de{r3v3rs3_3ng1n33r1ng_m4st3r}` |
| 3 | Cyb3r Cipher Matrix | Cryptography | `dark0de{x0r_c1ph3r_cr4ck3d_99}` |
| 4 | Ghost In The Wire | Network Forensics | `dark0de{p4ck3t_sn1ff3r_pwn3d_404}` |

*Replace placeholder flags anytime by running `npm run seed` or updating the database directly.*
