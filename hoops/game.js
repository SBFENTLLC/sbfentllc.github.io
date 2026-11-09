'use strict';
const $=id=>document.getElementById(id), canvas=$('court'),ctx=canvas.getContext('2d');
const roster=[{name:'FLEX',color:'#d9ff75',speed:3.9,touch:0},{name:'LIL JUICE',color:'#b7a0ff',speed:4.5,touch:-.02},{name:'GOLDIE',color:'#ffcf68',speed:3.7,touch:.07}];
let W=0,H=0,S=1,OX=0,OY=0,time=0,last=0,playing=false,paused=false,finished=false,owner=0,score=[0,0],clock=24,charge=-1,shot=null,delay=0,stun=0,crossCD=0,defCD=0,aiWait=0,toastTimer=0,moveX=0,moveZ=0,stickId=null,shootId=null,wins=0,sound=null;
let character=roster[0],difficulty=1,players=[{x:-1.2,z:9,y:0},{x:0,z:6.9,y:0},{x:-3.5,z:5.3,y:0},{x:3.8,z:7,y:0},{x:-3.2,z:4,y:0},{x:3.5,z:5.8,y:0}],keys={};
try{wins=Number(localStorage.getItem('sbfent-hoops-wins'))||0}catch{}$('record').textContent=wins+' COURT WINS / SAVED ON THIS DEVICE';
let heat=0,greenCount=0,steals=0,made=0,attempts=0,runCoins=0,mode='match',stamina=100,sprintHeld=false,soundEnabled=true,sprintExhausted=false,bestHeat=0,careerMatch=null,styleCrosses=0,styleDunks=0,styleShowtime=0,aiStealCD=5;
let ballHolder=0,passFlight=null,looseBall=null,crewHoldTime=0,cpuPassCD=3,stampCharge=0,comboCount=0,comboClock=0,trickIndex=0,bestCombo=0,assists=0,lobFinishes=0,specialUses=0,hypeLife=0,hypeCaption='',lastTrick='',lastPass=null;
let career={coins:0,streak:0,best:0,owned:[0],look:0};
const looks=[{name:'Player signature',cost:0,color:null},{name:'Purple Reign',cost:200,color:'#b898ef'},{name:'Ice White',cost:350,color:'#e5eef2'},{name:'Crown Gold',cost:500,color:'#e6bb50'}];
try{const saved=JSON.parse(localStorage.getItem('sbfent-hoops-career'));if(saved&&typeof saved==='object'){career.coins=Math.max(0,Math.min(1e7,Number(saved.coins)||0));career.streak=Math.max(0,Number(saved.streak)||0);career.best=Math.max(career.streak,Number(saved.best)||0);career.owned=[0,...[1,2,3].filter(i=>Array.isArray(saved.owned)&&saved.owned.includes(i))];career.look=career.owned.includes(saved.look)?saved.look:0}}catch{}
function saveCareer(){try{localStorage.setItem('sbfent-hoops-career',JSON.stringify(career))}catch{}}
function rivalName(){if(mode==='career'&&careerMatch)return careerMatch.rival;return ['THE ROOKIE','QUIET MONEY','THE CROWN'][difficulty]}
function outfitColor(){return looks[career.look].color||character.color}
function shop(){const i=+$('outfit').value||0,owned=career.owned.includes(i);$('buy').textContent=owned?(career.look===i?'EQUIPPED':'EQUIP OUTFIT'):('UNLOCK · '+looks[i].cost+' COINS');$('wallet').textContent=career.coins+' FLEX COINS · BEST STREAK '+career.best;$('buy').disabled=owned&&career.look===i}
$('outfit').onchange=shop;$('buy').onclick=()=>{const i=+$('outfit').value||0;if(!career.owned.includes(i)){if(career.coins<looks[i].cost){$('shopStatus').textContent='Earn more coins on the court to unlock this outfit.';return}career.coins-=looks[i].cost;career.owned.push(i)}career.look=i;saveCareer();$('shopStatus').textContent=looks[i].name+' equipped.';shop()};
$('mode').onchange=()=>{const m=$('mode').value;$('difficulty').disabled=m!=='match'&&m!=='crew';$('player').disabled=m==='career';$('courtStyle').disabled=m==='career';if(m==='career'){const c=window.HoopsCareer.config();$('player').value='3';$('courtStyle').value=c.gym;$('difficulty').value=String(c.difficulty);}};$('mode').onchange();
function setHud(id, property, value) {
  const element = $(id);
  if (element[property] !== value) element[property] = value;
}
function setHudStyle(id, property, value) {
  const style = $(id).style;
  if (style[property] !== value) style[property] = value;
}
function careerHud() {
  const p = players[0];
  const rival = players[owner === 1 ? (shot?.actor ?? ballHolder) : closestEnemy(0)];
  const range = Math.hypot(p.x, p.z - 1.5);
  const gap = distance(p, rival);
  let readout;
  if (passFlight?.self) readout = passFlight.finishQueued ? 'FINISH LOCKED IN' : 'SELF LOB · TAP LOB AGAIN TO FINISH';
  else if (owner === 1) readout = 'DEFENSE · ' + (gap < 1.7 ? 'STEAL RANGE' : 'CLOSE THE GAP');
  else if (crewActive() && ballHolder !== 0) readout = 'OFF BALL · CUT TO RIM / CALL LOB';
  else if (range < (character.dunkRange || 2.25)) readout = 'AT THE RIM · DUNK';
  else readout = (mode === 'practice' || gap > 2.4 ? 'OPEN' : gap > 1.3 ? 'CONTESTED' : 'TIGHT DEFENSE') +
    ' · ' + (range > 5.8 ? '2 POINT RANGE' : '1 POINT RANGE');

  setHud('shotReadout','textContent',readout);
  setHudStyle('heatFill','width',Math.min(3,heat) / 3 * 100 + '%');
  setHud('heatLabel','textContent',heat >= 3 ? 'ON FIRE · SHOT BOOST' : 'HEAT ' + heat + '/3');
  setHudStyle('staminaFill','width',Math.round(stamina) + '%');
  setHud('matchStats','textContent',made+'/'+attempts+' FG · '+greenCount+' GREEN · '+assists+' AST · +'+runCoins+' COINS');
  setHud('challenge','textContent',mode === 'practice' ? 'FREE SHOOTAROUND · FIND YOUR RELEASE' :
    greenCount >= 3 ? 'CHALLENGE CLEARED · +30 COINS' : 'CHALLENGE · '+greenCount+'/3 GREEN RELEASES · +30');
  arcadeHud();
}
shop();
const view={z:23.5,y:7.8,sin:.355,cos:Math.sqrt(1-.355*.355)};

function resize() {
  W=innerWidth;
  H=innerHeight;
  const scale=Math.min(devicePixelRatio||1,2);
  canvas.width=W*scale;
  canvas.height=H*scale;
  ctx.setTransform(scale,0,0,scale,0,0);
  S=Math.min(W*.94,H*1.20);
  OX=W/2;
  OY=H*(W<H?.47:.46);
}
addEventListener('resize',resize);
resize();

