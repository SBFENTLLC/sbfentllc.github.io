'use strict';
const $=id=>document.getElementById(id), canvas=$('court'),ctx=canvas.getContext('2d',{alpha:false});
const roster=[{name:'FLEX',color:'#d9ff75',speed:3.9,touch:0},{name:'LIL JUICE',color:'#b7a0ff',speed:4.5,touch:-.02},{name:'GOLDIE',color:'#ffcf68',speed:3.7,touch:.07}];
let W=0,H=0,S=1,OX=0,OY=0,time=0,last=0,playing=false,paused=false,finished=false,owner=0,score=[0,0],clock=24,charge=-1,shot=null,delay=0,stun=0,crossCD=0,defCD=0,aiWait=0,toastTimer=0,moveX=0,moveZ=0,stickId=null,shootId=null,wins=0,sound=null;
const courtLength = 24.8;
const crewIndices = [[0,2,3],[1,4,5]];
const fullIndices = [[0,2,3,6,7],[1,4,5,8,9]];
let squadMatch = null;
let stunTarget = 1;
const touchCourt = () => window.matchMedia?.('(any-pointer: coarse)').matches;
const trickDuration = .5;
let character=roster[0],difficulty=1,players=[{x:-1.2,z:9,y:0},{x:0,z:6.9,y:0},{x:-3.5,z:5.3,y:0},{x:3.8,z:7,y:0},{x:-3.2,z:4,y:0},{x:3.5,z:5.8,y:0}],keys={};
try{wins=Number(localStorage.getItem('sbfent-hoops-wins'))||0}catch{}$('record').textContent=wins+' COURT WINS / SAVED ON THIS DEVICE';
let heat=0,greenCount=0,steals=0,made=0,attempts=0,runCoins=0,mode='match',stamina=100,sprintHeld=false,soundEnabled=true,sprintExhausted=false,bestHeat=0,careerMatch=null,styleCrosses=0,styleDunks=0,styleShowtime=0,aiStealCD=5;
let ballHolder=0,passFlight=null,looseBall=null,crewHoldTime=0,cpuPassCD=3,stampCharge=0,comboCount=0,comboClock=0,trickIndex=0,bestCombo=0,assists=0,lobFinishes=0,specialUses=0,hypeLife=0,hypeCaption='',lastTrick='',lastPass=null;
let career={coins:0,streak:0,best:0,owned:[0],look:0};
const looks=[{name:'Player signature',cost:0,color:null},{name:'Purple Reign',cost:200,color:'#b898ef'},{name:'Ice White',cost:350,color:'#e5eef2'},{name:'Crown Gold',cost:500,color:'#e6bb50'}];
try{const saved=JSON.parse(localStorage.getItem('sbfent-hoops-career'));if(saved&&typeof saved==='object'){career.coins=Math.max(0,Math.min(1e7,Number(saved.coins)||0));career.streak=Math.max(0,Number(saved.streak)||0);career.best=Math.max(career.streak,Number(saved.best)||0);career.owned=[0,...[1,2,3].filter(i=>Array.isArray(saved.owned)&&saved.owned.includes(i))];career.look=career.owned.includes(saved.look)?saved.look:0}}catch{}
function saveCareer(){try{localStorage.setItem('sbfent-hoops-career',JSON.stringify(career))}catch{}}
function rivalName(){if(squadMatch)return squadMatch.away.name.toUpperCase();if(mode==='career'&&careerMatch)return careerMatch.rival;return ['THE ROOKIE','QUIET MONEY','THE CROWN'][difficulty]}
function outfitColor(){return looks[career.look].color||character.color}
function shop(){const i=+$('outfit').value||0,owned=career.owned.includes(i);$('buy').textContent=owned?(career.look===i?'EQUIPPED':'EQUIP OUTFIT'):('UNLOCK · '+looks[i].cost+' COINS');$('wallet').textContent=career.coins+' FLEX COINS · BEST STREAK '+career.best;$('buy').disabled=owned&&career.look===i}
$('outfit').onchange=shop;$('buy').onclick=()=>{const i=+$('outfit').value||0;if(!career.owned.includes(i)){if(career.coins<looks[i].cost){$('shopStatus').textContent='Earn more coins on the court to unlock this outfit.';return}career.coins-=looks[i].cost;career.owned.push(i)}career.look=i;saveCareer();$('shopStatus').textContent=looks[i].name+' equipped.';shop()};
$('mode').onchange = () => {
  const m = $('mode').value;
  window.HoopsSquads?.render();
  const hasSquad = m==='cup'||m==='full'||m==='crew'&&!!$('squadHome').value&&!!window.HoopsSquads;
  $('difficulty').disabled = !['match','crew','full'].includes(m);
  $('player').disabled = m==='career'||hasSquad;
  $('courtStyle').disabled = m==='career'||m==='cup';
  if (m==='career') {
    const c = window.HoopsCareer.config();
    $('player').value='3';
    $('courtStyle').value=c.gym;
    $('difficulty').value=String(c.difficulty);
  }
};
$('mode').onchange();
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
  else if (owner === 1) readout = 'DEFENSE · ' + (shot ? 'TIME YOUR BLOCK' : passFlight ? 'READ THE PASS' : gap < 1.45 ?
    (dribbleExposed(players[ballHolder]) ? 'BALL LOW · REACH' : 'WAIT FOR THE BOUNCE') : 'CLOSE THE GAP');
  else if (crewActive() && ballHolder !== 0) readout = 'OFF BALL · CUT TO RIM / CALL LOB';
  else if (range < (character.dunkRange || 2.25)) readout = 'AT THE RIM · DUNK';
  else readout = (mode === 'practice' || gap > 2.4 ? 'OPEN' : gap > 1.3 ? 'CONTESTED' : 'TIGHT DEFENSE') +
    ' · ' + (shotPoints(range,false)+' POINT RANGE');

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
const shotTarget=.72, shotWindow=.075;
const view={z:23.5,y:7.8,sin:.355,cos:Math.sqrt(1-.355*.355)};

function configureCamera() {
  const full = fullCourtActive();
  view.z = full ? 41 : 23.5;
  view.y = full ? 15 : 7.8;
  view.sin = full ? .46 : .355;
  view.cos = Math.sqrt(1 - view.sin*view.sin);
  S = Math.min(W*.94,H*(full?1.55:1.20));
  OX = W/2;
  OY = H*(full?.525:W<H?.47:.46);
}

