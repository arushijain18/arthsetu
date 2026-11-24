import { useRef, useState, useEffect } from 'react';
// The gate: tap -> doors open -> zoom -> logo page -> name is written -> Login / Sign up / Begin.
export default function Landing({ tr, act }) {
  const [cls, setCls] = useState(''), [ui, setUi] = useState(false);
  const started = useRef(false), timers = useRef([]), zm = useRef(), scene = useRef(), nm = useRef();
  const fast = useRef(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion:reduce)').matches);
  const T = (f, ms) => timers.current.push(setTimeout(f, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const start = () => {
    if (started.current) return; started.current = true; setCls('open');
    const f = fast.current;
    T(() => {
      const s = scene.current.getBoundingClientRect(), z = zm.current.getBoundingClientRect();
      zm.current.style.transformOrigin = (s.left + s.width / 2 - z.left) + 'px ' + (s.top + s.height / 2 - z.top) + 'px';
      zm.current.style.setProperty('--z', Math.max(innerWidth / s.width, innerHeight / s.height) * 1.15);
      setCls('open go');
    }, f ? 50 : 2700);
    T(() => { for (let i = 1; i <= 8; i++) T(() => { nm.current.style.clipPath = `inset(0 ${100 - (5 + 91 * i / 8)}% 0 0)`; }, i * 430); }, f ? 200 : 8200);
    T(() => { nm.current.style.clipPath = 'inset(0 0 0 0)'; setUi(true); }, f ? 400 : 11900);
  };
  return (
    <main className={'stage ' + cls} id="stage">
      <div className="zoom" ref={zm}>
        <div className="gate" role="button" tabIndex={0} aria-label="Tap the door to open" onClick={start} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && start()}>
          <div className="scene" ref={scene}><div className="si" /></div>
          <img className="frame" alt="" src="/assets/gate-frame.png" />
          <div className="door dl"><img alt="" src="/assets/door-left.png" /></div>
          <div className="door dr"><img alt="" src="/assets/door-right.png" /></div>
        </div>
      </div>
      <div className="hint">{tr('hint')}</div>
      <div className="final"><div className="art"><img className="base" alt="Arthsetu — bridging India to financial literacy" src="/assets/lockup.jpg" /><img className="name" ref={nm} alt="" src="/assets/name-overlay.png" /></div></div>
      <div className={'ui' + (ui ? ' show' : '')}>
        <div className="top"><button className="btn" onClick={() => act('login')}>{tr('lgin')}</button><button className="btn" onClick={() => act('signup')}>{tr('sgup')}</button></div>
        <div className="bottom"><button className="btn big" onClick={() => act('begin')}>{tr('begin')}</button></div>
      </div>
    </main>
  );
}
