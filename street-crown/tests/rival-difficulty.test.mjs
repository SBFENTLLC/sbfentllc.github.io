import test from 'node:test';import assert from 'node:assert/strict';
import {Race} from '../race.mjs';
test('difficulty and later districts increase rival pace while Easy retains its original pace',()=>{
 for(let track=0;track<6;track++){
  const easy=new Race({track,difficulty:'easy'}),normal=new Race({track,difficulty:'normal'}),hard=new Race({track,difficulty:'heat'});
  assert.equal(easy.rivalPace,.84+Math.min(3,track)*.01);assert.ok(easy.rivalPace<normal.rivalPace&&normal.rivalPace<hard.rivalPace);
 }
});
test('advanced rivals commit to a nitro burst and save fuel before starting another',()=>{
 for(const difficulty of ['normal','heat']){
  const g=new Race({difficulty}),r=g.racers[1];r.distance=0;r.fuel=60;
  assert.equal(g.ai(r,.01).boost,true);r.nitro=true;r.fuel=20;assert.equal(g.ai(r,.01).boost,true);
  r.nitro=false;assert.equal(g.ai(r,.01).boost,false);r.nitro=true;r.fuel=0;assert.equal(g.ai(r,.01).boost,false);
 }
 const practice=new Race({practice:true,difficulty:'heat'});assert.equal(practice.ai(practice.racers[1],.01).boost,false);
});
test('advanced rivals wait for a forward target before spending ice or fire',()=>{
 for(const difficulty of ['normal','heat'])for(const item of ['ice-block','fireball','rocket']){
  const g=new Race({difficulty}),r=g.racers[1];g.phase='racing';g.random=()=>.01;r.distance=10000;r.attackCd=100;r.defenseCd=100;r.item=item;
  for(const other of g.racers)if(other!==r)other.distance=0;
  g.ai(r,.1);assert.equal(r.item,item);g.racers[2].distance=10700;g.ai(r,.1);assert.equal(r.item,null);assert.equal(g.shots.length,1);
 }
});
test('difficulty does not alter the player engine, steering, nitro consumption or wallet upgrades',()=>{
 const models=['easy','normal','heat'].map(difficulty=>new Race({difficulty,upgrades:{speed:3,nitro:2}}));
 for(const g of models){g.phase='racing';g.ai=()=>({accelerate:false});for(let i=0;i<60;i++)g.step(1/120,{accelerate:true,boost:true,steer:.1});}
 const state=g=>['speed','distance','x','fuel','health'].map(k=>g.player[k]);assert.deepEqual(state(models[0]),state(models[1]));assert.deepEqual(state(models[1]),state(models[2]));
});
test('all courses finish with finite rival state on Normal and Hard',()=>{
 for(const difficulty of ['normal','heat'])for(let track=0;track<6;track++){
  const g=new Race({difficulty,track,laps:1,seed:31});
  for(let n=0;n<9000&&g.phase!=='finished';n++)g.step(1/60,g.phase==='racing'?g.ai(g.player,1/60):{});
  assert.equal(g.phase,'finished',`${difficulty}/${track}`);assert.ok(g.racers.every(r=>['x','speed','distance','fuel','health'].every(k=>Number.isFinite(r[k]))));
 }
});
