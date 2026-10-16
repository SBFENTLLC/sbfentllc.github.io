import {Fight} from './engine.mjs';
import {FightFX} from './fx.mjs';
import {setupMusic} from './music-ui.mjs';
import {sequenceFighters} from './choreography.mjs';
import {GRAPPLE_DATA} from './grapple-data.mjs';
import {CombatAudio} from './combat-audio.mjs';
import {MatchRecord,loadControls,COACH} from './polish.mjs';
const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let fight=null,paused=false,last=0,acc=0,calloutTime=0,coachTime=0,coachTip='';
const audio=new CombatAudio(),storage={getItem:k=>{try{return localStorage.getItem(k);}catch{return null;}},setItem:(k,v)=>{try{localStorage.setItem(k,v);}catch{}}},record=new MatchRecord(storage);
const controlSettings=loadControls(storage);
function applyControls(){const c=$('controls');c.dataset.size=controlSettings.size;c.dataset.hand=controlSettings.hand;$('controlSize').value=controlSettings.size;$('controlHand').value=controlSettings.hand;storage.setItem('sbfent-controls',JSON.stringify(controlSettings));}
$('controlSize').addEventListener('change',()=>{controlSettings.size=$('controlSize').value;applyControls();});$('controlHand').addEventListener('change',()=>{controlSettings.hand=$('controlHand').value;applyControls();});applyControls();$('record').textContent=record.label;
const inputs=new Set(),pointerKeys=new Map(),keySources=new Set();
const stage=new Image(),atlas=new Image(),grapples=new Image(),fx=new FightFX(atlas,reduced),music=setupMusic();let matchCount=0;stage.src='assets/rooftop.webp';atlas.src='assets/fighters.webp';grapples.src='assets/grapples.webp';fx.setGrapples(grapples,GRAPPLE_DATA);
Promise.all([stage.decode(),atlas.decode(),grapples.decode()]).then(()=>{$('loading').textContent='Arena ready · Hit-confirm combos · Counterplay · Training lab';$('start').disabled=false;draw();}).catch(()=>{$('loading').textContent='Art could not load. Please reload with a connection.';});
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);draw();}addEventListener('resize',resize);resize();
function clearInput(){inputs.clear();keySources.clear();pointerKeys.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function syncInput(){inputs.clear();for(const k of keySources)inputs.add(k);for(const k of pointerKeys.values())inputs.add(k);document.querySelectorAll('[data-hold]').forEach(b=>b.classList.toggle('held',inputs.has(b.dataset.hold)));}
function sound(kind,heavy=false){if($('sound').checked)audio.play(kind,heavy);}
function callout(text,duration=1){$('callout').textContent=text;calloutTime=duration;}
function start(){fx.reset();music.duck(1,0);music.suspended=false;music.unlocked=true;music.setScene($('training').checked?'training':'fight',matchCount++);clearInput();fight=new Fight({difficulty:$('difficulty').value,training:$('training').checked,dummy:$('dummy').value||'stand'});record.reset(fight.training);coachTime=0;paused=false;acc=0;last=performance.now();$('menu').hidden=true;$('pauseMenu').hidden=true;$('hud').hidden=false;$('controls').hidden=false;$('combatState').hidden=false;$('matchStats').textContent='';audio.unlock();handleEvents();}
$('start').addEventListener('click',start);$('restart').addEventListener('click',start);
function pause(){if(!fight||fight.phase==='done')return;paused=true;clearInput();music.suspend();$('pauseTitle').textContent='PAUSED';$('pauseText').textContent='The fight will wait.';$('matchStats').textContent=record.summary;$('resetPractice').hidden=!fight.training;$('resume').hidden=false;$('pauseMenu').hidden=false;$('resume').focus();}
function resume(){if(!fight||fight.phase==='done')return;music.resume();paused=false;clearInput();last=performance.now();acc=0;$('pauseMenu').hidden=true;}
$('resetPractice').addEventListener('click',()=>{if(fight?.training)start();});
$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);$('exit').addEventListener('click',()=>{fight=null;fx.reset();music.duck(1,0);music.suspended=false;music.setScene('menu');paused=false;clearInput();$('pauseMenu').hidden=true;$('menu').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('coach').hidden=true;$('combatState').hidden=true;$('callout').textContent='';$('combo').textContent='';$('record').textContent=record.label;$('start').focus();});
addEventListener('blur',()=>{pause();music.suspend();});document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();music.suspend();}else if(!paused)music.resume();});addEventListener('focus',()=>{if(!paused&&!document.hidden)music.resume();});
const movement={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'jump',w:'jump',ArrowDown:'crouch',s:'crouch',l:'block'};
const attacks={j:'punch',k:'kick',i:'grab',g:'grab',u:'special'};
function performAttack(name){fight.queueAttack(0,name,{direction:inputs.has('left')?-1:inputs.has('right')?1:undefined});}
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='Escape'){e.preventDefault();if(paused)resume();else pause();return;}if(!fight||paused||e.target.matches('input,select'))return;if(fx.cinematic&&!(fx.cinematic.id===1&&movement[k]==='block'))return;if(movement[k]||attacks[k])e.preventDefault();if(movement[k]){keySources.add(movement[k]);syncInput();}if(!e.repeat&&attacks[k])performAttack(attacks[k]);});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(movement[k]){keySources.delete(movement[k]);syncInput();}});
document.querySelectorAll('[data-hold],[data-action]').forEach(button=>{button.addEventListener('contextmenu',e=>e.preventDefault());button.addEventListener('pointerdown',e=>{e.preventDefault();if(!fight||paused||fight.phase==='done')return;if(fx.cinematic&&!(fx.cinematic.id===1&&button.dataset.hold==='block'))return;button.setPointerCapture(e.pointerId);button.classList.add('held');if(button.dataset.hold){pointerKeys.set(e.pointerId,button.dataset.hold);syncInput();}else performAttack(button.dataset.action);});const release=e=>{pointerKeys.delete(e.pointerId);syncInput();button.classList.remove('held');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('pointermove',e=>{if(!button.dataset.hold||!pointerKeys.has(e.pointerId))return;const hit=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-hold]');pointerKeys.set(e.pointerId,hit?.dataset.hold||'');syncInput();});});
function showResult(){const e=fx.finish;$('pauseTitle').textContent=e.winner===0?'STAMP PROTECTED':'RUN IT BACK';$('pauseText').textContent=e.winner===0?'Flex A Lot wins the match.':'The Bootlegger wins this one.';$('matchStats').textContent=record.summary;$('resetPractice').hidden=!fight.training;$('resume').hidden=true;$('pauseMenu').hidden=false;$('restart').focus();}
function handleEvents(){for(const e of fight.drainEvents()){
 record.event(e);
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
  else if(e.type==='block')tip='BLOCKED · Guard stops a super cinematic. Use GRAB against defense.';
  else if(e.type==='hit'&&e.id===0)tip=e.punish?'PUNISH · You caught the recovery.':e.counter?'COUNTER · Your strike interrupted the wind-up.':e.combo>=2?'COMBO CONFIRMED · Landed hits can chain; blocked hits cannot.':'HIT CONFIRMED · Tap the next P or K as your punch lands.';
  if(tip){coachTip=tip;coachTime=3;}
 }
 if(e.type==='roundover'||e.type==='matchover'){clearInput();$('callout').classList.toggle('ko',e.knockout);callout(e.knockout?'K.O.':e.winner<0?'DRAW — RUN IT BACK':e.winner===0?'FLEX TAKES THE ROUND':'BOOTLEGGER TAKES THE ROUND',e.knockout?3.6:2.4);}
}}
function hud(){for(let i=0;i<2;i++){const f=fight.fighters[i];$('hp'+i).style.width=f.hp+'%';$('power'+i).style.width=f.power+'%';$('wins'+i).textContent=Array.from({length:2},(_,j)=>j<fight.wins[i]?'●':'○').join(' ');}$('timer').textContent=Math.ceil(fight.timer).toString().padStart(2,'0');$('round').textContent='ROUND '+fight.round;const f=fight.fighters[0],ready=f.power>=100;$('special').classList.toggle('ready',ready);$('special').setAttribute('aria-label',ready?'Special ready':'Special charging');$('combatState').textContent=fight.sequence?'SIGNATURE SEQUENCE':f.knockdown>0?'GETTING UP':f.stun>0?'HIT STUN':f.block?'GUARD UP':f.move?.hit?'RECOVERING':f.move?'ATTACKING':ready?'STAMP READY':'READY';$('coach').hidden=!fight.training||fight.phase!=='fight'||!!fx.cinematic||!!fight.sequence;$('coachText').textContent=coachTime>0?coachTip:COACH[fight.dummy];$('practiceStats').textContent=record.summary;}
function sprite(f){fx.rawSprite(ctx,f);}
function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const scale=Math.min(w/1000,h/562.5),ox=(w-1000*scale)/2,oy=(h-562.5*scale)/2;ctx.fillStyle='#090611';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.beginPath();ctx.rect(0,0,1000,562.5);ctx.clip();fx.sequence=fight?.sequence??null;ctx.save();fx.camera(ctx,fight?.fighters??[]);if(fx.shake&&!reduced)ctx.translate((Math.random()-.5)*fx.shake,(Math.random()-.5)*fx.shake);if(stage.complete&&stage.naturalWidth)ctx.drawImage(stage,0,0,1000,562.5);const fs=sequenceFighters(fight?.fighters??[{id:0,x:280,y:0,face:1},{id:1,x:720,y:0,face:-1}],fight?.sequence);for(const f of fs){ctx.fillStyle='#09031065';ctx.beginPath();ctx.ellipse(f.x,508,65,10,0,0,Math.PI*2);ctx.fill();}fx.before(ctx);for(const f of fs)sprite(f);fx.after(ctx,fs);ctx.restore();fx.overlay(ctx,fs);ctx.globalAlpha=1;ctx.restore();}
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
