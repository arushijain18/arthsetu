import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { requireAuth } from '../middleware/auth.js';
import { progressOf } from './auth.js';
// Correct option index for every question of every lesson (generated from the lesson data).
const KEYS = JSON.parse(readFileSync(new URL('../data/answerKeys.json', import.meta.url), 'utf8'));
const r = Router();
r.use(requireAuth);

r.get('/progress', (req, res) => res.json({ progress: progressOf(req.user) }));

r.patch('/me/lang', async (req, res) => {
  if (!['en', 'hi'].includes(req.body.lang)) return res.status(400).json({ error: 'Bad language', code: 'LANG' });
  req.user.lang = req.body.lang; await req.user.save();
  res.json({ lang: req.user.lang });
});

// The quiz is marked on the server. Progress only increases when every answer is correct.
r.post('/quiz/submit', async (req, res) => {
  const { topicId, answers } = req.body, key = KEYS[topicId];
  if (!key) return res.status(404).json({ error: 'Unknown lesson', code: 'TOPIC' });
  if (!Array.isArray(answers) || answers.length !== key.length) return res.status(400).json({ error: 'Wrong number of answers', code: 'ANS' });
  const score = key.reduce((n, a, i) => n + (answers[i] === a ? 1 : 0), 0), passed = score === key.length;
  if (passed) { req.user.progress.set(topicId, true); await req.user.save(); }
  res.json({ score, total: key.length, passed, progress: progressOf(req.user) });
});
export default r;
