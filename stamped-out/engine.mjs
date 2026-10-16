// Deterministic combat model. Joint sequences own both fighters until they
// finish; presentation never awards damage or chooses a winner.
import {PROTOTYPE,moveFor,SUPER_SEQUENCES,THROW_SEQUENCE,FIGHTERS} from './roster.mjs';
export const MOVES=PROTOTYPE[0].moves;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class Fight {
 constructor({difficulty='medium',training=false,dummy='stand',characters=[0,1],random=Math.random}={}){
  this.characters=[0,1].map((slot)=>Number.isInteger(characters?.[slot])&&FIGHTERS[characters[slot]]?characters[slot]:slot);
  Object.assign(this,{difficulty,training,dummy,random,wins:[0,0],round:1,events:[]});this.resetRound();
 }
 resetRound(){this.fighters=[this.makeFighter(0,280),this.makeFighter(1,720)];this.sequence=null;this.projectiles=[];this.lastFinisher=null;this.timer=60;this.phase='intro';this.phaseTime=1.6;this.aiTime=.6;this.events.push({type:'round',round:this.round});}
 makeFighter(id,x){return{id,character:this.characters[id],x,y:0,vy:0,hp:100,power:this.training?100:0,face:id===0?1:-1,move:null,stun:0,cooldown:0,block:false,crouch:false,walking:false,combo:0,comboTime:0,knockdown:0,throwImmune:0,buffer:null,jumpHeld:false,chain:0,guardHeld:false,guardWindow:0,guardCooldown:0,counterReady:0,dashCooldown:0,lowGuard:false};}
 // One recent tap survives the tail of recovery; a held button never repeats.
 queueAttack(id,name,options={}){
  if(this.attack(id,name,options))return true;
  const f=this.fighters[id];if(!f||!moveFor(f.character,name)||this.phase!=='fight'||this.sequence||name==='special'&&f.power<100)return false;
  f.buffer={name,options,ttl:.16};return false;
 }
 attack(id,name,{direction}={}){
  const f=this.fighters[id],m=moveFor(f?.character,name);if(!f||!m||this.phase!=='fight')return false;
  if(this.sequence){if(name==='grab'&&this.sequence.kind==='throw'&&this.sequence.target===id&&this.sequence.elapsed<=THROW_SEQUENCE.escapeWindow){this.escapeThrow();return true;}return false;}
  // Flex confirms fast hands into a kick. Bootlegger confirms a kick into
  // a punch. Whiffs and blocked hits must complete their recovery.
  const cancel=!!f.move&&f.move.connected&&f.move.t>=(f.move.wind??moveFor(f.character,f.move.name).wind)+moveFor(f.character,f.move.name).active*.35&&f.chain<(FIGHTERS[f.character].maxCancels??2)&&
   FIGHTERS[f.character].cancels[f.move.name]?.includes(name);
  const counter=f.character===5&&name==='punch'&&f.counterReady>0;
  if(f.move&&!cancel||f.stun>0||f.cooldown>0||f.knockdown>0||(f.block&&name!=='grab'&&!counter))return false;
  if(name==='grab'&&f.y>8)return false;
  if(name==='special'&&f.power<100){this.events.push({type:'empty',id});return false;}
  if(name==='special'){f.power=0;this.events.push({type:'super',id});}
  if(name==='grab')f.block=false;
  f.chain=cancel?f.chain+1:0;f.buffer=null;if(!cancel){f.combo=0;f.comboTime=0;}
  if(counter){f.counterReady=0;f.block=false;}
  const dash=f.character===8&&name==='punch'&&f.y<8&&f.dashCooldown<=0&&(direction===-1||direction===1),rush=f.character===11&&name==='punch'&&f.y<8;if(dash)f.dashCooldown=.95;
  f.move={name,t:0,counter,dash,rush,travel:0,direction:dash?direction:f.face,wind:counter?.065:dash?.14:m.wind*(cancel?.55:1),hit:false,connected:false,throwDirection:direction===-1?-1:direction===1?1:f.face};return true;
 }
 beginSequence(kind,id,direction=this.fighters[id].face){
  const actor=this.fighters[id],target=this.fighters[1-id],center=clamp((actor.x+target.x)/2,250,750);
  this.projectiles=[];this.sequence={kind,id,character:actor.character,target:1-id,face:direction,elapsed:0,duration:kind==='super'?SUPER_SEQUENCES[actor.character].duration:THROW_SEQUENCE.duration,beat:0,center,origin:[{x:actor.x,y:actor.y},{x:target.x,y:target.y}],tech:kind==='throw'&&id===0&&!this.training&&this.random()<({easy:.08,medium:.25,hard:.45}[this.difficulty]||.25)};
  for(const f of [actor,target]){f.move=null;f.buffer=null;f.counterReady=0;f.guardWindow=0;f.block=false;f.crouch=false;f.walking=false;f.y=0;f.vy=0;}
  this.events.push({type:kind==='super'?'superConnected':'grabbed',id,target:1-id});
 }
 escapeThrow(){
  const s=this.sequence;if(!s||s.kind!=='throw')return;
  const a=this.fighters[s.id],b=this.fighters[s.target];a.x=clamp(s.center-s.face*65,75,925);b.x=clamp(s.center+s.face*65,75,925);
  a.cooldown=.35;b.cooldown=.12;b.throwImmune=.9;this.sequence=null;this.events.push({type:'throwEscape',id:s.target});
 }
 applyHit(id,damage,{move='punch',blocked=false,sequence=false,final=false,face=this.fighters[id].face}={}){
  const a=this.fighters[id],b=this.fighters[1-id],parry=blocked&&!sequence&&b.character===5&&b.guardWindow>0&&(move==='punch'||move==='kick'),actual=parry?0:blocked?Math.ceil(damage*(b.character===7?.06:.12)):damage;
  if(parry){b.counterReady=.5;b.guardWindow=0;}
  const before=b.hp;b.hp=clamp(b.hp-actual,sequence&&!final?1:0,100);
  const counter=!blocked&&!sequence&&!!b.move&&!b.move.hit;
  const punish=!blocked&&!sequence&&(!!b.move&&b.move.hit||b.cooldown>0);
  if(!blocked){b.move=null;b.buffer=null;b.counterReady=0;b.guardWindow=0;b.chain=0;b.combo=0;b.comboTime=0;}else{a.combo=0;a.comboTime=0;}
  b.stun=parry?.02:blocked?.09:move==='kick'?.24:.18;
  if(!blocked&&!sequence&&a.character===10&&move==='kick'&&a.y<8){b.stun=.42;b.knockdown=.42;b.throwImmune=.9;}if(!sequence)b.x=clamp(b.x+face*(blocked?(b.character===7?5:9):move==='kick'?(a.character===9?42:28):a.character===11?8:16),75,925);
  a.power=clamp(a.power+(move==='special'?0:blocked?4:15),0,100);b.power=clamp(b.power+(parry?18:9),0,100);
  if(!blocked){a.combo++;a.comboTime=1.2;}
  if(a.character===2&&move==='kick'&&!sequence&&a.y===0)a.x=clamp(a.x-a.face*22,75,925);
  this.events.push({type:blocked?'block':'hit',id,target:1-id,x:b.x,y:b.y,face,move,damage:before-b.hp,combo:a.combo,sequence,final,counter,punish,parry});
 }
 finishSequence(){
  const s=this.sequence;if(!s)return;const a=this.fighters[s.id],b=this.fighters[s.target];
  a.x=clamp(s.center-s.face*80,75,925);b.x=clamp(s.center+s.face*(s.character===9&&s.kind==='throw'?125:175),75,925);a.face=s.face;b.face=-s.face;
  this.lastFinisher=s.kind;a.cooldown=s.kind==='throw'?(s.character===9?.42:.28):.36;b.stun=.65;b.knockdown=.65;b.throwImmune=1.25;this.sequence=null;
 }
 stepSequence(dt){
  const s=this.sequence;s.elapsed+=dt;
  if(s.tech&&s.elapsed>=.16&&s.elapsed<=THROW_SEQUENCE.escapeWindow){this.escapeThrow();return;}
  const beats=s.kind==='super'?SUPER_SEQUENCES[s.character].beats:[{at:THROW_SEQUENCE.impactAt,damage:moveFor(s.character,'grab').damage}];
  while(s.beat<beats.length&&s.elapsed>=beats[s.beat].at){
   const final=s.beat===beats.length-1;this.applyHit(s.id,beats[s.beat].damage,{move:s.kind==='super'?'special':'throw',sequence:true,final});s.beat++;
   if(final&&this.fighters[s.target].hp<=0){s.knockoutPending=true;this.events.push({type:'koImpact',id:s.id,target:s.target});}
  }
  if(s.elapsed>=s.duration){this.finishSequence();this.endRound();}
 }
 aiInput(){
  const a=this.fighters[0],b=this.fighters[1],d=Math.abs(a.x-b.x),toward=a.x<b.x?-1:1;
  const desired=this.difficulty==='easy'?116:[105,155,155,130,100,115,260,132,130,112,160,105][b.character],ai={left:d>desired&&toward<0,right:d>desired&&toward>0,block:!!a.move&&d<190&&this.difficulty!=='easy'&&this.aiTime<.12};
  ai.crouch=ai.block&&a.character===10&&a.move?.name==='kick'&&a.y<8;
  if(b.character===6&&d<155){ai.left=toward>0;ai.right=toward<0;}
  if(b.character===11&&b.move?.name==='punch'&&b.move.connected&&this.difficulty!=='easy')this.attack(1,'punch');
  if(b.character===5&&b.counterReady>0&&d<=140)this.attack(1,'punch');
  if(this.aiTime<=0){
   this.aiTime=({easy:.85,medium:.48,hard:.29}[this.difficulty]||.48)+this.random()*.35;
   if(a.y>60&&this.random()<.3||b.character===3&&d<250&&this.random()<.45)ai.jump=true;
   if(d<=moveFor(b.character,'grab').range&&a.y<8&&(a.block||this.random()<(b.character===9?.6:.25)))this.attack(1,'grab');
   else if(b.power>=100&&d<=moveFor(b.character,'special').range)this.attack(1,'special');
   else if(b.character===8&&d>120&&d<230&&b.dashCooldown<=0)this.attack(1,'punch',{direction:toward});
   else if(b.character===6&&d<=480)this.attack(1,'kick');
   else if(d<=moveFor(b.character,'kick').range)this.attack(1,d>moveFor(b.character,'punch').range||this.random()>.48?'kick':'punch');
  }
  return ai;
 }
 step(dt,input={}){
  if(!Number.isFinite(dt)||dt<=0||this.phase==='done')return;dt=Math.min(dt,.05);
  if(this.phase==='intro'||this.phase==='roundover'){
   this.phaseTime-=dt;if(this.phaseTime<=0){if(this.phase==='intro'){this.phase='fight';this.events.push({type:'fight'});}else{this.round++;this.resetRound();}}return;
  }
  if(this.sequence){this.stepSequence(dt);return;}
  this.lastFinisher=null;this.timer=Math.max(0,this.timer-dt);this.aiTime-=dt;
  if(this.training&&this.dummy==='jab'&&this.aiTime<=0){this.aiTime=1.15;if(Math.abs(this.fighters[0].x-this.fighters[1].x)<=moveFor(this.fighters[1].character,'punch').range)this.attack(1,'punch');}
  const keys=[input,this.training?{block:this.dummy==='guard'||this.dummy==='lowguard',crouch:this.dummy==='lowguard',jump:this.dummy==='jump'&&this.fighters[1].y===0}:this.aiInput()];
  // Resolve guard for both sides before either strike, avoiding player-order
  // advantage when a block and contact land on the same simulation step.
  for(let i=0;i<2;i++){const f=this.fighters[i];f.dashCooldown=Math.max(0,f.dashCooldown-dt);f.guardWindow=Math.max(0,f.guardWindow-dt);f.guardCooldown=Math.max(0,f.guardCooldown-dt);f.counterReady=Math.max(0,f.counterReady-dt);if(keys[i].block&&!f.guardHeld&&f.character===5&&f.guardCooldown<=0&&f.stun<=dt&&f.knockdown<=dt&&f.y===0&&!f.move){f.guardWindow=.14;f.guardCooldown=.45;}f.guardHeld=!!keys[i].block;f.block=!!keys[i].block&&!f.move&&f.stun<=dt&&f.knockdown<=dt&&f.y===0;f.lowGuard=f.block&&!!keys[i].crouch;}
  for(let i=0;i<2;i++){
   const f=this.fighters[i],other=this.fighters[1-i],key=keys[i];f.face=other.x>=f.x?1:-1;
   f.stun=Math.max(0,f.stun-dt);f.cooldown=Math.max(0,f.cooldown-dt);f.knockdown=Math.max(0,f.knockdown-dt);f.throwImmune=Math.max(0,f.throwImmune-dt);f.comboTime-=dt;if(f.comboTime<=0)f.combo=0;
   f.crouch=!!key.crouch&&f.y===0&&!f.move;f.walking=false;
   if(f.buffer){f.buffer.ttl-=dt;if(f.buffer.ttl<=0)f.buffer=null;else this.attack(i,f.buffer.name,f.buffer.options);}
   if(!f.move&&!f.block&&!f.crouch&&f.stun<=0&&f.knockdown<=0){const direction=(key.right?1:0)-(key.left?1:0);f.x=clamp(f.x+direction*(direction===-f.face?PROTOTYPE[f.character].backSpeed??PROTOTYPE[f.character].speed:PROTOTYPE[f.character].speed)*(f.y>0?PROTOTYPE[f.character].airSpeed??1:1)*dt,75,925);f.walking=direction!==0;if(key.jump&&!f.jumpHeld&&f.y===0)f.vy=PROTOTYPE[f.character].jump;}
   f.jumpHeld=!!key.jump;
   const wasAir=f.y>0;f.y=Math.max(0,f.y+f.vy*dt);if(f.y>0||f.vy>0)f.vy-=1800*dt;if(f.y===0&&f.vy<0)f.vy=0;if(wasAir&&f.y===0&&f.character===3){f.cooldown=Math.max(f.cooldown,.16);f.move=null;f.chain=0;}
   if(f.move){
    f.move.t+=dt;const move=f.move,m=moveFor(f.character,move.name);
    if((move.dash&&move.t<=.16||move.rush&&move.t<=.13)&&f.y<8){const delta=Math.min((move.dash?650:200)*dt,(move.dash?104:26)-move.travel);let next=f.x+move.direction*delta;if((other.x-f.x)*move.direction>0)next=move.direction>0?Math.min(next,other.x-86):Math.max(next,other.x+86);f.x=clamp(next,75,925);move.travel+=delta;}
    if(move.t>=(move.wind??m.wind)&&!move.hit){
     move.hit=true;const distance=(other.x-f.x)*f.face,vertical=Math.abs(f.y-other.y),inRange=distance>=0&&distance<=(move.counter?140:m.range);
     if(f.character===6&&move.name==='kick'&&f.y<8){
      if(!this.projectiles.some(p=>p.id===i)){this.projectiles.push({id:i,x:f.x+f.face*45,y:150,face:f.face,travel:0});this.events.push({type:'wave',id:i});}
     }else if(move.name==='grab'){
      if(inRange&&f.y<8&&other.y<8&&other.knockdown<=0&&other.throwImmune<=0){this.beginSequence('throw',i,move.throwDirection);return;}
      this.events.push({type:'grabMiss',id:i});
     }else if(inRange&&vertical<(f.character===10&&move.name==='kick'&&f.y<8?45:100)){
      if(move.name==='special'&&!other.block&&other.knockdown<=0){this.beginSequence('super',i);return;}
      if(other.knockdown<=0){move.connected=!other.block;this.applyHit(i,move.counter?18:m.damage,{move:move.name,blocked:other.block&&!(f.character===10&&move.name==='kick'&&f.y<8&&!other.lowGuard)});}
     }
    }
    if(move.t>=(move.wind??m.wind)+m.active+(move.counter?.48:move.dash?.36:m.recovery)){f.move=null;f.cooldown=.04;}
   }
   if(this.training)f.power=100;
  }
  const [a,b]=this.fighters;
  if(Math.abs(a.x-b.x)<86&&Math.abs(a.y-b.y)<80){const sign=a.x<b.x?1:-1,overlap=(86-Math.abs(a.x-b.x))/2;a.x=clamp(a.x-sign*overlap,75,925);b.x=clamp(b.x+sign*overlap,75,925);}
  this.stepProjectiles(dt);this.endRound();
 }
 stepProjectiles(dt){
  for(const p of this.projectiles){const before=p.x;p.x+=p.face*650*dt;p.travel+=650*dt;const b=this.fighters[1-p.id];
   if(b.knockdown<=0&&Math.abs(p.y-(b.y+150))<80&&b.x>=Math.min(before,p.x)-32&&b.x<=Math.max(before,p.x)+32){this.applyHit(p.id,9,{move:'wave',blocked:b.block,face:p.face});p.dead=true;}
   if(p.travel>=440||p.x<25||p.x>975)p.dead=true;
  }
  if(this.projectiles.length===2){const [a,b]=this.projectiles;if(!a.dead&&!b.dead&&a.id!==b.id&&Math.abs(a.x-b.x)<28){a.dead=b.dead=true;this.events.push({type:'waveClash',x:(a.x+b.x)/2,y:150});}}
  this.projectiles=this.projectiles.filter(p=>!p.dead);
 }
 endRound(){
  const [a,b]=this.fighters;if(this.phase!=='fight'||(a.hp>0&&b.hp>0&&this.timer>0))return;
  const winner=a.hp===b.hp?-1:a.hp>b.hp?0:1;if(winner>=0)this.wins[winner]++;
  const done=this.wins.some(w=>w>=2);this.projectiles=[];this.phase=done?'done':'roundover';this.phaseTime=2.8;
  this.events.push({finisher:this.lastFinisher,type:done?'matchover':'roundover',winner,knockout:a.hp<=0||b.hp<=0});
 }
 drainEvents(){return this.events.splice(0);}
}
