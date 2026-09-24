'use strict';
(() => {
  const section=document.getElementById('film'),frame=document.getElementById('film-frame'),video=document.getElementById('product-film'),seek=document.getElementById('film-seek');
  if(!section||!frame||!video||!seek)return;
  section.classList.add('is-reveal-ready');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reducedMotion||!('IntersectionObserver' in window))section.classList.add('is-visible');
  else{
    const revealObserver=new window.IntersectionObserver(entries=>{
      if(!entries.some(entry=>entry.isIntersecting))return;
      section.classList.add('is-visible');
      revealObserver.disconnect();
    },{threshold:.22});
    revealObserver.observe(section);
  }
  video.controls=false;
  video.muted=true;
  const touchPlayback=window.matchMedia('(hover: none)').matches;
  let seeking=false;
  const clock=value=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
  function paintSeek(progress,current,duration){
    seek.value=String(progress);
    seek.style.setProperty('--film-progress',`${progress}%`);
    seek.setAttribute('aria-valuetext',duration?`${clock(current)} of ${clock(duration)}`:'0:00');
  }
  function updateSeek(){
    if(seeking)return;
    const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:0;
    const progress=duration?Math.min(100,Math.max(0,video.currentTime/duration*100)):0;
    paintSeek(progress,video.currentTime,duration);
  }
  async function play(){
    try{await video.play();frame.classList.add('is-hover-playing');}
    catch{frame.classList.remove('is-hover-playing');}
  }
  function pause(){video.pause();frame.classList.remove('is-hover-playing');}
  if(touchPlayback){
    video.addEventListener('click',async()=>{if(video.paused)await play();else pause();});
  }else{
    frame.addEventListener('mouseenter',play);
    frame.addEventListener('mouseleave',pause);
  }
  video.addEventListener('loadedmetadata',updateSeek);
  video.addEventListener('durationchange',updateSeek);
  video.addEventListener('timeupdate',updateSeek);
  video.addEventListener('seeked',()=>{seeking=false;updateSeek();});
  seek.addEventListener('input',()=>{
    if(!Number.isFinite(video.duration)||video.duration<=0)return;
    const progress=Math.min(100,Math.max(0,Number(seek.value)||0)),current=video.duration*progress/100;
    seeking=true;
    paintSeek(progress,current,video.duration);
    video.currentTime=current;
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  updateSeek();
})();
