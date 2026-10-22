import {ACTIVE_ROUTES,routeShape} from './routes.mjs';
export const SURFACE_BANDS=[{from:1,to:1.18,height:-2,color:'#454b4e'},{from:1.18,to:1.46,height:-8,color:'#ad9c7c'},{from:1.46,to:2.8,color:'#6d8454'},{from:2.8,to:5.2,color:'#748a59'}];
export function terrainHeight(distance,lane){let y=-24;for(const r of ACTIVE_ROUTES){if(r.side*Math.sign(lane)<=0)continue;const q=routeShape(distance,r.id),gap=Math.max(0,Math.abs(lane-q.center)-q.width),weight=Math.max(0,1-gap/.6);if(q.blend>0)y=Math.min(y,-24+Math.min(0,q.height)*weight);}return y;}
export const branchOpening=(distance,side)=>ACTIVE_ROUTES.some(r=>r.side===side&&distance>=r.start-350&&distance<=r.end+350);
export function drawRoadSurroundings(s,world,inView,length=60000,track=0){
 const grass=[['#6d8454','#748a59'],['#304e52','#2a4449'],['#7b785c','#918361'],['#718779','#819986'],['#70a887','#89b596'],['#585176','#6a6087']][track]||['#6d8454','#748a59'];
 s.layer=-1;for(let d=0;d<length;d+=300){if(!inView(d))continue;for(const side of [-1,1])for(const b of SURFACE_BANDS){const a=side*b.from,z=side*b.to,h=(dist,l)=>b.height??terrainHeight(dist,l);s.face([world(d,a,h(d,a)),world(d+300,a,h(d+300,a)),world(d+300,z,h(d+300,z)),world(d,z,h(d,z))],b.from>=1.46?grass[b.from===1.46?0:1]:b.color);}
 }
 s.layer=0;for(let d=0;d<length;d+=300){if(!inView(d))continue;for(const side of [-1,1]){if(branchOpening(d,side))continue;const a=side*1.185,b=side*1.205;s.face([world(d,a,-2),world(d+300,a,-2),world(d+300,a,15),world(d,a,15)],'#d1c7ad');s.face([world(d,a,15),world(d+300,a,15),world(d+300,b,15),world(d,b,15)],'#ded5bf');for(let z=d;z<d+300;z+=100)s.face([world(z,b+.001*side,-5),world(z+3,b+.001*side,-5),world(z+3,side*1.46,-5),world(z,side*1.46,-5)],'#938a74');}}
}