function cameraDepth(z,y) {
  return (view.z-z)*view.cos+(view.y-y)*view.sin;
}
function project(x,z,y=0) {
  const depth=cameraDepth(z,y);
  const up=(y-view.y)*view.cos+(view.z-z)*view.sin;
  return [OX+x*S/depth,OY-up*S/depth*(W<H?1.38:1)];
}
function polygon(points,fill,stroke,width=1){ctx.beginPath();points.forEach((v,i)=>{const p=project(...v);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
function line(points,color,width=2){ctx.beginPath();points.forEach((v,i)=>{const p=project(...v);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function ring(x,z,r,color,width=2,y=0){const pts=[];for(let a=0;a<=Math.PI*2+.05;a+=.09)pts.push([x+Math.cos(a)*r,z+Math.sin(a)*r,y]);line(pts,color,width)}
function box(x,z,w,d,h,color){polygon([[x-w/2,z-d/2,0],[x+w/2,z-d/2,0],[x+w/2,z-d/2,h],[x-w/2,z-d/2,h]],color);polygon([[x+w/2,z-d/2,0],[x+w/2,z+d/2,0],[x+w/2,z+d/2,h],[x+w/2,z-d/2,h]],'#203344');polygon([[x-w/2,z-d/2,h],[x+w/2,z-d/2,h],[x+w/2,z+d/2,h],[x-w/2,z+d/2,h]],'#53707c')}
function textWorld(text,x,z,y,size,color){const p=project(x,z,y);ctx.fillStyle=color;ctx.font='900 '+size+'px Arial';ctx.textAlign='center';ctx.fillText(text,...p)}
function say(text){$('toast').textContent=text;toastTimer=2.6}
function beep(f,d=.12,type='sine'){if(!sound||!soundEnabled)return;const o=sound.createOscillator(),g=sound.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.055,sound.currentTime);g.gain.exponentialRampToValueAtTime(.001,sound.currentTime+d);o.connect(g);g.connect(sound.destination);o.start();o.stop(sound.currentTime+d)}
function resetPossession(who){owner=who;clock=24;aiStealCD=5;charge=-1;shot=null;aiWait=0;players[who].x=-1.1;players[who].z=9.3;players[1-who].x=.15;players[1-who].z=7.1;players.forEach(p=>{Object.assign(p,{y:0,fall:0,trickT:0,vx:0,vz:0,heading:0,gait:0,dribble:.5,trickMotion:null,catchBall:null,contestTime:0});});looseBall=null;$('meter').hidden=true;resetCrew(who);}
function hud() {
  setHud('you','textContent',String(score[0]).padStart(2,'0'));
  setHud('cpu','textContent',String(score[1]).padStart(2,'0'));
  setHud('clock','textContent',mode==='practice'?'PRACTICE · NO CLOCK':(owner===0?'YOUR BALL · ':'RIVAL BALL · ')+Math.ceil(clock));
  setHud('defend','innerHTML',(owner===0?'SPRINT':shot&&shot.who===1?'BLOCK':'STEAL')+'<br><small>E / SHIFT</small>');
  careerHud();
}
function targetScore(){return mode==='career'&&careerMatch?careerMatch.target:21}
function start(skipStory=false){if($('mode').value==='career'&&skipStory!==true){playing=false;paused=false;window.HoopsMusic?.pause();$('menu').hidden=true;window.HoopsCareer.begin(()=>start(true),()=>{$('menu').hidden=false;$('setup').hidden=false;$('play').textContent='CONTINUE STORY →';$('restart').hidden=true;$('lobby').hidden=true;$('trainingEnd').hidden=true;});return;}mode=$('mode').value||'match';heat=0;greenCount=0;steals=0;made=0;attempts=0;runCoins=0;stamina=100;sprintHeld=false;sprintExhausted=false;bestHeat=0;styleCrosses=0;styleDunks=0;styleShowtime=0;aiStealCD=5;window.HoopsMusic?.start();careerMatch=mode==='career'?window.HoopsCareer.config():null;character=careerMatch?careerMatch.player:+$('player').value===3?window.HoopsCareer.player():roster[+$('player').value];difficulty=careerMatch?careerMatch.difficulty:+$('difficulty').value;gym=careerMatch?careerMatch.gym:($('courtStyle').value||'blue');score=[0,0];finished=false;playing=true;paused=false;delay=0;stun=0;crossCD=0;defCD=0;keys={};moveX=moveZ=0;resetStreetMatch();resetPossession(0);$('yourName').textContent=character.name;$('rivalName').textContent=mode==='practice'?'TRAINING':rivalName();$('matchType').textContent=mode==='practice'?'SHOOTAROUND · FREE PLAY':mode==='career'?'CHAPTER '+careerMatch.chapter+'/5 · '+(crewActive()?'3V3 · ':'')+'FIRST TO '+targetScore():crewActive()?'3V3 CREW RUN · FIRST TO 21':'1V1 · FIRST TO 21';$('courtName').textContent=gym==='blue'?'THE STAMP CENTER':gym==='street'?'FLEX PARK / NIGHT RUN':'EMERALD ARENA';$('menu').hidden=true;try{sound=sound||new (window.AudioContext||window.webkitAudioContext)();sound.resume()}catch{}say('YOUR BALL. MAKE YOUR MARK.');hud();}
function pause(){if(!playing||finished)return;paused=!paused;if(paused)window.HoopsMusic?.pause();else window.HoopsMusic?.resume();sprintHeld=false;charge=-1;$('meter').hidden=true;keys={};moveX=moveZ=0;$('knob').style.transform='';$('menu').hidden=!paused;if(paused){shop();$('menuTitle').innerHTML='TAKE A<br><em>BREATHER.</em>';$('menuText').textContent='Your game is paused. The court is waiting.';$('setup').hidden=true;$('play').textContent='BACK TO THE COURT →';$('restart').hidden=false;$('lobby').hidden=false;$('trainingEnd').hidden=mode!=='practice';}}
$('play').onclick=()=>{if(paused){pause();return}start()};$('restart').onclick=start;$('pause').onclick=pause;
function end(){if(finished||mode==='practice')return;finished=true;playing=false;window.HoopsMusic?.pause();const won=score[0]>=targetScore();const reward=won?100+difficulty*25:25;career.coins+=reward;career.streak=won?career.streak+1:0;career.best=Math.max(career.best,career.streak);saveCareer();shop();if(won){wins++;try{localStorage.setItem('sbfent-hoops-wins',wins)}catch{}}$('menuTitle').innerHTML=won?'COURT<br><em>STAMPED.</em>':'RUN IT<br><em>BACK.</em>';$('menuText').textContent=(won?'You owned the court. ':'The rival took this one. ')+score[0]+' – '+score[1]+'. +'+reward+' Flex Coins. '+career.streak+' win streak. '+made+'/'+attempts+' shooting ('+(attempts?Math.round(made/attempts*100):0)+'%), '+greenCount+' green releases, '+steals+' steals, '+assists+' assists, '+lobFinishes+' lob finishes, best combo ×'+bestCombo+'.';$('record').textContent=wins+' COURT WINS / SAVED ON THIS DEVICE';$('setup').hidden=false;$('play').textContent='RUN IT BACK →';$('restart').hidden=true;$('lobby').hidden=true;$('trainingEnd').hidden=true;$('menu').hidden=false;if(mode==='career'){$('legacyPanel').open=true;const result=window.HoopsCareer.finish(won,{greens:greenCount,dunks:styleDunks,showtime:styleShowtime,crosses:styleCrosses,steals,assists,lobs:lobFinishes,combos:bestCombo,specials:specialUses});$('mode').onchange();$('menuTitle').innerHTML=result.champion?'LEGACY<br><em>STAMPED.</em>':won?'CHAPTER<br><em>STAMPED.</em>':'RUN IT<br><em>BACK.</em>';$('menuText').textContent+=' '+result.summary;$('play').textContent=won?(result.champion?'RUN THE FINAL AGAIN →':'NEXT CHAPTER →'):'RETRY CHAPTER →';$('menu').hidden=true;window.HoopsCareer.afterMatch(result,()=>{$('menu').hidden=false;});}}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
$('cross').onclick=cross;$('pass').onclick=requestPass;$('lob').onclick=requestLob;$('stampBreak').onclick=stampBreak;$('defend').onpointerdown=e=>{e.preventDefault();$('defend').setPointerCapture(e.pointerId);if(owner===0)sprintHeld=true;else defend()};$('defend').onpointerup=()=>{sprintHeld=false};$('defend').onpointercancel=()=>{sprintHeld=false};
$('shoot').onpointerdown=e=>{e.preventDefault();shootId=e.pointerId;$('shoot').setPointerCapture(e.pointerId);beginShot()};$('shoot').onpointerup=e=>{if(e.pointerId===shootId){releaseShot();shootId=null}};$('shoot').onpointercancel=()=>{charge=-1;shootId=null;$('meter').hidden=true};
$('stick').onpointerdown=e=>{if(stickId!==null)return;e.preventDefault();stickId=e.pointerId;$('stick').setPointerCapture(e.pointerId);joystick(e)};
function joystick(e){const r=$('stick').getBoundingClientRect(),radius=r.width*.34;let x=e.clientX-r.left-r.width/2,z=e.clientY-r.top-r.height/2;const n=Math.max(1,Math.hypot(x,z)/radius);x/=n;z/=n;moveX=x/radius;moveZ=z/radius;$('knob').style.transform=`translate(${x}px,${z}px)`}
$('stick').onpointermove=e=>{if(e.pointerId===stickId)joystick(e)};function lift(e){if(e.pointerId===stickId){stickId=null;moveX=moveZ=0;$('knob').style.transform=''}}$('stick').onpointerup=lift;$('stick').onpointercancel=lift;
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&playing)e.preventDefault();if(e.code==='Escape'){pause();return}if(e.target.matches('select,button,input,summary')&&!$('menu').hidden)return;if(!keys[e.code]){if(e.code==='Space')beginShot();if(e.code==='KeyX')cross();if(e.code==='KeyF')requestPass();if(e.code==='KeyL')requestLob();if(e.code==='KeyR')stampBreak();if(e.code==='KeyE'){if(owner===0)sprintHeld=true;else defend()}}keys[e.code]=true});addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyE')sprintHeld=false;if(e.code==='Space')releaseShot()});addEventListener('blur',()=>{if(playing&&!paused)pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!paused)pause()});
function mix(from, to, amount) {
  return from + (to - from) * amount;
}

function ease(from, to, value) {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

function mixPoint(from, to, amount) {
  return from.map((value, axis) => mix(value, to[axis], amount));
}

function turn(p, heading, dt) {
  const current = p.heading || 0;
  const difference = Math.atan2(Math.sin(heading - current), Math.cos(heading - current));
  p.heading = current + difference * -Math.expm1(-16 * dt);
}

function move(p, dx, dz, speed, dt) {
  if (p.fall > 0) {
    p.vx = 0;
    p.vz = 0;
    return;
  }
  const length = Math.max(1, Math.hypot(dx, dz));
  const targetX = dx * speed / length;
  const targetZ = dz * speed / length;
  const vx = p.vx || 0;
  const vz = p.vz || 0;
  const braking = Math.hypot(targetX, targetZ) < .01 || targetX * vx + targetZ * vz < 0;
  const response = braking ? 32 : 22;
  const blend = -Math.expm1(-response * dt);
  p.vx = mix(vx, targetX, blend);
  p.vz = mix(vz, targetZ, blend);

  const x = p.x;
  const z = p.z;
  p.x = Math.max(-6.2, Math.min(6.2, x + targetX * dt + (vx - targetX) * blend / response));
  p.z = Math.max(.65, Math.min(11.6, z + targetZ * dt + (vz - targetZ) * blend / response));
  if (p.x === -6.2 || p.x === 6.2) p.vx = 0;
  if (p.z === .65 || p.z === 11.6) p.vz = 0;
  p.gait = (p.gait || 0) + Math.hypot(p.x - x, p.z - z) * 3.8;
  if (Math.hypot(targetX, targetZ) > .25) turn(p, Math.atan2(targetX, -targetZ), dt);
}

function advanceTrick(p, dt) {
  const trick = p.trickMotion;
  if (!trick) return;
  const previous = ease(0, .24, trick.time);
  trick.time += dt;
  const change = ease(0, .24, trick.time) - previous;
  p.x = Math.max(-6.2, Math.min(6.2, p.x + trick.dx * change));
  p.z = Math.max(.65, Math.min(11.6, p.z + trick.dz * change));
  p.gait = (p.gait || 0) + Math.hypot(trick.dx, trick.dz) * change * 3.8;
  if (trick.time >= .24) p.trickMotion = null;
}

function poseHeading(p) {
  const heading = p.heading || 0;
  if (p.trick !== 'SPIN MOVE' || !p.trickT) return heading;
  return heading + Math.PI * 2 * ease(0, .5, .5 - p.trickT);
}

function actorPoint(p, x, z, y, heading = poseHeading(p)) {
  const c = Math.cos(heading), s = Math.sin(heading);
  return [p.x + x * c - z * s, p.z + x * s + z * c, y + p.y];
}

function heldBall(p) {
  const stride = Math.hypot(p.vx || 0, p.vz || 0);
  const bounce = .19 + Math.abs(Math.sin((p.dribble || 0) * Math.PI)) * .91;
  let ball = actorPoint(p, .53, -.13 - Math.min(.22, stride * .05), bounce);
  if (p.trickT > 0) {
    const t = 1 - p.trickT / .5;
    const swing = Math.sin(Math.PI * t);
    const reach = p.trick === 'SPIN MOVE' ? Math.sin(t * Math.PI * 2) : 1 - 2 * swing;
    const trickBall = actorPoint(p, .62 * reach, p.trick === 'BEHIND THE BACK' ? .38 : -.28, .76);
    ball = mixPoint(ball, trickBall, swing);
  }
  if (p.catchBall) ball = mixPoint(p.catchBall.from, ball, ease(0, .22, p.catchBall.time));
  return ball;
}

function shotBall(s) {
  const phase = Math.min(1, s.t / s.duration);
  if (s.redirect) {
    const t = (phase - s.redirect.phase) / (1 - s.redirect.phase);
    return mixPoint(s.redirect.from, [s.redirect.from[0] + .95, s.redirect.from[1] + 1.05, .2], t);
  }
  const rim = s.make ? [0, 1.6, 3.15] : [.48, 1.72, 3.13];
  const through = s.make ? [0, 1.6, .55] : [1.16, 2.35, .25];
  if (s.dunk) {
    const p = players[s.actor];
    if (phase < .22) {
      return mixPoint(s.startBall, actorPoint(p, .28, -.37, s.lob ? 1.8 : 1.42), ease(0, .22, phase));
    }
    if (phase < .64) {
      const gather = actorPoint(p, .28, -.37, s.lob ? 1.8 : 1.42);
      return mixPoint(gather, rim, ease(.22, .64, phase));
    }
    return mixPoint(rim, through, ease(.64, 1, phase));
  }
  const release = [s.x + .20, s.z - .24, s.startY + 2.49];
  if (phase < .22) return mixPoint(s.startBall, release, ease(0, .22, phase));
  if (phase > .86) return mixPoint(rim, through, (phase - .86) / .14);
  const flight = (phase - .22) / .64;
  const ball = mixPoint(release, rim, flight);
  ball[2] += Math.sin(flight * Math.PI) * 2.45;
  return ball;
}

function passBall(f) {
  const phase = Math.min(1, f.t / f.duration);
  if (f.self) {
    const glass = [0, 1.06, 3.65];
    if (phase < .64) {
      const t = phase / .64;
      const ball = mixPoint(f.startBall, glass, t);
      ball[2] += Math.sin(Math.PI * t) * .65;
      return ball;
    }
    return mixPoint(glass, [f.tx, f.tz, 1.9], (phase - .64) / .36);
  }
  const ball = mixPoint(f.startBall, f.receive, phase);
  ball[2] += Math.sin(phase * Math.PI) * (f.lob ? 2.4 : .65);
  return ball;
}

function animateShot(s, dt) {
  const p = players[s.actor];
  const phase = Math.min(1, s.t / s.duration);
  const start = s.dunk ? .055 : .06;
  const end = s.dunk ? .88 : .58;
  const t = Math.max(0, Math.min(1, (phase - start) / (end - start)));
  const height = s.dunk ? (s.special ? 2.1 : s.showtime ? 1.55 : 1.15) : .42;
  p.y = s.startY * (1 - ease(0, .2, phase)) + 4 * height * t * (1 - t);
  turn(p, s.rimHeading, dt);
  if (s.dunk) {
    const progress = ease(.035, .82, phase);
    p.x = mix(s.x, 0, progress);
    p.z = mix(s.z, 2, progress);
  }
}
function crewActive(){return mode==='crew'||mode==='career'&&!!careerMatch?.crew}
function teamOf(i){return i===0||i===2||i===3?0:1}
function teamActors(t){return crewActive()?(t===0?[0,2,3]:[1,4,5]):[t]}
function actorName(i){return i===0?character.name:i===1?rivalName():i===2?(character.name==='LIL JUICE'?'FLEX':'LIL JUICE'):i===3?(character.name==='GOLDIE'?'FLEX':'GOLDIE'):i===4?'RIVAL 02':'RIVAL 03'}
function closestEnemy(i){return teamActors(1-teamOf(i)).reduce((a,b)=>distance(players[i],players[a])<distance(players[i],players[b])?a:b)}
function resetStreetMatch(){stampCharge=0;comboCount=0;comboClock=0;trickIndex=0;bestCombo=0;assists=0;lobFinishes=0;hypeLife=0;lastPass=null;passFlight=null;specialUses=0;lastTrick='';}
function gainStamp(n){stampCharge=Math.min(100,stampCharge+n)}
function crowdRoar(){if(!soundEnabled||!sound||typeof sound.createBuffer!=='function')return;try{const n=Math.floor(sound.sampleRate*.65),b=sound.createBuffer(1,n,sound.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(.65+.35*Math.sin(i*.013));const src=sound.createBufferSource(),filter=sound.createBiquadFilter(),g=sound.createGain(),t=sound.currentTime;src.buffer=b;filter.type='bandpass';filter.frequency.value=850;filter.Q.value=.35;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.06,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+.65);src.connect(filter);filter.connect(g);g.connect(sound.destination);src.start();src.stop(t+.66);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect()};}catch{}}
function hype(text){if(hypeLife<=0)crowdRoar();hypeCaption=text;hypeLife=1.5;beep(620,.2,'triangle');}
function resetCrew(who){ballHolder=who;passFlight=null;crewHoldTime=0;cpuPassCD=3;lastPass=null;comboCount=0;comboClock=0;const spots=[[-1.1,9.3],[.15,7.1],[-3.5,5.3],[3.8,7],[-3.2,4],[3.5,5.8]];for(let i=2;i<6;i++)Object.assign(players[i],{x:spots[i][0],z:spots[i][1],y:0,fall:0});if(who===1){players[2].z=3.8;players[3].z=5.7;players[4].z=5.3;players[5].z=7;}}
function arcadeHud() {
  setHudStyle('stampFill','width',stampCharge+'%');
  setHud('stampLabel','textContent',stampCharge>=100?'STAMP BREAK READY · R':'STAMP '+Math.floor(stampCharge)+'/100');
  setHud('comboLabel','textContent',comboCount>0?'STYLE ×'+comboCount+' · '+lastTrick:'BUILD STYLE · CROSS, PASS, FINISH');
  setHud('stampBreak','disabled',stampCharge<100||owner!==0||ballHolder!==0||!!shot||!!passFlight);
  setHud('pass','disabled',!crewActive()||owner!==0||!!shot||!!passFlight);
  setHud('lob','disabled',owner!==0||!!shot||delay>0);
  setHud('cross','disabled',owner!==0||ballHolder!==0||!!shot||!!passFlight);
  setHud('lob','innerHTML',passFlight?.self?(passFlight.finishQueued?'LOCKED!':'FINISH!'):(crewActive()?'ALLEY<br>OOP':'SELF<br>LOB'));
  setHud('shoot','innerHTML',crewActive()&&owner===0&&ballHolder!==0?'CALL<br>BALL':'HOLD<br>SHOOT');
  setHud('hype','textContent',hypeCaption);
  setHud('hype','hidden',hypeLife<=0);
}
function beginShot(){if(passFlight?.self){requestLob();return;}if(!playing||paused||delay>0||shot||passFlight||owner!==0||charge>=0)return;if(crewActive()&&ballHolder!==0){requestPass();return;}charge=0;$('meter').hidden=false;}
function releaseShot(){if(charge<0)return;const q=charge;charge=-1;$('meter').hidden=true;if(!playing||paused||owner!==0||shot||passFlight||delay>0)return;launch(0,q,0);}
function launch(who,q,actor=who,options={}){const human=actor===0;if(human)attempts++;const p=players[actor],enemy=closestEnemy(actor),near=distance(p,players[enemy]),dist=Math.hypot(p.x,p.z-1.5),dunk=!!options.special||!!options.lob||dist<(human?(character.dunkRange||2.25):2.25),green=Math.abs(q-.72)<.075;
let chance=human?(green?.97:.76-Math.abs(q-.72)*1.3)+character.touch:who===0?.69:.56+difficulty*.12;if(human&&(Math.hypot(moveX,moveZ)>.1||keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||keys.ArrowUp||keys.ArrowDown||keys.ArrowLeft||keys.ArrowRight))chance-=.08;chance-=Math.max(0,2.4-near)*.15;chance-=Math.max(0,dist-6)*.025;if(human&&heat>=3)chance+=.07;if(dunk)chance=options.special?1:options.lob?.94-Math.max(0,1.7-near)*.12:.96;chance=Math.max(.04,Math.min(1,chance));
shot={who,actor,x:p.x,z:p.z,startY:p.y,startBall:options.startBall||heldBall(p),rimHeading:Math.atan2(-p.x,Math.max(.3,p.z-1.6)),q,t:0,duration:dunk?(options.special?1.1:options.lob?.85:who===0&&heat>=3?.85:.65):1.12,showtime:who===0&&dunk&&(heat>=3||options.special),special:!!options.special,lob:!!options.lob,assist:who===0&&actor!==0&&lastPass?.from===0&&lastPass.to===actor&&time-lastPass.time<4,combo:human?comboCount:0,make:Math.random()<chance,dunk,points:options.special?3:dist>5.8&&!dunk?2:1,green,blocked:false};p.vx=0;p.vz=0;p.trickMotion=null;p.catchBall=null;
if(human&&green&&!dunk){greenCount++;gainStamp(12);if(greenCount===3&&mode!=='practice'){career.coins+=30;runCoins+=30;saveCareer()}flash=.8;burst(p.x,p.z,'#d9ff75')}if(human)say(options.special?'STAMP BREAKER!':options.lob?'RISE UP!':dunk?'TO THE RIM!':green?'GREEN RELEASE!':q<.645?'EARLY RELEASE':'LATE RELEASE');beep(green?740:360);}
function cross(){if(!playing||paused||owner!==0||ballHolder!==0||shot||passFlight||delay>0||crossCD>0||charge>=0)return;if(stamina<22){say('CATCH YOUR BREATH');return}stamina-=22;styleCrosses++;crossCD=character.myPlayer&&character.crossBonus>.2?.5:.65;const p=players[0],enemy=closestEnemy(0),near=distance(p,players[enemy]),dz=moveZ+(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0),tricks=['CROSSOVER','BEHIND THE BACK','SPIN MOVE'];const trick=dz>.35?'STEP BACK':dz<-.35?'SPIN MOVE':tricks[trickIndex++%3];
comboCount=comboClock>0&&trick!==lastTrick?Math.min(4,comboCount+1):1;comboClock=4.5;lastTrick=trick;p.trick=trick;p.trickT=.5;for(let k=0;k<7;k++)particles.push({x:p.x+(Math.random()-.5)*.7,z:p.z,y:.7,vx:(Math.random()-.5)*1.6,vz:(Math.random()-.5)*1.2,vy:.4,life:.4,color:'#b898ef'});bestCombo=Math.max(bestCombo,comboCount);p.trickMotion={dx:p.x>0?-1.4:1.4,dz:trick==='SPIN MOVE'?-.8:trick==='STEP BACK'?1.05:0,time:0};stun=1+(character.crossBonus||0);if(near<3){gainStamp(6+comboCount*3);if(comboCount>=2){players[enemy].fall=.9;hype('ANKLE BREAKER ×'+comboCount);}}beep(180,.1);say(trick+' · STYLE ×'+comboCount);}
function sendPass(to,lob=false,self=false){const from=ballHolder,p=players[from],r=players[to];passFlight={from,to,x:p.x,z:p.z,startBall:heldBall(p),receive:actorPoint(r,.44,-.18,lob?1.65:1.10),tx:self?0:r.x,tz:self?2.1:r.z,t:0,duration:self?.85:lob?.65:Math.min(.6,.25+distance(p,r)*.025),lob,self,finishQueued:!self};charge=-1;$('meter').hidden=true;crewHoldTime=0;}
function requestPass(){if(!playing||paused||owner!==0||shot||passFlight||delay>0||!crewActive())return;let to=0;if(ballHolder===0){to=[2,3].sort((a,b)=>distance(players[b],players[closestEnemy(b)])-distance(players[a],players[closestEnemy(a)]))[0]}sendPass(to);say(to===0?'COMING BACK. GET OPEN.':'PASS TO '+actorName(to));}
function requestLob(){if(!playing||paused||owner!==0||shot||delay>0)return;if(passFlight){if(passFlight.self&&!passFlight.finishQueued){const t=passFlight.t/passFlight.duration;if(t>=.3&&t<=.95){passFlight.finishQueued=true;say('CATCH AND FINISH!')}else say('WAIT FOR THE BALL…')}return;}if(crewActive()){const to=ballHolder===0?[2,3].sort((a,b)=>Math.hypot(players[a].x,players[a].z-1.5)-Math.hypot(players[b].x,players[b].z-1.5))[0]:0;if(Math.hypot(players[to].x,players[to].z-1.5)>3.8){say(to===0?'CUT TO THE RIM, THEN CALL THE LOB':'WAIT FOR YOUR TEAMMATE TO CUT');return}sendPass(to,true);say('LOB IS UP!');}else{const p=players[0];if(Math.hypot(p.x,p.z-1.5)>4.8){say('DRIVE INSIDE FOR THE SELF LOB');return}if(stamina<18){say('CATCH YOUR BREATH');return}stamina-=18;sendPass(0,true,true);say('OFF THE GLASS! TAP LOB AGAIN TO FINISH.');}}
function stampBreak(){if(!playing||paused||owner!==0||ballHolder!==0||shot||passFlight||delay>0||stampCharge<100)return;if(Math.hypot(players[0].x,players[0].z-1.5)>4.8){say('STAMP READY. DRIVE INSIDE THE ARC.');return}stampCharge=0;specialUses++;launch(0,.72,0,{special:true});hype('STAMP BREAKER');flash=.8;}
function defend(){if(!playing||paused||owner!==1||delay>0||defCD>0)return;defCD=1.1;players[0].contestTime=.36;if(passFlight&&passFlight.t/passFlight.duration>.35&&distance(players[0],players[passFlight.to])<1.8){passFlight=null;owner=0;ballHolder=0;steals++;delay=.6;gainStamp(22);hype('PASS PICKED!');return}const actor=shot?.actor??ballHolder,d=distance(players[0],players[actor]);if(shot&&shot.who===1){if(d<2.3&&shot.t<.48){shot.redirect={from:shotBall(shot),phase:shot.t/shot.duration};shot.make=false;shot.blocked=true;gainStamp(20);hype('GET THAT OUT!');beep(140,.15,'triangle')}else say('LATE CONTEST');}else if(d<1.7&&Math.random()<Math.min(.88,.65+(character.defense||0))){delay=.65;owner=0;ballHolder=0;steals++;gainStamp(18);career.coins+=5;runCoins+=5;saveCareer();hype('POCKET PICKED');say('POCKET PICKED. YOUR BALL!');beep(540);}else say(d>=1.7?'GET CLOSER TO STEAL':'RIVAL PROTECTS THE BALL');}
function updatePass(dt) {
  const f = passFlight;
  f.t += dt;
  if (f.self) {
    const progress = ease(0, f.duration, f.t) * .85;
    players[0].x = mix(f.x, 0, progress);
    players[0].z = mix(f.z, 2.1, progress);
  }
  if (f.t < f.duration) return;

  const catchPoint = passBall(f);
  passFlight = null;
  if (f.self && !f.finishQueued) {
    owner = mode === 'practice' ? 0 : 1;
    ballHolder = owner;
    looseBall = catchPoint;
    delay = .8;
    comboCount = 0;
    say('MISSED THE SELF LOB. TIME THE SECOND TAP.');
    return;
  }
  ballHolder = f.to;
  crewHoldTime = 0;
  lastPass = {from:f.from,to:f.to,time};
  if (f.lob) {
    launch(owner, .72, f.to, {lob:true,startBall:catchPoint});
  } else {
    players[f.to].catchBall = {from:catchPoint,time:0};
    say(ballHolder === 0 ? 'YOUR BALL. ATTACK.' : actorName(ballHolder) + ' HAS IT · SHOOT TO CALL BACK');
  }
}
function updateCrew(dt){crewHoldTime+=dt;cpuPassCD=Math.max(0,cpuPassCD-dt);const off=teamActors(owner),def=teamActors(1-owner);for(const i of [...off,...def]){if(i===0)continue;const p=players[i];if(teamOf(i)===owner){let tx,tz;if(i===ballHolder){tx=Math.sin(crewHoldTime*1.5)*2;tz=3.4;}else{const slot=off.indexOf(i);tx=slot===1?-1.3:3.8;tz=slot===1?2.6:6.5;}move(p,tx-p.x,tz-p.z,2.45+difficulty*.22,dt);}else{const target=players[off[def.indexOf(i)]];if(i===closestEnemy(0)&&owner===0&&stun>0)continue;move(p,target.x-p.x,Math.max(1.8,target.z-1.05)-p.z,2.55+difficulty*.22,dt);}}
if(owner===1){const holder=players[ballHolder],near=distance(holder,players[closestEnemy(ballHolder)]);if(cpuPassCD<=0&&crewHoldTime>1.8&&near<1.6){const to=teamActors(1).filter(i=>i!==ballHolder).sort((a,b)=>distance(players[b],players[closestEnemy(b)])-distance(players[a],players[closestEnemy(a)]))[0];sendPass(to,Math.hypot(players[to].x,players[to].z-1.5)<3.4);cpuPassCD=5;return;}if(crewHoldTime>3.1+(2-difficulty)*.35&&holder.z<7){launch(1,.72,ballHolder);crewHoldTime=0;}}
else if(ballHolder!==0&&crewHoldTime>2){launch(0,.72,ballHolder);crewHoldTime=0;}}
function updateShot(dt) {
  shot.t += dt;
  animateShot(shot, dt);
  if (shot.t < shot.duration) return;
  const s = shot;
  looseBall = shotBall(s);
  shot = null;
if(s.make&&!s.blocked){score[s.who]+=s.points;if(s.who===0){if(s.actor===0){made++;if(s.dunk)styleDunks++;if(s.lob)lobFinishes++;if(s.showtime){styleShowtime++;flash=1;}}if(s.assist){assists++;gainStamp(20);}heat++;bestHeat=Math.max(bestHeat,heat);gainStamp(s.actor===0?18:8);const bonus=(s.green?5:2)+Math.max(0,s.combo-1)*3;career.coins+=bonus;runCoins+=bonus;saveCareer();if(s.special)hype('STAMP BREAKER! +3');else if(s.lob)hype(s.assist?'ALLEY-OOP ASSIST!':'OFF THE GLASS!');else if(s.showtime)hype('SHOWTIME FINISH!');else if(s.combo>=2)hype('STYLE ×'+s.combo+' → BUCKET!');else if(s.dunk)hype('STAMPED DUNK!');}
burst(0,1.6,s.who===0?'#d9ff75':'#f7d4b9');say(s.special?'STAMP BREAKER! +3':s.lob?'ALLEY-OOP! +1':s.dunk?(s.showtime?'SHOWTIME FINISH! +1':'STAMPED DUNK! +1'):s.points===2?'FROM DEEP! +2':'BUCKET! +1');beep(880,.22);owner=1-s.who;ballHolder=owner;if(mode!=='practice'&&score[s.who]>=targetScore()){hud();end();return;}}
else{if(s.who===0){heat=0;stampCharge=Math.max(0,stampCharge-10);}const all=[...teamActors(0),...teamActors(1)],nearest=all.sort((a,b)=>Math.hypot(players[a].x,players[a].z-2)-Math.hypot(players[b].x,players[b].z-2))[0];owner=teamOf(nearest);ballHolder=owner;say(s.blocked?'BLOCKED! '+(owner===0?'YOUR':'RIVAL')+' BALL.':'OFF THE RIM. '+(owner===0?'YOUR':'RIVAL')+' REBOUND.');beep(110,.13);}if(mode==='practice'){owner=0;ballHolder=0;}delay=1.15;hud();}
function update(dt){if(!paused){time+=dt;hypeLife=Math.max(0,hypeLife-dt);flash=Math.max(0,flash-dt*2);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=dt*6}particles=particles.filter(p=>p.life>0)}if(!playing||paused)return;crossCD=Math.max(0,crossCD-dt);defCD=Math.max(0,defCD-dt);stun=Math.max(0,stun-dt);comboClock=Math.max(0,comboClock-dt);if(comboClock<=0)comboCount=0;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').textContent=owner===0?'CREATE SPACE. BUILD YOUR STYLE.':'STAY CLOSE. PROTECT THE RIM.'}players.forEach(p=>{p.y=Math.max(0,p.y-dt*2);p.fall=Math.max(0,(p.fall||0)-dt);p.trickT=Math.max(0,(p.trickT||0)-dt);
  if (p.contestTime > 0) {
    p.contestTime = Math.max(0, p.contestTime - dt);
    p.y = .72 * Math.sin(Math.PI * p.contestTime / .36);
  }
  if (p.catchBall) {
    p.catchBall.time += dt;
    if (p.catchBall.time >= .22) p.catchBall = null;
  }
});if(delay>0){
  if (looseBall) looseBall[2] = Math.max(.2, looseBall[2] - 3 * dt);
  for (const p of players) {
    p.vx = (p.vx || 0) * Math.exp(-28 * dt);
    p.vz = (p.vz || 0) * Math.exp(-28 * dt);
  }
  delay-=dt;if(delay<=0){resetPossession(owner);hud()}return;}
