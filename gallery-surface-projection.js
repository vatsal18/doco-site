// Shared orthographic projection of face marks onto a rounded surface.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.DocoFaceSurface=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const RADIUS=126,CX=120,CY=62;
  function create(MAX_YAW=.16,MAX_PITCH=.12){
  function yaw(value){return Math.max(-MAX_YAW,Math.min(MAX_YAW,Number(value)||0));}
  function pitch(value){return Math.max(-MAX_PITCH,Math.min(MAX_PITCH,Number(value)||0));}
  function project(x,y,angle=0,elevation=0){
    angle=yaw(angle);elevation=pitch(elevation);if(angle===0&&elevation===0)return {x,y};
    const u=x-CX,v=y-CY;
    const depth=Math.sqrt(Math.max(1,RADIUS*RADIUS-u*u-v*v*.36));
    const z=depth*Math.cos(angle)-u*Math.sin(angle);
    return {x:CX+u*Math.cos(angle)+depth*Math.sin(angle),y:elevation===0?y:CY+v*Math.cos(elevation)+z*Math.sin(elevation)};
  }
  // Eyewear is drawn by the existing vector rig; its local tangent follows the
  // same surface anchor. The face paths use point-by-point projection.
  function tangent(angle=0,elevation=0){angle=yaw(angle);elevation=pitch(elevation);const point=project(CX,CY,angle,elevation);return {x:point.x-CX,y:point.y-CY,scaleX:Math.cos(angle),scaleY:Math.cos(elevation),shearY:-Math.sin(angle)*Math.sin(elevation)};}
  return {RADIUS,CX,CY,MAX_YAW,MAX_PITCH,project,tangent,yaw,pitch};
  }
  // Broader app turns retain the exact same curved projection for the face
  // and its wearables. Gallery comparisons keep their approved original range.
  return {...create(),expressive:create(.16*1.8,.12*1.15)};
});
