import {StoryProgress} from './story.mjs';
import {KOAnnouncer} from './voices.mjs';
import {IRON_DATA} from './iron-data.mjs';
import {STATIC_DATA} from './static-data.mjs';
import {BOSS_DATA} from './boss-data.mjs';
import {Fight} from './engine.mjs';
import {FightFX} from './fx.mjs';
import {setupMusic} from './music-ui.mjs';
import {sequenceFighters} from './choreography.mjs';
import {GRAPPLE_DATA} from './grapple-data.mjs';
import {EXPANSION_DATA} from './expansion-data.mjs';
import {DUO_DATA} from './duo-data.mjs';
import {SOUND_DATA} from './sound-data.mjs';
import {NOVA_STAMP_DATA} from './nova-stamp-data.mjs';
import {VIOLET_RED_DATA} from './violet-red-data.mjs';
import {setupSelection} from './selection.mjs';
import {fighterFor} from './roster.mjs';
import {CombatAudio} from './combat-audio.mjs';
import {MatchRecord,loadControls,COACH} from './polish.mjs';
const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let fight=null,paused=false,last=0,acc=0,calloutTime=0,coachTime=0,coachTip='';
const audio=new CombatAudio(),storage={getItem:k=>{try{return localStorage.getItem(k);}catch{return null;}},setItem:(k,v)=>{try{localStorage.setItem(k,v);}catch{}}},record=new MatchRecord(storage);
const story=new StoryProgress({getItem:k=>storage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)});let storyIndex=null,storyReward=false,arenaKey='rooftop';
const controlSettings=loadControls(storage);
function applyControls(){const c=$('controls');c.dataset.size=controlSettings.size;c.dataset.hand=controlSettings.hand;$('controlSize').value=controlSettings.size;$('controlHand').value=controlSettings.hand;storage.setItem('sbfent-controls',JSON.stringify(controlSettings));}
$('controlSize').addEventListener('change',()=>{controlSettings.size=$('controlSize').value;applyControls();});$('controlHand').addEventListener('change',()=>{controlSettings.hand=$('controlHand').value;applyControls();});applyControls();$('record').textContent=record.label;
const inputs=new Set(),pointerKeys=new Map(),keySources=new Set();
const motoryard=new Image(),ironAtlas=new Image(),underground=new Image(),staticAtlas=new Image(),blockparty=new Image(),bossAtlas=new Image(),stage=new Image(),atlas=new Image(),grapples=new Image(),expansion=new Image(),duo=new Image(),soundAtlas=new Image(),novaAtlas=new Image(),violetAtlas=new Image(),fx=new FightFX(atlas,reduced),music=setupMusic();let matchCount=0;stage.src='assets/rooftop.webp';atlas.src='assets/fighters.webp';grapples.src='assets/grapples.webp';fx.setGrapples(grapples,GRAPPLE_DATA);expansion.src='assets/foxy-clara.webp';fx.setExpansion(expansion,EXPANSION_DATA);duo.src='assets/goldie-onyx.webp';fx.setDuo(duo,DUO_DATA);soundAtlas.src='assets/dj-quiet.webp';fx.setSound(soundAtlas,SOUND_DATA);novaAtlas.src='assets/nova-stamp.webp';violetAtlas.src='assets/violet-red.webp';fx.setRosterAtlas(8,novaAtlas,NOVA_STAMP_DATA);fx.setRosterAtlas(10,violetAtlas,VIOLET_RED_DATA);bossAtlas.src='assets/big-pressure.webp';blockparty.src='assets/blockparty.webp';fx.setRosterAtlas(12,bossAtlas,BOSS_DATA);underground.src='assets/underground.webp';staticAtlas.src='assets/lady-static.webp';fx.setRosterAtlas(13,staticAtlas,STATIC_DATA);motoryard.src='assets/motoryard.webp';ironAtlas.src='assets/iron-haul.webp';fx.setRosterAtlas(14,ironAtlas,IRON_DATA);const selection=setupSelection(fx,()=>{},index=>story.isUnlocked(index));const voices=new KOAnnouncer({duck:(gain,seconds)=>music.duck(gain,seconds)});try{$('voices').checked=storage.getItem('sbfent-ko-voice')!=='off';}catch{}voices.setEnabled($('voices').checked);$('voiceStatus').textContent=voices.available?'K.O. announcer only · fighter dialogue is off.':'K.O. voice unavailable here · the visual K.O. and impact sounds remain.';$('voices').addEventListener('change',()=>{voices.setEnabled($('voices').checked);storage.setItem('sbfent-ko-voice',$('voices').checked?'on':'off');});
function refreshStory(){selection.refresh();$('blockpartyOption').disabled=!story.arenaUnlocked('blockparty');$('undergroundOption').disabled=!story.arenaUnlocked('underground');$('motoryardOption').disabled=!story.arenaUnlocked('motoryard');$('chapterThreeOption').disabled=!story.isUnlocked(13);$('chapterThreeOption').textContent=story.isUnlocked(13)?'3 · Heavy Freight':'3 · Heavy Freight — clear chapter 2';$('chapterTwoOption').disabled=!story.unlocked;$('chapterTwoOption').textContent=story.unlocked?'2 · Signal Lost':'2 · Signal Lost — clear chapter 1';$('storyStatus').textContent=`CHAPTER ${story.active+1} · ${story.next}/3 matches complete`+(story.cleared?' · REWARDS UNLOCKED':' · saved on this device');}refreshStory();
function storyBrief(){refreshStory();const e=story.encounter;$('chapterSelect').value=String(story.active);$('chapterHeading').textContent=story.chapter.name.toUpperCase();$('storyTitle').textContent=story.next>=3?`CHAPTER ${story.active+1} CLEARED`:e.title;$('storyText').textContent=story.next>=3?'UNLOCKED: '+story.chapter.reward:e.text;$('storyHint').textContent=story.next>=3?(story.active<2?'The next chapter is ready in the selector above. You can also replay this chapter.':'Replay to sharpen your skills. The False King finale is still in development.'):e.hint;$('storyStart').textContent=story.next>=3?'REPLAY CHAPTER →':story.next?'RESUME STORY →':'START CHAPTER →';$('menu').hidden=true;$('storyMenu').hidden=false;}
$('chapterSelect').addEventListener('change',()=>{story.select(Number($('chapterSelect').value));storyBrief();});
$('openStory').addEventListener('click',storyBrief);$('storyBack').addEventListener('click',()=>{$('storyMenu').hidden=true;$('menu').hidden=false;});
function startStory(){storyIndex=story.next;start(true);}
$('storyStart').addEventListener('click',()=>{if(story.next>=3)story.replay();startStory();});$('storyNext').addEventListener('click',()=>{if(story.next>=3){exitToMenu();storyBrief();}else startStory();});
Promise.all([motoryard.decode(),ironAtlas.decode(),underground.decode(),staticAtlas.decode(),blockparty.decode(),bossAtlas.decode(),stage.decode(),atlas.decode(),grapples.decode(),expansion.decode(),duo.decode(),soundAtlas.decode(),novaAtlas.decode(),violetAtlas.decode()]).then(()=>{$('loading').textContent='Arena ready · Hit-confirm combos · Counterplay · Training lab';$('start').disabled=false;$('openStory').disabled=false;selection.drawPortraits();draw();}).catch(()=>{$('loading').textContent='Art could not load. Please reload with a connection.';});
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);draw();}addEventListener('resize',resize);resize();
function clearInput(){inputs.clear();keySources.clear();pointerKeys.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function syncInput(){inputs.clear();for(const k of keySources)inputs.add(k);for(const k of pointerKeys.values())inputs.add(k);document.querySelectorAll('[data-hold]').forEach(b=>b.classList.toggle('held',inputs.has(b.dataset.hold)));}
function sound(kind,heavy=false){if($('sound').checked)audio.play(kind,heavy);}
function callout(text,duration=1){$('callout').textContent=text;calloutTime=duration;}
function start(asStory=false){if(asStory!==true)storyIndex=null;storyReward=false;$('storyNext').hidden=true;$('restart').hidden=false;$('storyMenu').hidden=true;const encounter=storyIndex===null?null:story.encounter;arenaKey=encounter?.arena||(story.arenaUnlocked($('arenaSelect').value)?$('arenaSelect').value:'rooftop');fx.reset();music.duck(1,0);music.suspended=false;music.unlocked=true;music.beginMatch(!encounter&&$('training').checked?'training':'fight',matchCount++);clearInput();fight=new Fight({difficulty:$('difficulty').value,training:!encounter&&$('training').checked,dummy:$('dummy').value||'stand',characters:encounter?[0,encounter.opponent]:selection.characters});record.reset(fight.training||!!encounter);for(const f of fight.fighters)$('name'+f.id).textContent=fighterFor(f).name.toUpperCase();canvas.setAttribute('aria-label',fight.fighters.map(f=>fighterFor(f).name).join(' versus ')+' at '+(arenaKey==='motoryard'?'Flex Motor Yard':arenaKey==='underground'?'Neon Underground':arenaKey==='blockparty'?'Carolina Block Party':'SBFENT Rooftop'));coachTime=0;paused=false;acc=0;last=performance.now();$('menu').hidden=true;$('pauseMenu').hidden=true;$('hud').hidden=false;$('controls').hidden=false;$('combatState').hidden=false;$('matchStats').textContent='';audio.unlock();voices.unlock();voices.reset();handleEvents();}
$('start').addEventListener('click',start);$('restart').addEventListener('click',()=>start(storyIndex!==null));
function pause(){if(!fight||fight.phase==='done')return;paused=true;clearInput();voices.stop();music.suspend();$('pauseTitle').textContent='PAUSED';$('pauseText').textContent='The fight will wait.';$('matchStats').textContent=record.summary;$('resetPractice').hidden=!fight.training;$('storyNext').hidden=true;$('restart').hidden=false;$('resume').hidden=false;$('pauseMenu').hidden=false;$('resume').focus();}
function resume(){if(!fight||fight.phase==='done')return;music.resume();paused=false;clearInput();last=performance.now();acc=0;$('pauseMenu').hidden=true;}
$('resetPractice').addEventListener('click',()=>{if(fight?.training)start();});
$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);$('exit').addEventListener('click',exitToMenu);function exitToMenu(){voices.stop();fight=null;fx.reset();music.duck(1,0);music.suspended=false;music.setScene('menu');paused=false;clearInput();$('pauseMenu').hidden=true;$('menu').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('coach').hidden=true;$('combatState').hidden=true;$('callout').textContent='';$('combo').textContent='';$('record').textContent=record.label;storyIndex=null;refreshStory();$('start').focus();}
addEventListener('blur',()=>{pause();music.suspend();});document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();music.suspend();}else if(!paused)music.resume();});addEventListener('focus',()=>{if(!paused&&!document.hidden)music.resume();});
const movement={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'jump',w:'jump',ArrowDown:'crouch',s:'crouch',l:'block'};
const attacks={j:'punch',k:'kick',i:'grab',g:'grab',u:'special'};
function performAttack(name){fight.queueAttack(0,name,{direction:inputs.has('left')?-1:inputs.has('right')?1:undefined});}
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='Escape'){e.preventDefault();if(paused)resume();else pause();return;}if(!fight||paused||e.target.matches('input,select'))return;if(fx.cinematic&&!(fx.cinematic.id===1&&movement[k]==='block'))return;if(movement[k]||attacks[k]){e.preventDefault();music.retry();}if(movement[k]){keySources.add(movement[k]);syncInput();}if(!e.repeat&&attacks[k])performAttack(attacks[k]);});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(movement[k]){keySources.delete(movement[k]);syncInput();}});
document.querySelectorAll('[data-hold],[data-action]').forEach(button=>{button.addEventListener('contextmenu',e=>e.preventDefault());button.addEventListener('pointerdown',e=>{e.preventDefault();if(!fight||paused||fight.phase==='done')return;music.retry();if(fx.cinematic&&!(fx.cinematic.id===1&&button.dataset.hold==='block'))return;button.setPointerCapture(e.pointerId);button.classList.add('held');if(button.dataset.hold){pointerKeys.set(e.pointerId,button.dataset.hold);syncInput();}else performAttack(button.dataset.action);});const release=e=>{pointerKeys.delete(e.pointerId);syncInput();button.classList.remove('held');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('pointermove',e=>{if(!button.dataset.hold||!pointerKeys.has(e.pointerId))return;const hit=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-hold]');pointerKeys.set(e.pointerId,hit?.dataset.hold||'');syncInput();});});
function showResult(){const e=fx.finish;if(storyIndex!==null&&e.winner===0&&!storyReward){story.win(storyIndex);storyReward=true;refreshStory();}$('pauseTitle').textContent=e.winner===0?'STAMP PROTECTED':'RUN IT BACK';$('pauseText').textContent=fighterFor(fight.fighters[e.winner]).name+' wins the match.';if(storyIndex!==null){$('pauseTitle').textContent=e.winner===0?(story.next>=3?'CHAPTER CLEARED':'STAMP RECOVERED'):'KEEP YOUR CROWN';$('pauseText').textContent=e.winner===0?(story.next>=3?'UNLOCKED: '+story.chapter.reward:story.encounter.text):'Flex fell short. Retry this match — your earlier wins are saved.';$('storyNext').hidden=e.winner!==0;$('storyNext').textContent=story.next>=3?'VIEW CHAPTER →':'NEXT MATCH →';$('restart').hidden=e.winner===0;}$('matchStats').textContent=record.summary+(story.saved?'':' · Progress could not be saved on this device.');$('resetPractice').hidden=!fight.training;$('resume').hidden=true;$('pauseMenu').hidden=false;($('storyNext').hidden?$('restart'):$('storyNext')).focus();}
function handleEvents(){for(const e of fight.drainEvents()){
 voices.event(e);record.event(e);if(e.type==='matchover'&&e.winner===0&&storyIndex!==null&&!storyReward){story.win(storyIndex);storyReward=true;refreshStory();}if(e.type==='brace'&&e.id===0)callout('BRACED · P FOR HEAVY STRAIGHT',1);if(e.type==='armor')callout('ARMORED · GRAB OR PUNISH',.65);if(e.type==='wave'||e.type==='trap'||e.type==='trapBurst')sound('wave');
 fx.event(e,sequenceFighters(fight.fighters,fight.sequence));
 if(e.type==='super'){music.duck(.28,2.25);sound('super');}
 if(e.type==='superConnected')music.duck(.7,3.1);
 if(e.type==='koImpact'){music.duck(.15,.8);sound('ko',true);}
 if(e.type==='super'){if(e.id===0)clearInput();else{for(const key of keySources)if(key!=='block')keySources.delete(key);for(const [pointer,key] of pointerKeys)if(key!=='block')pointerKeys.delete(pointer);syncInput();}callout('',0);sound('hit');}
 if(e.type==='round'){$('callout').classList.remove('ko');callout('',0);}
 if(e.type==='fight'){callout('FIGHT!',.7);sound('fight');}
 if(e.type==='grabbed'){clearInput();callout(e.target===0?'TAP GRAB TO ESCAPE!':'GRABBED!',.3);}
 if(e.type==='throwEscape'){callout('THROW ESCAPED',.7);sound('escape');}
 if(e.type==='grabMiss'&&e.id===0)callout('GET CLOSER TO GRAB',.5);
 if(e.type==='superConnected'){clearInput();callout('',0);}
 if(e.type==='empty'&&e.id===0)callout('CHARGE YOUR STAMP METER',.65);
 if(e.type==='hit'||e.type==='block')sound(e.type,e.final||e.move==='throw');
 if(fight.training){
  let tip;
  if(e.type==='grabMiss')tip='GRAB MISSED · Get closer and wait until the target lands.';
  else if(e.type==='block'&&e.parry&&e.target===0)tip='PERFECT GUARD · Tap P now for the counter!';
  else if(e.type==='block')tip='BLOCKED · Guard stops a super cinematic. Use GRAB against defense.';
  else if(e.type==='hit'&&e.id===0)tip=e.punish?'PUNISH · You caught the recovery.':e.counter?'COUNTER · Your strike interrupted the wind-up.':e.combo>=2?'COMBO CONFIRMED · Landed hits can chain; blocked hits cannot.':'HIT CONFIRMED · '+fighterFor(fight.fighters[0]).tip;
  if(tip){coachTip=tip;coachTime=3;}
 }
 if(e.type==='roundover'||e.type==='matchover'){clearInput();$('callout').classList.toggle('ko',e.knockout);callout(e.knockout?'K.O.':e.winner<0?'DRAW — RUN IT BACK':fighterFor(fight.fighters[e.winner]).name.toUpperCase()+' TAKES THE ROUND',e.knockout?3.6:2.4);}
}}
function hud(){for(let i=0;i<2;i++){const f=fight.fighters[i];$('hp'+i).style.width=f.hp+'%';$('hpTrail'+i).style.width=f.hp+'%';$('hp'+i).classList.toggle('critical',f.hp<=25);$('power'+i).style.width=f.power+'%';$('wins'+i).textContent=Array.from({length:2},(_,j)=>j<fight.wins[i]?'●':'○').join(' ');}$('timer').textContent=Math.ceil(fight.timer).toString().padStart(2,'0');$('round').textContent='ROUND '+fight.round;const f=fight.fighters[0],ready=f.power>=100;$('kickLabel').textContent=f.y<8?(f.character===14?'BRACE':f.character===13?'TRAP':f.character===6?'WAVE':f.character===10?'SWEEP':'KICK'):'KICK';$('kick').setAttribute('aria-label',f.y<8?(f.character===14?'Brace stance':f.character===13?'Electric trap':f.character===6?'Sound wave':f.character===10?'Low sweep':'Kick'):'Kick');$('special').classList.toggle('ready',ready);$('special').setAttribute('aria-label',ready?'Special ready':'Special charging');$('combatState').textContent=fight.sequence?'SIGNATURE SEQUENCE':f.knockdown>0?'GETTING UP':f.stun>0?'HIT STUN':f.brace>0?'BRACED · P FOR HEAVY':f.counterReady>0?'COUNTER READY · P':f.block?(f.lowGuard?'LOW GUARD':'GUARD UP'):f.move?.connected?'HIT CONFIRMED':f.move?.hit?'RECOVERING':f.move?'ATTACKING':ready?'STAMP READY':'READY';$('coach').hidden=!fight.training||fight.phase!=='fight'||!!fx.cinematic||!!fight.sequence;$('coachText').textContent=coachTime>0?coachTip:fight.dummy==='stand'?fighterFor(f).tip:COACH[fight.dummy];$('practiceStats').textContent=record.summary;}
function sprite(f){fx.rawSprite(ctx,f);}
function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const scale=Math.min(w/1000,h/562.5),ox=(w-1000*scale)/2,oy=(h-562.5*scale)/2;ctx.fillStyle='#090611';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.beginPath();ctx.rect(0,0,1000,562.5);ctx.clip();fx.sequence=fight?.sequence??null;fx.projectiles=fight?.projectiles??[];fx.traps=fight?.traps??[];ctx.save();fx.camera(ctx,fight?.fighters??[]);if(fx.shake&&!reduced)ctx.translate((Math.random()-.5)*fx.shake,(Math.random()-.5)*fx.shake);const backdrop=arenaKey==='motoryard'?motoryard:arenaKey==='underground'?underground:arenaKey==='blockparty'?blockparty:stage;if(backdrop.complete&&backdrop.naturalWidth)ctx.drawImage(backdrop,0,0,1000,562.5);const fs=sequenceFighters(fight?.fighters??[{id:0,character:selection.characters[0],x:280,y:0,face:1},{id:1,character:selection.characters[1],x:720,y:0,face:-1}],fight?.sequence);for(const f of fs){ctx.fillStyle='#09031065';ctx.beginPath();ctx.ellipse(f.x,508,65,10,0,0,Math.PI*2);ctx.fill();}fx.before(ctx);for(const f of fs)sprite(f);fx.after(ctx,fs);ctx.restore();fx.overlay(ctx,fs);ctx.globalAlpha=1;ctx.restore();}
function loop(now){const dt=Math.max(0,Math.min((now-(last||now))/1000,.05));last=now;
 if(!paused){music.tick(dt);coachTime-=dt;if(fight){
  // Drain input-triggered special events before advancing combat, then freeze
  // the simulation for the cut-in. UI animation advances on real elapsed time.
  handleEvents();const frozen=fx.frozen;fx.tick(dt,fight.fighters);
  if(!frozen&&fight.phase!=='done'){
   acc+=dt*(fx.slow>0?.25:fx.finish?.knockout&&fx.finish.elapsed<.75?.32:1);const keys=Object.fromEntries([...inputs].map(k=>[k,true]));
   while(acc>=1/120){fight.step(1/120,keys);handleEvents();acc-=1/120;if(fx.frozen){acc=0;break;}}
  }
  if(fx.cinematic||fx.finish?.elapsed>.85)$('callout').textContent='';
  $('combo').textContent=fx.combo?fx.combo.count+' HIT COMBO':'';$('combo').classList.toggle('opponent',fx.combo?.id===1);
  if(fx.finish?.type==='matchover'&&fx.finish.elapsed>1.7&&$('pauseMenu').hidden)showResult();
  hud();
 }calloutTime-=dt;if(calloutTime<=0)$('callout').textContent='';}
 draw();requestAnimationFrame(loop);
}requestAnimationFrame(loop);

let installPrompt=null;
addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
$('install').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else $('installHelp').showModal();});
$('closeInstall').addEventListener('click',()=>{$('installHelp').close();$('install').focus();});
if('serviceWorker' in navigator)addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
