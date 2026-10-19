import {ArenaBeat} from './arena-beat.mjs';
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
// Every arena has a distinct ordered mix. A per-arena cursor survives menus,
// rematches and reloads; the ended event advances the same mix during long fights.
export const ARENA_MIXES={
 rooftop:['hustle','four-flat','sky-is-tha-limit','focus'],
 studio:['modest','pod-dat','one-night-stand','exquiste'],
 vault:['money-machine','bandz-on-your-kneez','four-flat','modest'],
 workshop:['throw-it','andalay','hustle','pod-dat'],
 blockparty:['big-ole-bitties','andalay','throw-it','bandz-on-your-kneez'],
 underground:['exquiste','focus','pod-dat','rain-down'],
 motoryard:['four-flat','hustle','sky-is-tha-limit','throw-it'],
 penthouse:['sky-is-tha-limit','rain-down','money-machine','one-night-stand']
};
// A single lazy audio element prevents overlapping songs and avoids loading
// the full soundtrack before a phone player has selected a track.
export class Soundtrack {
 constructor(element,onChange=()=>{},storage=null){this.mix=null;this.dropPulse=0;this.dropRecover=0;this.beat=new ArenaBeat();this.audio=element;this.audio.preload='none';this.audio.loop=true;this.audio.volume=.35;this.level=.35;this.duckTime=0;this.duckGain=1;this.onChange=onChange;this.selection='auto';this.enabled=true;this.unlocked=false;this.context='menu';this.match=0;this.current=null;this.suspended=false;this.status='idle';this.request=0;this.arena=null;this.arenaVisits={};this.arenaIndex=0;this.storage=storage;try{const saved=JSON.parse(storage?.getItem('sbfent-arena-mixes'));for(const key of Object.keys(ARENA_MIXES))if(Number.isInteger(saved?.[key])&&saved[key]>=0)this.arenaVisits[key]=saved[key]%100000;}catch{}
  this.audio.addEventListener('ended',()=>{if(this.selection==='auto'&&this.context==='fight'&&this.arena&&!this.suspended&&this.enabled){this.arenaIndex=(this.arenaIndex+1)%ARENA_MIXES[this.arena].length;this.arenaVisits[this.arena]++;this.persistMixes();this.play();}});
  this.audio.addEventListener('error',()=>{this.status='unavailable';this.report();});
 }
 choose(){if(this.selection!=='auto')return TRACKS.find(t=>t.id===this.selection)||TRACKS[0];if(this.context==='training')return TRACKS[5];if(this.context==='menu')return TRACKS[0];if(this.arena){const mix=ARENA_MIXES[this.arena];return TRACKS.find(t=>t.id===mix[this.arenaIndex%mix.length]);}const rotation=TRACKS.filter(t=>t.id!=='modest'&&t.id!=='one-night-stand');return rotation[this.match%rotation.length];}
 report(){this.onChange({track:this.current,status:this.status,enabled:this.enabled,volume:this.level,selection:this.selection});}
 persistMixes(){try{this.storage?.setItem('sbfent-arena-mixes',JSON.stringify(this.arenaVisits));}catch{}}
 async play(){if(!this.enabled||this.suspended)this.endMix();this.audio.loop=!(this.context==='fight'&&this.selection==='auto'&&this.arena);const generation=++this.request;if(!this.enabled||!this.unlocked||this.suspended){this.audio.pause();this.status='paused';this.report();return;}
  const track=this.choose();if(this.current?.id!==track.id){this.audio.pause();this.audio.src='audio/'+track.file;this.current=track;}
  try{this.status='loading';this.report();await this.audio.play();if(generation!==this.request)return;this.status='playing';}catch{if(generation!==this.request)return;this.status='tap';}this.report();
 }
 unlock(){this.beat.connect(this.audio);this.unlocked=true;return this.play();}
 beginMatch(context='fight',match=this.match,arena=null){this.endMix();this.dropPulse=0;this.beat.connect(this.audio);this.context=context;this.match=match;this.arena=ARENA_MIXES[arena]?arena:null;if(this.arena&&context==='fight'){this.arenaIndex=(this.arenaVisits[this.arena]||0)%ARENA_MIXES[this.arena].length;this.arenaVisits[this.arena]=(this.arenaVisits[this.arena]||0)+1;this.persistMixes();}this.suspended=false;this.unlocked=true;try{this.audio.currentTime=0;}catch{}return this.play();}
 retry(){if(this.status==='tap'||this.status==='unavailable'){if(this.status==='unavailable')this.current=null;this.unlocked=true;return this.play();}}
 setScene(context,match=this.match){this.endMix();this.dropPulse=0;this.context=context;this.match=match;return this.play();}
 select(id){this.endMix();this.selection=id==='auto'||TRACKS.some(t=>t.id===id)?id:'auto';return this.play();}
 toggle(){this.enabled=!this.enabled;this.unlocked=true;return this.play();}
 volume(value){this.level=Math.max(0,Math.min(1,Number(value)||0));this.audio.volume=this.level;this.report();}
 duck(gain=.25,seconds=.6){if(seconds<=0){this.duckGain=1;this.duckTime=0;return;}const next=Math.max(0,Math.min(1,gain));this.duckGain=this.duckTime>0?Math.min(this.duckGain,next):next;this.duckTime=Math.max(this.duckTime,seconds);}
 beginMix(id){if(!this.enabled||this.suspended||this.status!=='playing'||this.level<=0)return;this.endMix();this.mix={id,elapsed:0,rate:this.audio.playbackRate??1,pitch:this.audio.preservesPitch};this.audio.preservesPitch=false;}
 endMix(id){if(!this.mix||id!==undefined&&this.mix.id!==id)return;this.audio.playbackRate=this.mix.rate;if(this.mix.pitch!==undefined)this.audio.preservesPitch=this.mix.pitch;this.mix=null;}
 dropMix(id){this.endMix(id);this.dropPulse=.6;this.dropRecover=.2;}
 get visualBeat(){if(this.dropPulse>0&&this.enabled&&this.level>0&&this.status==='playing')return {pulse:Math.max(this.beat.pulse,this.dropPulse/.6),level:this.beat.level,time:this.beat.time};return this.beat;}
 tick(dt){this.dropPulse=Math.max(0,this.dropPulse-dt);this.dropRecover=Math.max(0,this.dropRecover-dt);if(this.mix){this.mix.elapsed+=dt;if(this.mix.elapsed>.8||!this.enabled||this.suspended)this.endMix();else this.audio.playbackRate=this.mix.rate*(.88+Math.sin(this.mix.elapsed*38)*.14);}this.beat.tick(dt,this.enabled&&!this.suspended&&this.level>0&&!this.audio.paused&&this.status==='playing');this.duckTime=Math.max(0,this.duckTime-dt);const target=this.level*Math.min(this.duckTime>0?this.duckGain:1,this.mix?.22:1);this.audio.volume+=(target-this.audio.volume)*Math.min(1,dt*(this.mix||this.dropRecover>0?30:this.duckTime>0?18:4));}
 suspend(){this.endMix();this.dropPulse=0;this.suspended=true;return this.play();}
 resume(){this.suspended=false;return this.play();}
}
