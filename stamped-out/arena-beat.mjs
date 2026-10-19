// Analyze the playing media element, rather than guessing a tempo.
export class ArenaBeat{
 constructor(){this.context=null;this.analyser=null;this.data=null;this.level=0;this.pulse=0;this.average=.08;this.cooldown=0;this.failed=false;this.time=0;}
 connect(audio,Context=globalThis.AudioContext||globalThis.webkitAudioContext){
  if(this.failed||!Context)return;
  try{if(!this.context){this.context=new Context();const source=this.context.createMediaElementSource(audio);this.analyser=this.context.createAnalyser();this.analyser.fftSize=256;this.analyser.smoothingTimeConstant=.55;source.connect(this.analyser);this.analyser.connect(this.context.destination);this.data=new Uint8Array(this.analyser.frequencyBinCount);}
   Promise.resolve(this.context.resume()).catch(()=>{});
  }catch{this.failed=true;}
 }
 tick(dt,playing){this.cooldown=Math.max(0,this.cooldown-dt);this.pulse=Math.max(0,this.pulse-dt*3.5);if(!playing||!this.analyser){this.level*=Math.max(0,1-dt*7);return;}this.time+=dt;
  this.analyser.getByteFrequencyData(this.data);let sum=0;for(let i=1;i<9;i++)sum+=this.data[i]||0;const bass=sum/(8*255);this.average+=(bass-this.average)*Math.min(1,dt*1.7);this.level+=(bass-this.level)*Math.min(1,dt*12);
  if(bass>.12&&bass>this.average*1.18&&this.cooldown===0){this.pulse=Math.min(1,bass*1.5);this.cooldown=.18;}
 }
}

