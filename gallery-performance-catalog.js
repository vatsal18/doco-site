// Authored acting choices shared by the approved gallery and production app.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.DocoPerformances=api;})(globalThis,function(){
  const take=(name,gesture,x,y,roll,lift,face={})=>({name,gesture,gaze:[x,y],roll,lift,face});
  const catalog={
    idle:[take('A quiet check','peek',1.7,0,.008,0,{leftLid:.08}),take('Taking it in','lean',0,-.7,0,-.25,{leftLid:-.04,rightLid:-.04}),take('A thoughtful pause','settle',-1,.2,-.008,.15,{rightLid:.06})],
    listening:[take('Found the sound','lean',2.5,-.4,.012,-.3,{leftLid:-.06}),take('Listening closer','peek',-2,0,-.016,-.2,{rightLid:.1}),take('Understood','nod',.5,-.2,.005,-.65,{leftLid:.12,rightLid:.12})],
    attentive:[take('Ready for you','lean',0,-.7,0,-.6,{leftLid:-.08,rightLid:-.08}),take('Checking the detail','peek',1.7,-.6,.012,-.25,{rightLid:.1}),take('Got it','nod',-.5,0,-.008,-.75,{leftLid:.1,rightLid:.1})],
    happy:[take('Quiet smile','settle',.6,-.3,.008,-.45,{smile:.35}),take('Pleased little lift','lift',0,-.6,0,-1.1,{smile:.7,leftLid:.06,rightLid:.06}),take('A spreading smile','smile',-1,0,-.012,-.35,{smile:1,leftLid:.1,rightLid:.1})],
    amused:[take('Knowing look','peek',2,0,.012,-.2,{rightLid:.18,mouthOpen:-.3}),take('Holding back a giggle','chuckle',-.8,-.2,-.008,-.55,{leftLid:.12,rightLid:.12,mouthOpen:.4}),take('That was good','smile',.4,-.4,.006,-.4,{smile:.6,mouthOpen:.2})],
    celebrating:[take('A bright cheer','lift',0,-.7,0,-1.4,{smile:.6,mouthOpen:.7}),take('Proud little yes','nod',-1,-.3,-.016,-1.1,{leftLid:.12,rightLid:.12,mouthOpen:.4}),take('Sharing the win','peek',1.8,-.4,.02,-.9,{smile:.9,mouthOpen:.3})],
    laughing:[take('Two little chuckles','chuckle',0,-.5,.008,-1,{leftLid:.16,rightLid:.16,mouthOpen:.8}),take('Trying not to laugh','smile',-1.3,.2,-.018,-.6,{rightLid:.22,mouthOpen:.6,smile:.5}),take('A delighted giggle','nod',1,-.5,.012,-.9,{leftLid:.23,rightLid:.23,mouthOpen:1})],
    proud:[take('Chin up','lift',0,-.7,-.01,-1,{smile:.35,mouthOpen:-.2}),take('Did you see that','peek',2,0,.012,-.45,{rightLid:.15,smile:.5}),take('Quiet satisfaction','smile',-.7,-.3,-.008,-.6,{leftLid:.12,rightLid:.12,smile:.7})],
    sleepy:[take('Heavy eyelids','settle',0,.2,.008,.75,{leftLid:.32,rightLid:.32}),take('A drowsy dip','nod',-.6,.5,-.008,.9,{leftLid:.24,rightLid:.3}),take('One last look','peek',1.2,.1,.01,.55,{leftLid:-.12,rightLid:.16})],
    relaxed:[take('An easy exhale','settle',0,.3,0,.35,{smile:.25,leftLid:.14,rightLid:.14}),take('Contented little smile','smile',.8,0,.008,.2,{smile:.6,mouthOpen:-.25}),take('Unhurried glance','peek',-1.4,.2,-.01,.25,{rightLid:.12})],
    bored:[take('Anything over there','peek',-2.2,0,-.008,.2,{leftLid:.15,mouthOpen:-.2}),take('Patiently waiting','settle',0,.6,.006,.5,{leftLid:.22,rightLid:.22}),take('A reluctant second look','double',1.7,.1,.012,.3,{rightLid:-.06,leftLid:.16})],
    concerned:[take('Leaning in gently','lean',0,-.3,-.008,-.35,{smile:-.25,leftLid:.12,rightLid:.12}),take('Checking on you','peek',1.3,0,.01,-.2,{rightLid:.14}),take('A gentle acknowledgement','nod',-.4,.2,-.006,.35,{leftLid:.1,rightLid:.1,smile:-.4})],
    crying:[take('A small quiet dip','nod',0,.4,0,.55,{leftLid:.18,rightLid:.18,mouthOpen:.18}),take('Looking aside','tuck',-1.3,.3,-.01,.4,{rightLid:.2,smile:-.25}),take('Composing a little','settle',.5,.1,.006,.25,{leftLid:.25,rightLid:.25,mouthOpen:-.2})],
    surprised:[take('Oh!','lift',0,-.4,0,-.5,{leftLid:-.08,rightLid:-.08}),take('A second look','double',1.5,0,.01,-.3,{rightLid:-.1}),take('Taking a closer look','lean',-.6,-.4,-.008,-.4,{leftLid:-.04,rightLid:.08})],
    shocked:[take('A tiny gasp','lift',0,-.2,0,-.7,{mouthOpen:.6}),take('Wait, really','double',-1.4,.1,-.012,-.45,{rightLid:.12,mouthOpen:.3}),take('Processing that','settle',.6,.2,.008,-.3,{leftLid:.12,rightLid:.12,mouthOpen:-.2})],
    scared:[take('A small retreat','tuck',-.5,.5,-.012,.55,{leftLid:.08,rightLid:.08,mouthOpen:.2}),take('Checking the side','peek',1.7,.2,.01,.35,{rightLid:.18}),take('A cautious pause','settle',0,.3,0,.45,{leftLid:.15,rightLid:.15,smile:-.3})],
    angry:[take('A compact pout','settle',0,.2,0,.25,{leftLid:.2,rightLid:.2,smile:-.4}),take('Grumpy side-eye','peek',-2,0,-.01,.15,{rightLid:.16,mouthOpen:-.3}),take('A firm little nod','nod',.3,-.2,.005,-.65,{leftLid:.14,rightLid:.14,smile:-.2})],
    determined:[take('Locking in','lean',0,-.5,0,-.6,{leftLid:.16,rightLid:.16}),take('Yes, this way','nod',1,-.2,.008,-.65,{leftLid:.1,rightLid:.1}),take('Checking the target','peek',-1.8,-.3,-.012,-.3,{rightLid:.2})],
    suspicious:[take('The long side-eye','peek',-3.5,0,-.008,.1,{leftLid:.16}),take('Another inspection','double',2.4,-.2,.012,0,{rightLid:.18}),take('Not quite convinced','lean',-.8,-.5,-.014,-.3,{leftLid:.24,rightLid:.14})],
    curious:[take('Closer inspection','lean',.5,-1.1,-.012,-.7,{leftLid:-.08,rightLid:.12}),take('A sideways look','peek',3,-.4,.02,-.2,{rightLid:.2}),take('A little double-take','double',-2.4,-.6,-.018,-.3,{leftLid:.16,rightLid:-.06})],
    confused:[take('Trying this angle','lean',-1,-.3,-.024,-.2,{leftLid:.12,rightLid:-.06,mouthOpen:.2}),take('Wait a second','double',2,0,.018,.1,{rightLid:.15,mouthOpen:-.2}),take('Thinking it over','settle',-.4,-.8,-.012,0,{leftLid:.2,rightLid:.08})],
    cool:[take('An easy lean','lean',1.7,0,-.012,-.2,{smile:.35}),take('A confident nod','nod',0,-.3,0,-.65,{mouthOpen:-.25,smile:.2}),take('Checking the room','peek',-2,.2,.012,.1,{smile:.55})],
    vibing:[take('Side-to-side groove','groove',2.4,0,.025,-.25,{smile:.2}),take('A little head nod','nod',.6,-.2,.014,-.95,{leftLid:.12,rightLid:.12,smile:.5}),take('Leaning into the song','lean',-2,.1,-.024,-.3,{rightLid:.1,smile:.35})],
    love:[take('A warm little smile','smile',0,-.3,.008,-.3,{smile:.7,mouthOpen:.15}),take('Leaning toward you','lean',.7,-.4,.012,-.65,{leftLid:.06,rightLid:.06}),take('A shy look back','tuck',-1.6,.3,-.014,.35,{smile:.35,mouthOpen:-.3})],
    playful:[take('A cheeky peek','peek',2.5,-.3,.024,-.25,{leftLid:.16,smile:.5}),take('A little wink-and-nod','nod',-.8,-.2,-.014,-.8,{leftLid:.3,mouthOpen:.3}),take('Caught being cheeky','double',1.7,.2,.018,-.35,{rightLid:.12,smile:.8})],
    mischievous:[take('A sideways plan','peek',2.8,0,-.012,-.2,{leftLid:.16,smile:.4}),take('The grin gives it away','smile',-.8,.2,-.018,-.25,{smile:1,rightLid:.14}),take('Just checking','double',-2.2,-.2,.012,-.15,{leftLid:.2,mouthOpen:.3})],
    bashful:[take('Tuck and peek back','tuck',-2,.7,.018,.6,{leftLid:.14,rightLid:.14,smile:.2}),take('A small hidden smile','smile',.6,.4,-.008,.35,{smile:.7,mouthOpen:-.3}),take('A shy acknowledgement','nod',1,.3,.012,.6,{rightLid:.18,smile:.3})],
    silly:[take('A wonky little lean','lean',-1.2,.1,.022,-.3,{leftLid:.08,rightLid:.2,mouthOpen:.4}),take('A goofy second look','double',2.1,-.4,-.018,-.2,{leftLid:.2,smile:.6}),take('A lopsided chuckle','chuckle',-.6,.3,.016,-.65,{rightLid:.16,mouthOpen:.8})],
    dizzy:[take('Finding the center','settle',.5,.2,.012,.25,{leftLid:.08,rightLid:.08}),take('A slow sideways check','peek',-1.5,0,-.018,.15,{rightLid:.12}),take('Steadying a little','nod',.2,.4,.008,.4,{leftLid:.16,rightLid:.16})],
    nerdy:[take('An eager little nod','nod',0,-.5,-.008,-.7,{smile:.4}),take('Inspecting the detail','lean',1.5,-.7,.012,-.4,{rightLid:.12,mouthOpen:-.25}),take('A new thought','double',-1.7,-.2,-.014,-.3,{leftLid:-.06,smile:.6})],
    daydreaming:[take('Following a thought','peek',2,-1,.008,-.15,{leftLid:.12,rightLid:.12}),take('A dreamy little smile','smile',-.8,-.6,-.008,0,{smile:.7,mouthOpen:-.3}),take('Drifting back gently','settle',.3,-.7,.006,.15,{rightLid:.18,smile:.3})],
    peeking:[take('Around the corner','peek',3.7,0,.018,.1,{leftLid:.18}),take('Is it safe to look','double',-2.7,.2,-.016,.2,{rightLid:.2,smile:.2}),take('A tiny look back','tuck',2.5,.4,.012,.3,{leftLid:.24,smile:.5})],
    humming:[take('A gentle little sway','groove',1.4,0,.012,-.1,{mouthOpen:.5,smile:.15}),take('Holding the note','lean',-.7,-.2,-.008,-.3,{mouthOpen:.7,leftLid:.1,rightLid:.1}),take('Content with the tune','smile',.5,.2,.008,.15,{smile:.7,mouthOpen:-.3})],
    pondering:[take('Looking for a thought','peek',-2,-1.1,-.01,0,{rightLid:.16}),take('Considering it closely','lean',.6,-.8,.012,-.3,{leftLid:.2,rightLid:.12}),take('An almost-answer','nod',1.2,-.5,.008,-.4,{leftLid:.1,rightLid:.1})],
    twinkling:[take('Quiet delight','settle',.4,-.3,.008,-.3,{leftLid:.08,rightLid:.08}),take('A sparkling little lift','lift',0,-.5,0,-.8,{smile:.45}),take('Sharing the delight','peek',-1.8,-.2,-.014,-.4,{rightLid:.14})],
    stretching:[take('A long gentle reach','lift',0,-.5,0,-1.2,{leftLid:.2,rightLid:.2,mouthOpen:.6}),take('Stretching to one side','lean',1.5,-.3,.014,-.8,{rightLid:.24,mouthOpen:.35}),take('Unwinding slowly','settle',-.7,.1,-.008,-.6,{leftLid:.12,rightLid:.12,mouthOpen:-.3})],
    calibrating:[take('Checking the frame','scan',2.5,0,0,0,{})],
    'camera-off':[take('Resting display','still',0,0,0,0,{})]
  };
  for(const [state,takes] of Object.entries(catalog))for(let i=0;i<takes.length;i++){takes[i].id=state+'-'+(i+1);Object.freeze(takes[i].face);Object.freeze(takes[i]);}
  const REST=Object.freeze({gazeX:0,gazeY:0,headX:0,headY:0,roll:0,yaw:0,pitch:0,leftLid:0,rightLid:0,smile:0,mouthOpen:0});
  const BOUNDS=Object.freeze({gazeX:[-5,5],gazeY:[-3,3],headX:[-3.3,3.3],headY:[-3.3,3.3],roll:[-.04,.04],yaw:[-.16,.16],pitch:[-.12,.12],leftLid:[-.12,.45],rightLid:[-.12,.45],smile:[-1,1],mouthOpen:[-1,1]});
  // The immersive app needs more travel than a 320px gallery thumbnail. Plan
  // the larger targets on the C1 tracks themselves, never multiply a live pose
  // by its incoming emotion (which would jump during interrupted reactions).
  const EXPRESSIVE_GAIN=Object.freeze({headX:5,headY:2,roll:3,yaw:1.8,pitch:1.15});
  const EXPRESSIVE_BOUNDS=Object.freeze(Object.fromEntries(Object.entries(BOUNDS).map(([k,b])=>[k,b.map(v=>v*(EXPRESSIVE_GAIN[k]||1))])));
  function amplify(values,style){return style==='expressive'?Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v*(EXPRESSIVE_GAIN[k]||1)])):values;}
  const DEFAULT_ACTING_PROFILE=Object.freeze({lateral:1,vertical:1,facial:1,follow:1,lidBias:0,asymmetry:0,gazeBias:0,followMinMs:4000,followMaxMs:8000});
  function actingProfile(value={}){return {...DEFAULT_ACTING_PROFILE,...value};}
  function shape(values,profile,follow){
    const p=actingProfile(profile),followGain=follow?p.follow:1;
    return Object.fromEntries(Object.entries(values).map(([key,value])=>{
      const gain=['gazeX','headX','roll','yaw'].includes(key)?p.lateral
        :['gazeY','headY','pitch'].includes(key)?p.vertical
        :['leftLid','rightLid','smile','mouthOpen'].includes(key)?p.facial:1;
      let result=value*gain*followGain;
      if(key==='gazeX'&&p.gazeBias)result+=(Math.sign(value)||1)*p.gazeBias*followGain;
      if(key==='leftLid'||key==='rightLid')result+=p.lidBias*followGain;
      if(key==='rightLid')result+=p.asymmetry*followGain;
      return [key,result];
    }));
  }
  function target(take,p){return {...REST,gazeX:take.gaze[0],gazeY:take.gaze[1],headX:take.gaze[0]*.4*p.move,headY:take.lift*p.move,roll:take.roll,yaw:take.gaze[0]*.035,...take.face};}
  function choreography(take,p,follow=false,style='gallery',profile={}){
    const expressive=style==='expressive',peak=shape(amplify(target(take,p),style),profile,follow),frames={},delays={};
    if(follow){
      // One small same-emotion inclination, never another entrance or startle.
      const duration=p.body>=700?1500:1100;
      for(const k of Object.keys(REST)){const a=peak[k]*(k in take.face ? .35 : expressive?.45:.22);frames[k]=[[duration*.38,a],[duration*.6,a],[duration,0]];delays[k]=k.startsWith('gaze')?0:50;}
      return {frames,delays,holdUntil:duration*.6,bodyAt:duration*.38};
    }
    for(const k of Object.keys(REST)){
      const eye=k.startsWith('gaze'),surface=k==='yaw',facial=k in take.face;
      const arrive=eye?p.eye:surface?p.surface:facial?p.morph:p.body;
      delays[k]=eye?0:surface?p.surfaceStart:facial?0:p.bodyStart;
      frames[k]=[[arrive,peak[k]],[p.hold,peak[k]],[eye?p.eyeRest:p.rest,0]];
    }
    let holdUntil=p.hold;
    if(take.gesture==='lift'){
      frames.headY=[[p.body,peak.headY],[p.hold+150,peak.headY],[p.rest+200,0]];
      frames.gazeY=[[p.eye,peak.gazeY*.4],[p.body,peak.gazeY],[p.hold+100,peak.gazeY],[p.eyeRest+200,0]];
      for(const k of ['smile','mouthOpen','leftLid','rightLid'])frames[k]=[[p.morph*.6,peak[k]*.35],[p.body,peak[k]],[p.hold+150,peak[k]],[p.rest+200,0]];
      holdUntil=p.hold+150;
    }
    if(['peek','double','tuck'].includes(take.gesture)){
      const twice=take.gesture==='double',end=p.rest+(twice?260:0);
      for(const k of ['gazeX','yaw','headX','roll']){
        const lead=k==='gazeX'?0:k==='yaw'?70:120,a=peak[k],first=k==='gazeX'?p.eye:k==='yaw'?p.surface:p.body;
        frames[k]=twice?[[first,a*.6],[first+100,a*.6],[first+280,a*.12],[first+460+lead,a],[first+620+lead,a],[end,0]]:
          [[first,a],[p.hold*.75,a],[p.hold+150+lead,-a*.2],[p.hold+260+lead,-a*.2],[end+120,0]];
      }
      holdUntil=p.hold+260;
    }
    if(take.gesture==='tuck'){
      frames.headY=[[p.body,peak.headY],[p.hold+160,peak.headY],[p.rest+160,0]];
      frames.gazeY=[[p.eye,peak.gazeY],[p.hold,peak.gazeY],[p.hold+200,-peak.gazeY*.15],[p.rest+160,0]];
      for(const k of ['smile','mouthOpen','leftLid','rightLid'])frames[k]=[[p.morph,peak[k]*.35],[p.hold*.8,peak[k]],[p.hold+200,peak[k]],[p.rest+160,0]];
    }
    if(take.gesture==='smile')for(const k of ['smile','mouthOpen','leftLid','rightLid'])frames[k]=[[p.morph,peak[k]*.25],[p.hold*.8,peak[k]],[p.hold+180,peak[k]],[p.rest+200,0]];
    if(take.gesture==='lean')for(const k of ['leftLid','rightLid'])frames[k]=[[p.morph,peak[k]],[p.hold*.75,peak[k]],[p.hold+200,peak[k]*.3],[p.rest+120,0]];
    if(['nod','chuckle'].includes(take.gesture)){
      const a=p.body,twice=take.gesture==='chuckle';
      frames.headY=twice?[[a*.8,peak.headY],[a+70,peak.headY],[a+230,peak.headY*.25],[a+430,peak.headY*.75],[a+500,peak.headY*.75],[p.rest,0]]:
        [[a,peak.headY],[a+100,peak.headY],[Math.max(a+400,p.hold),peak.headY*.12],[p.rest,0]];
      for(const k of ['mouthOpen','leftLid','rightLid'])frames[k]=frames.headY.map(([t,y])=>[t,peak.headY?peak[k]*y/peak.headY:0]);
    }
    if(take.gesture==='groove'){
      const beat=p.body>=500?740:540;
      for(const k of ['gazeX','yaw','headX','roll','mouthOpen','smile']){const a=k==='gazeX'?p.eye:k==='yaw'?p.surface:p.body,v=peak[k];frames[k]=[[a,v],[a+110,v],[a+beat,-v*.8],[a+beat+110,-v*.8],[a+2*beat,v*.5],[a+2*beat+110,v*.5],[a+2*beat+460,0]];}
      holdUntil=p.body+2*beat+110;
    }
    if(expressive){
      // A readable look, hold, return. Keep the eye-led double-take but avoid
      // dragging the whole body through its quick back-and-forth eye beats.
      if(['peek','tuck','double'].includes(take.gesture)){
        for(const k of ['gazeX','yaw','headX','roll']){
          if(take.gesture==='double'&&k==='gazeX')continue;
          const arrival=k==='gazeX'?p.eye:k==='yaw'?p.surface:p.body;
          frames[k]=[[arrival,peak[k]],[p.hold+160,peak[k]],[p.rest+240,0]];
        }
        if(take.gesture==='tuck')frames.gazeY=[[p.eye,peak.gazeY],[p.hold+160,peak.gazeY],[p.rest+240,0]];
        holdUntil=p.hold+160;
      }
      // The mouth/eyelids chuckle twice; the body sustains one joyful lean.
      if(take.gesture==='chuckle')frames.headY=[[p.body,peak.headY],[p.hold+140,peak.headY],[p.rest+240,0]];
      if(take.gesture==='groove'){
        const beat=p.body>=500?850:700;
        for(const k of ['gazeX','yaw','headX','roll']){
          const arrival=k==='gazeX'?p.eye:k==='yaw'?p.surface:p.body,v=peak[k];
          frames[k]=[[arrival,v],[arrival+200,v],[arrival+beat,-v],[arrival+beat+220,-v],[arrival+beat+850,0]];
        }
        // A groove is intentional left/right acting, not a decaying rebound.
        for(const k of ['mouthOpen','smile'])frames[k]=[[p.morph,peak[k]],[p.body+beat+220,peak[k]],[p.body+beat+850,0]];
        holdUntil=p.body+beat+220;
      }
    }
    if(take.gesture==='scan'){frames.gazeX=[[180,-2.5],[500,-2.5],[780,2.5],[1180,2.5],[1530,0]];}
    if(take.gesture==='still')for(const k of Object.keys(REST))frames[k]=[[p.morph,0]];
    // Sort and coalesce short-energy templates so every segment has positive duration.
    for(const k of Object.keys(frames))frames[k]=Array.from(new Map(frames[k].sort((a,b)=>a[0]-b[0]).map(([t,v])=>[t,v])).entries());
    return {frames,delays,holdUntil,bodyAt:p.body};
  }
  return {catalog,REST,BOUNDS,EXPRESSIVE_GAIN,EXPRESSIVE_BOUNDS,DEFAULT_ACTING_PROFILE,actingProfile,shape,amplify,target,choreography};
});
