import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {MatchRecord,loadControls} from './polish.mjs';
import {Soundtrack} from './music.mjs';
const step=(g,t,input={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,input);};
const ready=()=>{const g=new Fight({training:true});step(g,1.7);g.fighters[0].x=400;g.fighters[1].x=500;g.events=[];return g;};
test('hit-confirmed Flex P P K chain connects before guard can recover',()=>{
 const g=ready();g.attack(0,'punch');step(g,.1);g.queueAttack(0,'punch');step(g,.09);g.queueAttack(0,'kick');g.dummy='guard';step(g,.4);
 const hits=g.drainEvents().filter(e=>e.type==='hit');assert.deepEqual(hits.map(e=>e.move),['punch','punch','kick']);assert.equal(hits.at(-1).combo,3);assert.equal(g.fighters[1].hp,69);
});
test('blocked hits and whiffs cannot cancel into another attack',()=>{
 for(const block of [true,false]){const g=ready();if(block){g.dummy='guard';}else g.fighters[1].x=800;g.attack(0,'punch');step(g,.1);g.queueAttack(0,'kick');step(g,.16);assert.equal(g.fighters[0].move.name,'punch');assert.equal(g.fighters[0].buffer,null);}
});
test('recent tap buffers through the end of recovery without repeating',()=>{
 const g=ready();g.fighters[1].x=800;g.attack(0,'punch');step(g,.3);g.queueAttack(0,'kick');step(g,.12);assert.equal(g.fighters[0].move.name,'kick');step(g,1);assert.equal(g.fighters[0].move,null);assert.equal(g.fighters[0].buffer,null);
});
test('counter hit interrupts startup and a recovery punish is classified',()=>{
 const g=ready();g.attack(1,'kick');g.attack(0,'punch');step(g,.1);assert.equal(g.fighters[0].hp,100);assert.equal(g.fighters[1].move,null);assert(g.drainEvents().some(e=>e.counter));
 const p=ready();p.attack(1,'punch');step(p,.18,{block:true});step(p,.08);assert(p.attack(0,'punch'));step(p,.1);assert(p.drainEvents().some(e=>e.punish));
});
test('holding jump does not automatically jump again on landing',()=>{const g=ready();step(g,1.1,{jump:true});assert.equal(g.fighters[0].y,0);step(g,.2,{jump:true});assert.equal(g.fighters[0].y,0);step(g,.01);step(g,.1,{jump:true});assert(g.fighters[0].y>0);});
test('guard is resolved before first-frame contact for either fighter',()=>{const g=ready();g.dummy='guard';g.attack(0,'punch');step(g,.09);assert.equal(g.fighters[1].hp,98);assert(g.drainEvents().some(e=>e.type==='block'));});
test('knocked-down targets cannot be repeatedly struck or grabbed',()=>{const g=ready();g.fighters[1].knockdown=.6;g.attack(0,'punch');step(g,.2);assert.equal(g.fighters[1].hp,100);});
test('training dummy jumps and guard stops connected supers',()=>{const g=ready();g.dummy='jump';step(g,.15);assert(g.fighters[1].y>0);const b=ready();b.dummy='guard';b.attack(0,'special');step(b,.3);assert.equal(b.sequence,null);assert.equal(b.fighters[1].hp,96);});
test('records persist once per real match and exclude training',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},r=new MatchRecord(storage);
 r.event({type:'hit',id:0,damage:8,combo:3,counter:true});r.event({type:'matchover',winner:0});r.event({type:'matchover',winner:0});assert.equal(r.saved.matches,1);assert.equal(new MatchRecord(storage).saved.bestCombo,3);
 r.reset(true);r.event({type:'matchover',winner:1});assert.equal(r.saved.matches,1);assert.equal(r.saved.wins,1);
 const broken={getItem(){throw Error('unavailable');},setItem(){throw Error('full');}};const b=new MatchRecord(broken);b.event({type:'matchover',winner:1});assert.equal(b.saved.matches,1);assert.deepEqual(loadControls(broken),{size:'standard',hand:'right'});
});
test('soundtrack ducks without altering saved volume and fades back',()=>{const a={addEventListener(){},pause(){},play(){return Promise.resolve();}},m=new Soundtrack(a);m.volume(.6);m.duck(.2,.5);m.tick(.2);assert(a.volume<.2);assert.equal(m.level,.6);for(let i=0;i<120;i++)m.tick(1/60);assert(a.volume>.59);m.volume(0);m.duck(.1,1);m.tick(.1);assert.equal(a.volume,0);});
