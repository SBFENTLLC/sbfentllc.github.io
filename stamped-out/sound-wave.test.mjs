import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {PROTOTYPE} from './roster.mjs';
const step=(g,t,keys={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,keys);};
const ready=(characters=[6,0],dummy='stand')=>{const g=new Fight({characters,training:true,dummy});step(g,1.7);g.fighters[0].x=250;g.fighters[1].x=650;g.events=[];return g;};
test('ground K launches a traveling wave that hits once beyond kick range',()=>{const g=ready();g.attack(0,'kick');step(g,.32);assert.equal(g.projectiles.length,1);assert.equal(g.fighters[1].hp,100);step(g,.6);assert.equal(g.fighters[1].hp,91);assert.equal(g.projectiles.length,0);step(g,.5);assert.equal(g.fighters[1].hp,91);});
test('waves can be blocked, jumped, and outranged',()=>{
 const b=ready([6,0],'guard');b.attack(0,'kick');step(b,1);assert.equal(b.fighters[1].hp,98);
 const j=ready([0,6]);j.fighters[0].x=250;j.fighters[1].x=650;j.attack(1,'kick');step(j,.58);step(j,.4,{jump:true});assert.equal(j.fighters[0].hp,100);
 const miss=ready();miss.fighters[1].x=900;miss.attack(0,'kick');step(miss,1.5);assert.equal(miss.fighters[1].hp,100);assert.equal(miss.projectiles.length,0);
});
test('opposing waves clash and a super or round change clears lingering waves',()=>{const g=ready([6,6]);g.attack(0,'kick');g.attack(1,'kick');step(g,.8);assert.equal(g.fighters[0].hp,100);assert.equal(g.fighters[1].hp,100);assert(g.drainEvents().some(e=>e.type==='waveClash'));const s=ready();s.attack(0,'kick');step(s,.35);assert(s.projectiles.length);s.beginSequence('super',1);assert.equal(s.projectiles.length,0);s.resetRound();assert.equal(s.projectiles.length,0);});
test('an airborne DJ K is a close kick and has no projectile',()=>{const g=ready();g.fighters[1].x=400;step(g,.1,{jump:true});g.attack(0,'kick');step(g,.3);assert.equal(g.projectiles.length,0);});
test('Quiet Money guard takes less chip, but grabs still deal full damage',()=>{
 const normal=ready([0,1]),quiet=ready([0,7]);normal.applyHit(0,16,{blocked:true});quiet.applyHit(0,16,{blocked:true});assert.equal(normal.fighters[1].hp,98);assert.equal(quiet.fighters[1].hp,99);
 quiet.fighters[0].x=550;quiet.fighters[1].x=650;quiet.dummy='guard';quiet.attack(0,'grab');step(quiet,1.4);assert.equal(quiet.fighters[1].hp,83);
 assert(PROTOTYPE[7].moves.punch.damage>PROTOTYPE[0].moves.punch.damage);assert(PROTOTYPE[7].moves.punch.recovery>PROTOTYPE[0].moves.punch.recovery);
});
test('jumping an active wave leaves DJ in punishable recovery',()=>{const g=ready([0,6]);g.fighters[0].x=400;g.fighters[1].x=500;g.attack(1,'kick');step(g,.35,{jump:true});assert.equal(g.fighters[0].hp,100);assert(g.fighters[1].move?.hit);assert.equal(g.attack(1,'punch'),false);});
