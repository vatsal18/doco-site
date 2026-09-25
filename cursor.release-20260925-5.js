'use strict';
(() => {
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  // Exact damped-spring integration: identical feel at 60/120/144Hz.
  function spring(position,velocity,target,seconds){
    const dt=clamp(seconds,0,.08),frequency=28,damping=.8;
    const decay=damping*frequency,oscillation=frequency*Math.sqrt(1-damping*damping);
    const delta=position-target,b=(velocity+decay*delta)/oscillation;
    const cos=Math.cos(oscillation*dt),sin=Math.sin(oscillation*dt),fade=Math.exp(-decay*dt);
    return {position:target+fade*(delta*cos+b*sin),velocity:fade*(velocity*cos-(decay*b+delta*oscillation)*sin)};
  }
  function labelFor(element){
    if(!element||element.disabled||element.closest('[inert],[hidden],[aria-hidden="true"]'))return '';
    if(element.dataset.cursorLabel==='none')return '';
    if(element.matches('.blob-stage'))return 'It tickles';
    if(element.matches('.store-link'))return 'Join';
    if(element.matches('.orientation-switch button'))return 'Rotate';
    if(element.matches('.mode-switch button'))return 'Switch';
    const labels={'jump-button':'Leap','queue-button':'Up next','previous-button':'Previous','next-button':'Next'};
    if(element.id==='play-button')return element.getAttribute('aria-label')==='Pause'?'Pause':'Play';
    return element.dataset.cursorLabel||labels[element.id]||'Click';
  }
  if(typeof module==='object'&&module.exports){module.exports={spring,labelFor};return;}
  const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const cursor=document.createElement('div'),tag=document.createElement('span');
  cursor.className='context-cursor';cursor.setAttribute('aria-hidden','true');
  tag.className='context-cursor-tag';cursor.append(tag);document.body.append(cursor);
  let enabled=false,inside=false,drag=null,label='',frame=0,lastTime=0,ready=false;
  let x=0,y=0,vx=0,vy=0,px=0,py=0,width=70,height=30;
  function stop(){
    cursor.classList.remove('is-visible','is-pressed');cancelAnimationFrame(frame);
    frame=0;lastTime=0;ready=false;label='';drag=null;
  }
  function configure(){enabled=fine.matches&&!reduced.matches;document.documentElement.classList.toggle('cursor-enabled',enabled);stop();}
  function targetLabel(target){return labelFor(target?.closest('button,a[href],[data-cursor-label]'));}
  function refresh(target){
    const next=drag?'It tickles':targetLabel(target);
    if(!next){stop();return;}
    if(next!==label){label=next;tag.textContent=label;width=tag.offsetWidth;height=tag.offsetHeight;}
    cursor.classList.add('is-visible');schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function paint(now){
    frame=0;if(!enabled||!inside||!label)return;
    const tx=clamp(px+22,8,Math.max(8,innerWidth-width-8)),ty=clamp(py-height-24,8,Math.max(8,innerHeight-height-8));
    if(!ready){x=tx;y=ty;vx=vy=0;ready=true;}
    const dt=lastTime?(now-lastTime)/1000:1/60;lastTime=now;
    const sx=spring(x,vx,tx,dt),sy=spring(y,vy,ty,dt);x=sx.position;y=sy.position;vx=sx.velocity;vy=sy.velocity;
    cursor.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    tag.style.setProperty('--cursor-tilt',`${clamp(vx*.012,-10,10).toFixed(2)}deg`);
    if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.1)schedule();else lastTime=0;
  }
  document.addEventListener('pointermove',event=>{
    if(!enabled||event.pointerType!=='mouse'){inside=false;stop();return;}
    inside=true;px=event.clientX;py=event.clientY;refresh(event.target);
  },{passive:true});
  document.addEventListener('pointerover',event=>{
    if(!enabled||event.pointerType!=='mouse')return;
    inside=true;px=event.clientX;py=event.clientY;refresh(event.target);
  },{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(!enabled||event.pointerType!=='mouse'||event.button!==0)return;
    const stage=event.target.closest('.blob-stage');
    if(stage&&labelFor(stage))drag=stage;
    cursor.classList.add('is-pressed');
  },{passive:true});
  document.addEventListener('pointerup',event=>{
    drag=null;cursor.classList.remove('is-pressed');
    if(enabled&&inside&&event.pointerType==='mouse')refresh(document.elementFromPoint(event.clientX,event.clientY));
  },{passive:true});
  document.addEventListener('pointercancel',()=>{inside=false;stop();},{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{inside=false;stop();},{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Tab'||event.key==='Escape'){inside=false;stop();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){inside=false;stop();}});
  window.addEventListener('blur',()=>{inside=false;stop();});
  window.addEventListener('scroll',()=>{
    if(enabled&&inside)refresh(document.elementFromPoint(px,py));
  },{passive:true});
  // A busy/hidden control can change underneath a stationary pointer.
  new MutationObserver(()=>{
    if(enabled&&inside)refresh(document.elementFromPoint(px,py));
  }).observe(document.querySelector('main'),{subtree:true,attributes:true,attributeFilter:['disabled','hidden','inert','aria-label','aria-hidden','aria-busy']});
  fine.addEventListener('change',configure);reduced.addEventListener('change',configure);configure();
})();
