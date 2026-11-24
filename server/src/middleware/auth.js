import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
export async function requireAuth(req, res, next) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  try {
    const { id } = jwt.verify(t, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) throw new Error('no user');
    req.user = user; next();
  } catch { res.status(401).json({ error: 'Not signed in', code: 'UNAUTH' }); }
}
