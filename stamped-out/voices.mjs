import {FIGHTERS} from './roster.mjs';
// Device speech is a temporary delivery layer; lines remain visible in the
// intro/win cards. No voice cloning, remote requests, or speech recognition.
export const VOICE_PROFILES=[
 {pitch:.94,rate:1.12,base:125,formant:650}, {pitch:.78,rate:1.04,base:100,formant:540},
 {pitch:1.17,rate:1.13,base:205,formant:850}, {pitch:1.08,rate:1.10,base:190,formant:790},
 {pitch:.84,rate:.97,base:108,formant:570}, {pitch:.76,rate:.98,base:96,formant:510},
 {pitch:.96,rate:1.13,base:140,formant:720}, {pitch:.83,rate:.92,base:115,formant:610},
 {pitch:1.22,rate:1.18,base:215,formant:920}, {pitch:.70,rate:.94,base:85,formant:470},
 {pitch:1.12,rate:1.07,base:195,formant:810}, {pitch:1.03,rate:1.17,base:150,formant:740},
 {pitch:.65,rate:.91,base:78,formant:430}, {pitch:1.18,rate:1.08,base:210,formant:960},
 {pitch:.72,rate:.93,base:90,formant:490}
];
export class FighterVoices{
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,context=()=>null,duck=()=>{},clock=()=>performance.now()/1000}={}){
  Object.assign(this,{synth,Utterance,context,duck,clock,enabled:true,unlocked:false,generation:0,queue:[],busy:false,lastGrunt:[-100,-100],utterance:null});this.refresh=()=>{try{this.availableVoices=(this.synth?.getVoices?.()||[]).filter(v=>/^en\b/i.test(v.lang)).sort((a,b)=>a.name.localeCompare(b.name));}catch{this.availableVoices=[];}};this.refresh();this.synth?.addEventListener?.('voiceschanged',this.refresh);
 }
 get available(){return !!(this.synth&&this.Utterance);}
 unlock(){this.unlocked=true;this.refresh();}
 setEnabled(value){this.enabled=!!value;if(!this.enabled)this.stop();}
 stop(){this.generation++;this.queue=[];this.busy=false;this.utterance=null;try{this.synth?.cancel();}catch{}}
 lines(lines){this.stop();if(!this.available||!this.enabled||!this.unlocked)return false;this.queue=lines.slice(0,2).filter(l=>FIGHTERS[l.character]&&typeof l.text==='string');this.next();return true;}
 say(character,kind){const f=FIGHTERS[character];return f?this.lines([{character,text:kind==='win'?f.victory:kind==='special'?f.special:f.quote}]):false;}
 next(){if(this.busy||!this.queue.length)return;const {character,text}=this.queue.shift(),p=VOICE_PROFILES[character],generation=this.generation;try{
  const u=new this.Utterance(text);u.lang='en-US';u.pitch=p.pitch;u.rate=p.rate;u.volume=.85;if(this.availableVoices.length)u.voice=this.availableVoices[character%this.availableVoices.length];this.busy=true;this.utterance=u;
  const done=()=>{if(generation!==this.generation||this.utterance!==u)return;this.busy=false;this.utterance=null;this.next();};u.onend=done;u.onerror=done;this.duck(.42,Math.min(5,text.length*.055+.5));this.synth.speak(u);
 }catch{this.busy=false;this.utterance=null;this.queue=[];}}
 grunt(character,slot,heavy=false){if(!this.enabled||!this.unlocked)return false;const c=this.context(),p=VOICE_PROFILES[character],now=this.clock();if(!c||c.state==='suspended'||!p||now-this.lastGrunt[slot]<.2)return false;this.lastGrunt[slot]=now;try{
  const t=c.currentTime,length=heavy?.34:.19,source=c.createOscillator(),gain=c.createGain();source.type='sawtooth';source.frequency.setValueAtTime(p.base*(heavy?.85:1.12),t);source.frequency.exponentialRampToValueAtTime(p.base*.66,t+length);
  gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.10,t+.018);gain.gain.exponentialRampToValueAtTime(.001,t+length);gain.connect(c.destination);
  for(const [frequency,level] of [[p.formant,.65],[p.formant*2.15,.25]]){const f=c.createBiquadFilter(),g=c.createGain();f.type='bandpass';f.frequency.value=frequency;f.Q.value=5;g.gain.value=level;source.connect(f);f.connect(g);g.connect(gain);}
  source.start(t);source.stop(t+length+.02);source.onended=()=>{source.disconnect();gain.disconnect();};this.duck(.72,length);return true;
 }catch{return false;}}
}
