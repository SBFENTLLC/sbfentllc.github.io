import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {moveFor} from './roster.mjs';
function repeatedPressure(scale){const g=new Fight({damageScale:scale,random:()=>.5});let time=0,tap=0;while(time<220&&g.phase!=='done'){if(g.phase==='fight'&&time-tap>.12){g.queueAttack(0,g.fighters[0].chain>=1?'kick':'punch');tap=time;}const [a,b]=g.fighters;g.step(1/120,{right:a.x<b.x,left:a.x>b.x});time+=1/120;}return {time,wins:g.wins,phase:g.phase};}
test('production rounds allow more exchanges while the same attack script still finishes a best-of-three',()=>{
 const previous=repeatedPressure(.62),now=repeatedPressure(.55);assert.equal(now.phase,'done');assert(now.time>previous.time);assert(now.time<200);assert(now.wins.some(w=>w===2));
 const g=new Fight();assert.equal(g.timer,75);g.phase='fight';g.applyHit(0,12);assert.equal(g.fighters[1].hp,93);const lab=new Fight({training:true});lab.phase='fight';lab.applyHit(0,12);assert.equal(lab.fighters[1].hp,88);
});
test('pressure causes style-specific defense, without passive armor or immunity',()=>{
 for(const character of [1,2,3,5,6,7,8,10,12,14,15]){const g=new Fight({characters:[0,character],random:()=>.5});g.phase='fight';const [a,b]=g.fighters;a.x=400;b.x=510;
  for(let n=0;n<3;n++)g.applyHit(0,6);assert(b.defenseTime>0);const ai=g.aiInput();if([2,3,6,8,10].includes(character)){assert(ai.left||ai.right);assert(!ai.block);}else assert(ai.block);
  const before=b.hp;g.applyHit(0,10);assert(b.hp<before); // adaptation never cancels damage
  g.resetRound();assert.equal(g.fighters[1].defenseTime,0);assert.equal(g.fighters[1].pressureHits,0);
 }
});
test('single hits and separated hits do not trigger defensive reads; heavy and quick styles retain their attacks',()=>{
 const g=new Fight({random:()=>.5});g.phase='fight';g.applyHit(0,6);assert.equal(g.fighters[1].defenseTime,0);g.fighters[1].pressureTime=0;g.applyHit(0,6);assert.equal(g.fighters[1].pressureHits,1);assert.equal(g.fighters[1].defenseTime,0);
 assert(moveFor(0,'punch').wind<moveFor(12,'punch').wind);assert(moveFor(9,'grab').damage>moveFor(8,'grab').damage);
});
