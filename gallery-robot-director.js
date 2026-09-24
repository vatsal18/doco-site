(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.DocoRobotDirector=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
  const mix=(a,b,t)=>a+(b-a)*t;
  const REST=Object.freeze({gazeX:0,gazeY:0,headX:0,headY:0,roll:0,yaw:0});
  const CALM=new Set(['idle','listening','attentive','curious','relaxed','bored','daydreaming','pondering','peeking','nerdy']);
  // Millisecond choreography, not a global playback multiplier. Energetic eyes
  // and body arrive together; restful reactions keep their own breathing room.
  const TIMINGS=Object.freeze(Object.fromEntries(Object.entries({
    attentive:{label:'Alert & attentive',morph:260,eye:145,surfaceStart:45,surface:320,bodyStart:80,body:390,hold:930,eyeRest:1270,rest:1530,move:1.1,tilt:.8,turn:1},
    gentle:{label:'Soft & gentle',morph:300,eye:180,surfaceStart:60,surface:420,bodyStart:100,body:500,hold:1050,eyeRest:1480,rest:1770,move:1,tilt:.7,turn:.9},
    restful:{label:'Quiet & restful',morph:440,eye:260,surfaceStart:100,surface:680,bodyStart:160,body:820,hold:1500,eyeRest:1900,rest:2250,move:.8,tilt:.45,turn:.8},
    stretch:{label:'A leisurely stretch',morph:380,eye:230,surfaceStart:80,surface:510,bodyStart:120,body:720,hold:1300,eyeRest:1740,rest:2200,move:1.4,tilt:.6,turn:.9},
    lively:{label:'Quick & playful',morph:220,eye:110,surfaceStart:30,surface:235,bodyStart:55,body:300,hold:740,eyeRest:1060,rest:1330,move:2,tilt:1.1,turn:1.1},
    firm:{label:'Firm & focused',morph:230,eye:120,surfaceStart:35,surface:270,bodyStart:65,body:330,hold:1000,eyeRest:1250,rest:1530,move:1.6,tilt:.9,turn:1},
    startle:{label:'A quick reaction',morph:180,eye:85,surfaceStart:22,surface:185,bodyStart:42,body:225,hold:620,eyeRest:880,rest:1150,move:2,tilt:.8,turn:1},
    rhythm:{label:'An easy groove',morph:240,eye:120,surfaceStart:35,surface:265,bodyStart:65,body:330,hold:850,eyeRest:1200,rest:1450,move:1.7,tilt:1,turn:1}
  }).map(([key,value])=>[key,Object.freeze(value)])));
  const ENERGY={
    sleepy:'restful',relaxed:'restful',bored:'restful',daydreaming:'restful','camera-off':'restful',
    love:'gentle',bashful:'gentle',concerned:'gentle',crying:'gentle',pondering:'gentle',humming:'gentle',cool:'gentle',dizzy:'gentle',
    happy:'lively',amused:'lively',laughing:'lively',celebrating:'lively',playful:'lively',mischievous:'lively',silly:'lively',twinkling:'lively',
    angry:'firm',determined:'firm',surprised:'startle',shocked:'startle',scared:'startle',stretching:'stretch',vibing:'rhythm'
  };
  function timing(state){return TIMINGS[ENERGY[state]||'attentive'];}
  const DIRECTIONS={
    curious:[3,-1.5,-.026,0], confused:[-1,0,-.035,0], pondering:[-3,-2,-.017,0],
    peeking:[4,.2,.025,.2], suspicious:[-4,0,-.01,0], daydreaming:[3,-2,.012,0],
    listening:[3,0,.018,0], attentive:[0,-.5,0,-.4], bored:[-3,0,-.012,.2],
    happy:[0,-.5,0,-.8], amused:[2,0,.014,-.2], proud:[0,-.8,-.012,-1.1],
    laughing:[0,-.5,.012,-.7], celebrating:[1.5,-.7,.016,-1],
    bashful:[-2.5,1.2,.025,.8], love:[0,0,.014,-.3], playful:[2,-.3,.03,-.2],
    mischievous:[3,0,-.015,0], silly:[-1,0,.022,0], surprised:[0,0,0,-.35],
    shocked:[0,0,0,-.55], scared:[0,.5,-.014,.6], concerned:[0,-.2,-.017,-.15],
    angry:[0,0,0,.15], determined:[0,0,0,-.3], sleepy:[0,0,.015,1],
    stretching:[0,-.3,0,-1.2], relaxed:[0,0,0,.2], cool:[2,0,-.012,0],
    humming:[1,0,.018,0], vibing:[1.5,0,.024,0], dizzy:[0,0,.025,0],
    nerdy:[0,-.5,-.012,-.2], twinkling:[0,-.5,.012,-.3], crying:[0,.5,0,.5]
  };
  function duration(state){return timing(state).morph;}
  // Pose units are relative to a 320 × 240 stage. Keep the performance equally
  // readable on phones and desktop; do not halve its roll again at render time.
  function transform(p){return 'translate('+(p.headX/3.2).toFixed(4)+'%,'+(p.headY/2.4).toFixed(4)+'%) rotate('+p.roll.toFixed(5)+'rad)';}
  function track(frames,time){
    if(time<=frames[0][0])return frames[0][1];
    for(let i=1;i<frames.length;i++)if(time<=frames[i][0])return mix(frames[i-1][1],frames[i][1],ease((time-frames[i-1][0])/(frames[i][0]-frames[i-1][0])));
    return frames.at(-1)[1];
  }
  function blinkAt(time,start,slow=false){
    const close=slow?120:65,hold=slow?70:35,open=slow?240:130,t=time-start;
    if(t<0||t>close+hold+open)return 0;
    if(t<close)return ease(t/close);
    if(t<close+hold)return 1;
    return 1-ease((t-close-hold)/open);
  }
  class Director {
    constructor(random=Math.random){this.random=random;this.state='idle';this.changed=0;this.started=0;this.current={...REST};this.frames=Object.fromEntries(Object.keys(REST).map(k=>[k,[[0,0]]]));this.blinkStart=-1000;this.extraBlink=-1000;this.nextBlink=1800+random()*1400;this.nextLook=4500+random()*3000;this.variant=0;this.visit=0;this.idleGlance=false;this.timing=timing('idle');this.holdUntil=0;this.endsAt=0;}
    retarget(state,time){
      this.sample(time);this.state=state;this.changed=time;this.visit++;this.variant=(this.variant+1+Math.floor(this.random()*2))%3;
      this.makePerformance(time,DIRECTIONS[state]||[0,0,0,0],false);
      this.nextLook=time+5000+this.random()*3500;
      // Blinks are independent of state entry, not restarted at every reading.
    }
    makePerformance(time,direction,idle){
      this.started=time;this.idleGlance=idle;
      const strength=[.88,1,1.08][this.variant], [gx,gy,roll,hy]=direction;
      const p=this.timing=idle?TIMINGS.attentive:timing(this.state);
      const target={gazeX:gx*strength,gazeY:gy*strength,headX:gx*.45*strength*p.move,headY:hy*strength*p.move,roll:roll*strength*p.tilt,yaw:Math.max(-.16,Math.min(.16,gx*.035*strength*p.turn))};
      this.holdUntil=p.hold;
      this.frames={};
      for(const k of Object.keys(REST)){
        const eye=k.startsWith('gaze'),surface=k==='yaw',begin=eye?1:surface?p.surfaceStart:p.bodyStart,end=eye?p.eye:surface?p.surface:p.body;
        this.frames[k]=[[0,this.current[k]],[begin,this.current[k]],[end,target[k]],[p.hold,target[k]],[eye?p.eyeRest:p.rest,0]];
      }
      if(!idle&&this.state==='calibrating')this.frames.gazeX=[[0,this.current.gazeX],[180,-3],[500,-3],[780,3],[1180,3],[1530,0]];
      if(!idle&&this.state==='laughing'){
        // Two small chuckles, never a recoil below the resting silhouette.
        this.frames.headY=[[0,this.current.headY],[p.bodyStart,this.current.headY],[250,-2.2*strength],[320,-2.2*strength],[490,-.6*strength],[660,-1.7*strength],[740,-1.7*strength],[1160,0]];
      }
      if(!idle&&this.state==='celebrating'){
        // One confident lift and hold, not a repeated spring bounce.
        this.frames.headY=[[0,this.current.headY],[p.bodyStart,this.current.headY],[p.body,-3*strength],[p.hold,-3*strength],[p.rest,0]];
      }
      if(!idle&&this.state==='nerdy'){
        this.frames.headY=[[0,this.current.headY],[p.bodyStart,this.current.headY],[p.body,-.8*strength],[p.hold,-.8*strength],[p.rest,0]];
      }
      if(!idle&&['humming','vibing'].includes(this.state)){
        const groove=this.state==='vibing',beat=groove?570:800;
        const sway=groove?{gazeX:2.6,gazeY:0,headX:1.8,headY:0,roll:.028,yaw:.09}:{gazeX:1.2,gazeY:0,headX:.65,headY:0,roll:.012,yaw:.04};
        for(const k of ['gazeX','headX','roll','yaw']){
          const start=k==='gazeX'?1:k==='yaw'?p.surfaceStart:p.bodyStart,end=k==='gazeX'?p.eye:k==='yaw'?p.surface:p.body,a=sway[k]*strength;
          this.frames[k]=[[0,this.current[k]],[start,this.current[k]],[end,a],[end+110,a],[end+beat,-a],[end+beat+110,-a],[end+beat*2,a*.6],[end+beat*2+110,a*.6],[end+beat*2+460,0]];
        }
        this.holdUntil=p.body+beat*2+110;
      }
      if(!idle&&this.state==='bashful')this.frames.gazeX=[[0,this.current.gazeX],[180,-2.5],[1000,-2.5],[1220,1],[1430,1],[1770,0]];
      this.endsAt=Math.max(...Object.values(this.frames).map(frames=>frames.at(-1)[0]));
    }
    look(direction,time){
      this.sample(time);const x=Math.max(-4,Math.min(4,direction));
      this.makePerformance(time,[x,0,x*.003,0],true);this.nextLook=time+6500;
    }
    blink(time){this.blinkStart=time;this.extraBlink=-1000;this.nextBlink=time+3000+this.random()*2400;}
    sample(time,reduced=false){
      // Advance the visible pose before scheduling a glance, including after a
      // dropped frame. Retargeting must never capture a stale body position.
      for(const k of Object.keys(REST))this.current[k]=track(this.frames[k],time-this.started);
      if(time>=this.nextBlink){this.blink(time);if(this.random()<.14&&!['sleepy','camera-off'].includes(this.state))this.extraBlink=time+330;}
      if(time>=this.nextLook){
        if(CALM.has(this.state)){this.variant=(this.variant+1)%3;const x=this.random()<.5?-2.5:2.5;this.makePerformance(time,[x,(this.random()-.5)*1.5,x*.004,0],true);}
        this.nextLook=time+6000+this.random()*4000;
      }
      const age=time-this.started;
      const blink=Math.max(blinkAt(time,this.blinkStart,this.state==='sleepy'),blinkAt(time,this.extraBlink));
      const wink=this.state==='playful'?blinkAt(time,this.changed+480):0;
      const phase=age<this.timing.surfaceStart?'Eyes notice':age<this.timing.body?'Body follows':age<this.holdUntil?(!this.idleGlance&&['humming','vibing'].includes(this.state)?'Follow the groove':'Hold the reaction'):age<this.endsAt?'Settle':'Quiet hold';
      return {...(reduced?REST:this.current),blink:reduced?0:blink,wink:reduced?0:wink,phase:reduced?'Reduced motion':phase,energy:this.timing.label,variant:this.variant,idleGlance:this.idleGlance};
    }
  }
  return {Director,REST,DIRECTIONS,TIMINGS,timing,transform,track,blinkAt,duration,ease};
});
