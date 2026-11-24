import { useState, useEffect } from 'react';
import { T, setContentLang } from './content.js';
import { api, setToken, hasToken } from './api.js';
import Landing from './Landing.jsx';
import Auth from './Auth.jsx';
import Categories from './Categories.jsx';
import Stages from './Stages.jsx';
import Perks from './Perks.jsx';

const PRIVATE = ['categories', 'stages', 'learn', 'household', 'irregular', 'perks', 'neutral', 'fraud-labs'];
export default function App() {
  const [lang, setLang] = useState(() => (localStorage.getItem('arthsetu_lang') === 'hi' ? 'hi' : 'en'));
  setContentLang(lang);
  const [user, setUser] = useState(null), [prog, setProg] = useState({});
  const [ready, setReady] = useState(!hasToken());
  const [h, setH] = useState(() => location.hash.slice(1));
  const tr = (k) => T[lang][k];

  const changeLang = (l) => { localStorage.setItem('arthsetu_lang', l); setLang(l); if (hasToken()) api.setLang(l).catch(() => {}); };
  const go = (x) => { location.hash = x; };
  const home = () => { history.replaceState(null, '', location.pathname + location.search); setH(''); };

  useEffect(() => { const f = () => setH(location.hash.slice(1)); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== location.origin || event.data?.type !== 'ARTHSETU_BACK_TO_CATEGORIES') return;
      go('categories');
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);
  useEffect(() => {
    if (!hasToken()) return;
    api.me().then((r) => { setUser(r.user); setProg(r.progress); }).catch(() => setToken('')).finally(() => setReady(true));
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { if (ready && !user && PRIVATE.includes(h)) go('login'); }, [ready, user, h]);

  const authView = h === 'login' || h === 'signup';
  const page = authView ? (user ? 'categories' : 'auth') : (PRIVATE.includes(h) && user ? h : '');
  useEffect(() => { document.body.className = page === 'auth' ? 'v-auth' : page ? 'v-cats' : ''; }, [page]);

  const onAuth = (r) => { setToken(r.token); setUser(r.user); setProg(r.progress); go('categories'); };
  const logout = () => { setToken(''); setUser(null); setProg({}); home(); };
  const toggle = () => changeLang(lang === 'hi' ? 'en' : 'hi');
  const common = { tr, lang, user, go, home, onOut: logout, onLang: toggle };

  return (
    <>
      <Landing tr={tr} act={(a) => go(a === 'begin' ? (user ? 'categories' : 'signup') : a)} />
      <button className="lg" type="button" aria-label="Language" onClick={toggle}>{tr('lg')}</button>
      {page === 'auth' && <Auth mode={h} tr={tr} lang={lang} go={go} home={home} onAuth={onAuth} />}
      {page === 'categories' && <Categories {...common} />}
      {page === 'irregular' && <main className="household-shell"><iframe title="ArthSetu Irregular Income Self-Planning" src="/irregular-income/index.html" /></main>}
      {page === 'perks' && <Perks {...common} />}
      {page === 'neutral' && <main className="household-shell"><iframe title="ArthSetu Neutral Content" src="/neutral-content/index.html" /></main>}
      {page === 'fraud-labs' && <main className="household-shell fraud-shell"><div className="fraud-appbar"><button type="button" onClick={() => go('categories')}>← {lang === 'hi' ? 'सभी श्रेणियाँ' : 'All categories'}</button><span>ARTHSETU · FRAUD LABS</span></div><iframe title="ArthSetu Fraud Labs" src="/fraud-labs/index.html" /></main>}
      {page === 'household' && <main className="household-shell"><iframe title="ArthSetu Household Mode" src="/household/index.html" /></main>}
      {(page === 'stages' || page === 'learn') && <Stages {...common} view={page} prog={prog} onProg={setProg} />}
    </>
  );
}
