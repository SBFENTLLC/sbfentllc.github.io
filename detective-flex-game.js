(() => {
  'use strict';
  const root=document.querySelector('#detective-flex-game');
  if(!root)return;
  const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const $=s=>root.querySelector(s);
  const overlay=$('.flex-game-overlay'),title=$('[data-game-title]'),message=$('[data-game-message]'),start=$('[data-game-start]'),pause=$('[data-game-pause]');
  const scoreText=$('[data-game-score]'),timeText=$('[data-game-time]'),bestText=$('[data-game-best]'),status=$('[data-game-status]');
  const W=900,H=640,R=18;
  const obstacles=[{x:36,y:48,w:210,h:106},{x:292,y:60,w:166,h:84},{x:511,y:60,w:166,h:84},{x:726,y:60,w:138,h:84},{x:96,y:268,w:148,h:90},{x:343,y:266,w:68,h:84},{x:489,y:266,w:68,h:84},{x:656,y:268,w:148,h:90},{x:40,y:491,w:190,h:88},{x:282,y:491,w:166,h:88},{x:508,y:491,w:166,h:88},{x:726,y:491,w:138,h:88}];
  const spots=[{x:65,y:202},{x:205,y:204},{x:310,y:202},{x:460,y:191},{x:605,y:202},{x:750,y:207},{x:852,y:220},{x:55,y:320},{x:290,y:325},{x:447,y:306},{x:605,y:325},{x:850,y:325},{x:66,y:431},{x:220,y:424},{x:366,y:425},{x:535,y:425},{x:700,y:423},{x:844,y:432},{x:255,y:601},{x:477,y:601},{x:700,y:601}];
  let mode='ready',score=0,remaining=60,best=0,round=1,found=0,last=0,raf=0,targets=[],flash=null;
  let scan=0,scanCooldown=0,musicOn=false;
  const musicButton=$('[data-game-music]'),scanButton=$('[data-game-scan]');
  const music=new Audio('back-off-case-001-series.mp4');music.preload='none';music.loop=true;music.volume=.5;
  const puppet=new Image();puppet.src='detective-flex-puppet-v2.webp';puppet.onload=()=>{if(mode!=='playing')draw();};
  let player={x:450,y:420},keys=new Set(),touch=new Set();
  try{best=Number(localStorage.getItem('sbfent-detective-flex-best'))||0;}catch{}
  bestText.textContent=best;
  function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function label(text,x,y,size=16,color='#d1ddb5',align='left'){ctx.font=`bold ${size}px Arial`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(text,x,y);}
  function lizard(t){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle);ctx.strokeStyle='#739846';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,4);ctx.quadraticCurveTo(-27,18,-35,-1);ctx.stroke();ctx.lineWidth=4;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-2,side*5);ctx.lineTo(-10,side*15);ctx.moveTo(6,side*5);ctx.lineTo(15,side*15);ctx.stroke();}rounded(-12,-10,30,21,10,'#a3cb68','#62843a');rounded(8,-13,22,26,10,'#b7df7d');ctx.fillStyle='white';ctx.beginPath();ctx.arc(19,-7,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#151c13';ctx.beginPath();ctx.arc(21,-7,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#395122';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(18,5);ctx.lineTo(29,4);ctx.stroke();ctx.restore();}
  function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function truck(o,i){
    const c=i%2?'#1f715b':'#74613d';
    rounded(o.x+5,o.y+8,o.w,o.h,9,'#0008');
    rounded(o.x,o.y,o.w,o.h,8,c,'#a9bbaf');
    rounded(o.x+6,o.y+6,o.w-52,o.h-12,5,'#1b3536','#62816f');
    for(let x=o.x+12;x<o.x+o.w-52;x+=9){ctx.strokeStyle='#718e8050';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,o.y+9);ctx.lineTo(x,o.y+o.h-9);ctx.stroke();}
    rounded(o.x+o.w-41,o.y+7,34,o.h-14,7,c,'#b6c6b6');
    rounded(o.x+o.w-37,o.y+17,25,o.h-34,4,'#102b36','#6b959c');
    for(const y of [o.y+4,o.y+o.h-8]){rounded(o.x+20,y-6,23,10,3,'#080c0d');rounded(o.x+o.w-37,y-6,22,10,3,'#080c0d');}
    ctx.fillStyle='#ffd779';ctx.fillRect(o.x+o.w-5,o.y+12,4,8);ctx.fillRect(o.x+o.w-5,o.y+o.h-20,4,8);
    glow(o.x+o.w+7,o.y+o.h/2,30,'#ffd77930');
    label(i===9?'BIG OLE RIG':'SBFENT',o.x+(o.w-43)/2,o.y+o.h/2+5,i===9?12:14,'#d7efb0','center');
    for(let x=o.x+10;x<o.x+o.w-45;x+=23){ctx.fillStyle='#f2b65d';ctx.fillRect(x,o.y+o.h-6,4,3);}
  }
  function draw(){
    ctx.clearRect(0,0,W,H);const night=ctx.createLinearGradient(0,0,W,H);night.addColorStop(0,'#102b31');night.addColorStop(.55,'#17252a');night.addColorStop(1,'#081316');ctx.fillStyle=night;ctx.fillRect(0,0,W,H);
    for(let i=0;i<1100;i++){const x=(i*137)%900,y=(i*71)%640;ctx.fillStyle=i%2?'#869c8b12':'#00000025';ctx.fillRect(x,y,2,1);}
    for(const p of [[255,230],[615,452],[805,180],[150,415]]){ctx.fillStyle='#6b96981b';ctx.beginPath();ctx.ellipse(p[0],p[1],43,9,-.2,0,Math.PI*2);ctx.fill();}
    for(let x=48;x<880;x+=90){ctx.fillStyle='#c0cb9530';ctx.fillRect(x,160,2,39);ctx.fillRect(x,585,2,22);}
    for(let x=0;x<W;x+=50){ctx.strokeStyle='#1b2b2d';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    ctx.setLineDash([18,18]);ctx.strokeStyle='#756b43';ctx.lineWidth=3;for(const y of [230,455]){ctx.beginPath();ctx.moveTo(22,y);ctx.lineTo(878,y);ctx.stroke();}ctx.setLineDash([]);
    rounded(17,17,866,606,16,'#0000','#476153');
    obstacles.forEach((o,i)=>{if(i===0){rounded(o.x,o.y,o.w,o.h,8,'#59452c','#927641');rounded(o.x+12,o.y+14,o.w-24,33,5,'#141f18','#b0ee59');label('SBFENT TRUCKSTOP',o.x+o.w/2,o.y+36,17,'#b0ee59','center');for(let a=0;a<4;a++)rounded(o.x+15+a*47,o.y+63,34,26,3,'#f4c769');}else if(i===4||i===7){rounded(o.x,o.y,o.w,o.h,10,'#394648','#60726a');label(i===4?'PARKING':'REST AREA',o.x+o.w/2,o.y+o.h/2+5,17,'#becda4','center');}else if(i===5||i===6){rounded(o.x,o.y,o.w,o.h,9,'#2b5940','#b0ee59');label('FUEL',o.x+o.w/2,o.y+25,14,'#d1e9b0','center');rounded(o.x+15,o.y+36,38,18,3,'#101b18');label('FBH',o.x+o.w/2,o.y+76,12,'#e0d596','center');}else truck(o,i);});
    label('BIG OLE RIG • NIGHT SHIFT • SBFENT',450,32,14,'#b0ee59','center');
    for(const x of [28,870]){glow(x,240,95,'#b7e97418');rounded(x-3,210,6,45,3,'#687c73');rounded(x-10,203,20,7,3,'#e9efb0');}
    for(const p of [[265,170],[633,369],[818,475]]){rounded(p[0]-5,p[1],10,12,2,'#bc7b35');label('▲',p[0],p[1]+9,10,'#ffd88a','center');}
    if(scan>0){targets.forEach(t=>{glow(t.x,t.y,52,'#b0ff5960');ctx.strokeStyle='#c4ff75';ctx.lineWidth=2;ctx.beginPath();ctx.arc(t.x,t.y,34+Math.sin(performance.now()/130)*3,0,Math.PI*2);ctx.stroke();});}
    glow(player.x,player.y-16,75,'#fff6bc14');
    targets.forEach(lizard);
    if(puppet.complete&&puppet.naturalWidth){ctx.save();ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(player.x,player.y+24,25,8,0,0,Math.PI*2);ctx.fill();const bob=mode==='playing'&&(keys.size||touch.size)?Math.sin(performance.now()/85)*2:0;ctx.drawImage(puppet,player.x-30,player.y-58+bob,60,90);ctx.restore();}else{
    ctx.save();ctx.translate(player.x,player.y);
    ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,23,24,9,0,0,Math.PI*2);ctx.fill();
    rounded(-16,-2,32,35,11,'#a37d47','#d3bc78');
    ctx.fillStyle='#cf903f';ctx.beginPath();ctx.arc(0,-12,20,0,Math.PI*2);ctx.fill();
    rounded(-21,-29,42,15,7,'#16191b');rounded(-19,-10,38,18,7,'#151818');
    for(const x of [-8,8]){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x,-13,6,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#171917';ctx.beginPath();ctx.arc(x+1,-13,2.5,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#d7c48c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(25,8,12,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(32,17);ctx.lineTo(40,26);ctx.stroke();
    label('FLEX',0,23,9,'#f2e7b8','center');ctx.restore();}
    if(flash){ctx.globalAlpha=Math.max(0,flash.life);label('+1 • FOUND!',flash.x,flash.y-38,19,'#c2ff77','center');ctx.globalAlpha=1;}
    label('MOVE CLOSE TO A LIZARD TO FIND IT',450,630,12,'#b9c9a6','center');
  }
  function blocked(x,y){return x<R+18||x>W-R-18||y<R+18||y>H-R-18||obstacles.some(o=>x+R>o.x&&x-R<o.x+o.w&&y+R>o.y&&y-R<o.y+o.h);}
  function spawn(){const choices=spots.filter(p=>Math.hypot(p.x-player.x,p.y-player.y)>100);for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}targets=choices.slice(0,5).map(p=>({...p,angle:Math.random()*Math.PI*2}));found=0;}
  function hud(){scoreText.textContent=score;timeText.textContent=Math.max(0,Math.ceil(remaining))+'s';bestText.textContent=best;}
  function saveBest(){if(score>best){best=score;try{localStorage.setItem('sbfent-detective-flex-best',String(best));}catch{}}}
  function stopFrame(){cancelAnimationFrame(raf);raf=0;keys.clear();touch.clear();}
  function show(t,m,button){title.textContent=t;message.textContent=m;start.textContent=button;overlay.hidden=false;}
  function finish(){mode='finished';music.pause();stopFrame();saveBest();hud();pause.disabled=true;show('CASE CLOSED.',`Detective Flex found ${score} ${score===1?'lizard':'lizards'}. Best on this device: ${best}. Run the truckstop again and beat your score.`,'Play again');status.textContent=`Case closed. ${score} lizards found.`;draw();start.focus({preventScroll:true});}
  function frame(now){if(mode!=='playing')return;const elapsed=Math.max(0,(now-last)/1000);last=now;remaining-=elapsed;if(remaining<=0){remaining=0;finish();return;}const dt=Math.min(elapsed,.05);scan=Math.max(0,scan-dt);scanCooldown=Math.max(0,scanCooldown-dt);scanButton.textContent=scanCooldown>0?`Scan ${Math.ceil(scanCooldown)}s`:'Scan the lot';scanButton.disabled=scanCooldown>0;let dx=(keys.has('ArrowRight')||keys.has('d')||touch.has('right')?1:0)-(keys.has('ArrowLeft')||keys.has('a')||touch.has('left')?1:0),dy=(keys.has('ArrowDown')||keys.has('s')||touch.has('down')?1:0)-(keys.has('ArrowUp')||keys.has('w')||touch.has('up')?1:0);const mag=Math.hypot(dx,dy)||1;dx=dx/mag*220*dt;dy=dy/mag*220*dt;if(!blocked(player.x+dx,player.y))player.x+=dx;if(!blocked(player.x,player.y+dy))player.y+=dy;
    targets=targets.filter(t=>{if(Math.hypot(player.x-t.x,player.y-t.y)<44){score++;found++;flash={x:t.x,y:t.y,life:1};status.textContent=`Lizard found! ${score} total. ${5-found} left in this sweep.`;return false;}return true;});
    if(!targets.length){round++;spawn();status.textContent=`Sweep ${round}. Five more lizards are hiding at the truckstop.`;}
    if(flash){flash.life-=dt;if(flash.life<=0)flash=null;}hud();draw();raf=requestAnimationFrame(frame);
  }
  function play(){if(mode!=='paused'){player={x:450,y:420};score=0;remaining=60;round=1;flash=null;scan=0;scanCooldown=0;scanButton.disabled=false;spawn();}mode='playing';if(musicOn)music.play().catch(()=>{musicOn=false;musicButton.textContent='Music off';musicButton.setAttribute('aria-pressed','false');status.textContent='Music could not load. Tap Music off to retry.';});overlay.hidden=true;pause.disabled=false;pause.textContent='Pause';status.textContent='Case open. Find the five green lizards!';hud();canvas.focus({preventScroll:true});last=performance.now();stopFrame();raf=requestAnimationFrame(frame);}
  function pauseGame(){if(mode!=='playing')return;mode='paused';music.pause();stopFrame();pause.textContent='Resume';show('CASE ON HOLD.',`${score} found. ${Math.ceil(remaining)} seconds remain.`,'Resume search');status.textContent='Search paused.';draw();}
  function scanLot(){if(mode!=='playing'||scanCooldown>0)return;scan=3;scanCooldown=8;status.textContent='Spotlight on! Follow the green rings.';}
  scanButton.addEventListener('click',scanLot);
  musicButton.addEventListener('click',()=>{musicOn=!musicOn;musicButton.textContent=musicOn?'Music on':'Music off';musicButton.setAttribute('aria-pressed',String(musicOn));if(musicOn){document.querySelectorAll('video,audio').forEach(m=>m.pause());music.play().catch(()=>{musicOn=false;musicButton.textContent='Music off';musicButton.setAttribute('aria-pressed','false');status.textContent='Music could not load. Tap Music off to retry.';});}else music.pause();});
  start.addEventListener('click',play);pause.addEventListener('click',()=>mode==='playing'?pauseGame():mode==='paused'?play():null);
  const accepted=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d']);
  window.addEventListener('keydown',e=>{if(!root.contains(document.activeElement))return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(accepted.has(k)&&mode==='playing'){e.preventDefault();keys.add(k);}if(e.code==='Space'&&mode==='playing'&&document.activeElement===canvas){e.preventDefault();scanLot();}if(e.key==='Escape')pauseGame();});
  window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  root.querySelectorAll('[data-dir]').forEach(b=>{const d=b.dataset.dir;b.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(d);});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>touch.delete(d)));});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});window.addEventListener('blur',pauseGame);
  canvas.addEventListener('blur',()=>keys.clear());
  spawn();hud();draw();
})();
