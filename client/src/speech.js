// Listen button engine: browser text-to-speech in Hindi (hi-IN) and English (en-IN / en-GB / en-US).
// Picks a real voice for each language, splits long text into short chunks (Chrome stops long
// utterances after ~15 s), reads rupee amounts and symbols aloud, and can be stopped.
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
export const speechSupported = !!synth;
let cache = [];
const refresh = () => { try { cache = synth.getVoices() || []; } catch (e) { cache = []; } };
if (synth) { refresh(); if (synth.addEventListener) synth.addEventListener('voiceschanged', refresh); else synth.onvoiceschanged = refresh; }

const norm = (l) => String(l || '').toLowerCase().replace('_', '-');
const GOOD = /google|microsoft|natural|neural|lekha|neerja|swara|heera|kalpana|hemant|rishi|veena|ravi/i;

// code: 'hi' or 'en'. Returns a SpeechSynthesisVoice or null.
export function pickVoice(code) {
  refresh();
  const all = cache.filter((v) => norm(v.lang).startsWith(code));
  const order = code === 'hi' ? ['hi-in', 'hi'] : ['en-in', 'en-gb', 'en-us', 'en'];
  for (const p of order) {
    const m = all.filter((v) => (p.length > 2 ? norm(v.lang) === p : norm(v.lang).startsWith(p)));
    if (m.length) return m.find((v) => GOOD.test(v.name)) || m[0];
  }
  return null;
}
// true / false when the voice list is known, null while it is still loading.
export function hasVoice(code) { refresh(); return cache.length === 0 ? null : !!pickVoice(code); }

export function speakable(text, code) {
  const hi = code === 'hi';
  return String(text)
    .replace(/₹\s?([\d,]+(?:\.\d+)?)(\s?(?:lakh|crore|लाख|करोड़))?/gi, (m, n, u) => n.replace(/,/g, '') + (u || '') + (hi ? ' रुपये' : ' rupees'))
    .replace(/(\d)\s?%/g, (m, d) => d + (hi ? ' प्रतिशत' : ' percent'))
    .replace(/\s\+\s/g, hi ? ' और ' : ' plus ')
    .replace(/&/g, hi ? ' और ' : ' and ')
    .replace(/[→↗✓•▶■]/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

export function chunk(text, max = 170) {
  const sentences = (String(text).replace(/\s+/g, ' ').trim().match(/[^.!?।]+[.!?।]*/g) || []).map((s) => s.trim()).filter(Boolean);
  const out = []; let cur = '';
  const push = (s) => { if (!cur) cur = s; else if ((cur + ' ' + s).length <= max) cur += ' ' + s; else { out.push(cur); cur = s; } };
  const splitLong = (s) => {
    const pieces = s.match(/[^,;:]+[,;:]?/g) || [s]; const res = []; let c = '';
    for (const p of pieces) {
      if (p.length > max) { if (c) { res.push(c); c = ''; } const w = p.split(' '); let line = ''; for (const x of w) { if ((line + ' ' + x).trim().length > max) { res.push(line.trim()); line = x; } else line += ' ' + x; } if (line.trim()) c = line.trim(); }
      else if ((c + ' ' + p).trim().length <= max) c = (c + ' ' + p).trim(); else { res.push(c); c = p.trim(); }
    }
    if (c) res.push(c); return res;
  };
  for (const s of sentences) { if (s.length <= max) push(s); else splitLong(s).forEach(push); }
  if (cur) out.push(cur);
  return out;
}

let token = 0;
export function stopSpeech() { token++; if (synth) { try { synth.cancel(); } catch (e) {} } }

// segments: [{ text, code: 'hi' | 'en' }]. cb: { onStart, onEnd, onError }.
export function speak(segments, cb = {}) {
  if (!synth) { cb.onError && cb.onError('unsupported'); return false; }
  stopSpeech();
  const mine = token;
  const queue = [];
  segments.forEach((s) => chunk(speakable(s.text, s.code)).forEach((t) => queue.push({ text: t, code: s.code })));
  const next = () => {
    if (mine !== token) return;
    const item = queue.shift();
    if (!item) { cb.onEnd && cb.onEnd(); return; }
    const u = new SpeechSynthesisUtterance(item.text);
    const v = pickVoice(item.code);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = item.code === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate = item.code === 'hi' ? 0.9 : 0.95;
    u.onend = next;
    u.onerror = (e) => { if (mine !== token) return; const k = e && e.error; if (k === 'canceled' || k === 'interrupted') return; cb.onError && cb.onError(k || 'error'); };
    synth.speak(u);
  };
  cb.onStart && cb.onStart();
  next();
  return true;
}

// Reads one perk card in the chosen language. The card name and issuer are read with an English voice.
export function speakCard(p, hi, open, cb = {}) {
  const code = hi ? 'hi' : 'en';
  const body = [hi ? p.howHi : p.how, ...p.benefits.map((b) => b[hi ? 1 : 0]), hi ? p.catchHi : p.catch, ...(open ? [hi ? p.extraHi : p.extra] : [])].filter(Boolean).join('. ');
  const segs = hi ? [{ text: p.name + '. ' + p.issuer + '.', code: 'en' }, { text: body, code: 'hi' }] : [{ text: [p.name, p.issuer, body].join('. '), code: 'en' }];
  if (hi && hasVoice('hi') === false && cb.onNote) cb.onNote('no-hi-voice');
  return speak(segs, cb);
}
