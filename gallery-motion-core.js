(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DocoGalleryMotion = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x*x*x*(x*(x*6-15)+10); };
  const mix = (a,b,t) => a+(b-a)*t;
  const COUNT = 96;
  // A spiral is a single filled ribbon with the same topology as every eye.
  // It can therefore deform directly, rather than fading a stroked overlay.
  function spiralContour() {
    const points=[];
    for(const sign of [1,-1])for(let j=0;j<COUNT/2;j++){
      const t=(sign===1?j:COUNT/2-1-j)/(COUNT/2-1),a=t*Math.PI*3.3,r=1+t*14;
      const dx=14*Math.cos(a)-r*Math.PI*3.3*Math.sin(a),dy=14*Math.sin(a)+r*Math.PI*3.3*Math.cos(a),length=Math.hypot(dx,dy);
      points.push([Math.cos(a)*r-sign*dy/length*1.6,Math.sin(a)*r+sign*dx/length*1.6]);
    }
    const area=points.reduce((sum,[x,y],i)=>{const q=points[(i+1)%COUNT];return sum+x*q[1]-y*q[0];},0);
    if(area<0)points.reverse();
    // Equal arc-length samples keep the long outer coil from bunching up
    // while the short inner coil stretches. Match the ordinary eye's starting
    // edge as well: an inner-tip start twists the entire eye during a handoff.
    const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%COUNT][0],p[1]-points[(i+1)%COUNT][1]));
    const perimeter=lengths.reduce((a,b)=>a+b,0),sampled=[];
    let edge=0,distance=0;
    for(let i=0;i<COUNT;i++){
      const at=i*perimeter/COUNT;
      while(edge<COUNT-1&&distance+lengths[edge]<at)distance+=lengths[edge++];
      const p=points[edge],q=points[(edge+1)%COUNT],t=(at-distance)/lengths[edge];
      sampled.push([mix(p[0],q[0],t),mix(p[1],q[1],t)]);
    }
    let start=0,best=Infinity;
    for(let shift=0;shift<COUNT;shift++){
      const score=sampled.reduce((sum,_,i)=>{const [x,y]=sampled[(i+shift)%COUNT],a=i/COUNT*Math.PI*2;return sum+(x-15*Math.cos(a))**2+(y-15*Math.sin(a))**2;},0);
      if(score<best){best=score;start=shift;}
    }
    return sampled.map((_,i)=>sampled[(i+start)%COUNT]);
  }
  const spiral=spiralContour();
  // All contours have matching vertex counts and winding. Morph geometry,
  // rather than crossfading complete faces or restarting a spring.
  function eye(p, side, state) {
    if(state==='dizzy')return spiral.map(([x,y])=>[x+p[side+'X'],y+p[side+'Y']]);
    return Array.from({length:COUNT}, (_, i) => {
      const a=i/COUNT*Math.PI*2, c=Math.cos(a), s=Math.sin(a);
      let x,y;
      if(state === "love") {
        const t=a+Math.PI/2;
        x=16*Math.pow(Math.sin(t),3)*1.2;
        y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*1.2;
      } else if(state === "twinkling") {
        const radius=15+5*Math.cos(a*4);
        x=c*radius; y=s*radius;
      } else {
        x=p[side+"Width"]*.84*Math.sign(c)*Math.pow(Math.abs(c),.52);
        y=Math.max(.9,p[side+"Height"]*.84*p[side+"Open"])*Math.sign(s)*Math.pow(Math.abs(s),.52);
        y+=p[side+"Curve"]*1.68*Math.max(.12,p[side+"Open"])*(1-Math.pow(x/Math.max(1,p[side+"Width"]*.84),2));
      }
      const tilt=p[side+"Tilt"];
      return [x*Math.cos(tilt)-y*Math.sin(tilt)+p[side+"X"],x*Math.sin(tilt)+y*Math.cos(tilt)+p[side+"Y"]];
    });
  }
  function mouth(p,state) {
    if(!p.mouthWidth)return Array.from({length:COUNT},()=>[0,0]);
    return Array.from({length:COUNT}, (_,i)=> {
      const a=i/COUNT*Math.PI*2, scale=["laughing","confused"].includes(state)?1:1.82, x=Math.cos(a)*p.mouthWidth*scale/2;
      let y;
      if(state==="laughing") y=(Math.sin(a)>0 ? Math.sin(a)*12 : Math.sin(a)*1.2+1)-3;
      else if(p.mouthOpen>.08) y=Math.sin(a)*Math.max(2,p.mouthHeight*scale*p.mouthOpen/2);
      else y=Math.sin(a)*(state==="confused"?1.4:Math.max(2.4,p.mouthHeight*scale)/2) + (state==="confused" ? Math.sin(x*.32)*2 : p.mouthCurve*.5*(1-Math.cos(a)**2));
      return [x*Math.cos(p.mouthTilt)-y*Math.sin(p.mouthTilt), x*Math.sin(p.mouthTilt)+y*Math.cos(p.mouthTilt)];
    });
  }
  function pose(p,state) {
    const output={...p,weight: p.mouthWidth ? 1:0};
    for(const side of ["left","right"]) eye(p,side,state).forEach(([x,y],i)=>{output[side+i+"x"]=x;output[side+i+"y"]=y;});
    mouth(p,state).forEach(([x,y],i)=>{output["mouth"+i+"x"]=x;output["mouth"+i+"y"]=y;});
    return output;
  }
  class Morph {
    constructor(initial,state) { this.current={...initial};this.from={...initial};this.to={...initial};this.weights={[state]:1};this.fromWeights={...this.weights};this.state=state;this.start=-300;this.duration=300; }
    target(next,state,time,duration=300) { this.sample(time);this.from={...this.current};this.to={...next};this.fromWeights={...this.weights};this.state=state;this.start=time;this.duration=duration; }
    sample(time,immediate=false) {
      const progress=immediate?1:clamp((time-this.start)/this.duration), t=ease(progress);
      for(const key of Object.keys(this.to)) this.current[key]=mix(this.from[key],this.to[key],t);
      this.weights={};
      for(const state of new Set([...Object.keys(this.fromWeights),this.state])) this.weights[state]=(this.fromWeights[state]||0)*(1-t)+(state===this.state?t:0);
      return progress;
    }
  }
  function pick(pool,recent,random=Math.random) {
    const fresh=pool.filter(s=>!recent.slice(-6).includes(s));
    const candidates=fresh.length?fresh:pool.filter(s=>s!==recent.at(-1));
    const choices=candidates.length?candidates:pool;
    return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
  }
  function performancePose(state,age,seed=0) {
    const enter=ease((age-1.1)/1.0), settle=1-ease((age-2.6)/2.4), beat=enter*settle;
    const poses={
      curious:[1.6,-1.1,-.035], pondering:[-1.4,-.6,-.018], peeking:[2.4,.6,.03], bashful:[-1.5,1,.025],
      happy:[0,-1.2,0], laughing:[0,-1.7,.012], celebrating:[0,-2,0], proud:[0,-1.3,-.016],
      playful:[1,-.6,.04], mischievous:[1,0,-.03], confused:[-.6,0,-.035], surprised:[0,-1,.012],
      shocked:[0,-1.3,0], scared:[0,.8,-.016], sleepy:[.4,1.5,.02], stretching:[0,-1.8,0],
      humming:[1.1,.2,.025], vibing:[1.7,0,.03], relaxed:[0,.6,0], daydreaming:[1,-.5,.02]
    };
    const p=poses[state]||[Math.sin(seed)*.5,0,0];
    return {x:p[0]*beat,y:p[1]*beat,tilt:p[2]*beat};
  }
  return { COUNT, ease, pose, Morph, pick, performancePose };
});
