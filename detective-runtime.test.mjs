import {stepLizard,lizardFrame,lizardType,typeForSpawn,LIZARD_TYPES} from './detective-chase.mjs';
import {LIZARD_ART,RIG_FRAMES} from './detective-lizard-art.mjs';
import {roundedPrism,canopy,puppetPose,facingView} from './detective-shapes.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import {walkingPath} from './detective-navigation.mjs';
import * as saves from './detective-save.mjs';
import {CanvasWorld} from './detective-canvas.mjs';
function harness({graphics=true,story=null}={}){
 const memory=new Map([['sbfent-story-v1','{"version":4,"active":2,"chapters":[]}']]);if(story)memory.set(saves.DETECTIVE_STORY_KEY,JSON.stringify(story));
 const events={},elements=new Map(),raf=new Map();let frameId=0,now=0,world,context;
 const noop=()=>{},canvasCtx=new Proxy({createLinearGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]??noop});
 const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:()=>({}),createTexture:()=>({}),createBuffer:()=>({}),createShader:()=>({}),createProgram:()=>({})},{get:(o,k)=>o[k]??(k.toUpperCase()===k?1:noop)});
 class E{
  constructor(){this.events={};this.style={};this.hidden=false;this.disabled=false;this.value='';this.textContent='';this.clientWidth=844;this.clientHeight=390;this.classList={add:noop,remove:noop,toggle:noop};}
  addEventListener(n,f){(this.events[n]??=[]).push(f);}emit(n,e={}){for(const f of this.events[n]||[])f({target:this,preventDefault:noop,...e});}
  setAttribute(){}focus(){context.document.activeElement=this;}contains(){return true;}getContext(type){return type==='webgl'?(graphics?gl:null):canvasCtx;}setPointerCapture(){}click(){this.emit('click');}
  querySelector(s){if(!elements.has(s))elements.set(s,new E());return elements.get(s);}querySelectorAll(){return [];}getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}
 }
 const root=new E();world=root.querySelector('canvas[data-world]');root.querySelector('[data-game-mode]').value='regular';root.querySelector('[data-game-location]').value='0';
 const doc={activeElement:null,hidden:false,querySelector:s=>s==='#detective-flex-game'?root:root.querySelector(s),querySelectorAll:()=>[],createElement:()=>new E(),addEventListener:(n,f)=>(events[n]??=[]).push(f)};
 context={stepLizard,lizardFrame,lizardType,typeForSpawn,LIZARD_TYPES,LIZARD_ART,RIG_FRAMES,...saves,roundedPrism,canopy,puppetPose,facingView,walkingPath,CanvasWorld,document:doc,localStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},console,Math,JSON,Float32Array,Uint8Array,Number,Set,Map,setTimeout,clearTimeout,queueMicrotask,performance:{now:()=>now},devicePixelRatio:1,Audio:class{pause(){}play(){return Promise.resolve();}},Image:class{set src(v){queueMicrotask(()=>this.onload?.());}},requestAnimationFrame:f=>{raf.set(++frameId,f);return frameId;},cancelAnimationFrame:id=>raf.delete(id),addEventListener:(n,f)=>(events[n]??=[]).push(f),location:{reload:noop}};
 context.window=context;
 let source=fs.readFileSync(new URL('./detective-flex-game.js',import.meta.url),'utf8').replace(/^import[^\n]+\n/gm,'');
 source=source.replace(/\}\)\(\);\s*$/,`window.inspectDetective=()=>({state,inside,player:{...player},score,remaining,targets:targets.length,reaction:reaction?.type||null,bodyHeading,currentView});})();`);
 vm.runInNewContext(source,context);
 return {root,world,context,memory,events,step(ms=100){now+=ms;const f=[...raf.values()];raf.clear();f.forEach(fn=>fn(now));},inspect:()=>context.inspectDetective?.()};
}
test('actual detective UI resumes inside the saved room and pauses safely across rotation',async()=>{
 const h=harness({story:{version:1,location:2,level:4,collected:[1,3,6],inside:true,player:{x:2,z:-4,yaw:1.2}}});await Promise.resolve();
 h.root.querySelector('[data-game-start]').click();let q=h.inspect();assert.equal(q.state,'playing');assert.equal(q.inside,true);assert.equal(q.player.x,2);assert.equal(q.player.z,-4);assert.equal(q.score,233);
 assert.match(h.root.querySelector('[data-search-clue]').textContent,/lizards left inside/);
 h.events.resize.forEach(f=>f());q=h.inspect();assert.equal(q.state,'paused');assert.equal(h.root.querySelector('[data-game-start]').textContent,'Resume search');
 const saved=JSON.parse(h.memory.get(saves.DETECTIVE_STORY_KEY));assert.equal(saved.inside,true);assert.equal(saved.player.z,-4);assert.equal(h.memory.get('sbfent-story-v1'),'{"version":4,"active":2,"chapters":[]}');
 h.root.querySelector('[data-game-start]').click();assert.equal(h.inspect().state,'playing');h.events.pagehide.forEach(f=>f());assert.equal(h.inspect().state,'paused');
});
test('a timed case pauses without consuming the remaining clock in the background',async()=>{
 const h=harness();await Promise.resolve();h.root.querySelector('[data-game-start]').click();h.step(1000);assert.equal(h.inspect().remaining,59);h.root.querySelector('[data-game-pause]').click();h.step(9000);assert.equal(h.inspect().remaining,59);h.root.querySelector('[data-game-start]').click();h.step(1000);assert.equal(h.inspect().remaining,58);
});
test('the animated game starts and keeps backups available without WebGL',()=>{
 const h=harness({graphics:false});h.root.querySelector('[data-game-start]').click();assert.equal(h.inspect().state,'playing');assert.equal(h.root.querySelector('[data-detective-backup]').events.click.length,1);assert.equal(h.root.querySelector('[data-detective-restore]').events.change.length,1);
});
test('Canvas movement and doorway transitions work at every location without changing collision or save coordinates',async()=>{for(let location=0;location<4;location++){const h=harness({graphics:false});await Promise.resolve();h.root.querySelector('[data-game-location]').value=String(location);h.root.querySelector('[data-game-start]').click();h.context.document.activeElement=h.world;h.events.keydown.forEach(f=>f({key:'w',code:'KeyW',preventDefault(){}}));for(let n=0;n<99;n++)h.step(50);h.events.keyup.forEach(f=>f({key:'w'}));assert.ok(h.inspect().player.z<-12);h.root.querySelector('[data-game-action]').click();assert.equal(h.inspect().inside,true);assert.equal(h.inspect().player.z,6);h.events.resize.forEach(f=>f());assert.equal(h.inspect().state,'paused');}});

