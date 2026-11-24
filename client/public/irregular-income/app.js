/* ArthSetu Irregular Income · offline-first self-planning module */
(() => {
  'use strict';

  const STORE_KEY = 'arthsetu-irregular-income-v1';
  const content = window.ARTHSETU_CONTENT || {};
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const safe = (value='') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money = (value) => '₹' + Math.max(0, Number(value)||0).toLocaleString('en-IN');
  const asset = (file) => (window.ARTHSETU_ASSETS && window.ARTHSETU_ASSETS[file]) || `assets/${file}`;

  const defaults = {
    lang: (()=>{try{return localStorage.getItem('arthsetu_lang')==='hi'?'hi':'en'}catch{return 'en'}})(), screen: 'welcome', tier: 'daily', lessonIndex: 0, extraId: null,
    floor: {housing:'', ration:'', schoolHealth:'', workCost:''}, weakIncome:'',
    plan: {pattern:'', floor:'', work:'', buffer:''}, cashIn: 600,
    allocations: {}, selectedBox: '', pledges: [false,false,false,false], days: [false,false,false,false,false,false,false],
    notes: '', quizAnswers: {}, bigText:false, listenFirst:false, facilitator:false
  };

  function loadState(){
    try {
      const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {...structuredClone(defaults), ...stored,
        floor:{...defaults.floor,...(stored.floor||{})},
        plan:{...defaults.plan,...(stored.plan||{})},
        pledges:Array.isArray(stored.pledges)?stored.pledges:defaults.pledges.slice(),
        days:Array.isArray(stored.days)?stored.days:defaults.days.slice(),
        allocations:stored.allocations||{}, quizAnswers:stored.quizAnswers||{}};
    } catch { return structuredClone(defaults); }
  }
  let state = loadState();
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} };
  const langData = () => content[state.lang] || content.en || {};
  const tr = (en, hi) => state.lang === 'hi' ? (hi || en) : (en || hi || '');
  const t = () => langData();
  const tierMeta = () => (t().tierPrompt?.cards || []).find(x=>x.id===state.tier) || (content.en.tierPrompt.cards[0]);
  const floorTotal = () => Object.values(state.floor).reduce((sum,v)=>sum+Math.max(0,Number(v)||0),0);
  const fmt = (n) => money(n);
  const imageTag = (file, alt, cls='') => `<img class="${cls}" src="${safe(asset(file))}" alt="${safe(alt)}" loading="lazy">`;
  const voiceButton = (text) => `<button class="voice-button" data-action="voice" data-voice="${safe(text)}" aria-label="${state.lang==='hi'?'यह बात सुनें':'Listen to this'}">◖)) ${state.lang==='hi'?'सुनें':'Listen'}</button>`;
  const top = (eyebrow, heading, body, back=true, voiceText='') => `
    <div class="screen narrow">
      <div class="screen-top"><div><div class="kicker">${safe(eyebrow||'')}</div><h1 class="screen-title">${safe(heading||'')}</h1></div>${back?'<button class="back-link" data-action="back">← '+tr('Back','वापस')+'</button>':''}</div>
      ${body?`<p class="intro-copy long-copy">${safe(body)}</p>`:''}
      <div class="screen-voice">${voiceButton(voiceText||[heading,body].filter(Boolean).join('. '))}</div>`;
  const end = `</div>`;
  const actionButton = (label, action, cls='primary-button', attrs='') => `<button class="${cls}" data-action="${action}" ${attrs}>${safe(label)}</button>`;
  const path = (step) => `<div class="screen-path" aria-label="${tr('Learning journey','सीखने का रास्ता')}"><span class="done"></span><span class="${step>=2?'done':''}"></span><span class="${step>=3?'done':''}"></span><small>${tr('TEACH · PRACTICE · SELF-PLAN','सीखें · अभ्यास · अपनी योजना')}</small></div>`;
  const app = $('#app');

  function syncPrefs(){
    document.documentElement.lang = state.lang==='hi'?'hi':'en';
    $('.language-switch [data-lang="en"]')?.classList.toggle('active',state.lang==='en');
    $('.language-switch [data-lang="hi"]')?.classList.toggle('active',state.lang==='hi');
    $('.language-switch [data-lang="en"]')?.setAttribute('aria-pressed',String(state.lang==='en'));
    $('.language-switch [data-lang="hi"]')?.setAttribute('aria-pressed',String(state.lang==='hi'));
    document.body.classList.toggle('big-text',!!state.bigText);
    document.body.classList.toggle('listen-first',!!state.listenFirst);
    $('[data-action="bigtext"]')?.setAttribute('aria-pressed',String(!!state.bigText));
    $('[data-action="listenmode"]')?.setAttribute('aria-pressed',String(!!state.listenFirst));
    $('#listen-label').textContent = tr('Listen','सुनें');
    const bc=$('#back-cats'); if(bc) bc.textContent = tr('← Categories','← श्रेणियाँ');
    $('#footer-disclaimer').textContent = t().footer?.disclaimer || '';
  }

  function renderWelcome(){
    const d=t(), w=d.welcome, c=d.coreRule;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-art">${imageTag('hero-collage.webp',w.imageCaption||'Indian workers and traditional livelihoods')}</div>
        <div class="hero-copy">
          <div class="kicker">${safe(w.eyebrow)}</div>
          <h1>${safe(w.heading)}</h1>
          <p>${safe(w.body)}</p>
          <div class="hero-rule"><strong>${safe(c.label)} · ${safe(c.title)}</strong><p>${safe(c.body)}</p></div>
          <button class="primary-button hero-cta" data-action="choose-tier">${safe(w.cta)} <span aria-hidden="true">→</span></button>
          <div class="tiny-trust">${safe(w.trust)}</div>
          <div class="hero-bottom"><span>ARTHSETU · SELF-PLANNING</span><span>TEACH → PRACTICE → SELF-PLAN</span></div>
        </div>
      </section>
      <section class="journey-band" aria-label="${safe(w.journeyTitle)}">${w.journey.map((x,i)=>`<div class="journey-step"><span class="step-num">0${i+1}</span><div><strong>${safe(x.title)}</strong><p>${safe(x.body)}</p></div></div>`).join('')}</section>
      <section class="screen">
        <div class="screen-top"><div><div class="kicker">${tr('ONE SMALL ROUTINE','एक छोटी आदत')}</div><h2 class="screen-title" style="font-size:clamp(29px,4vw,42px)">${tr('First protect the next earning day.','पहले कल की कमाई का रास्ता बचाएँ।')}</h2><p class="intro-copy">${tr('This is not a complicated budget. It is a simple order to follow whenever money comes in.','यह मुश्किल बजट नहीं है। पैसा आते ही कौन-सा काम पहले करना है, बस यही क्रम है।')}</p></div>${voiceButton(c.body)}</div>
        <div class="rule-strip"><div class="rule-icon">₹</div><div><strong>${safe(c.title)}</strong><p>${safe(c.body)}</p></div></div>
        <div class="screen-actions">
          ${actionButton(tr('Choose my income pattern','मेरी कमाई का तरीका चुनें'),'choose-tier')}
          ${actionButton(tr('Open the 5 questions','पाँच सवाल खोलें'),'questions','secondary-button')}
          ${actionButton(tr('Government support','सरकारी सहायता देखें'),'safety','outline-button')}
          ${actionButton(tr('Community facilitator mode','समुदाय सत्र के लिए'),'facilitator','outline-button')}
          ${actionButton(tr('5-minute topics','5 मिनट के छोटे पाठ'),'extras','outline-button')}
        </div>
      </section>`;
  }

  function renderTierSelect(){
    const d=t(), w=d.tierPrompt;
    app.innerHTML = top(w.eyebrow,w.heading,w.body,true) + path(1) + `<div class="tier-grid">${w.cards.map(card=>`
      <button class="tier-card ${safe(card.color)}" data-action="select-tier" data-tier="${safe(card.id)}">
        <div class="tier-photo">${imageTag(card.image,card.audience)}<span class="tier-number">${safe(card.number)}</span></div>
        <div class="tier-meta">${tr('CHOOSE YOUR WORK PATTERN','अपना काम चुनें')}</div>
        <h3>${safe(card.title)}</h3><p class="tier-sub">${safe(card.subtitle)}</p><p class="tier-audience">${safe(card.audience)}</p>
        <span class="tier-strap">${safe(card.oneLine)}</span><span class="tier-action">${tr('Choose this path','यह रास्ता चुनें')} <b>→</b></span>
      </button>`).join('')}</div>
      <div class="rule-strip"><div class="rule-icon">✦</div><div><strong>${tr('Not sure?','समझ नहीं आ रहा?')}</strong><p>${tr('Choose the way most of your money usually arrives. You can change it later.','जिस तरीके से आम तौर पर ज़्यादा पैसा आता है, उसे चुनें। बाद में बदल सकते हैं।')}</p></div></div>${end}`;
  }

  function renderFloor(){
    const d=t(), f=d.floor;
    const fields=f.fields.map(field=>`<div class="field-card"><label for="floor-${field.id}">${safe(field.label)}</label><small>${safe(field.hint)}</small><div class="rupee-input"><span>₹</span><input id="floor-${field.id}" inputmode="numeric" type="number" min="0" step="1" data-floor-field="${field.id}" value="${safe(state.floor[field.id])}" placeholder="0" aria-label="${safe(field.label)}"></div></div>`).join('');
    app.innerHTML = top(f.eyebrow,f.heading,f.body,true) + path(1) + `<div class="floor-art-row">${imageTag('community-worker.webp',tr('A worker carrying everyday goods','रोज़मर्रा का सामान ले जाते कामगार'))}<div><strong>${tr('Essentials only. Not wants.','सिर्फ ज़रूरतें। शौक नहीं।')}</strong><p>${tr('Use one month as your time period. Add only the minimum amount needed to keep your home and work steady.','एक महीने का हिसाब लें। घर और काम चलाने के लिए जितनी कम से कम रकम चाहिए, वही लिखें।')}</p></div></div>
      <div class="field-grid">${fields}</div>
      <div class="total-card"><div><small>${safe(f.total)}</small><strong>${tr('Your monthly Floor Number','आपका महीने का न्यूनतम खर्च')}</strong></div><div class="total-amount" id="floor-total">${fmt(floorTotal())}</div></div>
      <div class="field-card reality-input"><label for="weak-income">${safe(d.reality.incomeLabel)}</label><small>${tr('A rough low-month estimate is enough. You may leave this blank.','कम कमाई वाले महीने का अंदाज़ा लिखें। चाहें तो खाली छोड़ दें।')}</small><div class="rupee-input"><span>₹</span><input id="weak-income" type="number" inputmode="numeric" min="0" data-field="weakIncome" value="${safe(state.weakIncome)}" placeholder="${tr('Optional','ज़रूरी नहीं')}"></div></div>
      <div class="screen-actions">${actionButton(tr('Check my reality','मेरी स्थिति देखें'),'reality')}${actionButton(tr('Back to income type','कमाई के तरीके पर लौटें'),'choose-tier','outline-button')}</div>${end}`;
  }

  function renderReality(){
    const d=t(), r=d.reality, total=floorTotal(), weak=state.weakIncome===''?null:Number(state.weakIncome), tier=tierMeta();
    let title, body, tone;
    if(weak===null || state.weakIncome===''){title=r.unknownTitle;body=r.unknownBody;tone='neutral'}
    else if(weak<total){title=r.belowTitle;body=r.belowBody;tone='warning'}
    else {title=r.nearTitle;body=r.nearBody;tone='good'}
    const below=weak!==null && weak<total;
    app.innerHTML=top(r.eyebrow,r.heading,r.rule,true)+path(1)+`
      <div class="reality-card ${tone}"><div class="reality-stamp">${below?'!':weak===null?'₹':'✓'}</div><h2>${safe(title)}</h2><p>${safe(body)}</p>
        <div class="reality-numbers"><div class="number-tile"><small>${safe(r.bodyAbove)}</small><strong>${fmt(total)}</strong></div><div class="number-tile"><small>${safe(r.incomeLabel)}</small><strong>${weak===null?'—':fmt(weak)}</strong></div></div>
        <p class="reality-kind">${safe(tr('Your path','आपका रास्ता'))}: <b>${safe(tier.title)}</b></p></div>
      <div class="content-block"><h3>${tr('A gentle next step','अगला छोटा कदम')}</h3><p>${tr('First check what keeps you earning. Then cover the home essentials. A buffer can begin with a very small amount. Do not copy another person’s split.','पहले देखें कि काम चलाने के लिए क्या जरूरी है। फिर घर की ज़रूरतें। बचत बहुत छोटी रकम से भी शुरू हो सकती है। किसी और का बँटवारा कॉपी न करें।')}</p></div>
      <div class="screen-actions">${actionButton(r.continue,'start-lesson')}${actionButton(tr('Review my Floor Number','मेरा न्यूनतम खर्च देखें'),'floor','outline-button')}</div>${end}`;
  }

  function tierOrder(){
    if(state.tier==='weekly') return ['business','personal','buffer'];
    if(state.tier==='project') return ['tax','business','personal','buffer'];
    return ['work','home','today'];
  }
  const boxText=(key)=>t().practice.boxLabels[key]||key;
  const boxHint=(key)=>t().practice.boxHints[key]||'';
  function renderLesson(){
    const d=t(), block=d.tierLessons[state.tier], card=block.cards[state.lessonIndex], total=block.cards.length;
    const meta=tierMeta();
    if(!card){state.lessonIndex=0;return renderLesson();}
    const mainImage = state.tier==='daily'?'tier-daily.webp':state.tier==='weekly'?'tier-weekly.webp':'tier-project.webp';
    const speech=[card.title,card.story,card.idea,card.example,card.action].join('. ');
    app.innerHTML=top(d.lesson.eyebrow,d.lesson.heading,d.lesson.body,true)+path(1)+`
      <div class="tier-ribbon"><span>${safe(meta.number)}</span><div><b>${safe(meta.title)}</b><small>${safe(meta.subtitle)}</small></div><button class="voice-button" data-action="voice" data-voice="${safe(speech)}">◖)) ${tr('Listen','सुनें')}</button></div>
      <div class="lesson-progress"><div><span>${tr('Card','पाठ')} ${state.lessonIndex+1} / ${total}</span><span>${Math.round((state.lessonIndex+1)/total*100)}%</span></div><i><b style="width:${(state.lessonIndex+1)/total*100}%"></b></i></div><p class="swipe-hint">${tr('Swipe left or right, or use the buttons below.','अगले या पिछले पाठ के लिए दाएँ-बाएँ स्वाइप करें या नीचे बटन दबाएँ।')}</p>
      <article class="lesson-card"><div class="lesson-art">${imageTag(mainImage,meta.audience)}<span class="lesson-index">0${state.lessonIndex+1}</span></div><div class="lesson-copy">
       <div class="tier-meta">${tr('ONE IDEA · TAKE ONE ACTION','एक बात · एक छोटा काम')}</div><h2>${safe(card.title)}</h2>
       <div class="content-block story"><small>${tr('THE STORY','कहानी')}</small><p>${safe(card.story)}</p></div>
       <div class="content-block idea"><small>${tr('THE IDEA','मुख्य बात')}</small><p>${safe(card.idea)}</p></div>
       <div class="content-block example"><small>${tr('RUPEE EXAMPLE · ILLUSTRATION ONLY','रुपये का उदाहरण · सिर्फ समझाने के लिए')}</small><p>${safe(card.example)}</p></div>
       <div class="content-block action"><small>${tr('TRY THIS NOW','अब यह करें')}</small><p>${safe(card.action)}</p></div>
       ${voiceButton(speech)}
      </div></article>
      <div class="lesson-controls">${actionButton(tr('Previous','पिछला'),'lesson-prev','outline-button',state.lessonIndex===0?'disabled':'')}${state.lessonIndex<total-1?actionButton(tr('Next idea','अगली बात'),'lesson-next') : actionButton(tr('Try 3 quick questions','3 छोटे सवाल करें'),'tier-quiz')}</div>
      ${state.lessonIndex===total-1?`<div class="content-block"><h3>${tr('Ready to practise?','अभ्यास के लिए तैयार?')}</h3><p>${tr('You have seen the key habit for this income pattern. Now check what you remember, without a score or pressure.','आपने इस तरह की कमाई की मुख्य आदत समझ ली। अब बिना दबाव के तीन सवाल देखें।')}</p></div>`:''}${end}`;
  }

  function renderQuiz(kind='tier'){
    const d=t();
    const config=kind==='tier'?d.tierLessons[state.tier]:d.extras.modules.find(m=>m.id===state.extraId);
    if(!config)return renderExtras();
    const qs=config.quiz||[];
    const key=kind==='tier'?`tier-${state.tier}`:`extra-${state.extraId}`;
    const answers=state.quizAnswers[key]||{};
    const totalCorrect=qs.reduce((s,q,i)=>s+(answers[i]===q.answer?1:0),0);
    const allDone=qs.every((q,i)=>Number.isInteger(answers[i]));
    app.innerHTML=top(tr('A FRIENDLY CHECK','आसान सवाल'),tr('Three small questions','तीन छोटे सवाल'),'Choose an answer. Learn from each one. No marks are saved as a judgement.',true)+`
      <div class="quiz-panel"><div class="quiz-head"><span>${tr('YOUR LEARNING CHECK','आपकी समझ')}</span><strong>${allDone?`${totalCorrect} / ${qs.length}`:`${Object.keys(answers).length} / ${qs.length} ${tr('answered','जवाब')}`}</strong></div>
      ${qs.map((q,i)=>`<section class="quiz-question"><div class="quiz-number">0${i+1}</div><h3>${safe(q.question)}</h3><div class="quiz-options">${q.options.map((opt,j)=>`<button data-action="quiz-answer" data-quiz-kind="${kind}" data-quiz-index="${i}" data-answer="${j}" class="quiz-option ${answers[i]===j?'chosen':''} ${answers[i]!==undefined?(j===q.answer?'correct':answers[i]===j?'incorrect':''):''}" ${answers[i]!==undefined?'disabled':''}><span>${String.fromCharCode(65+j)}</span>${safe(opt)}</button>`).join('')}</div>
        ${answers[i]!==undefined?`<div class="quiz-feedback ${answers[i]===q.answer?'correct':'gentle'}">${answers[i]===q.answer?'✓ ': '↗ '}${safe(q.explain)}</div>`:''}</section>`).join('')}
      ${allDone?`<div class="quiz-finish"><strong>${totalCorrect===qs.length?tr('Well done. You know the key order.','बहुत अच्छा। आपको मुख्य क्रम याद है।'):tr('Good practice. Read the explanations and try again later.','अच्छा अभ्यास। जवाबों की वजह पढ़ें और बाद में फिर कोशिश करें।')}</strong><p>${tr('Learning is about the habit, not a score.','सीखना आदत के बारे में है, नंबर के बारे में नहीं।')}</p><button class="outline-button" data-action="quiz-retry" data-quiz-kind="${kind}">${tr('Try again','फिर से करें')}</button></div>`:''}
      </div><div class="screen-actions">${actionButton(kind==='tier'?tr('Open money practice','पैसों का अभ्यास करें'):tr('Back to small topics','छोटे पाठों पर लौटें'),kind==='tier'?'practice':'extras')}${kind==='tier'?actionButton(tr('Open my plan','मेरी योजना खोलें'),'plan','outline-button'):''}</div>${end}`;
  }

  function renderPractice(){
    const d=t(), p=d.practice, order=tierOrder(), labels=order.map(k=>({key:k,label:boxText(k),hint:boxHint(k)}));
    const alloc=state.allocations[state.tier]||{};const placed=order.reduce((s,k)=>s+(Number(alloc[k])||0),0);const remaining=(Number(state.cashIn)||0)-placed;
    const active=state.selectedBox;
    app.innerHTML=top(p.eyebrow,p.heading,p.body,true)+path(2)+`
      <div class="practice-top"><div class="field-card"><label for="cash-in">${safe(p.moneyIn)}</label><small>${tr('Use sample money, not your actual account balance.','समझने के लिए उदाहरण की रकम लिखें, बैंक का असली बैलेंस नहीं।')}</small><div class="rupee-input"><span>₹</span><input id="cash-in" type="number" min="0" inputmode="numeric" data-field="cashIn" value="${safe(state.cashIn)}"></div></div><div class="practice-summary"><small>${safe(p.remaining)}</small><strong class="big">${fmt(Math.max(0,remaining))}</strong><small>${safe(p.placed)}: ${fmt(placed)}</small></div></div>
      <p class="coin-instruction">${safe(p.coinHint)}</p>
      <div class="coin-tray" aria-label="${tr('Sample rupee tokens','उदाहरण के रुपये')}" >${[50,100,200].map(n=>`<button class="coin" draggable="true" data-action="coin" data-coin="${n}" aria-label="${tr('Add','जोड़ें')} ${fmt(n)}">₹${n}</button>`).join('')}</div>
      <div class="allocation-grid">${labels.map((box,i)=>`<section class="allocation-box ${box.key} ${active===box.key?'selected':''}" data-box-drop="${box.key}"><div class="box-order">${state.tier==='weekly'?String.fromCharCode(65+i):i+1}</div><button class="box-select" data-action="select-box" data-box="${box.key}"><h3>${safe(box.label)}</h3><p>${safe(box.hint)}</p></button><label class="allocation-label" for="alloc-${box.key}">${tr('Amount','रकम')}</label><div class="rupee-input"><span>₹</span><input id="alloc-${box.key}" type="number" inputmode="numeric" min="0" data-alloc="${box.key}" value="${safe(alloc[box.key]??'')}" placeholder="0"></div><div class="box-actions"><button class="mini-action" data-action="add-coin" data-box="${box.key}" data-value="50">+₹50</button><button class="mini-action" data-action="add-coin" data-box="${box.key}" data-value="100">+₹100</button></div></section>`).join('')}</div>
      <div class="practice-status ${remaining<0?'over':remaining===0?'balanced':'under'}" id="practice-status">${remaining<0?p.over:remaining===0?p.balanced:p.under}</div>
      <p class="small-caution">${tr('No percentage is prescribed. Decide the rupee amount from your actual work costs, household needs, tax and buffer situation.','कोई तय प्रतिशत नहीं है। अपने काम के खर्च, घर की जरूरत, टैक्स और बचत देखकर रुपये तय करें।')}</p>
      <div class="screen-actions">${actionButton(p.reset,'practice-reset','outline-button')}${actionButton(p.next,'plan',remaining<0?'outline-button':'primary-button')}</div>${end}`;
  }

  function renderPlan(){
    const d=t(), p=d.plan, meta=tierMeta();
    const values={...state.plan}; if(!values.pattern) values.pattern=meta.title; if(!values.floor) values.floor=floorTotal()||'';
    state.plan=values; save();
    const fields=p.fields.map(f=>`<div class="field-card"><label for="plan-${f.id}">${safe(f.label)}</label><input id="plan-${f.id}" class="plain-input" data-plan="${f.id}" value="${safe(values[f.id])}" placeholder="${safe(f.placeholder)}" ${f.id==='floor'||f.id==='work'?'inputmode="numeric" type="number" min="0"':''}></div>`).join('');
    const checked=state.days.filter(Boolean).length;
    app.innerHTML=top(p.eyebrow,p.heading,p.body,true)+path(3)+`
      <div class="plan-layout"><div><div class="plan-paper"><div class="plan-paper-title"><span>अर्थसेतु</span><small>${tr('MY MONEY ROUTINE','मेरी पैसों की आदत')}</small></div><div class="field-grid one-col">${fields}</div><div class="content-block"><h3>${tr('My first buffer','मेरी पहली बचत')}</h3><p>${tr('Start with one day of essential costs. Then work towards one week. Then one month. Increase only when it is realistic.','एक दिन के जरूरी खर्च से शुरू करें। फिर एक हफ्ते का लक्ष्य रखें। उसके बाद एक महीने का। धीरे-धीरे बढ़ाएँ।')}</p></div></div>
        <div class="plan-actions">${actionButton(p.save,'save-plan')}${actionButton(p.print,'print-plan','secondary-button')}${actionButton(p.clear,'clear-plan','outline-button')}</div><div class="save-message" id="save-message" aria-live="polite">${safe(t().footer.privacy)} </div>
      </div><div class="seven-card"><div class="kicker">${tr('SMALL ACTIONS · NO MONEY TARGET','छोटे काम · रकम का लक्ष्य नहीं')}</div><h2>${safe(p.sevenTitle)}</h2><p>${safe(p.sevenBody)}</p><div class="pledge-list">${p.pledges.map((item,i)=>`<label class="pledge"><input type="checkbox" data-pledge="${i}" ${state.pledges[i]?'checked':''}><span class="check-visual"></span><span>${safe(item)}</span></label>`).join('')}</div><h3>${tr('My daily check','मेरा रोज़ का चेक')}</h3><div class="day-grid">${p.days.map((day,i)=>`<label class="day-check"><input type="checkbox" data-day="${i}" ${state.days[i]?'checked':''}><span>${safe(day)}</span></label>`).join('')}</div><div class="habit-progress"><div><b>${checked}/7</b> ${safe(p.progress)}</div><i><b style="width:${checked/7*100}%"></b></i></div>${checked===7?`<div class="habit-badge show">✦ ${safe(p.badge)}</div>`:''}<button class="outline-button" data-action="questions">${tr('Remember the five questions','पाँच सवाल याद करें')}</button></div></div>
      <div class="small-caution">${safe(p.privacy)}</div>
      <div class="screen-actions">${actionButton(tr('Practise the five questions','पाँच सवाल का अभ्यास'),'questions')}${actionButton(tr('Return to the beginning','शुरू में लौटें'),'home','outline-button')}</div>${end}`;
  }

  function renderQuestions(){
    const d=t(), q=d.questions;
    app.innerHTML=top(q.eyebrow,q.heading,q.body,true)+`<div class="question-stack">${q.items.map((item,i)=>`<article class="question-item"><div class="question-num">0${i+1}</div><div><div class="tier-meta">${tr('ASK IN THIS ORDER','इसी क्रम में पूछें')}</div><h3>${safe(item.q)}</h3><p>${safe(item.hint)}</p></div>${voiceButton(item.q+'. '+item.hint)}</article>`).join('')}</div>
      <div class="rule-strip"><div class="rule-icon">₹</div><div><strong>${tr('Only after the first four checks','पहले चार सवालों के बाद ही')}</strong><p>${safe(q.close)}</p></div></div>
      <div class="screen-actions">${actionButton(tr('Make my plan','अपनी योजना बनाएँ'),'plan')}${actionButton(tr('Practise with sample money','उदाहरण के पैसों से अभ्यास'),'practice','outline-button')}</div>${end}`;
  }

  function renderExtras(){
    const d=t(), x=d.extras;
    app.innerHTML=top(x.eyebrow,x.heading,x.body,true)+`<div class="module-grid">${x.modules.map(mod=>`<button class="module-card" data-action="open-extra" data-extra="${safe(mod.id)}"><span class="module-icon">${safe(mod.icon)}</span><div class="tier-meta">${tr('5-MINUTE TOPIC','5 मिनट का पाठ')}</div><h3>${safe(mod.title)}</h3><p>${safe(mod.subtitle)}</p><span class="module-open">${safe(x.open)} →</span></button>`).join('')}</div><div class="screen-actions">${actionButton(tr('Back to my plan','मेरी योजना पर लौटें'),'plan','outline-button')}${actionButton(tr('View government support','सरकारी सहायता देखें'),'safety')}</div>${end}`;
  }

  function renderExtraDetail(){
    const mod=t().extras.modules.find(m=>m.id===state.extraId);
    if(!mod)return renderExtras();
    app.innerHTML=top(t().extras.eyebrow,mod.title,mod.subtitle,true)+`<div class="mini-lesson-list">${mod.cards.map((c,i)=>`<article class="mini-lesson"><div class="mini-number">0${i+1}</div><div class="lesson-copy"><h3>${safe(c.title)}</h3><div class="content-block story"><small>${tr('STORY','कहानी')}</small><p>${safe(c.story)}</p></div><div class="content-block idea"><small>${tr('THE IDEA','मुख्य बात')}</small><p>${safe(c.idea)}</p></div><div class="content-block example"><small>${tr('RUPEE EXAMPLE · ILLUSTRATION ONLY','रुपयों का उदाहरण · सिर्फ समझाने के लिए')}</small><p>${safe(c.example)}</p></div><div class="content-block action"><small>${tr('TRY THIS','यह करें')}</small><p>${safe(c.action)}</p></div>${voiceButton([c.title,c.story,c.idea,c.example,c.action].join('. '))}</div></article>`).join('')}</div><div class="screen-actions">${actionButton(tr('Check what I learned','सीख को जाँचें'),'extra-quiz')}${actionButton(tr('Back to topics','पाठों पर लौटें'),'extras','outline-button')}</div>${end}`;
  }

  function renderSafety(){
    const d=t(), s=d.safety, schemes=(content.schemes?.schemes||[]);
    app.innerHTML=top(s.eyebrow,s.heading,s.body,true)+`<div class="verified-tag">${safe(s.verified)}</div><div class="scheme-grid">${schemes.map((x,i)=>`<article class="scheme-card"><div class="scheme-type">${safe(x.type)}</div><h3>${safe(x.name)}</h3><p><b>${tr('Who may qualify','कौन पात्र हो सकता है')}:</b> ${safe(state.lang==='hi'?x.who_hi:x.who)}</p><p><b>${tr('Next step','अगला कदम')}:</b> ${safe(state.lang==='hi'?x.next_hi:x.next)}</p><p class="caution"><b>${tr('Check before relying on it','भरोसा करने से पहले जाँचें')}:</b> ${safe(state.lang==='hi'?x.caution_hi:x.caution)}</p><span class="verified-tag">${tr('Last verified','आख़िरी जाँच')}: ${safe(x.lastVerified||content.schemes.lastVerified)}</span><p class="source-note">${tr('Source','स्रोत')}: ${safe(x.source)}</p><a href="${safe(x.url)}" target="_blank" rel="noopener noreferrer">${safe(x.urlLabel||tr('Official website','सरकारी वेबसाइट'))} ↗</a></article>`).join('')}</div><div class="rule-strip"><div class="rule-icon">!</div><div><strong>${tr('Important','ज़रूरी बात')}</strong><p>${safe(s.warning)}</p></div></div><p class="small-caution">${tr('The scheme list is editable in content/schemes.json. Check the official site again before applying.','योजना की सूची content/schemes.json में बदली जा सकती है। आवेदन से पहले सरकारी साइट पर नए नियम जाँचें।')}</p>${end}`;
  }

  function renderFacilitator(){
    const d=t(), f=d.facilitator;
    app.innerHTML=top(f.eyebrow,f.heading,f.body,true)+`<div class="facilitator-grid">${f.schedule.map((s,i)=>`<article class="agenda-item"><div class="time">${safe(s.time)}</div><h3>${safe(s.title)}</h3><p>${safe(s.body)}</p>${voiceButton(s.title+'. '+s.body)}</article>`).join('')}</div><div class="discussion-box"><h3>${tr('Discussion prompts','चर्चा के सवाल')}</h3><ol>${f.discussion.map(q=>`<li>${safe(q)}</li>`).join('')}</ol></div><div class="reality-card neutral"><h2>${tr('Care and privacy','सम्मान और गोपनीयता')}</h2><p>${safe(f.care)}</p></div><div class="screen-actions">${actionButton(tr('Open the five questions','पाँच सवाल खोलें'),'questions')}${actionButton(tr('Back to home','शुरू में लौटें'),'home','outline-button')}</div>${end}`;
  }

  function render(){
    syncPrefs();
    const screens={welcome:renderWelcome,tiers:renderTierSelect,floor:renderFloor,reality:renderReality,lesson:renderLesson,quiz:()=>renderQuiz('tier'),practice:renderPractice,plan:renderPlan,questions:renderQuestions,extras:renderExtras,extra:renderExtraDetail,extraQuiz:()=>renderQuiz('extra'),safety:renderSafety,facilitator:renderFacilitator};
    (screens[state.screen]||renderWelcome)();
    syncPrefs();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function go(screen){state.screen=screen;save();render();}
  function textToSpeech(text){
    if(!text) return;
    if(!('speechSynthesis' in window)){ alert(tr('Audio reading is not available in this browser.','इस ब्राउज़र में आवाज़ की सुविधा उपलब्ध नहीं है।')); return; }
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(String(text));
    utterance.lang=state.lang==='hi'?'hi-IN':'en-IN'; utterance.rate=.9; utterance.pitch=1;
    window.speechSynthesis.speak(utterance);
  }

  function addAllocation(box,amount){
    const order=tierOrder(); if(!order.includes(box))return;
    const current=state.allocations[state.tier]||{};
    current[box]=Math.max(0,(Number(current[box])||0)+(Number(amount)||0));
    state.allocations[state.tier]=current;state.selectedBox=box;save();renderPractice();
  }
  function answerQuiz(kind,index,answer){
    const config=kind==='tier'?t().tierLessons[state.tier]:t().extras.modules.find(m=>m.id===state.extraId);
    if(!config)return;
    const key=kind==='tier'?`tier-${state.tier}`:`extra-${state.extraId}`;
    const answers=state.quizAnswers[key]||{};
    if(answers[index]!==undefined)return;
    answers[index]=answer;state.quizAnswers[key]=answers;save();renderQuiz(kind);
  }

  document.addEventListener('click',event=>{
    if(event.target.closest('#back-cats')){ if(window.parent!==window){ try{window.parent.postMessage({type:'ARTHSETU_BACK_TO_CATEGORIES'},location.origin);}catch(e){window.parent.postMessage({type:'ARTHSETU_BACK_TO_CATEGORIES'},'*');} } return; }
    const langBtn=event.target.closest('[data-lang]');
    if(langBtn){state.lang=langBtn.dataset.lang;save();render();return;}
    const btn=event.target.closest('[data-action]'); if(!btn)return;
    const a=btn.dataset.action;
    switch(a){
      case 'home': go('welcome');break;
      case 'choose-tier': go('tiers');break;
      case 'select-tier': state.tier=btn.dataset.tier;state.lessonIndex=0;state.quizAnswers={...state.quizAnswers};state.plan={...state.plan,pattern:tierMeta().title,floor:floorTotal()||state.plan.floor};go('floor');break;
      case 'floor': go('floor');break;
      case 'reality':go('reality');break;
      case 'start-lesson':state.lessonIndex=0;go('lesson');break;
      case 'lesson-next':state.lessonIndex=Math.min(4,state.lessonIndex+1);save();render();break;
      case 'lesson-prev':state.lessonIndex=Math.max(0,state.lessonIndex-1);save();render();break;
      case 'tier-quiz':go('quiz');break;
      case 'practice':go('practice');break;
      case 'plan':go('plan');break;
      case 'questions':go('questions');break;
      case 'extras':go('extras');break;
      case 'open-extra':state.extraId=btn.dataset.extra;go('extra');break;
      case 'extra-quiz':go('extraQuiz');break;
      case 'safety':go('safety');break;
      case 'facilitator':go('facilitator');break;
      case 'back':
        ({tiers:'welcome',floor:'tiers',reality:'floor',lesson:'reality',quiz:'lesson',practice:'lesson',plan:'practice',questions:'plan',extras:'welcome',extra:'extras',extraQuiz:'extra',safety:'welcome',facilitator:'welcome'})[state.screen] ? go(({tiers:'welcome',floor:'tiers',reality:'floor',lesson:'reality',quiz:'lesson',practice:'lesson',plan:'practice',questions:'plan',extras:'welcome',extra:'extras',extraQuiz:'extra',safety:'welcome',facilitator:'welcome'})[state.screen]) : go('welcome');break;
      case 'voice':textToSpeech(btn.dataset.voice);break;
      case 'bigtext':state.bigText=!state.bigText;save();syncPrefs();break;
      case 'listenmode':state.listenFirst=!state.listenFirst;save();syncPrefs();break;
      case 'select-box':state.selectedBox=btn.dataset.box;save();renderPractice();break;
      case 'coin': if(state.selectedBox)addAllocation(state.selectedBox,Number(btn.dataset.coin));else alert(tr('Choose a money box first.','पहले पैसों का डिब्बा चुनें।'));break;
      case 'add-coin':addAllocation(btn.dataset.box,Number(btn.dataset.value));break;
      case 'practice-reset':state.allocations[state.tier]={};state.selectedBox='';save();renderPractice();break;
      case 'quiz-answer':answerQuiz(btn.dataset.quizKind,Number(btn.dataset.quizIndex),Number(btn.dataset.answer));break;
      case 'quiz-retry':{const key=btn.dataset.quizKind==='tier'?`tier-${state.tier}`:`extra-${state.extraId}`;delete state.quizAnswers[key];save();renderQuiz(btn.dataset.quizKind);break;}
      case 'save-plan':save();$('#save-message').textContent=t().plan.saved;break;
      case 'print-plan':preparePrint();window.print();break;
      case 'clear-plan':if(confirm(tr('Clear the plan saved on this device?','क्या इस डिवाइस पर सेव योजना हटाएँ?'))){state.plan={...defaults.plan};state.pledges=defaults.pledges.slice();state.days=defaults.days.slice();save();renderPlan();}break;
    }
  });

  document.addEventListener('input',event=>{
    const el=event.target;
    if(el.matches('[data-floor-field]')){
      state.floor[el.dataset.floorField]=el.value;$('#floor-total').textContent=fmt(floorTotal());state.plan.floor=floorTotal()||'';save();
    } else if(el.matches('[data-field="weakIncome"]')){state.weakIncome=el.value;save();}
    else if(el.matches('[data-field="cashIn"]')){state.cashIn=Math.max(0,Number(el.value)||0);save();updatePracticeStatus();}
    else if(el.matches('[data-alloc]')){const a=state.allocations[state.tier]||{};a[el.dataset.alloc]=el.value===''?'':Math.max(0,Number(el.value)||0);state.allocations[state.tier]=a;save();updatePracticeStatus();}
    else if(el.matches('[data-plan]')){state.plan[el.dataset.plan]=(['floor','work'].includes(el.dataset.plan)&&el.value!=='')?Math.max(0,Number(el.value)||0):el.value;save();}
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.matches('[data-pledge]')){state.pledges[Number(el.dataset.pledge)]=el.checked;save();}
    if(el.matches('[data-day]')){state.days[Number(el.dataset.day)]=el.checked;save();const checked=state.days.filter(Boolean).length;const prog=$('.habit-progress');if(prog){prog.querySelector('b').style.width=`${checked/7*100}%`;prog.querySelector('div').innerHTML=`<b>${checked}/7</b> ${safe(t().plan.progress)}`;}renderPlan();}
  });
  function updatePracticeStatus(){
    const node=$('#practice-status');if(!node)return;
    const order=tierOrder(),alloc=state.allocations[state.tier]||{};
    const placed=order.reduce((s,k)=>s+(Number(alloc[k])||0),0),remaining=(Number(state.cashIn)||0)-placed,p=t().practice;
    node.className=`practice-status ${remaining<0?'over':remaining===0?'balanced':'under'}`;
    node.textContent=remaining<0?p.over:remaining===0?p.balanced:p.under;
    const big=$('.practice-summary strong');if(big)big.textContent=fmt(Math.max(0,remaining));
    const small=$('.practice-summary small:last-child');if(small)small.textContent=`${p.placed}: ${fmt(placed)}`;
  }
  let lessonTouchStart = null;
  document.addEventListener('touchstart', event => {
    if (state.screen !== 'lesson' || !event.target.closest('.lesson-card')) return;
    lessonTouchStart = event.changedTouches[0]?.clientX ?? null;
  }, {passive:true});
  document.addEventListener('touchend', event => {
    if (lessonTouchStart === null || state.screen !== 'lesson') { lessonTouchStart = null; return; }
    const endX = event.changedTouches[0]?.clientX ?? lessonTouchStart;
    const delta = endX - lessonTouchStart; lessonTouchStart = null;
    if (Math.abs(delta) < 55) return;
    const count = t().tierLessons[state.tier].cards.length;
    state.lessonIndex = delta < 0 ? Math.min(count-1, state.lessonIndex+1) : Math.max(0, state.lessonIndex-1);
    save(); render();
  }, {passive:true});

  document.addEventListener('dragstart',event=>{
    const coin=event.target.closest('[data-coin]');if(!coin)return;
    event.dataTransfer.setData('text/plain',coin.dataset.coin);event.dataTransfer.effectAllowed='copy';
  });
  document.addEventListener('dragover',event=>{if(event.target.closest('[data-box-drop]')){event.preventDefault();event.dataTransfer.dropEffect='copy';}});
  document.addEventListener('drop',event=>{const box=event.target.closest('[data-box-drop]');if(!box)return;event.preventDefault();addAllocation(box.dataset.box,Number(event.dataTransfer.getData('text/plain')));});

  function preparePrint(){
    const d=t(),p=d.plan,fields=p.fields;
    const vals={...state.plan,floor:state.plan.floor||floorTotal()||''};
    $('#print-root').innerHTML=`<article class="print-sheet"><header><strong>ARTHSETU · ${tr('SELF-PLANNING','अपनी योजना')}</strong><span>${tr('TEACH · PRACTICE · SELF-PLAN','सीखें · अभ्यास · योजना')}</span></header><h1>${tr('My irregular income plan','मेरी बदलती कमाई की योजना')}</h1><p class="sub">${tr('Use this page as a reminder. Change it when work or home costs change.','इस पन्ने को याद रखने के लिए रखें। काम या घर का खर्च बदले तो इसे भी बदलें।')}</p><div class="print-grid">${fields.map(f=>`<div class="print-field"><b>${safe(f.label)}</b><span>${safe(vals[f.id]||'________________')}</span></div>`).join('')}</div><div class="print-strip"><b>${safe(t().coreRule.title)}</b><br>${safe(t().coreRule.body)}</div><h3>${safe(p.sevenTitle)}</h3><ol>${p.pledges.map(x=>`<li>□ ${safe(x)}</li>`).join('')}</ol><h3>${safe(t().questions.heading)}</h3><ol>${t().questions.items.map(x=>`<li><b>${safe(x.q)}</b><br>${safe(x.hint)}</li>`).join('')}</ol><div class="sig"><div> ${tr('Next check-in date','अगली जाँच की तारीख')}: __________________</div><div>${tr('One small step I will take','मेरा अगला छोटा कदम')}: __________________</div></div><div class="foot">${safe(p.privacy)}<br>${safe(t().footer.disclaimer)} ${safe(t().footer.privacy)}</div></article>`;
  }

  // Keep local state visible for debugging only when explicitly enabled.
  window.ArthSetuIrregular = {getState:()=>structuredClone(state), reset:()=>{localStorage.removeItem(STORE_KEY);state=structuredClone(defaults);render();}};
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
  render();
})();
