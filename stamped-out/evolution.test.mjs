import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {Soundtrack,TRACKS,ARENA_MIXES} from './music.mjs';
import {StoryCinema,STORY_SCENES,drawStoryCutouts} from './story-scenes.mjs';
import {StoryProgress} from './story.mjs';
import {VICTORIES,victoryPose,drawCelebration} from './victories.mjs';
import {setupTouchLock} from './touch-lock.mjs';
const step=(g,t,keys={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,keys);};
test('all sixteen fighters can confirm an air punch into an air kick in either player slot',()=>{
 for(let c=0;c<16;c++)for(let id=0;id<2;id++){
  const g=new Fight({training:true,characters:id?[0,c]:[c,0]});g.phase='fight';
  Object.assign(g.fighters[0],{x:400,y:80,vy:100});Object.assign(g.fighters[1],{x:500,y:80,vy:100});
  assert(g.attack(id,'punch'));let chained=false;
  for(let n=0;n<100;n++){g.step(1/120);if(!chained&&g.fighters[id].move?.connected)chained=g.attack(id,'kick');}
  assert(chained,'air cancel '+c+'/'+id);const hits=g.drainEvents().filter(e=>e.type==='hit'&&e.id===id);
  assert.equal(hits.length,2,'two separate contacts '+c+'/'+id);assert(hits.every(e=>e.aerial));
 }
});
test('air whiffs cannot cancel and juggle pressure always returns fighters to the ground',()=>{
 const g=new Fight({training:true});g.phase='fight';Object.assign(g.fighters[0],{x:150,y:100,vy:200});Object.assign(g.fighters[1],{x:800,y:100,vy:200});
 g.attack(0,'punch');step(g,.08);assert.equal(g.attack(0,'kick'),false);
 const [a,b]=g.fighters;a.move=null;a.x=400;b.x=500;a.y=b.y=80;a.vy=b.vy=100;
 for(let n=0;n<240;n++){
  if(n%6===0)g.queueAttack(0,n%12?'kick':'punch');g.step(1/120,{right:a.x<b.x});
  assert(a.airAttacks<=3);assert(Number.isFinite(a.y)&&Number.isFinite(b.y));assert(a.y<500&&b.y<500);
 }
 step(g,2);assert.equal(a.y,0);assert.equal(b.y,0);assert.equal(a.airAttacks,0);
});
test('air contact launches a nearby grounded opponent while repeated juggle hits force descent',()=>{
 const g=new Fight({training:true});g.phase='fight';const [a,b]=g.fighters;Object.assign(a,{x:400,y:45,vy:100});b.x=500;
 g.attack(0,'punch');step(g,.1);assert(b.y>0);assert(b.vy>0);
 a.move={airborne:true};b.juggleHits=2;b.vy=300;g.applyHit(0,8);assert(b.vy<0,'third juggle hit sends the target down');
});
function mashMatch(damageScale){const g=new Fight({random:()=>.5,damageScale});let t=0,lastTap=0;
 while(t<180&&g.phase!=='done'){if(g.phase==='fight'&&t-lastTap>.12){g.queueAttack(0,g.fighters[0].chain>=1?'kick':'punch');lastTap=t;}const [a,b]=g.fighters;g.step(1/120,{right:a.x<b.x,left:a.x>b.x});t+=1/120;}
 assert.equal(g.phase,'done');return t;
}
test('production damage stretches a repeated-pressure match without changing its win rules',()=>{
 const old=mashMatch(1),current=mashMatch(.62);assert(current>old*1.3);assert(current<90);
 const g=new Fight();assert.equal(g.damageScale,.62);g.phase='fight';g.applyHit(0,12);assert.equal(g.fighters[1].hp,93);
});
test('movement is quicker in both directions while heavy fighters retain their identity',()=>{
 for(const c of [0,4,8,12]){const g=new Fight({training:true,characters:[c,1]});g.phase='fight';g.fighters[0].x=200;step(g,.1,{right:true});assert(g.fighters[0].x>200+([240,185,285,165][[0,4,8,12].indexOf(c)])*.1);}
});
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
const audio=()=>({listeners:{},addEventListener(e,f){this.listeners[e]=f;},pause(){},play(){return Promise.resolve();}});
test('every arena has a distinct mix, all fourteen songs appear, and each mix rotates across revisits',async()=>{
 assert.equal(new Set(Object.values(ARENA_MIXES).map(v=>v.join())).size,8);
 const ids=new Set(Object.values(ARENA_MIXES).flat());assert.equal(ids.size,14);assert(TRACKS.every(t=>ids.has(t.id)));
 const storage=memory(),m=new Soundtrack(audio(),()=>{},storage);
 for(const [arena,mix] of Object.entries(ARENA_MIXES)){const heard=[];for(let n=0;n<mix.length;n++){await m.beginMatch('fight',n,arena);heard.push(m.current.id);assert.equal(m.audio.loop,false);}assert.deepEqual(heard,mix);}
 const next=new Soundtrack(audio(),()=>{},storage);await next.beginMatch('fight',0,'rooftop');assert.equal(next.current.id,ARENA_MIXES.rooftop[0]);
 await next.beginMatch('fight',1,'rooftop');assert.equal(next.current.id,ARENA_MIXES.rooftop[1]);
});
test('a long match advances songs automatically; manual choice, pause and mute retain control',async()=>{
 const a=audio(),m=new Soundtrack(a);await m.beginMatch('fight',0,'studio');assert.equal(m.current.id,'modest');
 a.listeners.ended();await Promise.resolve();assert.equal(m.current.id,'pod-dat');
 await m.select('four-flat');assert.equal(a.loop,true);a.listeners.ended();assert.equal(m.current.id,'four-flat');
 await m.select('auto');await m.suspend();a.listeners.ended();assert.equal(m.current.id,'pod-dat');await m.resume();await m.toggle();assert.equal(m.enabled,false);a.listeners.ended();assert.equal(m.current.id,'pod-dat');
});
test('twelve encounters have distinct before/after scenes and skipping cannot award story rewards',()=>{
 const story=new StoryProgress(memory()),scene=new StoryCinema(),unique=new Set();
 assert.equal(STORY_SCENES.flat().length,12);
 for(let c=0;c<4;c++)for(let i=0;i<3;i++)for(const moment of ['before','after','defeat']){
  scene.open(c,i,moment);assert(scene.current.text.length>20);assert(scene.current.opponent>=0);assert.equal(scene.current.page,0);
  if(moment!=='defeat'){const text=scene.current.lines.map(l=>l[1]).join();assert(!unique.has(text));unique.add(text);}
  while(scene.next())assert(scene.current.page<scene.current.total);assert.equal(scene.active,false);
 }
 assert.equal(story.next,0);assert.equal(story.isUnlocked(12),false);scene.open(0,0);scene.close();assert.equal(story.next,0);
});
test('touch lock suppresses game gestures, allows menu scrolling, and tolerates unavailable fullscreen',async()=>{
 const listeners={},options={},classes=new Set();let playing=true,prevented=0;
 const doc={addEventListener:(n,f,o)=>{listeners[n]=f;options[n]=o;},body:{classList:{toggle:(k,b)=>b?classes.add(k):classes.delete(k)}},documentElement:{requestFullscreen:()=>Promise.reject(Error('unsupported'))}};
 const lock=setupTouchLock(()=>playing,{doc,win:{addEventListener(){},scrollTo(){}}});lock.enter();await Promise.resolve();await Promise.resolve();assert(classes.has('fighting'));
 listeners.touchmove({cancelable:true,preventDefault(){prevented++;}});assert.equal(prevented,1);assert.equal(options.touchmove.passive,false);
 playing=false;lock.sync();listeners.touchmove({cancelable:true,preventDefault(){prevented++;}});assert.equal(prevented,1);assert(!classes.has('fighting'));
});
test('all unique celebrations render for either winner; Flex uses the supplied bill artwork',()=>{
 assert.equal(VICTORIES.length,16);assert.equal(new Set(VICTORIES.map(v=>v.prop)).size,16);let billsDrawn=0,sprites=0;
 const gradient={addColorStop(){}};const image={complete:true,naturalWidth:1536};
 const ctx=new Proxy({drawImage(img,...args){assert.equal(img,image);assert.equal(args[2],1450);billsDrawn++;},createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const fx={reduced:false,rawSprite(ctx,f){sprites++;for(const k of ['x','y','rotation'])assert(Number.isFinite(f[k]));}};
 for(let c=0;c<16;c++)for(let id=0;id<2;id++)for(const t of [0,.5,1,2.5,4]){drawCelebration(ctx,fx,{id,character:c,outfit:1},t,image);const p=victoryPose(c,t);assert(p.x>=300&&p.x<=700);assert(p.y>=0&&p.y<200);}
 assert(billsDrawn>0);assert(sprites>=160);for(let c=0;c<16;c++)assert.deepEqual(victoryPose(c,0,true),victoryPose(c,4,true));
 const cinema=new StoryCinema();for(let c=0;c<4;c++)for(let i=0;i<3;i++){cinema.open(c,i);drawStoryCutouts(ctx,fx,cinema.current,1,[1,1]);}
});
