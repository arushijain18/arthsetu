function pickVoice(l){if(!window.speechSynthesis)return null;var p=l==='hi'?'hi':'en',want=l==='hi'?'hi-in':'en-in';
 var c=speechSynthesis.getVoices().filter(function(v){return v.lang.replace('_','-').toLowerCase().indexOf(p)===0});if(!c.length)return null;
 function sc(v){var n=v.name,lg=v.lang.replace('_','-').toLowerCase(),x=0;if(lg===want)x+=50;else if(p==='en'&&/en-(gb|au|us)/.test(lg))x+=10;
  if(/google|natural|neural|online|enhanced|premium|wavenet/i.test(n))x+=30;if(/compact|espeak/i.test(n))x-=30;
  if(/female|woman|lekha|kalpana|swara|heera|veena|neerja|priya|aria|jenny|samantha|karen|tessa|moira|zira|susan|fiona/i.test(n))x+=8;if(/\bmale\b|hemant|ravi|rishi|prabhat|david|mark|daniel|alex|fred|george/i.test(n))x-=8;return x}
 return c.sort(function(a,b){return sc(b)-sc(a)})[0]}
function sp(t,l){var h=l==='hi';t=t.replace(/e₹/g,h?'ई-रुपया':'e-rupee').replace(/₹\s?([\d,]+(?:\.\d+)?)/g,function(m,n){return n.replace(/,/g,'')+(h?' रुपये':' rupees')}).replace(/(\d)\s?%/g,'$1'+(h?' प्रतिशत':' percent')).replace(/−/g,h?'ऋण ':'minus ');
 var M=h?{UPI:'यूपीआई',EMI:'ईएमआई',RBI:'आरबीआई',PIN:'पिन',OTP:'ओटीपी',SEBI:'सेबी',FD:'एफडी',QR:'क्यू आर'}:{UPI:'U P I',EMI:'E M I',RBI:'R B I',PIN:'pin',OTP:'O T P',SEBI:'Sebi',FD:'F D',QR:'Q R'};
 return t.replace(/\b(UPI|EMI|RBI|PIN|OTP|SEBI|FD|QR)\b/g,function(m){return M[m]})}

export {pickVoice,sp};
