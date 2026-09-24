'use strict';
(() => {
  const form=document.getElementById('waitlist-form');
  const email=document.getElementById('waitlist-email'),message=document.getElementById('waitlist-message');
  const submit=form?.querySelector('button[type="submit"]');
  const endpoint=document.querySelector('meta[name="doco-waitlist-api"]')?.content.trim()||'/api/waitlist';
  const focusLinks=[...document.querySelectorAll('[href="#waitlist-email"]')];
  focusLinks.forEach(link=>link.addEventListener('click',()=>requestAnimationFrame(()=>email?.focus())));
  form?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!email.checkValidity()){email.reportValidity();return;}
    submit.disabled=true;submit.textContent='Joining…';message.textContent='';
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({email:email.value,company:form.elements.company.value})});
      const result=await response.json();
      if(!response.ok)throw Error(result.error||'waitlist_unavailable');
      form.classList.add('is-complete');email.disabled=true;
      submit.textContent='Done';message.textContent='';
    }catch(error){
      submit.disabled=false;submit.textContent='Join Waitlist';
      message.textContent=error.message==='invalid_email'?'Enter a valid email address.':'Couldn’t join right now. Please try again.';
    }
  });
})();
