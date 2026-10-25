import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {FIGHTERS,moveFor} from './roster.mjs';
const step=(g,t,keys={})=>{for(let n=0;n<Math.ceil(t*240);n++)g.step(1/240,keys);};
function ready(character,id,low=false){
 const g=new Fight({training:true,characters:id?[0,character]:[character,0]});g.phase='fight';
 g.fighters[0].x=300;g.fighters[1].x=700;assert.equal(g.attack(id,'kick',{crouch:low}),true);return g;
}
const ordinary=FIGHTERS.map((_,i)=>i).filter(i=>![6,12,13,14,15].includes(i));
test('ordinary kicks connect once when a rival enters during active frames in either slot',()=>{
 for(const c of ordinary)for(const id of [0,1]){
  const g=ready(c,id),a=g.fighters[id],b=g.fighters[1-id],m=moveFor(c,'kick');
  step(g,a.move.wind+m.active*.2);assert.equal(b.hp,100);
  b.x=a.x+a.face*(m.range-6);step(g,m.active*.3);
  assert.ok(b.hp<100,`${c}/${id} missed active contact`);const hp=b.hp;step(g,.7);assert.equal(b.hp,hp);
 }
});
test('every fighter low kick keeps active contact without triggering a special ground setup',()=>{
 for(let c=0;c<FIGHTERS.length;c++)for(const id of [0,1]){
  const g=ready(c,id,true),a=g.fighters[id],b=g.fighters[1-id],m=moveFor(c,'kick');
  step(g,a.move.wind+m.active*.2);assert.equal(b.hp,100);
  b.x=a.x+a.face*((a.move.range??m.range)-6);step(g,m.active*.3);
  assert.ok(b.hp<100,`${c}/${id} low kick missed`);assert.equal(g.traps.length,0);assert.equal(g.projectiles.length,0);
 }
});
test('a late kick respects guard and recovery cannot create a delayed hit',()=>{
 const g=ready(0,0),m=moveFor(0,'kick');g.dummy='guard';step(g,m.wind+m.active*.2);
 g.fighters[1].x=440;step(g,m.active*.3);assert.equal(g.fighters[1].hp,98);
 assert.equal(g.fighters[0].move.connected,false);assert.equal(g.attack(0,'punch'),false);
 const miss=ready(0,0);step(miss,m.wind+m.active+.02);miss.fighters[1].x=440;step(miss,.15);assert.equal(miss.fighters[1].hp,100);
});
