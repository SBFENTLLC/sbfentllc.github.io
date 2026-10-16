// Synthesized layers are created only after a player gesture. No extra assets
// or long-running audio nodes; every transient has a bounded lifetime.
export class CombatAudio {
 constructor(){this.context=null;}
 unlock(){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();this.context.resume();}catch{}}
 play(kind,heavy=false,id=0){const c=this.context;if(!c||c.state==='suspended')return;try{
  const now=c.currentTime,master=c.createGain();master.gain.value=.16;master.connect(c.destination);
  const tone=(type,start,end,length,level)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(start,now);o.frequency.exponentialRampToValueAtTime(end,now+length);g.gain.setValueAtTime(level,now);g.gain.exponentialRampToValueAtTime(.001,now+length);o.connect(g);g.connect(master);o.start();o.stop(now+length+.02);};
  if(kind==='super'){tone('sine',95,360,.55,.55);tone('triangle',190,720,.5,.14);}
  else if(kind==='ko'){tone('sine',70,22,.65,.9);tone('triangle',140,35,.45,.3);}
  else if(kind==='fight'){tone('triangle',220,440,.14,.25);}
  else if(kind==='block'){tone('triangle',540,210,.1,.3);}
  else if(kind==='escape'){tone('sine',420,780,.15,.3);}
  else tone('sine',heavy?95:170,heavy?24:65,heavy?.3:.12,heavy?.85:.5);
  if(kind==='hit'||kind==='block'||kind==='ko'){
   const length=heavy?.18:.07,b=c.createBuffer(1,Math.ceil(c.sampleRate*length),c.sampleRate),a=b.getChannelData(0);
   for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);
   const n=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();n.buffer=b;filter.type=kind==='block'?'highpass':'lowpass';filter.frequency.value=kind==='block'?1600:heavy?1800:3200;g.gain.value=heavy?.5:.3;
   n.connect(filter);filter.connect(g);g.connect(master);n.start();
  }
  // Release the shared gain after all scheduled sources have finished.
  setTimeout(()=>master.disconnect(),900);
 }catch{}}
}
