export const TRACKS=[
 {id:'modest',title:'MODEST',file:'modest.m4a'},
 {id:'hustle',title:'HUSTLE',file:'hustle.m4a'},
 {id:'four-flat',title:'FOUR FLAT',file:'four-flat-v2.m4a'},
 {id:'money-machine',title:'MONEY MACHINE',file:'money-machine.m4a'},
 {id:'exquiste',title:'EXQUISTE',file:'exquiste.m4a'},
 {id:'one-night-stand',title:'ONE NIGHT STAND',file:'one-night-stand.m4a'},
 {id:'andalay',title:'ANDALAY',file:'andalay.m4a'},
 {id:'big-ole-bitties',title:'BIG OLE BITTIES',file:'big-ole-bitties.m4a'},
 {id:'bandz-on-your-kneez',title:'BANDZ ON YOUR KNEEZ',file:'bandz-on-your-kneez.m4a'},
 {id:'focus',title:'FOCUS',file:'focus.m4a'},
 {id:'pod-dat',title:'POD DAT',file:'pod-dat.m4a'},
 {id:'sky-is-tha-limit',title:'SKY IS THA LIMIT',file:'sky-is-tha-limit.m4a'},
 {id:'rain-down',title:'RAIN DOWN',file:'rain-down.m4a'},
 {id:'throw-it',title:'THROW IT',file:'throw-it.m4a'}
];
// A single lazy audio element prevents overlapping songs and avoids loading
// the full soundtrack before a phone player has selected a track.
export class Soundtrack {
 constructor(element,onChange=()=>{}){this.audio=element;this.audio.preload='none';this.audio.loop=true;this.audio.volume=.35;this.level=.35;this.duckTime=0;this.duckGain=1;this.onChange=onChange;this.selection='auto';this.enabled=true;this.unlocked=false;this.context='menu';this.match=0;this.current=null;this.suspended=false;this.status='idle';this.request=0;
  this.audio.addEventListener('error',()=>{this.status='unavailable';this.report();});
 }
 choose(){if(this.selection!=='auto')return TRACKS.find(t=>t.id===this.selection)||TRACKS[0];if(this.context==='training')return TRACKS[5];if(this.context==='menu')return TRACKS[0];const rotation=TRACKS.filter(t=>t.id!=='modest'&&t.id!=='one-night-stand');return rotation[this.match%rotation.length];}
 report(){this.onChange({track:this.current,status:this.status,enabled:this.enabled,volume:this.level,selection:this.selection});}
 async play(){const generation=++this.request;if(!this.enabled||!this.unlocked||this.suspended){this.audio.pause();this.status='paused';this.report();return;}
  const track=this.choose();if(this.current?.id!==track.id){this.audio.pause();this.audio.src='audio/'+track.file;this.current=track;}
  try{this.status='loading';this.report();await this.audio.play();if(generation!==this.request)return;this.status='playing';}catch{if(generation!==this.request)return;this.status='tap';}this.report();
 }
 unlock(){this.unlocked=true;return this.play();}
 beginMatch(context='fight',match=this.match){this.context=context;this.match=match;this.suspended=false;this.unlocked=true;try{this.audio.currentTime=0;}catch{}return this.play();}
 retry(){if(this.status==='tap'||this.status==='unavailable'){if(this.status==='unavailable')this.current=null;this.unlocked=true;return this.play();}}
 setScene(context,match=this.match){this.context=context;this.match=match;return this.play();}
 select(id){this.selection=id==='auto'||TRACKS.some(t=>t.id===id)?id:'auto';return this.play();}
 toggle(){this.enabled=!this.enabled;this.unlocked=true;return this.play();}
 volume(value){this.level=Math.max(0,Math.min(1,Number(value)||0));this.audio.volume=this.level;this.report();}
 duck(gain=.25,seconds=.6){if(seconds<=0){this.duckGain=1;this.duckTime=0;return;}const next=Math.max(0,Math.min(1,gain));this.duckGain=this.duckTime>0?Math.min(this.duckGain,next):next;this.duckTime=Math.max(this.duckTime,seconds);}
 tick(dt){this.duckTime=Math.max(0,this.duckTime-dt);const target=this.level*(this.duckTime>0?this.duckGain:1);this.audio.volume+=(target-this.audio.volume)*Math.min(1,dt*(this.duckTime>0?18:4));}
 suspend(){this.suspended=true;return this.play();}
 resume(){this.suspended=false;return this.play();}
}
