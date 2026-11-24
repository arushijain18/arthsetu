(() => {
  'use strict';
  const content = window.FRAUD_LABS_CONTENT;
  const app = document.getElementById('app');
  const state = { lang:'en', screen:'home', bigText:false, listenFirst:false, order:[], index:0, answered:false, answer:null };
  const $ = (s, root=document) => root.querySelector(s);
  const t = () => content[state.lang];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tr = (en, hi) => state.lang === 'hi' ? hi : en;
  const symbols = {
    upi:'<path d="M8 4h8a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path d="M9 8h6M9 12h6M9 16h2"/>',
    phishing:'<path d="M4 5h16v12H9l-5 3V5Z"/><path d="m8 9 2 2 5-3"/>',
    impersonation:'<circle cx="12" cy="8" r="3"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6M18 5l2 2-2 2"/>',
    kyc:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h5"/>',
    'digital-arrest':'<path d="M12 3 21 19H3L12 3Z"/><path d="M12 9v4M12 16h.01"/>',
    job:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2"/>',
    qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2"/>',
    loan:'<path d="M4 6h16v13H4zM8 10h8M8 14h4M7 3h10"/>',
    lottery:'<path d="M12 3 14 9l6-2-3 6 4 4-7 1-2 4-2-6-6-1 5-4-1-8Z"/>',
    care:'<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M9 9h6M9 12h4"/>',
    investment:'<path d="M4 19V5M4 19h17M7 15l4-4 3 2 6-7M16 6h4v4"/>'
  };
  function icon(id, cls='case-icon') { return `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${symbols[id] || symbols.phishing}</svg></span>`; }
  function header(eyebrow, heading, body, back=true) {
    return `<div class="screen-top"><button class="back-link" data-action="${back?'home':'noop'}">${back?'← '+esc(tr('Back','वापस')):''}</button><span class="screen-mark">${esc(tr('ARTHSETU · FRAUD LABS','अर्थसेतु · फ्रॉड लैब'))}</span></div><div class="screen-heading"><div class="kicker">${esc(eyebrow)}</div><h1 class="screen-title">${esc(heading)}</h1><p class="intro-copy">${esc(body)}</p></div>`;
  }
  function voiceButton(text, label) { return `<button class="voice-button" data-action="voice" data-voice="${esc(text)}">◖)) ${esc(label || t().meta.listen)}</button>`; }
  function home() {
    const d=t().home;
    app.innerHTML = `<section class="home-hero"><div class="home-copy"><div class="kicker">${esc(d.eyebrow)}</div><h1>${esc(d.heading)}</h1><p>${esc(d.body)}</p><div class="home-actions"><button class="primary-button" data-action="spot">${esc(d.spot)} <span>→</span></button><button class="secondary-button" data-action="map">${esc(d.map)}</button><button class="outline-button" data-action="help">${esc(d.help)}</button></div><div class="home-rule"><small>${esc(d.ruleTitle)}</small><p>${esc(d.rule)}</p></div><p class="term-key">${esc(d.terms)}</p></div><div class="home-art"><img src="assets/fraud-labs-collage.png" alt="${esc(d.imageAlt)}"><span class="image-caption">${esc(tr('DETECT · PREVENT · REPORT','पहचानें · बचें · शिकायत करें'))}</span></div></section><section class="home-foot"><span>${esc(tr('11 practice situations','11 अभ्यास उदाहरण'))}</span><span>${esc(tr('English + हिन्दी','अंग्रेज़ी + हिन्दी'))}</span><span>${esc(tr('No score. No timer.','कोई अंक नहीं। कोई समय सीमा नहीं।'))}</span></section>`;
  }
  function shuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  function startSpot() { state.order=shuffle(t().frauds.map(x=>x.id)); state.index=0; state.answered=false; state.answer=null; state.screen='spot'; render(); }
  function spot() {
    const d=t().spot, item=t().frauds.find(x=>x.id===state.order[state.index]);
    const dots=state.order.map((id,i)=>`<span class="progress-dot ${i<state.index?'done':''} ${i===state.index?'current':''}" aria-label="${esc(d.progress)} ${i+1}"></span>`).join('');
    const image = item.id==='upi' ? `<img class="case-art" src="assets/upi-warning.png" alt="${esc(tr('Illustration of a person worried about a payment scam','भुगतान ठगी से परेशान व्यक्ति का चित्र'))}">` : '';
    const completeNote=state.index===10?`<p class="complete-note">${esc(d.done)}</p>`:'';
    const answerBlock=state.answered ? `<div class="answer-panel">${completeNote}<div class="answer-result"><strong>${esc(state.answer===item.answer ? tr('That is right.','सही जवाब।') : tr('Good try. Learn the sign.','अच्छा प्रयास। संकेत याद रखें।'))}</strong><span class="answer-pill">${esc(item.answer==='scam'?d.scam:d.real)}</span></div><p class="why-label">${esc(d.why)}</p><p class="why-copy">${esc(item.why)}</p><p class="flag-line"><span>${esc(d.flag)}:</span> <strong>${esc(item.flag)}</strong></p><div class="learn-row"><strong>${esc(tr('What the scammer wants','ठग क्या चाहता है'))}</strong><p>${esc(item.goal)}</p></div><div class="learn-row safe-row"><strong>${esc(tr('A safer next step','सुरक्षित अगला कदम'))}</strong><p>${esc(item.nextStep)}</p></div>${voiceButton([item.why,item.goal,item.nextStep].join('. '),tr('Listen to the explanation','समझाइश सुनें'))}<button class="primary-button next-button" data-action="next">${esc(state.index===10?d.finish:d.next)} →</button></div>` : `<div class="choice-row"><button class="choice-button real-choice" data-action="answer" data-answer="real">${esc(d.real)}</button><button class="choice-button scam-choice" data-action="answer" data-answer="scam">${esc(d.scam)}</button></div>`;
    app.innerHTML=`<section class="screen narrow">${header(d.eyebrow,d.heading,d.body)}<div class="practice-meta"><span>${esc(d.progress)} ${state.index+1} / 11</span><span>${esc(item.tag)}</span></div><div class="progress-dots">${dots}</div><article class="scenario-card">${icon(item.id)}<div class="scenario-content"><div class="scenario-type">${esc(item.kind==='call'?tr('FICTIONAL CALL','काल्पनिक कॉल'):tr('FICTIONAL MESSAGE','काल्पनिक संदेश'))} · ${esc(item.label)}</div><h2>${esc(item.title)}</h2><p class="scenario-message">${esc(item.message)}</p>${image}${voiceButton([item.title,item.message].join('. '),d.listen)}</div></article>${answerBlock}<p class="small-note">${esc(tr('All names and situations are made up for practice.','सभी नाम और स्थितियाँ केवल अभ्यास के लिए बनाई गई हैं।'))}</p></section>`;
  }
  function fraudMap() {
    const d=t().map;
    app.innerHTML=`<section class="screen">${header(d.eyebrow,d.heading,d.body)}<div class="map-grid"><div class="map-head who-head">${esc(d.who)}</div><div class="map-head why-head">${esc(d.why)}</div><div class="map-head how-head">${esc(d.how)}</div>${d.items.map((x,i)=>`<div class="map-cell"><span class="map-number">0${i+1}</span><p>${esc(x.who)}</p></div><div class="map-cell"><span class="map-number">0${i+1}</span><p>${esc(x.why)}</p></div><div class="map-cell"><span class="map-number">0${i+1}</span><p>${esc(x.how)}</p></div>`).join('')}</div><div class="map-rule"><strong>${esc(tr('The same warning signs repeat.','खतरे के संकेत बार-बार दिखते हैं।'))}</strong><p>${esc(t().home.rule)}</p></div><section class="quick-checks"><h2>${esc(d.checksTitle)}</h2><div class="quick-check-grid">${d.checks.map((x,i)=>`<article><span>0${i+1}</span><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></article>`).join('')}</div></section>${voiceButton([d.heading,d.body,...d.items.flatMap(x=>[x.who,x.why,x.how]),d.checksTitle,...d.checks.flatMap(x=>[x.title,x.text])].join('. '))}<div class="screen-actions"><button class="primary-button" data-action="spot">${esc(tr('Practise spotting scams','ठगी पहचानने का अभ्यास करें'))}</button><button class="outline-button" data-action="home">${esc(d.back)}</button></div></section>`;
  }
  function help() {
    const d=t().help;
    app.innerHTML=`<section class="screen narrow">${header(d.eyebrow,d.heading,d.body)}<a class="call-card" href="tel:1930"><span class="call-label">${esc(d.callLabel)}</span><strong>${esc(d.callText)}</strong><span class="call-hint">${esc(tr('Tap to call','कॉल करने के लिए दबाएँ'))} ↗</span></a><ol class="help-steps"><li><span>1</span><p>${esc(d.step1)}</p></li><li><span>2</span><p>${esc(d.step2)}</p></li><li><span>3</span><p>${esc(d.step3)}</p></li><li><span>4</span><p>${esc(d.step4)}</p></li></ol><div class="help-links"><a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">${esc(d.portal)} ↗</a><a href="https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=13140" target="_blank" rel="noopener noreferrer">${esc(d.bank)} ↗</a></div><div class="ready-box"><strong>${esc(d.readyTitle)}</strong><p>${esc(d.readyText)}</p></div><p class="help-note">${esc(d.note)}</p>${voiceButton([d.heading,d.body,d.step1,d.step2,d.step3,d.step4,d.readyTitle,d.readyText,d.note].join('. '))}<div class="screen-actions"><button class="outline-button" data-action="home">${esc(d.back)}</button></div></section>`;
  }
  function syncPrefs(){document.body.classList.toggle('big-text',state.bigText);document.body.classList.toggle('listen-first',state.listenFirst);document.documentElement.lang=state.lang;document.querySelectorAll('[data-lang]').forEach(b=>{const on=b.dataset.lang===state.lang;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});const label=$('#listen-label');if(label)label.textContent=state.listenFirst?t().meta.listenMode:tr('Listen','सुनें');}
  function render(){const screens={home,spot,fraudMap,help};(screens[state.screen]||home)();syncPrefs();window.scrollTo({top:0,behavior:'instant'});}
  function say(text){if(!('speechSynthesis'in window)){alert(tr('Audio is not available in this browser.','इस ब्राउज़र में आवाज़ उपलब्ध नहीं है।'));return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text));u.lang=state.lang==='hi'?'hi-IN':'en-IN';u.rate=.88;speechSynthesis.speak(u);}
  document.addEventListener('click',e=>{
    const lang=e.target.closest('[data-lang]');if(lang){state.lang=lang.dataset.lang;render();return;}
    const b=e.target.closest('[data-action]');if(!b)return;
    switch(b.dataset.action){
      case 'home':state.screen='home';render();break;
      case 'spot':startSpot();break;
      case 'map':state.screen='fraudMap';render();break;
      case 'help':state.screen='help';render();break;
      case 'answer':if(!state.answered){state.answer=b.dataset.answer;state.answered=true;render();}break;
      case 'next':if(state.index===10){startSpot();}else{state.index++;state.answered=false;state.answer=null;render();}break;
      case 'voice':say(b.dataset.voice);break;
      case 'bigtext':state.bigText=!state.bigText;syncPrefs();break;
      case 'listenmode':state.listenFirst=!state.listenFirst;syncPrefs();break;
    }
  });
  render();
})();