const p=players[0],a=players[1];let dx=moveX+(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),dz=moveZ+(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);if(stamina<=3)sprintExhausted=true;else if(stamina>=25)sprintExhausted=false;const sprinting=(sprintHeld||keys.ShiftLeft||keys.ShiftRight)&&!sprintExhausted&&stamina>2&&Math.hypot(dx,dz)>.1&&charge<0;stamina=Math.max(0,Math.min(100,stamina+dt*(sprinting?-27:17)));if (shot?.actor !== 0 && !passFlight?.self) {
  move(p, dx, dz, character.speed * (charge >= 0 ? .3 : sprinting ? 1.48 : 1), dt);
  advanceTrick(p, dt);
}
if (!shot && !passFlight) {
  const holder = players[ballHolder];
  holder.dribble = (holder.dribble || 0) + dt * (2.15 + .16 * Math.hypot(holder.vx || 0, holder.vz || 0));
}
if (shot || passFlight) {
  for (const index of [...teamActors(0), ...teamActors(1)]) {
    if (index === 0 || index === shot?.actor || index === passFlight?.to) continue;
    move(players[index], 0, 0, 0, dt);
  }
}
if(charge>=0){charge=Math.min(1,charge+dt/.95);$('meter').querySelector('b').style.left=charge*100+'%';if(charge>=1)releaseShot();}if(shot){updateShot(dt);hud();return;}if(mode!=='practice')clock-=dt;if(mode!=='practice'&&clock<=0){owner=1-owner;ballHolder=owner;passFlight=null;delay=.8;say('SHOT CLOCK. TURNOVER.');return;}if(passFlight){updatePass(dt);hud();return;}if(crewActive()){updateCrew(dt);hud();return;}
if(mode==='practice'){a.x=30;a.z=3;hud();return;}if(owner===0){aiStealCD=Math.max(0,aiStealCD-dt);if(mode==='career'&&careerMatch.chapter>=3&&distance(p,a)<1&&stun<=0&&aiStealCD<=0&&charge<0&&Math.random()<dt*.35){owner=1;ballHolder=1;delay=.8;aiStealCD=5;say('BALL EXPOSED. '+rivalName()+' STEALS.');return;}if(stun<=0){const tx=p.x*.9,tz=Math.max(2,p.z-1.5);move(a,tx-a.x,tz-a.z,2.6+difficulty*.4,dt);}if(distance(p,a)<.65&&charge<0)p.z=Math.min(11.6,p.z+dt);}
else{aiWait+=dt;const shooter=mode==='career'&&careerMatch.style==='shooter',handler=mode==='career'&&careerMatch.style==='handles',target={x:Math.sin(aiWait*(handler?2.1:1.5))*(handler?3.5:2.8),z:shooter?7.7:3.5+difficulty*.3};move(a,target.x-a.x,target.z-a.z,2.1+difficulty*.45,dt);if(aiWait>2.8+(2-difficulty)*.6&&a.z<(shooter?8:6.8)){launch(1,.72);aiWait=0}}hud();}
let gym='blue',particles=[],flash=0,arenaCache=null,arenaKey='';
const palettes={street:{key:'#7953a0',dark:'#20344c',wall:'#192e44',accent:'#ffbd75'},blue:{key:'#1462a3',dark:'#183d69',wall:'#cadbe5',accent:'#69caff'},emerald:{key:'#247c6e',dark:'#19463f',wall:'#d5dfd6',accent:'#d9ff75'}};
function tint(hex,n){const v=parseInt(hex.slice(1),16);return '#'+[v>>16,(v>>8)&255,v&255].map(c=>Math.max(0,Math.min(255,Math.round(c*n))).toString(16).padStart(2,'0')).join('')}
function block(x,z,w,d,h,c,y=0){const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2;polygon([[x0,z1,y],[x1,z1,y],[x1,z1,y+h],[x0,z1,y+h]],c);polygon([[x0,z0,y],[x0,z1,y],[x0,z1,y+h],[x0,z0,y+h]],tint(c,.7));polygon([[x1,z1,y],[x1,z0,y],[x1,z0,y+h],[x1,z1,y+h]],tint(c,.8));polygon([[x0,z0,y+h],[x1,z0,y+h],[x1,z1,y+h],[x0,z1,y+h]],tint(c,1.22))}
function segment(a,b,width,c){const pa=project(...a),pb=project(...b),scale=S/cameraDepth((a[1]+b[1])/2,(a[2]+b[2])/2);ctx.lineCap='round';ctx.lineWidth=width*scale;ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(...pa);ctx.lineTo(...pb);ctx.stroke();ctx.lineCap='butt'}
function sphere(x,z,y,r,c){const p=project(x,z,y),radius=Math.abs(project(x+r,z,y)[0]-p[0]);const g=ctx.createRadialGradient(p[0]-radius*.32,p[1]-radius*.4,radius*.08,p[0],p[1],radius);g.addColorStop(0,tint(c,1.25));g.addColorStop(.6,c);g.addColorStop(1,tint(c,.65));ctx.fillStyle=g;ctx.beginPath();ctx.arc(...p,radius,0,Math.PI*2);ctx.fill()}
function label3(text,x,z,y,size,color){const p=project(x,z,y);ctx.fillStyle=color;ctx.font='900 '+Math.max(7,size*S/cameraDepth(z,y))+'px Arial';ctx.textAlign='center';ctx.fillText(text,...p)}
const litColors = new Map();

