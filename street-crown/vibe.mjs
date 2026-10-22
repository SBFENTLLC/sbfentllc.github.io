import {flightHeight} from "./flight.mjs";
import {driverPose} from "./personality.mjs";
import {effectFor} from "./racer-fx.mjs";
import {racerFrame} from "./course.mjs";
const states=new WeakMap();
function vibeFor(race){let state=states.get(race);if(!state){state=new RaceVibe();states.set(race,state);}return state;}
class RaceVibe{
 constructor(){this.cameraBoost=0;this.gestures=new Map();this.clock=0;this.last=null;this.next=0;this.particles=[];this.marks=[];this.pops=[];this.landings=new Map();this.air=new Map();this.seed=103;}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 emit(position,{color='#f1d18c',life=.6,size=30,velocity=[0,70,0],ring=false,shape=null}={}){this.particles.push({p:[...position],v:velocity,color,life,total:life,size,ring:ring||shape==='ring',shape});if(this.particles.length>100)this.particles.shift();}
 event(e,race){const poseId=e.type==='rivalPass'?(e.kind==='overtaken'?e.racer:0):e.id??0;if(['ramp','nearMiss','driftBoost','rivalPass','practiceComplete','flight'].includes(e.type))this.gestures.set(poseId,{type:e.type,at:race.time});const r=race.racers[e.id??0];if(!r)return;const at=racerFrame(r.distance,r.x,65,race.track,r.route).position;if(['pickup','driftBoost','blocked','hit','ramp','finish','coin','attack','defense','juiceBoost','momentEnd','flight'].includes(e.type)){this.pops.push({type:e.type,at:race.time,id:r.id});this.pops=this.pops.slice(-16);const theme=effectFor(r.char),color=e.type==='hit'?'#ff9e89':theme.color;for(let n=0;n<10;n++){const a=n/10*Math.PI*2;this.emit(at,{color,shape:theme.shape,size:24,life:.55,velocity:[Math.cos(a)*250,100+this.random()*180,Math.sin(a)*250]});}}}
 step(race,reduced=false){const now=race.time;if(this.last===null)this.last=now;const dt=Math.max(0,Math.min(.1,now-this.last));this.last=now;this.clock=now;const target=race.player.nitro?1:Math.min(1,(race.player.boost||0)/2);this.cameraBoost=reduced?0:this.cameraBoost+(target-this.cameraBoost)*Math.min(1,dt*5);for(const p of this.particles){p.life-=dt;for(let i=0;i<3;i++)p.p[i]+=p.v[i]*dt;}this.particles=this.particles.filter(p=>p.life>0);this.marks=this.marks.filter(m=>now-m.at<3); this.pops=this.pops.filter(p=>now-p.at<.8);
  for(const r of race.racers){if((this.air.get(r.id)||0)>0&&r.air<=0){this.landings.set(r.id,now);if(!reduced)for(let n=0;n<12;n++){const a=n/12*Math.PI*2;this.emit(racerFrame(r.distance,r.x,10,race.track,r.route).position,{color:'#e9d3ac',size:25,life:.45,velocity:[Math.cos(a)*380,20,Math.sin(a)*380],ring:true});}}this.air.set(r.id,r.air);}
  if(reduced){this.particles=[];this.marks=[];return;}if(dt<=0||now<this.next||race.phase!=='racing')return;this.next=now+.055;
  for(const r of race.racers){if(r.rescue>0)continue;const frame=racerFrame(r.distance,r.x,35,race.track,r.route);if(r.drifting){for(const side of [-1,1]){const points=[[-12,0],[12,0],[12,-80],[-12,-80]].map(([x,z])=>frame.position.map((v,i)=>v+frame.right[i]*(side*105+x)+frame.forward[i]*(z-110)+(i===1?-30:0)));this.marks.push({at:now,points});}this.marks=this.marks.slice(-96);}if(r.drifting||r.spin>0){const smoke=(r.cosmetics||[]).includes('smoke-bluefire')?'#4dc7ff':(r.cosmetics||[]).includes('smoke-gold')?'#f2c85f':'#d8d9dd';for(const side of [-1,1]){const pos=frame.position.map((v,i)=>v-frame.forward[i]*160+frame.right[i]*side*125);this.emit(pos,{color:smoke,size:30,life:.55,velocity:frame.forward.map((v,i)=>-v*80+(i===1?95:0))});if(r.drift>.55)this.emit(pos,{color:r.drift>1.8?'#e3a3ff':'#ffd16a',size:10,life:.3,velocity:frame.right.map((v,i)=>v*side*210+(i===1?75:0))});}}
   if(r.boost>0||r.nitro||r.air>0){const theme=effectFor(r.char);if(r.air>0)frame.position[1]+=r.flight?flightHeight(r):220*Math.min(1,r.air/(r.airTotal||1.1))+Math.sin(Math.min(1,r.air/(r.airTotal||1.1))*Math.PI)*430;for(const side of [-1,1])this.emit(frame.position.map((v,i)=>v-frame.forward[i]*180+frame.right[i]*side*65),{color:this.random()>.5?theme.color:theme.accent,shape:theme.shape,ring:theme.shape==='ring',size:r.air>0?22:25,life:.35,velocity:frame.forward.map(v=>-v*300)});}
  }
 }
 pose(r,reduced=false){return driverPose(r,this.clock,this.gestures.get(r.id),reduced);}
 landingScale(id){const age=this.clock-(this.landings.get(id)??-100);return age<.35?1-Math.sin(age/.35*Math.PI)*.1:1;}
}

export {vibeFor,RaceVibe};