function resize() {
  const width = canvas.clientWidth || innerWidth;
  const height = canvas.clientHeight || innerHeight;
  const scale = Math.min(devicePixelRatio || 1, touchCourt() ? 1.35 : 2);
  if (W === width && H === height && canvas.width === Math.floor(width * scale) &&
      canvas.height === Math.floor(height * scale)) return;
  if (W && (W > H) !== (width > height)) resetInputs();
  W = width;
  H = height;
  canvas.width = W * scale;
  canvas.height = H * scale;
  ctx.setTransform(scale,0,0,scale,0,0);
  configureCamera();
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
function polygon(points,fill,stroke,width=1,texture=null) {
  ctx.beginPath();
  points.forEach((v,i)=>{const p=project(...v);i?ctx.lineTo(...p):ctx.moveTo(...p)});
  ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(texture){ctx.fillStyle=texture;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}
}
function line(points,color,width=2){ctx.beginPath();points.forEach((v,i)=>{const p=project(...v);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function ring(x,z,r,color,width=2,y=0){const pts=[];for(let a=0;a<=Math.PI*2+.05;a+=.09)pts.push([x+Math.cos(a)*r,z+Math.sin(a)*r,y]);line(pts,color,width)}
function box(x,z,w,d,h,color){polygon([[x-w/2,z-d/2,0],[x+w/2,z-d/2,0],[x+w/2,z-d/2,h],[x-w/2,z-d/2,h]],color);polygon([[x+w/2,z-d/2,0],[x+w/2,z+d/2,0],[x+w/2,z+d/2,h],[x+w/2,z-d/2,h]],'#203344');polygon([[x-w/2,z-d/2,h],[x+w/2,z-d/2,h],[x+w/2,z+d/2,h],[x-w/2,z+d/2,h]],'#53707c')}
function textWorld(text,x,z,y,size,color){const p=project(x,z,y);ctx.fillStyle=color;ctx.font='900 '+size+'px Arial';ctx.textAlign='center';ctx.fillText(text,...p)}
function say(text){$('toast').textContent=text;toastTimer=2.6}
function beep(f,d=.12,type='sine'){if(!sound||!soundEnabled)return;const o=sound.createOscillator(),g=sound.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.055,sound.currentTime);g.gain.exponentialRampToValueAtTime(.001,sound.currentTime+d);o.connect(g);g.connect(sound.destination);o.start();o.stop(sound.currentTime+d)}
function resetPossession(who){owner=who;clock=24;aiStealCD=5;charge=-1;shot=null;aiWait=0;stun=0;players[who].x=-1.1;players[who].z=9.3;players[1-who].x=.15;players[1-who].z=7.1;players.forEach(p=>{Object.assign(p,{y:0,fall:0,trickT:0,vx:0,vz:0,heading:0,gait:0,dribble:0,dribbleHand:1,trickMotion:null,catchBall:null,contestTime:0,reachTime:0,fallSide:1,guarding:false});});looseBall=null;resetCrew(who);}
function hud() {
  setHud('you','textContent',String(score[0]).padStart(2,'0'));
  setHud('cpu','textContent',String(score[1]).padStart(2,'0'));
  setHud('clock','textContent',mode==='practice'?'PRACTICE · NO CLOCK':(owner===0?'YOUR BALL · ':'RIVAL BALL · ')+Math.ceil(clock));
  careerHud();
}
function targetScore() {
  return mode==='cup' ? squadMatch?.target || 11 : careerMatch?.target || 21;
}

function cupResult(won) {
  const round = squadMatch.roundName;
  const result = window.HoopsSquads.finish(squadMatch,won);
  if (result.champion) {
    career.coins += 250;
    saveCareer();
    shop();
  }
  const title = result.champion?'CROWN CUP CHAMPIONS':won?'ROUND WON':'KNOCKED OUT';
  const line = result.champion ? squadMatch.home.name+' takes the city crown. +250 Flex Coins and a title in the trophy record.' :
    won ? 'One round closer. Check the bracket and set your starters for the next game.' :
      'That ends this run. You can take another shot at the Crown Cup from the opening round.';
  $('menuTitle').textContent = title;
  $('menuText').textContent += ' '+line;
  $('play').textContent = won&&!result.champion?'PLAY NEXT ROUND →':'START NEW CUP →';
  $('mode').onchange();
  $('menu').hidden = true;
  const back = () => {window.HoopsSquads.showTravel(null);$('menu').hidden=false;};
  window.HoopsCareer.scene(title+' / '+round,[['COACH STAMP',line]],back,back);
}

function openCup() {
  const match = window.HoopsSquads.config(true,window.HoopsCareer.player());
  playing = paused = false;
  window.HoopsMusic?.pause();
  $('menu').hidden = true;
  window.HoopsSquads.showTravel(match);
  window.HoopsCareer.scene('CROWN CUP / '+match.roundName,[
    ['COACH STAMP',match.round===0?'Eight teams in the '+match.home.conference+'. Win your conference, then take on the other coast at Crown Capital.':'You’ve earned the next game. Stay locked in and trust your lineup.'],
    [match.away.name.toUpperCase(),match.away.scout+' First to '+match.target+'.']
  ],()=>{window.HoopsSquads.showTravel(null);start(true);},()=>{
    window.HoopsSquads.showTravel(null);
    $('menu').hidden=false;
    $('setup').hidden=false;
    $('restart').hidden=true;
    $('lobby').hidden=true;
  });
}

function start(skipStory=false) {
  const selected = $('mode').value || 'match';
  if (selected==='cup' && skipStory!==true) {
    openCup();
    return;
  }
  if (selected==='career' && skipStory!==true) {
    playing=false;
    paused=false;
    window.HoopsMusic?.pause();
    $('menu').hidden=true;
    window.HoopsCareer.begin(()=>start(true),()=>{
      $('menu').hidden=false;
      $('setup').hidden=false;
      $('play').textContent='CONTINUE STORY →';
      $('restart').hidden=true;
      $('lobby').hidden=true;
      $('trainingEnd').hidden=true;
    });
    return;
  }
  mode=selected;
  if (fullCourtActive()&&players.length===6) {
    players.push(...Array.from({length:4},()=>({x:0,z:9,y:0})));
  } else if (!fullCourtActive()) {
    players.length=6;
  }
  careerMatch=mode==='career'?window.HoopsCareer.config():null;
  squadMatch=['crew','cup','full'].includes(mode) ?
    window.HoopsSquads?.config(mode==='cup',window.HoopsCareer.player(),fullCourtActive()) || null : null;
  character=squadMatch?.homeRoster[0] || careerMatch?.player ||
    (+$('player').value===3?window.HoopsCareer.player():roster[+$('player').value]) || roster[0];
  difficulty=mode==='cup'?squadMatch.difficulty:careerMatch?.difficulty ?? (+$('difficulty').value||0);
  gym=(mode==='cup'?squadMatch.gym:careerMatch?.gym) || $('courtStyle').value || 'blue';
  if (!palettes[gym]) gym='blue';
  configureCamera();
  heat=greenCount=steals=made=attempts=runCoins=bestHeat=styleCrosses=styleDunks=styleShowtime=0;
  stamina=100;
  sprintExhausted=false;
  score=[0,0];
  finished=paused=false;
  playing=true;
  delay=stun=crossCD=defCD=0;
  resetInputs();
  resetStreetMatch();
  resetPossession(0);
  window.HoopsMusic?.start();
  setHud('yourName','textContent',squadMatch?.home.name.toUpperCase() || character.name);
  setHud('rivalName','textContent',mode==='practice'?'TRAINING':rivalName());
  $('hud').style.setProperty?.('--home-accent',squadMatch?.home.color||'#d9ff75');
  $('hud').style.setProperty?.('--away-accent',squadMatch?.away.color||'#d9ff75');
  const matchLabels = {
    practice:'SHOOTAROUND · FREE PLAY',
    career:'CHAPTER '+(careerMatch?.chapter||1)+'/5 · '+(crewActive()?'3V3 · ':'')+'FIRST TO '+targetScore(),
    cup:'CROWN CUP · '+(squadMatch?.roundName||'').toUpperCase()+' · '+targetScore(),
    full:'5V5 FULL COURT · FIRST TO 21',
    crew:'3V3 CREW RUN · FIRST TO 21',
    match:'1V1 · FIRST TO 21'
  };
  $('matchType').textContent=matchLabels[mode];
  $('courtName').textContent=mode==='cup'&&squadMatch.round===3?'CROWN CAPITAL':courtNames[gym];
  $('menu').hidden=true;
  try {
    sound=sound||new (window.AudioContext||window.webkitAudioContext)();
    sound.resume();
  } catch {}
  say('YOUR BALL. MAKE YOUR MARK.');
  hud();
}
function pause(){if(!playing||finished)return;paused=!paused;if(paused)window.HoopsMusic?.pause();else window.HoopsMusic?.resume();resetInputs();$('menu').hidden=!paused;if(paused){shop();$('menuTitle').innerHTML='TAKE A<br><em>BREATHER.</em>';$('menuText').textContent='Your game is paused. The court is waiting.';$('setup').hidden=true;$('play').textContent='BACK TO THE COURT →';$('restart').hidden=false;$('lobby').hidden=false;$('trainingEnd').hidden=mode!=='practice';}}
$('play').onclick=()=>{if(paused){pause();return}start()};$('restart').onclick=start;
function end(){if(finished||mode==='practice')return;finished=true;playing=false;window.HoopsMusic?.pause();const won=score[0]>=targetScore();const reward=won?100+difficulty*25:25;career.coins+=reward;career.streak=won?career.streak+1:0;career.best=Math.max(career.best,career.streak);saveCareer();shop();if(won){wins++;try{localStorage.setItem('sbfent-hoops-wins',wins)}catch{}}$('menuTitle').innerHTML=won?'COURT<br><em>STAMPED.</em>':'RUN IT<br><em>BACK.</em>';$('menuText').textContent=(won?'You owned the court. ':'The rival took this one. ')+score[0]+' – '+score[1]+'. +'+reward+' Flex Coins. '+career.streak+' win streak. '+made+'/'+attempts+' shooting ('+(attempts?Math.round(made/attempts*100):0)+'%), '+greenCount+' green releases, '+steals+' steals, '+assists+' assists, '+lobFinishes+' lob finishes, best combo ×'+bestCombo+'.';$('record').textContent=wins+' COURT WINS / SAVED ON THIS DEVICE';$('setup').hidden=false;$('play').textContent='RUN IT BACK →';$('restart').hidden=true;$('lobby').hidden=true;$('trainingEnd').hidden=true;$('menu').hidden=false;if(mode==='career'){$('legacyPanel').open=true;const result=window.HoopsCareer.finish(won,{greens:greenCount,dunks:styleDunks,showtime:styleShowtime,crosses:styleCrosses,steals,assists,lobs:lobFinishes,combos:bestCombo,specials:specialUses});$('mode').onchange();$('menuTitle').innerHTML=result.champion?'LEGACY<br><em>STAMPED.</em>':won?'CHAPTER<br><em>STAMPED.</em>':'RUN IT<br><em>BACK.</em>';$('menuText').textContent+=' '+result.summary;$('play').textContent=won?(result.champion?'RUN THE FINAL AGAIN →':'NEXT CHAPTER →'):'RETRY CHAPTER →';$('menu').hidden=true;window.HoopsCareer.afterMatch(result,()=>{$('menu').hidden=false;});}else if(mode==='cup')cupResult(won);}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
const pauseButton = $('pause');
let pauseTouch = null;
let pauseFromTouch = false;
let defendId = null;

function clearPauseTouch() {
  if (!pauseTouch) return;
  pauseTouch = null;
  delete pauseButton.dataset.holding;
}

function resetInputs() {
  clearPauseTouch();
  stickId = shootId = defendId = null;
  sprintHeld = false;
  charge = -1;
  keys = {};
  moveX = moveZ = 0;
  $('knob').style.transform = '';
}

pauseButton.onpointerdown = e => {
  pauseFromTouch = e.pointerType === 'touch';
  if (!pauseFromTouch || pauseTouch) return;
  pauseTouch = {id:e.pointerId, start:e.timeStamp, x:e.clientX, y:e.clientY};
  pauseButton.dataset.holding = '';
  pauseButton.setPointerCapture(e.pointerId);
};
pauseButton.onpointermove = e => {
  if (pauseTouch?.id === e.pointerId && Math.hypot(e.clientX - pauseTouch.x,e.clientY - pauseTouch.y) > 14) {
    clearPauseTouch();
  }
};
pauseButton.onpointerup = e => {
  if (pauseTouch?.id !== e.pointerId) return;
  const held = e.timeStamp - pauseTouch.start >= 380;
  clearPauseTouch();
  if (held) pause();
};
pauseButton.onpointercancel = pauseButton.onlostpointercapture = e => {
  if (pauseTouch?.id === e.pointerId) clearPauseTouch();
};
pauseButton.onclick = e => {
  if (e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents) return;
  if (!e.detail || !pauseFromTouch) pause();
};

function protectCourtGesture(e) {
  if (playing && !paused && $('menu').hidden && $('storyScene').hidden && e.cancelable) e.preventDefault();
}
document.addEventListener('touchstart',e=>{
  if (e.touches.length > 1) protectCourtGesture(e);
},{passive:false});
document.addEventListener('gesturestart',protectCourtGesture,{passive:false});
document.addEventListener('gesturechange',protectCourtGesture,{passive:false});
document.addEventListener('dblclick',protectCourtGesture);
document.addEventListener('contextmenu',protectCourtGesture);

function bindAction(id, action) {
  const button = $(id);
  let fromTouch = false;
  button.onpointerdown = e => {
    fromTouch = e.pointerType === 'touch';
    if (fromTouch) {
      e.preventDefault();
      action();
    }
  };
  button.onclick = e => {
    if (!e.detail || !fromTouch) action();
  };
}

bindAction('cross', cross);
bindAction('pass', requestPass);
bindAction('lob', requestLob);
bindAction('stampBreak', stampBreak);
bindAction('dunk', dunkBall);
bindAction('block', blockShot);
bindAction('steal', stealBall);
$('defend').onpointerdown = e => {
  if (defendId !== null || !playing || paused) return;
  e.preventDefault();
  defendId = e.pointerId;
  $('defend').setPointerCapture(e.pointerId);
  sprintHeld = true;
};
$('defend').onpointerup = $('defend').onpointercancel = $('defend').onlostpointercapture = e => {
  if (e.pointerId !== defendId) return;
  defendId = null;
  sprintHeld = false;
};
$('shoot').onpointerdown = e => {
  if (shootId !== null || !playing || paused) return;
  e.preventDefault();
  shootId = e.pointerId;
  $('shoot').setPointerCapture(e.pointerId);
  beginShot();
};
$('shoot').onpointerup = e => {
  if (e.pointerId !== shootId) return;
  shootId = null;
  releaseShot();
};
$('shoot').onpointercancel = $('shoot').onlostpointercapture = e => {
  if (e.pointerId !== shootId) return;
  shootId = null;
  charge = -1;
};
$('stick').onpointerdown = e => {
  if (stickId !== null || !playing || paused) return;
  e.preventDefault();
  stickId = e.pointerId;
  $('stick').setPointerCapture(e.pointerId);
  joystick(e);
};
function joystick(e){const r=$('stick').getBoundingClientRect(),radius=r.width*.34;let x=e.clientX-r.left-r.width/2,z=e.clientY-r.top-r.height/2;const n=Math.max(1,Math.hypot(x,z)/radius);x/=n;z/=n;moveX=x/radius;moveZ=z/radius;$('knob').style.transform=`translate(${x}px,${z}px)`}
$('stick').onpointermove = e => { if (e.pointerId === stickId) joystick(e); };
$('stick').onpointerup = $('stick').onpointercancel = $('stick').onlostpointercapture = e => {
  if (e.pointerId !== stickId) return;
  stickId = null;
  moveX = moveZ = 0;
  $('knob').style.transform = '';
};
addEventListener('keydown',e=>{
  if(e.code==='Escape'){if(!e.repeat)pause();return;}
  if(!playing||paused)return;
  if(e.code==='Space'&&e.target===$('pause'))return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(!keys[e.code]){
    if(e.code==='Space')beginShot();
    if(e.code==='KeyX')cross();
    if(e.code==='KeyF')requestPass();
    if(e.code==='KeyL')requestLob();
    if(e.code==='KeyR')stampBreak();
    if(e.code==='KeyC')dunkBall();
    if(e.code==='KeyB')blockShot();
    if(e.code==='KeyE')stealBall();
  }
  keys[e.code]=true;
});
addEventListener('keyup',e=>{
  if(e.code==='Space'&&keys.Space)releaseShot();
  keys[e.code]=false;
});
addEventListener('blur',resetInputs);
document.addEventListener('visibilitychange',()=>{
  last=0;
  if(document.hidden)resetInputs();
  else if(playing&&!paused)window.HoopsMusic?.resume();
});

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
  if (p.reachTime > 0) speed *= .60;
  const length = Math.max(1, Math.hypot(dx, dz));
  const targetX = dx * speed / length;
  const targetZ = dz * speed / length;
  const vx = p.vx || 0;
  const vz = p.vz || 0;
  const braking = Math.hypot(targetX, targetZ) < .01 || targetX * vx + targetZ * vz < 0;
  const response = braking ? 32 : p.reachTime > 0 ? 13 : 22;
  const blend = -Math.expm1(-response * dt);
  p.vx = mix(vx, targetX, blend);
  p.vz = mix(vz, targetZ, blend);

  const x = p.x;
  const z = p.z;
  p.x = Math.max(-6.2, Math.min(6.2, x + targetX * dt + (vx - targetX) * blend / response));
  const baseline = fullCourtActive() ? courtLength-.65 : 11.6;
  p.z = Math.max(.65, Math.min(baseline, z + targetZ * dt + (vz - targetZ) * blend / response));
  if (p.x === -6.2 || p.x === 6.2) p.vx = 0;
  if (p.z === .65 || p.z === baseline) p.vz = 0;
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
  p.z = Math.max(.65, Math.min(fullCourtActive()?courtLength-.65:11.6, p.z + trick.dz * change));
  p.gait = (p.gait || 0) + Math.hypot(trick.dx, trick.dz) * change * 3.8;
  if (trick.time >= .24) p.trickMotion = null;
}

function poseHeading(p) {
  const heading = p.heading || 0;
  if (p.trick !== 'SPIN MOVE' || !p.trickT) return heading;
  return heading + Math.PI * 2 * ease(0, trickDuration, trickDuration - p.trickT);
}

function actorPoint(p, x, z, y, heading = poseHeading(p)) {
  const c = Math.cos(heading), s = Math.sin(heading);
  return [p.x + x * c - z * s, p.z + x * s + z * c, y + p.y];
}

function gatherPose(value) {
  return ease(0, .45, value);
}

function dribbleBounce(phase) {
  const t = phase % 1;
  const air = t < .48 ? 1 - (t / .48) ** 2 : 1 - ((1 - t) / .52) ** 2;
  return Math.max(0, air);
}

function dribbleExposed(p) {
  return !p.catchBall && !p.trickT && dribbleBounce(p.dribble || 0) < .70;
}

function heldBall(p) {
  const stride = Math.hypot(p.vx || 0, p.vz || 0);
  const side = p.dribbleHand || 1;
  const phase = p.dribble || 0;
  const bounce = .15 + dribbleBounce(phase) * (.90 - Math.min(.23,stride * .045));
  const front = -.19 - Math.min(.21,stride * .044);
  let ball = actorPoint(p, side * (.49 + .07 * Math.sin(Math.PI * (phase % 1))), front, bounce);
  if (p.trickT > 0) {
    const t = 1 - p.trickT / trickDuration;
    const transfer = ease(.10,.73,t);
    const from = p.trickFromHand;
    const behind = p.trick === 'BEHIND THE BACK' || p.trick === 'SPIN MOVE';
    const path = actorPoint(p, mix(from*.59,side*.59,transfer),
      mix(front,behind?.42:-.55,Math.sin(Math.PI*transfer)), .15+.79*dribbleBounce(t));
    ball = mixPoint(p.trickStartBall,path,ease(0,.17,t));
    ball = mixPoint(ball,actorPoint(p,side*.49,front,.15+.90-Math.min(.23,stride*.045)),ease(.78,1,t));
  }
  if (p.catchBall) ball = mixPoint(p.catchBall.from, ball, ease(0, .22, p.catchBall.time));
  if (p === players[0] && charge >= 0) {
    const pocket = actorPoint(p, .22, -.27, mix(.94, 1.65, ease(.12, .73, charge)));
    ball = mixPoint(ball, pocket, ease(0, .24, charge));
  }
  return ball;
}

function shotBall(s) {
  const phase = Math.min(1, s.t / s.duration);
  if (s.redirect) {
    const t = (phase - s.redirect.phase) / (1 - s.redirect.phase);
    return mixPoint(s.redirect.from, [s.redirect.from[0] + .95, s.redirect.from[1] + 1.05, .2], t);
  }
  const rim = s.make ? [0, attackingZ(1.6,s.who), 3.15] : [.48, attackingZ(1.72,s.who), 3.13];
  const through = s.make ? [0, attackingZ(1.6,s.who), .55] : [1.16, attackingZ(2.35,s.who), .25];
  if (s.dunk) {
    const p = players[s.actor];
    const swing = Math.sin(Math.PI * ease(.22,.64,phase));
    const sweep = s.finish==='wrap' ? .70*swing : s.finish==='hammer' ? -.26*swing : .40*swing;
    const hand = s.dunkHand;
    const gather = actorPoint(p,hand*(.29+(s.special?sweep:0)),-.30,
      (s.lob?1.80:1.06)+.28*ease(.13,.43,phase)+(s.special?.47*swing:0));
    if (phase < .22) {
      return mixPoint(s.startBall,gather,ease(0,.22,phase));
    }
    if (phase < .64) {
      return mixPoint(gather,rim,ease(.24,.64,phase));
    }
    return mixPoint(rim, through, ease(.64, 1, phase));
  }
  const release = [s.x + .20, s.z + (fullCourtActive()&&s.who===1?.24:-.24), s.startY + 2.49];
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
  const height = s.dunk ? (s.special ? (s.finish==='glide'?2.25:s.finish==='hammer'?1.95:2.08) : s.showtime ? 1.55 : 1.15) : .42;
  p.y = s.startY * (1 - ease(0, .2, phase)) + 4 * height * t * (1 - t);
  turn(p, s.rimHeading, dt);
  if (s.dunk) {
    const progress = .22*ease(0,.25,phase)+.78*ease(.16,.84,phase);
    p.gait = (p.gait || 0) + dt*12*(1-ease(.17,.40,phase));
    p.x = mix(s.x,0,progress)+(s.finish==='glide'?.5*Math.sin(Math.PI*progress):0);
    p.z = mix(s.z, attackingZ(2,s.who), progress);
  }
}
function fullCourtActive(){return mode==='full'}
function attackingZ(z,team){return team===1&&fullCourtActive()?courtLength-z:z}
function rimDistance(p,team){return Math.hypot(p.x,attackingZ(p.z,team)-1.5)}
function shotPoints(distance,dunk){return (fullCourtActive()?2:1)+(distance>5.8&&!dunk?1:0)}
function crewActive(){return ['crew','cup','full'].includes(mode)||mode==='career'&&!!careerMatch?.crew}
function teamOf(i){return i===1||i===4||i===5||i===8||i===9?1:0}
function teamActors(t){return fullCourtActive()?fullIndices[t]:crewActive()?crewIndices[t]:[t]}
function squadActor(i){
  if (!squadMatch) return null;
  const side=teamOf(i);
  return (side?squadMatch.awayRoster:squadMatch.homeRoster)[teamActors(side).indexOf(i)];
}
function actorName(i){return squadActor(i)?.name||(i===0?character.name:i===1?rivalName():i===2?(character.name==='LIL JUICE'?'FLEX':'LIL JUICE'):i===3?(character.name==='GOLDIE'?'FLEX':'GOLDIE'):i===4?'RIVAL 02':'RIVAL 03')}
function closestEnemy(i){return teamActors(1-teamOf(i)).reduce((a,b)=>distance(players[i],players[a])<distance(players[i],players[b])?a:b)}
function resetStreetMatch(){stampCharge=0;comboCount=0;comboClock=0;trickIndex=0;bestCombo=0;assists=0;lobFinishes=0;hypeLife=0;lastPass=null;passFlight=null;specialUses=0;lastTrick='';}
function gainStamp(n){stampCharge=Math.min(100,stampCharge+n)}
function crowdRoar(){if(!soundEnabled||!sound||typeof sound.createBuffer!=='function')return;try{const n=Math.floor(sound.sampleRate*.65),b=sound.createBuffer(1,n,sound.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(.65+.35*Math.sin(i*.013));const src=sound.createBufferSource(),filter=sound.createBiquadFilter(),g=sound.createGain(),t=sound.currentTime;src.buffer=b;filter.type='bandpass';filter.frequency.value=850;filter.Q.value=.35;g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(.06,t+.06);g.gain.exponentialRampToValueAtTime(.001,t+.65);src.connect(filter);filter.connect(g);g.connect(sound.destination);src.start();src.stop(t+.66);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect()};}catch{}}
function hype(text,accent='#f2c16e'){
  if(hypeLife<=0)crowdRoar();
  hypeCaption=text;
  hypeLife=1.5;
  $('hype').style.setProperty?.('--hype-accent',accent);
  beep(620,.2,'triangle');
}
function resetCrew(who){ballHolder=who;passFlight=null;crewHoldTime=0;cpuPassCD=3;lastPass=null;comboCount=0;comboClock=0;const spots=[[-1.1,9.3],[.15,7.1],[-3.5,5.3],[3.8,7],[-3.2,4],[3.5,5.8]];for(let i=2;i<6;i++)Object.assign(players[i],{x:spots[i][0],z:spots[i][1],y:0,fall:0});if(who===1){players[2].z=3.8;players[3].z=5.7;players[4].z=5.3;players[5].z=7;}
  if (fullCourtActive()) {
    const starts = [[-1.1,13.7],[-4.1,9.7],[4.1,10.7],[-5.1,15.4],[4.8,15.7]];
    for (const side of [0,1]) fullIndices[side].forEach((index,slot)=>{
      const [x,z] = starts[slot];
      const p = players[index];
      p.x = side===who?x:x+.55;
      p.z = attackingZ(z-(side===who?0:1.6),who);
      p.heading = who===0?0:Math.PI;
    });
  }
}
function arcadeHud() {
  setHudStyle('stampFill','width',stampCharge+'%');
  const ready = stampCharge>=100;
  setHud('stampLabel','textContent',ready?'SPECIAL READY · R':'POWER '+Math.floor(stampCharge)+'%');
  setHud('powerButtonLabel','textContent',ready?'SPECIAL':'POWER');
  setHud('powerButtonValue','textContent',ready?'READY':Math.floor(stampCharge)+'%');
  setHudStyle('powerButtonFill','width',stampCharge+'%');
  setHud('comboLabel','textContent',comboCount>0?'STYLE ×'+comboCount+' · '+lastTrick:'BUILD STYLE · CROSS, PASS, FINISH');
  const busy = delay > 0 || !!shot || !!passFlight;
  setHud('stampBreak','disabled',busy||stampCharge<100||owner!==0||ballHolder!==0);
  const defense = owner===1;
  for (const id of ['cross','pass','lob','stampBreak','dunk','shoot']) setHud(id,'hidden',defense);
  setHud('defend','innerHTML',defense?'GUARD<br><small>SHIFT</small>':'SPRINT<br><small>SHIFT</small>');
  setHud('defend','ariaLabel',defense?'Hold to get in a defensive stance':'Hold to sprint');
  setHud('block','hidden',!defense);
  setHud('steal','hidden',!defense);
  setHud('block','disabled',delay>0||defCD>0);
  setHud('steal','disabled',delay>0||defCD>0||!!shot);
  setHud('dunk','disabled',busy||defense||ballHolder!==0||charge>=0);
  setHud('pass','disabled',busy||!crewActive()||defense);
  setHud('lob','disabled',owner!==0||!!shot||delay>0);
  setHud('cross','disabled',busy||owner!==0||ballHolder!==0||charge>=0||crossCD>0);
  setHud('lob','innerHTML',passFlight?.self?(passFlight.finishQueued?'LOCKED!':'FINISH!'):(crewActive()?'ALLEY<br>OOP':'SELF<br>LOB'));
  setHud('shoot','innerHTML',passFlight?.self?'TAP TO<br>FINISH':crewActive()&&owner===0&&ballHolder!==0?'CALL<br>BALL':'HOLD<br>SHOOT');
  setHud('hype','textContent',hypeCaption);
  setHud('hype','hidden',hypeLife<=0);
}
function beginShot(){if(passFlight?.self){requestLob();return;}if(!playing||paused||delay>0||shot||passFlight||owner!==0||charge>=0)return;if(crewActive()&&ballHolder!==0){requestPass();return;}charge=0;}
function releaseShot(){if(charge<0)return;const q=charge,startBall=heldBall(players[0]);charge=-1;if(!playing||paused||owner!==0||shot||passFlight||delay>0)return;launch(0,q,0,{startBall,gather:gatherPose(q),jumper:true});}
function launch(who,q,actor=who,options={}){const human=actor===0;if(human)attempts++;const p=players[actor],enemy=closestEnemy(actor),near=distance(p,players[enemy]),dist=rimDistance(p,who),dunk=!!options.special||!!options.lob||!!options.dunk||!options.jumper&&dist<(squadActor(actor)?.dunkRange||(human?character.dunkRange:0)||2.25),green=Math.abs(q-shotTarget)<shotWindow;
let chance=human?(green?.97:.76-Math.abs(q-.72)*1.3)+character.touch:(who===0?.69:.56+difficulty*.12)+(squadActor(actor)?.touch||0);if(human&&(Math.hypot(moveX,moveZ)>.1||keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||keys.ArrowUp||keys.ArrowDown||keys.ArrowLeft||keys.ArrowRight))chance-=.08;chance-=Math.max(0,2.4-near)*.15;chance-=Math.max(0,dist-6)*.025;if(human&&heat>=3)chance+=.07;if(dunk)chance=options.special?1:(options.lob?.94:.93)-Math.max(0,1.65-near)*.17+(squadActor(actor)?.finishTouch??.04);chance=Math.max(.04,Math.min(1,chance));
shot={who,actor,x:p.x,z:p.z,startY:p.y,startBall:options.startBall||heldBall(p),rimHeading:Math.atan2(-p.x,p.z-attackingZ(1.6,who)),gather:options.gather||0,dunkHand:p.dribbleHand||1,q,t:0,duration:dunk?(options.special?1.1:options.lob?.85:who===0&&heat>=3?.85:.65):1.12,showtime:who===0&&dunk&&(heat>=3||options.special),special:!!options.special,finish:options.finish,lob:!!options.lob,assist:who===0&&actor!==0&&lastPass?.from===0&&lastPass.to===actor&&time-lastPass.time<4,combo:human?comboCount:0,make:Math.random()<chance,dunk,points:options.special?3:shotPoints(dist,dunk),green,blocked:false};p.vx=0;p.vz=0;p.trickMotion=null;p.trickT=0;p.catchBall=null;charge=-1;
if(human&&green&&!dunk){greenCount++;gainStamp(12);if(greenCount===3&&mode!=='practice'){career.coins+=30;runCoins+=30;saveCareer()}flash=.8;burst(p.x,p.z,'#d9ff75')}if(human)say(options.special?(character.special||'Stamp Breaker').toUpperCase()+'!':options.lob?'RISE UP!':dunk?'TO THE RIM!':green?'GREEN RELEASE!':q<.645?'EARLY RELEASE':'LATE RELEASE');beep(green?740:360);}
function cross() {
  if (!playing||paused||owner!==0||ballHolder!==0||shot||passFlight||delay>0||crossCD>0||charge>=0) return;
  const cost=character.crossCost??22;
  if (stamina<cost) { say('CATCH YOUR BREATH'); return; }
  stamina-=cost;
  styleCrosses++;
  crossCD=Math.max(trickDuration,character.crossRecovery??(character.myPlayer&&character.crossBonus>.2?.5:.65));
  const p=players[0], enemy=closestEnemy(0), defender=players[enemy];
  const dx=moveX+(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  const dz=moveZ+(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
  const tricks=['CROSSOVER','BEHIND THE BACK','SPIN MOVE'];
  const trick=dz>.35?'STEP BACK':tricks[trickIndex++%tricks.length];
  const side=Math.abs(dx)>.28?Math.sign(dx):p.x>0?-1:1;
  comboCount=comboClock>0&&trick!==lastTrick?Math.min(4,comboCount+1):1;
  comboClock=4.5;
  lastTrick=trick;
  bestCombo=Math.max(bestCombo,comboCount);
  p.trickStartBall=heldBall(p);
  p.trickFromHand=p.dribbleHand||1;
  p.dribbleHand=-p.trickFromHand;
  p.trick=trick;
  p.trickT=trickDuration;
  p.trickMotion={dx:side*(trick==='STEP BACK'?.72:1.4),
    dz:trick==='STEP BACK'?1.05:trick==='SPIN MOVE'?-.78:Math.min(0,dz)*.25,time:0};
  if (mode!=='practice'&&distance(p,defender)<3) {
    stunTarget=enemy;
    stun=.42+(character.crossBonus||0);
    gainStamp(6+comboCount*3);
    if (comboCount>=2) {
      defender.fall=1.05;
      defender.fallSide=-side;
      defender.vx=defender.vz=0;
      hype('ANKLE BREAKER ×'+comboCount);
    }
  }
  beep(180,.1);
  say(trick+' · STYLE ×'+comboCount);
}
function sendPass(to,lob=false,self=false){const from=ballHolder,p=players[from],r=players[to];passFlight={from,to,x:p.x,z:p.z,startBall:heldBall(p),receive:actorPoint(r,.44,-.18,lob?1.65:1.10),tx:self?0:r.x,tz:self?2.1:r.z,t:0,duration:self?.85:lob?.65:Math.min(.6,.25+distance(p,r)*.025),lob,self,finishQueued:!self};charge=-1;crewHoldTime=0;}
function requestPass(){if(!playing||paused||owner!==0||shot||passFlight||delay>0||!crewActive())return;let to=0;if(ballHolder===0){to=teamActors(0).slice(1).sort((a,b)=>distance(players[b],players[closestEnemy(b)])-distance(players[a],players[closestEnemy(a)]))[0]}sendPass(to);say(to===0?'COMING BACK. GET OPEN.':'PASS TO '+actorName(to));}
function requestLob(){if(!playing||paused||owner!==0||shot||delay>0)return;if(passFlight){if(passFlight.self&&!passFlight.finishQueued){const t=passFlight.t/passFlight.duration;if(t>=.3&&t<=.95){passFlight.finishQueued=true;say('CATCH AND FINISH!')}else say('WAIT FOR THE BALL…')}return;}if(crewActive()){const to=ballHolder===0?teamActors(0).slice(1).sort((a,b)=>rimDistance(players[a],0)-rimDistance(players[b],0))[0]:0;if(rimDistance(players[to],0)>3.8){say(to===0?'CUT TO THE RIM, THEN CALL THE LOB':'WAIT FOR YOUR TEAMMATE TO CUT');return}sendPass(to,true);say('LOB IS UP!');}else{const p=players[0];if(rimDistance(p,0)>4.8){say('DRIVE INSIDE FOR THE SELF LOB');return}if(stamina<18){say('CATCH YOUR BREATH');return}stamina-=18;sendPass(0,true,true);say('OFF THE GLASS! TAP LOB AGAIN TO FINISH.');}}
function dunkBall() {
  if (!playing||paused||owner!==0||ballHolder!==0||shot||passFlight||delay>0||charge>=0) return;
  if (rimDistance(players[0],0)>(character.dunkRange||2.25)) {
    say('DRIVE CLOSER TO DUNK');
    return;
  }
  launch(0,shotTarget,0,{dunk:true});
}
function stampBreak() {
  if (!playing||paused||owner!==0||ballHolder!==0||shot||passFlight||delay>0||stampCharge<100) return;
  if (rimDistance(players[0],0)>4.8) {
    say('SPECIAL READY. DRIVE INSIDE THE ARC.');
    return;
  }
  stampCharge=0;
  specialUses++;
  const finish = character.finish||(character.label==='Quick handles'?'wrap':character.label==='Rim attack'?'glide':'hammer');
  launch(0,shotTarget,0,{special:true,finish});
  const accent=window.HoopsPuppets?.look(character.name)?.trim||character.color;
  hype((character.special||'Stamp Breaker').toUpperCase(),accent);
  flash=.8;
}

function blockShot() {
  if (!playing||paused||owner!==1||delay>0||defCD>0) return;
  defCD=.85;
  players[0].contestTime=.36;
  if (shot?.who===1 && !shot.blocked && shot.t<(character.blockWindow??.48) && distance(players[0],players[shot.actor])<(character.blockRange??2.3)) {
    shot.redirect={from:shotBall(shot),phase:shot.t/shot.duration};
    shot.make=false;
    shot.blocked=true;
    gainStamp(24);
    hype('GET THAT OUT!');
    beep(140,.15,'triangle');
  } else {
    say(shot?'LATE OR OUT OF BLOCK RANGE':'TIME THE SHOOTER’S RELEASE');
  }
}
function canReachBall(defender, holder, ball, reach) {
  const dx=ball[0]-defender.x, dz=ball[1]-defender.z;
  const front=dx*Math.sin(defender.heading||0)-dz*Math.cos(defender.heading||0);
  return Math.hypot(dx,dz)<reach && front>-.24 && (!holder || distance(defender,holder)<1.45);
}

function takeBall(index, ball) {
  owner=teamOf(index);
  ballHolder=index;
  clock=24;
  charge=-1;
  passFlight=null;
  crewHoldTime=0;
  cpuPassCD=2;
  aiWait=0;
  looseBall=null;
  lastPass=null;
  players[index].catchBall={from:ball,time:0};
}

function stealBall() {
  if (!playing||paused||owner!==1||delay>0||defCD>0||shot) return;
  const defender=players[0], holder=players[ballHolder];
  const guarding=sprintHeld||keys.ShiftLeft||keys.ShiftRight;
  const reach=.86+(guarding?.14:0)+(character.defense||0)*1.35;
  const ball=passFlight?passBall(passFlight):heldBall(holder);
  const intercepted=!!passFlight&&passFlight.t>.10&&ball[2]<1.94&&canReachBall(defender,null,ball,reach);
  defCD=1.4;
  defender.reachTime=.32;
  defender.reachSide=Math.sign((ball[0]-defender.x)*Math.cos(defender.heading||0)+(ball[1]-defender.z)*Math.sin(defender.heading||0))||1;
  if (intercepted || !passFlight&&dribbleExposed(holder)&&canReachBall(defender,holder,ball,reach)) {
    takeBall(0,ball);
    steals++;
    gainStamp(intercepted?22:18);
    career.coins+=5;
    runCoins+=5;
    saveCareer();
    hype(intercepted?'PASS PICKED!':'POCKET PICKED');
    say('YOUR BALL. PUSH THE PACE!');
    beep(540);
  } else {
    say(passFlight?'STEP INTO THE PASSING LANE':distance(defender,holder)>1.45?
      'CLOSE THE GAP':'FACE THE BALL · REACH ON THE BOUNCE');
  }
}
function defend() {
  if (shot?.who===1) blockShot();
  else stealBall();
}
function updatePass(dt) {
  const f = passFlight;
  f.t += dt;
  if (f.self) {
    const p = players[0];
    const progress = ease(0, f.duration, f.t) * .85;
    const x = mix(f.x, 0, progress);
    const z = mix(f.z, 2.1, progress);
    p.vx = (x-p.x) / dt;
    p.vz = (z-p.z) / dt;
    p.gait = (p.gait || 0) + Math.hypot(x-p.x,z-p.z) * 3.8;
    p.x = x;
    p.z = z;
    turn(p, Math.atan2(-x,Math.max(.3,z-1.6)), dt);
  } else {
    f.receive = actorPoint(players[f.to], .44, -.18, f.lob ? 1.65 : 1.10);
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
function guardOpponent(p, target, side, pace, dt, gap=1.15) {
  const rimZ=attackingZ(1.6,side);
  const distanceToRim=Math.max(.5,Math.hypot(target.x,target.z-rimZ));
  const x=target.x*(1-gap/distanceToRim)+(target.vx||0)*.13;
  const z=target.z+(rimZ-target.z)*gap/distanceToRim+(target.vz||0)*.13;
  const close=distance(p,target)<2.5;
  p.guarding=close;
  move(p,x-p.x,z-p.z,pace*(close?.90:1.14),dt);
  if (close && !p.fall) turn(p,Math.atan2(target.x-p.x,p.z-target.z),dt);
}

function driveLane(p, side, defender) {
  const depth=attackingZ(p.z,side);
  const rimSide=attackingZ(defender.z,side)<depth+.3;
  if (rimSide && distance(p,defender)<2.55 && depth>2.8) {
    const lane=(p.x-defender.x||p.x||1)<0?-1:1;
    return [Math.max(-5.2,Math.min(5.2,p.x+lane*1.65)),Math.max(2.1,depth-.75)];
  }
  return [p.x*.70,2.65];
}

function updateCrew(dt, allowActions=true) {
  crewHoldTime+=dt;
  cpuPassCD=Math.max(0,cpuPassCD-dt);
  const off=teamActors(owner),def=teamActors(1-owner);
  const offense=squadMatch?.[owner===0?'home':'away']?.style;
  const attacking=players[ballHolder];
  for (const i of [...off,...def]) {
    if (i===0||i===shot?.actor) continue;
    const p=players[i],profile=squadActor(i);
    const pace=profile ? profile.speed*.80 : 2.45+difficulty*.22;
    if (i===passFlight?.to) {
      move(p,0,0,0,dt);
    } else if (teamOf(i)===owner) {
      const slot=off.indexOf(i);
      const lanes=[-3.9,-1.3,3.8,-5.1,5.1];
      const spots=[6.7,2.6,6.5,8.7,10];
      p.guarding=false;
      const lead=attackingZ(attacking.z,owner);
      const defender=players[closestEnemy(i)];
      const [x,relative]=i===ballHolder ? driveLane(p,owner,defender) :
        [lanes[slot],Math.max(fullCourtActive()?lead-3.6:2,spots[slot]+
          (slot===1&&Math.abs(attacking.x)>2.1?-.60:0))];
      move(p,x-p.x,attackingZ(relative,owner)-p.z,pace,dt);
    } else {
      if (i===stunTarget&&owner===0&&stun>0) { move(p,0,0,0,dt); continue; }
      const target=players[off[def.indexOf(i)]];
      const cushion=profile ? 1.18-(profile.defense||0)*2 : 1.05;
      guardOpponent(p,target,owner,pace+.12,dt,cushion);
    }
  }
  if (!allowActions) return;
  if (owner===1) {
    const holder=players[ballHolder],near=distance(holder,players[closestEnemy(ballHolder)]);
    if (cpuPassCD<=0&&crewHoldTime>1.3&&near<2.0) {
      const to=off.filter(i=>i!==ballHolder).sort((a,b)=>distance(players[b],players[closestEnemy(b)])-distance(players[a],players[closestEnemy(a)]))[0];
      sendPass(to,rimDistance(players[to],1)<3.4);
      cpuPassCD=5;
      return;
    }
    if (crewHoldTime>(offense?.tempo||3.1)+(2-difficulty)*.35&&
        (rimDistance(holder,1)<2.9||near>1.9&&attackingZ(holder.z,1)<8||clock<4)) {
      launch(1,shotTarget,ballHolder);
      crewHoldTime=0;
    }
  } else if (ballHolder!==0&&crewHoldTime>2&&attackingZ(players[ballHolder].z,0)<8) {
    launch(0,shotTarget,ballHolder);
    crewHoldTime=0;
  }
}
function updateShot(dt) {
  shot.t += dt;
  animateShot(shot, dt);
  if (shot.t < shot.duration) return;
  const s = shot;
  looseBall = shotBall(s);
  shot = null;
if(s.make&&!s.blocked){score[s.who]+=s.points;if(s.who===0){if(s.actor===0){made++;if(s.dunk)styleDunks++;if(s.lob)lobFinishes++;if(s.showtime){styleShowtime++;flash=1;}}if(s.assist){assists++;gainStamp(20);}heat++;bestHeat=Math.max(bestHeat,heat);gainStamp(s.actor===0?18:8);const bonus=(s.green?5:2)+Math.max(0,s.combo-1)*3;career.coins+=bonus;runCoins+=bonus;saveCareer();if(s.special)hype((character.special||'Stamp Breaker').toUpperCase()+'! +3',window.HoopsPuppets?.look(character.name)?.trim||character.color);else if(s.lob)hype(s.assist?'ALLEY-OOP ASSIST!':'OFF THE GLASS!');else if(s.showtime)hype('SHOWTIME FINISH!');else if(s.combo>=2)hype('STYLE ×'+s.combo+' → BUCKET!');else if(s.dunk)hype('STAMPED DUNK!');}
burst(0,attackingZ(1.6,s.who),s.who===0?'#d9ff75':'#f7d4b9');say((s.special?'SPECIAL FINISH!':s.lob?'ALLEY-OOP!':s.dunk?(s.showtime?'SHOWTIME FINISH!':'STAMPED DUNK!'):s.points===shotPoints(7,false)?'FROM DEEP!':'BUCKET!')+' +'+s.points);beep(880,.22);owner=1-s.who;ballHolder=owner;if(mode!=='practice'&&score[s.who]>=targetScore()){hud();end();return;}}
else{if(s.who===0){heat=0;stampCharge=Math.max(0,stampCharge-10);}const all=[...teamActors(0),...teamActors(1)],nearest=all.sort((a,b)=>rimDistance(players[a],s.who)-rimDistance(players[b],s.who))[0];owner=teamOf(nearest);ballHolder=owner;if(fullCourtActive()){
  ballHolder=nearest;
  players[nearest].catchBall={from:looseBall,time:0};
  looseBall=null;
  clock=24;
  crewHoldTime=0;
  say(s.blocked?'BLOCKED! PUSH THE BREAK.':'LIVE REBOUND. PUSH THE PACE!');
  hud();
  return;
}say(s.blocked?'BLOCKED! '+(owner===0?'YOUR':'RIVAL')+' BALL.':'OFF THE RIM. '+(owner===0?'YOUR':'RIVAL')+' REBOUND.');beep(110,.13);}if(mode==='practice'){owner=0;ballHolder=0;}delay=.62;hud();}
function update(dt){if(!paused){time+=dt;hypeLife=Math.max(0,hypeLife-dt);flash=Math.max(0,flash-dt*2);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=dt*6}particles=particles.filter(p=>p.life>0)}if(!playing||paused)return;crossCD=Math.max(0,crossCD-dt);defCD=Math.max(0,defCD-dt);stun=Math.max(0,stun-dt);comboClock=Math.max(0,comboClock-dt);if(comboClock<=0)comboCount=0;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').textContent=owner===0?'CREATE SPACE. BUILD YOUR STYLE.':'STAY CLOSE. PROTECT THE RIM.'}players.forEach(p=>{p.y=Math.max(0,p.y-dt*2);p.fall=Math.max(0,(p.fall||0)-dt);if (p.trickT > 0) {
    p.trickT=Math.max(0,p.trickT-dt);
    if (!p.trickT) p.dribble=0;
  }
  p.reachTime=Math.max(0,(p.reachTime||0)-dt);
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
  delay-=dt;if(delay<=0){delay=0;resetPossession(owner);hud()}return;}
const p=players[0],a=players[1];let dx=moveX+(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),dz=moveZ+(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);if(stamina<=3)sprintExhausted=true;else if(stamina>=25)sprintExhausted=false;const holdingShift=sprintHeld||keys.ShiftLeft||keys.ShiftRight;
p.guarding=owner===1&&!!holdingShift;
const sprinting=owner===0&&holdingShift&&!sprintExhausted&&stamina>2&&Math.hypot(dx,dz)>.1&&charge<0;stamina=Math.max(0,Math.min(100,stamina+dt*(sprinting?-27:17)));if (shot?.actor !== 0 && !passFlight?.self) {
  move(p, dx, dz, character.speed * (charge >= 0 ? mix(.88, .58, gatherPose(charge)) : sprinting ? 1.48 : p.guarding ? .77 : p.trickMotion ? .58 : 1), dt);
  advanceTrick(p, dt);
  if (p.guarding && ballHolder!==0) {
    const handler=players[ballHolder];
    turn(p,Math.atan2(handler.x-p.x,p.z-handler.z),dt);
  }
  if (charge >= 0) turn(p, Math.atan2(-p.x, Math.max(.3,p.z-1.6)), dt * gatherPose(charge));
}
if (!shot && !passFlight) {
  const holder = players[ballHolder];
  if (!holder.trickT) holder.dribble = ((holder.dribble || 0) +
    dt * (1.9 + .17 * Math.hypot(holder.vx || 0, holder.vz || 0))) % 1;
}
if (charge >= 0) {
  charge = Math.min(1, charge + dt / .95);
  if (charge >= 1) releaseShot();
}
if (shot) {
  if (crewActive()) updateCrew(dt, false);
  else if (shot.actor === 0 && mode !== 'practice' && stun <= 0) {
    guardOpponent(a,p,0,2.75+difficulty*.36,dt);
  }
  updateShot(dt);
  hud();
  return;
}
if(mode!=='practice')clock-=dt;if(mode!=='practice'&&clock<=0){owner=1-owner;ballHolder=owner;passFlight=null;charge=-1;delay=.8;say('SHOT CLOCK. TURNOVER.');return;}if(passFlight){if(crewActive())updateCrew(dt,false);updatePass(dt);hud();return;}if(crewActive()){updateCrew(dt);hud();return;}
if (mode==='practice') { a.x=30; a.z=3; hud(); return; }
if (owner===0) {
  aiStealCD=Math.max(0,aiStealCD-dt);
  if (stun<=0) guardOpponent(a,p,0,2.75+difficulty*.36,dt);
  if (distance(p,a)<.61 && !p.trickT && charge<0) {
    p.z=Math.min(11.6,p.z+dt*.95);
  }
  if (mode==='career'&&careerMatch.chapter>=3&&stun<=0&&aiStealCD<=0&&charge<0&&dribbleExposed(p)) {
    const ball=heldBall(p);
    if (canReachBall(a,p,ball,.82)&&Math.random()<dt*.55) {
      takeBall(1,ball);
      aiStealCD=5;
      say('BALL EXPOSED. '+rivalName()+' STEALS.');
    }
  }
} else {
  a.guarding=false;
  aiWait+=dt;
  const shooter=mode==='career'&&careerMatch.style==='shooter';
  const handler=mode==='career'&&careerMatch.style==='handles';
  const [lane,depth]=driveLane(a,1,p);
  const near=distance(p,a);
  move(a,lane-a.x,(shooter?7.7:depth)-a.z,
    2.45+difficulty*.32+(handler?.36:0),dt);
  const open=near>1.85&&a.z<(shooter?8:6.8);
  if (aiWait>2.45+(2-difficulty)*.60&&(open||shooter&&aiWait>5.2||rimDistance(a,1)<2.55||clock<4)) {
    launch(1,.72);
    aiWait=0;
  }
}
hud();}

let gym='blue',particles=[],flash=0,arenaCache=null,arenaKey='';
const courtNames={blue:'THE STAMP CENTER',emerald:'EMERALD ARENA',street:'FLEX PARK / NIGHT RUN',sunset:'THE CUT / SUNSET RUN'};
const palettes={sunset:{key:'#834c5d',dark:'#35344b',wall:'#57455a',accent:'#ffd18b'},street:{key:'#7953a0',dark:'#20344c',wall:'#192e44',accent:'#ffbd75'},blue:{key:'#1462a3',dark:'#183d69',wall:'#cadbe5',accent:'#69caff'},emerald:{key:'#247c6e',dark:'#19463f',wall:'#d5dfd6',accent:'#d9ff75'}};
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

let feltPattern;
function feltAt(x,z) {
  if (S/cameraDepth(z,0)<21) return null;
  if (feltPattern===undefined) {
    const tile=document.createElement('canvas');
    tile.width=tile.height=28;
    const textile=tile.getContext('2d');
    feltPattern=null;
    if(textile&&typeof ctx.createPattern==='function') {
      let seed=1897;
      for(let fiber=0;fiber<195;fiber++) {
        seed=(seed*1664525+1013904223)>>>0;
        const x=(seed&255)/256*28, y=((seed>>>8)&255)/256*28;
        textile.beginPath();
        textile.moveTo(x,y);
        textile.lineTo(x+(fiber%2?1.7:-1.3),y+(.6+fiber%3)*.55);
        textile.lineWidth=.72;
        textile.strokeStyle=fiber%3===0?'#fff0ce50':'#20112547';
        textile.stroke();
      }
      feltPattern=ctx.createPattern(tile,'repeat')||null;
    }
  }
  if(feltPattern?.setTransform&&typeof DOMMatrix==='function') {
    const at=project(x,z);
    feltPattern.setTransform(new DOMMatrix().translate(at[0],at[1]));
  }
  return feltPattern;
}

function meshFace(faces, vertices, center, color, cloth) {
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
  const light = sign * (-.48*normal[0] + .39*normal[1] + .78*normal[2]) / length;
  const bounce = sign * (.73*normal[0] - .50*normal[1] + .30*normal[2]) / length;
  const shade = cloth ? .63+Math.max(0,light)*.53+Math.max(0,bounce)*.16 :
    .69+Math.max(0,light)*.40;
  faces.push({vertices,depth:cameraDepth(at[1],at[2]),color:litColor(color,shade),cloth});
}

function meshRings(faces, rings, center, color, cloth) {
  for (let row=0; row<rings.length-1; row++) {
    const low=rings[row], high=rings[row+1];
    for (let i=0; i<low.length; i++) {
      const next=(i+1)%low.length;
      meshFace(faces,[low[i],low[next],high[next],high[i]],center,color,cloth);
    }
  }
  meshFace(faces,rings[0],center,color,cloth);
  meshFace(faces,rings[rings.length-1],center,color,cloth);
}

const meshCircles = Array.from({length:10},(_,sides)=>
  Array.from({length:sides},(_,i)=>[Math.cos(i*Math.PI*2/sides),Math.sin(i*Math.PI*2/sides)]));

function bodyMesh(faces, point, levels, color, sides=8, cloth=false) {
  if (W < 700 || fullCourtActive()) sides = Math.min(7,sides);
  const rings=levels.map(([height,width,depth,offset=0]) =>
    meshCircles[sides].map(([cos,sin])=>point(cos*width,offset+sin*depth,height)));
  const bottom=levels[0][0], top=levels[levels.length-1][0];
  meshRings(faces,rings,point(0,0,(bottom+top)/2),color,cloth);
}

function limbMesh(faces, from, to, upperRadius, lowerRadius, color, sides=6, cloth=false) {
  if (W < 700 || fullCourtActive()) sides = Math.min(5,sides);
  const direction=subtractPoint(to,from);
  const length=Math.hypot(...direction);
  if (length<.001) return;
  const axis=direction.map(v=>v/length);
  const perpendicular=crossVector(axis,Math.abs(axis[2])>.85?[1,0,0]:[0,0,1]);
  const scale=Math.hypot(...perpendicular);
  const u=perpendicular.map(v=>v/scale),v=crossVector(axis,u);
  const rings=[[from,upperRadius],[to,lowerRadius]].map(([at,radius]) =>
    meshCircles[sides].map(([cos,sin])=>at.map((value,k)=>value+radius*(u[k]*cos+v[k]*sin))));
  meshRings(faces,rings,mixPoint(from,to,.5),color,cloth);
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
  const profile=squadActor(index);
  const custom=index===0&&character.myPlayer;
  const model=profile || (custom?character:window.HoopsSquads?.find(name));
  const style=window.HoopsPuppets;
  const look=custom?null:style?.look(name);
  const metal=style?.jewelry(model,look);
  const team=ally?squadMatch?.home:squadMatch?.away;
  const skin=look?.skin || model?.skin || (index===0?(character.skin||'#b98159'):
    index===2?'#9a694b':index===3?'#bc875b':mode==='career'?careerMatch.skin:'#8d5c42');
  const personalKit=!team&&ally&&career.look!==0;
  const jersey=team?.color || (personalKit?outfitColor():model?.color) ||
    (ally?outfitColor():mode==='career'?careerMatch.color:'#d25144');
  const shorts=litColor(jersey,.78);
  const trimColor=team?.trim || (personalKit?null:model?.trim) || (ally?'#213546':'#f2d1ad');
  const hair=look?.hair || model?.hair || (index===0&&character.hair?character.hair:
    name==='GOLDIE'?'#d5a440':!ally&&mode==='career'?careerMatch.hair:'#181920');
  const hairStyle=look?.hairStyle || model?.hairStyle || (index===0?character.hairStyle:'');
  const action=shot?.actor===index?shot:null;
  const progress=action?Math.min(1,action.t/action.duration):0;
  const movement=Math.min(1,Math.hypot(p.vx||0,p.vz||0)/4.3);
  const stride=p.gait||0;
  const heading=poseHeading(p);
  const fall=p.fall>0?ease(0,.28,1.05-p.fall)*ease(0,.36,p.fall):0;
  const tip=fall*1.36*(p.fallSide||1);
  const trickProgress=1-(p.trickT||0)/trickDuration;
  const plant=p.trickT?Math.sin(Math.PI*trickProgress):0;
  const stance=p.guarding&&!action?1:0;
  const fallCos=Math.cos(tip),fallSin=Math.sin(tip);
  const buildWidth=profile?.width||1, buildHeight=profile?.height||1;
  const bodyShift=plant*Math.sign(p.trickMotion?.dx||p.dribbleHand||1)*.18;
  const point=(x,z,y)=>actorPoint(p,(x*fallCos+y*fallSin+bodyShift*y)*buildWidth,z,
    Math.max(.015,y*fallCos-x*fallSin)*buildHeight,heading);
  const air=p.y>.045;
  const gathering = index === 0 && charge >= 0 ? gatherPose(charge) : 0;
  const dip = action
    ? mix(.11 * Math.sin(Math.PI * ease(0,.14,progress)), .15 * action.gather, 1-ease(0,.18,progress)) +
      .14 * Math.sin(Math.PI * ease(.78,1,progress))
    : .15 * gathering;
  const hips=.89-dip-.18*plant-.11*stance+Math.abs(Math.sin(stride))*movement*.026;
  const lean=-.19*movement-.19*plant-.09*stance;
  const twist=Math.sin(stride)*movement*.048+(p.trickFromHand||1)*plant*.10;
  const dunkPlant=action?.dunk?(1-ease(.17,.42,progress))*.21:0;
  const landing=action?.dunk?ease(.76,.94,progress):0;
  const hasBall=!shot&&!passFlight&&!looseBall&&ballHolder===index&&delay<=0;
  const dribble=hasBall?heldBall(p):null;
  const faces=[];

  actorShadow(p.x,p.z,p.y);
  if (index===0) {
    ring(p.x,p.z,.39,heat>=3?'#ffb658':'#d9ff75',2);
  } else if (ballHolder===index && !shot && !passFlight) {
    ring(p.x,p.z,.34,ally?'#d9ff75a0':'#ff8f7ca0',1.5);
  }

  for (const side of [-1,1]) {
    const cycle=stride+(side===1?Math.PI:0);
    const step=Math.sin(cycle)*.42*movement+side*dunkPlant;
    const spread=.14+.14*plant+.10*stance+.12*fall;
    const knee=point(side*spread,step*.47-(air?.24:.10),hips*.53+(air?.15:0));
    const footZ=air?mix(side===1?-.29:.32,side*.11,landing):step;
    const footY=air?mix(side===1?.23:.09,.04,landing):.04+Math.pow(Math.max(0,Math.cos(cycle)),1.7)*.19*movement;
    const ankle=point(side*spread,footZ,footY+.085);
    const upper=point(side*.13,0,hips-.04);
    const hem=mixPoint(upper,knee,.61);
    limbMesh(faces,upper,hem,.121,.104,shorts,6,true);
    limbMesh(faces,hem,knee,.086,.070,skin,6,true);
    limbMesh(faces,knee,ankle,.070,.041,skin);
    limbMesh(faces,ankle,point(side*spread,footZ,footY+.17),.050,.049,'#eeede7');
    limbMesh(faces,point(side*spread,footZ+.075,footY+.01),point(side*spread,footZ-.15,footY+.01),.074,.064,'#d7dbdf');
    limbMesh(faces,point(side*spread,footZ+.059,footY+.052),point(side*spread,footZ-.15,footY+.044),.077,.062,'#f1f0ea');
  }

  bodyMesh(faces,point,[
    [hips-.08,.204,.124,.013],[hips+.015,.197,.127],[hips+.23,.194,.123,lean*.34],
    [hips+.48,.263,.142,lean*.83],[hips+.60,.253,.121,lean],
    [hips+.665,.125,.087,lean]
  ],jersey,8,true);
  limbMesh(faces,point(0,lean,hips+.62),point(0,lean-.014,hips+.755),.076,.067,skin,7);

  for (const side of [-1,1]) {
    const shoulder=point(side*.252,lean+side*twist,hips+.552);
    let hand=point(side*.325,Math.sin(stride+(side===1?0:Math.PI))*.20*movement,hips+.025);
    if (action) {
      const hold=action.dunk?.64:.22;
      const reaching=Math.min(progress,hold,action.redirect?.phase??1);
      const ball=shotBall({...action,redirect:null,t:reaching*action.duration});
      const reach=[ball[0]+(side===-1?-.12:0),ball[1],ball[2]-.075];
      const follow=ease(hold,action.dunk?.94:.68,progress);
      if (action.dunk && side!==action.dunkHand) {
        const balance=point(side*.52,.20,hips+.41);
        hand=mixPoint(reach,mixPoint(balance,hand,follow),ease(.19,.40,progress));
      } else {
        hand=mixPoint(reach,hand,follow);
      }
    } else if (p.reachTime>0&&side===p.reachSide) {
      hand=mixPoint(hand,point(side*.60,-.57,hips-.12),Math.sin(Math.PI*p.reachTime/.32));
    } else if (p.contestTime>0) {
      hand=mixPoint(hand,point(side*.29,-.28,hips+1.13),Math.sin(Math.PI*p.contestTime/.36));
    } else if (passFlight&&side===1) {
      const phase=passFlight.t/passFlight.duration;
      if (passFlight.to===index&&phase>=.52) {
        hand=mixPoint(hand,passBall({...passFlight,t:passFlight.duration}),ease(.52,1,phase));
      } else if (passFlight.from===index) {
        hand=mixPoint(passFlight.startBall,hand,ease(0,.32,phase));
      }
    } else if (dribble) {
      const handSide=p.dribbleHand||1;
      const receive=p.trickT ? (side===handSide ? ease(.53,.85,trickProgress) : 1-ease(.14,.44,trickProgress)) :
        Number(side===handSide);
      const grip=[dribble[0]+(side===-1&&gathering>0?-.14:0),dribble[1],Math.max(p.y+hips-.27,dribble[2]+.11)];
      hand=mixPoint(hand,grip,Math.max(receive,gathering));
    } else if (stance||fall>.10) {
      hand=point(side*(.49+.20*fall),-.29,hips+.26+fall*.11);
    }
    const elbow=[mix(shoulder[0],hand[0],.49)+side*.09*Math.cos(heading),
      mix(shoulder[1],hand[1],.48)+.07,mix(shoulder[2],hand[2],.52)-.06];
    limbMesh(faces,shoulder,elbow,.086,.057,skin,6,true);
    limbMesh(faces,elbow,hand,.056,.037,skin);
    limbMesh(faces,mixPoint(elbow,hand,.89),[hand[0],hand[1]-.054,hand[2]-.029],.067,.048,skin,6,true);
    if(metal&&side===1) {
      limbMesh(faces,mixPoint(elbow,hand,.72),mixPoint(elbow,hand,.83),.054,.051,metal.body,5);
    }
  }

  const headY=hips+.735;
  const headDepth=lean-.018;
  const faceColor=tint(skin,1.12);
  const faceWidth=[1,.93,1.10,1.04][model?.face||0];
  const facePoint=(x,z,y)=>point(x*faceWidth*1.10,z*1.04+headDepth,y*1.06+headY);
  const gear=look?null:model?.accessory;
  bodyMesh(faces,facePoint,[
    [0,.119,.093],[.072,.205,.166],[.194,.235,.198],
    [.315,.224,.178,.012],[.403,.158,.122,.020]
  ],faceColor,9,true);
  const fade=hairStyle==='fade';
  const hairHeight=hairStyle==='high'?.571:fade?.430:.492;
  if(hairStyle!=='bald') bodyMesh(faces,facePoint,[
    [.328,.226,.186,.018],[.391,.210,.166,.017],
    [hairHeight,.143,.124,.026]
  ],hair,8,true);
  if(look) signatureHeadwear(faces,facePoint,look,hair);
  for (const side of [-1,1]) {
    const ear=facePoint(side*.212,.013,.195);
    limbMesh(faces,ear,facePoint(side*.281,.028,.224),.077,.055,skin,5);
    if (model?.creature || gear==='horn' || gear==='fang') {
      const horn=model?.creature==='horns'||gear==='horn';
      limbMesh(faces,facePoint(side*.132,.045,.356),
        facePoint(side*(horn?.313:.230),horn?.107:.063,horn?.613:.537),
        horn?.088:.067,.012,horn?'#ecceb0':trimColor,5);
    }
  }
  if (gear==='band'||gear==='wrap'||gear==='hood'||gear==='headset') {
    const bandColor=gear==='band'?jersey:trimColor;
    bodyMesh(faces,facePoint,[
      [.315,.229,.188,.013],[.355,.225,.189,.018],[.372,.211,.174,.018]
    ],bandColor,8);
  }
  if (gear==='crown'||gear==='ribbon') {
    const crown=gear==='crown';
    const accent=crown?'#f2c46f':jersey;
    for(const side of [-1,1]) {
      limbMesh(faces,facePoint(side*.132,.03,.409),
        facePoint(side*(crown?.162:.281),.027,crown?.574:.537),.056,.012,accent,5);
    }
  }
  faces.sort((a,b)=>b.depth-a.depth);
  const distant=fullCourtActive()&&index!==0&&index!==ballHolder;
  const texture=distant?null:feltAt(p.x,p.z);
  for (const face of faces) polygon(face.vertices,face.color,distant?null:face.color,.34,face.cloth?texture:null);

  if (fall<.7) {
    const back=Math.cos(heading)>=0;
    const trim=back?.151:-.151;
    const number=model?.number || (index===0?'01':index===2?'02':index===3?'03':String(22+index));
    if (Math.abs(Math.cos(heading))>.35) {
      jerseyText(number,point(0,lean*.68+trim,hips+.275),.212,trimColor);
      jerseyText(back?(team?.tag||model?.teamTag||'HOOPS'):'SBFENT',
        point(0,lean*.82+trim,hips+.413),.104,trimColor);
      const neckline=lean+trim;
      line([point(-.111,neckline,hips+.615),point(0,neckline,hips+.542),
        point(.111,neckline,hips+.615)],trimColor,Math.max(.8,S/cameraDepth(p.z,p.y)*.023));
      const edge=back?.119:-.119;
      const stitchWidth=Math.max(.6,S/cameraDepth(p.z,p.y)*.014);
      ctx.setLineDash([stitchWidth*1.6,stitchWidth]);

      for (const side of [-1,1]) {
        line([point(side*.172,edge,hips+.045),point(side*.184,lean*.48+edge,hips+.31),
          point(side*.219,lean+edge,hips+.53)],trimColor,stitchWidth);
      }
      ctx.setLineDash([]);
    }
    if(metal) paintChain(point,hips,lean,heading,metal);
    paintPuppetFace(facePoint,heading,skin,hair,hairStyle,gear,model,jersey,trimColor,look);

  }
  if ((index!==0||charge<0)&&(index===0||ballHolder===index||fall>.55)) {
    label3(fall>.55?'ANKLES!':name,p.x,p.z,p.y+mix((look?.hat?2.65:2.52)*buildHeight,1.24,fall),.16,ally?'#d9ff75':'#f6a59a');
  }
}
function signatureHeadwear(faces, point, look, hair) {
  const tilt=look.hat==='tilt'?.24:0;
  const hat=(x,z,y)=>point(x,z,y+tilt*x);
  const beanie=look.hat==='beanie';
  if(look.hat==='crown') {
    bodyMesh(faces,hat,[
      [.415,.217,.187],[.460,.234,.195],[.484,.225,.188]
    ],look.hatColor,8);
    for(const side of [-1,0,1]) {
      limbMesh(faces,hat(side*.139,-.027,.456),hat(side*.168,-.038,.577),.060,.012,look.hatColor,5);
    }
  } else if(look.hat) {
    bodyMesh(faces,hat,[
      [.343,.251,.211,.008],[.383,.255,.214,.011],[.434,.237,.194,.018],
      [.51,.197,.165,.019],[.571,.132,.116,.026],[.592,.055,.05,.025]
    ],look.hatColor,9,true);
    if(!beanie) {
      bodyMesh(faces,hat,[
        [.343,.271,.181,-.119],[.365,.290,.209,-.127],[.380,.273,.188,-.122]
      ],look.hatColor,9,true);
    } else {
      bodyMesh(faces,hat,[
        [.342,.255,.214,.012],[.371,.258,.217,.012],[.401,.251,.209,.012]
      ],look.hatColor,9,true);
    }
  }
  if(look.buns) {
    for(const side of [-1,1]) {
      limbMesh(faces,point(side*.168,.044,.434),point(side*.198,.047,.488),.090,.059,hair,6,true);
    }
  }
  if(look.hairStyle==='swept') {
    limbMesh(faces,point(.161,.026,.408),point(.223,.066,.195),.096,.055,hair,6,true);
  }
  if(look.mask) {
    bodyMesh(faces,point,[
      [.019,.148,.127,-.033],[.064,.203,.167,-.022],
      [.115,.230,.189,-.020],[.171,.231,.196,-.025]
    ],'#211d24',8,true);
  }
  if(look.headphones) {
    for(const side of [-1,1]) {
      limbMesh(faces,point(side*.217,.031,.247),point(side*.287,.033,.247),.115,.095,'#181b26',7,true);
      limbMesh(faces,point(side*.281,.033,.247),point(side*.318,.032,.247),.088,.071,'#58abc9',7,true);
    }
  }
  if(look.hairStyle==='long-curls') {
    for(const side of [-1,1]) {
      limbMesh(faces,point(side*.198,.110,.360),point(side*.243,.137,.029),.100,.089,hair,6,true);
      limbMesh(faces,point(side*.221,.158,.213),point(side*.219,.158,-.073),.088,.063,hair,6,true);
    }
  }
}

function paintChain(point,hips,lean,heading,metal) {
  const facing=Math.cos(heading);
  if(Math.abs(facing)<.29) return;
  const back=facing>0;
  const z=lean+(back?.143:-.151);
  const curve=drop=>[
    point(-.135,z,hips+.606),point(-.083,z*1.03,hips+.558-drop),
    point(0,z*1.09,hips+.533-drop),point(.083,z*1.03,hips+.558-drop),point(.135,z,hips+.606)
  ];
  const [,z0,y0]=curve(0)[2];
  const size=Math.max(.8,S/cameraDepth(z0,y0)*.023);
  const chain=drop=>{
    const points=curve(drop);
    line(points,metal.shadow,size*1.35);
    ctx.setLineDash([size*1.65,size*.55]);
    line(points,metal.body,size);
    ctx.setLineDash([size*.65,size*1.55]);
    line(points,metal.shine,Math.max(.55,size*.48));
    ctx.setLineDash([]);
  };
  chain(0);
  if(metal.double) chain(.032);
  if(back) return;
  const y=hips+(metal.double?.463:.495),d=z*1.12;
  const charm=metal.pendant===0?[[-.044,y+.023],[.044,y+.023],[.044,y-.020],[-.044,y-.020]]:
    metal.pendant===1?[[0,y+.035],[.037,y],[0,y-.036],[-.037,y]]:
      [[-.049,y+.024],[-.025,y+.006],[0,y+.028],[.025,y+.006],[.049,y+.024],[.035,y-.023],[-.035,y-.023]];
  polygon(charm.map(([x,y])=>point(x,d,y)),metal.body,metal.shine,Math.max(.6,size*.45));
}

function paintPuppetFace(point,heading,skin,hair,hairStyle,gear,model,jersey,trim,look) {
  const facing=Math.cos(heading);
  const faceOn=facing<-.24;
  const stitch=faceOn?tint(skin,.70):tint(skin,.66);
  if (facing>.25) {
    for(let row=0;row<5;row++) {
      const y=.068+row*.054;
      line([point(-.026,.200,y),point(.020,.201,y+.029)],stitch,.9);
    }
  }
  if (faceOn) {
    const dark='#2c1b29';
    for (const side of [-1,1]) {
      const x=side*.090;
      const size=model?.eye===1?.048:model?.eye===2&&side===1?.070:.061;
      sphere(...point(x,-.195,.268),size,'#fff0cf');
      sphere(...point(x-side*.007,-.243,.265),.024,dark);
      if (look||gear==='brows') segment(point(x-.048,-.198,.330+(side===-1?.010:0)),
        point(x+.047,-.201,.319+(side===1?.016:0)),.026,hair);
    }
    if(!look?.mask) {
      if(look?.beard) segment(point(-.116,-.152,.080),point(.116,-.152,.080),.120,'#27202a');
      const lips=look?.hoops?'#a84555':dark;
      segment(point(-.084,-.175,.109),point(.084,-.175,.109),.082,lips);
      segment(point(-.044,-.221,.082),point(.038,-.221,.085),.025,'#e79895');
      sphere(...point(0,-.208,.187),.064,tint(skin,1.17));
    }
    if(look?.shades) {
      for(const side of [-1,1]) {
        const x=side*.090;
        polygon([[x-.079,.292],[x+.079,.285],[x+.064,.211],[x-.065,.213]].map(([x,y])=>point(x,-.257,y)),
          '#171822','#e8ba53',1);
      }
      segment(point(-.025,-.263,.259),point(.025,-.263,.259),.018,'#e8ba53');
    }
    if(look?.tag) {
      jerseyText(look.tag,point(0,-.202,look.hat==='beanie'?.394:.433),.080,'#ffdb95');
    }
    if (gear==='visor'||gear==='shades'||gear==='mono') {
      const lens=gear==='mono'?'#d5ad6e':trim;
      for (const side of gear==='mono'?[1]:[-1,1]) {
        segment(point(side*.092-.052,-.246,.277),point(side*.092+.052,-.246,.277),
          gear==='mono'?.029:.062,lens);
      }
      if(gear==='visor') segment(point(-.155,-.257,.296),point(.156,-.257,.296),.018,jersey);
    }
    if (gear==='guard') segment(point(-.107,-.190,.095),point(.107,-.190,.095),.087,trim);
    if (gear==='fang') {
      for(const side of [-1,1]) segment(point(side*.056,-.229,.126),point(side*.056,-.229,.083),.025,'#ffebc1');
    }
  }
  const visibleSide=Math.sin(heading)>=0?1:-1;
  if (gear==='patch'||gear==='bones') {
    const side=model?.patchSide||visibleSide;
    if (faceOn||side===visibleSide||facing>.6) {
      const z=faceOn?-.144:.151;
      segment(point(side*.169-.024,z,.117),point(side*.169+.020,z,.161),.017,gear==='bones'?'#fff0cf':jersey);
      segment(point(side*.169-.023,z,.159),point(side*.169+.026,z,.119),.017,gear==='bones'?'#fff0cf':jersey);
    }
  }
  if (gear==='gold'||gear==='headset') {
    for(const side of facing>.55||faceOn?[-1,1]:[visibleSide]) {
      sphere(...point(side*.256,.020,gear==='gold'?.135:.212),gear==='gold'?.027:.047,
        gear==='gold'?'#efbc59':jersey);
    }
  }
  if (look?.hoops) {
    for(const side of faceOn||facing>.60?[-1,1]:[visibleSide]) {
      const loop=[];
      for(let i=0;i<=8;i++) {
        const a=i*Math.PI/4;
        loop.push(point(side*.261+Math.sin(a)*.028,.007,.104+Math.cos(a)*.054));
      }
      line(loop,'#f4c660',1.6);
      if(hairStyle!=='long-curls') continue;
      for(let i=0;i<3;i++) {
        const x=side*(.219+i*.024);
        line([point(x,.138,.325),point(x+side*.020,.163,.219),point(x-side*.012,.171,.126),
          point(x+side*.018,.169,.038)],i%2?tint(hair,1.24):tint(hair,.85),1.4);
      }
    }
  }
  if (hairStyle==='locs'||hairStyle==='braids') {
    for(let n=-2;n<=2;n++) {
      const lower=hairStyle==='braids'?.088:.160;
      segment(point(n*.069,.150,.363),point(n*.073,.170,lower),.043,hair);
      if(look?.tips) segment(point(n*.072,.170,lower+.042),point(n*.073,.171,lower),.034,look.tips);
    }
  } else if (hairStyle==='curls') {
    for(let n=0;n<6;n++) {
      const a=n*Math.PI/3;
      sphere(...point(Math.cos(a)*.156,Math.sin(a)*.122,.414),.060,hair);
    }
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
  if (fullCourtActive()) {
    fullArena();
    return;
  }
  if (gym==='street'||gym==='sunset') {
    streetArena();
    return;
  }
  const pal=palettes[gym];
  const backdrop=ctx.createLinearGradient(0,0,0,H);
  backdrop.addColorStop(0,'#16243c');
  backdrop.addColorStop(.56,'#444b61');
  backdrop.addColorStop(1,'#241d2a');
  ctx.fillStyle=backdrop;
  ctx.fillRect(0,0,W,H);

  polygon([[-17,-9,0],[17,-9,0],[17,18,0],[-17,18,0]],'#222d3a');
  polygon([[-8.62,-1.72,.002],[8.62,-1.72,.002],[8.62,14.6,.002],[-8.62,14.6,.002]],'#8a623b');
  hardwood();
  indoorLines(pal);
  for(const side of [-1,1]){
    polygon([[side*7.2,-1.2,.045],[side*7.8,-1.2,.045],
      [side*7.4,12.2,.045],[side*6.97,12.2,.045]],'#ffedd02a');
  }

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
  if (gym==='street'||gym==='sunset'||fullCourtActive()) return;
  const title=gym==='emerald'?'EMERALD ARENA':'STAMP CENTER';
  const x=6.1;
  polygon([[x-1.65,-7.92,5.45],[x+1.65,-7.92,5.45],[x+1.65,-7.92,7],[x-1.65,-7.92,7]],'#101a26','#4d5663',2);
  label3(title,x,-7.89,6.72,.20,'#d3dbe2');
  label3(String(score[0]).padStart(2,'0')+'   :   '+String(score[1]).padStart(2,'0'),x,-7.88,6.12,.50,'#f6edcd');
  label3(String(Math.ceil(clock)).padStart(2,'0'),x,-7.87,5.68,.23,'#ff8069');
}
function hoopBase(team=0) {
  const z = depth => attackingZ(depth,team);
  block(0,z(-.15),1.3,1.4,.35,palettes[gym].dark);
  block(0,z(-.35),.42,.44,3.5,palettes[gym].key);
  segment([0,z(-.35),3.4],[0,z(1.02),3.9],.14,'#d6dde2');
  const board=z(1.05);
  polygon([[-1.12,board,2.9],[1.12,board,2.9],[1.12,board,4.22],[-1.12,board,4.22]],'#c8edf530','#edf6f1',3);
  const target=z(1.04);
  polygon([[-.43,target,3.03],[.43,target,3.03],[.43,target,3.51],[-.43,target,3.51]],null,'#f4f7e6',2);
}

function hoopNet(team=0) {
  const z=attackingZ(1.6,team);
  ring(0,z,.46,'#f18549',3,3.05);
  for(let a=0;a<10;a++){
    const k=a/10*Math.PI*2;
    line([[Math.cos(k)*.46,z+Math.sin(k)*.46,3.05],
      [Math.cos(k+.4)*.25,z+Math.sin(k+.4)*.25,2.48]],'#f5f2e7b0',1);
  }
  ring(0,z,.32,'#f5f2e780',1,2.7);
}

function fullArena() {
  const pal=palettes[gym];
  const outdoor=gym==='street'||gym==='sunset';
  const backdrop=ctx.createLinearGradient(0,0,0,H);
  backdrop.addColorStop(0,outdoor?'#624868':'#132137');
  backdrop.addColorStop(.60,outdoor?'#bd8367':'#41516b');
  backdrop.addColorStop(1,'#171e2b');
  ctx.fillStyle=backdrop;
  ctx.fillRect(0,0,W,H);

  polygon([[-14,-3,0],[14,-3,0],[14,courtLength+3,0],[-14,courtLength+3,0]],pal.dark);
  const colors=outdoor?['#576571','#53616c','#566370']:['#cc9e6c','#bd8b58','#d4a977','#c79765','#c69560'];
  for(let plank=0;plank<68;plank++){
    const x=-6.8+plank*.2;
    polygon([[x,0,.01],[x+.2,0,.01],[x+.2,courtLength,.01],[x,courtLength,.01]],colors[plank%colors.length]);
    for(let seam=1+(plank%7)*.31;seam<courtLength;seam+=3.1){
      line([[x,seam,.012],[x+.2,seam,.012]],'#52392c66',.55);
    }
  }
  const paint='#fff3dc';
  for(const side of [0,1]){
    const z=depth=>attackingZ(depth,side);
    const accent=(side?squadMatch?.home.color:squadMatch?.away.color)||pal.accent;
    polygon([[-2.25,z(0),.02],[2.25,z(0),.02],[2.25,z(4.8),.02],[-2.25,z(4.8),.02]],tint(accent,.61),paint,1.4);
    ring(0,z(4.8),2.25,paint,1.4,.026);
    const arc=[];
    for(let t=0;t<=Math.PI+.015;t+=.037) arc.push([Math.cos(t)*5.8,z(1.5+Math.sin(t)*5.8),.028]);
    line(arc,paint,1.6);
    for (const edge of [-5.8,5.8]) line([[edge,z(0),.03],[edge,z(1.5),.03]],paint,1.6);
  }
  polygon([[-6.8,0,.033],[6.8,0,.033],[6.8,courtLength,.033],[-6.8,courtLength,.033]],null,paint,2);
  line([[-6.8,courtLength/2,.033],[6.8,courtLength/2,.033]],paint,1.8);
  ring(0,courtLength/2,1.6,paint,1.6,.035);
  floorText('SBFENT',0,courtLength/2+.75,.75,'#26334aaf');
  for (const side of [-1,1]) {
    for (let row=2;row>=0;row--) {
      const x=side*(8.8+row*.90),y=.33+row*.48;
      block(x,courtLength/2,.86,courtLength,.33,'#273044',y-.30);
      for(let seat=0;seat<38;seat++){
        if((row+seat)%9!==0)audienceMember(x,.35+seat*.65,y,seat+row*43+side*5+5);
      }
    }
    block(side*7.85,courtLength/2,1.1,3.8,.44,pal.dark);
  }
  polygon([[-7,-2,2],[7,-2,2],[7,-2,3.8],[-7,-2,3.8]],pal.dark,pal.accent,1.4);
  label3('SBFENT / FULL COURT',0,-1.98,2.9,.52,paint);
}
function burst(x,z,color){for(let i=0;i<22;i++)particles.push({x,z,y:3.1,vx:(Math.random()-.5)*4,vz:(Math.random()-.5)*3,vy:2+Math.random()*3,life:1,color})}
function drawShotMeter() {
  const p = players[0];
  const radius = Math.max(13, Math.min(20, H * .044));
  const [x, head] = project(p.x,p.z,p.y+2.53*(character.height||1));
  const y = Math.max(radius+4,head-radius-9);
  const start = -Math.PI / 2;
  const angle = value => start + 2 * Math.PI * value;
  const green = Math.abs(charge - shotTarget) < shotWindow;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x,y,radius+4,0,Math.PI*2);
  ctx.fillStyle = '#0c1725ed';
  ctx.fill();
  const arc = (from,to,color,width) => {
    ctx.beginPath();
    ctx.arc(x,y,radius,angle(from),angle(to));
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  };
  arc(0,1,'#708494',3);
  arc(0,charge,green?'#d9ff75':'#fff',3);
  arc(shotTarget-shotWindow,shotTarget+shotWindow,'#aafa5c',5);
  ctx.beginPath();
  ctx.arc(x+Math.cos(angle(charge))*radius,y+Math.sin(angle(charge))*radius,3.4,0,Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  if (green) {
    ctx.font = '900 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d9ff75';
    ctx.fillText('LET GO',x,y+3);
  }
  ctx.restore();
}

function paintSpecialTrail(s) {
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const profile=squadActor(s.actor)||character;
  const color=window.HoopsPuppets?.look(profile.name)?.trim||profile.color||'#ffc76e';
  const points=[];
  for(let i=5;i>=0;i--) {
    points.push(shotBall({...s,t:Math.max(0,s.t-i*.031)}));
  }
  ctx.save();
  ctx.globalAlpha=.29;
  ctx.lineJoin='round';
  line(points,color,7);
  ctx.globalAlpha=.80;
  line(points,'#ffeacc',2);
  ctx.restore();
}

function render() {
  const key = [W,H,canvas.width,canvas.height,gym,fullCourtActive(),squadMatch?.home.id,squadMatch?.away.id].join(':');
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
  if(shot?.special) paintSpecialTrail(shot);
  basketball(...ball);
  hoopNet();
  if (fullCourtActive()) { hoopBase(1); hoopNet(1); }
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
  if (charge >= 0 && playing && !paused) drawShotMeter();
  setHudStyle('cross','opacity',crossCD > 0 || owner !== 0 ? '.5' : '1');
  setHudStyle('shoot','opacity',owner !== 0 ? '.5' : '1');
  setHudStyle('defend','opacity',owner === 0 ? (stamina < 5 ? '.5' : '1') : (defCD > 0 ? '.5' : '1'));
}

function frame(timestamp) {
  if (document.hidden || playing&&!paused&&W<H&&touchCourt()) {
    last = 0;
    requestAnimationFrame(frame);
    return;
  }
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

window.HoopsCareer.onPreview=cfg=>{
  if (playing) return;
  if ($('mode').value==='career') {
    character=cfg.player;
    mode='career';
    careerMatch=cfg;
    squadMatch=null;
    gym=cfg.gym;
    configureCamera();
  }
};
function streetArena(){const dusk=gym==='sunset',pal=palettes[gym],sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,dusk?'#50486e':'#101a32');sky.addColorStop(.65,dusk?'#d08b70':'#314155');sky.addColorStop(1,dusk?'#432f44':'#162b3b');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
for(let j=-4;j<=4;j++){const bx=j*3.5,bh=4.5+(j*j%4);block(bx,-8.5,3.2,2.5,bh,dusk?(j%2?'#69445b':'#58455d'):(j%2?'#26354b':'#213044'));for(let y=1;y<bh;y+=.9)for(let x=bx-1;x<bx+1.4;x+=.7)if((Math.round(x*10)+Math.round(y*10))%3!==0)polygon([[x,-7.2,y],[x+.25,-7.2,y],[x+.25,-7.2,y+.4],[x,-7.2,y+.4]],'#dfb66b99')}
polygon([[-14,-5,0],[14,-5,0],[14,18,0],[-14,18,0]],'#283847');for(let z=-4;z<17;z+=1.4)line([[-14,z,.005],[14,z,.005]],'#41515d55',.8);
polygon([[-7.2,-.5,.01],[7.2,-.5,.01],[7.2,13,.01],[-7.2,13,.01]],dusk?'#4a526a':'#324c5a');polygon([[-6.8,0,.02],[6.8,0,.02],[6.8,12.4,.02],[-6.8,12.4,.02]],null,'#e5e9d4',2);polygon([[-2.2,0,.025],[2.2,0,.025],[2.2,4.8,.025],[-2.2,4.8,.025]],pal.key,'#e5e9d4',2);ring(0,4.8,2.2,'#e5e9d4',2);const arc=[];for(let a=0;a<=Math.PI+.01;a+=.035)arc.push([Math.cos(a)*5.8,1.5+Math.sin(a)*5.8,.03]);line(arc,'#e5e9d4',2);for(const side of [-1,1]){line([[side*5.8,0,.03],[side*5.8,1.5,.03]],'#e5e9d4',2);for(let z=1;z<4.6;z+=.7)line([[side*2.2,z,.03],[side*2.5,z,.03]],'#e5e9d4',2)}ring(0,12.4,1.6,'#e5e9d4',2);floorText('SBFENT',0,9.4,1.05,'#dacb9a');floorText('LEAVE YOUR STAMP',0,10.3,.35,'#d4e6c1');floorText('FLEX PARK',0,-.4,.48,'#d9ff75');
for(let x=-10;x<=10;x+=.55){line([[x,-4,0],[x,-4,4.5]],'#7d959d66',1);line([[x,-4,0],[Math.min(10,x+2.2),-4,4.5]],'#7d959d33',.6)}for(const y of [0,2,4.5])line([[-10,-4,y],[10,-4,y]],'#91a0a8',2);for(const x of [-10,-5,0,5,10])segment([x,-4,0],[x,-4,4.6],.09,'#536976');
for(const side of [-1,1]){for(const z of [0,10]){segment([side*8.5,z,0],[side*8.5,z,7.6],.13,'#60707b');segment([side*8.5,z,7.6],[side*7.5,z,7.6],.1,'#60707b');polygon([[side*7.5-.38,z-.2,7.6],[side*7.5+.38,z-.2,7.6],[side*7.5+.38,z+.2,7.6],[side*7.5-.38,z+.2,7.6]],'#fff3c5');polygon([[side*5.7,z+1,.04],[side*6.5,z+1,.04],[side*5.8,z+6,.04],[side*4.5,z+6,.04]],'#f3dfa912')}
block(side*9,5,.8,5.5,.6,'#7b6956');for(let k=0;k<5;k++){const z=2+k*1.3;block(side*9,z,.4,.35,.65,['#b898ef','#d9ff75','#ed986c','#72a4c1','#d2cbad'][k],.65);sphere(side*9,z,1.6,.19,'#ac7a56')}}
polygon([[-3.6,-3.95,3.15],[3.6,-3.95,3.15],[3.6,-3.95,4.35],[-3.6,-3.95,4.35]],'#132639','#b898ef',2);label3(dusk?'THE CUT / SBFENT':'STAMPED LEGACY',0,-3.9,3.65,.48,dusk?'#ffdc9d':'#d9ff75');}
