// Transient chase state never replaces campaign catches, IDs, wallet or saved position.
export const LIZARD_TYPES=Object.freeze([
 {id:0,name:'Gold Rush',color:'#f1ca72',rank:1,notice:4.2,speed:1.8,pattern:'straight',hint:'Easy to approach. A gentle straight-line escape.'},
 {id:1,name:'Violet Vibe',color:'#c68cff',rank:4,notice:5.6,speed:2.5,pattern:'zigzag',hint:'Changes lanes. Cut across the zigzag.'},
 {id:2,name:'Red Runner',color:'#ff7777',rank:5,notice:6,speed:2.85,pattern:'straight',hint:'A quick straight-line runner. Use RUN.'},
 {id:3,name:'Pink Spark',color:'#ff81c8',rank:2,notice:4.8,speed:2.05,pattern:'bounce',hint:'Playful little jukes. Stay close.'},
 {id:4,name:'Blue Blitz',color:'#80bfff',rank:6,notice:6.6,speed:3.1,pattern:'burst',hint:'Short bursts of speed. Catch the recovery.'},
 {id:5,name:'Emerald Slide',color:'#79dbad',rank:3,notice:5.2,speed:2.25,pattern:'arc',hint:'Curves away. Take the inside line.'},
 {id:6,name:'Orange Flash',color:'#ffb15f',rank:7,notice:7,speed:3.35,pattern:'feint',hint:'Fakes left and goes right. Read the turn.'},
 {id:7,name:'Ice Switch',color:'#7bf0f0',rank:8,notice:7.3,speed:3.55,pattern:'switch',hint:'Sharp switches between steady runs.'},
 {id:8,name:'Onyx Gold',color:'#d9b866',rank:9,notice:7.7,speed:3.8,pattern:'double',hint:'Early warning and double jukes. Close carefully.'},
 {id:9,name:'Platinum Crown',color:'#e2e8f8',rank:10,notice:8,speed:4,pattern:'crown',hint:'Rare burst-and-juke runner. Plan the intercept.'}
].map(Object.freeze));
const ORDER=[0,3,5,1,2,4,6,7,8,9];
export const lizardType=t=>LIZARD_TYPES[t.type??t.id%10]||LIZARD_TYPES[0];
export function typeForSpawn(id,{kind='regular',level=1,location=0,sweep=1}={}){if(kind!=='story')return (id+(sweep-1)*5+location*2)%10;const count=Math.min(10,3+Math.floor((level-1)*.78)+location);return ORDER[(id+location+level)%count];}
export function clearSight(a,b,blocked){const distance=Math.hypot(a.x-b.x,a.z-b.z),steps=Math.ceil(distance/.45);for(let i=1;i<steps;i++)if(blocked(a.x+(b.x-a.x)*i/steps,a.z+(b.z-a.z)*i/steps))return false;return true;}
function escapeGoal(t,player,blocked,radius){let best=null;for(let i=0;i<16;i++){const angle=i*Math.PI/8+(t.id||0)*.19,distance=i%2?2.3:4.3,x=t.x+Math.cos(angle)*distance,z=t.z+Math.sin(angle)*distance;if(blocked(x,z)||Math.hypot(x-t.homeX,z-t.homeZ)>radius||!clearSight(t,{x,z},blocked))continue;const cover=!clearSight(player,{x,z},blocked),score=Math.hypot(x-player.x,z-player.z)+(cover?3:0);if(!best||score>best.score)best={x,z,score};}return best;}
export function stepLizard(t,dt,player,blocked,{speed=.65,roam=1,level=1,inside=false}={}){
 dt=Math.max(0,Math.min(.25,Number(dt)||0));if(dt>1/30){const steps=Math.ceil(dt/(1/30));for(let i=0;i<steps;i++)stepLizard(t,dt/steps,player,blocked,{speed,roam,level,inside});return t;}
 const style=lizardType(t),gap=Math.hypot(t.x-player.x,t.z-player.z);t.clock=(t.clock||0)+dt;t.sightClock=(t.sightClock||0)-dt;if(t.sightClock<=0){t.seen=clearSight(player,t,blocked);t.sightClock=.12;}
 t.alert=Math.max(0,(t.alert||0)-dt);if(gap<Math.min(style.notice,inside?5.5:style.notice)&&t.seen)t.alert=1.5;t.running=t.alert>0;
 const radius=Math.max(roam,t.running?(inside?4.2:6.4)+style.rank*.12:1.3),home=Math.hypot(t.x-t.homeX,t.z-t.homeZ),phase=t.clock+(t.id||0)*.71;
 t.hidden=style.rank>=4&&t.running&&!t.seen&&gap>2.6;t.coverTime=t.hidden?(t.coverTime||0)+dt:0;
 if(t.hidden&&t.coverTime<.85){t.moving=false;return t;}
 let desired=t.angle;if(home>radius*.9)desired=Math.atan2(t.homeZ-t.z,t.homeX-t.x);else if(t.running){
  t.routeClock=(t.routeClock||0)-dt;if(style.rank>=4&&t.routeClock<=0){t.escapeGoal=escapeGoal(t,player,blocked,radius);t.routeClock=1.3+style.rank*.06;}
  if(t.escapeGoal&&Math.hypot(t.escapeGoal.x-t.x,t.escapeGoal.z-t.z)> .5)desired=Math.atan2(t.escapeGoal.z-t.z,t.escapeGoal.x-t.x);else desired=Math.atan2(t.z-player.z,t.x-player.x);
  const wobble=style.pattern==='zigzag'?Math.sin(phase*3)*.45:style.pattern==='bounce'?Math.sin(phase*2)*.2:style.pattern==='arc'?.3:style.pattern==='feint'?(Math.sin(phase*2.8)>.5?.6:-.25):style.pattern==='switch'?Math.sign(Math.sin(phase*2))*.45:style.pattern==='double'?Math.sin(phase*3)*.4+Math.sin(phase*6)*.15:style.pattern==='crown'?Math.sin(phase*3.7)*.45:0;desired+=wobble;
 }
 const turn=Math.atan2(Math.sin(desired-t.angle),Math.cos(desired-t.angle));t.angle+=Math.max(-dt*5,Math.min(dt*5,turn));
 const burst=['burst','crown'].includes(style.pattern)&&phase%3.2<.65?1.16:1,pace=t.running?Math.min(4.8,(style.speed+Math.max(0,level-1)*.025)*burst):Math.min(1.2,speed)*(style.rank>5?1.1:1);
 let moved=0;for(const offset of [0,.55,-.55,1.1,-1.1,Math.PI]){const a=t.angle+offset,x=t.x+Math.cos(a)*dt*pace,z=t.z+Math.sin(a)*dt*pace;if(blocked(x,z)||Math.hypot(x-t.homeX,z-t.homeZ)>radius+.15)continue;moved=Math.hypot(x-t.x,z-t.z);t.x=x;t.z=z;t.angle=a;break;}
 t.stride=(t.stride||0)+moved*(t.running?3.7:3.2);t.moving=moved>.0001;return t;
}
export function lizardFrame(t,reduced=false,discovered=false){if(discovered)return 3;if(reduced||!t.moving)return 0;return [1,0,2,0][Math.floor((t.stride||0)*2)%4];}
