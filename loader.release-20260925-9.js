'use strict';
(() => {
  const loader=document.getElementById('site-loader'),fill=document.getElementById('loader-fill'),percent=document.getElementById('loader-percent'),copy=document.getElementById('loader-copy');
  if(!loader)return;
  const started=performance.now();
  let fontsLoaded=!document.fonts,finished=false,timer=0;
  const setProgress=value=>{const safe=Math.max(8,Math.min(100,Math.round(value)));fill.style.width=`${safe}%`;percent.textContent=`${safe}%`;loader.setAttribute('aria-label',`Loading Doco, ${safe}%`);};
  const reveal=reason=>{
    if(finished)return;finished=true;clearInterval(timer);setProgress(100);
    if(reason==='timeout')copy.textContent='Ready enough. Let’s go.';
    else copy.textContent='Doco is ready.';
    const wait=Math.max(0,850-(performance.now()-started));
    setTimeout(()=>{loader.classList.add('is-leaving');document.body.classList.remove('is-loading');setTimeout(()=>loader.hidden=true,600);},wait);
  };
  document.fonts?.ready.then(()=>{fontsLoaded=true;check();}).catch(()=>{fontsLoaded=true;check();});
  function check(){
    if(finished)return;
    const domLoaded=document.readyState!=='loading',characterReady=document.documentElement.dataset.docoReady==='true';
    const progress=8+(domLoaded?20:0)+(fontsLoaded?22:0)+(characterReady?50:0);
    setProgress(progress);
    if(domLoaded&&fontsLoaded&&characterReady)reveal('ready');
  }
  document.addEventListener('readystatechange',check);
  timer=setInterval(check,100);
  setTimeout(()=>{clearInterval(timer);if(!finished)reveal('timeout');},7000);
  check();
})();
