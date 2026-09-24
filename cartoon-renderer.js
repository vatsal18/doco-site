// The production performance controller owns states, captions and its clock.
// This renderer owns only the approved blue artwork and its presentation.
(function(root){
  const C=root.DocoCartoon;
  class FallbackMesh {
    constructor(canvas,geometry){this.canvas=canvas;this.geometry=geometry;this.image=new Image();this.image.src='assets/cartoon/body-texture.png';}
    draw(p){
      if(!this.image.complete||!this.image.naturalWidth)return;
      const c=this.canvas.getContext('2d'),g=this.geometry;
      if(!c)return;
      c.setTransform(this.canvas.width/390,0,0,this.canvas.height/333.6048,0,0);c.clearRect(0,0,390,334);
      const points=Array.from({length:g.count},(_,i)=>[p['body'+i+'x'],p['body'+i+'y']]);
      const bounds=a=>[Math.min(...a.map(p=>p[0])),Math.min(...a.map(p=>p[1])),Math.max(...a.map(p=>p[0])),Math.max(...a.map(p=>p[1]))];
      const [sx,sy,ex,ey]=bounds(g.textureContour),[x,y,right,bottom]=bounds(points);
      c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
      c.drawImage(this.image,sx,sy,ex-sx,ey-sy,x,y,right-x,bottom-y);c.restore();
    }
    destroy(){this.image.onload=null;}
  }
  class Renderer {
    constructor({stage}){
      this.stage=stage;this.poses=C.makePoses(C.geometry);this.Director=C.CartoonDirector;
      this.element=document.createElement('div');this.element.className='cartoon-character';this.element.setAttribute('aria-hidden','true');
      const shadow=this.shadow=document.createElement('img');shadow.className='cartoon-shadow';shadow.src='assets/cartoon/ground-shadow.png';shadow.alt='';
      this.art=document.createElement('div');this.art.className='cartoon-art';
      this.canvas=document.createElement('canvas');this.face=document.createElement('canvas');
      for(const canvas of [this.canvas,this.face]){canvas.width=1170;canvas.height=1001;this.art.append(canvas);}
      this.element.append(shadow,this.art);stage.append(this.element);
      try{this.mesh=new C.BodyMesh(this.canvas,C.geometry);}catch{
        // A canvas that acquired WebGL cannot later acquire a 2D context.
        const fallback=this.canvas.cloneNode();this.canvas.replaceWith(fallback);this.canvas=fallback;
        this.mesh=new FallbackMesh(this.canvas,C.geometry);
      }
    }
    resize(){}
    render(frame){
      this.mesh.draw(frame.pose);C.paintFace(this.face,frame);
      // Body articulation happens in reference-space geometry, so it remains
      // grounded and proportional at both home and small setup-preview sizes.
      const reach=frame.bodyReach||0,lean=frame.bodyLean||0,press=frame.bodyPress||0;
      this.shadow.style.transform=`translateX(${lean*.04}%) scaleX(${1-reach*.003+press*.006})`;
      this.shadow.style.opacity=String(.75-reach*.008+press*.012);
      this.element.dataset.state=frame.state;
      this.onFrame?.(frame);
    }
    destroy(){this.mesh.destroy();this.element.remove();}
  }
  C.Renderer=Renderer;
})(globalThis);
