// Shared serializable C1 tracks. Time and velocity use milliseconds.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.DocoLivingMotion=api;})(globalThis,function(){
  const EPS=1e-10,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function segment(a,b,v0,v1,start,end){return {a,b,v0,v1,start,end};}
  function sample(s,time){
    if(time<=s.start)return {value:s.a,velocity:s.v0};
    if(time>=s.end)return {value:s.b,velocity:s.v1};
    const T=s.end-s.start,u=(time-s.start)/T,u2=u*u,u3=u2*u;
    return {value:(2*u3-3*u2+1)*s.a+(u3-2*u2+u)*T*s.v0+(-2*u3+3*u2)*s.b+(u3-u2)*T*s.v1,
      velocity:((6*u2-6*u)*s.a+(3*u2-4*u+1)*T*s.v0+(-6*u2+6*u)*s.b+(3*u2-2*u)*T*s.v1)/T};
  }
  class Track{
    constructor(value=0,bounds=[-Infinity,Infinity]){this.bounds=bounds;this.segments=[segment(value,value,0,0,0,0)];}
    sample(time){
      for(const s of this.segments)if(time<=s.end)return sample(s,time);
      return {value:this.segments.at(-1).b,velocity:0};
    }
    plan(frames,time,delay=0){
      const current=this.sample(time);let {value:a,velocity:v}=current,start=time,shift=0;
      const result=[],[lo,hi]=this.bounds;
      if(Math.abs(v)<EPS&&delay>0){result.push(segment(a,a,0,0,time,time+delay));start+=delay;v=0;}
      for(let i=0;i<frames.length;i++){
        const [offset,raw]=frames[i],b=clamp(raw,lo,hi);let end=time+offset+shift,T=Math.max(1,end-start);
        if(i===0&&Math.abs(v)>EPS){
          const delta=b-a,ratio=Math.abs(delta)>EPS?v*T/delta:Infinity;
          // Preserve the actual incoming tangent. If it points the wrong way or
          // would overshoot, brake within the safe envelope before redirecting.
          if(ratio<0||ratio>3||!Number.isFinite(ratio)){
            const room=v>0?hi-a:a-lo;
            const brake=Math.min(80,Number.isFinite(room)?Math.max(0,1.8*room/Math.abs(v)):80);
            if(brake>EPS){const stop=a+v*brake*.5;result.push(segment(a,stop,v,0,start,start+brake));start+=brake;shift+=brake;end+=brake;a=stop;}
            v=0;
          }
        }
        end=Math.max(start+1,end);result.push(segment(a,b,v,0,start,end));a=b;v=0;start=end;
      }
      this.segments=result;return this.end;
    }
    get end(){return this.segments.at(-1).end;}
    checkpoint(){return {bounds:this.bounds.slice(),segments:this.segments.map(s=>({...s}))};}
    static restore(data){const t=new Track(0,data.bounds);t.segments=data.segments.map(s=>({...s}));return t;}
  }
  class Random{
    constructor(seed=731){this.state=seed>>>0||1;}
    next(){let t=this.state+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
    checkpoint(){return this.state>>>0;}
  }
  function hash(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  class Bag{
    constructor(seed=731){this.seed=seed;this.states={};}
    pick(state,ids,preferred=[]){
      let entry=this.states[state];if(!entry)entry=this.states[state]={remaining:[],last:null,random:new Random(this.seed^hash(state))};
      if(!entry.remaining.length){
        const favored=new Set(preferred),shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(entry.random.next()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
        // Mode affinity controls the order within a cycle, never its coverage.
        // Every authored take is therefore seen before one repeats.
        entry.remaining=[...shuffle(ids.filter(id=>favored.has(id))),...shuffle(ids.filter(id=>!favored.has(id)))];
        if(entry.remaining[0]===entry.last&&ids.length>1)[entry.remaining[0],entry.remaining[1]]=[entry.remaining[1],entry.remaining[0]];
      }
      return entry.last=entry.remaining.shift();
    }
    checkpoint(){return {seed:this.seed,states:Object.fromEntries(Object.entries(this.states).map(([k,v])=>[k,{remaining:v.remaining.slice(),last:v.last,random:v.random.checkpoint()}]))};}
    static restore(data){const b=new Bag(data.seed);b.states=Object.fromEntries(Object.entries(data.states).map(([k,v])=>[k,{remaining:v.remaining.slice(),last:v.last,random:new Random(v.random)}]));return b;}
  }
  class Morph{
    constructor(poses,initial='idle'){
      this.poses=poses;this.state=initial;this.changed=0;this.end=0;this.current={...poses[initial]};this.velocity={};this.weights={[initial]:1};this.weightVelocity={};
      this.tracks=Object.fromEntries(Object.keys(poses[initial]).map(k=>{const all=Object.values(poses).map(p=>p[k]);return [k,new Track(poses[initial][k],[Math.min(...all),Math.max(...all)])];}));
      this.weightTracks=Object.fromEntries(Object.keys(poses).map(s=>[s,new Track(s===initial?1:0,[0,1])]));
    }
    target(state,time,duration){
      this.state=state;this.changed=time;this.end=time+duration;
      for(const [k,t] of Object.entries(this.tracks))this.end=Math.max(this.end,t.plan([[duration,this.poses[state][k]]],time));
      for(const [s,t] of Object.entries(this.weightTracks))this.end=Math.max(this.end,t.plan([[duration,s===state?1:0]],time));
    }
    sample(time){
      for(const [k,t] of Object.entries(this.tracks)){const p=t.sample(time);this.current[k]=p.value;this.velocity[k]=p.velocity;}
      let total=0,rate=0;const raw={};for(const [s,t] of Object.entries(this.weightTracks)){const p=t.sample(time);raw[s]=p;total+=p.value;rate+=p.velocity;}
      this.weights={};this.weightVelocity={};
      for(const [s,p] of Object.entries(raw)){this.weights[s]=p.value/total;this.weightVelocity[s]=(p.velocity*total-p.value*rate)/(total*total);}
      return this.end===this.changed?1:clamp((time-this.changed)/(this.end-this.changed),0,1);
    }
    checkpoint(){return {state:this.state,changed:this.changed,end:this.end,tracks:Object.fromEntries(Object.entries(this.tracks).map(([k,t])=>[k,t.checkpoint()])),weights:Object.fromEntries(Object.entries(this.weightTracks).map(([k,t])=>[k,t.checkpoint()]))};}
    static restore(poses,data){const m=Object.create(Morph.prototype);Object.assign(m,{poses,state:data.state,changed:data.changed,end:data.end,current:{},velocity:{},weights:{},weightVelocity:{},tracks:Object.fromEntries(Object.entries(data.tracks).map(([k,t])=>[k,Track.restore(t)])),weightTracks:Object.fromEntries(Object.entries(data.weights).map(([k,t])=>[k,Track.restore(t)]))});return m;}
  }
  return {Track,Morph,Random,Bag,hash,sample,clamp};
});
