import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '50kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api', meRoutes);
app.get('/api/health', (_q, res) => res.json({ ok: true }));
app.use('/api', (_q, res) => res.status(404).json({ error: 'Not found', code: 'NF' }));
app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ error: 'Server error', code: 'SERVER' }); });

// Optional: serve the built React app from the same server (npm run build in /client first).
const dist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (existsSync(dist)) { app.use(express.static(dist)); app.get('*', (_q, res) => res.sendFile(dist + '/index.html')); }

const { MONGODB_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET) { console.error('Set MONGODB_URI and JWT_SECRET in server/.env'); process.exit(1); }
await mongoose.connect(MONGODB_URI);
app.listen(PORT, () => console.log(`Arthsetu API on http://localhost:${PORT}`));
