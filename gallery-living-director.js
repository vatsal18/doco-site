(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./gallery-living-motion'):root.DocoLivingMotion,typeof module==='object'&&module.exports?require('./gallery-performance-catalog'):root.DocoPerformances,typeof module==='object'&&module.exports?require('./gallery-robot-director'):root.DocoRobotDirector);if(typeof module==='object'&&module.exports)module.exports=api;root.DocoLivingDirector=api;})(globalThis,function(M,C,D){
  const SYSTEM=new Set(['camera-off','calibrating']);
  // Synthetic event cues only: no device listener or notification payloads.
  const ATTENTION=Object.freeze(Object.fromEntries(Object.entries({
    up:{label:'Look up',priority:0,cooldown:700,eye:160,surface:340,body:430,hold:900,rest:1650,x:0,y:-2.5,pitch:-.08,lift:-.9},
    notification:{label:'Notification',priority:1,cooldown:4500,eye:150,surface:310,body:400,hold:960,rest:1750,x:0,y:-2.6,pitch:-.085,lift:-1.05},
    call:{label:'Incoming call',priority:3,cooldown:7000,eye:140,surface:290,body:380,hold:1750,rest:2650,x:0,y:-2.9,pitch:-.105,lift:-1.35},
    theme:{label:'Theme toggle',priority:2,cooldown:1100,eye:145,surface:300,body:400,hold:760,rest:1520,x:2.6,y:-2.4,pitch:-.078,lift:-.9}
  }).map(([kind,profile])=>[kind,Object.freeze(profile)])));
  class Director{
    constructor(poses,seed=731,{motionStyle='gallery'}={}){
      this.motionStyle=motionStyle==='expressive'?'expressive':'gallery';
      this.actingProfile=C.actingProfile?.()||{followMinMs:4000,followMaxMs:8000};
      this.poses=poses;this.seed=seed;this.state='idle';this.time=0;this.changed=0;this.started=0;this.performanceEnd=0;this.followup=false;this.phase='Quiet hold';
      this.take=C.catalog.idle[0];this.bag=new M.Bag(seed);this.holdRandom=new M.Random(seed^937);this.blinkRandom=new M.Random(seed^1777);
      const bounds=this.motionStyle==='expressive'?C.EXPRESSIVE_BOUNDS:C.BOUNDS;
      this.morph=new M.Morph(poses);this.tracks=Object.fromEntries(Object.entries(C.REST).map(([k,v])=>[k,new M.Track(v,bounds[k])]));this.blinkTrack=new M.Track(0,[0,1]);
      this.nextBlink=2000+this.blinkRandom.next()*1800;this.nextFollowAt=4000+this.holdRandom.next()*4000;this.followups=[];this.selectionHistory=[];this.holdUntil=0;this.bodyAt=0;
      this.attention=null;this.attentionCooldowns={};this.attentionHistory=[];
    }
    retarget(state,time,options={}){
      if(!C.catalog[state])return false;
      this.advance(time);
      if(state===this.state&&!options.replay)return false;
      const takes=C.catalog[state],selected=options.takeId? takes.find(t=>t.id===options.takeId):null;
      if(options.actingProfile)this.actingProfile=C.actingProfile?.(options.actingProfile)||options.actingProfile;
      const preferred=Array.isArray(options.preferredGestures)?takes.filter(t=>options.preferredGestures.includes(t.gesture)):[];
      const candidates=takes;
      const bagKey=options.preferenceKey?`${state}:${options.preferenceKey}`:state;
      let chosen=selected?.id||this.bag.pick(bagKey,candidates.map(t=>t.id),preferred.map(t=>t.id));
      // Replay means another performance even after explicitly inspecting a
      // named take. That manually displayed take may still be next in the bag.
      if(!selected&&candidates.length>1&&chosen===options.avoidTakeId)chosen=this.bag.pick(bagKey,candidates.map(t=>t.id),preferred.map(t=>t.id));
      this.take=takes.find(t=>t.id===chosen);
      this.state=state;this.changed=time;this.followup=false;
      this.morph.target(state,time,D.duration(state));this.perform(time,false);
      this.selectionHistory.push({state,takeId:this.take.id,time});if(this.selectionHistory.length>100)this.selectionHistory.shift();
      if(state==='camera-off')this.nextBlink=Infinity;
      else if(!Number.isFinite(this.nextBlink))this.nextBlink=Math.max(time,this.blinkTrack.end)+2200+this.blinkRandom.next()*1800;
      return true;
    }
    perform(time,follow){
      this.attention=null;
      const p=D.timing(this.state),action=C.choreography(this.take,p,follow,this.motionStyle,this.actingProfile);this.started=time;this.followup=follow;this.holdUntil=time+action.holdUntil;this.bodyAt=time+action.bodyAt;
      this.performanceEnd=Math.max(time,follow?time:this.morph.end);
      for(const [k,t] of Object.entries(this.tracks))this.performanceEnd=Math.max(this.performanceEnd,t.plan(action.frames[k],time,action.delays[k]));
      this.nextFollowAt=SYSTEM.has(this.state)?Infinity:this.performanceEnd+this.followDelay();
      if(follow){this.followups.push({state:this.state,takeId:this.take.id,time,end:this.performanceEnd,next:this.nextFollowAt});if(this.followups.length>100)this.followups.shift();}
    }
    respond(time,options={}){
      if(SYSTEM.has(this.state)||time<this.performanceEnd||this.inputBusy?.(time))return false;
      const takes=C.catalog[this.state],key=`dialogue:${this.state}:${options.preferenceKey||'default'}`;
      const preferred=takes.filter(t=>options.preferredGestures?.includes(t.gesture)).map(t=>t.id);
      let chosen=this.bag.pick(key,takes.map(t=>t.id),preferred);
      if(takes.length>1&&chosen===this.take.id)chosen=this.bag.pick(key,takes.map(t=>t.id),preferred);
      this.take=takes.find(t=>t.id===chosen);
      this.perform(time,true);
      return true;
    }
    followDelay(){const min=this.actingProfile.followMinMs??4000,max=this.actingProfile.followMaxMs??8000;return min+this.holdRandom.next()*Math.max(0,max-min);}
    startBlink(time){
      if(this.state==='camera-off')return false;
      // A manual blink never restarts an eyelid that is already closing/opening.
      if(time<this.blinkTrack.end)return false;
      const slow=this.state==='sleepy',close=slow?120:65,hold=slow?70:35,open=slow?240:130;
      this.blinkTrack.plan([[close,1],[close+hold,1],[close+hold+open,0]],time);
      this.nextBlink=this.blinkTrack.end+2300+this.blinkRandom.next()*2400;return true;
    }
    blink(time){this.advance(time);return this.startBlink(time);}
    setActingProfile(profile,time){
      this.advance(time);this.actingProfile=C.actingProfile?.(profile)||profile||this.actingProfile;
      if(!SYSTEM.has(this.state)&&time>=this.performanceEnd)this.nextFollowAt=time+this.followDelay();
    }
    look(direction,time){
      this.advance(time);if(SYSTEM.has(this.state))return;
      this.attention=null;
      const x=M.clamp(direction,-4,4),p=D.timing('attentive'),values=C.amplify({gazeX:x,gazeY:0,headX:x*.45,headY:0,roll:x*.003,yaw:x*.035,pitch:0},this.motionStyle);
      this.started=time;this.followup=true;this.holdUntil=time+p.hold;this.bodyAt=time+p.body;this.performanceEnd=time;
      for(const [k,v] of Object.entries(values)){const eye=k.startsWith('gaze'),surface=k==='yaw';this.performanceEnd=Math.max(this.performanceEnd,this.tracks[k].plan([[eye?p.eye:surface?p.surface:p.body,v],[p.hold,v],[p.rest,0]],time,eye?0:surface?p.surfaceStart:p.bodyStart));}
      // Settle facial performance too, from its current value and velocity.
      for(const k of ['leftLid','rightLid','smile','mouthOpen'])this.performanceEnd=Math.max(this.performanceEnd,this.tracks[k].plan([[p.rest,0]],time));
      this.nextFollowAt=this.performanceEnd+this.followDelay();
    }
    attend(kind,time){
      const cue=ATTENTION[kind];if(!cue)return false;
      this.advance(time);if(SYSTEM.has(this.state))return false;
      const active=this.attention&&time<this.attention.end?this.attention:null;
      if(active&&cue.priority<=ATTENTION[active.kind].priority)return false;
      if(time<(this.attentionCooldowns[kind]??-Infinity))return false;
      const values=C.amplify({gazeX:cue.x,gazeY:cue.y,headX:cue.x*.35,headY:cue.lift,roll:cue.x*.002,yaw:cue.x*.035,pitch:cue.pitch},this.motionStyle);
      this.started=time;this.followup=false;this.holdUntil=time+cue.hold;this.bodyAt=time+cue.body;
      this.performanceEnd=Math.max(time,this.morph.end);
      for(const [key,value] of Object.entries(values)){
        const eye=key.startsWith('gaze'),surface=key==='yaw'||key==='pitch';
        this.performanceEnd=Math.max(this.performanceEnd,this.tracks[key].plan([[eye?cue.eye:surface?cue.surface:cue.body,value],[cue.hold,value],[cue.rest,0]],time,eye?0:surface?45:85));
      }
      // Preserve canonical emotion, ongoing morph, take history and blink. Only
      // retire an outgoing chuckle/lid gesture smoothly while attention turns.
      for(const key of ['leftLid','rightLid','smile','mouthOpen'])this.performanceEnd=Math.max(this.performanceEnd,this.tracks[key].plan([[320,0]],time));
      this.attention={kind,label:cue.label,started:time,end:this.performanceEnd};
      this.attentionHistory.push({...this.attention,state:this.state,takeId:this.take.id});if(this.attentionHistory.length>40)this.attentionHistory.shift();
      this.attentionCooldowns[kind]=time+cue.cooldown;
      this.nextFollowAt=this.performanceEnd+this.followDelay();
      return true;
    }
    advance(time){
      if(time<this.time-1e-7)throw new Error('Restore a checkpoint before seeking backwards');
      // Process exact event timestamps, not the first frame after a deadline.
      // Blinks/holds therefore remain identical at any display frame rate.
      while(Math.min(this.nextBlink,this.nextFollowAt)<=time){
        if(this.nextBlink<=this.nextFollowAt)this.startBlink(this.nextBlink);
        else this.perform(this.nextFollowAt,true);
      }
      this.time=time;
    }
    sample(time,reduced=false){
      this.advance(time);const progress=this.morph.sample(time),motion={},velocity={};
      for(const [k,t] of Object.entries(this.tracks)){const p=t.sample(time);motion[k]=reduced?0:p.value;velocity[k]=reduced?0:p.velocity;}
      const b=this.blinkTrack.sample(time);motion.blink=reduced?0:b.value;velocity.blink=reduced?0:b.velocity;
      const attention=this.attention&&time<this.attention.end?{...this.attention}:null;
      const phase=attention?(time<this.holdUntil?'Looking up · '+attention.label:'Returning to '+this.state):time>=this.performanceEnd?'Quiet hold':this.followup?'Small follow-up':time<this.bodyAt?'Face & body arrive':time<this.holdUntil?'Hold the reaction':'Settle';
      return {...motion,living:true,motionStyle:this.motionStyle,velocity,attention,pose:reduced?this.poses[this.state]:this.morph.current,poseVelocity:reduced?null:this.morph.velocity,weights:reduced?{[this.state]:1}:this.morph.weights,progress:reduced?1:progress,state:this.state,phase:reduced?'Reduced motion':phase,takeId:this.take.id,takeName:this.take.name,variant:C.catalog[this.state].indexOf(this.take),energy:D.timing(this.state).label,idleGlance:this.followup,nextFollowAt:this.nextFollowAt,performanceEnd:this.performanceEnd};
    }
    checkpoint(){
      return {seed:this.seed,motionStyle:this.motionStyle,actingProfile:{...this.actingProfile},state:this.state,time:this.time,changed:this.changed,started:this.started,performanceEnd:this.performanceEnd,followup:this.followup,takeId:this.take.id,bag:this.bag.checkpoint(),holdRandom:this.holdRandom.checkpoint(),blinkRandom:this.blinkRandom.checkpoint(),morph:this.morph.checkpoint(),tracks:Object.fromEntries(Object.entries(this.tracks).map(([k,t])=>[k,t.checkpoint()])),blink:this.blinkTrack.checkpoint(),nextBlink:this.nextBlink,nextFollowAt:this.nextFollowAt,followups:this.followups.map(v=>({...v})),selectionHistory:this.selectionHistory.map(v=>({...v})),holdUntil:this.holdUntil,bodyAt:this.bodyAt,attention:this.attention?{...this.attention}:null,attentionCooldowns:{...this.attentionCooldowns},attentionHistory:this.attentionHistory.map(v=>({...v}))};
    }
    static restore(poses,data){
      const d=Object.create(Director.prototype);Object.assign(d,data,{poses,actingProfile:C.actingProfile?.(data.actingProfile)||data.actingProfile||C.DEFAULT_ACTING_PROFILE,take:C.catalog[data.state].find(t=>t.id===data.takeId),bag:M.Bag.restore(data.bag),holdRandom:new M.Random(data.holdRandom),blinkRandom:new M.Random(data.blinkRandom),morph:M.Morph.restore(poses,data.morph),tracks:Object.fromEntries(Object.entries(data.tracks).map(([k,t])=>[k,M.Track.restore(t)])),blinkTrack:M.Track.restore(data.blink),followups:data.followups.map(v=>({...v})),selectionHistory:data.selectionHistory.map(v=>({...v})),attention:data.attention?{...data.attention}:null,attentionCooldowns:{...data.attentionCooldowns},attentionHistory:(data.attentionHistory||[]).map(v=>({...v}))});return d;
    }
  }
  return {Director,ATTENTION};
});
