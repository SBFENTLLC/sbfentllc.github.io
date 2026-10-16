import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {Soundtrack,TRACKS} from './music.mjs';
const audio=()=>({addEventListener(){},pause(){},play(){return Promise.resolve();}});
test('all fourteen selectable tracks resolve to packaged files and FOUR FLAT uses repaired URL',async()=>{
 assert.equal(TRACKS.length,14);assert.equal(new Set(TRACKS.map(t=>t.id)).size,14);
 const m=new Soundtrack(audio());m.unlocked=true;
 for(const t of TRACKS){assert(existsSync(new URL('./audio/'+t.file,import.meta.url)));await m.select(t.id);assert.equal(m.audio.src,'audio/'+t.file);assert.equal(m.status,'playing');}
 assert.equal(TRACKS.find(t=>t.id==='four-flat').file,'four-flat-v2.m4a');
});
test('automatic fight rotation reaches every fight track and preserves scene music',()=>{
 const m=new Soundtrack(audio());m.context='fight';const ids=new Set();for(let i=0;i<12;i++){m.match=i;ids.add(m.choose().id);}assert.equal(ids.size,12);
 for(const t of TRACKS.filter(t=>!['modest','one-night-stand'].includes(t.id)))assert(ids.has(t.id));
 m.context='menu';assert.equal(m.choose().id,'modest');m.context='training';assert.equal(m.choose().id,'one-night-stand');
});
