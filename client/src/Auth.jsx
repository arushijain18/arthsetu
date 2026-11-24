import { useState, useEffect } from 'react';
import { api } from './api.js';
const NET = { en: 'Cannot reach the server. You can still explore as Guest below.', hi: 'सर्वर से संपर्क नहीं हो सका। आप नीचे अतिथि के रूप में अन्वेषण कर सकते हैं।' };
const okMail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export default function Auth({ mode, tr, lang, go, home, onAuth }) {
  const L = mode === 'login';
  const [f, setF] = useState({ lE: '', lP: '', sN: '', sE: '', sP: '', sC: '' }), [err, setErr] = useState(''), [show, setShow] = useState({ l: false, s: false }), [busy, setBusy] = useState(false);
  useEffect(() => setErr(''), [mode]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const msg = err === 'NET' ? NET[lang] : err ? tr(err) : '';
  const fail = (e) => setErr({ NO_ACCOUNT: 'eNo', BAD_PW: 'ePw', DUP: 'eDup', NAME: 'eName', EMAIL: 'eMail', LEN: 'eLen', MISS: 'eMiss' }[e.code] || 'NET');
  const login = async (e) => {
    e.preventDefault(); const email = f.lE.trim().toLowerCase();
    if (!okMail(email) || !f.lP) return setErr('eMiss');
    setBusy(true); try { onAuth(await api.login({ email, password: f.lP })); } catch (x) { fail(x); } setBusy(false);
  };
  const signup = async (e) => {
    e.preventDefault(); const name = f.sN.trim(), email = f.sE.trim().toLowerCase();
    if (name.length < 2) return setErr('eName'); if (!okMail(email)) return setErr('eMail');
    if (f.sP.length < 8) return setErr('eLen'); if (f.sP !== f.sC) return setErr('eMat');
    setBusy(true); try { onAuth(await api.signup({ name, email, password: f.sP })); } catch (x) { fail(x); } setBusy(false);
  };
  const exploreGuest = () => {
    const defaultName = f.sN.trim() || (f.lE ? f.lE.split('@')[0] : (lang === 'hi' ? 'अतिथि' : 'Guest'));
    onAuth(api.guestLogin(defaultName));
  };
  const click = (e) => { const g = e.target.dataset && e.target.dataset.go; if (g) go(g); };
  return (
    <section className="auth" id="auth">
      <button className="btn back" type="button" onClick={home}>{tr('back')}</button>
      <div className="card" onClick={click}>
        <img className="emb" alt="" src="/assets/emblem.png" />
        <h1>अर्थसेतु</h1>
        <p className="sub">{tr(L ? 'subL' : 'subS')}</p>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={L} onClick={() => go('login')}>{tr('tl')}</button>
          <button type="button" role="tab" aria-selected={!L} onClick={() => go('signup')}>{tr('ts')}</button>
        </div>
        {L ? (
          <form onSubmit={login} noValidate>
            <label><span>{tr('em')}</span><input name="email" type="email" autoComplete="username" inputMode="email" value={f.lE} onChange={set('lE')} /></label>
            <label><span>{tr('pw')}</span><span className="pw"><input name="password" type={show.l ? 'text' : 'password'} autoComplete="current-password" value={f.lP} onChange={set('lP')} /><button type="button" onClick={() => setShow({ ...show, l: !show.l })}>{tr(show.l ? 'hide' : 'show')}</button></span></label>
            <p className="err" role="alert" dangerouslySetInnerHTML={{ __html: msg }} />
            <button className="go-btn" type="submit" disabled={busy}>{tr('sbL')}</button>
          </form>
        ) : (
          <form onSubmit={signup} noValidate>
            <label><span>{tr('fn')}</span><input name="name" type="text" autoComplete="name" value={f.sN} onChange={set('sN')} /></label>
            <label><span>{tr('em')}</span><input name="email" type="email" autoComplete="username" inputMode="email" value={f.sE} onChange={set('sE')} /></label>
            <label><span>{tr('pw8')}</span><span className="pw"><input name="new-password" type={show.s ? 'text' : 'password'} autoComplete="new-password" value={f.sP} onChange={set('sP')} /><button type="button" onClick={() => setShow({ ...show, s: !show.s })}>{tr(show.s ? 'hide' : 'show')}</button></span></label>
            <label><span>{tr('cp')}</span><input name="confirm-password" type="password" autoComplete="new-password" value={f.sC} onChange={set('sC')} /></label>
            <p className="err" role="alert" dangerouslySetInnerHTML={{ __html: msg }} />
            <button className="go-btn" type="submit" disabled={busy}>{tr('sbS')}</button>
          </form>
        )}
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(91,58,34,0.15)' }}>
          <button type="button" onClick={exploreGuest} style={{ background: 'transparent', border: '1px solid rgba(91,58,34,0.3)', color: '#5b3a22', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', font: '600 13px/1 Hind,sans-serif' }}>
            {lang === 'hi' ? 'अतिथि के रूप में देखें (बिना लॉगिन) →' : 'Explore directly as Guest (No login) →'}
          </button>
        </div>
        <p className="swap" dangerouslySetInnerHTML={{ __html: tr(L ? 'swL' : 'swS') }} />
      </div>
    </section>
  );
}
