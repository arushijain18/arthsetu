import { useState, useEffect, useRef, useReducer } from 'react';
import { U, TIERS, TOP, refH } from './content.js';
import { pickVoice, sp } from './narrate.js';
import { api } from './api.js';

const VS = {
  en: { play: 'Play story', pause: 'Pause', replay: 'Replay', speed: 'Speed', read: 'Read the story', voice: 'Voice', note: 'Narrated by your device voice. A female voice is chosen when your device has one.' },
  hi: { play: 'कहानी सुनें', pause: 'रोकें', replay: 'पुनः सुनें', speed: 'गति', read: 'कहानी पढ़ें', voice: 'आवाज़', note: 'कहानी आपके डिवाइस की आवाज़ से सुनाई जाती है। उपलब्ध होने पर महिला आवाज़ चुनी जाती है।' },
};
const SAVE_ERR = { en: 'Could not save your progress. Check your connection and finish the quiz again.', hi: 'आपकी प्रगति सहेजी नहीं जा सकी। कनेक्शन जाँचें और क्विज़ फिर पूरा करें।' };
const H = (s) => ({ dangerouslySetInnerHTML: { __html: s } });
const ORIGINS = [[18, 62], [78, 58], [50, 35], [30, 80], [70, 75]];

export default function Stages({ tr, lang, user, view, go, home, onOut, onLang, prog, onProg }) {
  const u = (k) => U[lang][k], tx = (x) => (Array.isArray(x) ? x[lang === 'hi' ? 1 : 0] : x);
  const [curT, setCurT] = useState(0), [cur, setCur] = useState(0), [qz, setQz] = useState(null), [pgOpen, setPg] = useState(false);
  const [msg, setMsg] = useState(''), [vlang, setVlang] = useState(null), [saveErr, setSaveErr] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [checkedSteps, setCheckedSteps] = useState({});
  const root = useRef(), qzRef = useRef(), nr = useRef({ tok: 0, timer: null, play: false, vi: 0 }), [, force] = useReducer((x) => x + 1, 0);
  const vl = vlang || lang;
  const secs = TIERS[curT].secs ? TIERS[curT].secs.map((x) => tx(x)) : u('lvl'), SI = secs.map((_, i) => i);
  const tp = (i) => TOP.filter((t) => (t.tr || 0) === i);
  const nxt = () => { for (let j = cur + 1; j < TOP.length; j++) if ((TOP[j].tr || 0) === curT) return j; return -1; };
  const tierDone = (i) => { const a = tp(i); return a.length > 0 && a.every((t) => t.qz && prog[t.id]); };
  const sents = (T, l) => { const t = T.st[l === 'hi' ? 1 : 0]; return t.match(/[^.।!?]+[.।!?]+["”’]*\s*/g) || [t]; };

  // ---- story narration (browser speech synthesis) ----
  const halt = () => { const n = nr.current; n.play = false; n.tok++; clearTimeout(n.timer); if (window.speechSynthesis) speechSynthesis.cancel(); };
  const stop = () => { halt(); force(); };
  const say = (T, l) => {
    const n = nr.current, a = sents(T, l), tok = ++n.tok;
    if (n.vi >= a.length) { n.play = false; n.vi = 0; force(); return; }
    force();
    const t = a[n.vi].trim(), adv = () => { if (tok !== n.tok) return; n.tok++; n.vi++; setTimeout(() => { if (n.play) say(T, l); }, 350); };
    clearTimeout(n.timer);
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      speechSynthesis.cancel();
      const x = new SpeechSynthesisUtterance(sp(t, l)), v = pickVoice(l);
      x.lang = l === 'hi' ? 'hi-IN' : 'en-IN'; if (v) { x.voice = v; x.lang = v.lang; }
      x.rate = (l === 'hi' ? 0.85 : 0.92) * speechRate; x.pitch = 1; x.volume = 1; x.onend = adv;
      x.onerror = () => { if (tok === n.tok) { clearTimeout(n.timer); n.timer = setTimeout(adv, t.length * 65 + 1800); } };
      speechSynthesis.speak(x); n.timer = setTimeout(adv, t.length * 170 + 4000);
    } else n.timer = setTimeout(adv, t.length * 65 + 1800);
  };
  const toggleVid = (T) => {
    const n = nr.current; if (n.play) { stop(); return; }
    n.play = true; force();
    if (window.speechSynthesis && !speechSynthesis.getVoices().length) { speechSynthesis.getVoices(); setTimeout(() => { if (n.play) say(T, vl); }, 800); } else say(T, vl);
  };
  const replayVid = (T) => {
    halt();
    nr.current.vi = 0;
    nr.current.play = true;
    force();
    setTimeout(() => say(T, vl), 200);
  };

  useEffect(() => { halt(); nr.current.vi = 0; setVlang(null); setMsg(''); }, [lang, view]);
  useEffect(() => { if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { if (!nr.current.play) force(); }; return () => { halt(); if (window.speechSynthesis) speechSynthesis.onvoiceschanged = null; }; }, []);

  const toTop = () => root.current && root.current.scrollTo(0, 0);
  const openTopic = (i) => { halt(); nr.current.vi = 0; setCur(i); setQz(null); setSaveErr(false); setCheckedSteps({}); force(); toTop(); };
  const pickTier = (i) => { if (tp(i).length) { setCurT(i); setCur(TOP.indexOf(tp(i)[0])); setQz(null); go('learn'); } else setMsg(u('soonm')); };
  const toggleStep = (idx) => setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));

  // ---- quiz (answers are marked on the server before progress is saved) ----
  const T = TOP[cur], Q = qz || { i: 0, sc: 0, a: null, done: false, ans: [] };
  const pick = (j) => { if (Q.a !== null) return; const ans = [...Q.ans]; ans[Q.i] = j; setQz({ ...Q, a: j, ans, sc: Q.sc + (j === T.qz[Q.i].a ? 1 : 0) }); };
  const next = () => {
    const n = T.qz.length;
    if (Q.i === n - 1) {
      setQz({ ...Q, done: true });
      if (Q.sc === n) { setSaveErr(false); api.submitQuiz(T.id, Q.ans).then((r) => onProg(r.progress)).catch(() => setSaveErr(true)); }
    } else setQz({ ...Q, i: Q.i + 1, a: null });
    if (qzRef.current) qzRef.current.scrollIntoView({ block: 'center' });
  };
  const quiz = () => {
    const n = T.qz.length;
    if (Q.done) {
      const ok = Q.sc === n, td = ok && tierDone(curT);
      return (<><h2>{u('quiz')}</h2><div className={'res ' + (ok ? 'g' : '')}><big>{Q.sc}/{n}</big>
        <p>{ok ? u('perfect').replace(/7/g, n) : Q.sc + u('some').replace(/7/g, n)}</p>
        {saveErr && <p className="fb b">{SAVE_ERR[lang]}</p>}
        {td && <p><b>{u('tdone')}</b></p>}
        <div className="acts"><button className="pb" onClick={() => setQz(null)}>{u('restart')}</button>
          {nxt() > -1 && <button className={'pb' + (ok ? ' pr' : '')} onClick={() => openTopic(nxt())}>{u('nxt')}</button>}
          {td && <button className="pb pr" onClick={() => go('stages')}>{u('all')}</button>}</div></div></>);
    }
    const q = T.qz[Q.i], o = q.o[lang === 'hi' ? 1 : 0];
    return (<><h2>{u('quiz')}</h2>
      <div className="qm"><span>{u('q') + ' ' + (Q.i + 1) + ' ' + u('of') + ' ' + n}</span><em>{u('lv')[Q.i < 3 ? 0 : Q.i < 5 ? 1 : 2]}</em></div>
      <div className="bar"><s style={{ width: (Q.i / n * 100) + '%' }} /></div>
      <p className="qq" {...H(tx(q.q))} />
      <div className="ops">{o.map((x, j) => <button key={j} className={'op' + (Q.a !== null ? (j === q.a ? ' ok' : j === Q.a ? ' bad' : '') : '')} disabled={Q.a !== null} onClick={() => pick(j)} {...H(x)} />)}</div>
      {Q.a !== null && <>
        <p className={'fb ' + (Q.a === q.a ? 'g' : 'b')} {...H(Q.a === q.a ? u('ok') : u('no') + ' ' + u('ca') + o[q.a])} />
        {q.exp && (
          <div className="qexp">
            <b>{lang === 'hi' ? 'स्पष्टीकरण (Explanation):' : 'Explanation:'}</b> {tx(q.exp)}
          </div>
        )}
        <div className="acts"><button className="pb pr" onClick={next}>{Q.i === n - 1 ? u('fin') : u('next')}</button></div></>}
      <div className="acts"><button className="pb sm" onClick={() => setQz(null)}>{u('restart')}</button>{nxt() > -1 && <button className="pb sm" onClick={() => openTopic(nxt())}>{u('nxt')}</button>}</div></>);
  };

  // ---- lesson ----
  const story = () => {
    const n = nr.current, l = vl, a = sents(T, l), s = VS[l], v = pickVoice(l), vi = n.vi;
    const noExtra = window.speechSynthesis && speechSynthesis.getVoices().length ? (l === 'hi' ? ' · इस डिवाइस में हिन्दी आवाज़ नहीं मिली। सेटिंग्स → टेक्स्ट-टू-स्पीच से हिन्दी आवाज़ जोड़ें।' : ' · No English voice found on this device.') : '';
    return (
      <div className="pp vid"><h2>{(curT >= 3 ? (lang === 'hi' ? 'वास्तविक जीवन की कहानी' : 'Real-life story') : u('story')) + ' · ' + tx(T.n)}</h2>
        <div className="stg"><svg id="vsvg" viewBox="0 0 320 180" style={{ transformOrigin: ORIGINS[vi % 5][0] + '% ' + ORIGINS[vi % 5][1] + '%', transform: n.play ? 'scale(1.3)' : 'scale(1)' }} dangerouslySetInnerHTML={{ __html: T.svg }} />
          <div className="vcap" id="vcap">{a[Math.min(vi, a.length - 1)].trim()}</div></div>
        <div className="vbar"><s id="vbar" style={{ width: (vi / a.length * 100) + '%' }} /></div>
        <div className="vctl">
          <button className="pb pr" id="vpl" onClick={() => toggleVid(T)}>{(n.play ? '\u23f8 ' + s.pause : '\u25b6 ' + s.play)}</button>
          <button className="pb sm" title="Replay story from start" onClick={() => replayVid(T)}>&#x21bb; {s.replay}</button>
          <button className={'pb sm' + (l === 'en' ? ' on' : '')} onClick={() => { halt(); n.vi = 0; setVlang('en'); }}>English</button>
          <button className={'pb sm' + (l === 'hi' ? ' on' : '')} onClick={() => { halt(); n.vi = 0; setVlang('hi'); }}>हिन्दी</button>
          <div className="vspd" title="Narration Speed">
            {[0.8, 1.0, 1.25].map((rate) => (
              <button key={rate} className={'pb sm' + (speechRate === rate ? ' on' : '')} onClick={() => setSpeechRate(rate)}>{rate}x</button>
            ))}
          </div>
        </div>
        <p className="sm2">{s.note + (v ? ' · ' + s.voice + ': ' + v.name : noExtra)}</p>
        <details><summary>{s.read}</summary><p className="lb">English</p><p {...H(T.st[0])} /><p className="lb">हिन्दी</p><p {...H(T.st[1])} /></details>
      </div>);
  };

  const lesson = () => {
    if (!T.qz) return <div className="pp"><h2>{tx(T.n)}</h2><p {...H(tx(T.d))} /><p className="sm2">{u('soon')}</p></div>;
    return (<>{story()}
      <div className="pp">
        <h2>{curT >= 6 ? (lang === 'hi' ? 'मुख्य वित्तीय निष्कर्ष (Key Takeaways)' : 'Key Takeaways & Core Rules') : u('know')}</h2>
        <ul>{T.kn[lang === 'hi' ? 1 : 0].map((x, i) => <li key={i} {...H(x)} />)}</ul>
      </div>

      {T.expl && (
        <div className="pp expl-box">
          <h2>{lang === 'hi' ? 'विस्तृत वित्तीय व्याख्या (Detailed Explanation)' : 'Detailed Financial Explanation'}</h2>
          {T.expl.what && (
            <div className="expl-item">
              <h4>{lang === 'hi' ? 'क्या और क्यों (What & Why):' : 'What & Why:'}</h4>
              <p {...H(tx(T.expl.what))} />
            </div>
          )}
          {T.expl.how && (
            <div className="expl-item">
              <h4>{lang === 'hi' ? 'रणनीति और नियम (Strategy & How It Works):' : 'Strategy & How to Implement:'}</h4>
              <p {...H(tx(T.expl.how))} />
            </div>
          )}
          {T.expl.pros && (
            <div className="expl-item pros">
              <h4>{lang === 'hi' ? 'मुख्य लाभ (Key Advantages):' : 'Key Advantages:'}</h4>
              <p {...H(tx(T.expl.pros))} />
            </div>
          )}
          {T.expl.mistakes && (
            <div className="expl-item cons">
              <h4>{lang === 'hi' ? 'सावधानियाँ व आम ग़लतियाँ (Common Pitfalls & Mistakes):' : 'Common Pitfalls & Mistakes to Avoid:'}</h4>
              <p {...H(tx(T.expl.mistakes))} />
            </div>
          )}
        </div>
      )}

      {T.extra && (
        <div className="pp extra-box">
          <h2>{lang === 'hi' ? 'अतिरिक्त वित्तीय ज्ञान व सावधानियाँ (Extra Knowledge & Tips)' : 'Extra Knowledge, Precautions & Tips'}</h2>
          <ul>{T.extra[lang === 'hi' ? 1 : 0].map((x, i) => <li key={i} {...H(x)} />)}</ul>
          {T.src && (
            <div className="src-badge">
              <span>🛡️ <b>{lang === 'hi' ? 'आधिकारिक स्रोत (Authoritative Source):' : 'Authoritative Source:'}</b> <a href={T.src.url} target="_blank" rel="noopener noreferrer">{T.src.name}</a> (Verified: {T.src.verified})</span>
            </div>
          )}
        </div>
      )}

      {T.act && (
        <div className="pp act-box">
          <h2>🎯 {tx(T.act.title)}</h2>
          <p className="act-desc">{tx(T.act.desc)}</p>
          <div className="act-items">
            {T.act.items.map((item, idx) => (
              <label key={idx} className={'act-item' + (checkedSteps[idx] ? ' done' : '')}>
                <input type="checkbox" checked={!!checkedSteps[idx]} onChange={() => toggleStep(idx)} />
                <span>{tx(item)}</span>
              </label>
            ))}
          </div>
          <p className="act-count">{Object.values(checkedSteps).filter(Boolean).length} / {T.act.items.length} {lang === 'hi' ? 'क़दम पूरे हुए' : 'steps completed'}</p>
        </div>
      )}

      {T.id === 't13' && <div {...H(refH())} />}
      <div className="pp" id="qz" ref={qzRef}>{quiz()}</div></>);
  };

  const a0 = tp(curT), dn = a0.filter((t) => prog[t.id]).length;
  const learn = (<>
    <div className={'drw' + (pgOpen ? ' op' : '')}><b>{u('prog') + ': ' + dn + '/' + a0.length + ' ' + u('tp')}</b>
      {SI.map((l) => { const a = a0.filter((t) => t.l === l), d = a.filter((t) => prog[t.id]).length; return <div className="lr" key={l}><span>{secs[l]}</span><i><s style={{ width: (a.length ? Math.round(d / a.length * 100) : 0) + '%' }} /></i></div>; })}</div>
    <div className="hd sm"><h1>{tx(TIERS[curT].n) + ' · ' + TIERS[curT].a}</h1></div>
    <div className="lw"><aside>{SI.map((l) => <div className="lvg" key={l}><h3>{secs[l]}</h3><div className="chs">
      {TOP.map((t, i) => t.l === l && (t.tr || 0) === curT && <button key={t.id} className={'ch' + (i === cur ? ' on' : '') + (prog[t.id] ? ' dn' : '') + (t.qz ? '' : ' sn')} onClick={() => openTopic(i)}>{(prog[t.id] ? '\u2713 ' : '') + tx(t.n)}</button>)}</div></div>)}</aside>
      <section id="les">{lesson()}</section></div></>);
  const tiers = (<><div className="bn" /><div className="hd"><h1>{u('lsT')}</h1><p>{u('lsS')}</p></div>
    <div className="wall">{TIERS.map((t, i) => { const a = tp(i), pc = a.length ? Math.round(a.filter((x) => prog[x.id]).length / a.length * 100) : 0;
      return (<button key={i} className="fr" style={{ '--fc': t.c, '--r': ((i % 2 ? 1 : -1) * (0.8 + i % 3 * 0.5)) + 'deg' }} aria-label={t.a + ' ' + tx(t.n)} onClick={() => pickTier(i)}>
        <span className="pn"><svg viewBox="0 0 64 64" dangerouslySetInnerHTML={{ __html: t.s }} /></span>
        <span className="cp"><b>{t.a}</b><em>{tx(t.n)}</em><s style={{ width: pc + '%' }} /></span></button>); })}</div>
    <p className="msg">{msg}</p></>);

  return (
    <section className={'lsp ' + (view === 'learn' ? 'learn' : '')} id="lsp" ref={root}>
      <div className="bgw" /><div className="ov" />
      <nav className="nv"><button className="nbtn" type="button" onClick={() => (view === 'learn' ? go('stages') : go('categories'))}>{'\u2190 ' + (view === 'learn' ? u('lsT') : u('cat'))}</button>
        <div className="r"><span className="hi">{tr('hello') + user.name}</span><button className="nbtn" type="button" onClick={onLang}>{tr('lg')}</button><button className="nbtn" type="button" onClick={onOut}>{tr('out')}</button><button className="logo" type="button" aria-label="Logo page" onClick={home}><img alt="" src="/assets/emblem.png" /></button></div></nav>
      <button className="pgb" type="button" aria-label="Progress" onClick={() => setPg(!pgOpen)} />
      <div id="lsb">{view === 'learn' ? learn : tiers}</div>
    </section>
  );
}
