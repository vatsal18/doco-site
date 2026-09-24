// Shared acting: authored context, finite scenes, visit-local memory.
// No camera inference, music API, notification contents, or persistent storage.
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./gallery-living-motion'):root.DocoLivingMotion);
  if(typeof module==='object'&&module.exports)module.exports=api;root.DocoScenes=api;
})(globalThis,function(M){
  const make=(label,stages,routes,lines)=>({label,stages,routes:routes.map(([name,...states],i)=>({id:String(i+1),name,states})),lines,cooldown:6000});
  const CUES={
    hello:make('A little hello',['Notice you','Say hello','Stay close'],[
      ['A cheeky hello','attentive','playful','happy'],['A shy hello','peeking','bashful','relaxed'],['A bright hello','listening','twinkling','happy']
    ],['Oh, hello. I was being very blob.','You rang? Tiny face, reporting in.','A little hello, with extra roundness.','Good timing. My serious face was slipping.','There you are. Hello from down here.','Hello. Please excuse the lack of elbows.']),
    joke:make('A little joke',['Catch it','React','Let it land'],[
      ['The quiet giggle','attentive','amused','happy'],['The delayed laugh','curious','laughing','relaxed'],['The silly comeback','listening','silly','amused']
    ],['That got past my serious face.','A very dignified little giggle.','Okay. That one got me.','My poker face has left the room.','Trying to be normal about that. Failing.','Please allow one small snort.']),
    music:make('Music starts',['Tune in','Find the groove','Enjoy it'],[
      ['Ease into the tune','attentive','listening','humming'],['The tiny groove','listening','humming','vibing'],['A cool little entrance','curious','vibing','cool']
    ],['Tiny dance floor. Excellent acoustics.','Okay, this gets a little head nod.','My imaginary foot is tapping.','A small groove has entered the room.','Please excuse the extremely tiny dancing.','Settling into this one.']),
    surprise:make('Something unexpected',['Notice it','Take it in','Reconsider'],[
      ['A closer look','attentive','surprised','curious'],['Wait, what?','listening','confused','pondering'],['A small gasp','curious','shocked','attentive']
    ],['Well. That was not on my tiny agenda.','One moment. Rearranging my eyebrows.','Oh? A plot twist?','Let me look at that again.','A small pause for whatever that was.','My face needs a second.']),
    win:make('A small win',['Notice the win','Celebrate','Savour it'],[
      ['Quietly proud','attentive','proud','happy'],['A little celebration','curious','celebrating','relaxed'],['Share the delight','listening','happy','twinkling']
    ],['A tiny victory lap. Mostly face.','That deserves a little yes.','Small win. Big imaginary high-five.','Excellent. Adding one proud little nod.','Please accept this extremely round applause.','A very good moment to be a blob.']),
    quiet:make('A quiet moment',['Ease off','Take a breath','Keep company'],[
      ['An easy exhale','attentive','relaxed','daydreaming'],['A wandering thought','listening','pondering','relaxed'],['Companionable quiet','curious','daydreaming','attentive']
    ],['No grand performance. Just here.','A little room for doing nothing.','I can be quietly round for a bit.','Letting this moment breathe.','Nothing to announce. Pleasant, really.','Keeping you company on low volume.']),
    search:make('Finding a song',['Listen for the vibe','Consider','Wait patiently'],[
      ['An attentive search','attentive','curious','listening'],['Thinking it through','curious','pondering','attentive'],['The tiny music nerd','listening','nerdy','curious']
    ],['One moment. Sorting the tiny jukebox.','Let me rummage through the possibilities.','Putting my very small DJ brain to work.','Looking for the next little fit.','A little thinking before the next tune.','The imaginary record crate is quite deep.']),
    skip:make('Skip a song',['Acknowledge','Change direction','Listen again'],[
      ['A fresh direction','listening','determined','attentive'],['An open-minded skip','attentive','curious','listening'],['Back to the record crate','curious','nerdy','attentive']
    ],['Noted. Turning the tiny page.','A fresh direction, coming up.','Onward. No dramatic exit required.','Back to the imaginary record crate.','One small nod. Next possibility.','All right. New musical coordinates.']),
    pause:make('Music pauses',['Notice the pause','Ease out','Rest'],[
      ['The groove unwinds','vibing','listening','relaxed'],['Let the note go','humming','attentive','pondering'],['A cool quiet landing','cool','listening','daydreaming']
    ],['Parking the tiny dance moves.','A little quiet between the notes.','Paused. Still excellent at sitting here.','The imaginary foot may rest now.','Saving the groove for later.','Quiet mode. Same round company.'])
  };
  for(const [key,cue] of Object.entries(CUES)){
    cue.id=key;for(const route of cue.routes){Object.freeze(route.states);Object.freeze(route);}Object.freeze(cue.routes);Object.freeze(cue.stages);Object.freeze(cue.lines);Object.freeze(cue);
  }
  Object.freeze(CUES);

  class Memory{
    constructor(seed=731){this.seed=seed;this.routes={};this.lines=new M.Bag(seed^6101);this.recent=[];this.total=0;}
    chooseRoute(cue,currentState){
      let bag=this.routes[cue.id];if(!bag)bag=this.routes[cue.id]={remaining:[],last:null,random:new M.Random(this.seed^M.hash(cue.id))};
      if(!bag.remaining.length){
        bag.remaining=cue.routes.map(route=>route.id);
        for(let i=bag.remaining.length-1;i>0;i--){const j=Math.floor(bag.random.next()*(i+1));[bag.remaining[i],bag.remaining[j]]=[bag.remaining[j],bag.remaining[i]];}
      }
      const candidates=bag.remaining.filter(id=>id!==bag.last),pool=candidates.length?candidates:bag.remaining;
      const score=id=>{
        const route=cue.routes.find(r=>r.id===id);let cost=route.states[0]===currentState?2:0;
        for(const [i,event] of this.recent.slice(-12).reverse().entries())for(const [beat,state] of route.states.entries())if(event.state===state)cost+=(beat===1?3:1)*(12-i)/12;
        return cost;
      };
      const id=pool.reduce((best,id)=>score(id)<score(best)?id:best,pool[0]);
      bag.remaining.splice(bag.remaining.indexOf(id),1);bag.last=id;return cue.routes.find(r=>r.id===id);
    }
    chooseLine(cue){return cue.lines[Number(this.lines.pick(cue.id,cue.lines.map((_,i)=>String(i))))];}
    remember(event){this.recent.push({...event});if(this.recent.length>48)this.recent.shift();this.total++;}
    lastTake(state){return this.recent.findLast(event=>event.state===state)?.takeId;}
    checkpoint(){return {seed:this.seed,total:this.total,recent:this.recent.map(e=>({...e})),lines:this.lines.checkpoint(),routes:Object.fromEntries(Object.entries(this.routes).map(([key,bag])=>[key,{remaining:bag.remaining.slice(),last:bag.last,random:bag.random.checkpoint()}]))};}
    static restore(data){const m=new Memory(data.seed);m.total=data.total;m.recent=data.recent.map(e=>({...e}));m.lines=M.Bag.restore(data.lines);m.routes=Object.fromEntries(Object.entries(data.routes).map(([key,bag])=>[key,{remaining:bag.remaining.slice(),last:bag.last,random:new M.Random(bag.random)}]));return m;}
  }

  class Director{
    constructor(living,seed=731,onBeat=()=>{},{cues=CUES,retargetOptions={},onCaption=()=>{}}={}){this.living=living;this.cues=cues;this.retargetOptions=retargetOptions;this.memory=new Memory(seed);this.onBeat=onBeat;this.onCaption=onCaption;this.active=null;this.last=null;this.line='';this.cooldowns={};this.status='Choose a sample moment. Scenes stay within that context.';}
    caption(line,force=false){
      line=line||'';if(!force&&line===this.line)return;this.line=line;this.onCaption(line);
    }
    trigger(kind,time,{reduced=false}={}){
      const cue=this.cues[kind];if(!cue)return false;
      this.advance(time);
      if(['camera-off','calibrating'].includes(this.living.state)){this.status='Choose an expression first. Functional states stay undisturbed.';return false;}
      if(this.living.attention&&time<this.living.attention.end){this.status='Let this upward glance finish first. No scenes are queued.';return false;}
      if(this.active?.kind===kind||time<(this.cooldowns[kind]??-Infinity)){this.status='That moment is already playing or taking a short breather.';return false;}
      const route=this.memory.chooseRoute(cue,this.living.state);
      this.active={kind,routeId:route.id,routeName:route.name,states:route.states.slice(),index:-1,next:0,due:time,started:time,waitingUntil:0,captionDue:Infinity,captionLine:'',captionClearAt:Infinity};
      this.last={...this.active,phase:'Playing'};this.caption('',true);this.cooldowns[kind]=time+cue.cooldown;
      this.status=cue.label+' · '+route.name+'. One small story, not a new emotion reading.';
      if(reduced)this.beat(time,1,true);else this.advance(time);
      return true;
    }
    beat(at,index,still=false){
      const active=this.active,cue=this.cues[active.kind],state=active.states[index];
      this.living.retarget(state,at,{...this.retargetOptions,replay:true,avoidTakeId:this.memory.lastTake(state)});
      const line=index===1?this.memory.chooseLine(cue):'';
      const event={at,cue:cue.id,routeId:active.routeId,routeName:active.routeName,stage:index,stageName:cue.stages[index],state,takeId:this.living.take.id,takeName:this.living.take.name,line};
      this.memory.remember(event);active.index=index;active.next=index+1;active.waitingUntil=0;
      // Eyes notice first, the response follows quickly, and the caption joins
      // once that response is readable. The final pose gets a short, quiet
      // settle instead of waiting for every entrance animation to end.
      if(index===0)active.due=at+850;
      else if(index===1){active.captionLine=line;active.captionDue=at+220;active.due=at+(cue.captionHoldMs?cue.captionHoldMs+220:2500);}
      else{active.captionClearAt=at+650;active.due=at+1200;}
      this.last={...active,states:active.states.slice(),phase:still?'Reduced motion · one still reaction':'Playing'};
      if(still){this.caption(line);this.active=null;this.status='Reduced motion: one canonical reaction, without an automatic sequence.';}
      this.onBeat({...event});
    }
    advance(time){
      while(this.active){
        const next=Math.min(this.active.due,this.active.captionDue,this.active.captionClearAt);
        if(next>time)break;
        if(this.active.captionDue===next){this.active.captionDue=Infinity;this.caption(this.active.captionLine);continue;}
        if(this.active.captionClearAt===next){this.active.captionClearAt=Infinity;this.caption('');continue;}
        const at=this.active.due;
        if(this.active.next>=3){this.last={...this.active,states:this.active.states.slice(),phase:'Complete · resting'};this.active=null;this.caption('');this.status='Scene complete. Doco stays here until another cue.';}
        else this.beat(at,this.active.next);
      }
    }
    interrupt(kind,time,until){
      if(kind==='call'){this.cancel('Incoming call · scene cancelled');return;}
      if(!this.active)return;
      this.active.due=Math.max(this.active.due,until+450);this.active.waitingUntil=until+450;this.active.captionDue=Infinity;this.active.captionClearAt=Infinity;
      this.caption('');this.status='A quick heads-up. The remaining scene waits for the glance to settle.';
    }
    cancel(reason='Scene stopped',keepLine=false){
      if(this.active)this.last={...this.active,states:this.active.states.slice(),phase:reason};
      this.active=null;if(!keepLine)this.caption('');this.status=reason;
    }
    view(time){const scene=this.active||this.last;return {scene:scene?structuredClone(scene):null,active:!!this.active,line:this.line,status:this.status,waiting:!!this.active&&time<this.active.waitingUntil,reactions:this.memory.total,recent:this.memory.recent.map(e=>({...e}))};}
    checkpoint(){return structuredClone({memory:this.memory.checkpoint(),active:this.active,last:this.last,line:this.line,cooldowns:this.cooldowns,status:this.status});}
    static restore(living,data,onBeat=()=>{},options={}){const d=new Director(living,data.memory.seed,onBeat,options);d.memory=Memory.restore(data.memory);d.active=structuredClone(data.active);d.last=structuredClone(data.last);d.line=data.line;d.cooldowns={...data.cooldowns};d.status=data.status;return d;}
  }
  return {CUES,Memory,Director};
});
