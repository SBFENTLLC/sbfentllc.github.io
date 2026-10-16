import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
const advance=(g,t,input={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,input);};
function ready(){const g=new Fight({training:true,random:()=>.5});advance(g,1.7);g.fighters[0].x=400;g.fighters[1].x=500;g.events=[];return g;}
test('each punch damages once and cannot interrupt its own recovery',()=>{const g=ready();assert.equal(g.attack(0,'punch'),true);assert.equal(g.attack(0,'kick'),false);advance(g,.14);assert.equal(g.fighters[1].hp,88);advance(g,.22);assert.equal(g.fighters[1].hp,88);});
test('out of range attacks miss',()=>{const g=ready();g.fighters[1].x=800;g.attack(0,'kick');advance(g,.5);assert.equal(g.fighters[1].hp,100);});
test('a block reduces incoming damage',()=>{const g=ready();g.fighters[1].x=400;g.fighters[0].x=500;advance(g,.02,{block:true});g.attack(1,'punch');advance(g,.15,{block:true});assert.equal(g.fighters[0].hp,98);assert(g.drainEvents().some(e=>e.type==='block'));});
test('special requires a full meter and spends it',()=>{const g=ready();g.training=false;g.aiTime=100;g.fighters[0].power=99;assert.equal(g.attack(0,'special'),false);g.fighters[0].power=100;assert.equal(g.attack(0,'special'),true);assert.equal(g.fighters[0].power,0);});
test('jump lands, fighters remain inside stage',()=>{const g=ready();advance(g,.2,{jump:true,right:true});assert(g.fighters[0].y>0);advance(g,1);assert.equal(g.fighters[0].y,0);advance(g,8,{left:true});assert.equal(g.fighters[0].x,75);});
test('two round wins finish match and stop time',()=>{const g=ready();g.fighters[1].hp=0;advance(g,.02);assert.equal(g.wins[0],1);advance(g,4.5);g.fighters[1].hp=0;advance(g,.02);assert.equal(g.phase,'done');assert.equal(g.wins[0],2);const time=g.timer;advance(g,5);assert.equal(g.timer,time);});
test('timer draw awards no win and next round begins',()=>{const g=ready();g.timer=.01;advance(g,.02);assert.equal(g.phase,'roundover');assert.deepEqual(g.wins,[0,0]);advance(g,3);assert.equal(g.round,2);});
test('computer can close distance and attack',()=>{const g=new Fight({random:()=>.6,difficulty:'medium'});advance(g,10);assert(g.fighters[0].hp<100);});
