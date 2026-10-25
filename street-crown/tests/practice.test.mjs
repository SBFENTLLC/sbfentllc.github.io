import test from 'node:test';
import assert from 'node:assert/strict';
import {Race} from '../race.mjs';
import {PRACTICE_ZONES,moveToPracticeZone,practiceProgress} from '../practice.mjs';

test('an item cannot complete the signature-power lesson; a real signature can',()=>{
 const race=new Race({practice:true});race.phase='racing';moveToPracticeZone(race,'power');race.drain();
 assert.equal(race.fire(0,true),true);
 const item=race.drain().find(e=>e.type==='attack');assert.equal(item.item,true);
 assert.equal(practiceProgress(race,item),false);assert.deepEqual(race.practiceDone,[]);
 assert.equal(race.fire(),true);
 const signature=race.drain().find(e=>e.type==='attack');assert.equal(signature.item,false);
 assert.equal(practiceProgress(race,signature),true);assert.deepEqual(race.practiceDone,['power']);
 assert.equal(practiceProgress(race,signature),false);
});

test('every practice zone clears ice, fire and spin while retaining racer identity and lessons',()=>{
 for(const zone of Object.keys(PRACTICE_ZONES)){
  const race=new Race({practice:true,character:3});race.phase='racing';race.practiceDone=['guard'];
  const identities=race.racers.map(r=>[r.char,r.wrap,r.vehicleId]);
  for(const r of race.racers)Object.assign(r,{frozen:1.4,burning:1.6,spin:1,spinTotal:1,dazed:2,ghostTime:3,health:0,nitro:true});
  assert.equal(moveToPracticeZone(race,zone),true);
  for(const r of race.racers){for(const field of ['frozen','burning','spin','spinTotal','dazed','ghostTime'])assert.equal(r[field],0);assert.equal(r.health,100);assert.equal(r.nitro,false);}
  assert.deepEqual(race.racers.map(r=>[r.char,r.wrap,r.vehicleId]),identities);assert.deepEqual(race.practiceDone,['guard']);
  assert.equal(race.fire(),true);
 }
});

test('practice controls do not reset a real race',()=>{
 const race=new Race();const before=race.snapshot();
 assert.equal(moveToPracticeZone(race,'power'),false);assert.deepEqual(race.snapshot(),before);
 assert.equal(practiceProgress(race,{id:0,type:'attack',item:false}),false);
});
