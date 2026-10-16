import test from 'node:test';
import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';
import {FIGHTERS,moveFor} from './roster.mjs';
const step=(g,t,keys={})=>{for(let i=0;i<Math.ceil(t*120);i++)g.step(1/120,keys);};
function ready(char=0,id=0,distance=150){const g=new Fight({training:true,characters:id?[1,char]:[char,1]});step(g,1.7);g.fighters[0].x=400;g.fighters[1].x=400+distance;g.events=[];return g;}
test('Flex punch connects at the same 150-unit spacing as his kick in either slot',()=>{for(const id of [0,1])for(const move of ['punch','kick']){const g=ready(0,id);g.attack(id,move);step(g,.3);assert.equal(g.fighters[1-id].hp,100-moveFor(0,move).damage);}});
test('every fighter punch connects at its revised edge and still misses outside reach',()=>{for(let c=0;c<FIGHTERS.length;c++)for(const id of [0,1]){const m=moveFor(c,'punch');for(const [distance,hit] of [[m.range-2,true],[m.range+45,false]]){const g=ready(c,id,distance);g.attack(id,'punch');step(g,.4);assert.equal(g.fighters[1-id].hp,hit?100-m.damage:100,`${c}/${id}/${distance}`);}}});
test('a target entering during active punch frames gets hit exactly once',()=>{const g=ready(0,0,220);g.attack(0,'punch');step(g,.10);assert.equal(g.fighters[1].hp,100);assert.equal(g.fighters[0].move.hit,false);g.fighters[1].x=550;step(g,.06);assert.equal(g.fighters[1].hp,88);step(g,.2);assert.equal(g.fighters[1].hp,88);});
test('entering after the active window cannot turn recovery into a late hit',()=>{const g=ready(0,0,220);g.attack(0,'punch');step(g,.21);g.fighters[1].x=500;step(g,.12);assert.equal(g.fighters[1].hp,100);});
test('late punch contact still respects guard and landed-hit combo rules',()=>{const g=ready(0,0,220);g.dummy='guard';g.attack(0,'punch');step(g,.10);g.fighters[1].x=550;step(g,.06);assert.equal(g.fighters[1].hp,98);assert.equal(g.attack(0,'kick'),false);assert.equal(g.fighters[0].move.connected,false);});
