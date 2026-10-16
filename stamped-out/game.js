import {Fight} from './engine.mjs';
import {FightFX} from './fx.mjs';
import {setupMusic} from './music-ui.mjs';
const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let fight=null,paused=false,last=0,acc=0,calloutTime=0,audio=null;
const inputs=new Set(),pointerKeys=new Map(),keySources=new Set();
const stage=new Image(),atlas=new Image(),fx=new FightFX(atlas,reduced),music=setupMusic();let matchCount=0;stage.src='assets/rooftop.webp';atlas.src='assets/fighters.webp';
Promise.all([stage.decode(),atlas.decode()]).then(()=>{$('loading').textContent='Arena ready · Cinematic supers + six SBFENT instrumentals';$('start').disabled=false;draw();}).catch(()=>{$('loading').textContent='Art could not load. Please reload with a connection.';});
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);draw();}addEventListener('resize',resize);resize();
function clearInput(){inputs.clear();keySources.clear();pointerKeys.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function syncInput(){inputs.clear();for(const k of keySources)inputs.add(k);for(const k of pointerKeys.values())inputs.add(k);}
function sound(kind){if(!$('sound').checked)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type=kind==='block'?'triangle':'sawtooth';o.frequency.setValueAtTime(kind==='block'?230:110,audio.currentTime);o.frequency.exponentialRampToValueAtTime(38,audio.currentTime+.12);g.gain.setValueAtTime(.065,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.16);}catch{}}
function callout(text,duration=1){$('callout').textContent=text;calloutTime=duration;}
function start(){fx.reset();music.suspended=false;music.unlocked=true;music.setScene($('training').checked?'training':'fight',matchCount++);clearInput();fight=new Fight({difficulty:$('difficulty').value,training:$('training').checked});paused=false;acc=0;last=performance.now();$('menu').hidden=true;$('pauseMenu').hidden=true;$('hud').hidden=false;$('controls').hidden=false;audio?.resume();handleEvents();}
$('start').addEventListener('click',start);$('restart').addEventListener('click',start);
function pause(){if(!fight||fight.phase==='done')return;paused=true;clearInput();music.suspend();$('pauseTitle').textContent='PAUSED';$('pauseText').textContent='The fight will wait.';$('resume').hidden=false;$('pauseMenu').hidden=false;$('resume').focus();}
function resume(){if(!fight||fight.phase==='done')return;music.resume();paused=false;clearInput();last=performance.now();acc=0;$('pauseMenu').hidden=true;}
$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);$('exit').addEventListener('click',()=>{fight=null;fx.reset();music.suspended=false;music.setScene('menu');paused=false;clearInput();$('pauseMenu').hidden=true;$('menu').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('callout').textContent='';$('combo').textContent='';$('start').focus();});
addEventListener('blur',()=>{pause();music.suspend();});document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();music.suspend();}else if(!paused)music.resume();});addEventListener('focus',()=>{if(!paused&&!document.hidden)music.resume();});
const movement={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'jump',w:'jump',ArrowDown:'crouch',s:'crouch',l:'block'};
const attacks={j:'punch',k:'kick',u:'special'};
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(k==='Escape'){e.preventDefault();if(paused)resume();else pause();return;}if(!fight||paused||fx.cinematic||e.target.matches('input,select'))return;if(movement[k]||attacks[k])e.preventDefault();if(movement[k]){keySources.add(movement[k]);syncInput();}if(!e.repeat&&attacks[k])fight.attack(0,attacks[k]);});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(movement[k]){keySources.delete(movement[k]);syncInput();}});
document.querySelectorAll('[data-hold],[data-action]').forEach(button=>{button.addEventListener('contextmenu',e=>e.preventDefault());button.addEventListener('pointerdown',e=>{e.preventDefault();if(!fight||paused||fx.cinematic||fight.phase==='done')return;button.setPointerCapture(e.pointerId);button.classList.add('held');if(button.dataset.hold){pointerKeys.set(e.pointerId,button.dataset.hold);syncInput();}else fight.attack(0,button.dataset.action);});const release=e=>{pointerKeys.delete(e.pointerId);syncInput();button.classList.remove('held');};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);});
function showResult(){const e=fx.finish;$('pauseTitle').textContent=e.winner===0?'STAMP PROTECTED':'RUN IT BACK';$('pauseText').textContent=e.winner===0?'Flex A Lot wins the match.':'The Bootlegger wins this one.';$('resume').hidden=true;$('pauseMenu').hidden=false;$('restart').focus();}
function handleEvents(){for(const e of fight.drainEvents()){
 fx.event(e,fight.fighters);
 if(e.type==='super'){clearInput();callout('',0);sound('hit');}
 if(e.type==='round')callout('ROUND '+e.round,1.5);
 if(e.type==='fight')callout('FIGHT!',.7);
 if(e.type==='empty'&&e.id===0)callout('CHARGE YOUR STAMP METER',.65);
 if(e.type==='hit'||e.type==='block')sound(e.type);
 if(e.type==='roundover'||e.type==='matchover'){clearInput();callout(e.knockout?'K.O.':e.winner<0?'DRAW — RUN IT BACK':e.winner===0?'FLEX TAKES THE ROUND':'BOOTLEGGER TAKES THE ROUND',2.4);}
}}
function hud(){for(let i=0;i<2;i++){const f=fight.fighters[i];$('hp'+i).style.width=f.hp+'%';$('power'+i).style.width=f.power+'%';$('wins'+i).textContent=Array.from({length:2},(_,j)=>j<fight.wins[i]?'●':'○').join(' ');}$('timer').textContent=Math.ceil(fight.timer).toString().padStart(2,'0');$('round').textContent='ROUND '+fight.round;$('special').classList.toggle('ready',fight.fighters[0].power>=100);}
function sprite(f){fx.rawSprite(ctx,f);}
function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const scale=Math.min(w/1000,h/562.5),ox=(w-1000*scale)/2,oy=(h-562.5*scale)/2;ctx.fillStyle='#090611';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.beginPath();ctx.rect(0,0,1000,562.5);ctx.clip();if(fx.shake&&!reduced)ctx.translate((Math.random()-.5)*fx.shake,(Math.random()-.5)*fx.shake);if(stage.complete&&stage.naturalWidth)ctx.drawImage(stage,0,0,1000,562.5);const fs=fight?.fighters??[{id:0,x:280,y:0,face:1},{id:1,x:720,y:0,face:-1}];for(const f of fs){ctx.fillStyle='#09031065';ctx.beginPath();ctx.ellipse(f.x,508,65,10,0,0,Math.PI*2);ctx.fill();}fx.before(ctx);for(const f of fs)sprite(f);fx.after(ctx,fs);ctx.globalAlpha=1;ctx.restore();}
function loop(now){const dt=Math.max(0,Math.min((now-(last||now))/1000,.05));last=now;
 if(!paused){if(fight){
  // Drain input-triggered special events before advancing combat, then freeze
  // the simulation for the cut-in. UI animation advances on real elapsed time.
  handleEvents();const frozen=fx.frozen;fx.tick(dt,fight.fighters);
  if(!frozen&&fight.phase!=='done'){
   acc+=dt;const keys=Object.fromEntries([...inputs].map(k=>[k,true]));
   while(acc>=1/120){fight.step(1/120,keys);handleEvents();acc-=1/120;if(fx.frozen){acc=0;break;}}
  }
  if(fx.cinematic)$('callout').textContent='';
  $('combo').textContent=fx.combo?fx.combo.count+' HIT COMBO':'';$('combo').classList.toggle('opponent',fx.combo?.id===1);
  if(fx.finish?.type==='matchover'&&fx.finish.elapsed>1.7&&$('pauseMenu').hidden)showResult();
  hud();
 }calloutTime-=dt;if(calloutTime<=0)$('callout').textContent='';}
 draw();requestAnimationFrame(loop);
}requestAnimationFrame(loop);
