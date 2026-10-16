// Only the knockout announcer uses speech. Fighters have no spoken lines or
// vocal grunts; impacts and music are independent audio layers.
export class KOAnnouncer{
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,duck=()=>{}}={}){
  Object.assign(this,{synth,Utterance,duck,enabled:true,unlocked:false,announced:false,utterance:null});
 }
 get available(){return !!(this.synth&&this.Utterance);}
 unlock(){this.unlocked=true;}
 setEnabled(value){this.enabled=!!value;if(!this.enabled)this.stop();}
 stop(){this.utterance=null;try{this.synth?.cancel();}catch{}}
 reset(){this.stop();this.announced=false;}
 event(e){if(e.type==='round'){this.reset();return false;}if(!['roundover','matchover'].includes(e.type)||!e.knockout||this.announced)return false;this.announced=true;return this.announce();}
 announce(){if(!this.available||!this.enabled||!this.unlocked)return false;this.stop();try{
  const u=new this.Utterance('K. O.!');u.lang='en-US';u.pitch=.72;u.rate=.85;u.volume=.95;
  const voices=this.synth.getVoices?.()||[],voice=voices.find(v=>v.lang==='en-US'&&v.default)||voices.find(v=>v.lang==='en-US');if(voice)u.voice=voice;
  this.utterance=u;const done=()=>{if(this.utterance===u)this.utterance=null;};u.onend=done;u.onerror=done;this.duck(.25,1.5);this.synth.speak(u);return true;
 }catch{this.utterance=null;return false;}}
}
