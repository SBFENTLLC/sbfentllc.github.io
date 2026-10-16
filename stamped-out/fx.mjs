import {moveFor} from './roster.mjs';
import {SPRITES} from './sprites.mjs';
import {SPRITE_HULLS} from './sprite-hulls.mjs';
import {MASK_SPANS} from './sprite-masks.mjs';
import {sequenceFighters} from './choreography.mjs';
const MASK_PATHS=typeof Path2D==='undefined'?null:MASK_SPANS.map(frames=>frames.map(spans=>{const p=new Path2D();for(const [y,x,w] of spans)p.rect(x,y,w,1);return p;}));
const NAMES=['FLEX A LOT','THE BOOTLEGGER'];
const SUPERS=['STAMPED OUT','COUNTERFEIT COMBO'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class FightFX {
 constructor(atlas,reduced=false){this.atlas=atlas;this.reduced=reduced;this.reset();}
 reset(){this.time=0;this.particles=[];this.impacts=[];this.labels=[];this.flashes=[0,0];this.stop=0;this.shake=0;this.cinematic=null;this.finish=null;this.combo=null;this.ghosts=[];this.ghostTime=0;this.sequence=null;this.slow=0;this.intro=null;}
 get frozen(){return this.stop>0||this.cinematic!==null;}
 event(e,fighters){
  if(e.type==='koImpact'){this.stop=.12;this.slow=.9;this.shake=this.reduced?0:18;return;}
  if(e.type==='super'){this.cinematic={id:e.id,elapsed:0,duration:2.25};return;}
  if(e.type==='throwEscape'){this.labels.push({x:500,y:200,life:.9,text:'THROW ESCAPED',color:'#a3ffd9'});return;}
  if(e.type==='grabbed'){this.stop=.055;return;}
  if(e.type==='round'){this.finish=null;this.ghosts=[];this.intro={elapsed:0,duration:1.6,round:e.round};return;}
  if(e.type==='roundover'||e.type==='matchover'){this.finish={...e,elapsed:0};if(e.knockout){this.stop=.1;this.shake=this.reduced?0:16;}return;}
  if(e.type!=='hit'&&e.type!=='block')return;
  const heavy=e.move==='special'||e.move==='throw',blocked=e.type==='block',face=e.face??fighters[e.id].face;
  const victim=e.sequence?fighters[e.target]:null;
  const x=(victim?.x??e.x)-face*25,y=e.final?465:510-(victim?.y??e.y)-(e.move==='kick'?175:145),color=blocked?'#a3ffd9':heavy?'#d997ff':'#ffe180';
  this.stop=blocked?.025:heavy?.08:e.move==='kick'?.055:.04;
  this.shake=this.reduced?0:blocked?2:heavy?17:e.move==='kick'?9:6;
  this.flashes[e.target??1-e.id]=blocked?0:.14;
  this.impacts.push({x,y,color,blocked,heavy,face,life:heavy?.65:.35,max:heavy?.65:.35,seed:Math.random()*6});
  this.impacts=this.impacts.slice(-12);
  const count=this.reduced?5:heavy?35:18;
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=100+Math.random()*(heavy?500:300);this.particles.push({x,y,vx:Math.cos(a)*s+face*70,vy:Math.sin(a)*s-60,life:.25+Math.random()*.3,color,size:2+Math.random()*4});}
  this.particles=this.particles.slice(-160);
  this.labels.push({x,y:y-35,life:.75,text:blocked?'BLOCK':'−'+e.damage,color});
  if(e.counter||e.punish)this.labels.push({x,y:y-65,life:1,text:e.counter?'COUNTER HIT':'PUNISH',color:'#cfff66'});
  if(e.combo>=2)this.combo={id:e.id,count:e.combo,life:.9};
 }
 tick(dt,fighters=[]){
  this.time+=dt;this.slow=Math.max(0,this.slow-dt);this.stop=Math.max(0,this.stop-dt);this.shake=Math.max(0,this.shake-40*dt);
  if(this.intro){this.intro.elapsed+=dt;if(this.intro.elapsed>=this.intro.duration)this.intro=null;}
  if(this.cinematic){this.cinematic.elapsed+=dt;if(this.cinematic.elapsed>=this.cinematic.duration)this.cinematic=null;}
  if(this.finish)this.finish.elapsed+=dt*(this.finish.knockout&&this.finish.elapsed<.75?.32:1);
  this.flashes=this.flashes.map(n=>Math.max(0,n-dt));
  const effectDt=this.finish?.knockout&&this.finish.elapsed<.75?dt*.32:dt;
  for(const p of this.particles){p.life-=effectDt;p.x+=p.vx*effectDt;p.y+=p.vy*effectDt;p.vy+=550*effectDt;}this.particles=this.particles.filter(p=>p.life>0);
  for(const p of this.impacts)p.life-=effectDt;this.impacts=this.impacts.filter(p=>p.life>0);
  for(const p of this.labels){p.life-=dt;p.y-=45*dt;}this.labels=this.labels.filter(p=>p.life>0);
  if(this.combo){this.combo.life-=dt;if(this.combo.life<=0)this.combo=null;}
  for(const g of this.ghosts)g.life-=dt;this.ghosts=this.ghosts.filter(g=>g.life>0);
  this.ghostTime-=dt;if(!this.reduced&&!this.finish&&!this.cinematic&&!this.sequence&&this.ghostTime<=0){this.ghostTime=.045;for(const f of fighters)if(f.walking||f.move)this.ghosts.push({f:{...f,move:f.move?{...f.move}:null},life:.18});this.ghosts=this.ghosts.slice(-12);}
 }
 frame(f){if(f.pose!==undefined)return f.pose;if(f.knockdown>0)return 5;if(f.stun>0||this.finish?.knockout&&this.finish.winner!==f.id)return 5;if(this.finish?.winner===f.id&&this.finish.elapsed>.8)return f.id===0?7:4;if(f.move){const m=moveFor(f.id,f.move.name);return f.move.t<(f.move.wind??m.wind)*.65||f.move.t>(f.move.wind??m.wind)+m.active+m.recovery*.55?0:({punch:2,kick:3,special:7,grab:2}[f.move.name]);}return f.block?4:f.y>0?6:f.walking&&Math.floor(this.time*(f.id===0?10:7))%2?1:0;}
 setGrapples(atlas,data){this.grappleAtlas=atlas;this.grappleData=data;this.grapplePaths=typeof Path2D==='undefined'?null:data.masks.map(frames=>frames.map(spans=>{const path=new Path2D();for(const [y,x,w] of spans)path.rect(x,y,w,1);return path;}));}
 rawSprite(ctx,f,frame=this.frame(f),alpha=1){
  const grappling=f.grapplePose!==undefined&&this.grappleAtlas?.naturalWidth&&this.grappleData;
  const img=grappling?this.grappleAtlas:this.atlas;if(!img.complete||!img.naturalWidth)return;
  const [sx,sy,sw,sh]=grappling?this.grappleData.boxes[f.id][f.grapplePose]:SPRITES[f.id][frame];
  const scale=grappling?this.grappleData.scale:.96,offset=grappling?0:frame===2||frame===7?35:frame===3?48:0;
  let rotation=f.rotation||0,fall=0;
  if(!this.reduced&&f.rotation===undefined&&!this.finish&&f.knockdown<=0&&f.pose===undefined){
   if(f.stun>0)rotation=-f.face*.12*Math.min(1,f.stun/.14);
   else if(f.move){const m=moveFor(f.id,f.move.name),t=f.move.t,wind=f.move.wind??m.wind;rotation=f.face*(t<wind?-.045*(t/wind):.07*Math.max(0,1-(t-wind)/(m.active+m.recovery)));}
   else if(f.walking)rotation=f.face*.025;
  }
  if(f.rotation===undefined&&((this.finish?.knockout&&this.finish.winner!==f.id)||f.knockdown>0)){fall=this.finish?(this.finish.finisher?1:clamp((this.finish.elapsed-.12)/.6,0,1)):clamp(f.knockdown/.25,0,1);rotation=2.3*fall*f.face;}
  const width=sw*scale,height=sh*scale,dx=-width/2+offset;
  // Align the rotated sprite's lowest corner with its trajectory. A throw
  // should never push the victim's head beneath the arena floor.
  const hull=grappling?SPRITE_HULLS.grapple[f.id][f.grapplePose]:SPRITE_HULLS.normal[f.id][frame];
  const corners=hull.map(([x,y])=>(dx+x*scale)*f.face*Math.sin(rotation)+(-height+y*scale)*Math.cos(rotation));
  const bottom=Math.max(...corners),projectedHeight=bottom-Math.min(...corners);
  const flightY=Math.min(f.y,Math.max(0,510-70-projectedHeight));
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(f.x,510-flightY-bottom);ctx.rotate(rotation);ctx.scale(f.face,1);
  if(!this.reduced&&!rotation&&!f.move&&!f.stun&&!f.walking&&!f.knockdown&&!this.sequence&&!this.finish)ctx.scale(1,1+Math.sin(this.time*(f.id===0?3.8:2.6))*.006);
  if(f.crouch)ctx.scale(1,.72);
  if(this.flashes[f.id]>0)ctx.filter='brightness(1.65) saturate(.6)';
  ctx.translate(dx,-height);ctx.scale(scale,scale);
  const paths=grappling?this.grapplePaths:MASK_PATHS,spans=grappling?this.grappleData.masks[f.id][f.grapplePose]:MASK_SPANS[f.id][frame];
  if(paths)ctx.clip(paths[f.id][grappling?f.grapplePose:frame]);else{ctx.beginPath();for(const [y,x,w] of spans)ctx.rect(x,y,w,1);ctx.clip();}
  ctx.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);ctx.restore();
 }
 before(ctx){
  if(this.finish?.knockout){ctx.fillStyle='#17062455';ctx.fillRect(0,0,1000,562.5);}
  if(!this.reduced)for(const g of this.ghosts){ctx.save();ctx.filter='brightness(1.5) sepia(1) saturate(3) hue-rotate(210deg)';this.rawSprite(ctx,g.f,this.frame(g.f),g.life/.18*.25);ctx.restore();}
 }
 attackTrail(ctx,f){
  if(!f.move||f.move.name==='grab')return;const m=f.move.name,elapsed=f.move.t-(f.move.wind??moveFor(f.id,m).wind),active=moveFor(f.id,m).active;
  if(elapsed<-.05||elapsed>active+.15)return;
  const p=clamp((elapsed+.05)/(active+.2),0,1),special=m==='special',kick=m==='kick';
  ctx.save();ctx.translate(f.x,510-f.y);ctx.scale(f.face,1);ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.sin(p*Math.PI)*.85;
  ctx.strokeStyle=special?'#d68cff':kick?'#ffe693':'#e7ffaf';ctx.lineWidth=special?15:kick?10:6;ctx.shadowBlur=special?25:12;ctx.shadowColor=ctx.strokeStyle;
  ctx.beginPath();ctx.ellipse(40,kick?-175:-145,special?205:kick?135:95,special?60:kick?70:22,-.15,-1.35,1.15);ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke();
  if(special){const g=ctx.createRadialGradient(150,-140,3,150,-140,130);g.addColorStop(0,'#f6e7ffdd');g.addColorStop(.25,'#b556ffc0');g.addColorStop(1,'#a332ff00');ctx.fillStyle=g;ctx.fillRect(20,-270,260,260);}
  if(special&&f.id===1){for(let copy=1;copy<=2;copy++){ctx.save();ctx.globalAlpha=.28;this.rawSprite(ctx,{...f,x:copy*80,y:510,face:1},2,.28);ctx.restore();}}
  ctx.restore();
 }
 after(ctx,fighters=[]){
  for(const f of fighters)this.attackTrail(ctx,f);
  for(const p of this.impacts){
   const progress=1-p.life/p.max,r=(p.heavy?110:65)*(.25+progress);ctx.save();ctx.translate(p.x,p.y);ctx.globalCompositeOperation='screen';ctx.globalAlpha=1-progress;ctx.fillStyle=p.color;ctx.strokeStyle=p.color;
   if(!p.blocked){ctx.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2+p.seed,len=i%2?r*.28:r*(.7+(i%3)*.15);i?ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len):ctx.moveTo(Math.cos(a)*len,Math.sin(a)*len);}ctx.closePath();ctx.fill();ctx.fillStyle='#fff9df';ctx.beginPath();ctx.arc(0,0,Math.max(2,18*(1-progress)),0,Math.PI*2);ctx.fill();}
   ctx.lineWidth=p.blocked?5:3;ctx.beginPath();ctx.ellipse(0,0,r*1.2,r*.65,-.3,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  ctx.save();ctx.globalCompositeOperation='screen';for(const p of this.particles){ctx.globalAlpha=clamp(p.life*3,0,1);ctx.strokeStyle=p.color;ctx.lineWidth=p.size;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.025,p.y-p.vy*.025);ctx.stroke();}ctx.restore();
  ctx.save();ctx.font='italic 900 23px Arial';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1a0d26';for(const p of this.labels){ctx.globalAlpha=clamp(p.life*3,0,1);ctx.strokeText(p.text,p.x,p.y);ctx.fillStyle=p.color;ctx.fillText(p.text,p.x,p.y);}ctx.restore();

 }
 overlay(ctx,fighters){if(this.sequence)this.drawSequence(ctx,fighters);if(this.cinematic)this.drawSuper(ctx,fighters);if(this.intro)this.drawIntro(ctx);if(this.finish?.winner>=0&&this.finish.elapsed>.85)this.drawVictory(ctx);}
 drawIntro(ctx){const t=this.intro,opacity=Math.min(1,t.elapsed/.15,(t.duration-t.elapsed)/.25);ctx.save();ctx.globalAlpha=opacity;ctx.textAlign='center';
  for(let i=0;i<2;i++){const x=i===0?245:755;ctx.fillStyle='#10091be6';ctx.fillRect(x-220,145,440,78);ctx.fillStyle=i===0?'#d2ff70':'#ffbd79';ctx.font='italic 900 25px Arial';ctx.fillText(NAMES[i],x,173);ctx.fillStyle='#eedff5';ctx.font='900 12px Arial';ctx.fillText(i===0?'“REAL STAMP. REAL HANDS.”':'“EVERY ORIGINAL HAS A COPY.”',x,198);}
  ctx.restore();
 }
 drawVictory(ctx){const id=this.finish.winner;ctx.save();ctx.globalAlpha=clamp((this.finish.elapsed-.85)/.3,0,1);ctx.fillStyle='#0e071dcc';ctx.fillRect(180,145,640,68);ctx.textAlign='center';ctx.fillStyle=id===0?'#d2ff70':'#ffbd79';ctx.font='italic 900 24px Arial';ctx.fillText(NAMES[id]+' WINS',500,173);ctx.fillStyle='#f6e3fa';ctx.font='900 12px Arial';ctx.fillText(id===0?'“YOU CAN’T COUNTERFEIT THIS.”':'“LOOKS REAL ENOUGH TO ME.”',500,197);ctx.restore();}
 camera(ctx,fighters){
  if(this.reduced)return;const active=this.sequence||this.finish?.knockout;
  if(!active)return;const center=this.sequence?.center??((fighters[0]?.x??400)+(fighters[1]?.x??600))/2;
  const zoom=this.sequence?.kind==='super'?1.08:this.finish?1.11:1.035;
  ctx.translate(center,340);ctx.scale(zoom,zoom);ctx.translate(-center,-340);
 }
 drawSequence(ctx,fighters){
  const s=this.sequence;if(!s)return;const special=s.kind==='super',color=s.id===0?'#d6ff63':'#ffb05e';
  ctx.save();ctx.fillStyle='#080313cc';ctx.fillRect(0,0,1000,46);ctx.fillRect(0,526,1000,37);
  ctx.font='italic 900 22px Arial';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(special?SUPERS[s.id]:'GRAB & THROW',500,32);
  ctx.font='900 11px Arial';ctx.fillStyle='#f5e4ff';ctx.fillText(special?'SBFENT SIGNATURE COMBO':s.elapsed<.3?'TAP GRAB TO ESCAPE':'SLAM INCOMING',500,549);
  if(special&&s.id===1&&s.elapsed<1.95&&!this.reduced){
   for(const direction of [-1,1]){const clone={...fighters[s.id],x:s.center+direction*155,y:0,face:-direction,pose:2,grapplePose:undefined};ctx.save();ctx.filter='sepia(1) saturate(3) hue-rotate(230deg)';this.rawSprite(ctx,clone,2,.23);ctx.restore();}
  }
  const finalAt=special?(s.id===0?2.65:2.7):.82,age=s.elapsed-finalAt;
  if(age>=0&&age<.55){
   const x=s.center+s.face*175,r=35+age*300;ctx.strokeStyle=color;ctx.lineWidth=5*(1-age/.55);ctx.globalAlpha=1-age/.55;
   ctx.beginPath();ctx.ellipse(x,500,r,r*.2,0,0,Math.PI*2);ctx.stroke();
   if(special&&s.id===0){ctx.save();ctx.translate(x,410-age*40);ctx.fillStyle='#e8ff88';ctx.beginPath();ctx.moveTo(-45,-40);ctx.lineTo(-30,0);ctx.lineTo(30,0);ctx.lineTo(45,-40);ctx.lineTo(15,-20);ctx.lineTo(0,-55);ctx.lineTo(-15,-20);ctx.closePath();ctx.fill();ctx.restore();}
   ctx.lineWidth=2;for(let i=0;i<7;i++){const a=i*Math.PI/3.5;ctx.beginPath();ctx.moveTo(x,500);ctx.lineTo(x+Math.cos(a)*r,500+Math.sin(a)*r*.2);ctx.stroke();}
  }
  ctx.restore();
 }
 drawSuper(ctx,fighters){
  const c=this.cinematic,f=fighters[c.id];if(!f)return;
  const p=c.elapsed/c.duration,entry=clamp(p/.18,0,1),exit=clamp((1-p)/.15,0,1),opacity=Math.min(entry,exit);
  ctx.save();ctx.fillStyle=`rgba(10,2,25,${.8*opacity})`;ctx.fillRect(0,0,1000,562.5);
  const purple=c.id===0?'#b8ff42':'#ff9c35';
  // Diagonal entry and exit panels frame the arena without rapid flashes.
  ctx.globalAlpha=opacity;ctx.fillStyle='#170b32';ctx.beginPath();ctx.moveTo(0,55);ctx.lineTo(1000,10);ctx.lineTo(1000,440);ctx.lineTo(0,500);ctx.closePath();ctx.fill();
  ctx.strokeStyle=purple;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,55);ctx.lineTo(1000,10);ctx.moveTo(0,500);ctx.lineTo(1000,440);ctx.stroke();
  const beat=this.reduced?1:1+Math.sin(c.elapsed*9)*.07,cx=c.id===0?340:660;
  const g=ctx.createRadialGradient(cx,300,15,cx,300,230*beat);g.addColorStop(0,'#fff2b5aa');g.addColorStop(.35,purple+'99');g.addColorStop(1,purple+'00');ctx.fillStyle=g;ctx.fillRect(0,50,1000,450);
  // Energy lines scroll smoothly toward the power-up portrait.
  if(!this.reduced){ctx.save();ctx.globalAlpha=.45;ctx.strokeStyle=purple;ctx.lineWidth=2;for(let i=0;i<18;i++){const y=65+i*22,x=(i*117+c.elapsed*370)%1250-125;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+130,y-8);ctx.stroke();}ctx.restore();}
  ctx.save();ctx.translate(cx,480);ctx.scale(1.2*beat,1.2*beat);this.rawSprite(ctx,{...f,x:0,y:510,face:c.id===0?1:-1,stun:0,move:null},p<.64?4:7,1);ctx.restore();
  if(!this.reduced){ctx.save();ctx.strokeStyle='#e9bbff';ctx.lineWidth=3;for(let i=0;i<5;i++){const a=c.elapsed*1.2+i*1.26;ctx.beginPath();for(let j=0;j<7;j++){const radius=70+j*21,x=cx+Math.cos(a)*radius+Math.sin(j*3+c.elapsed*5)*12,y=300+Math.sin(a)*radius;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}ctx.restore();}
  ctx.textAlign=c.id===0?'right':'left';const tx=c.id===0?940:60;
  ctx.font='900 16px Arial';ctx.fillStyle='#e5d2ff';ctx.fillText('S T A M P   P O W E R',tx,190);
  ctx.font='italic 900 32px Arial';ctx.fillStyle='#ffe5a1';ctx.fillText(NAMES[c.id],tx,235);
  ctx.font='italic 900 40px Arial';ctx.strokeStyle='#160622';ctx.lineWidth=6;ctx.strokeText(SUPERS[c.id],tx,300);ctx.fillStyle=p>.65?'#d5ff69':'#fff';ctx.fillText(SUPERS[c.id],tx,300);
  ctx.font='900 14px Arial';ctx.fillStyle='#d8bcf3';ctx.fillText(p<.62?'POWERING UP…':'STAMP UNLEASHED',tx,345);
  ctx.restore();
 }
}
