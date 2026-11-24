// REST client for the Express API with seamless offline/guest fallback.
let token = localStorage.getItem('arthsetu_token') || '';
export const setToken = (t) => {
  token = t || '';
  t ? localStorage.setItem('arthsetu_token', t) : localStorage.removeItem('arthsetu_token');
};
export const hasToken = () => !!token;

function getGuestProg() {
  try { return JSON.parse(localStorage.getItem('arthsetu_guest_prog') || '{}'); } catch { return {}; }
}
function saveGuestProg(p) {
  localStorage.setItem('arthsetu_guest_prog', JSON.stringify(p));
}

async function call(method, path, body) {
  let r;
  try {
    r = await fetch('/api' + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && token !== 'guest_token' ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw Object.assign(new Error('network'), { code: 'NET' });
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || 'Error'), { code: d.code || 'ERR', status: r.status });
  return d;
}

export const api = {
  signup: (b) => call('POST', '/auth/signup', b),
  login: (b) => call('POST', '/auth/login', b),
  me: () => {
    if (token === 'guest_token') {
      const name = localStorage.getItem('arthsetu_guest_name') || (localStorage.getItem('arthsetu_lang') === 'hi' ? 'अतिथि' : 'Guest');
      return Promise.resolve({ user: { name, email: 'guest@arthsetu.org' }, progress: getGuestProg() });
    }
    return call('GET', '/auth/me');
  },
  setLang: (lang) => {
    if (token === 'guest_token') return Promise.resolve({ lang });
    return call('PATCH', '/me/lang', { lang });
  },
  submitQuiz: (topicId, answers) => {
    if (token === 'guest_token') {
      const prog = getGuestProg();
      prog[topicId] = true;
      saveGuestProg(prog);
      return Promise.resolve({ score: answers.length, total: answers.length, passed: true, progress: prog });
    }
    return call('POST', '/quiz/submit', { topicId, answers }).catch((err) => {
      if (err.code === 'NET') {
        const prog = getGuestProg();
        prog[topicId] = true;
        saveGuestProg(prog);
        return { score: answers.length, total: answers.length, passed: true, progress: prog };
      }
      throw err;
    });
  },
  guestLogin: (name) => {
    setToken('guest_token');
    const gName = name || (localStorage.getItem('arthsetu_lang') === 'hi' ? 'अतिथि' : 'Guest');
    localStorage.setItem('arthsetu_guest_name', gName);
    return { token: 'guest_token', user: { name: gName, email: 'guest@arthsetu.org' }, progress: getGuestProg() };
  }
};
