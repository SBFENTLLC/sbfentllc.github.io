// Reference-led warehouse geometry. Aisles stay open and each object uses bounded mesh detail.
const color=hex=>({color:[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)});
export function warehouseScene(art={}){
 const meshes=[],colliders=[],belt=[];
 const steel=color('#233e54'),chrome=color('#a7b6bf'),gold=color('#d5a645'),orange=color('#c47722'),black=color('#141c23'),blue=color('#334e61'),wood=art.crate||color('#795332'),wall=art.wall||steel,concrete=art.floor||color('#343f48');
 const face=(points,tex,shade=1,layer=2)=>({points,tex,color:[shade,shade,shade],layer,uvs:points.map((_,i)=>[[0,0],[1,0],[1,1],[0,1]][i%4])});
 function block(x,y,z,w,h,d,tex=steel,solid=false,target=meshes){const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,top=y+h;
  const faces=[face([[x0,y,z1],[x1,y,z1],[x1,top,z1],[x0,top,z1]],tex,.95),face([[x1,y,z0],[x0,y,z0],[x0,top,z0],[x1,top,z0]],tex,.68),face([[x0,y,z0],[x0,y,z1],[x0,top,z1],[x0,top,z0]],tex,.78),face([[x1,y,z1],[x1,y,z0],[x1,top,z0],[x1,top,z1]],tex,.84),face([[x0,top,z1],[x1,top,z1],[x1,top,z0],[x0,top,z0]],tex,1)];
  if(h<=.18&&w>1&&d>1)target.push(faces[4]);else if(h<=.18&&w>1&&d<=.2)target.push(faces[0],faces[1],faces[4]);else if(w<=.2&&d<=.2&&h>1)target.push(...faces.slice(0,4));else target.push(...faces);
  if(solid)colliders.push({x0,x1,z0,z1,top});
 }
 const floor=(x,z,w,d,tex,y=.04)=>meshes.push(face([[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y,z-d/2],[x-w/2,y,z-d/2]],tex,1,1));
 // Real three-tier racks, with gaps between bays for cross-aisle searches.
 for(const x of [-7.7,7.7])for(const z of [-16,-23.5]){
  colliders.push({x0:x-1.7,x1:x+1.7,z0:z-2.8,z1:z+2.8,top:6.3});
  for(const sx of [-1,1])for(const sz of [-1,1])block(x+sx*1.6,0,z+sz*2.7,.16,6.4,.16,steel);
  for(const y of [.18,2.2,4.25]){for(const sz of [-1,1])block(x,y,z+sz*2.7,3.5,.16,.16,orange);block(x,y,z,3.4,.1,5.5,steel);for(const dz of [-1.35,1.35]){block(x,y+.16,z+dz,2.75,1.45,2.3,wood);block(x,y+.05,z+dz,2.9,.12,2.45,color('#5b432b'));}}
 }
 // Loading bay at the rear. Fronts face the player, avoiding mirrored/upside-down art.
 meshes.push(face([[-10.7,0,-28.65],[10.7,0,-28.65],[10.7,7.5,-28.65],[-10.7,7.5,-28.65]],wall));
 meshes.push(face([[-3.3,0,-28.5],[3.3,0,-28.5],[3.3,6.2,-28.5],[-3.3,6.2,-28.5]],art.door||blue));
 for(const x of [-10.72,10.72]){const m=face([[x,0,-28.5],[x,0,-12],[x,7.5,-12],[x,7.5,-28.5]],wall);if(x<0){m.points.reverse();m.uvs.reverse();}meshes.push(m);}
 for(let z=-26;z<=-14;z+=4)for(let x=-8.25;x<10;x+=5.5)floor(x,z,5.5,4,concrete,.055);
 for(const x of [-4.3,4.3]){floor(x,-20,.09,16,gold,.065);for(const z of [-14,-24]){block(x,6.2,z,2.1,.15,.5,steel);block(x,6.14,z,1.8,.04,.3,color('#d6e2c9'));}}
 // Side roof trusses leave the central cutaway camera sightline clear.
 for(const z of [-13,-20,-27])for(const x of [-7.4,7.4])block(x,6.8,z,6,.2,.2,steel);
 // Conveyor with visible rollers and solid legs; animated cargo stays over its collider.
 block(0,.9,-19,2.6,.4,6.8,black,true);for(const x of [-1.25,1.25])block(x,1.3,-19,.12,.2,6.8,chrome);
 for(const z of [-16.3,-21.7])for(const x of [-.95,.95])block(x,0,z,.14,.9,.14,steel);
 for(let z=-22;z<=-16;z+=.5)block(0,1.32,z,2.35,.065,.18,chrome);
 for(let i=0;i<3;i++){const part=[];block(0,1.43,0,.95,.85,.9,wood,false,part);belt.push({meshes:part,offset:i*1.8});}
 // Compact forklift: cab, mast, forks, counterweight and four round tires.
 const fx=-3.6,fz=-9.5;block(fx,.4,fz,2.6,.9,3.2,orange,true);block(fx,.8,fz-1.05,2.5,.7,.95,orange);block(fx,1.3,fz,.9,.35,1,black);block(fx,1.6,fz-.4,.9,.9,.2,black);
 for(const x of [-1.05,1.05])for(const z of [-1,1])block(fx+x,1.1,fz+z,.12,2.3,.12,steel);block(fx,3.4,fz,2.45,.14,2.5,steel);
 for(const x of [-.7,.7]){block(fx+x,.25,fz+1.8,.15,3.3,.18,steel);block(fx+x,.15,fz+2.45,.22,.13,1.5,chrome);}block(fx,1.3,fz+1.83,1.6,.15,.2,chrome);
 for(const sx of [-1,1])for(const dz of [-1.05,1.05]){const x=fx+sx*1.3,z=fz+dz,r=.48,ring=Array.from({length:8},(_,i)=>[Math.sin(i*Math.PI/4)*r,Math.cos(i*Math.PI/4)*r]);for(let i=0;i<8;i++){const a=ring[i],b=ring[(i+1)%8];meshes.push(face([[x-.16,.5+a[0],z+a[1]],[x+.16,.5+a[0],z+a[1]],[x+.16,.5+b[0],z+b[1]],[x-.16,.5+b[0],z+b[1]]],black));}for(const side of [-1,1]){const points=ring.map(([yy,zz])=>[x+side*.17,.5+yy,z+zz]);if(side>0)points.reverse();meshes.push({...face(points,black),uvs:points.map(()=>[0,0])});}}
 block(fx,3.55,fz-.7,.22,.18,.22,gold);
 // Pallet stacks and clear hazard-marked crossing at the warehouse threshold.
 for(const x of [3.6,5.3]){block(x,.1,-11.8,1.4,.15,1.5,wood,true);block(x,.3,-11.8,1.25,1.1,1.3,wood);}
 for(let x=-3;x<=3;x+=.6)floor(x,-12.4,.3,.8,gold,.07);
 return {meshes,colliders,belt,lights:[[-4.3,5.9,-14],[4.3,5.9,-24],[0,2.5,-27.9]],zones:[{z:-12,name:'FBH WORKSHOP'},{z:-21.5,name:'SBFENT WAREHOUSE / STORAGE AISLES'},{z:-26.5,name:'SBFENT WAREHOUSE / CONVEYOR BAY'},{z:-28.1,name:'SBFENT WAREHOUSE / LOADING DOCK'}]};
}
export function warehouseCargo(scene,time=0,reduced=false){return scene.belt.flatMap(part=>{const z=-21.6+(reduced?part.offset:(time*.45+part.offset)%5.1);return part.meshes.map(m=>({...m,points:m.points.map(([x,y,zz])=>[x,y,zz+z])}));});}
export function warehouseZone(z){return z<-26.5?'SBFENT WAREHOUSE / LOADING DOCK':z<-21.5?'SBFENT WAREHOUSE / CONVEYOR BAY':z<-12?'SBFENT WAREHOUSE / STORAGE AISLES':'THE FBH WORKSHOP';}
