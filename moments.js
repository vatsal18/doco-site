'use strict';
(() => {
  const deck=document.querySelector('.moments-deck');if(!deck)return;
  const cards=[...deck.querySelectorAll('[data-moment]')];
  let hovered=-1,focused=-1;
  const render=()=>{
    const active=hovered>=0?hovered:focused;
    cards.forEach((card,i)=>{
      card.classList.toggle('is-active',i===active);
      // Reference motion: isolate the active card, compress neighbours into
      // left/right stacks. Immediate neighbours travel most, outer cards less.
      const distance=Math.abs(i-active),shift=active<0||i===active?0:(i<active?-1:1)*70/distance;
      card.style.setProperty('--fan-shift',`${shift}%`);
    });
  };
  cards.forEach((card,i)=>{
    card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=i;render();}});
    card.addEventListener('pointerdown',()=>{focused=-1;render();});
    card.addEventListener('focus',()=>{focused=card.matches(':focus-visible')?i:-1;if(focused>=0)hovered=-1;render();});
    card.addEventListener('blur',()=>{focused=-1;render();});
    // These are moment previews, not persistent selections. Mouse/touch clicks
    // must never pin the expanded fan after the pointer leaves.
  });
  // Reset in empty gaps on real pointer movement, not on animated card-boundary
  // changes; this prevents a stationary cursor from making the fan oscillate.
  deck.addEventListener('pointermove',event=>{
    if(event.pointerType==='mouse'&&hovered>=0&&!event.target.closest('[data-moment]')){hovered=-1;render();}
  });
  deck.addEventListener('pointerleave',()=>{hovered=-1;render();});
  window.addEventListener('blur',()=>{hovered=focused=-1;render();});
  deck.addEventListener('keydown',event=>{
    if(event.key==='Escape'){hovered=focused=-1;render();return;}
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const current=Math.max(0,cards.indexOf(document.activeElement));
    const next=event.key==='Home'?0:event.key==='End'?cards.length-1:(current+(event.key==='ArrowRight'?1:cards.length-1))%cards.length;
    cards[next].focus();
  });
})();
