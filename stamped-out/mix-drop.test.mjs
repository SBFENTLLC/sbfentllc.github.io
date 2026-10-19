import test from 'node:test';import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';import {MIX_DROP,drawMixGesture,drawMixBurst} from './mix-drop.mjs';import {Soundtrack} from './music.mjs';import {FightFX} from './fx.mjs';
const step=(g,t,input={})=>{for(let i=0;i<Math.ceil(t*120);i++)g.step(1/120,input);};
function ready(char=0,id=0){const g=new Fight({training:true,characters:id?[0,char]:[char,0]});g.phase='fight';g.fighters[0].x=400;g.fighters[1].x=560;g.events=[];return g;}
test('all sixteen fighters in either slot mix once, push away and cannot spam it',()=>{
 for(let c=0;c<16;c++)for(let id=0;id<2;id++){const g=ready(c,id),a=g.fighters[id],b=g.fighters[1-id];g.training=false;g.damageScale=.55;g.aiInput=()=>({});a.power=b.power=0;const old=Math.abs(a.x-b.x);assert(g.attack(id,'mix'));assert.equal(a.mixCooldown,18);assert(!g.attack(id,'mix'));step(g,.6);assert.equal(b.hp,100);step(g,.12);assert.equal(b.hp,98);assert(Math.abs(a.x-b.x)>old+120);assert.equal(a.power,0);assert.equal(b.power,0);step(g,1);assert.equal(g.drainEvents().filter(e=>e.type==='mixDrop').length,1);assert(!g.attack(id,'mix'));}
});
test('guard avoids damage, jumping and range avoid the burst, interruptions consume recharge',()=>{
 const guard=ready();guard.dummy='guard';guard.attack(0,'mix');step(guard,.8);assert.equal(guard.fighters[1].hp,100);assert(guard.fighters[1].x<=580);
 const air=ready();air.attack(0,'mix');for(let i=0;i<100;i++){Object.assign(air.fighters[1],{y:220,vy:0});air.step(1/120);}assert.equal(air.fighters[1].hp,100);
 const range=ready();range.fighters[1].x=800;range.attack(0,'mix');step(range,.8);assert.equal(range.fighters[1].hp,100);
 for(const interruption of ['hit','throw']){const g=ready();g.attack(0,'mix');if(interruption==='hit')g.applyHit(1,8);else g.beginSequence('throw',1);assert(g.drainEvents().some(e=>e.type==='mixCancel'));step(g,1.5);assert(!g.drainEvents().some(e=>e.type==='mixDrop'));assert(g.fighters[0].mixCooldown>0);}
});
test('mix clears nearby opposing shots, preserves distant and own shots, and resets each round',()=>{
 const g=ready();g.projectiles=[{id:0,x:430},{id:1,x:500},{id:1,x:900}];g.dropMix(0);assert.deepEqual(g.projectiles.map(p=>[p.id,p.x]),[[0,430],[1,900]]);
 const normal=new Fight();normal.phase='fight';normal.aiInput=()=>({});assert.equal(normal.fighters[0].mixCooldown,12);assert(!normal.attack(0,'mix'));step(normal,12.1);assert(normal.attack(0,'mix'));normal.resetRound();assert.equal(normal.fighters[0].mixCooldown,12);assert.equal(normal.fighters[0].move,null);
 const airborne=ready();airborne.fighters[0].y=90;assert(!airborne.attack(0,'mix'));assert.equal(airborne.fighters[0].mixCooldown,0);
});
function music(){const a={paused:false,volume:.5,playbackRate:1,preservesPitch:true,listeners:{},addEventListener(n,f){this.listeners[n]=f;},pause(){this.paused=true;},play(){this.paused=false;return Promise.resolve();}};const m=new Soundtrack(a);m.status='playing';m.unlocked=true;m.volume(.5);return {a,m};}
test('mix bends the actual record, dips its volume and restores both on drop without seeking',()=>{
 const {a,m}=music();a.currentTime=44;m.beginMix(0);m.tick(.05);assert(a.playbackRate!==1);assert.equal(a.preservesPitch,false);assert(a.volume<.5);assert.equal(a.currentTime,44);m.dropMix(0);assert.equal(a.playbackRate,1);assert.equal(a.preservesPitch,true);assert.equal(m.mix,null);assert(m.visualBeat.pulse>.9);for(let i=0;i<120;i++)m.tick(1/60);assert(a.volume>.49);assert.equal(m.dropPulse,0);assert.equal(m.level,.5);
});
test('interruption, pause, mute, track change and automatic timeout restore playback; muted combat stays usable',async()=>{
 for(const action of ['cancel','pause','mute','track','timeout']){const {a,m}=music();m.beginMix(1);m.tick(.1);if(action==='cancel')m.endMix(1);if(action==='pause')await m.suspend();if(action==='mute')await m.toggle();if(action==='track')await m.select('hustle');if(action==='timeout')m.tick(.9);assert.equal(a.playbackRate,1,action);assert.equal(a.preservesPitch,true,action);assert.equal(m.mix,null,action);}
 const {m}=music();m.enabled=false;m.beginMix(0);assert.equal(m.mix,null);const g=ready();assert(g.attack(0,'mix'));step(g,.8);assert(g.fighters[1].hp<100);
});
test('mix gesture and burst render finite geometry, respect reduced motion and expire',()=>{
 const calls=[];const ctx=new Proxy({},{get:(_o,k)=>(...args)=>{for(const n of args)if(typeof n==='number')assert(Number.isFinite(n),k);calls.push(k);}});
 for(const reduced of [false,true])for(const face of [-1,1])for(const t of [0,.15,.35,.64])drawMixGesture(ctx,{x:500,y:0,face,move:{name:'mix',t}},'#d2a0ff',reduced);
 for(const age of [0,.2,.59])drawMixBurst(ctx,{x:500,age,color:'#d2a0ff'});assert(calls.includes('stroke'));assert(calls.includes('fillText'));
 const fx=new FightFX({});fx.event({type:'mixDrop',id:0,x:400},[{character:0}]);assert.equal(fx.drops.length,1);fx.tick(.7);assert.equal(fx.drops.length,0);assert.equal(fx.shake,0);
});
test('normal strikes return to guard near recovery end; mixing and heavy commitments stay punishable',()=>{
 const g=ready();g.attack(0,'punch');step(g,.22,{block:true});assert(g.fighters[0].move);assert.equal(g.fighters[0].block,false);step(g,.12,{block:true});assert.equal(g.fighters[0].move,null);assert.equal(g.fighters[0].block,true);
 const m=ready();m.attack(0,'mix');step(m,.75,{block:true});assert.equal(m.fighters[0].move?.name,'mix');assert.equal(m.fighters[0].block,false);
});
test('pose smoothing blends neutral returns but presents attacks and hit reactions immediately',()=>{
 const fx=new FightFX({}),draws=[];fx.rawSprite=(_ctx,_f,frame,alpha)=>draws.push({frame,alpha});const f={id:0,character:0,outfit:0,move:null,y:0,stun:0,knockdown:0};fx.drawFighter({},f);fx.time=.1;f.block=true;fx.drawFighter({},f);fx.time=.135;draws.length=0;fx.drawFighter({},f);assert.equal(draws.length,2);assert(Math.abs(draws[1].alpha-.5)<.001);
 f.block=false;f.move={name:'punch',t:.12,wind:.085};draws.length=0;fx.drawFighter({},f);assert.deepEqual(draws,[{frame:2,alpha:1}]);f.move=null;f.stun=.1;draws.length=0;fx.drawFighter({},f);assert.deepEqual(draws,[{frame:5,alpha:1}]);
 const reduced=new FightFX({},true);reduced.rawSprite=fx.rawSprite;draws.length=0;reduced.drawFighter({},f);assert.equal(draws.length,1);assert.equal(draws[0].alpha,1);
});
test('CPU can spend its ready mix to escape pressure, and beginning a throw cancels an opponent mix',()=>{
 const g=ready(0);g.training=false;const b=g.fighters[1];b.defenseTime=.7;b.block=true;b.stun=0;b.mixCooldown=0;g.aiInput();assert.equal(b.move?.name,'mix');assert.equal(b.mixCooldown,18);
 const t=ready();t.attack(1,'mix');t.beginSequence('throw',0);assert(t.drainEvents().some(e=>e.type==='mixCancel'&&e.id===1));
});
