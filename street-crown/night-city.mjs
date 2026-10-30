import {paintBox} from './geometry.mjs';
import {courseFrame,courseDelta} from './course.mjs';
let facades=null;
export const setNightFacades=image=>{facades=image;};
export function paintFacadeTexture(c,f){
 const iw=f.img.naturalWidth||f.img.width,ih=f.img.naturalHeight||f.img.height;
 const sx=(f.tile%2)*iw/2,sy=Math.floor(f.tile/2)*ih/2,sw=iw/2,sh=ih/2;
 // Two clipped triangles keep the building art attached to its projected wall.
 const uv=[[0,0],[1,0],[1,1],[0,1]];
 for(const ids of [[0,1,2],[0,2,3]]){
  const a=ids.map(i=>uv[i]),b=ids.map(i=>f.p[i]);
  const den=(a[1][0]-a[0][0])*(a[2][1]-a[0][1])-(a[2][0]-a[0][0])*(a[1][1]-a[0][1]);
  const ax=((b[1][0]-b[0][0])*(a[2][1]-a[0][1])-(b[2][0]-b[0][0])*(a[1][1]-a[0][1]))/den;
  const bx=((b[2][0]-b[0][0])*(a[1][0]-a[0][0])-(b[1][0]-b[0][0])*(a[2][0]-a[0][0]))/den;
  const ay=((b[1][1]-b[0][1])*(a[2][1]-a[0][1])-(b[2][1]-b[0][1])*(a[1][1]-a[0][1]))/den;
  const by=((b[2][1]-b[0][1])*(a[1][0]-a[0][0])-(b[1][1]-b[0][1])*(a[2][0]-a[0][0]))/den;
  c.save();c.beginPath();c.moveTo(...b[0].slice(0,2));c.lineTo(...b[1].slice(0,2));c.lineTo(...b[2].slice(0,2));c.closePath();c.clip();
  c.transform(ax,ay,bx,by,b[0][0]-ax*a[0][0]-bx*a[0][1],b[0][1]-ay*a[0][0]-by*a[0][1]);
  c.drawImage(f.img,sx,sy,sw,sh,0,0,1,1);c.restore();
 }
}
export function paintNightFacade(s,at,side,index,height){
 if(!facades||!(facades.naturalWidth||facades.width))return;
 const pts=[at(-side*309,height-2,-330),at(-side*309,height-2,330),at(-side*309,2,330),at(-side*309,2,-330)];
 if(side>0){pts.reverse();[pts[0],pts[1],pts[2],pts[3]]=[pts[1],pts[0],pts[3],pts[2]];}
 const p=pts.map(q=>s.project(q));if(p.some(q=>!q)||p.every(q=>q[0]<-100)||p.every(q=>q[0]>s.w+100))return;
 s.items.push({texture:true,img:facades,tile:Math.abs(index)%4,p,z:p.reduce((n,q)=>n+q[2],0)/4-3,layer:1,alpha:1});
}
// All artwork is projected onto world-space walls; no skyline billboards.
function textureWall(s,points,tile,flip=false){
 if(flip)points=[points[1],points[0],points[3],points[2]];
 if(!facades||!(facades.naturalWidth||facades.width))return;
 const p=points.map(q=>s.project(q));if(p.some(q=>!q)||p.every(q=>q[0]<-100)||p.every(q=>q[0]>s.w+100))return;
 s.items.push({texture:true,img:facades,tile,p,z:p.reduce((n,q)=>n+q[2],0)/4-4,layer:1,alpha:1});
}
function localBox(s,at,x,y,z,w,h,d,color){
 const points=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].map(([a,b,c])=>at(x+a,y+b,z+c));
 paintBox(s,points,color);
}
export function drawNightBuilding(s,d,side,index,detail=true,track=0){
 const f=courseFrame(d,side*1.78,0,track),p=f.position;
 const at=(x,y,z)=>p.map((v,k)=>v+f.right[k]*x+f.forward[k]*z+(k===1?y:0));
 const width=860,depth=940,height=720+(Math.abs(index)%3)*100,tile=Math.abs(index)%4;
 const brick=['#304d43','#673d38','#363b42','#6e6250'][tile];
 localBox(s,at,0,0,0,width,height,depth,brick);
 const relative=s.eye.map((v,i)=>v-p[i]),eyeX=relative.reduce((a,v,i)=>a+v*f.right[i],0),eyeZ=relative.reduce((a,v,i)=>a+v*f.forward[i],0);
 // Road-facing wall and the approaching end wall both have masonry and shops.
 for(const faceSide of [-1,1]){
  if(eyeX*faceSide>width/2)textureWall(s,[at(faceSide*(width/2+2),height,-depth/2),at(faceSide*(width/2+2),height,depth/2),at(faceSide*(width/2+2),0,depth/2),at(faceSide*(width/2+2),0,-depth/2)],tile,faceSide<0);
  if(eyeZ*faceSide>depth/2)textureWall(s,[at(-width/2,height,faceSide*(depth/2+2)),at(width/2,height,faceSide*(depth/2+2)),at(width/2,0,faceSide*(depth/2+2)),at(-width/2,0,faceSide*(depth/2+2))],tile,faceSide>0);
 }
 // Recessed roofs, brick parapets and small rooftop equipment give real depth.
 const accent=['#dfba6b','#85e8ec','#e4a359','#cdb6f1'][track];
 if(track===1){for(const y of [height*.4,height*.8])localBox(s,at,-side*(width/2+8),y,0,18,14,depth*.9,accent);if(index%5===0)s.text(at(-side*(width/2+35),height*.65,0),'SBFENT FM',accent,65);}
 if(track===2){for(const z of [-250,100]){localBox(s,at,-side*(width/2+190),0,z,280,160,230,index%2?'#7a503b':'#345e57');}if(index%5===0)s.text(at(-side*(width/2+35),height*.65,0),'MOTOR WORKS',accent,65);}
 if(track===3){localBox(s,at,0,height+60,0,350,240,400,'#455f70');s.text(at(0,height+390,0),'♛',accent,180);for(const z of [-300,0,300])localBox(s,at,-side*(width/2+8),height*.5,z,16,height*.8,22,accent);}
 localBox(s,at,0,height,0,width+24,22,depth+24,'#26343a');
 for(const x of [-width/2,width/2])localBox(s,at,x,height,0,20,58,depth+20,brick);
 for(const z of [-depth/2,depth/2])localBox(s,at,0,height,z,width+20,58,20,brick);
 if(detail){
  localBox(s,at,side*130,height+22,150,160,85,170,'#3a454a');
  localBox(s,at,side*130,height+108,150,120,10,130,'#657278');
  localBox(s,at,side*220,height+22,-220,65,150,65,'#57463e');
  // An awning follows the wall, with a lit shop threshold below it.
  localBox(s,at,-side*(width/2+40),height*.38,0,125,22,depth*.86,tile===1?'#91352f':'#175342');
  localBox(s,at,-side*(width/2+16),18,0,32,6,depth*.76,'#b99455');
  s.particle(at(-side*(width/2+68),height*.36,-depth*.3),32,'#ffd58b',.45);
  s.particle(at(-side*(width/2+68),height*.36,depth*.3),32,'#ffd58b',.45);
 }
}
export function drawNightCity(s,origin,time=0,reduced=false,track=0){
 for(let d=800;d<60000;d+=1600){const delta=courseDelta(d,origin);if(delta < -900||delta>8500)continue;
  for(const side of [-1,1]){const f=courseFrame(d,side*1.27,0,track),p=f.position;
   const at=(x,y,z)=>p.map((v,k)=>v+f.right[k]*x+f.forward[k]*z+(k===1?y:0));
   localBox(s,at,0,0,0,17,500,17,'#40545d');
   localBox(s,at,-side*30,490,0,90,20,65,'#e9c784');
   s.particle(at(-side*30,484,0),25,'#ffd58b',.58);
  }
 }
}
export function nightRoad(s,world,inView,length){
 s.layer=0;
 // Short broken specular streaks are anchored beneath shop lighting, outside the passing lanes.
 const colors=['#59c7a0','#ed7562','#d6b878','#eac78a'];
 for(let d=0;d<length;d+=1000){if(!inView(d))continue;for(const side of [-1,1]){
  const color=colors[(Math.floor(d/1000)+(side>0?3:0))%4];
  if(facades&&(facades.naturalWidth||facades.width)){
   const pts=[world(d-350,side*.99,8),world(d+350,side*.99,8),world(d+350,side*.80,8),world(d-350,side*.80,8)].map(q=>s.project(q));
   if(pts.every(Boolean))s.items.push({texture:true,img:facades,tile:(Math.floor(d/1000)+(side>0?3:0))%4,p:pts,z:pts.reduce((n,q)=>n+q[2],0)/4-1,layer:0,alpha:.10});
  }
  for(let j=0;j<6;j++){
   const z=d+j*43+80,lane=side*(.80+j*.017),wide=.022+(j%3)*.012;
   s.opacity=.12+(5-j)*.025;
   s.face([world(z,lane-wide,7),world(z+22,lane-wide,7),world(z+24,lane+wide,7),world(z+3,lane+wide,7)],color);
  }
  s.opacity=.12;s.face([world(d,side*.90,6),world(d+360,side*.92,6),world(d+390,side*.99,6),world(d+30,side*.99,6)],color);s.opacity=1;
 }}s.layer=1;
}
