// Analyze the playing media element, rather than guessing a tempo.
export class ArenaBeat{
 constructor(){this.context=null;this.analyser=null;this.data=null;this.level=0;this.pulse=0;this.average=.08;this.cooldown=0;this.failed=false;}
 connect(audio,Context=globalThis.AudioContext||globalThis.webkitAudioContext){
  if(this.failed||!Context)return;
  try{if(!this.context){this.context=new Context();const source=this.context.createMediaElementSource(audio);this.analyser=this.context.createAnalyser();this.analyser.fftSize=256;this.analyser.smoothingTimeConstant=.55;source.connect(this.analyser);this.analyser.connect(this.context.destination);this.data=new Uint8Array(this.analyser.frequencyBinCount);}
   Promise.resolve(this.context.resume()).catch(()=>{});
  }catch{this.failed=true;}
 }
 tick(dt,playing){this.cooldown=Math.max(0,this.cooldown-dt);this.pulse=Math.max(0,this.pulse-dt*3.5);if(!playing||!this.analyser){this.level*=Math.max(0,1-dt*7);return;}
  this.analyser.getByteFrequencyData(this.data);let sum=0;for(let i=1;i<9;i++)sum+=this.data[i]||0;const bass=sum/(8*255);this.average+=(bass-this.average)*Math.min(1,dt*1.7);this.level+=(bass-this.level)*Math.min(1,dt*12);
  if(bass>.12&&bass>this.average*1.18&&this.cooldown===0){this.pulse=Math.min(1,bass*1.5);this.cooldown=.18;}
 }
}
export function drawArenaBeat(ctx,image,beat,{reduced=false,color='#bcff65'}={}){
 const pulse=reduced?0:Math.min(1,(beat?.pulse||0)*.65+(beat?.level||0)*.35),s=1+pulse*.012;
 ctx.save();ctx.translate(500,510);ctx.scale(s,s);if(image?.complete&&image.naturalWidth)ctx.drawImage(image,-500,-510,1000,562.5);ctx.restore();
 if(pulse<.015)return;
 ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=pulse*.24;ctx.lineWidth=2;
 for(const x of [65,935]){ctx.beginPath();ctx.ellipse(x,330,24+pulse*30,45+pulse*42,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<7;i++)ctx.fillRect(x-34+i*10,435,5,-(12+((i*17)%30))*pulse);}
 ctx.globalAlpha=pulse*.2;ctx.beginPath();ctx.ellipse(500,505,240+pulse*220,12+pulse*20,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
