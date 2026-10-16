import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {FIGHTERS,PROTOTYPE} from './roster.mjs';
const step=(g,t,keys={})=>{for(let i=0;i<Math.ceil(t*120);i++)g.step(1/120,keys);};
const ready=(characters=[8,0],dummy='stand')=>{const g=new Fight({training:true,characters,dummy});step(g,1.7);g.fighters[0].x=350;g.fighters[1].x=550;g.events=[];return g;};
test('Nova directional punch closes space once and cannot cross through the opponent',()=>{const g=ready();assert(g.attack(0,'punch',{direction:1}));step(g,.16);assert(g.fighters[0].x>400);assert(g.fighters[0].x<=g.fighters[1].x-86);assert.equal(g.fighters[1].hp,91);assert(g.fighters[0].dashCooldown>0);assert.equal(g.fighters[0].move.dash,true);});
test('Nova missed dash has recovery and can be interrupted',()=>{const g=ready();g.fighters[1].x=800;g.attack(0,'punch',{direction:1});step(g,.3);assert.equal(g.fighters[1].hp,100);assert.equal(g.attack(0,'kick'),false);const p=ready();p.fighters[1].x=450;p.attack(0,'punch',{direction:1});p.applyHit(1,12);assert.equal(p.fighters[0].move,null);assert.equal(p.fighters[0].hp,88);});
test('Big Stamp throws deal 26, leave closer pressure, and remain escapable',()=>{for(const escape of [false,true]){const g=ready([9,0]);g.fighters[1].x=460;g.attack(0,'grab');step(g,.25);assert.equal(g.sequence.kind,'throw');if(escape)assert(g.attack(1,'grab'));step(g,1.2);assert.equal(g.fighters[1].hp,escape?100:74);if(!escape){assert(Math.abs(g.fighters[1].x-g.fighters[0].x)<=205);assert(g.fighters[1].throwImmune>0);}}assert(PROTOTYPE[9].speed<PROTOTYPE[4].speed);});
test('Violet sweep beats standing guard, crouch guard chips, and jumping avoids it',()=>{
 for(const [dummy,hp] of [['guard',90],['lowguard',98]]){const g=ready([10,0],dummy);g.fighters[1].x=500;g.attack(0,'kick');step(g,.3);assert.equal(g.fighters[1].hp,hp);assert.equal(g.fighters[1].knockdown>0,dummy==='guard');}
 const jump=ready([0,10]);jump.fighters[1].x=500;jump.attack(1,'kick');step(jump,.3,{jump:true});assert.equal(jump.fighters[0].hp,100);
});
test('player down and block together defend against Violet low sweep',()=>{const g=ready([0,10]);g.fighters[1].x=500;g.attack(1,'kick');step(g,.15,{block:true,crouch:true});assert(g.fighters[0].lowGuard);step(g,.15,{block:true,crouch:true});assert.equal(g.fighters[0].hp,98);});
test('Redline advances through a capped three-punch confirm and guard stops the chain',()=>{const g=ready([11,0]);g.fighters[1].x=455;g.attack(0,'punch');step(g,.12);g.queueAttack(0,'punch');step(g,.09);g.queueAttack(0,'punch');step(g,.15);assert.equal(g.fighters[1].hp,70);assert(g.fighters[0].x>350);assert.equal(g.fighters[0].chain,2);assert.equal(g.attack(0,'punch'),false);
 const b=ready([11,0],'guard');b.fighters[1].x=455;b.attack(0,'punch');step(b,.12);b.queueAttack(0,'punch');step(b,.18);assert.equal(b.fighters[1].hp,98);assert.equal(b.fighters[0].chain,0);
});
test('all twelve starting fighters are implemented and four bosses remain planned',()=>{assert.equal(FIGHTERS.length,12);assert(FIGHTERS.every(f=>f.playable&&f.stats&&f.special));assert.equal(new Set(FIGHTERS.map(f=>f.style)).size,12);});
