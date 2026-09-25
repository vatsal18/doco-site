'use strict';
(() => {
  const toggle=document.getElementById('nav-toggle');
  const panel=document.getElementById('nav-panel');
  const dismiss=document.getElementById('nav-dismiss');
  const cards=[...document.querySelectorAll('.nav-card')];
  const wordmark=document.querySelector('.site-wordmark');
  const header=document.getElementById('site-navigation');
  if(!toggle||!panel||!dismiss||!cards.length)return;

  const syncProgressiveBlur=()=>header?.classList.toggle('has-scroll-under',(window.scrollY||0)>4);
  window.addEventListener('scroll',syncProgressiveBlur,{passive:true});
  window.addEventListener('pageshow',syncProgressiveBlur);
  syncProgressiveBlur();

  let open=false;
  const setOpen=(wanted,{restoreFocus=false}={})=>{
    open=Boolean(wanted);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    panel.setAttribute('aria-hidden',String(!open));
    panel.classList.toggle('is-open',open);
    document.body.classList.toggle('nav-open',open);
    cards.forEach(card=>card.tabIndex=open?0:-1);
    if(restoreFocus)toggle.focus();
  };

  toggle.addEventListener('click',()=>setOpen(!open));
  dismiss.addEventListener('click',()=>setOpen(false,{restoreFocus:true}));
  cards.forEach(card=>card.addEventListener('click',()=>setOpen(false)));
  wordmark?.addEventListener('click',()=>setOpen(false));
  const blockBackdropScroll=event=>{if(!event.target.closest?.('.nav-stack'))event.preventDefault();};
  panel.addEventListener('wheel',blockBackdropScroll,{passive:false});
  panel.addEventListener('touchmove',blockBackdropScroll,{passive:false});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&open){event.preventDefault();setOpen(false,{restoreFocus:true});}
    else if(open&&['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(event.key))event.preventDefault();
  });
})();
