'use strict';
((root,factory)=>{
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root&&root.document)api.mount(root);
})(typeof globalThis==='object'?globalThis:this,()=>{
  const clamp=(min,value,max)=>Math.min(max,Math.max(min,value));
  const smooth=value=>{const t=clamp(0,value,1);return t*t*(3-2*t);};
  const progress=(scroll,start,end)=>end<=start?(scroll>=end?1:0):clamp(0,(scroll-start)/(end-start),1);
  const stepToward=(current,target,step)=>current<target?Math.min(target,current+step):Math.max(target,current-step);
  const crossingPanelTop=(centerY,scale,panelTop,band=42)=>centerY+198*scale>panelTop&&centerY-198*scale<panelTop+band;
  const heroScale=width=>.8+.8*clamp(0,(width-390)/1050,1);
  const mobileHeightProgress=height=>clamp(0,(height-680)/164,1);
  const mobileHeroScale=(width,height=844)=>{
    const widthScale=1.25+.35*clamp(0,(width-303)/192,1);
    return widthScale*(.84+.16*mobileHeightProgress(height));
  };
  const mobileHeroY=(width,height=844)=>36+12*mobileHeightProgress(height)+198*mobileHeroScale(width,height);

  function dockPose({panelWidth,panelHeight,panelLeft=0,panelTop=0,mobile=false,desktop=false,layout='portrait'}){
    let base=Math.min(panelWidth/830,panelHeight/510),factor=1,logicalX=415,logicalY=277,centerY=panelHeight*.5;
    if(mobile){
      // The mobile scene is rendered at 54% panel height, so every docked
      // device must share that centerline, including the desktop split view.
      centerY=panelHeight*.54;
      if(!desktop)base=layout==='portrait'?Math.min(.84,(panelHeight-60)/396):Math.min(.95,(panelWidth-32)/396);
    }
    if(desktop&&layout==='portrait'){logicalX=651.25;logicalY=264.5;factor=.75;}
    if(desktop&&layout==='landscape'){logicalX=613;logicalY=332;factor=.7;}
    return {x:panelLeft+panelWidth/2+(logicalX-415)*base,y:panelTop+centerY+(logicalY-255)*base,scale:base*factor};
  }

  function mount(win){
    const doc=win.document,flow=doc.getElementById('hero-demo-flow'),hero=doc.querySelector('.hero'),panel=doc.getElementById('demo-panel'),phone=doc.getElementById('hero-phone');
    if(!flow||!hero||!panel||!phone)return;
    const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
    const NORMALIZE_MS=850,CATCHUP_MS=700;
    let frame=0,lastRaw=0,normalizingReturn=false,catchingReturn=false,normalizeStarted=0,visualT=null,lastFrameTime=0;

    const syncData=()=>{
      flow.dataset.layout=panel.dataset.layout||'portrait';
      flow.dataset.desktop=panel.dataset.desktop||'false';
      schedule();
    };
    const render=(now=0)=>{
      frame=0;
      const flowRect=flow.getBoundingClientRect(),heroRect=hero.getBoundingClientRect(),panelRect=panel.getBoundingClientRect();
      const scroll=win.scrollY,flowTop=scroll+flowRect.top,heroHeight=heroRect.height;
      const startY=flowTop+heroHeight*.06,endY=flowTop+heroHeight*.72;
      const raw=progress(scroll,startY,endY),returning=raw<lastRaw-.0005;
      const specialState=panel.dataset.layout!=='portrait'||panel.dataset.desktop==='true';
      if(returning&&raw<.998&&!normalizingReturn&&!catchingReturn&&specialState){
        normalizingReturn=true;
        normalizeStarted=now;
        flow.dataset.returnPhase='normalizing';
        doc.dispatchEvent(new CustomEvent('doco:normalize-for-hero'));
      }
      const target=reduced.matches?(raw<.5?0:1):smooth(raw);
      if(visualT===null)visualT=target;
      if(reduced.matches){
        normalizingReturn=false;catchingReturn=false;visualT=target;flow.dataset.returnPhase='idle';
      }else if(normalizingReturn){
        visualT=1;
        const normalized=panel.dataset.layout==='portrait'&&panel.dataset.desktop!=='true';
        if(normalized&&now-normalizeStarted>=NORMALIZE_MS){
          normalizingReturn=false;catchingReturn=true;flow.dataset.returnPhase='returning';lastFrameTime=now;schedule();
        }else schedule();
      }else if(catchingReturn){
        const elapsed=Math.max(1,Math.min(40,now-lastFrameTime||16));
        visualT=stepToward(visualT,target,elapsed/CATCHUP_MS);
        lastFrameTime=now;
        if(Math.abs(visualT-target)<=.001){visualT=target;catchingReturn=false;flow.dataset.returnPhase='idle';}
        else schedule();
      }else visualT=target;
      lastRaw=raw;
      const t=visualT;
      const mobile=win.innerWidth<=600,compactHero=win.innerWidth<=900;
      const heroOffset=heroRect.top-flowRect.top;
      const start={
        x:flowRect.width/2,
        y:heroOffset+(compactHero?mobileHeroY(win.innerWidth,win.innerHeight):Math.max(360,Math.min(438,heroHeight*.48))),
        scale:compactHero?mobileHeroScale(win.innerWidth,win.innerHeight):heroScale(win.innerWidth)
      };
      const dock=dockPose({panelWidth:panelRect.width,panelHeight:panelRect.height,panelLeft:panelRect.left-flowRect.left,panelTop:panelRect.top-flowRect.top,mobile,desktop:panel.dataset.desktop==='true',layout:panel.dataset.layout||'portrait'});
      const x=start.x+(dock.x-start.x)*t,y=start.y+(dock.y-start.y)*t,scale=start.scale+(dock.scale-start.scale)*t;
      phone.style.setProperty('--phone-x',`${x}px`);
      phone.style.setProperty('--phone-y',`${y}px`);
      phone.style.setProperty('--phone-scale',String(scale));
      flow.dataset.layoutReady='true';
      const journey=t<=.002?'hero':t>=.998?'docked':'moving';
      phone.dataset.journey=journey;
      flow.dataset.journey=journey;
      const panelTop=panelRect.top-flowRect.top;
      const cleanEntry=panel.dataset.layout==='portrait'&&panel.dataset.desktop!=='true';
      flow.dataset.entryVeil=String(cleanEntry&&journey==='moving'&&crossingPanelTop(y,scale,panelTop));
    };
    function schedule(){if(!frame)frame=win.requestAnimationFrame(render);}

    new MutationObserver(syncData).observe(panel,{attributes:true,attributeFilter:['data-layout','data-desktop']});
    new ResizeObserver(schedule).observe(flow);
    win.addEventListener('scroll',schedule,{passive:true});
    win.addEventListener('resize',schedule,{passive:true});
    win.addEventListener('pageshow',schedule);
    reduced.addEventListener('change',schedule);
    doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)schedule();});
    doc.documentElement.dataset.phoneJourney='true';
    flow.dataset.returnPhase='idle';
    syncData();
  }

  return {clamp,smooth,progress,stepToward,crossingPanelTop,heroScale,mobileHeroScale,mobileHeroY,dockPose,mount};
});
