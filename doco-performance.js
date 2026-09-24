// Production event arbitration around the approved Study 07 performer.
// Acting never writes back to Gemini's semantic state or music intent.
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./gallery-living-director'):root.DocoLivingDirector,typeof module==='object'&&module.exports?require('./gallery-scene-director'):root.DocoScenes,typeof module==='object'&&module.exports?require('./companion-mode'):root.DocoMode);
  if(typeof module==='object'&&module.exports)module.exports=api;root.DocoPerformance=api;
})(globalThis,function(L,S,Mode){
  const NEUTRAL=new Set(['idle','listening']);
  const COMPANION_SAFE=new Set(['idle','listening','attentive','curious','happy','amused','playful','proud','relaxed','pondering','bored','daydreaming']);
  const MUSICAL=new Set(['idle','listening','attentive']);
  // A slow Gemini response may legitimately take close to the 16 second
  // request timeout. Keep the last truthful paired reaction visible through
  // one slow request instead of dropping the caption mid-session.
  const OBSERVATION_TTL=24000;
  const SHORT_OBSERVATION_TTL=10000;
  const SPECTACLE_REACTION_MS=6000;
  const SPECTACLE_REARM_MS=15000;
  const MODE_ACKNOWLEDGEMENT_MS=4200;
  const LOCAL_MUSIC_PROMPT_DELAYS={everyday:[4500,4750,5000],focus:[4500,4750,5000]};
  const compatible=(a,b)=>a===b||(NEUTRAL.has(a)&&NEUTRAL.has(b));
  const GENTLE=new Set(['concerned','crying','scared','shocked']);
  // These are Doco's delivery expressions, not claims about the user's mood.
  const DELIVERY_STATES=new Set(['idle','listening','attentive','determined']);
  function deliveryFaces(line,mode){
    if(/question|sure|really|doubt|bold|unconvinced|excuse|strategy/i.test(line))return mode==='focus'?['suspicious','pondering','determined','peeking','mischievous']:['curious','pondering','amused','peeking','playful'];
    if(/smil|grin|cheer|laugh|sunshine/i.test(line))return mode==='focus'?['proud','amused','happy']:['happy','amused','playful'];
    if(/think|wonder|mystery|thought|curio|\?/i.test(line))return mode==='focus'?['pondering','suspicious','attentive']:['curious','pondering','amused'];
    return mode==='focus'?['determined','pondering','proud','amused','mischievous','peeking']:['amused','relaxed','playful','twinkling','bashful','curious'];
  }
  const TOUCH_LINES={everyday:['Yes, still squishy.','I have become a button.','Very hands-on friendship.'],focus:['Three pokes. Groundbreaking research.','A bold strategy for a blob-shaped button.','My sarcasm does not have a touch screen.','Another poke. The plot thickens.','Excellent. My only skill is now being pressed.','Very hands-on. Dubiously scientific.','I admire the commitment. Not the technique.','Still squishy. A shocking discovery.']};
  class TouchMemory {
    constructor(){this.recent=[];this.last=-Infinity;this.tier=0;this.captionAt=-Infinity;this.cursor={focus:0,everyday:0};}
    advance(time){if(time-this.last>=15000){this.recent=[];this.tier=0;}}
    tap(time){this.advance(time);this.recent=this.recent.filter(t=>time-t<=12000).slice(-2);this.recent.push(time);this.last=time;this.tier=Math.min(3,this.recent.length);return this.tier;}
    caption(mode,time){if(this.tier<3||time-this.captionAt<20000)return '';this.captionAt=time;const lines=TOUCH_LINES[mode];return lines[this.cursor[mode]++%lines.length];}
    reset(){this.recent=[];this.last=-Infinity;this.tier=0;}
    snapshot(){return {tier:this.tier,taps:this.recent.length,last:this.last};}
  }
  class Controller{
    constructor(poses,{seed=731,reduced=false,onState=()=>{},onLine=()=>{},mode='everyday',Director=L.Director}={}){
      this.mode=Mode?.policy(mode)||{id:'everyday',dialogueMs:8000,quietMs:20000};
      this.living=new Director(poses,seed,{motionStyle:'expressive'});this.time=0;this.wall=null;this.visible=true;this.reduced=reduced;
      this.living.setPosture?.(this.mode.id,0);
      this.living.setActingProfile?.(this.mode.actingProfile,0);
      this.living.setPlayback?.(false);
      this.touchMemory=new TouchMemory();this.touchLine='';this.touchUntil=0;this.wasInput=false;
      this.modeLineCursor={focus:seed%4,everyday:(seed>>>2)%4};
      this.musicPromptCursor=seed%3;this.localPlayback=false;this.musicPromptAt=Infinity;
      this.semantic='idle';this.playing=false;this.track='';this.onState=onState;this.onLine=onLine;this.expiry=0;this.idleAt=this.mode.quietMs;
      this.spokenAt=-Infinity;this.line='';this.observation=null;this.observationExpired=false;
      this.pendingLine=null;this.lineUntil=Infinity;this.captionState='idle';this.recentLines=[];this.fallbackCursor=seed;
      this.deliveryHistory=[];this.deliveryExpression=null;
      this.spectacleStarted=null;this.spectacleAwaySince=null;this.spectacleSettled=false;
      this.scenes=new S.Director(this.living,seed,event=>{this.onState(event.state);},{cues:Mode.sceneCues(S.CUES,this.mode.id),retargetOptions:this.actingOptions(),onCaption:line=>this.say(line)});
      this.lastFrame=this.living.sample(0,reduced);this.wasAttention=false;this.suppressed=false;this.pendingObservation=null;
    }
    advance(now){
      if(Number.isFinite(now)){if(this.wall!==null&&this.visible)this.time+=Math.min(250,Math.max(0,now-this.wall));this.wall=now;}
      if(!this.visible)return this.lastFrame;
      this.touchMemory.advance(this.time);
      if(this.touchLine&&this.time>=this.touchUntil)this.clearTouchLine();
      const active=!!this.scenes.active;
      this.scenes.advance(this.time);
      // Spectacles are a brief acting accent. Repeated classifications must
      // not pin that accessory to Doco indefinitely or restart its entrance.
      if(this.semantic==='nerdy'&&!this.spectacleSettled&&this.spectacleStarted!==null&&this.time-this.spectacleStarted>=SPECTACLE_REACTION_MS){
        this.spectacleSettled=true;this.pendingObservation=null;
        if(this.living.attention&&this.time<this.living.attention.end)this.suppressed=true;
        if(!this.scenes.active&&!this.expiry&&!(this.living.attention&&this.time<this.living.attention.end))this.showObservation(true);
      }
      const observationTtl=this.observation?.state==='suspicious'?SHORT_OBSERVATION_TTL:OBSERVATION_TTL;
      if(this.observation&&!this.observationExpired&&this.time-this.observation.at>=observationTtl){
        // Stale evidence must not latch an emotion. Music keeps the semantic
        // record; only the visible hold relaxes until a fresh reading arrives.
        this.observationExpired=true;this.pendingObservation=null;
        if(!this.scenes.active&&!this.expiry)this.showObservation(true);
      }
      if(this.pendingObservation&&this.time>=this.pendingObservation.due&&!(this.living.attention&&this.time<this.living.attention.end)){
        const pending=this.pendingObservation;this.pendingObservation=null;
        if(!this.scenes.active&&this.semantic===pending.state)this.showObservation(true);
      }
      if(active&&!this.scenes.active){this.idleAt=this.time+this.mode.quietMs;this.showObservation(true);}
      if(this.expiry&&this.time>=this.expiry){this.expiry=0;this.showObservation(true);}
      if(this.wasAttention&&(!this.living.attention||this.time>=this.living.attention.end)&&!this.scenes.active){
        this.wasAttention=false;if(this.suppressed||this.semantic==='camera-off'){this.suppressed=false;this.showObservation(true);}
      }
      // In no-key mode the local camera deliberately yields to playback, so
      // the music performance becomes the safe dialogue source. Keep its
      // authored prompts alive at a relaxed cadence without polling camera
      // frames or restarting the currently settled expression every frame.
      if(this.playing&&this.localPlayback&&this.time>=this.musicPromptAt&&!this.scenes.active&&!this.inputBusy()&&!(this.living.attention&&this.time<this.living.attention.end)){
        const accepted=this.scenes.trigger('music',this.time,{reduced:this.reduced});
        this.scheduleMusicPrompt();
        if(accepted){this.expiry=0;this.pendingObservation=null;this.pendingLine=null;this.idleAt=this.time+30000;}
      }
      // Gemini may keep offering new wording for one unchanged state. A line
      // that is about to speak wins; a later redundant candidate yields to
      // the due personality scene and is reconstructed from the latest
      // observation after the scene completes.
      // A scene caption enters 1070ms after its first face; account for that
      // lead-in so automatic scenes share the same spoken cadence.
      const quietCaptionReady=this.time-this.spokenAt>=this.mode.dialogueMs-1070;
      if(this.time>=this.idleAt&&quietCaptionReady&&this.pendingLine&&!this.pendingLine.pairedChange&&COMPANION_SAFE.has(this.semantic)&&!this.reduced&&!this.playing)this.pendingLine=null;
      if(this.time>=this.idleAt&&quietCaptionReady&&!this.pendingLine&&(!this.line||this.observation)&&!this.inputBusy()&&!this.scenes.active&&!(this.living.attention&&this.time<this.living.attention.end)&&!this.playing&&COMPANION_SAFE.has(this.semantic)&&!this.reduced){
        this.scenes.trigger('quiet',this.time);this.idleAt=this.time+30000;
      }
      this.flushDialogue();
      if(this.wasInput&&!this.inputBusy()){this.wasInput=false;this.showObservation(true);}
      this.lastFrame=this.living.sample(this.time,this.reduced);return this.lastFrame;
    }
    restState(){const state=this.observationExpired||(this.semantic==='nerdy'&&this.spectacleSettled)?'listening':this.semantic;return this.mode.id!=='focus'&&this.playing&&(NEUTRAL.has(state)||state==='camera-off')?'vibing':state;}
    scheduleMusicPrompt(){const delays=LOCAL_MUSIC_PROMPT_DELAYS[this.mode.id]||LOCAL_MUSIC_PROMPT_DELAYS.everyday;this.musicPromptAt=this.time+delays[this.musicPromptCursor++%delays.length];}
    actingOptions(){return {preferredGestures:this.mode.actingGestures,preferenceKey:this.mode.id,actingProfile:this.mode.actingProfile};}
    inputBusy(){return Boolean(this.living.inputBusy?.(this.time));}
    emitLine(){this.onLine(this.line&&this.line!=='...'?this.line:this.touchLine||this.line);}
    clearTouchLine(){if(!this.touchLine)return;this.touchLine='';this.touchUntil=0;this.emitLine();}
    interact(kind,point={},now){
      this.advance(now);
      if(!this.visible||!this.living.input||this.living.state==='calibrating')return false;
      if(this.living.attention&&this.time<this.living.attention.end)return false;
      if(kind==='hover'&&(this.scenes.active||(this.inputBusy()&&this.living.interaction.kind!=='hover')))return false;
      const gentle=GENTLE.has(this.semantic);
      const tier=kind==='tap'?this.touchMemory.tap(this.time):Math.max(1,this.touchMemory.tier);
      const accepted=this.living.input(kind,point,this.time,{tier,gentle,reduced:this.reduced});
      if(!accepted)return false;
      this.scenes.cancel('Direct interaction');this.expiry=0;this.wasInput=true;this.idleAt=this.time+this.mode.quietMs;
      if(kind==='tap'&&!gentle&&(!this.line||this.line==='...')&&!this.pendingLine&&!this.pendingObservation){
        const line=this.touchMemory.caption(this.mode.id,this.time);
        if(line){this.touchLine=line;this.touchUntil=this.time+4000;this.emitLine();}
      }
      this.lastFrame=this.living.sample(this.time,this.reduced);return true;
    }
    say(line){
      line=line||'';if(line===this.line)return;this.line=line;this.captionState=this.living.state;
      if(line){
        this.spokenAt=this.time;this.recentLines.push(line);if(this.recentLines.length>14)this.recentLines.shift();
        if(line!=='...'&&!this.reduced&&!this.scenes?.active&&!this.inputBusy()&&!['camera-off','calibrating'].includes(this.living.state)){
          if(this.time>=this.living.performanceEnd)this.living.respond?.(this.time,this.actingOptions());
          if(DELIVERY_STATES.has(this.semantic)&&(DELIVERY_STATES.has(this.living.state)||(this.playing&&this.living.state==='vibing'))&&this.observation&&!this.observationExpired){
            const choices=deliveryFaces(line,this.mode.id).filter(state=>this.living.poses[state]&&state!==this.deliveryExpression);
            // Prefer the least recently performed compatible face, not a
            // cursor over a shrinking pool (which can alternate only two).
            const history=this.deliveryHistory.map(event=>event.expression);
            choices.sort((a,b)=>history.lastIndexOf(a)-history.lastIndexOf(b));
            const expression=choices[0];
            if(expression){
              this.living.morph.target(expression,this.time,520);
              this.living.performanceEnd=Math.max(this.living.performanceEnd,this.living.morph.end);
              this.deliveryExpression=expression;
              this.deliveryHistory.push({expression,semantic:this.semantic,mode:this.mode.id,line,time:this.time});
              if(this.deliveryHistory.length>30)this.deliveryHistory.shift();
            }
          }
        }
      }
      // Keep a truthful observation visible across a slow Gemini turn. A new
      // line still replaces it immediately, while the TTL prevents stale copy
      // from lingering after the camera evidence expires.
      if(line&&line!=='...'){this.touchLine='';this.touchUntil=0;}
      this.lineUntil=line?this.time+Math.max(14000,this.mode.dialogueMs+6000):Infinity;this.emitLine();
    }
    flushDialogue(){
      if(!this.visible)return;
      if(this.time>=this.lineUntil)this.say('');
      if(this.scenes.active||this.expiry||this.pendingObservation||(this.living.attention&&this.time<this.living.attention.end))return;
      const pending=this.pendingLine;
      if(pending){
        if(this.observationExpired||pending.mode!==this.mode.id||!compatible(pending.state,this.semantic)||!this.canDeliverObservation(pending.state)||this.time-pending.at>10000)this.pendingLine=null;
        else if(this.time>=pending.due){this.pendingLine=null;this.say(pending.line);if(Number.isFinite(this.idleAt))this.idleAt=this.time+2600;}
      }
      // Keep company only while fresh Gemini evidence is arriving. No synthetic
      // observations or stale comments during a failed/disabled camera session.
      if(!this.observation||this.observationExpired||this.time-this.observation.at>6000||this.pendingLine||this.time-this.spokenAt<this.mode.fallbackMs)return;
      if(this.semantic==='nerdy'&&this.spectacleSettled)return;
      const target=this.restState();
      if(target!==this.living.state)return;
      if(['vibing','humming','cool'].includes(target)&&!this.playing)return;
      // When a personality beat is already close, let its authored face and
      // line arrive together instead of inserting another same-face fallback
      // that postpones the scene and makes the mode look visually stuck.
      if(!this.reduced&&!this.playing&&COMPANION_SAFE.has(this.semantic)&&this.idleAt-this.time<=3000)return;
      const candidates=Mode.fallbackLines(target,this.mode.id);
      const pool=candidates.filter(line=>!this.recentLines.slice(-Math.min(8,Math.max(1,candidates.length-1))).includes(line));
      if(pool.length)this.say(pool[this.fallbackCursor++%pool.length]);
    }
    retarget(state){
      const previous=this.living.state,changed=this.living.retarget(state,this.time,this.actingOptions());
      if(changed){this.deliveryExpression=null;if(!compatible(previous,state))this.say('');this.onState(state);}return changed;
    }
    canDeliverObservation(state){return compatible(state,this.living.state)||(this.playing&&NEUTRAL.has(state)&&this.living.state==='vibing');}
    showObservation(forceLine=false){
      // Normal state changes must not bypass the caption reading window.
      // Faces and semantic/music evidence keep their existing response timing;
      // retarget clears incompatible old copy while new words wait their turn.
      const targetState=this.restState();
      const urgent=(GENTLE.has(targetState)||['surprised','angry'].includes(targetState))&&targetState!==this.living.state;
      const due=this.spokenAt+this.mode.dialogueMs;
      const target=this.restState(),changed=this.retarget(target);
      const deliverable=this.canDeliverObservation(this.semantic);
      const line=!this.observationExpired&&deliverable?this.observation?.line||'':'';
      if(this.observationExpired||!deliverable){this.pendingLine=null;if(!compatible(this.captionState,target)||this.observationExpired)this.say('');return changed;}
      if(line&&line!==this.line&&!this.recentLines.includes(line)){
        const lineDue=urgent?this.time:Math.max(this.time,due);
        const pairedChange=changed||Boolean(this.pendingLine?.pairedChange&&this.pendingLine.state===this.semantic);
        this.pendingLine={state:this.semantic,line,at:this.observation.at,mode:this.mode.id,due:lineDue,pairedChange};
      }
      this.flushDialogue();
      return changed;
    }
    observe(state,line,now){
      this.advance(now);if(!this.living.poses[state])return false;
      if(line||GENTLE.has(state))this.clearTouchLine();
      const previous=this.semantic;this.semantic=state;
      if(state==='nerdy'){
        if(this.spectacleStarted===null||(this.spectacleAwaySince!==null&&this.time-this.spectacleAwaySince>=SPECTACLE_REARM_MS)){
          this.spectacleStarted=this.time;this.spectacleSettled=false;
        }
        this.spectacleAwaySince=null;
      }else if(this.spectacleAwaySince===null)this.spectacleAwaySince=this.time;
      this.observation={state,line:line||'',at:this.time,wall:now};this.observationExpired=false;
      if(this.pendingLine&&!compatible(this.pendingLine.state,state))this.pendingLine=null;
      if(!this.visible)return false;
      const meaningful=state!==previous&&!(NEUTRAL.has(state)&&NEUTRAL.has(previous));
      if(meaningful)this.idleAt=this.time+this.mode.quietMs;
      if(this.living.attention&&this.time<this.living.attention.end){this.suppressed=true;return false;}
      if(this.scenes.active&&!meaningful)return false;
      if(meaningful)this.scenes.cancel('New camera observation');
      const target=this.restState(),changed=this.living.state!==target;
      if(this.expiry&&!meaningful)return false;
      const urgent=GENTLE.has(state)||['surprised','angry'].includes(state);
      const hold=urgent?1100:2600;
      if(changed&&!urgent&&!['calibrating','camera-off'].includes(this.living.state)&&this.time<this.living.changed+hold){
        this.pendingObservation={state,line,due:this.living.changed+hold};return false;
      }
      this.pendingObservation=null;
      this.expiry=0;this.showObservation(changed||previous!==state);
      return changed;
    }
    setState(state,line,duration,now){
      this.advance(now);this.scenes.cancel('Direct state');this.expiry=0;this.pendingObservation=null;this.pendingLine=null;this.idleAt=this.time+this.mode.quietMs;
      if(line||GENTLE.has(state))this.clearTouchLine();
      if(!duration||['camera-off','calibrating'].includes(state)){this.semantic=state;this.observation=null;this.observationExpired=false;}
      if(['camera-off','calibrating'].includes(state)){this.spectacleStarted=null;this.spectacleAwaySince=null;this.spectacleSettled=false;}
      const changed=this.living.state!==state;this.retarget(state);if(line)this.say(line);
      if(duration)this.expiry=this.time+duration;return changed;
    }
    cue(kind,now){
      this.advance(now);
      if(!this.visible||this.inputBusy()||this.living.state==='calibrating'||(this.living.attention&&this.time<this.living.attention.end))return false;
      if(this.living.state==='camera-off'){
        if(!['music','search','skip','pause'].includes(kind))return false;
        this.retarget('idle');
      }
      const accepted=this.scenes.trigger(kind,this.time,{reduced:this.reduced});
      if(accepted){this.expiry=0;this.pendingObservation=null;this.pendingLine=null;this.idleAt=this.time+30000;}return accepted;
    }
    playback(playing,track,now,{releaseObservation=false,localCompanion=releaseObservation}={}){
      this.advance(now);const before=this.playing,wasLocal=this.localPlayback,changed=before!==Boolean(playing),trackChanged=Boolean(track&&track!==this.track);this.playing=Boolean(playing);this.track=track||this.track;this.localPlayback=this.playing&&Boolean(localCompanion);
      this.living.setPlayback?.(this.playing);
      // Local-only reactions intentionally stop sampling while a song plays.
      // Retire that transient pre-song observation on the first confirmed
      // playback edge so it cannot be restored after every music beat. Gemini
      // observations remain untouched because they continue to update live.
      const released=Boolean(changed&&this.playing&&releaseObservation);
      if(released){this.observationExpired=true;this.pendingObservation=null;this.pendingLine=null;this.expiry=0;this.say('');}
      if(this.localPlayback&&(changed||trackChanged||!wasLocal))this.scheduleMusicPrompt();
      else if(!this.localPlayback)this.musicPromptAt=Infinity;
      if(!this.visible||(!changed&&!(this.living.retireGroove&&playing&&trackChanged)))return false;
      if(playing){if(released||MUSICAL.has(this.semantic)||this.semantic==='camera-off')return this.cue('music',now);}
      else if(before){
        this.scenes.cancel('Playback stopped');
        if(this.living.retireGroove){this.living.retireGroove(this.time);this.wasInput=true;this.expiry=0;this.showObservation(true);return true;}
        if(MUSICAL.has(this.semantic)||this.semantic==='camera-off')return this.cue('pause',now);this.retarget(this.semantic);
      }
      return false;
    }
    failure(now){this.advance(now);this.playing=false;this.localPlayback=false;this.musicPromptAt=Infinity;this.living.setPlayback?.(false);this.scenes.cancel('Music unavailable');this.living.retireGroove?.(this.time);this.expiry=0;this.showObservation(true);}
    attention(kind,now){
      this.advance(now);if(!L.ATTENTION[kind]||!this.visible||this.reduced||this.living.state==='calibrating')return false;
      if(this.living.state==='camera-off')this.retarget('idle');
      if(!this.living.attend(kind,this.time))return false;
      this.scenes.interrupt(kind,this.time,this.living.attention.end);this.expiry=0;this.wasAttention=true;this.idleAt=this.time+25000;return true;
    }
    setVisible(visible,now){
      if(visible===this.visible){this.wall=now;return;}
      if(!visible){this.living.releaseInput?.(this.time);this.wasInput=false;this.touchMemory.reset();this.clearTouchLine();}
      this.visible=visible;this.wall=now;this.scenes.cancel('Off-screen scenes are discarded');this.expiry=0;this.pendingObservation=null;this.pendingLine=null;this.idleAt=this.time+this.mode.quietMs;
      // Do not resume a half-told scene or queued notification on return.
      if(visible){const ttl=this.observation?.state==='suspicious'?SHORT_OBSERVATION_TTL:OBSERVATION_TTL;if(this.observation&&now-this.observation.wall>=ttl)this.observationExpired=true;this.showObservation(true);this.lastFrame=this.living.sample(this.time,this.reduced);}
    }
    setReduced(reduced,now){this.advance(now);this.reduced=Boolean(reduced);if(reduced){this.living.releaseInput?.(this.time);this.scenes.cancel('Reduced motion');this.expiry=0;}this.lastFrame=this.living.sample(this.time,this.reduced);}
    setMode(mode,now){
      this.advance(now);const next=Mode?.policy(mode);if(!next||next.id===this.mode.id)return;
      this.mode=next;this.idleAt=this.time+next.quietMs;
      this.living.setPosture?.(next.id,this.time);
      if(this.inputBusy())this.living.releaseInput?.(this.time);
      this.living.setActingProfile?.(next.actingProfile,this.time);this.wasInput=false;this.touchMemory.reset();this.clearTouchLine();
      this.scenes.cancel('Mode changed');this.scenes.cues=Mode.sceneCues(S.CUES,next.id);this.scenes.retargetOptions=this.actingOptions();
      this.pendingLine=null;this.pendingObservation=null;this.expiry=0;
      if(this.observation)this.observation={...this.observation,line:''};
      this.say('');this.spokenAt=-Infinity;
      // A mode change normally shapes the next small gesture without replaying
      // the entrance. During playback, however, each mode has a different
      // resting contract: Everyday grooves while Focus stays composed. Apply
      // that contract immediately through the same C1-continuous rig so the
      // actor cannot remain latched until a profile visibility refresh.
      if(this.visible&&!this.reduced&&!this.inputBusy()&&!['camera-off','calibrating'].includes(this.living.state)&&!GENTLE.has(this.semantic)){
        const target=this.restState();
        if(this.playing&&target!==this.living.state)this.retarget(target);
        else this.living.perform(this.time,true);
      }
      const lines=next.modeLines||[],line=lines.length?lines[this.modeLineCursor[next.id]++%lines.length]:'';
      if(!GENTLE.has(this.semantic)){
        this.say(line);
        if(line)this.lineUntil=Math.min(this.lineUntil,this.time+MODE_ACKNOWLEDGEMENT_MS);
      }
      if(this.localPlayback)this.musicPromptAt=Math.max(this.musicPromptAt,this.time+MODE_ACKNOWLEDGEMENT_MS+1800);
    }
    snapshot(){return {time:this.time,mode:this.mode.id,semantic:this.semantic,deliveryExpression:this.deliveryExpression,deliveryHistory:this.deliveryHistory.map(event=>({...event})),observationExpired:this.observationExpired,line:this.line,touchLine:this.touchLine,touchMemory:this.touchMemory.snapshot(),interaction:this.living.interaction?{...this.living.interaction}:null,pendingLine:this.pendingLine?{...this.pendingLine}:null,spokenAt:this.spokenAt,playing:this.playing,localPlayback:this.localPlayback,musicPromptAt:this.musicPromptAt,visible:this.visible,reduced:this.reduced,frame:structuredClone(this.lastFrame),scene:this.scenes.view(this.time)};}
  }
  return {Controller,TouchMemory};
});
