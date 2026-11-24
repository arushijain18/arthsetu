import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sign, requireAuth } from '../middleware/auth.js';
const r = Router();
const okMail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const publicUser = (u) => ({ name: u.name, email: u.email, lang: u.lang });
export const progressOf = (u) => Object.fromEntries(u.progress || []);

// New people must sign up. An email that already exists cannot sign up again (DUP),
// but the same person can still sign up with a different email.
r.post('/signup', async (req, res) => {
  const name = String(req.body.name || '').trim(), email = String(req.body.email || '').trim().toLowerCase(), pw = String(req.body.password || '');
  if (name.length < 2) return res.status(400).json({ error: 'Name too short', code: 'NAME' });
  if (!okMail(email)) return res.status(400).json({ error: 'Invalid email', code: 'EMAIL' });
  if (pw.length < 8) return res.status(400).json({ error: 'Password too short', code: 'LEN' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Already registered', code: 'DUP' });
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(pw, 10) });
  res.status(201).json({ token: sign(user.id), user: publicUser(user), progress: {} });
});

// A person with no account cannot log in (NO_ACCOUNT) and is sent to sign up first.
r.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase(), pw = String(req.body.password || '');
  if (!okMail(email) || !pw) return res.status(400).json({ error: 'Missing fields', code: 'MISS' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No account', code: 'NO_ACCOUNT' });
  if (!(await bcrypt.compare(pw, user.passwordHash))) return res.status(401).json({ error: 'Wrong password', code: 'BAD_PW' });
  res.json({ token: sign(user.id), user: publicUser(user), progress: progressOf(user) });
});

r.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user), progress: progressOf(req.user) }));
export default r;
