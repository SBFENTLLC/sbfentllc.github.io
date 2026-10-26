import test from 'node:test';import assert from 'node:assert/strict';
import {paintGarageCards} from '../garage-art.mjs';
function image(){const events=new Map();return{complete:false,naturalWidth:0,addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:(name,fn)=>{if(events.get(name)===fn)events.delete(name);},load(){this.complete=true;this.naturalWidth=320;const fn=events.get('load');events.delete('load');fn?.();}};}
test('opening before artwork loads repaints every vehicle with the loaded image',()=>{
 const img=image(),cards=Array.from({length:7},()=>({painted:false})),root={querySelectorAll:()=>cards};
 paintGarageCards(root,img,c=>{c.painted=img.naturalWidth>0;});
 assert.ok(cards.every(c=>!c.painted));img.load();assert.ok(cards.every(c=>c.painted));
});
test('switching racers cancels the old artwork callback and repaints the current cards',()=>{
 const old=image(),current=image(),card={},root={querySelectorAll:()=>[card]};
 paintGarageCards(root,old,c=>{c.racer='old';});paintGarageCards(root,current,c=>{c.racer='current';});
 old.load();assert.equal(card.racer,'current');current.load();assert.equal(card.racer,'current');
});
test('already loaded artwork paints immediately without waiting for a load event',()=>{
 const img=image();img.load();let draws=0;paintGarageCards({querySelectorAll:()=>[{},{}]},img,()=>draws++);assert.equal(draws,2);
});
