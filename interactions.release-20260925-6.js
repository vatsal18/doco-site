'use strict';
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const items=[...document.querySelectorAll('.qa-list details')];
  const running=new Map();
  function expand(item,wanted){
    const start=item.getBoundingClientRect().height;
    running.get(item)?.cancel();running.delete(item);
    item.style.height='';item.style.overflow='';
    item.dataset.expanded=String(wanted);
    const summary=item.querySelector('summary');
    summary.setAttribute('aria-expanded',String(wanted));
    if(reduced.matches||!item.animate){item.open=wanted;return;}
    // Keep the answer rendered during closing; remove it only after settling.
    item.open=true;
    const style=getComputedStyle(item);
    const border=parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
    const end=wanted?item.getBoundingClientRect().height:summary.getBoundingClientRect().height+border;
    item.style.overflow='hidden';
    const animation=item.animate([{height:start+'px'},{height:end+'px'}],{duration:360,easing:'cubic-bezier(.22,.8,.2,1)',fill:'both'});
    running.set(item,animation);
    animation.onfinish=()=>{
      if(running.get(item)!==animation)return;
      item.open=wanted;animation.cancel();running.delete(item);
      item.style.height='';item.style.overflow='';
    };
  }
  items.forEach(item=>{
    item.dataset.expanded=String(item.open);
    const summary=item.querySelector('summary');
    summary.setAttribute('aria-expanded',String(item.open));
    summary.addEventListener('click',event=>{
      event.preventDefault();
      const wanted=item.dataset.expanded!=='true';
      if(wanted)for(const other of items)if(other!==item&&other.dataset.expanded==='true')expand(other,false);
      expand(item,wanted);
    });
  });
  reduced.addEventListener('change',event=>{
    if(event.matches)for(const item of items){running.get(item)?.cancel();running.delete(item);item.open=item.dataset.expanded==='true';item.style.height='';item.style.overflow='';}
  });

  // The final row answers common free-form questions locally. It intentionally
  // uses no account, API key, network request or pretend contact submission.
  const askForm=document.getElementById?.('qa-ask-form');
  const askInput=document.getElementById?.('qa-ask-input');
  const askButton=document.getElementById?.('qa-ask-button');
  const askAnswer=document.getElementById?.('qa-ask-answer');
  const askAnswerCopy=document.getElementById?.('qa-ask-answer-copy');
  const askEmail=document.getElementById?.('qa-ask-email');
  const askError=document.getElementById?.('qa-ask-error');
  let answerTimer=0;
  const answerFor=question=>window.DocoKnowledge?.resolve(question)||{known:false,answer:'Doco does not know that one yet. Send your question to'};
  if(askForm&&askInput&&askButton&&askAnswer&&askAnswerCopy&&askEmail&&askError){
    const resetAnswer=()=>{
      clearTimeout(answerTimer);answerTimer=0;
      askForm.dataset.state='';askForm.removeAttribute('aria-busy');
      askButton.textContent='Ask';askAnswer.hidden=true;askAnswerCopy.textContent='';askEmail.hidden=true;askError.hidden=true;askError.textContent='';askInput.removeAttribute('aria-invalid');
    };
    askButton.disabled=!askInput.value.trim();
    askInput.addEventListener('input',()=>{
      const hasQuestion=askInput.value.trim().length>=3;
      if(!hasQuestion||askForm.dataset.state==='answered'||askForm.dataset.state==='thinking')resetAnswer();
      askButton.disabled=!hasQuestion;
    });
    askForm.addEventListener('submit',event=>{
      event.preventDefault();
      const question=askInput.value.trim();
      if(question.length<3){askError.textContent='Please enter at least 3 characters.';askError.hidden=false;askInput.setAttribute('aria-invalid','true');askInput.focus();return;}
      for(const item of items)if(item.dataset.expanded==='true')expand(item,false);
      clearTimeout(answerTimer);
      askForm.dataset.state='thinking';askForm.setAttribute('aria-busy','true');
      askButton.disabled=true;askButton.textContent='…';askAnswer.hidden=false;askAnswerCopy.textContent='Doco is thinking…';askEmail.hidden=true;
      answerTimer=setTimeout(()=>{
        const result=answerFor(question);
        answerTimer=0;askAnswerCopy.textContent=result.answer;askEmail.hidden=result.known;askForm.dataset.state='answered';askForm.removeAttribute('aria-busy');askButton.textContent='Ask';askButton.disabled=false;
      },reduced.matches?0:520);
    });
  }

  // Smooth desktop wheel movement on the real document, not a translated page.
  // Touch, horizontal scrolling, keyboard, browser zoom and nested scrollers stay native.
  let frame=0,target=0,last=0,expected=0,position=0;
  const root=document.documentElement;
  const maximum=()=>Math.max(0,root.scrollHeight-window.innerHeight);
  const clamp=value=>Math.max(0,Math.min(maximum(),value));
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;root.classList.remove('smooth-wheel');}
  function step(time){
    if(Math.abs(window.scrollY-expected)>3){stop();return;}
    const dt=last?Math.min(64,time-last):16;last=time;
    target=clamp(target);
    const next=position+(target-position)*(1-Math.exp(-dt/100));
    position=Math.abs(target-next)<1?target:next;
    expected=position;
    window.scrollTo({top:expected,left:window.scrollX,behavior:'instant'});
    expected=window.scrollY;
    if(Math.abs(target-expected)<1){stop();return;}
    frame=requestAnimationFrame(step);
  }
  window.addEventListener('wheel',event=>{
    if(event.defaultPrevented||document.body.classList?.contains('nav-open')||reduced.matches||event.ctrlKey||event.shiftKey||!event.cancelable||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    for(let element=event.target; element&&element!==document.body; element=element.parentElement){
      if(element.matches?.('input,textarea,select,[contenteditable="true"]'))return;
      if(element.scrollHeight>element.clientHeight+1&&/auto|scroll/.test(getComputedStyle(element).overflowY))return;
    }
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);
    if(!delta)return;
    if(!frame){target=window.scrollY;expected=target;position=target;}
    const next=clamp(target+delta);
    if(next===target&&!frame)return;
    event.preventDefault();target=next;
    if(!frame){root.classList.add('smooth-wheel');frame=requestAnimationFrame(step);}
  },{passive:false});
  window.addEventListener('keydown',stop);
  window.addEventListener('pointerdown',stop,{passive:true});
  window.addEventListener('touchstart',stop,{passive:true});
  window.addEventListener('blur',stop);
  document.addEventListener('visibilitychange',stop);
  reduced.addEventListener('change',stop);
})();
