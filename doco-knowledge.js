'use strict';
(function(root,factory){
  const knowledge=factory();
  if(typeof module==='object'&&module.exports)module.exports=knowledge;
  else root.DocoKnowledge=knowledge;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const entries=Object.freeze([
    {id:'same-wifi',patterns:[/same.?wi.?fi|local network|direct wi.?fi|\blan\b|ethernet|offline pairing/i],terms:['lan','ethernet','directwifi','localnetwork'],answer:'Matching phone and Windows builds prefer an encrypted direct connection on the same trusted network. Internet is still needed for sign-in and private device discovery, and the private cloud channel remains a fallback.'},
    {id:'connectivity',patterns:[/wi.?fi|internet|offline|online|mobile data|network connection/i],terms:['wifi','internet','offline','online','network','connection'],answer:'Doco’s authored expressions work without Gemini. Internet is needed for Google sign-in, Gemini reactions, Spotify and desktop-device discovery. Direct Wi-Fi visits still need internet for initial sign-in and private discovery.'},
    {id:'availability',patterns:[/play store|download|install|available|android|iphone|ios|mac(?:os)?/i],terms:['download','install','available','android','iphone','ios','macos','playstore'],answer:'Doco is available on Android, with a downloadable Windows companion for desktop visits. macOS and iOS are not supported yet.'},
    {id:'desktop-visits',patterns:[/desktop visit|computer|windows|jump|other screen|cross.?device|\bpc\b|laptop|pair.*device/i],terms:['desktop','computer','windows','jump','screen','pc','laptop','pair'],answer:'Desktop visits are an opt-in Android-to-Windows prototype. Sign in with the same Google account, enable visits on both devices and keep Doco Home awake on your phone.'},
    {id:'desktop-reminders',patterns:[/45 minute|reminder|water break|waterbreak|stretch|break reminder|active time/i],terms:['reminder','waterbreak','stretch','break','45minutes'],answer:'The Windows prototype attempts one visit after 45 minutes of active computer use and alternates stretch and water reminders. Idle, lock and sleep time do not count, and missed visits are skipped rather than queued.'},
    {id:'detection-limits',patterns:[/posture|dehydrat|watching|which screen|productiv|detect.*focus|track.*screen/i],terms:['posture','dehydration','watching','productivity','tracking'],answer:'Doco does not detect posture, dehydration, productivity or which screen you are watching. Desktop reminders use only local idle, lock and sleep state.'},
    {id:'visit-data',patterns:[/transfer|sent.*device|share.*device|desktop.*data|data.*desktop|cross.?device.*privacy/i],terms:['transfer','handoff','devicedata'],answer:'A visit transfers only allowlisted character pose, expression, mode, timing and stage geometry. It does not transfer camera frames, Gemini captions, API keys, Spotify credentials or listening history.'},
    {id:'camera-privacy',patterns:[/camera.*(save|store|privacy|frame|photo)|frame.*(save|store|send)|photo.*gemini|camera permission|camera consent/i],terms:['camera','photo','frame','snapshot','webcam'],answer:'Camera use is optional and requires separate permission and in-app consent. With Gemini enabled, sampled frames are sent to Google for reactions; Doco does not persist those frames.'},
    {id:'key-security',patterns:[/key.*(safe|secure|store|storage|private)|where.*key|api.*privacy/i],terms:['keystore','keysecurity','securestorage'],answer:'Your Gemini key stays in device-backed secure storage: Android Keystore on Android and encrypted IndexedDB during browser development. Doco does not put user keys in public builds or logs.'},
    {id:'gemini',patterns:[/gemini|byok|api key|bring your own key|artificial intelligence|\bai\b/i],terms:['gemini','byok','apikey','ai'],answer:'Gemini is optional and BYOK. Doco already has authored expressions and prompts without a key; adding your own key enables camera-aware reactions and AI captions. Provider usage charges may apply.'},
    {id:'modes',patterns:[/focus mode|everyday mode|mode|sarcas|calm|playful/i],terms:['focus','everyday','mode','sarcasm','calm','playful'],answer:'Everyday mode is playful and warm. Focus mode is calmer and uses friendly, deadpan sarcasm while keeping genuinely concerning moments gentle.'},
    {id:'prompt-cadence',patterns:[/prompt.*(often|time|gap|repeat)|how often|cadence|repetitive|urgent reaction/i],terms:['prompt','cadence','repetitive','repetition','urgent'],answer:'Normal prompts target roughly four to five seconds in both modes. Urgent reactions remain immediate, and delayed prompts do not arrive later as a burst.'},
    {id:'music',patterns:[/spotify|music|song|playlist|listening history|premium|playback/i],terms:['spotify','music','song','playlist','premium','playback','artist'],answer:'Doco connects to Spotify for playback and uses authorized listening history to stay near familiar artists while making room for discovery. In-app Spotify playback requires Premium, and music remains optional.'},
    {id:'guest',patterns:[/guest|account|google sign.?in|sign in|login/i],terms:['guest','account','signin','login','googleaccount'],answer:'You can use the Android companion as a guest. Google sign-in is required only for account features such as private phone-to-Windows visits.'},
    {id:'sound-melt',patterns:[/sound|audio effect|noise|voice|speak|melt|puddle/i],terms:['sound','audio','noise','voice','speak','melt','puddle'],answer:'Doco has no character sound feature and no melting state. Music playback is separate from character audio.'},
    {id:'windows-behavior',patterns:[/startup|focus steal|always on top|taskbar|tray|typing focus/i],terms:['startup','focussteal','alwaysontop','taskbar','tray'],answer:'The Windows visitor appears above the taskbar without taking typing focus. Startup stays off by default, and tray controls handle test jumps, pause, sign out and quit.'},
    {id:'what-is-doco',patterns:[/what is doco|who is doco|what does doco do|tell me about doco|doco\?/i],terms:['whatisdoco','aboutdoco'],answer:'Doco is an expressive Android companion for focus, music and everyday moments, with playful character animation and optional BYOK Gemini reactions.'},
    {id:'privacy',patterns:[/privacy|delete account|personal data|data stored|tracking|collect.*data/i],terms:['privacy','deleteaccount','personaldata','tracking','collect'],answer:'Doco keeps camera consent separate from permission, does not persist camera frames and avoids logging account identifiers, keys, OAuth codes or tokens. Privacy and account deletion are available from Profile.'}
  ]);

  const aliases=Object.freeze({
    'wi-fi':'wifi',wireless:'wifi',web:'internet',notebook:'laptop',macbook:'macos',iphone:'ios',
    photograph:'photo',photos:'photo',pictures:'photo',snapshots:'snapshot',cam:'camera',webcam:'camera',
    songs:'song',tracks:'song',tunes:'music',pricing:'price',cost:'price',paid:'price',free:'price',
    notifications:'reminder',breaks:'break',prompts:'prompt'
  });
  const stopwords=new Set(['a','an','and','are','can','could','do','does','for','from','have','how','i','in','is','it','me','my','of','on','or','the','there','this','to','use','what','when','where','which','who','will','with','without','work','works']);
  const fallback='Doco does not know that one yet. Send your question to';

  function clean(value){
    return String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/wi[\s-]?fi/g,'wifi').replace(/play\s+store/g,'playstore').replace(/sign\s+in/g,'signin').replace(/api\s+key/g,'apikey').replace(/[^a-z0-9]+/g,' ').trim();
  }
  function words(value){
    return clean(value).split(/\s+/).filter(Boolean).map(word=>aliases[word]||word).filter(word=>!stopwords.has(word));
  }
  function distance(a,b){
    if(a===b)return 0;
    if(!a.length)return b.length;if(!b.length)return a.length;
    const row=Array.from({length:b.length+1},(_,index)=>index);
    for(let i=1;i<=a.length;i++){
      let diagonal=row[0];row[0]=i;
      for(let j=1;j<=b.length;j++){
        const above=row[j],cost=a[i-1]===b[j-1]?0:1;
        row[j]=Math.min(row[j]+1,row[j-1]+1,diagonal+cost);diagonal=above;
      }
    }
    return row[b.length];
  }
  function similar(a,b){
    if(a===b)return true;
    const longest=Math.max(a.length,b.length);
    if(longest<5)return false;
    return distance(a,b)<=(longest>=9?2:1);
  }
  function fuzzyScore(entry,questionWords){
    let score=0;
    for(const term of entry.terms){
      const termWords=words(term);
      if(termWords.length&&termWords.every(wanted=>questionWords.some(actual=>similar(actual,wanted))))score+=termWords.length+1;
    }
    return score;
  }
  function resolve(question){
    const value=String(question||'').trim();
    if(!value)return {known:false,answer:'',id:'',confidence:0};
    const normalized=clean(value),questionWords=words(value);
    for(const entry of entries)if(entry.patterns.some(pattern=>pattern.test(normalized)))return {known:true,answer:entry.answer,id:entry.id,confidence:1};
    let best=null,bestScore=0;
    for(const entry of entries){const score=fuzzyScore(entry,questionWords);if(score>bestScore){best=entry;bestScore=score;}}
    if(best&&bestScore>=2)return {known:true,answer:best.answer,id:best.id,confidence:Math.min(.95,.56+bestScore*.1)};
    return {known:false,answer:fallback,id:'',confidence:0};
  }
  const answer=question=>resolve(question).answer;
  return Object.freeze({entries,answer,resolve,fallback,clean,words});
});
