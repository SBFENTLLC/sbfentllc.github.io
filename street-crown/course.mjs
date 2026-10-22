import {DISTRICTS} from "./districts.mjs";
import {routeShape} from "./routes.mjs";
// A fixed closed circuit: positions depend only on course distance, never the viewer.
const COURSE_LENGTH=60000;
const ROAD_HALF=1825; // Another 9% of driving room for the scenery-polish pass
const TAU=Math.PI*2,R=COURSE_LENGTH/TAU;
function courseFrame(distance,lane=0,height=0,track=0){const p=DISTRICTS[track]||DISTRICTS[0],t=distance/COURSE_LENGTH*TAU,a=t+track*.08,dx=R*p.sx*Math.sin(a)+p.x2*2*Math.cos(a*2),dz=R*p.sz*Math.cos(a)+p.z3*3*Math.cos(a*3),len=Math.hypot(dx,dz),y=210+p.h2*(1-Math.cos(t*2))*.5+p.h4*(1-Math.cos(t*4))*.5;const forward=[dx/len,0,dz/len],right=[forward[2],0,-forward[0]];return {position:[R*p.sx*(1-Math.cos(a))+p.x2*Math.sin(a*2)+right[0]*lane*ROAD_HALF,y+height,R*p.sz*Math.sin(a)+p.z3*Math.sin(a*3)+right[2]*lane*ROAD_HALF],right,forward,heading:Math.atan2(forward[0],forward[2])};}
function courseCurvature(distance,track=0){const p=DISTRICTS[track]||DISTRICTS[0],a=distance/COURSE_LENGTH*TAU+track*.08,dx=R*p.sx*Math.sin(a)+p.x2*2*Math.cos(a*2),dz=R*p.sz*Math.cos(a)+p.z3*3*Math.cos(a*3),ddx=R*p.sx*Math.cos(a)-p.x2*4*Math.sin(a*2),ddz=-R*p.sz*Math.sin(a)-p.z3*9*Math.sin(a*3);return (ddx*dz-dx*ddz)/(dx*dx+dz*dz)*.65;}
function racerFrame(distance,lane=0,height=0,track=0,route=null){const q=routeShape(distance,route);return courseFrame(distance,q.center+lane*q.width,height+q.height,track);}
function courseDelta(distance,origin){return ((distance-origin+COURSE_LENGTH/2)%COURSE_LENGTH+COURSE_LENGTH)%COURSE_LENGTH-COURSE_LENGTH/2;}
function courseCamera(distance,lane=0,track=0,route=null,boost=0){const q=routeShape(distance,route),worldLane=q.center+lane*q.width,me=courseFrame(distance,0,q.height,track),push=Math.max(0,Math.min(1,boost||0));return {eye:me.position.map((v,i)=>v-me.forward[i]*(2200+push*260)+me.right[i]*worldLane*ROAD_HALF+(i===1?1450+push*35:0)),target:me.position.map((v,i)=>v+me.forward[i]*1350+me.right[i]*worldLane*ROAD_HALF+(i===1?-200:0))};}
const LANDMARKS=Object.freeze([
 {distance:0,lane:-2.3,kind:'festival'}, {distance:4700,lane:2.45,kind:'waterfall'},
 {distance:8000,lane:0,kind:'tunnel'}, {distance:13800,lane:-2.2,kind:'crown'},
 {distance:19000,lane:2.25,kind:'lowrider'}, {distance:26000,lane:-2.6,kind:'waterfall'},
 {distance:30000,lane:0,kind:'tunnel'}, {distance:35500,lane:2.4,kind:'festival'},
 {distance:42000,lane:-2.2,kind:'crown'}, {distance:48500,lane:2.35,kind:'lowrider'},
 {distance:54000,lane:-2.4,kind:'waterfall'}
]);
const COURSE_OBSTACLES=Object.freeze([
 {z:4200,x:-.58,width:.16,type:'cones',destructible:true}, {z:6200,x:.34,width:.18,type:'puddle'},
 {z:8600,x:-.18,width:.24,type:'mud'}, {z:11300,x:.52,width:.2,type:'barrels'},
 {z:15150,x:0,width:.23,type:'barrels'}, {z:18400,x:-.48,width:.2,type:'slime'},
 {z:21800,x:0,width:.2,type:'sweeper',phase:1}, {z:24600,x:.28,width:.18,type:'signs',destructible:true},
 {z:28200,x:-.5,width:.2,type:'barrels'}, {z:31800,x:0,width:.22,type:'traffic',phase:2},
 {z:36500,x:.55,width:.18,type:'cones',destructible:true}, {z:39800,x:-.28,width:.22,type:'puddle'},
 {z:43200,x:.45,width:.2,type:'barrels'}, {z:46200,x:.36,width:.22,type:'mud'},
 {z:49100,x:0,width:.2,type:'sweeper',phase:3}, {z:52000,x:0,width:.22,type:'traffic',phase:5},
 {z:54600,x:-.3,width:.17,type:'cones',destructible:true}, {z:57100,x:.42,width:.2,type:'slime'},
 {z:2800,x:.44,width:.14,type:'cones',destructible:true}, {z:13200,x:-.5,width:.16,type:'signs',destructible:true},
 {z:19900,x:.48,width:.17,type:'puddle'}, {z:26000,x:-.52,width:.15,type:'cones',destructible:true},
 {z:34200,x:-.48,width:.17,type:'mud'}, {z:41200,x:.5,width:.16,type:'signs',destructible:true},
 {z:55800,x:-.52,width:.15,type:'cones',destructible:true}, {z:58900,x:.48,width:.16,type:'puddle'},
 {z:28300,x:.48,width:.18,type:'freight',track:2}
]);
const obstacleLane=(o,time)=>o.type==='sweeper'?Math.sin(time*.9+o.phase)*.58:o.type==='traffic'?Math.sin(time*.42+(o.phase||0))*.62:o.x;

export {COURSE_LENGTH,ROAD_HALF,courseFrame,courseCurvature,racerFrame,courseCamera,courseDelta,LANDMARKS,COURSE_OBSTACLES,obstacleLane};
