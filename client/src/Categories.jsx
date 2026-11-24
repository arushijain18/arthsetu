import { useState, useEffect, useRef } from 'react';
import { C, CH, IC, BG } from './content.js';
const Icon = ({ i }) => <span className="ic"><svg viewBox="0 0 24 24"><path d={IC[i]} /></svg></span>;
function Sec({ i, c, tr, open }) {
  const ref = useRef(), [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(ref.current); return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className={'sec' + (i % 2 ? ' r' : '') + (seen ? ' in' : '')} style={{ backgroundImage: `var(${BG[i][0]})`, backgroundPosition: BG[i][1] }}>
      <div className="num" aria-hidden="true">{i + 1}</div>
      <button className="cd" type="button" aria-label={c.t} onClick={() => open(i)}>
        <div className="tp"><Icon i={i} /><span className="pc">{C[i].p + tr('pc')}</span></div>
        <h2 dangerouslySetInnerHTML={{ __html: c.t }} /><p className="g">{c.g}</p>
        <ul>{c.pts.map((x, k) => <li key={k} dangerouslySetInnerHTML={{ __html: x }} />)}</ul>
        <span className="ex">{tr('ex')}</span>
      </button>
    </section>
  );
}
export default function Categories({ tr, lang, user, go, home, onOut, onLang }) {
  const [md, setMd] = useState(-1), list = lang === 'hi' ? CH : C;
  useEffect(() => { const f = (e) => e.key === 'Escape' && setMd(-1); addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, []);
  const open = (i) => (i === 0 ? go('stages') : i === 1 ? go('household') : i === 2 ? go('irregular') : i === 3 ? go('perks') : i === 4 ? go('neutral') : i === 5 ? go('fraud-labs') : setMd(i));
  const m = md >= 0 ? list[md] : null;
  return (
    <section className="cats" id="cats">
      <nav className="nv"><span className="hi">{tr('hello') + user.name}</span><div className="r"><button className="nbtn" type="button" onClick={onLang}>{tr('lg')}</button><button className="nbtn" type="button" onClick={onOut}>{tr('out')}</button><button className="logo" type="button" aria-label="Back to the Arthsetu logo page" onClick={home}><img alt="" src="/assets/emblem.png" /></button></div></nav>
      <header className="hero"><div><small>{tr('hs')}</small><h1>{tr('h1')}</h1><p>{tr('hp')}</p><span className="sc">{tr('sc')}</span></div></header>
      <div>{list.map((c, i) => <Sec key={i} i={i} c={c} tr={tr} open={open} />)}</div>
      <section className="sec coach" style={{ backgroundImage: 'var(--w1)', backgroundPosition: '50% 55%' }}><div className="cd"><div className="g" style={{ marginTop: 0 }}>{tr('ct')}</div><p style={{ margin: 0, font: '400 17px/1.6 Hind,sans-serif' }}>{tr('cp2')}</p></div></section>
      <footer className="foot">{tr('foot')}</footer>
      <div className={'md' + (m ? ' open' : '')} onClick={(e) => e.target === e.currentTarget && setMd(-1)}>
        <div className="cd" role="dialog" aria-modal="true">{m && <>
          <button className="x" type="button" aria-label="Close" onClick={() => setMd(-1)}>&times;</button>
          <div className="tp"><Icon i={md} /><span className="pc">{C[md].p + tr('pc')}</span></div>
          <h2>{m.t}</h2><p className="g">{m.g}</p>
          <ul>{m.more.map((x, k) => <li key={k} dangerouslySetInnerHTML={{ __html: x }} />)}</ul></>}
        </div>
      </div>
    </section>
  );
}
