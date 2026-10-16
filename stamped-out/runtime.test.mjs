// Runs the actual UI module with lightweight DOM/audio/canvas doubles. This
// catches startup/render/event exceptions; it is not browser or device QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('UI starts, handles multi-touch, renders a complete cinematic, and pauses',async()=>{
 const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
 class Element{
  constructor(){this.events={};this.hidden=false;this.style={};this.value='';this.checked=false;this.classList={add(){},remove(){},toggle(){}};this.dataset={};}
  addEventListener(n,fn){(this.events[n]??=[]).push(fn);}
  setAttribute(){}append(){}focus(){}showModal(){this.open=true;}close(){this.open=false;}matches(){return false;}setPointerCapture(){}
  emit(n,e={}){for(const fn of this.events[n]||[])fn({preventDefault(){},target:this,...e});}
 }
 const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
 for(const id of ['pauseMenu','hud','controls','nowPlaying'])elements[id].hidden=true;
 elements.difficulty.value='medium';elements.training.checked=true;elements.sound.checked=false;
 const buttons={};for(const key of ['left','right','jump','crouch','block']){buttons[key]=new Element();buttons[key].dataset.hold=key;}
 for(const key of ['punch','kick','grab','special']){buttons[key]=elements[key]||new Element();buttons[key].dataset.action=key;}
 const selects=[new Element(),new Element()],ranges=[new Element(),new Element()],musicButtons=[new Element(),new Element()];
 let draws=0,queue=[];const gradient={addColorStop(){}};
 const ctx=new Proxy({drawImage(){draws++;},createRadialGradient(){return gradient;}},{get:(o,k)=>k in o?o[k]:()=>{}});
 elements.arena.getContext=()=>ctx;
 globalThis.document={hidden:false,getElementById:id=>elements[id],createElement:()=>new Element(),addEventListener(){},querySelectorAll:s=>s==='[data-track]'?selects:s==='[data-volume]'?ranges:s==='[data-music]'?musicButtons:s==='[data-hold],[data-action]'?Object.values(buttons):s==='[data-hold]'?Object.values(buttons).filter(b=>b.dataset.hold):[]};
 Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
 globalThis.matchMedia=()=>({matches:false});globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.devicePixelRatio=1;
 globalThis.addEventListener=()=>{};globalThis.requestAnimationFrame=fn=>queue.push(fn);
 globalThis.localStorage={getItem:()=>null,setItem(){}};
 globalThis.Image=class{constructor(){this.complete=true;this.naturalWidth=1261;this.naturalHeight=1247;}decode(){return Promise.resolve();}};
 globalThis.Audio=class{addEventListener(){}pause(){}play(){return Promise.resolve();}};
 await import('./game.js');await Promise.resolve();
 elements.start.emit('click');assert.equal(elements.menu.hidden,true);assert.equal(elements.controls.hidden,false);
 let clock=performance.now();const frame=()=>{clock+=1000/60;const callbacks=queue;queue=[];for(const fn of callbacks)fn(clock);};
 for(let i=0;i<110;i++)frame();
 buttons.right.emit('pointerdown',{pointerId:1});buttons.punch.emit('pointerdown',{pointerId:2});
 for(let i=0;i<70;i++)frame();buttons.right.emit('pointercancel',{pointerId:1});buttons.punch.emit('pointerup',{pointerId:2});
 buttons.special.emit('pointerdown',{pointerId:3});
 const before=draws;for(let i=0;i<400;i++)frame();assert(draws>before+400,'Cinematic and fighters were rendered');
 assert.equal(elements.hp1.style.width,'74%');assert.equal(elements.timer.textContent.length,2);elements.pause.emit('click');assert.equal(elements.pauseMenu.hidden,false);
 const time=elements.timer.textContent;for(let i=0;i<60;i++)frame();assert.equal(elements.timer.textContent,time);
 elements.resume.emit('click');assert.equal(elements.pauseMenu.hidden,true);
 elements.exit.emit('click');assert.equal(elements.menu.hidden,false);assert.equal(elements.controls.hidden,true);
 elements.controlSize.value='large';elements.controlSize.emit('change');elements.controlHand.value='left';elements.controlHand.emit('change');assert.equal(elements.controls.dataset.size,'large');assert.equal(elements.controls.dataset.hand,'left');
 elements.dummy.value='guard';elements.start.emit('click');for(let i=0;i<110;i++)frame();buttons.right.emit('pointerdown',{pointerId:4});for(let i=0;i<70;i++)frame();buttons.right.emit('pointerup',{pointerId:4});buttons.special.emit('pointerdown',{pointerId:5});for(let i=0;i<240;i++)frame();assert.equal(elements.hp1.style.width,'96%','Guard training blocks the super cinematic');assert.equal(elements.coach.hidden,false);
 elements.pause.emit('click');assert.equal(elements.resetPractice.hidden,false);elements.resetPractice.emit('click');assert.equal(elements.pauseMenu.hidden,true);assert.equal(elements.hp1.style.width,'96%');frame();assert.equal(elements.hp1.style.width,'100%');elements.exit.emit('click');
 elements.pick2.emit('click');elements.opponentCharacter.value='3';elements.opponentCharacter.emit('change');elements.dummy.value='stand';elements.start.emit('click');assert.equal(elements.name0.textContent,'FOXY');assert.equal(elements.name1.textContent,'CLARA');assert.equal(elements.menu.hidden,true);
 for(let i=0;i<110;i++)frame();assert(elements.coachText.textContent.includes('K → K'));buttons.right.emit('pointerdown',{pointerId:6});for(let i=0;i<70;i++)frame();buttons.right.emit('pointerup',{pointerId:6});buttons.special.emit('pointerdown',{pointerId:7});for(let i=0;i<400;i++)frame();assert.equal(elements.hp1.style.width,'76%');elements.exit.emit('click');
 elements.playerCharacter.value='3';elements.playerCharacter.emit('change');elements.opponentCharacter.value='1';elements.opponentCharacter.emit('change');elements.start.emit('click');assert.equal(elements.name0.textContent,'CLARA');assert.equal(elements.name1.textContent,'THE BOOTLEGGER');for(let i=0;i<110;i++)frame();buttons.right.emit('pointerdown',{pointerId:8});for(let i=0;i<70;i++)frame();buttons.right.emit('pointerup',{pointerId:8});buttons.special.emit('pointerdown',{pointerId:9});for(let i=0;i<420;i++)frame();assert.equal(elements.hp1.style.width,'72%');elements.exit.emit('click');
});