test('tap-to-walk reaches a ground destination and manual input takes over',()=>{const h=harness();h.root.querySelector('[data-game-start]').click();const c=new CanvasWorld({createLinearGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},arc(){},fill(){}});c.begin([0,12.5,33],[0,0,10],844,390);const p=c.project([3,0,8]),x=p[0]/844*100,y=p[1]/390*100;h.world.emit('pointerdown',{pointerId:1,clientX:x,clientY:y});h.world.emit('pointerup',{pointerId:1,clientX:x,clientY:y});for(let n=0;n<30;n++)h.step(50);let q=h.inspect();assert.ok(Math.hypot(q.player.x-3,q.player.z-8)<.4);h.world.emit('pointerdown',{pointerId:2,clientX:50,clientY:20});h.world.emit('pointerup',{pointerId:2,clientX:50,clientY:20});h.context.document.activeElement=h.world;h.events.keydown.forEach(f=>f({key:'s',preventDefault(){}}));const z=q.player.z;h.step(50);assert.ok(h.inspect().player.z>z);});

test('scan reaction expires and pause clears transient animation',()=>{const h=harness();h.root.querySelector('[data-game-start]').click();h.root.querySelector('[data-game-scan]').click();assert.equal(h.inspect().reaction,'scan');for(let n=0;n<20;n++)h.step(50);assert.equal(h.inspect().reaction,null);h.root.querySelector('[data-game-pause]').click();assert.equal(h.inspect().reaction,null);assert.equal(h.inspect().bodyHeading,0);});

test('movement selects rear and profile artwork and retains facing while paused',()=>{const h=harness();h.root.querySelector('[data-game-start]').click();h.context.document.activeElement=h.world;const key=(type,k)=>h.events[type].forEach(f=>f({key:k,preventDefault(){}}));key('keydown','w');h.step(50);key('keyup','w');assert.equal(h.inspect().currentView,'back');key('keydown','d');h.step(50);key('keyup','d');assert.equal(h.inspect().currentView,'right');h.root.querySelector('[data-game-pause]').click();assert.equal(h.inspect().currentView,'right');h.root.querySelector('[data-game-start]').click();assert.equal(h.inspect().currentView,'right');});
