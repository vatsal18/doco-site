// Shared side-jump physics. Pure, deterministic and evaluated on the agreed timeline.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.DocoVisitsMotion=api;})(globalThis,()=>{
 'use strict';
 const ANTICIPATION=220,DEPARTURE=700,FLIGHT=480,LANDING=1060,TOTAL=DEPARTURE+LANDING,SLIDE=5.4,FRICTION=.12;
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x));};
 const mix=(a,b,p)=>a+(b-a)*p;
 // Hermite flight continues the outgoing horizontal velocity, then brakes
 // gently before contact. Position is evaluated against one absolute timeline.
 function hermite(p,a,b,va,vb){const p2=p*p,p3=p2*p;return (2*p3-3*p2+1)*a+(p3-2*p2+p)*va+(-2*p3+3*p2)*b+(p3-p2)*vb;}
 // Fixed-rate spring tracks make scrubbing, slow playback and skipped rendering
 // frames agree. No variable-rAF integration or random shake enters the motion.
 const tracks=new Map(),STEP=1/240;
 function physicsTrack(departure,arrival,height,unit=1){
  const key=[departure,arrival,height,unit].join(':');if(tracks.has(key))return tracks.get(key);
  departure/=unit;arrival/=unit;height/=unit;
  const specs={strain:[24,.62],sway:[19,.68],faceX:[24,.72],faceY:[22,.69],angle:[21,.64]},states={},rows=[];
  for(const field of Object.keys(specs))states[field]={x:0,v:0};
  const strength=Math.max(.8,Math.min(1.2,height/64)),contact=(DEPARTURE+FLIGHT)/1000,launch=ANTICIPATION/1000,end=TOTAL/1000;
  let previous=-STEP;
  for(let step=0;step<=Math.ceil((end+.08)/STEP);step++){
   const seconds=step*STEP,time=seconds*1000;
   if(previous<launch&&seconds>=launch){states.strain.v+=4.4*strength;states.faceY.v+=-38*strength;}
   if(previous<contact&&seconds>=contact){states.strain.v-=6.2*strength;states.faceY.v+=105*strength;states.angle.v-=110*strength;}
   let acceleration=0;
   if(time>=ANTICIPATION&&time<DEPARTURE){const q=(time-ANTICIPATION)/(DEPARTURE-ANTICIPATION);acceleration=-departure*(3-3*q)/((DEPARTURE-ANTICIPATION)/1000)**2;}
   else if(time>=DEPARTURE&&time<DEPARTURE+FLIGHT){const q=(time-DEPARTURE)/FLIGHT,a=arrival,b=SLIDE,va=-1.5*departure/(DEPARTURE-ANTICIPATION)*FLIGHT,vb=-SLIDE/(FRICTION*1000)*FLIGHT;acceleration=((12*q-6)*a+(6*q-4)*va+(-12*q+6)*b+(6*q-2)*vb)/(FLIGHT/1000)**2;}
   const ground=time>=(DEPARTURE+FLIGHT);
   const targets={strain:time<ANTICIPATION?-.21*smooth(time/ANTICIPATION):0,sway:Math.max(-17,Math.min(17,-acceleration*.0035)),faceX:Math.max(-8,Math.min(8,-acceleration*.0015)),faceY:ground?0:time>ANTICIPATION?2.8:0,angle:0};
   const row={};
   for(const [field,[omega,damping]] of Object.entries(specs)){const s=states[field];row[field]=s.x;s.v+=(omega*omega*(targets[field]-s.x)-2*damping*omega*s.v)*STEP;s.x+=s.v*STEP;}
   rows.push(row);previous=seconds;
  }
  const value={rows,strength};if(tracks.size>=8)tracks.delete(tracks.keys().next().value);tracks.set(key,value);return value;
 }
 function read(track,time){const p=Math.max(0,time/1000/STEP),i=Math.min(track.rows.length-2,Math.floor(p)),fraction=Math.min(1,p-i),a=track.rows[i],b=track.rows[i+1],value={};for(const k of Object.keys(a))value[k]=mix(a[k],b[k],fraction);return value;}
 function secondary(m,time,departure,arrival,height,unit=1){
  if(time>=TOTAL)return m;
  const track=physicsTrack(departure,arrival,height,unit),s=read(track,time),middle=read(track,time-28),top=read(track,time-62),fade=1-smooth((time-(TOTAL-180))/180);
  m.strain=s.strain*fade;m.strainMid=middle.strain*fade;m.strainTop=top.strain*fade;m.sy=1+m.strain;
  m.lean+=s.sway*fade;m.faceLagX=s.faceX*fade;m.faceLagY=s.faceY*fade;m.turn+=s.angle*fade;
  const since=(time-DEPARTURE-FLIGHT)/1000,attack=smooth(since/.035);
  m.wave=since>0?12*track.strength*attack*Math.exp(-7*since)*fade:0;m.wavePhase=Math.max(0,since)*24;
  // Rebound only after compression: a short, low hop with zero velocity at
  // both contacts, rather than a looping rubber-ball bounce.
  const rebound=clamp((since-.11)/.26);if(rebound>0&&rebound<1)m.y-=5*unit*track.strength*Math.sin(Math.PI*rebound)**2;
  const altitude=clamp(-m.y/Math.max(1,height));m.shadowScale=(1-.35*altitude)*(1+.8*Math.max(0,-m.strain));m.shadow*=1-.25*altitude;
  return m;
 }
 function sample(time,role,{departure=250,arrival=280,height=64,reduced=false,unit=1}={}){
  const source=role==='phone';
  const m={visible:source?time<DEPARTURE:time>=DEPARTURE,x:0,y:0,turn:0,sy:1,lean:0,ripple:0,strain:0,strainMid:0,strainTop:0,faceLagX:0,faceLagY:0,wave:0,wavePhase:0,shadow:0.65,shadowScale:1,intent:0,air:0,settle:0,blink:0,gaze:0,phase:source?'Ready':'Waiting'};
  if(reduced){m.settle=source?0:1;return m;}
  if(source){
   if(time<=0)return m;
   if(time<ANTICIPATION){const p=smooth(time/ANTICIPATION);m.lean=7*p;m.turn=4*p;m.intent=p;m.gaze=-3*p;m.phase='Wind-up';return secondary(m,time,departure,arrival,height,unit);}
   const q=clamp((time-ANTICIPATION)/(DEPARTURE-ANTICIPATION));
   m.x=-departure*(1.5*q*q-.5*q*q*q);m.y=-height*(2*q-q*q);
   m.lean=mix(7,-11,smooth(q/.3));m.turn=mix(4,-13,smooth(q/.4));
   m.intent=1;m.air=smooth(q/.36);m.gaze=-4;m.shadow=.65*(1-q);m.phase='Leap left';
  }else{
   const local=time-DEPARTURE;m.intent=1;m.air=1;m.gaze=-4;m.phase='Enter from right';
   if(local<0){m.x=arrival;m.y=-height;return m;}
   if(local<FLIGHT){const q=clamp(local/FLIGHT),velocity=-1.5*departure/(DEPARTURE-ANTICIPATION);
    m.x=hermite(q,arrival,SLIDE*unit,velocity*FLIGHT,-SLIDE*unit/(FRICTION*1000)*FLIGHT);m.y=-height*(1-q*q);
    m.lean=mix(-11,0,smooth(q));m.turn=-13*(1-smooth(q));
    m.settle=smooth((q-.4)/.6);m.gaze=-4*(1-smooth(q));m.shadow=.18+.47*q*q;m.shadowScale=.68+.32*q;
   }else{
    // Friction arrests the remaining horizontal momentum while contact sends
    // a compression wave through the separate body and face spring masses.
    const p=clamp((local-FLIGHT)/(LANDING-FLIGHT)),seconds=(local-FLIGHT)/1000;
    m.x=SLIDE*unit*Math.exp(-seconds/FRICTION)*(1-smooth(p));
    m.settle=1;m.gaze=0;m.blink=.34*Math.max(0,Math.sin(Math.PI*clamp(seconds/.16)));m.phase=p>=1?'Settled':seconds<.11?'Impact cushion':seconds<.37?'Jelly rebound':'Settling';
   }
  }
  return secondary(m,time,departure,arrival,height,unit);
 }
 function expression(mode){return mode==='focus'?{intent:'mischievous',air:'amused',rest:'mischievous'}:{intent:'attentive',air:'playful',rest:'relaxed'};}
 const visits={
  everyday:{stretch:[['relaxed','Let’s stretch and take a little break.'],['stretching','A little stretch, then back to it.'],['happy','Tiny break. Big exhale.'],['playful','Unfold for a moment?'],['amused','Your shoulders get a turn too.']],water:[['attentive','A little water break?'],['happy','A sip, then back to your day.'],['relaxed','Refill your glass while I keep company.'],['curious','Shall we pause for a sip?'],['amused','Tiny water break. I’ll wait.']]},
  focus:{stretch:[['mischievous','Your tabs can survive a stretch.'],['suspicious','Those tabs aren’t going anywhere. Stretch.'],['amused','Plot twist: stand up for a minute.'],['determined','One stretch. Your empire can wait.'],['playful','Your chair called. It wants space.']],water:[['amused','Plot twist: a water break.'],['mischievous','Hydrate. The tabs don’t need you yet.'],['suspicious','An excellent time to refill that glass.'],['proud','One sip. Extremely advanced multitasking.'],['curious','Still debugging? Add a sip.']]}
 };
 function presentation(kind,mode,variant=0){const list=visits[mode==='focus'?'focus':'everyday'][kind==='water'?'water':'stretch'],index=Number.isInteger(variant)&&variant>=0?variant%list.length:0,[state,line]=list[index];return {state,line};}
 function awayLine(variant=0){const lines=['Gone for a break.','BRB.','Gone to meet an old friend.'];return lines[Number.isInteger(variant)&&variant>=0?variant%lines.length:0];}
 function area(p){let sum=0;for(let i=0;i<160;i++){const n=(i+1)%160;sum+=p['body'+i+'x']*p['body'+n+'y']-p['body'+n+'x']*p['body'+i+'y'];}return Math.abs(sum)*.5;}
 function deform(frame,m,poses,mode,{kind='stretch',returning=false,variant=0}={}){
  const scene=presentation(kind,mode,variant),pose={...frame.pose},faces=expression(mode),rest=returning?frame.pose:poses?.[scene.state];
  if(poses){const targets=[poses[faces.intent],poses[faces.air],rest];
   for(const prefix of ['left','right','mouth'])for(let i=0;i<96;i++)for(const axis of ['x','y']){const k=prefix+i+axis;pose[k]=mix(pose[k],targets[0][k],m.intent*.35);pose[k]=mix(pose[k],targets[1][k],m.air*.35);pose[k]=mix(pose[k],targets[2][k],m.settle);}
  }
  const preserve=returning?clamp(1-.35*m.intent+.35*m.settle):clamp((1-.35*m.intent)*(1-m.settle));
  for(const key of ['glasses','sunglasses','headphones'])pose[key]=(frame.pose[key]||0)*preserve;
  const foot=Math.max(...Array.from({length:160},(_,i)=>frame.pose['body'+i+'y']));
  const map=(x,y)=>{
   const h=clamp((foot-y)/285),belly=4*h*(1-h),strain=m.strain*(1-h)**2+2*m.strainMid*h*(1-h)+m.strainTop*h*h;
   const mean=m.strain*(1-h*.65)+m.strainTop*h*.65;
   const wave=m.wave*Math.sin(m.wavePhase-h*3.4)*belly;
   return [197+(x-197)/(1+strain)+m.lean*h*h+wave*(x-197)/175,foot+(y-foot)*(1+mean)+wave*.12*belly];
  };
  for(const [prefix,count] of [['body',160],['left',96],['right',96],['mouth',96]])for(let i=0;i<count;i++){
   const x=prefix+i+'x',y=prefix+i+'y';[pose[x],pose[y]]=map(pose[x],pose[y]);if(prefix!=='body'){pose[x]+=m.faceLagX;pose[y]+=m.faceLagY;}
  }
  [pose.bodyCenterX,pose.bodyCenterY]=map(frame.pose.bodyCenterX,frame.pose.bodyCenterY);
  // Preserve the blue silhouette's area: contact spreads mass sideways instead
  // of making the character shrink. Correct the face with the same surface.
  const correction=area(frame.pose)/area(pose);
  for(const [prefix,count] of [['body',160],['left',96],['right',96],['mouth',96]])for(let i=0;i<count;i++){const k=prefix+i+'x';pose[k]=197+(pose[k]-197)*correction;}
  pose.bodyCenterX=197+(pose.bodyCenterX-197)*correction;
  return {...frame,state:!returning&&m.settle===1?scene.state:frame.state,pose,roll:(frame.roll||0)*preserve,yaw:(frame.yaw||0)*preserve,pitch:(frame.pitch||0)*preserve,blink:(frame.blink||0)*preserve+m.blink,gazeX:(frame.gazeX||0)*preserve+m.gaze,gazeY:(frame.gazeY||0)*preserve,faceShift:{x:(frame.faceShift?.x||0)*preserve,y:(frame.faceShift?.y||0)*preserve},mouthOpen:(frame.mouthOpen||0)*preserve,leftLid:(frame.leftLid||0)*preserve,rightLid:(frame.rightLid||0)*preserve,bodyReach:(frame.bodyReach||0)*preserve,bodyLean:(frame.bodyLean||0)*preserve,bodyPress:(frame.bodyPress||0)*preserve};
 }
 const UNIT=390/180;
 function layout(value){if(!value)return null;const out={};for(const key of ['left','width','height','viewport']){if(!Number.isFinite(value[key]))return null;out[key]=value[key];}return out.width>=64&&out.width<=1600&&out.height>=40&&out.height<=1600&&out.viewport>=64&&out.viewport<=8192&&out.left>=-out.width&&out.left+out.width<=out.viewport+128?out:null;}
 function sanitizePlan(value){if(!value)return null;const out={};for(const key of ['departure','arrival','height']){const n=value[key];if(!Number.isFinite(n)||n<16||n>(key==='height'?200:2400))return null;out[key]=n;}return out;}
 function mirrored(m){return {...m,x:-m.x||0,turn:-m.turn||0,lean:-m.lean||0,faceLagX:-m.faceLagX||0,gaze:-m.gaze||0};}
 function bounds(frame,stage,m){const p=deform(frame,m,null,null).pose,foot=Math.max(...Array.from({length:160},(_,i)=>frame.pose['body'+i+'y'])),sx=stage.width/390,sy=stage.height/333.6048,angle=m.turn*Math.PI/180,points=Array.from({length:160},(_,i)=>stage.left+197*sx+(p['body'+i+'x']-197)*sx*Math.cos(angle)-(p['body'+i+'y']-foot)*sy*Math.sin(angle));return {min:Math.min(...points),max:Math.max(...points)};}
 function plan(frame,phone,desktop,direction='outbound'){
  phone=layout(phone);desktop=layout(desktop);if(!phone||!desktop||!frame?.pose)return null;
  const returning=direction==='return',source=returning?desktop:phone,dest=returning?phone:desktop;
  let value={departure:500,arrival:500,height:120};
  for(let pass=0;pass<3;pass++){let m=sample(DEPARTURE,'phone',{...value,unit:UNIT});if(returning)m=mirrored(m);const a=bounds(frame,source,m),b=bounds(frame,dest,m);value={departure:(returning?source.viewport-a.min+2:a.max+2)*390/source.width,arrival:(returning?b.max+2:dest.viewport-b.min+2)*390/dest.width,height:120};}
  return sanitizePlan(value);
 }
 function motion(time,t,role,{reduced=false}={}){const leaving=t.direction==='outbound'?role==='android':role==='windows',p=sanitizePlan(t.plan);if(!p)return {visible:false};const m=sample(time-t.start,leaving?'phone':'desktop',{...p,unit:UNIT,reduced});return t.direction==='return'?mirrored(m):m;}
 function warm(p){p=sanitizePlan(p);if(p)physicsTrack(p.departure,p.arrival,p.height,UNIT);}
 function blend(a,b,p){const out={...b,pose:{},faceShift:{}};for(const key of Object.keys(b.pose))out.pose[key]=mix(a.pose[key],b.pose[key],p);for(const key of ['roll','yaw','pitch','blink','gazeX','gazeY','mouthOpen','leftLid','rightLid','bodyReach','bodyLean','bodyPress'])out[key]=mix(a[key]||0,b[key]||0,p);for(const key of ['x','y'])out.faceShift[key]=mix(a.faceShift?.[key]||0,b.faceShift?.[key]||0,p);return out;}
 return {ANTICIPATION,DEPARTURE,FLIGHT,LANDING,TOTAL,sample,deform,expression,presentation,awayLine,layout,sanitizePlan,plan,motion,warm,blend,smooth,UNIT};
});