// Coordinates match the existing artwork in the fixed 1000 × 562.5 arena.
// Only these bounded regions deform: the floor, camera, fighters and HUD do not.
export const ARENA_REACTIONS={
 rooftop:{color:'#edb94e',cones:[[36,221,12,14],[36,257,15,17],[968,221,12,14],[968,257,15,17]],props:[[101,229,68,89,1.7],[737,181,83,86,1.7]],lights:[[326,217,17],[672,217,17],[499,226,79]]},
 studio:{color:'#c67bff',cones:[[246,140,19,21],[246,194,20,23],[328,176,10,12],[672,176,10,12],[755,140,19,21],[755,194,20,23]],props:[[403,192,68,87,2],[541,192,68,87,2],[947,156,51,140,1.6]],lights:[[396,173,24],[603,173,24]]},
 vault:{color:'#eac761',portable:true,cones:[],props:[[106,141,65,33,2.3],[273,165,58,34,2.2],[755,165,71,35,2.3],[857,138,68,33,2]],lights:[[96,75,20],[302,75,20],[742,74,20],[935,74,20]]},
 workshop:{color:'#c584ff',portable:true,cones:[],props:[[388,120,137,59,3.4],[703,150,111,61,3],[248,88,94,83,2.2],[848,84,81,95,2.2]],lights:[[59,56,23],[182,49,28],[576,62,27],[764,66,22],[870,51,27]]},
 blockparty:{color:'#ba86ff',cones:[[570,230,14,16],[570,267,14,15],[779,230,14,16],[779,267,14,15]],props:[[218,244,299,90,4],[755,247,197,85,3.5],[428,175,35,58,2.5],[885,151,33,60,2.5]],lights:[[620,187,12],[651,186,12],[694,187,12],[718,187,12]]},
 underground:{color:'#60efff',cones:[[330,194,15,16],[330,231,16,17],[673,194,15,16],[673,231,16,17]],props:[[359,222,280,42,2.1],[177,232,148,31,2],[681,233,126,31,2]],lights:[[166,110,24],[500,129,100],[835,109,24]]},
 motoryard:{color:'#edbc53',portable:true,cones:[],props:[[88,171,179,109,3.2],[610,219,244,71,3.6],[405,156,87,45,2.1],[443,244,56,34,1.8]],lights:[[388,43,21],[851,67,21],[965,48,21]]},
 penthouse:{color:'#eac761',cones:[[44,162,15,20],[39,228,9,14]],props:[[459,176,80,29,2],[244,161,44,32,1.6],[714,159,42,34,1.6],[944,172,55,36,1.7]],lights:[[302,87,22],[691,87,22],[499,99,73]]}
};
const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
export function arenaMotion(beat,reduced=false){
 if(reduced)return {energy:0,kick:0,vibration:0};
 const kick=clamp(beat?.pulse),energy=clamp(kick*.8+clamp(beat?.level)*.35);
 return {energy,kick,vibration:Math.sin((beat?.time||0)*48)*energy};
}
// Continuous row displacement leaves the top/bottom of each patch fixed. It
// animates the actual painted object, with no duplicate sprite or empty hole.
function moveProp(ctx,image,[x,y,w,h,lift],motion,index){
 const sx=image.naturalWidth/1000,sy=image.naturalHeight/562.5;
 const bend=t=>Math.sin(Math.PI*t)**2;
 const dy=t=>-lift*motion.kick*bend(t);
 for(let row=0;row<h;row+=4){const end=Math.min(h,row+4),a=row/h,b=end/h;
  const shift=motion.vibration*.65*bend((a+b)/2)*(index%2?1:-1);
  ctx.drawImage(image,x*sx,(y+row)*sy,w*sx,(end-row)*sy,x+shift,y+row+dy(a),w,end-row+dy(b)-dy(a));
 }
}
function cone(ctx,image,[x,y,rx,ry],motion,color){
 const {energy,kick,vibration}=motion;
 // The surround stays attached to its cabinet while the photographed cone
 // expands inside it, like a woofer moving forward on the bass transient.
 ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.clip();
 const zoom=1+kick*.2+vibration*.035,w=rx*2*zoom,h=ry*2*zoom;
 ctx.drawImage(image,(x-rx)*image.naturalWidth/1000,(y-ry)*image.naturalHeight/562.5,rx*2*image.naturalWidth/1000,ry*2*image.naturalHeight/562.5,x-w/2,y-h/2,w,h);ctx.restore();
 ctx.save();ctx.strokeStyle=color;ctx.lineWidth=.9;ctx.globalAlpha=energy*.4;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();
 // Short wave fronts originate at the real speaker, never at the player.
 for(let i=0;i<2;i++){const spread=1+kick*(.65+i*.5);ctx.globalAlpha=kick*(.16-i*.05);ctx.beginPath();ctx.ellipse(x,y,rx*spread,ry*spread,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
}
// Small touring cabinets supply visible sound sources in the vault, workshop
// and motor yard, whose paintings do not already contain speaker stacks.
function portable(ctx,x,motion,color){
 const y=281,dy=-motion.kick*1.6,dx=motion.vibration*.55;
 ctx.save();ctx.translate(x+dx,y+dy);ctx.fillStyle='#080910';ctx.fillRect(-18,-69,36,69);ctx.strokeStyle='#9b8250';ctx.lineWidth=1;ctx.strokeRect(-18,-69,36,69);
 ctx.fillStyle='#24242d';ctx.fillRect(-15,-66,30,63);ctx.fillStyle='#090910';ctx.fillRect(-13,-64,26,59);
 for(const cy of [-46,-20]){const r=10.5+motion.kick*1.6+motion.vibration*.3,g=ctx.createRadialGradient(-2,cy-2,1,0,cy,r);g.addColorStop(0,'#060609');g.addColorStop(.34,'#161722');g.addColorStop(.7,'#4c4148');g.addColorStop(1,'#09090d');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,cy,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=color;ctx.globalAlpha=.35+motion.energy*.4;ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='#0a090e';ctx.beginPath();ctx.arc(0,cy,3.5,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=color;ctx.globalAlpha=.7;ctx.fillRect(-10,-6,20,1);ctx.restore();
}
export function drawArenaBeat(ctx,image,beat,{reduced=false,arena='rooftop'}={}){
 if(!image?.complete||!image.naturalWidth||!image.naturalHeight)return;
 const scene=ARENA_REACTIONS[arena]||ARENA_REACTIONS.rooftop,motion=arenaMotion(beat,reduced);
 ctx.save();ctx.drawImage(image,0,0,1000,562.5);
 if(motion.energy>.005){
  scene.props.forEach((p,i)=>moveProp(ctx,image,p,motion,i));
  scene.cones.forEach(c=>cone(ctx,image,c,motion,scene.color));
  // Local, soft lighting only: no full-screen flashes or moving floor.
  ctx.save();ctx.globalCompositeOperation='screen';
  for(const [x,y,r] of scene.lights){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,scene.color+'55');g.addColorStop(1,scene.color+'00');ctx.globalAlpha=motion.energy*.44;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}ctx.restore();
 }
 if(scene.portable)for(const x of [35,965])portable(ctx,x,motion,scene.color);
 ctx.restore();
}
