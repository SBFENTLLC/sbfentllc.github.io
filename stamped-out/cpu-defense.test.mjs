import test from 'node:test';import assert from 'node:assert/strict';import {Fight} from './engine.mjs';import {moveFor} from './roster.mjs';
function ready(difficulty='hard'){const g=new Fight({difficulty,characters:[0,0],random:()=>.5});g.phase='fight';g.aiTime=0;g.fighters[0].x=400;g.fighters[1].x=520;return g;}
test('CPU keeps its chosen guard instead of overriding it with an attack in the same step',()=>{
 for(const difficulty of ['medium','hard']){const g=ready(difficulty);g.attack(0,'kick');const keys=g.aiInput();assert.equal(keys.block,true);assert.equal(g.fighters[1].move,null);assert.equal(g.aiTime,0);}
});
test('CPU releases a stale guard and can punish a normal strike recovery',()=>{
 for(const difficulty of ['medium','hard']){const g=ready(difficulty);g.attack(0,'kick');const a=g.fighters[0],b=g.fighters[1];a.move.t=moveFor(0,'kick').wind+moveFor(0,'kick').active+.01;a.move.hit=true;b.block=true;
  const keys=g.aiInput();assert.equal(keys.block,false);assert.equal(b.block,false);assert.equal(b.move?.name,'punch');}
});
test('low punches receive the same CPU low-guard decision as low kicks',()=>{
 for(const name of ['punch','kick']){const g=ready();g.attack(0,name,{crouch:true});assert.equal(g.fighters[0].move.low,true);const keys=g.aiInput();assert.equal(keys.block,true);assert.equal(keys.crouch,true);assert.equal(g.fighters[1].move,null);}
});
test('an incoming projectile still takes priority over punishing its owner recovery',()=>{
 const g=ready();g.attack(0,'punch');g.fighters[0].move.hit=true;g.projectiles=[{id:0,x:400,face:1}];const keys=g.aiInput();assert.equal(keys.block,true);assert.equal(g.fighters[1].move,null);
});
test('Easy keeps its open, slower attack decisions',()=>{
 const g=ready('easy');g.attack(0,'kick');const keys=g.aiInput();assert.equal(keys.block,false);assert.ok(g.fighters[1].move);assert.ok(g.aiTime>=.85);
});
function random(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
test('all sixteen full matchups finish, and Medium/Hard punish repeated pressure more often than Easy',()=>{
 const cpuWins={easy:0,medium:0,hard:0};
 for(const difficulty of Object.keys(cpuWins))for(let character=0;character<16;character++)for(const seed of [17,31,73]){
  const g=new Fight({difficulty,characters:[0,character],random:random(seed)});let time=0,tap=0;
  while(time<360&&g.phase!=='done'){const [a,b]=g.fighters;if(g.phase==='fight'&&time-tap>.12){g.queueAttack(0,a.chain>=1?'kick':'punch');tap=time;}g.step(1/120,{right:a.x<b.x,left:a.x>b.x});g.drainEvents();time+=1/120;}
  assert.equal(g.phase,'done',`${difficulty}/${character}/${seed}`);assert.ok(g.wins.includes(2));assert.ok(g.fighters.every(f=>['hp','x','y','power'].every(k=>Number.isFinite(f[k]))));if(g.wins[1]===2)cpuWins[difficulty]++;
 }
 assert.ok(cpuWins.medium>16);assert.ok(cpuWins.hard>=cpuWins.medium);assert.ok(cpuWins.easy<cpuWins.medium);
});
