import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {ArenaBeat,drawArenaBeat} from './arena-beat.mjs';
import {StoryProgress} from './story.mjs';
const step=(g,t,keys={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,keys);};
function ready(dummy='stand'){const g=new Fight({training:true,dummy});g.phase='fight';g.fighters[0].x=400;g.fighters[1].x=500;g.events=[];return g;}
test('all four mixed ground routes connect separately and cap at five hits',()=>{
 for(const route of [['punch','punch','punch','kick'],['punch','kick','punch','kick'],['kick','punch','punch','kick'],['kick','kick','punch','kick']]){
  const g=ready();for(const attack of route){assert(g.attack(0,attack));for(let n=0;n<80&&!g.fighters[0].move?.connected;n++)g.step(1/120);step(g,.04);}
  const hits=g.drainEvents().filter(e=>e.type==='hit');assert.equal(hits.length,4);assert.equal(hits.at(-1).combo,4);assert(g.attack(0,'punch'));step(g,.12);assert.equal(g.attack(0,'kick'),false,'The fifth hit cannot cancel again');
 }
});
test('ducking body hook beats standing guard and confirms into a standing string',()=>{
 const g=ready('guard');assert(g.attack(0,'punch',{crouch:true}));step(g,.13);assert.equal(g.fighters[0].move.variant,'body hook');assert(g.fighters[0].move.connected);assert(g.fighters[1].hp<100);assert(g.attack(0,'punch'));assert.equal(g.fighters[0].move.variant,'cross');
 const b=ready('lowguard');b.attack(0,'kick',{crouch:true});step(b,.3);assert.equal(b.fighters[0].move.connected,false);assert.equal(b.attack(0,'punch'),false);
 const j=ready();j.fighters[1].y=150;j.fighters[1].vy=100;j.attack(0,'kick',{crouch:true});step(j,.28);assert.equal(j.fighters[1].hp,100);
});
test('run crosses a rival, damages nobody by itself, and cannot repeat while held',()=>{
 const g=ready();step(g,.4,{run:true,right:true});assert(g.fighters[0].x>g.fighters[1].x);assert.equal(g.fighters[1].hp,100);const x=g.fighters[0].x;step(g,1.5,{run:true});assert.equal(g.fighters[0].x,x);assert.equal(g.drainEvents().filter(e=>e.type==='run').length,1);
 step(g,.01);step(g,.01,{run:true,left:true});assert(g.fighters[0].running);assert(g.attack(0,'punch'));assert.equal(g.fighters[0].move.variant,'running straight');g.applyHit(1,10);step(g,.01,{run:true});assert.equal(g.fighters[0].running,false);
});
test('bass energy drives the backdrop and muted playback decays without new pulses',()=>{
 const beat=new ArenaBeat();beat.data=new Uint8Array(128);beat.analyser={getByteFrequencyData(a){a.fill(210);}};beat.tick(.05,true);assert(beat.pulse>0);assert(beat.level>0);for(let i=0;i<120;i++)beat.tick(1/60,false);assert.equal(beat.pulse,0);assert(beat.level<.001);
 let transforms=0;const ctx=new Proxy({scale(){transforms++;},translate(){transforms++;}},{get:(o,k)=>o[k]??(()=>{})});drawArenaBeat(ctx,{complete:true,naturalWidth:1672,naturalHeight:941},{pulse:1,level:1},{reduced:true});assert.equal(transforms,0);
});
test('chapter advance preserves rewards, requires a clear, and ends after the finale',()=>{
 const s=new StoryProgress({getItem(){return null;},setItem(){}});assert.equal(s.advanceChapter(),false);for(let c=0;c<4;c++){for(let i=0;i<3;i++)assert(s.win(i));assert(s.isUnlocked(12+c));assert.equal(s.advanceChapter(),c<3);if(c<3)assert.equal(s.next,0);}assert.equal(s.active,3);assert.equal(s.next,3);
});
