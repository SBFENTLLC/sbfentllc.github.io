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
 for(const [char,damage,pointer] of [[4,34,10],[5,29,11],[6,29,12],[7,31,13],[8,25,14],[9,36,15],[10,28,16],[11,31,17]]){elements['pick'+char].emit('click');elements.opponentCharacter.value=char===4?'5':'4';elements.opponentCharacter.emit('change');elements.start.emit('click');assert.equal(elements.name0.textContent,({4:'GOLDIE',5:'ONYX',6:'DJ BLACKOUT',7:'QUIET MONEY',8:'NEON NOVA',9:'BIG STAMP',10:'VIOLET V',11:'REDLINE'})[char]);for(let i=0;i<110;i++)frame();buttons.right.emit('pointerdown',{pointerId:pointer});for(let i=0;i<110;i++)frame();buttons.right.emit('pointerup',{pointerId:pointer});buttons.special.emit('pointerdown',{pointerId:pointer+10});for(let i=0;i<430;i++)frame();assert.equal(elements.hp1.style.width,(100-damage)+'%');elements.exit.emit('click');}
 elements.pick6.emit('click');elements.opponentCharacter.value='0';elements.opponentCharacter.emit('change');elements.start.emit('click');for(let i=0;i<110;i++)frame();assert.equal(elements.kickLabel.textContent,'WAVE');buttons.kick.emit('pointerdown',{pointerId:30});for(let i=0;i<100;i++)frame();assert.equal(elements.hp1.style.width,'91%');elements.exit.emit('click');
 for(const [dummy,hp] of [['guard','90%'],['lowguard','98%']]){elements.pick10.emit('click');elements.dummy.value=dummy;elements.start.emit('click');for(let i=0;i<110;i++)frame();buttons.right.emit('pointerdown',{pointerId:40});for(let i=0;i<70;i++)frame();buttons.right.emit('pointerup',{pointerId:40});assert.equal(elements.kickLabel.textContent,'SWEEP');buttons.kick.emit('pointerdown',{pointerId:41});for(let i=0;i<80;i++)frame();assert.equal(elements.hp1.style.width,hp);elements.exit.emit('click');}
 // Independent outfit selectors, unsupported characters, and all free arenas.
 elements.pick0.emit('click');elements.playerOutfit.value='1';elements.playerOutfit.emit('change');assert.equal(elements.playerOutfit.value,'1');elements.opponentCharacter.value='0';elements.opponentCharacter.emit('change');assert.equal(elements.opponentOutfit.value,'0');elements.opponentOutfit.value='1';elements.opponentOutfit.emit('change');assert.equal(elements.playerOutfit.value,'1');elements.playerOutfit.value='0';elements.playerOutfit.emit('change');assert.equal(elements.opponentOutfit.value,'1');elements.pick4.emit('click');assert.equal(elements.playerAlternate.disabled,true);assert.equal(elements.playerOutfit.value,'0');elements.pick0.emit('click');elements.playerOutfit.value='1';elements.playerOutfit.emit('change');
 for(const arena of ['studio','vault','workshop']){elements.arenaSelect.value=arena;elements.arenaSelect.emit('change');elements.start.emit('click');for(let i=0;i<5;i++)frame();elements.exit.emit('click');}
 for(const [char,label] of [[2,'Lime SBFENT tracksuit'],[3,'Orange SBFENT tracksuit']]){elements['pick'+char].emit('click');assert.equal(elements.playerAlternate.disabled,false);assert.equal(elements.playerAlternate.textContent,label);elements.playerOutfit.value='1';elements.playerOutfit.emit('change');elements.start.emit('click');for(let i=0;i<3;i++)frame();elements.exit.emit('click');elements['pick'+char].emit('click');assert.equal(elements.playerOutfit.value,'1');}
 // Drive actual matchover events through the story UI, while model tests
 // separately cover combat. Story must ignore the training checkbox/roster.
 const {Fight}=await import('./engine.mjs');const oldStep=Fight.prototype.step;let winner=1;const storyPaces=[];
 Fight.prototype.step=function(){if(this.phase==='done')return;storyPaces.push(this.pace);this.phase='fight';this.wins[winner]=1;this.fighters[1-winner].hp=0;this.endRound();};
 try{
  elements.openStory.emit('click');assert.equal(elements.storyMenu.hidden,false);elements.storyStart.emit('click');assert.equal(elements.name0.textContent,'FLEX A LOT');assert.equal(elements.name1.textContent,'THE BOOTLEGGER');
  for(let i=0;i<260;i++)frame();assert.equal(elements.storyNext.hidden,true);assert.equal(elements.restart.hidden,false);assert.equal(elements.pick12.disabled,true);
  winner=0;elements.restart.emit('click');for(let i=0;i<260;i++)frame();assert.equal(elements.storyNext.hidden,false);
  elements.exit.emit('click');elements.openStory.emit('click');assert(elements.storyTitle.textContent.includes('02'));elements.storyStart.emit('click');assert.equal(elements.name1.textContent,'REDLINE');for(let i=0;i<260;i++)frame();
  elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'BIG PRESSURE');for(let i=0;i<260;i++)frame();assert.equal(elements.pauseTitle.textContent,'CHAPTER CLEARED');assert.equal(elements.pick12.disabled,false);assert.equal(elements.blockpartyOption.disabled,false);
  elements.storyNext.emit('click');assert.equal(elements.storyTitle.textContent,'CHAPTER 1 CLEARED');assert.equal(elements.chapterTwoOption.disabled,false);elements.chapterSelect.value='1';elements.chapterSelect.emit('change');elements.storyStart.emit('click');assert.equal(elements.name1.textContent,'DJ BLACKOUT');for(let i=0;i<260;i++)frame();elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'ONYX');for(let i=0;i<260;i++)frame();elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'LADY STATIC');assert.equal(elements.pick13.disabled,true);for(let i=0;i<260;i++)frame();assert.equal(elements.pick13.disabled,false);assert.equal(elements.undergroundOption.disabled,false);elements.storyNext.emit('click');assert.equal(elements.chapterThreeOption.disabled,false);elements.chapterSelect.value='2';elements.chapterSelect.emit('change');elements.storyStart.emit('click');assert.equal(elements.name1.textContent,'BIG STAMP');for(let i=0;i<260;i++)frame();elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'QUIET MONEY');for(let i=0;i<260;i++)frame();elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'IRON HAUL');assert.equal(elements.pick14.disabled,true);for(let i=0;i<260;i++)frame();assert.equal(elements.pick14.disabled,false);assert.equal(elements.motoryardOption.disabled,false);elements.storyNext.emit('click');assert.equal(elements.chapterFourOption.disabled,false);elements.chapterSelect.value='3';elements.chapterSelect.emit('change');elements.storyStart.emit('click');assert.equal(elements.name1.textContent,'NEON NOVA');for(let i=0;i<260;i++)frame();elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'GOLDIE');for(let i=0;i<260;i++)frame();elements.storyNext.emit('click');assert.equal(elements.name1.textContent,'THE FALSE KING');assert.equal(elements.pick15.disabled,true);for(let i=0;i<260;i++)frame();assert.equal(elements.pauseTitle.textContent,'THE REAL CROWN');assert.equal(elements.pick15.disabled,false);assert.equal(elements.penthouseOption.disabled,false);elements.storyNext.emit('click');assert.equal(elements.storyTitle.textContent,'STORY COMPLETE');elements.storyBack.emit('click');elements.pick15.emit('click');elements.start.emit('click');assert.equal(elements.name0.textContent,'THE FALSE KING');elements.exit.emit('click');elements.pick14.emit('click');elements.start.emit('click');assert.equal(elements.name0.textContent,'IRON HAUL');elements.exit.emit('click');elements.pick13.emit('click');elements.start.emit('click');assert.equal(elements.name0.textContent,'LADY STATIC');elements.exit.emit('click');elements.pick12.emit('click');elements.arenaSelect.value='blockparty';elements.start.emit('click');assert.equal(elements.name0.textContent,'BIG PRESSURE');elements.exit.emit('click');
  assert(storyPaces.some(p=>p<.9)&&storyPaces.some(p=>p>1.2),'Story UI applies the gradual CPU pressure ramp');
 }finally{Fight.prototype.step=oldStep;}

});
