import React, { useMemo, useState, useEffect } from 'react';
import { PERKS, PERK_GROUPS } from './perks.js';
import './perks.css';
import { speakCard, stopSpeech, speechSupported } from './speech.js';
export default function Perks({ lang='en', go, home, user, onOut, onLang }) {
 const [query,setQuery]=useState(''), [group,setGroup]=useState('all'), [level,setLevel]=useState('All levels'), [expanded,setExpanded]=useState({}), [speakingId,setSpeakingId]=useState(null), [note,setNote]=useState('');
 const hi=lang==='hi';
 useEffect(()=>()=>stopSpeech(),[]);
 useEffect(()=>{ stopSpeech(); setSpeakingId(null); setNote(''); },[lang]);
 const toggleAudio=(p)=>{ if(speakingId===p.id){ stopSpeech(); setSpeakingId(null); return; } setNote(''); const ok=speakCard(p,hi,!!expanded[p.id],{ onStart:()=>setSpeakingId(p.id), onEnd:()=>setSpeakingId(c=>c===p.id?null:c), onNote:setNote, onError:(e)=>{ setSpeakingId(c=>c===p.id?null:c); setNote(e==='unsupported'?'unsupported':'error'); } }); if(!ok) setNote('unsupported'); };
 const noteText={ 'no-hi-voice':hi?'इस डिवाइस पर हिन्दी आवाज़ नहीं मिली। फ़ोन या कंप्यूटर की सेटिंग्स में भाषा → टेक्स्ट-टू-स्पीच में हिन्दी आवाज़ जोड़ें।':'No Hindi voice was found on this device. Add a Hindi text-to-speech voice in your phone or computer settings.', unsupported:hi?'इस ब्राउज़र में सुनने की सुविधा उपलब्ध नहीं है। Chrome, Edge या Safari आज़माएँ।':'Listening is not supported in this browser. Try Chrome, Edge or Safari.', error:hi?'आवाज़ चलाने में दिक़्क़त हुई। दोबारा कोशिश करें।':'The audio could not play. Please try again.' }[note];
 const items=useMemo(()=>PERKS.filter(p=> (group==='all'||p.group===group) && (level==='All levels'||p.level===level) && (query.trim()===''||[p.name,p.issuer,p.catch,p.how,...p.benefits.flatMap(b=>b)].join(' ').toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>({Basic:0,Intermediate:1,Advanced:2}[a.level]-({Basic:0,Intermediate:1,Advanced:2}[b.level]))),[query,group,level]);
  return <section className="lsp perks-page">
  <div className="bgw"/><div className="ov"/>
  <nav className="nv"><button className="nbtn" onClick={()=>go?.('categories')}>{hi?'← श्रेणियाँ':'← Categories'}</button><div className="r"><span className="hi">{user?.name ? (hi?'नमस्ते, ':'Namaste, ')+user.name : 'ArthSetu'}</span><button className="nbtn" onClick={onLang}>{hi?'English':'हिन्दी'}</button>{onOut&&<button className="nbtn" onClick={onOut}>{hi?'लॉग आउट':'Log out'}</button>}</div></nav>
  <header className="perks-head"><p className="perks-kicker">{hi?'अर्थसेतु · छिपे हुए लाभ':'ARTHSETU · CATEGORY 4 OF 6'}</p><h1>{hi?'आपके पास पहले से कौन-से लाभ हैं?':'Hidden perks check'}</h1><p>{hi?'आपके कार्ड और खाते में ऐसे लाभ हो सकते हैं जिनका आप उपयोग नहीं करते। हर लाभ की एक शर्त होती है।':'You may already own benefits you are not using. Every perk has a catch.'}</p><div className="perks-intro-note">{hi?'पहले अपने मौजूदा कार्ड और खाते जाँचें।':'Start by checking the cards and accounts you already have.'}</div></header>
  <div className="perks-tools"><label className="perks-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={hi?'कार्ड, ऐप या लाभ खोजें':'Search a card, app or perk'} aria-label={hi?'खोजें':'Search'}/></label>
   <div className="perks-chips" aria-label={hi?'श्रेणियाँ':'Categories'}>{PERK_GROUPS.map(g=><button key={g.id} className={group===g.id?'on':''} onClick={()=>setGroup(g.id)}>{hi?g.hi:g.en}</button>)}</div>
   <div className="perks-levels">{['All levels','Basic','Intermediate','Advanced'].map(l=><button key={l} className={level===l?'on':''} onClick={()=>setLevel(l)}>{hi?({'All levels':'सभी स्तर','Basic':'बेसिक','Intermediate':'मध्यम','Advanced':'एडवांस'}[l]):l}</button>)}</div>
  </div>
  {noteText&&<p className="perk-note" role="status">{noteText}</p>}
  <p className="perks-count">{items.length} {hi?'जाँचे गए उदाहरण':'verified examples'} · {hi?'बेसिक लाभ पहले':'Basic perks first'}</p>
  <div className="perks-list">{items.map(p=>{const open=!!expanded[p.id];return <article className="perk-card" key={p.id}>
   <div className="perk-art" aria-label={hi?'सामान्य लाभ कार्ड चित्र':'Illustrative perk card artwork'}><div className="perk-generic"><span>{p.issuer}</span><b>{p.group==='upi'?'UPI':p.group==='insurance'?'COVER':p.group==='bank'?'SAVINGS':'CARD'}</b><i aria-hidden="true">{p.group==='upi'?'↗':p.group==='insurance'?'＋':p.group==='bank'?'₹':'••••'}</i></div></div>
   <div className="perk-main"><div className="perk-title"><div><h2>{p.name}</h2><p>{p.issuer}</p></div><span className={'perk-level '+p.level.toLowerCase()}>{hi?({'Basic':'बेसिक','Intermediate':'मध्यम','Advanced':'एडवांस'}[p.level]):p.level}</span></div>
    <p className="perk-fee"><b>{hi?'शुल्क':'Annual fee'}:</b> {hi?p.feeHi:p.fee}</p>
    <p className="perk-how"><b>{hi?'कैसे पाएँ':'How to get it'}:</b> {hi?p.howHi:p.how}</p>
    <ul className="perk-benefits">{p.benefits.map((b,i)=><li key={i}><span className="perk-symbol" aria-hidden="true">{(b[0]+' '+b[1]).toLowerCase().includes('lounge')?'✈':(b[0]+' '+b[1]).toLowerCase().includes('fuel')?'₹':(b[0]+' '+b[1]).toLowerCase().includes('insurance')?'盾':(b[0]+' '+b[1]).toLowerCase().includes('cashback')?'%':(b[0]+' '+b[1]).toLowerCase().includes('forex')?'◎':'✓'}</span>{b[hi?1:0]}</li>)}</ul>
    <div className="perk-actions"><button className="perk-more" onClick={()=>setExpanded(s=>({...s,[p.id]:!s[p.id]}))}>{open?(hi?'कम दिखाएँ':'Less'):(hi?'और देखें':'More')}</button><button className={'perk-audio'+(speakingId===p.id?' speaking':'')} disabled={!speechSupported} onClick={()=>toggleAudio(p)} aria-pressed={speakingId===p.id} aria-label={speakingId===p.id?(hi?'सुनना रोकें':'Stop listening'):(hi?'इस कार्ड को सुनें':'Read this card aloud')}>{speakingId===p.id?'■ '+(hi?'रोकें':'Stop'):'▶ '+(hi?'सुनें':'Listen')}</button></div>
    {open&&<div className="perk-extra"><p>{hi?p.extraHi:p.extra}</p></div>}
    <p className="perk-catch"><b>{hi?'ध्यान दें':'Catch'}:</b> {hi?p.catchHi:p.catch}</p>
    <div className="perk-source"><span>{hi?'जाँच की तारीख':'Last checked'}: {p.verifiedOn}</span><a href={p.sourceUrl} target="_blank" rel="noreferrer">{hi?'आधिकारिक स्रोत देखें':'Verify: official source'} ↗</a></div>
   </div></article>})}</div>
  <p className="perks-disclaimer">{hi?'ऑफर बदलते रहते हैं। किसी लाभ पर भरोसा करने से पहले अपने बैंक के ऐप या शर्तों में पुष्टि करें।':'Offers change. Confirm in your bank’s app or terms before relying on a figure.'}</p>
  <footer className="perks-foot">{hi?'यह निष्पक्ष शैक्षिक जानकारी है। कोई कार्ड खरीदने की सलाह नहीं।':'Neutral education only. No product recommendations or applications.'}</footer>
 </section>;
}
