// Pure combat simulation. Pixels and seconds; rendering and input live in game.js.
import {PROTOTYPE,moveFor} from "./roster.mjs";
export const MOVES=PROTOTYPE[0].moves;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class Fight {
 constructor({difficulty='medium',training=false,random=Math.random}={}){this.difficulty=difficulty;this.training=training;this.random=random;this.wins=[0,0];this.round=1;this.events=[];this.resetRound();}
 resetRound(){this.fighters=[this.makeFighter(0,280),this.makeFighter(1,720)];this.timer=60;this.phase='intro';this.phaseTime=1.6;this.aiTime=.6;this.events.push({type:'round',round:this.round});}
 makeFighter(id,x){return{id,x,y:0,vy:0,hp:100,power:this.training?100:0,face:id===0?1:-1,move:null,stun:0,cooldown:0,block:false,crouch:false,walking:false,combo:0,comboTime:0};}
 attack(id,name){const f=this.fighters[id],m=moveFor(id,name);if(!m||this.phase!=='fight'||f.move||f.stun>0||f.cooldown>0||f.block)return false;if(name==='special'&&f.power<100){this.events.push({type:'empty',id});return false;}if(name==='special'){f.power=0;this.events.push({type:'super',id});}f.move={name,t:0,hit:false,hitsDone:0};return true;}
 step(dt,input={}){if(!Number.isFinite(dt)||dt<=0||this.phase==='done')return;dt=Math.min(dt,.05);this.phaseTime-=dt;if(this.phase==='intro'){if(this.phaseTime<=0){this.phase='fight';this.events.push({type:'fight'});}return;}if(this.phase==='roundover'){if(this.phaseTime<=0){this.round++;this.resetRound();}return;}
 const a=this.fighters[0],b=this.fighters[1];
 this.timer=Math.max(0,this.timer-dt);this.aiTime-=dt;
 const ai={};if(!this.training){const d=Math.abs(a.x-b.x);const toward=a.x<b.x?-1:1;const desired=this.difficulty==='easy'?116:155;ai.left=d>desired&&toward<0;ai.right=d>desired&&toward>0;ai.block=!!a.move&&d<190&&this.difficulty!=='easy'&&this.aiTime<.12;
 if(this.aiTime<=0){this.aiTime=({easy:.85,medium:.48,hard:.29}[this.difficulty]||.48)+this.random()*.35;if(a.y>60&&this.random()<.3)ai.jump=true;if(d<180){this.attack(1,b.power>=100&&d>125?'special':d>moveFor(1,'punch').range||this.random()>.48?'kick':'punch');}else if(b.power>=100&&d<310)this.attack(1,'special');}}
 [input,ai].forEach((keys,i)=>{const f=this.fighters[i],other=this.fighters[1-i];f.face=other.x>=f.x?1:-1;f.stun=Math.max(0,f.stun-dt);f.cooldown=Math.max(0,f.cooldown-dt);f.comboTime-=dt;if(f.comboTime<=0)f.combo=0;f.block=!!keys.block&&!f.move&&f.stun<=0&&f.y===0;f.crouch=!!keys.crouch&&f.y===0&&!f.move&&!f.block;f.walking=false;
 if(!f.move&&!f.block&&!f.crouch&&f.stun<=0){const direction=(keys.right?1:0)-(keys.left?1:0);f.x=clamp(f.x+direction*PROTOTYPE[i].speed*dt,75,925);f.walking=direction!==0;if(keys.jump&&f.y===0)f.vy=PROTOTYPE[i].jump;}
 f.y=Math.max(0,f.y+f.vy*dt);if(f.y>0||f.vy>0)f.vy-=1800*dt;if(f.y===0&&f.vy<0)f.vy=0;
 if(f.move){f.move.t+=dt;const m=moveFor(i,f.move.name),hitTimes=m.hits||[m.wind];if(f.move.hitsDone<hitTimes.length&&f.move.t>=hitTimes[f.move.hitsDone]){f.move.hitsDone++;f.move.hit=true;const distance=(other.x-f.x)*f.face;const vertical=Math.abs(f.y-other.y);if(distance>=0&&distance<=m.range&&vertical<100){const blocked=other.block;const damage=blocked?Math.ceil(m.damage*.12):m.damage;other.hp=clamp(other.hp-damage,0,100);other.stun=blocked?.05:.16;other.x=clamp(other.x+f.face*(blocked?9:23),75,925);f.power=clamp(f.power+(f.move.name==='special'?0:blocked?4:15),0,100);other.power=clamp(other.power+9,0,100);if(!blocked){f.combo++;f.comboTime=1.2;}this.events.push({type:blocked?'block':'hit',id:i,x:other.x,y:other.y,move:f.move.name,combo:f.combo,damage,target:1-i,face:f.face});}}
 if(f.move.t>=m.wind+m.active+m.recovery){f.move=null;f.cooldown=.04;}}
 if(this.training)f.power=100;
 });
 // Fighters cannot occupy the same ground position; airborne crossups are allowed.
 if(Math.abs(a.x-b.x)<86&&Math.abs(a.y-b.y)<80){const sign=a.x<b.x?1:-1;const overlap=(86-Math.abs(a.x-b.x))/2;a.x=clamp(a.x-sign*overlap,75,925);b.x=clamp(b.x+sign*overlap,75,925);}
 if(a.hp<=0||b.hp<=0||this.timer<=0){const winner=a.hp===b.hp?-1:a.hp>b.hp?0:1;if(winner>=0)this.wins[winner]++;const done=this.wins.some(w=>w>=2);this.phase=done?'done':'roundover';this.phaseTime=2.8;this.events.push({type:done?'matchover':'roundover',winner,knockout:a.hp<=0||b.hp<=0});}
 }
 drainEvents(){return this.events.splice(0);}
}
