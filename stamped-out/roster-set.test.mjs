import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {FIGHTERS,PROTOTYPE,SUPER_SEQUENCES,moveFor} from './roster.mjs';
import {sequenceFighters} from './choreography.mjs';
import {EXPANSION_DATA} from './expansion-data.mjs';
import {DUO_DATA} from './duo-data.mjs';
import {SOUND_DATA} from './sound-data.mjs';
import {NOVA_STAMP_DATA} from './nova-stamp-data.mjs';
import {VIOLET_RED_DATA} from './violet-red-data.mjs';
const step=(g,t,keys={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,keys);};
function ready(characters){const g=new Fight({characters,training:true});step(g,1.7);g.fighters[0].x=400;g.fighters[1].x=500;g.events=[];return g;}
test('all 256 selections use character moves independently of match side',()=>{
 for(let a=0;a<FIGHTERS.length;a++)for(let b=0;b<FIGHTERS.length;b++)for(const id of [0,1]){const g=ready([a,b]),char=[a,b][id];assert.equal(g.fighters[id].character,char);assert(g.attack(id,'punch'));step(g,.3);assert.equal(g.fighters[1-id].hp,100-moveFor(char,'punch').damage);assert.equal(g.fighters[id].hp,100);}
});
test('all supers in both slots deal their own four-hit damage and respect guard',()=>{
 for(let char=0;char<FIGHTERS.length;char++)for(const id of [0,1]){const chars=id===0?[char,0]:[0,char],g=ready(chars);g.attack(id,'special');step(g,4);const hits=g.drainEvents().filter(e=>e.type==='hit');assert.equal(hits.length,4);assert.equal(g.fighters[1-id].hp,100-PROTOTYPE[char].moves.special.damage);
  const blocked=ready(chars);if(id===0)blocked.dummy='guard';blocked.attack(id,'special');step(blocked,.4,id===1?{block:true}:{});assert.equal(blocked.sequence,null);assert.equal(blocked.fighters[1-id].hp,100-Math.ceil(PROTOTYPE[char].moves.special.damage*.12));
 }
});
test('all throws work in either slot and preserve the selected character on round reset',()=>{
 for(let char=0;char<FIGHTERS.length;char++)for(const id of [0,1]){const g=ready(id===0?[char,0]:[0,char]);g.attack(id,'grab',{direction:-1});step(g,1.3);assert.equal(g.fighters[1-id].hp,100-moveFor(char,'grab').damage);assert(g.fighters[1-id].x<g.fighters[id].x);g.fighters[1-id].hp=0;step(g,4.5);assert.equal(g.fighters[id].character,char);}
});
test('Foxy retreats on a kick, confirms K K, and has low per-hit damage',()=>{
 const g=ready([2,1]);g.attack(0,'kick');step(g,.17);assert(g.fighters[0].x<400);g.queueAttack(0,'kick');step(g,.3);const hits=g.drainEvents().filter(e=>e.type==='hit');assert.equal(hits.length,2);assert.equal(hits[1].combo,2);assert.equal(g.fighters[1].hp,84);assert.equal(g.attack(0,'punch'),false);assert(PROTOTYPE[2].backSpeed>PROTOTYPE[2].speed);
});
test('Clara has higher air mobility and a vulnerable landing recovery',()=>{
 const g=ready([3,1]);g.fighters[1].x=900;step(g,.35,{jump:true,right:true});assert(g.fighters[0].y>130);for(let n=0;n<100&&g.fighters[0].y>0;n++)g.step(1/120);assert.equal(g.fighters[0].y,0);assert(g.fighters[0].cooldown>0);assert.equal(g.attack(0,'kick'),false);step(g,.2);assert(g.attack(0,'kick'));assert(PROTOTYPE[3].airSpeed>1);
});
test('all character cinematics stay finite and unique through the full timeline',()=>{
 const samples=[];for(let char=0;char<FIGHTERS.length;char++){const g=ready([1,char]);g.beginSequence('super',1);const seq={...g.sequence};for(let t=0;t<SUPER_SEQUENCES[char].duration;t+=.025){const views=sequenceFighters(g.fighters,{...seq,elapsed:t});assert(views.every(f=>Number.isFinite(f.x)&&Number.isFinite(f.y)&&Number.isFinite(f.rotation??0)&&f.y>=0&&f.x>0&&f.x<1000));}const v=sequenceFighters(g.fighters,{...seq,elapsed:1.8});samples.push(JSON.stringify(v.map(f=>[f.x,f.y,f.pose,f.rotation])));}assert.equal(new Set(samples).size,FIGHTERS.length);
});
test('new alpha regions have compact bounds and valid masks for all eight poses',()=>{for(const DATA of [EXPANSION_DATA,DUO_DATA,SOUND_DATA,NOVA_STAMP_DATA,VIOLET_RED_DATA]){assert.equal(DATA.boxes.length,2);for(let char=0;char<2;char++){assert.equal(DATA.boxes[char].length,8);for(let pose=0;pose<8;pose++){const [x,y,w,h]=DATA.boxes[char][pose];assert(w>180&&w<360&&h>190&&h<350);assert(x>=0&&y>=0&&x+w<=1254&&y+h<=1254);assert(DATA.masks[char][pose].every(([yy,xx,len])=>yy>=0&&yy<h&&xx>=0&&xx+len<=w));}}}assert.equal(FIGHTERS.filter(f=>!f.boss).length,12);});
test('each selected CPU fighter closes distance and attacks without invalid state',()=>{for(let char=0;char<FIGHTERS.length;char++){const g=new Fight({characters:[2,char],random:()=>.6});step(g,16);assert(g.events.some(e=>e.type==='hit'&&e.id===1));assert(g.fighters.every(f=>Number.isFinite(f.x)&&Number.isFinite(f.y)&&f.hp>=0&&f.hp<=100));}});
