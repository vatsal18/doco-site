'use strict';
(() => {
  const footer=document.querySelector('.site-footer');
  if(!footer)return;
  const link=document.getElementById('footer-play-link');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const stage=document.getElementById?.('footer-blob');
  const expressionDeck=['curious','happy','relaxed','amused','proud','playful'];
  let actor=null,renderer=null,blobFrame=null,blobRaf=0,blobVisible=false,blobPointer=null,hoverPoint=null,lastPointer=null;
  function expression(state){
    if(!actor?.controller)return;
    const now=performance.now();
    actor.controller.setState(state,'',0,now);
    const index=expressionDeck.indexOf(state);if(index>=0)actor.beat=index;
    actor.nextBeat=actor.controller.time+window.DocoDesktopActor.BEAT_MS;
  }
  function push(){
    footer.classList.add('is-pushing');
    if(!actor?.controller||reduced.matches)return;
    const now=performance.now();
    actor.controller.setState('happy','',0,now);
    actor.controller.interact('begin',{x:.72,y:.02},now);
    actor.controller.interact('drag',{x:1,y:.02,dx:.9,dy:0},now+1);
  }
  function release({proud=false}={}){
    footer.classList.remove('is-pushing','is-pressed');
    if(!actor?.controller)return;
    const now=performance.now();
    actor.controller.interact('end',{},now);
    if(proud)expression('proud');
  }
  function suspendBlob(){
    release();blobPointer=null;hoverPoint=null;cancelAnimationFrame(blobRaf);blobRaf=0;
    actor?.controller?.setVisible(false,performance.now());
  }
  function insideFooter(point){
    if(!point)return false;const rect=footer.getBoundingClientRect?.();
    return Boolean(rect&&point.x>=rect.left&&point.x<=rect.right&&point.y>=rect.top&&point.y<=rect.bottom);
  }
  function restoreHover(){
    if(!lastPointer||!insideFooter(lastPointer)||link?.contains?.(lastPointer.target))return;
    hoverPoint=blobPoint({clientX:lastPointer.x,clientY:lastPointer.y});
  }
  function resumeBlob(){
    if(document.hidden)return;
    if(document.activeElement===link)link.blur();
    footer.classList.remove('is-pushing','is-pressed');blobPointer=null;
    if(!actor?.controller||!renderer||!stage)return;
    const now=performance.now();actor.controller.setVisible(true,now);actor.controller.interact('cancel',{},now);
    expression(expressionDeck[(actor.beat+1)%expressionDeck.length]);restoreHover();
    sizeBlob();if(blobVisible)renderer.render(blobFrame);runBlob();
  }
  link?.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')push();});
  link?.addEventListener('pointerleave',()=>{if(document.activeElement!==link)release();});
  link?.addEventListener('focus',push);
  link?.addEventListener('blur',()=>release());
  link?.addEventListener('pointerdown',event=>{if(event.button===0){push();footer.classList.add('is-pressed');}});
  link?.addEventListener('pointerup',()=>release({proud:true}));
  link?.addEventListener('pointercancel',()=>release());
  link?.addEventListener('click',()=>{link.blur();release({proud:true});footer.classList.add('is-celebrating');setTimeout(()=>footer.classList.remove('is-celebrating'),700);expression('proud');});
  window.addEventListener('blur',suspendBlob);
  window.addEventListener('focus',resumeBlob);
  window.addEventListener('pageshow',resumeBlob);
  window.addEventListener('pointermove',event=>{if(event.pointerType==='mouse')lastPointer={x:event.clientX,y:event.clientY,target:event.target};},{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?suspendBlob():resumeBlob());

  if(!stage||!window.DocoCartoon?.Renderer||!window.DocoDesktopActor?.Actor)return;
  renderer=new window.DocoCartoon.Renderer({stage});
  actor=new window.DocoDesktopActor.Actor({poses:renderer.poses,Director:renderer.Director,seed:977,reduced:reduced.matches});
  blobFrame=new renderer.Director(renderer.poses,977).sample(0,true);
  function sizeBlob(){
    const density=Math.min(2,Math.max(1.5,window.devicePixelRatio||1));
    for(const canvas of [renderer.canvas,renderer.face]){
      const width=Math.max(1,Math.ceil(stage.clientWidth*density)),height=Math.max(1,Math.ceil(stage.clientHeight*density));
      if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
    }
  }
  function paintBlob(now){
    blobRaf=0;if(!blobVisible||document.hidden)return;
    blobFrame=actor.advance(now);
    if(hoverPoint&&!blobPointer&&!reduced.matches&&!footer.classList.contains('is-pushing')){
      const controller=actor.controller,busy=controller?.inputBusy()&&controller.living?.interaction?.kind!=='hover';
      if(!busy&&controller?.interact('hover',hoverPoint,now)!==false)hoverPoint=null;
    }
    renderer.render(blobFrame);blobRaf=requestAnimationFrame(paintBlob);
  }
  function runBlob(){if(blobVisible&&!document.hidden&&!blobRaf)blobRaf=requestAnimationFrame(paintBlob);}
  function blobPoint(event){
    const rect=stage.getBoundingClientRect();
    return {x:Math.max(-1,Math.min(1,(event.clientX-rect.left)/Math.max(1,rect.width)*2-1)),y:Math.max(-1,Math.min(1,(event.clientY-rect.top)/Math.max(1,rect.height)*2-1)),dx:blobPointer?(event.clientX-blobPointer.x)/Math.max(1,rect.width)*2:0,dy:blobPointer?(event.clientY-blobPointer.y)/Math.max(1,rect.height)*2:0};
  }
  function tapBlob(){actor.controller?.interact('tap',{x:0,y:0},performance.now());runBlob();}
  function startBlob(){
    sizeBlob();const now=performance.now(),controller=actor.begin(blobFrame,'everyday',now,'stretch','',2);
    actor.beats=[...expressionDeck];actor.beat=0;controller.setState(expressionDeck[0],'',0,now);stage.classList.add('is-ready');restoreHover();runBlob();
  }
  footer.addEventListener('pointermove',event=>{
    if(!blobVisible||event.pointerType!=='mouse'||reduced.matches||blobPointer)return;
    if(link?.contains?.(event.target)){hoverPoint=null;return;}
    if(document.activeElement===link)link.blur();footer.classList.remove('is-pushing','is-pressed');
    hoverPoint=blobPoint(event);
    runBlob();
  });
  footer.addEventListener('pointerleave',()=>{hoverPoint=null;if(!blobPointer){actor.controller?.interact('end',{},performance.now());runBlob();}});
  stage.addEventListener('pointerdown',event=>{if(event.button!==0)return;hoverPoint=null;blobPointer={id:event.pointerId,x:event.clientX,y:event.clientY,drag:false};stage.setPointerCapture?.(event.pointerId);actor.controller?.interact('begin',blobPoint(event),performance.now());runBlob();});
  stage.addEventListener('pointermove',event=>{if(!blobPointer||blobPointer.id!==event.pointerId)return;if(Math.hypot(event.clientX-blobPointer.x,event.clientY-blobPointer.y)>6)blobPointer.drag=true;if(blobPointer.drag)actor.controller?.interact('drag',blobPoint(event),performance.now());});
  stage.addEventListener('pointerup',event=>{if(!blobPointer||blobPointer.id!==event.pointerId)return;const dragged=blobPointer.drag;blobPointer=null;if(stage.hasPointerCapture?.(event.pointerId))stage.releasePointerCapture(event.pointerId);actor.controller?.interact('end',{},performance.now());if(!dragged)tapBlob();});
  stage.addEventListener('pointercancel',()=>{blobPointer=null;actor.controller?.interact('cancel',{},performance.now());});
  stage.addEventListener('click',event=>{if(event.detail===0)tapBlob();});
  reduced.addEventListener('change',event=>{release();actor.setReduced(event.matches,performance.now());runBlob();});
  new ResizeObserver(()=>{sizeBlob();if(blobVisible)renderer.render(blobFrame);}).observe(stage);
  new IntersectionObserver(entries=>{blobVisible=entries[0].isIntersecting;if(blobVisible){if(!actor.controller)startBlob();else{actor.controller.setVisible(true,performance.now());restoreHover();runBlob();}}else{hoverPoint=null;cancelAnimationFrame(blobRaf);blobRaf=0;actor.controller?.setVisible(false,performance.now());}},{threshold:.05}).observe(stage);
})();
