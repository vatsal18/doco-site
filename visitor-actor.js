// Visit-local acting using the same production controller as Android.
// Only the sanitized visual snapshot enters; no phone checkpoint or inference.
(function(root){
  'use strict';
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x));};
  function expression(kind,mode,variant=0){return root.DocoVisitsMotion?.presentation(kind,mode,variant).state||(kind==='water'?(mode==='focus'?'amused':'attentive'):(mode==='focus'?'mischievous':'relaxed'));}
  const BEAT_MS=4500;
  // Small reminder-specific performances, not inferred emotions or unrelated
  // quiet scenes. The thought stays readable while its delivery changes.
  function expressions(kind,mode,variant=0){
    const first=expression(kind,mode,variant),focus=mode==='focus';
    const follow=kind==='water'?(focus?['mischievous','amused','proud','curious']:['curious','happy','relaxed','amused']):(focus?['suspicious','stretching','amused','playful']:['stretching','happy','relaxed','playful']);
    return [first,...follow.filter(state=>state!==first)].slice(0,4);
  }
  function resolution(width,height,dpr=1){const ratio=Math.min(2,Math.max(1.5,Number.isFinite(dpr)?dpr:1));return {width:Math.max(1,Math.ceil(width*ratio)),height:Math.max(1,Math.ceil(height*ratio))};}
  function blend(a,b,p){
    const result={...b,pose:{},faceShift:{}};
    for(const key of Object.keys(b.pose))result.pose[key]=a.pose[key]+(b.pose[key]-a.pose[key])*p;
    for(const key of ['roll','yaw','pitch','blink','gazeX','gazeY','mouthOpen','leftLid','rightLid','bodyReach','bodyLean','bodyPress'])result[key]=(a[key]||0)+((b[key]||0)-(a[key]||0))*p;
    for(const key of ['x','y'])result.faceShift[key]=(a.faceShift?.[key]||0)+((b.faceShift?.[key]||0)-(a.faceShift?.[key]||0))*p;
    return result;
  }
  class Actor {
    constructor({poses,Director,seed=731,reduced=false}){Object.assign(this,{poses,Director,seed,reduced});this.controller=null;this.initial=null;this.started=null;this.last=null;this.beats=[];this.beat=0;this.nextBeat=Infinity;this.line='';}
    begin(visual,mode,wall,kind='stretch',line='',variant=0){
      this.initial=visual;this.started=null;this.last=visual;
      this.beats=expressions(kind,mode,variant).filter(state=>this.poses[state]);this.beat=0;this.nextBeat=Infinity;this.line=line;
      const c=this.controller=new root.DocoPerformance.Controller(this.poses,{Director:this.Director,seed:this.seed++,mode,reduced:this.reduced});
      c.setState(expression(kind,mode,variant),line,0,wall);
      // Pre-roll only the local actor, so its initial canonical expression has
      // settled before blending in. The synchronized jump still uses the exact
      // incoming pose and timestamps, with no warm-up on its critical boundary.
      for(let step=100;step<=1600;step+=100)c.advance(wall+step);
      c.wall=wall;c.idleAt=Infinity;c.setVisible(false,wall);
      return c;
    }
    advance(wall){
      const c=this.controller;if(!c)return this.last;
      if(this.started===null){this.started=wall;c.setVisible(true,wall);c.idleAt=Infinity;this.nextBeat=c.time+BEAT_MS;}
      let live=c.advance(wall);
      const directInput=c.inputBusy()&&c.living.interaction?.kind!=='hover';
      if(c.visible&&!this.reduced&&c.time>=this.nextBeat&&!directInput&&!c.scenes.active&&!(c.living.attention&&c.time<c.living.attention.end)){
        this.beat=(this.beat+1)%this.beats.length;
        c.setState(this.beats[this.beat],this.line,0,wall);c.idleAt=Infinity;
        // Sample the new velocity-continuous morph at its start: no snapped
        // pose, opacity dissolve, or missed-beat burst after an interaction.
        live=c.living.sample(c.time,false);c.lastFrame=live;this.nextBeat=c.time+BEAT_MS;
      }
      const p=this.reduced?1:smooth((wall-this.started)/600);
      this.last=p<1?blend(this.initial,live,p):live;return this.last;
    }
    setReduced(value,wall){this.reduced=Boolean(value);this.controller?.setReduced(this.reduced,wall);if(this.controller)this.nextBeat=this.controller.time+BEAT_MS;}
    stop(wall){this.controller?.setVisible(false,wall);this.controller=null;this.started=null;this.nextBeat=Infinity;this.beats=[];this.line='';}
  }
  root.DocoDesktopActor={Actor,blend,smooth,expression,expressions,BEAT_MS,resolution};
})(globalThis);
