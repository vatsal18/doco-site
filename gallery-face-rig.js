// Approved Study 07 rig shared by the static gallery, playground and app.
(function(root){
  const F=root.DocoOledFace,M=root.DocoGalleryMotion,S=root.DocoFaceSurface;
  function profile(state){return {...F.BASE,...root.DocoGalleryProposals[state]};}
  class FaceRig {
    constructor(canvas,accessoryCanvas){this.base=new F.OledFaceRenderer(canvas);this.canvas=canvas;this.accessories=accessoryCanvas;this.context=this.base.context;this.poses=Object.fromEntries(Object.keys(root.DocoGalleryProposals).map(s=>[s,M.pose(profile(s),s)]));}
    paint(p,weights,motion={},time=0,accents=true){
      const ctx=this.context,base=this.base;
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      ctx.setTransform(base.ratio*base.logicalScaleX,0,0,base.ratio*base.logicalScaleY,0,0);
      const surface=motion.motionStyle==='expressive'?S.expressive:S;
      const angle=surface.yaw(motion.yaw),gx=(motion.gazeX||0)*.45,gy=motion.gazeY||0,blink=motion.blink||0;
      const elevation=motion.living?surface.pitch(motion.pitch):0;
      base.current=p;base.state=Object.entries(weights).sort((a,b)=>b[1]-a[1])[0]?.[0]||'idle';
      const beat=F.sampleFaceBeat(null,0,true);
      const wear=draw=>{const t=surface.tangent(angle,elevation);ctx.save();ctx.translate(120+t.x,62+t.y);ctx.transform(t.scaleX,t.shearY,0,t.scaleY,0,0);ctx.translate(-120,-62);draw();ctx.restore();};
      // Only the three approved wearables remain, attached to the turning face.
      if(accents)wear(()=>base.drawHeadphones(120,52,beat,true));
      ctx.fillStyle='#fff';ctx.strokeStyle='#fff';ctx.shadowColor='rgba(221,242,255,.5)';ctx.shadowBlur=6;ctx.lineCap='round';ctx.lineJoin='round';
      const contour=(prefix,x,y,compression=0)=>{
        const factor=1-compression*.95;
        const living=motion.living, mouth=prefix==='mouth';
        const vx=i=>p[prefix+i+'x'];
        const vy=i=>{
          let value=p[prefix+i+'y'];
          if(living&&mouth)value*=1+(motion.mouthOpen||0)*.32;
          if(living&&!mouth)value-=(motion.smile||0)*1.5*Math.max(0,1-(vx(i)/25)**2);
          return value*factor;
        };
        const xx=i=>surface.project(x+vx(i),y+vy(i),angle,elevation).x,yy=i=>elevation===0?y+vy(i):surface.project(x+vx(i),y+vy(i),angle,elevation).y;
        ctx.beginPath();ctx.moveTo((xx(M.COUNT-1)+xx(0))/2,(yy(M.COUNT-1)+yy(0))/2);
        for(let i=0;i<M.COUNT;i++){const n=(i+1)%M.COUNT;ctx.quadraticCurveTo(xx(i),yy(i),(xx(i)+xx(n))/2,(yy(i)+yy(n))/2);}
        ctx.closePath();ctx.fill();
      };
      const separation=p.separation*F.SEPARATION_SCALE;
      for(const [side,sign] of [['left',-1],['right',1]]){
        const x=120+sign*separation/2+gx,y=52+gy,b=motion.living?1-(1-blink)*(1-(motion[side+'Lid']||0)):(side==='left'?Math.max(blink,motion.wink||0):blink);
        ctx.save();ctx.globalAlpha=1;contour(side,x,y,b);ctx.restore();
      }
      ctx.globalAlpha=1;contour('mouth',120,84);
      if(accents)wear(()=>{
        base.drawGlasses(120,52,separation,beat,true);
      });
      const ac=this.accessories.getContext('2d');ac.setTransform(1,0,0,1,0,0);ac.clearRect(0,0,640,480);
      ac.globalAlpha=1;
    }
    static(state,accents=true){this.paint(this.poses[state],{[state]:1},{},0,accents);}
    destroy(){this.base.resizeObserver?.disconnect();}
  }
  root.DocoGalleryFaceRig={FaceRig,profile};
})(globalThis);
