import test from 'node:test';
import assert from 'node:assert/strict';
import {ArenaBeat,ARENA_REACTIONS,arenaMotion,drawArenaBeat} from './arena-beat.mjs';
import {Soundtrack} from './music.mjs';
function drawing(){const calls=[];const gradient={addColorStop(){}};const ctx=new Proxy({createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??((...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),k);calls.push([k,...args]);})});return {ctx,calls};}
const image={complete:true,naturalWidth:1672,naturalHeight:941};
test('bass analysis drives motion from real audio and settles after silence or pause',()=>{
 let value=0;const b=new ArenaBeat();b.data=new Uint8Array(128);b.analyser={getByteFrequencyData(a){a.fill(value);}};
 b.tick(.05,true);assert.equal(arenaMotion(b).energy,0);value=210;b.tick(.05,true);assert(arenaMotion(b).kick>.8);const time=b.time;
 for(let i=0;i<120;i++)b.tick(1/60,false);assert.equal(b.time,time);assert.equal(b.pulse,0);assert(b.level<.00001);
 value=0;for(let i=0;i<120;i++)b.tick(1/60,true);assert(arenaMotion(b).energy<.00001);
});
test('every arena moves actual bounded props on bass, keeps the backdrop fixed and draws finite geometry',()=>{
 assert.equal(Object.keys(ARENA_REACTIONS).length,8);
 for(const arena of Object.keys(ARENA_REACTIONS)){
  const idle=drawing(),hit=drawing();drawArenaBeat(idle.ctx,image,{pulse:0,level:0},{arena});drawArenaBeat(hit.ctx,image,{pulse:1,level:.8,time:.1},{arena});
  assert.deepEqual(hit.calls.find(c=>c[0]==='drawImage'),['drawImage',image,0,0,1000,562.5]);
  assert(hit.calls.filter(c=>c[0]==='drawImage').length>idle.calls.filter(c=>c[0]==='drawImage').length);
  assert(!hit.calls.some(c=>c[0]==='scale'||c[0]==='rotate')); // no camera zoom or rotation
  for(const [x,y,w,h] of ARENA_REACTIONS[arena].props){assert(x>=0&&x+w<=1000);assert(y>=0&&y+h<340);}
  for(const c of hit.calls.filter(c=>c[0]==='drawImage'&&c.length===10)){assert(c[2]>=0&&c[3]>=0);assert(c[2]+c[4]<=image.naturalWidth+.01);assert(c[3]+c[5]<=image.naturalHeight+.01);assert(c[8]>0&&c[9]>0);}
 }
});
test('reduced motion renders the same scene at silence and full bass; missing artwork is safe',()=>{
 for(const arena of Object.keys(ARENA_REACTIONS)){
  const a=drawing(),b=drawing();drawArenaBeat(a.ctx,image,{pulse:0,level:0},{arena,reduced:true});drawArenaBeat(b.ctx,image,{pulse:1,level:1,time:99},{arena,reduced:true});assert.deepEqual(a.calls,b.calls);
 }
 const a=drawing();drawArenaBeat(a.ctx,null,{pulse:1});assert.equal(a.calls.length,0);assert.deepEqual(arenaMotion({pulse:Infinity,level:NaN}),{energy:0,kick:0,vibration:0});
});
test('music OFF, zero volume, suspended, loading and paused audio do not feed environmental motion',()=>{
 const audio={paused:false,volume:.35,addEventListener(){},pause(){this.paused=true;}},m=new Soundtrack(audio);let playing;m.beat.tick=(_dt,p)=>{playing=p;};m.status='playing';m.tick(.05);assert.equal(playing,true);
 for(const state of [{enabled:false},{level:0},{suspended:true},{status:'loading'}]){const saved={enabled:m.enabled,level:m.level,suspended:m.suspended,status:m.status};Object.assign(m,state);m.tick(.05);assert.equal(playing,false);Object.assign(m,saved);}
 audio.paused=true;m.tick(.05);assert.equal(playing,false);
});
