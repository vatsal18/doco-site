'use strict';
(() => {
  const clamp=value=>Math.min(1,Math.max(0,value));
  const progress=(top,height,viewport,remaining=Infinity)=>{
    const distance=viewport*.82-top;
    // Last section: finish before the document's bottom, not beyond its scroll range.
    return clamp(distance/Math.max(1,Math.min(height+viewport*.52,distance+remaining)));
  };
  const wordProgress=(index,count,value)=>clamp(value*(count+1)-index);
  // Small pure helpers also let the scroll behavior be checked without a browser.
  if(typeof module==='object'&&module.exports)module.exports={progress,wordProgress};
  if(typeof document==='undefined')return;
  const quote=document.getElementById('friendship-quote');
  if(!quote)return;
  const words=quote.textContent.trim().split(/\s+/).map(text=>{
    const word=document.createElement('span');word.className='quote-word';word.textContent=text;return word;
  });
  quote.replaceChildren(...words.flatMap((word,index)=>index?[document.createTextNode(' '),word]:[word]));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=0,last=-1;
  function paint(){
    raf=0;
    const rect=quote.getBoundingClientRect(),remaining=Math.max(0,document.documentElement.scrollHeight-window.innerHeight-window.scrollY);
    const value=reduced.matches?1:progress(rect.top,rect.height,window.innerHeight,remaining);
    if(value===last)return;last=value;
    // Change ink, not opacity: text and its accessible reading order stay present.
    words.forEach((word,index)=>{
      const amount=wordProgress(index,words.length,value);
      const pale=[206,224,252],blue=[57,128,254];
      word.style.color=`rgb(${pale.map((v,i)=>Math.round(v+(blue[i]-v)*amount)).join(',')})`;
    });
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(paint);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  document.fonts?.ready.then(schedule);
  paint();
})();
