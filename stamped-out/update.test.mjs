import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {FightFX} from './fx.mjs';
import {Soundtrack} from './music.mjs';
import {ROSTER,moveFor,PROTOTYPE} from './roster.mjs';
const advance=(g,t,input={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,input);};
function ready(){const g=new Fight({training:true,random:()=>.5});advance(g,1.7);g.fighters[0].x=400;g.fighters[1].x=500;g.events=[];return g;}
test('Flex has faster punches and movement; Bootlegger has longer kicks',()=>{assert(moveFor(0,'punch').wind<moveFor(1,'punch').wind);assert(PROTOTYPE[0].speed>PROTOTYPE[1].speed);assert(moveFor(1,'kick').range>moveFor(0,'kick').range);assert(moveFor(1,'kick').recovery>moveFor(0,'kick').recovery);});
test('both fighters have distinct four-hit sequences with different damage',()=>{for(const [id,count,damage] of [[0,4,26],[1,4,30]]){const g=ready();g.attack(id,'special');advance(g,4.5);const hits=g.drainEvents().filter(e=>e.type==='hit');assert.equal(hits.length,count);assert.equal(g.fighters[1-id].hp,100-damage);}});
test('special starts one cinematic and cannot be retriggered during recovery',()=>{const g=ready();assert(g.attack(0,'special'));assert.equal(g.attack(0,'special'),false);assert.equal(g.drainEvents().filter(e=>e.type==='super').length,1);});
test('cinematic freezes combat presentation for over two seconds then releases',()=>{const fx=new FightFX({});fx.event({type:'super',id:0},[]);assert(fx.frozen);fx.tick(2);assert(fx.cinematic);fx.tick(.3);assert.equal(fx.cinematic,null);assert.equal(fx.frozen,false);});
test('effect particles expire and reduced-motion mode suppresses camera shake',()=>{const fx=new FightFX({},true);fx.event({type:'hit',id:0,target:1,x:500,y:0,move:'special',damage:26,face:1,combo:2},[]);assert.equal(fx.shake,0);assert.equal(fx.particles.length,5);fx.tick(2);assert.equal(fx.particles.length,0);assert.equal(fx.impacts.length,0);assert.equal(fx.labels.length,0);});
test('sixteen implemented fighters each have a unique style and super with counterplay',()=>{assert.equal(ROSTER.length,16);assert.equal(new Set(ROSTER.map(f=>f.style)).size,16);assert.equal(new Set(ROSTER.map(f=>f.special)).size,16);assert(ROSTER.every(f=>f.strength&&f.weakness));});
class FakeAudio{constructor(){this.listeners={};this.paused=true;this.src='';}addEventListener(e,cb){this.listeners[e]=cb;}pause(){this.paused=true;}async play(){if(this.reject)throw Error('gesture needed');this.paused=false;}}
test('soundtrack loads lazily and switches scene without overlapping audio',async()=>{const a=new FakeAudio(),m=new Soundtrack(a);await m.setScene('fight');assert.equal(a.src,'');await m.unlock();assert.equal(a.src,'audio/hustle.m4a');await m.select('money-machine');assert.equal(a.src,'audio/money-machine.m4a');await m.suspend();assert(a.paused);await m.resume();assert.equal(a.paused,false);await m.toggle();assert(a.paused);});
test('blocked autoplay can be retried and volume is bounded',async()=>{const a=new FakeAudio(),m=new Soundtrack(a);a.reject=true;await m.unlock();assert.equal(m.status,'tap');a.reject=false;await m.unlock();assert.equal(m.status,'playing');m.volume(2);assert.equal(a.volume,1);m.volume(-1);assert.equal(a.volume,0);});