function litColor(color, amount) {
  const shade = Math.round(amount * 16);
  const key = color + ':' + shade;
  if (!litColors.has(key)) litColors.set(key, tint(color, shade / 16));
  return litColors.get(key);
}

function crossVector(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

function subtractPoint(a, b) {
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

function meshFace(faces, vertices, center, color) {
  const normal = crossVector(subtractPoint(vertices[1], vertices[0]), subtractPoint(vertices[2], vertices[0]));
  const length = Math.hypot(...normal);
  if (length < .000001) return;
  const at = [0,0,0];
  for (const vertex of vertices) {
    at[0] += vertex[0] / vertices.length;
    at[1] += vertex[1] / vertices.length;
    at[2] += vertex[2] / vertices.length;
  }
  const outward = normal[0]*(at[0]-center[0]) + normal[1]*(at[1]-center[1]) + normal[2]*(at[2]-center[2]);
  const sign = outward < 0 ? -1 : 1;
  if (sign * (-at[0]*normal[0] + (view.z-at[1])*normal[1] + (view.y-at[2])*normal[2]) <= 0) return;
  const light = sign * (-.34*normal[0] + .34*normal[1] + .88*normal[2]) / length;
  faces.push({vertices,depth:cameraDepth(at[1],at[2]),color:litColor(color,.69+Math.max(0,light)*.40)});
}

function meshRings(faces, rings, center, color) {
  for (let row=0; row<rings.length-1; row++) {
    const low=rings[row], high=rings[row+1];
    for (let i=0; i<low.length; i++) {
      const next=(i+1)%low.length;
      meshFace(faces,[low[i],low[next],high[next],high[i]],center,color);
    }
  }
  meshFace(faces,rings[0],center,color);
  meshFace(faces,rings[rings.length-1],center,color);
}

function bodyMesh(faces, point, levels, color, sides=8) {
  if (W < 700) sides = Math.min(7,sides);
  const rings=levels.map(([height,width,depth,offset=0]) =>
    Array.from({length:sides},(_,i) => {
      const angle=i*Math.PI*2/sides;
      return point(Math.cos(angle)*width,offset+Math.sin(angle)*depth,height);
    }));
  const bottom=levels[0][0], top=levels[levels.length-1][0];
  meshRings(faces,rings,point(0,0,(bottom+top)/2),color);
}

function limbMesh(faces, from, to, upperRadius, lowerRadius, color, sides=6) {
  if (W < 700) sides = Math.min(5,sides);
  const direction=subtractPoint(to,from);
  const length=Math.hypot(...direction);
  if (length<.001) return;
  const axis=direction.map(v=>v/length);
  const perpendicular=crossVector(axis,Math.abs(axis[2])>.85?[1,0,0]:[0,0,1]);
  const scale=Math.hypot(...perpendicular);
  const u=perpendicular.map(v=>v/scale),v=crossVector(axis,u);
  const rings=[[from,upperRadius],[to,lowerRadius]].map(([at,radius]) =>
    Array.from({length:sides},(_,i)=>{
      const angle=i*Math.PI*2/sides;
      return at.map((value,k)=>value+radius*(u[k]*Math.cos(angle)+v[k]*Math.sin(angle)));
    }));
  meshRings(faces,rings,mixPoint(from,to,.5),color);
}

function actorShadow(x,z,y) {
  const center=project(x,z);
  const across=project(x+.49,z);
  const along=project(x,z+.38);
  const width=Math.max(2,Math.abs(across[0]-center[0]));
  const height=Math.max(1,Math.abs(along[1]-center[1]));
  ctx.save();
  ctx.globalAlpha=Math.max(.10,.30-y*.10);
  ctx.fillStyle='#0c1017';
  ctx.beginPath();
  ctx.ellipse(center[0],center[1]+1,width,height,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function person(p,index) {
  const ally=teamOf(index)===0;
  const name=actorName(index);
  const skin=index===0?(character.skin||'#b98159'):
    index===2?'#9a694b':index===3?'#bc875b':mode==='career'?careerMatch.skin:'#8d5c42';
  const signature=ally?outfitColor():mode==='career'?careerMatch.color:'#d25144';
  const arenaSignature=gym!=='street'&&mode!=='career'&&!character.myPlayer&&career.look===0;
  const jersey=ally&&arenaSignature?'#e6e1d4':signature;
  const trimColor=ally&&arenaSignature?'#31586a':ally?'#244754':'#f2d1ad';
  const hair=index===0&&character.hair?character.hair:
    name==='GOLDIE'?'#b68a36':!ally&&mode==='career'?careerMatch.hair:'#181920';
  const action=shot?.actor===index?shot:null;
  const progress=action?Math.min(1,action.t/action.duration):0;
  const movement=Math.min(1,Math.hypot(p.vx||0,p.vz||0)/4.3);
  const stride=p.gait||0;
  const heading=poseHeading(p);
  const fall=p.fall>0?ease(0,.2,.9-p.fall)*ease(0,.27,p.fall):0;
  const tip=fall*1.35;
  const fallCos=Math.cos(tip),fallSin=Math.sin(tip);
  const point=(x,z,y)=>actorPoint(p,x*fallCos+y*fallSin,z,Math.max(.015,y*fallCos-x*fallSin),heading);
  const air=p.y>.045;
  const dip=action?.11*Math.sin(Math.PI*ease(0,.14,progress))+
    .14*Math.sin(Math.PI*ease(.78,1,progress)):0;
  const hips=.89-dip+Math.abs(Math.sin(stride))*movement*.026;
  const lean=-.14*movement;
  const faces=[];

  actorShadow(p.x,p.z,p.y);
  if (index===0) {
    ring(p.x,p.z,.39,heat>=3?'#ffb658':'#d9ff75',2);
  } else if (ballHolder===index && !shot && !passFlight) {
    ring(p.x,p.z,.34,ally?'#d9ff75a0':'#ff8f7ca0',1.5);
  }

  for (const side of [-1,1]) {
    const cycle=stride+(side===1?Math.PI:0);
    const step=Math.sin(cycle)*.37*movement;
    const knee=point(side*.13,step*.47-(air?.24:.10),hips*.53+(air?.15:0));
    const footZ=air?(side===1?-.24:.28):step;
    const footY=air?(side===1?.19:.08):.04+Math.max(0,Math.cos(cycle))*.15*movement;
    const ankle=point(side*.14,footZ,footY+.085);
    const upper=point(side*.13,0,hips-.04);
    const hem=mixPoint(upper,knee,.61);
    limbMesh(faces,upper,hem,.116,.099,litColor(jersey,.85));
    limbMesh(faces,hem,knee,.079,.067,skin);
    limbMesh(faces,knee,ankle,.070,.041,skin);
    limbMesh(faces,ankle,point(side*.14,footZ,footY+.17),.050,.049,'#eeede7');
    limbMesh(faces,point(side*.14,footZ+.075,footY+.01),point(side*.14,footZ-.13,footY+.01),.061,.061,'#d7dbdf');
    limbMesh(faces,point(side*.14,footZ+.059,footY+.052),point(side*.14,footZ-.14,footY+.044),.071,.058,'#f1f0ea');
  }

  bodyMesh(faces,point,[
    [hips-.08,.204,.124,.013],[hips+.015,.197,.127],[hips+.23,.194,.123,lean*.34],
    [hips+.48,.263,.142,lean*.83],[hips+.60,.253,.121,lean],
    [hips+.665,.125,.087,lean]
  ],jersey);
  limbMesh(faces,point(0,lean,hips+.62),point(0,lean-.014,hips+.755),.076,.067,skin,7);

  for (const side of [-1,1]) {
    const shoulder=point(side*.252,lean,hips+.552);
    let hand=point(side*.325,Math.sin(stride+(side===1?0:Math.PI))*.20*movement,hips+.025);
    if (action) {
      const hold=action.dunk?.64:.22;
      const reaching=Math.min(progress,hold,action.redirect?.phase??1);
      const ball=shotBall({...action,redirect:null,t:reaching*action.duration});
      const reach=[ball[0]+(side===-1?-.12:0),ball[1],ball[2]-.075];
      hand=mixPoint(reach,hand,ease(hold,action.dunk?.94:.68,progress));
    } else if (p.contestTime>0) {
      hand=mixPoint(hand,point(side*.29,-.28,hips+1.13),Math.sin(Math.PI*p.contestTime/.36));
    } else if (passFlight&&side===1) {
      const phase=passFlight.t/passFlight.duration;
      if (passFlight.to===index&&phase>=.52) {
        hand=mixPoint(hand,passBall({...passFlight,t:passFlight.duration}),ease(.52,1,phase));
      } else if (passFlight.from===index) {
        hand=mixPoint(passFlight.startBall,hand,ease(0,.32,phase));
      }
    } else if (!shot&&!passFlight&&!looseBall&&ballHolder===index&&delay<=0&&side===1) {
      const ball=heldBall(p);
      hand=[ball[0],ball[1],Math.max(p.y+.79,ball[2]+.07)];
    }
    const elbow=[mix(shoulder[0],hand[0],.49)+side*.09*Math.cos(heading),
      mix(shoulder[1],hand[1],.48)+.07,mix(shoulder[2],hand[2],.52)-.06];
    limbMesh(faces,shoulder,elbow,.086,.057,skin);
    limbMesh(faces,elbow,hand,.056,.037,skin);
    limbMesh(faces,mixPoint(elbow,hand,.94),[hand[0],hand[1]-.037,hand[2]-.023],.046,.042,skin);
  }

  const headY=hips+.76;
  bodyMesh(faces,point,[
    [headY,.068,.073,lean-.017],[headY+.058,.112,.104,lean-.016],
    [headY+.151,.132,.119,lean],[headY+.234,.113,.108,lean+.006],
    [headY+.278,.073,.072,lean+.012]
  ],skin,9);
  const fade=index===0&&character.hairStyle==='fade';
  bodyMesh(faces,point,[
    [headY+.202,.129,.122,lean+.011],[headY+.255,.129,.12,lean+.009],
    [headY+(fade?.286:.320),.079,.086,lean+.013]
  ],hair,8);

  faces.sort((a,b)=>b.depth-a.depth);
  for (const face of faces) polygon(face.vertices,face.color,face.color,.34);

  if (fall<.7) {
    const back=Math.cos(heading)>=0;
    const trim=back?.145:-.145;
    const number=index===0?'01':index===2?'02':index===3?'03':String(22+index);
    if (Math.abs(Math.cos(heading))>.35) {
      const numberColor=ally&&arenaSignature?'#223444':'#f4f0e7';
      jerseyText(number,point(0,lean*.68+trim,hips+.31),.19,numberColor);
      jerseyText(back?'SBFENT':'HOOPS',point(0,lean*.82+trim,hips+.47),.079,numberColor);
      const edge=back?.119:-.119;
      for (const side of [-1,1]) {
        line([point(side*.172,edge,hips+.045),point(side*.184,lean*.48+edge,hips+.31),
          point(side*.219,lean+edge,hips+.53)],trimColor,Math.max(.6,S/cameraDepth(p.z,p.y)*.014));
      }
    }
    if (!back&&Math.abs(Math.cos(heading))>.45) {
      for (const side of [-1,1]) {
        const eye=point(side*.048,lean-.114,headY+.16);
        segment([eye[0]-.016,eye[1],eye[2]],[eye[0]+.016,eye[1],eye[2]],.012,'#231b1a');
      }
      sphere(...point(0,lean-.12,headY+.12),.028,skin);
    }
    if (name==='LIL JUICE'||index===0&&character.hairStyle==='locs') {
      for (let n=-2;n<=2;n++) segment(point(n*.045,lean+.106,headY+.24),point(n*.051,lean+.145,headY+.10),.031,hair);
    } else if (!fade && (name==='GOLDIE'||index===0&&character.hairStyle==='curls')) {
      for (let n=0;n<7;n++) {
        const a=n*Math.PI*2/7;
        sphere(...point(Math.cos(a)*.10,lean+Math.sin(a)*.091,headY+.285),.039,hair);
      }
    }
  }
  if (index===0||ballHolder===index||fall>.55) {
    label3(fall>.55?'ANKLES!':name,p.x,p.z,p.y+mix(2.26,1.24,fall),.16,ally?'#d9ff75':'#f6a59a');
  }
}
function jerseyText(text, at, size, color) {
  ctx.font='900 '+Math.max(3,size*S/cameraDepth(at[1],at[2]))+'px Arial';
  ctx.fillStyle=color;
  ctx.textAlign='center';
  ctx.fillText(text,...project(...at));
}

function basketball(x,z,y){sphere(x,z,y,.145,'#cb773a');const p=project(x,z,y),r=Math.abs(project(x+.145,z,y)[0]-p[0]);ctx.strokeStyle='#5f3828';ctx.lineWidth=Math.max(.6,r*.1);ctx.beginPath();ctx.moveTo(p[0]-r,p[1]);ctx.lineTo(p[0]+r,p[1]);ctx.moveTo(p[0],p[1]-r);ctx.bezierCurveTo(p[0]+r*.6,p[1]-r*.5,p[0]+r*.6,p[1]+r*.5,p[0],p[1]+r);ctx.stroke()}
function floorText(text,x,z,size,c){ctx.save();const p=project(x,z,.025),left=project(x-size,z,.025),back=project(x,z-1,.025),front=project(x,z+1,.025);ctx.translate(...p);ctx.scale(1,Math.max(.18,Math.abs(front[1]-back[1])/Math.abs(project(x+2,z)[0]-p[0])));ctx.fillStyle=c;ctx.font='900 '+Math.abs(p[0]-left[0])+'px Arial';ctx.textAlign='center';ctx.fillText(text,0,0);ctx.restore()}
function hardwood() {
  const woods=['#ba844f','#bd8955','#c0915b','#b98553','#bf8b55','#c39461','#b6814c'];
  const width=.21;
  for (let board=0; board<82; board++) {
    const x=-8.61+board*width;
    const offset=(board%4)*.78;
    for (let piece=0; piece<7; piece++) {
      const start=Math.max(-1.7,-4.7+offset+piece*3.1);
      const end=Math.min(14.6,-4.7+offset+(piece+1)*3.1);
      if (end<=start) continue;
      polygon([[x,start,.004],[x+width-.006,start,.004],[x+width-.006,end,.004],[x,end,.004]],
        woods[(board*3+piece*5)%woods.length]);
      if ((board+piece)%3===0) {
        line([[x+.055,start+.1,.005],[x+.069,end-.1,.005]],'#6d42251c',.6);
      }
    }
  }
}

function indoorLines(pal) {
  polygon([[-8.6,-1.7,.012],[8.6,-1.7,.012],[8.6,0,.012],[-8.6,0,.012]],pal.dark);
  polygon([[-8.6,0,.012],[-6.8,0,.012],[-6.8,13.3,.012],[-8.6,13.3,.012]],pal.dark);
  polygon([[6.8,0,.012],[8.6,0,.012],[8.6,13.3,.012],[6.8,13.3,.012]],pal.dark);
  polygon([[-2.25,0,.016],[2.25,0,.016],[2.25,4.8,.016],[-2.25,4.8,.016]],pal.key);
  const paint='#fff4dc';
  polygon([[-6.8,0,.022],[6.8,0,.022],[6.8,12.4,.022],[-6.8,12.4,.022]],null,paint,2);
  polygon([[-2.25,0,.024],[2.25,0,.024],[2.25,4.8,.024],[-2.25,4.8,.024]],null,paint,1.7);
  ring(0,4.8,2.25,paint,1.7);
  ring(0,12.4,1.55,paint,1.5);
  const arc=[], restricted=[];
  for (let angle=0; angle<=Math.PI+.02; angle+=.038) {
    arc.push([Math.cos(angle)*5.8,1.5+Math.sin(angle)*5.8,.028]);
    restricted.push([Math.cos(angle)*1.15,1.5+Math.sin(angle)*1.15,.028]);
  }
  line(arc,paint,1.8);
  line(restricted,paint,1.4);
  for (const side of [-1,1]) {
    line([[side*5.8,0,.03],[side*5.8,1.5,.03]],paint,1.8);
    for (const z of [1.4,2.16,2.88,3.6,4.38]) {
      line([[side*2.25,z,.03],[side*2.47,z,.03]],paint,1.5);
    }
  }
  for (let lane=-3;lane<=3;lane++) {
    const x=lane*1.7;
    polygon([[x-.065,2.6,.013],[x+.068,2.6,.013],[x+.14,11.7,.013],[x-.14,11.7,.013]],'#fff3b92c');
  }
  floorText('SBFENT',0,9.65,1.06,'#293747ae');
  floorText('STAMPED BY FLEX',0,10.46,.34,'#283845b0');
  floorText(gym==='emerald'?'EMERALD ARENA':'THE STAMP CENTER',0,-.45,.36,'#f3ead4');
}

function audienceMember(x,z,y,seed) {
  const shirts=['#6b7282','#887c6a','#394458','#786656','#315660','#8c8b92','#966c53','#70545e'];
  const skins=['#674735','#805943','#a27050','#b78b71','#5a4137'];
  const shift=(seed%7-3)*.012;
  const color=shirts[(seed*13)%shirts.length];
  const head=project(x+shift,z,y+.43);
  const scale=S/cameraDepth(z,y+.43);
  polygon([[x-.145,z,y],[x+.145,z,y],[x+.137,z,y+.20],
    [x+.072,z,y+.31],[x-.085,z,y+.31],[x-.145,z,y+.20]],color);
  ctx.fillStyle=skins[(seed*7)%skins.length];
  ctx.beginPath();
  ctx.ellipse(head[0],head[1],Math.max(1,scale*.064),Math.max(1,scale*.086),0,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle=seed%5===0?'#51483c':'#272326';
  ctx.beginPath();
  ctx.ellipse(head[0],head[1]-scale*.044,Math.max(1,scale*.060),Math.max(1,scale*.045),0,0,Math.PI*2);
  ctx.fill();
}

function arena() {
  if (gym==='street') {
    streetArena();
    return;
  }
  const pal=palettes[gym];
  const backdrop=ctx.createLinearGradient(0,0,0,H);
  backdrop.addColorStop(0,'#10151f');
  backdrop.addColorStop(.56,'#2f3741');
  backdrop.addColorStop(1,'#2a292c');
  ctx.fillStyle=backdrop;
  ctx.fillRect(0,0,W,H);

  polygon([[-17,-9,0],[17,-9,0],[17,18,0],[-17,18,0]],'#222d3a');
  polygon([[-8.62,-1.72,.002],[8.62,-1.72,.002],[8.62,14.6,.002],[-8.62,14.6,.002]],'#8a623b');
  hardwood();
  indoorLines(pal);

  polygon([[-17,-12.8,0],[17,-12.8,0],[17,-12.8,11],[-17,-12.8,11]],'#232d3a');
  for (let x=-15;x<=15;x+=3.4) {
    polygon([[x,-8.99,6.8],[x+.15,-8.99,6.8],[x+.15,-8.99,11],[x,-8.99,11]],'#394353');
    line([[x+.1,-8.97,9.64],[x+1.65,-8.97,9.64]],'#c6c4ad',2);
  }

  for (let row=11;row>=0;row--) {
    const z=-2.55-row*.76;
    const y=.48+row*.52;
    block(0,z,31,.78,.37,'#252d39',y-.38);
    for (let seat=-33;seat<=33;seat++) {
      if (Math.abs(seat)%17<2||((seat+35)*3+row)%13===0) continue;
      audienceMember(seat*.45,z+.04,y,(row+1)*137+seat+33);
    }
    if (row===3||row===7||row===11) line([[-15,z+.4,y+.25],[15,z+.4,y+.25]],'#96979966',1);
  }

  for (const side of [-1,1]) {
    for (let row=3;row>=0;row--) {
      const x=side*(9.1+row*.83),y=.43+row*.42;
      block(x,4.5,.84,13.4,.34,'#242a34',y-.33);
      for (let seat=0;seat<24;seat++) {
        if (seat%8!==0) audienceMember(x,-1.5+seat*.51,y,seat+(side+2)*17+row*39);
      }
    }
    block(side*4.3,-1.88,5.2,.53,.45,'#18232f');
    label3(side<0?'STAMPED BY FLEX':'SBFENT HOOPS',side*4.3,-1.57,.26,.23,'#e5e1d3');
    line([[side*1.7,-1.57,.48],[side*6.9,-1.57,.48]],pal.accent,1);
  }
}

function drawCourtScoreboard() {
  if (gym==='street') return;
  const title=gym==='emerald'?'EMERALD ARENA':'STAMP CENTER';
  const x=6.1;
  polygon([[x-1.65,-7.92,5.45],[x+1.65,-7.92,5.45],[x+1.65,-7.92,7],[x-1.65,-7.92,7]],'#101a26','#4d5663',2);
  label3(title,x,-7.89,6.72,.20,'#d3dbe2');
  label3(String(score[0]).padStart(2,'0')+'   :   '+String(score[1]).padStart(2,'0'),x,-7.88,6.12,.50,'#f6edcd');
  label3(String(Math.ceil(clock)).padStart(2,'0'),x,-7.87,5.68,.23,'#ff8069');
}
function hoopBase(){block(0,-.15,1.3,1.4,.35,palettes[gym].dark);block(0,-.35,.42,.44,3.5,palettes[gym].key);segment([0,-.35,3.4],[0,1.02,3.9],.14,'#d6dde2');polygon([[-1.12,1.05,2.9],[1.12,1.05,2.9],[1.12,1.05,4.22],[-1.12,1.05,4.22]],'#c8edf530','#edf6f1',3);polygon([[-.43,1.04,3.03],[.43,1.04,3.03],[.43,1.04,3.51],[-.43,1.04,3.51]],null,'#f4f7e6',2)}
function hoopNet(){ring(0,1.6,.46,'#f18549',3,3.05);for(let a=0;a<10;a++){const k=a/10*Math.PI*2;line([[Math.cos(k)*.46,1.6+Math.sin(k)*.46,3.05],[Math.cos(k+.4)*.25,1.6+Math.sin(k+.4)*.25,2.48]],'#f5f2e7b0',1)}ring(0,1.6,.32,'#f5f2e780',1,2.7)}
function burst(x,z,color){for(let i=0;i<22;i++)particles.push({x,z,y:3.1,vx:(Math.random()-.5)*4,vz:(Math.random()-.5)*3,vy:2+Math.random()*3,life:1,color})}
function render() {
  const key = [canvas.width, canvas.height, gym].join(':');
  if (key !== arenaKey) {
    arena();
    if (!arenaCache) arenaCache = document.createElement('canvas');
    arenaCache.width = canvas.width;
    arenaCache.height = canvas.height;
    arenaCache.getContext('2d').drawImage(canvas,0,0);
    arenaKey = key;
  } else {
    ctx.drawImage(arenaCache, 0, 0, W, H);
  }
  drawCourtScoreboard();
  hoopBase();
  const actors = mode === 'practice' ? [0] : [...teamActors(0), ...teamActors(1)];
  actors.sort((a,b) => players[a].z - players[b].z).forEach(i => person(players[i], i));
  const ball = shot ? shotBall(shot) : passFlight ? passBall(passFlight) :
    looseBall || heldBall(players[ballHolder]);
  basketball(...ball);
  hoopNet();
  for (const particle of particles) {
    const [x,z] = project(particle.x, particle.z, particle.y);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillRect(x,z,3,3);
  }
  ctx.globalAlpha = 1;
  if (flash > 0) {
    ctx.fillStyle = 'rgba(217,255,117,' + flash * .12 + ')';
    ctx.fillRect(0,0,W,H);
  }
  setHudStyle('cross','opacity',crossCD > 0 || owner !== 0 ? '.5' : '1');
  setHudStyle('shoot','opacity',owner !== 0 ? '.5' : '1');
  setHudStyle('defend','opacity',owner === 0 ? (stamina < 5 ? '.5' : '1') : (defCD > 0 ? '.5' : '1'));
}

function frame(timestamp) {
  let remaining = last ? Math.min((timestamp - last) / 1000, .10) : 0;
  last = timestamp;
  while (remaining > .00001) {
    const step = Math.min(remaining, 1 / 45);
    update(step);
    remaining -= step;
  }
  arcadeHud();
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

$('courtStyle').onchange=()=>{gym=$('courtStyle').value;};$('trainingEnd').onclick=()=>{playing=false;paused=false;finished=false;window.HoopsMusic?.pause();$('menuTitle').innerHTML='BUILD YOUR<br><em>GAME.</em>';$('menuText').textContent='Training complete. '+made+'/'+attempts+' field goals, '+greenCount+' green releases. +'+runCoins+' earned coins.';$('setup').hidden=false;$('play').textContent='HIT THE COURT →';$('restart').hidden=true;$('trainingEnd').hidden=true;shop()};

$('soundButton').onclick=()=>{soundEnabled=!soundEnabled;$('soundButton').textContent=soundEnabled?'SFX ON':'SFX OFF';$('soundButton').setAttribute('aria-pressed',String(soundEnabled))};

$('lobby').onclick=()=>{playing=false;paused=false;finished=false;window.HoopsMusic?.pause();charge=-1;shot=null;score=[0,0];resetPossession(0);$('menuTitle').innerHTML='OWN THE<br><em>COURT.</em>';$('menuText').textContent='Pick your player, court and next run.';$('setup').hidden=false;$('play').textContent='HIT THE COURT →';$('restart').hidden=true;$('lobby').hidden=true;$('trainingEnd').hidden=true;shop();hud()};

window.HoopsCareer.onPreview=cfg=>{if(!playing){character=cfg.player;mode=$('mode').value||'match';careerMatch=mode==='career'?cfg:null;gym=careerMatch?cfg.gym:($('courtStyle').value||'blue');arenaKey='';}};
function streetArena(){const pal=palettes.street,sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#101a32');sky.addColorStop(.65,'#314155');sky.addColorStop(1,'#162b3b');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
for(let j=-4;j<=4;j++){const bx=j*3.5,bh=4.5+(j*j%4);block(bx,-8.5,3.2,2.5,bh,j%2?'#26354b':'#213044');for(let y=1;y<bh;y+=.9)for(let x=bx-1;x<bx+1.4;x+=.7)if((Math.round(x*10)+Math.round(y*10))%3!==0)polygon([[x,-7.2,y],[x+.25,-7.2,y],[x+.25,-7.2,y+.4],[x,-7.2,y+.4]],'#dfb66b99')}
polygon([[-14,-5,0],[14,-5,0],[14,18,0],[-14,18,0]],'#283847');for(let z=-4;z<17;z+=1.4)line([[-14,z,.005],[14,z,.005]],'#41515d55',.8);
polygon([[-7.2,-.5,.01],[7.2,-.5,.01],[7.2,13,.01],[-7.2,13,.01]],'#324c5a');polygon([[-6.8,0,.02],[6.8,0,.02],[6.8,12.4,.02],[-6.8,12.4,.02]],null,'#e5e9d4',2);polygon([[-2.2,0,.025],[2.2,0,.025],[2.2,4.8,.025],[-2.2,4.8,.025]],pal.key,'#e5e9d4',2);ring(0,4.8,2.2,'#e5e9d4',2);const arc=[];for(let a=0;a<=Math.PI+.01;a+=.035)arc.push([Math.cos(a)*5.8,1.5+Math.sin(a)*5.8,.03]);line(arc,'#e5e9d4',2);for(const side of [-1,1]){line([[side*5.8,0,.03],[side*5.8,1.5,.03]],'#e5e9d4',2);for(let z=1;z<4.6;z+=.7)line([[side*2.2,z,.03],[side*2.5,z,.03]],'#e5e9d4',2)}ring(0,12.4,1.6,'#e5e9d4',2);floorText('SBFENT',0,9.4,1.05,'#dacb9a');floorText('LEAVE YOUR STAMP',0,10.3,.35,'#d4e6c1');floorText('FLEX PARK',0,-.4,.48,'#d9ff75');
for(let x=-10;x<=10;x+=.55){line([[x,-4,0],[x,-4,4.5]],'#7d959d66',1);line([[x,-4,0],[Math.min(10,x+2.2),-4,4.5]],'#7d959d33',.6)}for(const y of [0,2,4.5])line([[-10,-4,y],[10,-4,y]],'#91a0a8',2);for(const x of [-10,-5,0,5,10])segment([x,-4,0],[x,-4,4.6],.09,'#536976');
for(const side of [-1,1]){for(const z of [0,10]){segment([side*8.5,z,0],[side*8.5,z,7.6],.13,'#60707b');segment([side*8.5,z,7.6],[side*7.5,z,7.6],.1,'#60707b');polygon([[side*7.5-.38,z-.2,7.6],[side*7.5+.38,z-.2,7.6],[side*7.5+.38,z+.2,7.6],[side*7.5-.38,z+.2,7.6]],'#fff3c5');polygon([[side*5.7,z+1,.04],[side*6.5,z+1,.04],[side*5.8,z+6,.04],[side*4.5,z+6,.04]],'#f3dfa912')}
block(side*9,5,.8,5.5,.6,'#7b6956');for(let k=0;k<5;k++){const z=2+k*1.3;block(side*9,z,.4,.35,.65,['#b898ef','#d9ff75','#ed986c','#72a4c1','#d2cbad'][k],.65);sphere(side*9,z,1.6,.19,'#ac7a56')}}
polygon([[-3.6,-3.95,3.15],[3.6,-3.95,3.15],[3.6,-3.95,4.35],[-3.6,-3.95,4.35]],'#132639','#b898ef',2);label3('STAMPED LEGACY',0,-3.9,3.65,.48,'#d9ff75');}
