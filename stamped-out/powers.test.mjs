import test from 'node:test';import assert from 'node:assert/strict';
import {Fight} from './engine.mjs';import {POWERS,powerFor,drawPowerShot} from './powers.mjs';
const step=(g,t,keys={})=>{for(let n=0;n<Math.ceil(t*120);n++)g.step(1/120,keys);};
function ready(char,id=0,dummy='stand'){const g=new Fight({training:true,characters:id?[0,char]:[char,0],dummy});g.phase='fight';g.fighters[0].x=340;g.fighters[1].x=660;g.events=[];return g;}
test('all sixteen powers work in either slot at zero super meter, hit once, and push away',()=>{
 assert.equal(POWERS.length,16);assert.equal(new Set(POWERS.map(p=>p.name)).size,16);assert.equal(new Set(POWERS.map(p=>p.shape)).size,16);
 for(let char=0;char<16;char++)for(let id=0;id<2;id++){const g=ready(char,id);g.training=false;g.aiInput=()=>({});const a=g.fighters[id],b=g.fighters[1-id];a.power=0;const distance=Math.abs(a.x-b.x);assert(g.attack(id,'ability'),char+'/'+id);assert.equal(a.power,0);assert(a.abilityCooldown>0);step(g,1.6);const hits=g.drainEvents().filter(e=>e.type==='hit'&&e.id===id);assert.equal(hits.length,1,char+'/'+id);assert.equal(hits[0].move,'ability');assert.equal(b.hp,100-powerFor(char).damage);assert(Math.abs(a.x-b.x)>distance);assert.equal(g.projectiles.length,0);assert.equal(g.sequence,null);assert.equal(g.attack(id,'ability'),false);}
});
test('every power can be guarded or jumped, and expires outside its range',()=>{
 for(let c=0;c<16;c++){
  const b=ready(c,0,'guard');b.attack(0,'ability');step(b,1.6);assert.equal(b.fighters[1].hp,100-Math.ceil(powerFor(c).damage*.12));assert.equal(b.fighters[1].knockdown,0);
  const j=ready(c);j.attack(0,'ability');for(let n=0;n<200;n++){Object.assign(j.fighters[1],{y:260,vy:0});j.step(1/120);}assert.equal(j.fighters[1].hp,100);
  const miss=ready(c);miss.fighters[0].x=100;miss.fighters[1].x=900;miss.attack(0,'ability');step(miss,2);assert.equal(miss.fighters[1].hp,100);assert.equal(miss.projectiles.length,0);
 }
});
test('cooldown survives interruption, cannot stack, and recharges in production play',()=>{
 const g=ready(0);g.training=false;g.aiTime=100;g.attack(0,'ability');g.applyHit(1,5);step(g,.7);assert.equal(g.projectiles.length,0);assert(g.fighters[0].abilityCooldown>0);assert.equal(g.attack(0,'ability'),false);step(g,5);g.fighters[1].x=900;assert(g.attack(0,'ability'));step(g,.3);assert.equal(g.projectiles.length,1);g.fighters[0].abilityCooldown=0;g.fighters[0].move=null;g.fighters[0].cooldown=0;assert.equal(g.attack(0,'ability'),false,'One shot per owner');
});
test('fast opposing powers clash; throws, supers, and round resets clear them',()=>{
 const g=ready(8);g.characters=[8,8];g.fighters[1].character=8;g.attack(0,'ability');g.attack(1,'ability');step(g,.6);assert(g.drainEvents().some(e=>e.type==='waveClash'));assert.equal(g.fighters[0].hp,100);assert.equal(g.fighters[1].hp,100);
 for(const kind of ['throw','super']){const p=ready(0);p.attack(0,'ability');step(p,.3);assert.equal(p.projectiles.length,1);p.beginSequence(kind,1);assert.equal(p.projectiles.length,0);p.resetRound();assert.equal(p.fighters[0].abilityCooldown,0);}
});
test('a ranged hit during the owner’s air attack cannot cause an air juggle',()=>{const g=ready(0);g.attack(0,'ability');step(g,.32);g.fighters[0].move=null;g.fighters[0].cooldown=0;Object.assign(g.fighters[0],{y:100,vy:100});assert(g.attack(0,'kick')); for(let n=0;n<50;n++)g.step(1/120);assert.equal(g.fighters[1].juggleHits,0);assert.equal(g.fighters[1].knockdown,0);});
test('all power silhouettes draw with finite coordinates, including reduced motion',()=>{const finite=(...args)=>{for(const v of args)if(typeof v==='number')assert(Number.isFinite(v));};const ctx=new Proxy({},{get:()=>finite,set:()=>true});for(const p of POWERS)for(const face of [-1,1])for(const reduced of [false,true])drawPowerShot(ctx,{...p,x:500,y:150,face,age:.7,ability:true},reduced);});
test('regular Bootlegger guards early, retreats from rushes and fires his own card',()=>{const g=ready(1,1);g.training=false;g.aiTime=.35;g.fighters[0].x=550;g.fighters[0].move={name:'punch'};assert.equal(g.aiInput().block,true);g.fighters[0].move=null;assert.equal(g.aiInput().right,true);g.fighters[0].x=340;g.aiTime=0;g.aiInput();assert.equal(g.fighters[1].move?.name,'ability');});
test('super meter is earned slower from clean hits, barely from guard, and never from sequences',()=>{const g=ready(0);g.training=false;g.fighters.forEach(f=>f.power=0);g.applyHit(0,1);assert.equal(g.fighters[0].power,10);assert.equal(g.fighters[1].power,2);g.applyHit(0,1,{blocked:true});assert.equal(g.fighters[0].power,11);assert.equal(g.fighters[1].power,3);g.applyHit(0,1,{move:'ability'});assert.equal(g.fighters[0].power,14);const before=g.fighters.map(f=>f.power);g.applyHit(0,2,{move:'special',sequence:true});assert.deepEqual(g.fighters.map(f=>f.power),before);assert.equal(g.attack(0,'special'),false);});
