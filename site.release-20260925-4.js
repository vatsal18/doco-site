'use strict';
(() => {
  const $=id=>document.getElementById(id), panel=$('demo-panel'), flow=$('hero-demo-flow'), button=$('jump-button'), motion=window.DocoVisitsMotion;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const SCENE_MS=850, desktop=document.querySelector('.computer-device');
  let paused=reduced.matches, mode='everyday', loaded=false, raf=0, visible=false, travel=null, location='phone', returnAt=Infinity, variant=0, pending=0, prepareTimer=0;
  const characters=[];
  const states={everyday:['idle','happy','curious','playful'],focus:['mischievous','suspicious','amused','proud']};
  let phone,pc;
  const demoReady=()=>!flow.dataset.journey||(flow.dataset.journey==='docked'&&(flow.dataset.returnPhase||'idle')==='idle');
  const defaultPrompt=()=>{ $('phone-prompt').innerHTML=mode==='focus'?'That tab can wait.<br>You cannot.':'My thoughts found<br>a window seat.'; };
  const status=text=>$('demo-status').textContent=text;
  const busy=value=>{button.disabled=value||!loaded;button.setAttribute('aria-busy',String(value));};
  function fit(){
    const rect=panel.getBoundingClientRect();
    panel.style.setProperty('--scene-scale',String(Math.min(rect.width/830,rect.height/510)));
    panel.style.setProperty('--portrait-scale',String(Math.min(.84,(rect.height-60)/396)));
    panel.style.setProperty('--landscape-scale',String(Math.min(.95,(rect.width-32)/396)));
  }
  function size(c){
    c.width=c.stage.clientWidth;c.height=c.stage.clientHeight;
    const isHeroPhone=c.stage.id==='phone-blob';
    const density=isHeroPhone?Math.min(3,Math.max(2.5,devicePixelRatio*1.6)):Math.min(2,Math.max(1.5,devicePixelRatio));
    for(const canvas of [c.renderer.canvas,c.renderer.face]){
      const width=Math.max(1,Math.ceil(c.width*density)),height=Math.max(1,Math.ceil(c.height*density));
      // Assigning unchanged canvas dimensions clears a live character.
      if(canvas.width!==width)canvas.width=width;
      if(canvas.height!==height)canvas.height=height;
    }
  }
  function create(id,seed){
    const stage=$(id),renderer=new DocoCartoon.Renderer({stage}),actor=new DocoDesktopActor.Actor({poses:renderer.poses,Director:renderer.Director,seed,reduced:paused});
    const frame=new renderer.Director(renderer.poses,seed).sample(0,true);
    const c={stage,renderer,actor,frame,active:false};characters.push(c);size(c);return c;
  }
  function begin(c,reminder=false){
    const presentation=motion.presentation('stretch',mode,variant),ctrl=c.actor.begin(c.frame,mode,performance.now(),'stretch',reminder?presentation.line:'',variant);
    if(!reminder){ctrl.setState(states[mode][0],'',0,performance.now());c.actor.beats=[...states[mode]];}
    c.renderer.element.style.visibility='';
    c.renderer.art.style.transform='';
  }
  function reset(){
    pending++;clearTimeout(prepareTimer);travel=null;returnAt=Infinity;location='phone';
    setDesktop(false);
    $('demo-thought').hidden=true;defaultPrompt();busy(false);
    if(!loaded)return;
    pc.actor.stop(performance.now());pc.renderer.element.style.visibility='hidden';
    for(const c of characters){c.renderer.art.style.transform='';c.renderer.art.style.transformOrigin='';c.renderer.shadow.style.transform='';}
    phone.renderer.element.style.visibility='';begin(phone);paint(phone,performance.now(),true);
  }
  function paint(c,now,active){
    const show=active&&visible&&!document.hidden;
    if(c.actor.controller&&show!==c.active){c.actor.controller.setVisible(show,now);c.active=show;}
    if(!show)return;
    c.frame=c.actor.advance(now);c.renderer.render(c.frame);
  }
  function geometry(c){
    const r=c.stage.getBoundingClientRect(),screen=$(c===phone?'phone-screen':'computer-screen').getBoundingClientRect();
    // The demo is scaled as a whole; plan in the device's logical pixels.
    // Otherwise a narrow browser looks like an incompatible tiny renderer.
    const scale=r.width/Math.max(1,c.stage.clientWidth);
    return {left:(r.left-screen.left)/scale,width:r.width/scale,height:r.height/scale,viewport:screen.width/scale};
  }
  function startJump(direction='outbound'){
    if(!loaded||travel||!visible||document.hidden||(direction==='outbound'&&location!=='phone')||(direction==='return'&&location!=='desktop'))return;
    const now=performance.now(),source=direction==='outbound'?phone:pc,presentation=motion.presentation('stretch',mode,variant);
    if(paused){
      location=direction==='outbound'?'desktop':'phone';
      if(location==='phone'){reset();return;}
      phone.renderer.element.style.visibility='hidden';begin(pc,true);paint(pc,now,true);
      $('demo-thought').hidden=false;$('demo-reminder').textContent=presentation.line;$('phone-prompt').textContent='BRB.';
      returnAt=now+5500;busy(false);status('Doco is visiting the desktop.');run();return;
    }
    const visual=source.frame,plan=motion.plan(visual,geometry(phone),geometry(pc),direction);
    if(!plan){reset();status('Jump unavailable.');return;}
    const start=now+120;travel={direction,visual,plan,mode,kind:'stretch',variant,start,boundary:start+motion.DEPARTURE,landed:start+motion.TOTAL};
    motion.warm(plan);size(phone);size(pc);
    if(direction==='outbound')begin(pc,true);else pc.actor.stop(now);
    const foot=Math.max(...Array.from({length:160},(_,i)=>visual.pose['body'+i+'y']));
    for(const c of characters)c.renderer.art.style.transformOrigin=`${197/390*100}% ${foot/333.6048*100}%`;
    busy(true);$('demo-thought').hidden=true;status(direction==='outbound'?'Doco is jumping to the desktop.':'Doco is jumping home.');run();
  }
  function paintJump(now){
    const t=travel;
    for(const [c,role] of [[phone,'android'],[pc,'windows']]){
      const m=motion.motion(now,t,role);
      c.frame=motion.deform(t.visual,m,c.renderer.poses,mode,{kind:'stretch',returning:t.direction==='return',variant:t.variant});
      c.renderer.element.style.visibility=m.visible?'':'hidden';
      if(m.visible)c.renderer.render(c.frame);
      c.renderer.art.style.transform=`translate3d(${m.x*c.width/390}px,${m.y*c.height/333.6048}px,0) rotate(${m.turn}deg)`;
      c.renderer.shadow.style.transform=`translateX(${m.x*c.width/390}px) scaleX(${m.shadowScale})`;c.renderer.shadow.style.opacity=String(m.shadow);
    }
    if(now>=t.boundary)$('phone-prompt').textContent=t.direction==='outbound'?'BRB.':'I’m back.';
    if(now<t.landed)return;
    travel=null;busy(false);
    if(t.direction==='outbound'){
      location='desktop';pc.renderer.art.style.transform='';begin(pc,true);$('demo-thought').hidden=false;$('demo-reminder').textContent=motion.presentation('stretch',mode,variant).line;returnAt=now+5500;status('Doco is visiting the desktop.');
    }else{reset();variant=(variant+1)%5;status('Doco is home again.');}
  }
  function frame(now){
    raf=0;if(!loaded||!visible||document.hidden)return;
    if(travel)paintJump(now);
    else if(location==='desktop'){paint(pc,now,true);if(now>=returnAt)startJump('return');}
    else paint(phone,now,true);
    if(!paused||location==='desktop')raf=requestAnimationFrame(frame);
  }
  function run(){if(loaded&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  function setDesktop(value){
    panel.dataset.desktop=String(value);desktop.inert=!value;
    flow.dataset.desktop=String(value);
    desktop.setAttribute('aria-hidden',String(!value));
  }
  function requestJump(){
    if(button.disabled||!demoReady())return;
    if(location==='desktop'){startJump('return');return;}
    if(panel.dataset.desktop==='true'){startJump();return;}
    setDesktop(true);busy(true);
    const token=++pending;
    prepareTimer=setTimeout(()=>{if(token!==pending)return;size(pc);startJump();if(!travel&&location!=='desktop')busy(false);},paused?0:SCENE_MS+50);
  }
  function applyLayout(layout){
    panel.dataset.layout=layout;flow.dataset.layout=layout;
    document.querySelectorAll('.orientation-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===layout)));
    $('focus-label').textContent=layout==='landscape'?'Chill':'Focus';
    selectTrack(0,layout==='landscape');fit();
    if(loaded){characters.forEach(size);paint(phone,performance.now(),true);}run();
  }
  function setLayout(layout){
    if(panel.dataset.layout===layout||!demoReady())return;
    reset();setDesktop(false);applyLayout(layout);
  }
  function normalizeForHero(){
    const layoutChanged=panel.dataset.layout!=='portrait';
    const stateChanged=layoutChanged||panel.dataset.desktop==='true'||location!=='phone'||travel;
    if(stateChanged)reset();
    setDesktop(false);
    if(layoutChanged)applyLayout('portrait');
  }
  function setMode(next){
    reset();mode=next;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));defaultPrompt();
    if(loaded){begin(phone);paint(phone,performance.now(),true);run();}
  }
  function interact(c){
    let pointer=null;
    const point=e=>{const r=c.stage.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*2-1,y:(e.clientY-r.top)/r.height*2-1,dx:pointer?(e.clientX-pointer.x)/r.width*2:0,dy:pointer?(e.clientY-pointer.y)/r.height*2:0};};
    const tap=()=>{if(!loaded||travel||(c===phone&&location!=='phone')||(c===pc&&location!=='desktop'))return;c.actor.controller?.interact('tap',{x:0,y:0},performance.now());paint(c,performance.now(),true);run();};
    c.stage.addEventListener('pointerdown',e=>{if(!loaded||travel||e.button!==0||(c===phone&&location!=='phone')||(c===pc&&location!=='desktop'))return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,drag:false};c.stage.setPointerCapture(e.pointerId);c.actor.controller?.interact('begin',point(e),performance.now());});
    c.stage.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>6)pointer.drag=true;if(pointer.drag)c.actor.controller?.interact('drag',point(e),performance.now());});
    c.stage.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dragged=pointer.drag;pointer=null;if(c.stage.hasPointerCapture(e.pointerId))c.stage.releasePointerCapture(e.pointerId);c.actor.controller?.interact('end',{},performance.now());if(!dragged)tap();});
    c.stage.addEventListener('pointercancel',()=>{pointer=null;c.actor.controller?.interact('cancel',{},performance.now());});
    c.stage.addEventListener('click',e=>{if(e.detail===0)tap();});
  }
  const tracks=[{name:"God's Plan",artist:'Drake',art:'assets/gods-plan.jpg',duration:198,elapsed:76}];
  let track=0,playing=false;
  function progress(){const duration=tracks[track].duration,value=Math.max(0,Math.min(duration,Number($('progress').value)||0));$('elapsed').textContent=`${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;$('progress').style.setProperty('--progress',`${value/duration*100}%`);$('progress').setAttribute('aria-valuetext',`${$('elapsed').textContent} of ${$('duration').textContent}`);}
  function playback(){ $('play-button').setAttribute('aria-label',playing?'Pause':'Play');$('play-icon').src=playing?'assets/cartoon/pause.svg':'assets/cartoon/play.svg'; }
  // Music is static product chrome, not a playable/list-browsing demo.
  // Orientation alone selects the supplied portrait/landscape visual state.
  function selectTrack(index,play=playing){track=(index+tracks.length)%tracks.length;const t=tracks[track];$('track-name').textContent=t.name;$('track-artist').textContent=t.artist;$('album-art').src=t.art;$('album-art').alt=t.name+' cover';$('duration').textContent=`${Math.floor(t.duration/60)}:${String(t.duration%60).padStart(2,'0')}`;$('progress').max=t.duration;$('progress').value=t.elapsed;playing=play;progress();playback();}
  document.querySelectorAll('.orientation-switch button').forEach(b=>b.addEventListener('click',()=>setLayout(b.dataset.layout)));
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  button.addEventListener('click',requestJump);
  document.addEventListener('doco:normalize-for-hero',normalizeForHero);
  reduced.addEventListener('change',e=>{paused=e.matches;if(loaded){reset();characters.forEach(c=>c.actor.setReduced(paused,performance.now()));paint(phone,performance.now(),true);}run();});
  new ResizeObserver(()=>{fit();if(loaded){reset();characters.forEach(size);paint(phone,performance.now(),true);run();}}).observe(panel);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;reset();for(const c of characters){c.actor.controller?.setVisible(false,performance.now());c.active=false;}}else run();});
  async function initialize(){
    fit();phone=create('phone-blob',743);pc=create('computer-blob',751);
    const deadline=performance.now()+20000;
    while(characters.some(c=>!c.renderer.mesh.ready&&!c.renderer.mesh.image?.naturalWidth)){if(performance.now()>deadline)throw Error('Artwork unavailable');await new Promise(r=>setTimeout(r,50));}
    loaded=true;characters.forEach(c=>c.stage.classList.add('is-ready'));flow.dataset.characterReady='true';reset();interact(phone);interact(pc);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible)reset();else{paint(location==='phone'?phone:pc,performance.now(),true);run();}},{threshold:.05}).observe($('hero-phone'));
    document.documentElement.dataset.docoReady='true';selectTrack(0);run();
  }
  initialize().catch(()=>{
    characters.forEach(c=>{c.renderer.element.style.visibility='hidden';c.stage.classList.remove('is-ready');});
    // Keep the complete phone and its static Doco artwork visible if a slow or
    // unsupported renderer misses initialization. The page remains useful and
    // never collapses into an empty hero while a reload can retry animation.
    flow.dataset.characterReady='true';
    document.documentElement.dataset.docoReady='true';
    busy(true);status('Animation could not load. Please reload.');
  });
})();
