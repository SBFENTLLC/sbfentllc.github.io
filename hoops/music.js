'use strict';
(()=>{
const TRACKS=[{"id":"modest","title":"MODEST","file":"modest.m4a"},{"id":"hustle","title":"HUSTLE","file":"hustle.m4a"},{"id":"four-flat","title":"FOUR FLAT","file":"four-flat-v2.m4a"},{"id":"money-machine","title":"MONEY MACHINE","file":"money-machine.m4a"},{"id":"exquiste","title":"EXQUISTE","file":"exquiste.m4a"},{"id":"one-night-stand","title":"ONE NIGHT STAND","file":"one-night-stand.m4a"},{"id":"andalay","title":"ANDALAY","file":"andalay.m4a"},{"id":"big-ole-bitties","title":"BIG OLE BITTIES","file":"big-ole-bitties.m4a"},{"id":"bandz-on-your-kneez","title":"BANDZ ON YOUR KNEEZ","file":"bandz-on-your-kneez.m4a"},{"id":"focus","title":"FOCUS","file":"focus.m4a"},{"id":"pod-dat","title":"POD DAT","file":"pod-dat.m4a"},{"id":"sky-is-tha-limit","title":"SKY IS THA LIMIT","file":"sky-is-tha-limit.m4a"},{"id":"rain-down","title":"RAIN DOWN","file":"rain-down.m4a"},{"id":"throw-it","title":"THROW IT","file":"throw-it.m4a"},{"id":"slick-reverse","title":"SLICK REVERSE","file":"slick-reverse.mp3"}];
const el=id=>document.getElementById(id),audio=el('soundtrackAudio');
let enabled=true,volume=.35,shuffle=true,index=-1,queue=[],history=[],suspended=true,unlocked=false,request=0,status='ready',failures=new Set(),context=null,gain=null,source=null;
try{const s=JSON.parse(localStorage.getItem('sbfent-hoops-music'));if(s){enabled=s.enabled!==false;volume=Number.isFinite(s.volume)?Math.max(0,Math.min(1,s.volume)):.35;shuffle=s.shuffle!==false;}}catch{}
audio.preload='none';audio.loop=false;audio.volume=volume;
const select=el('musicTrack');TRACKS.forEach((t,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=t.title;select.appendChild(o)});
function applyVolume(){if(gain){gain.gain.value=volume;audio.volume=1}else audio.volume=volume;}
function unlockAudio(){try{const C=window.AudioContext||window.webkitAudioContext;if(C&&!context){context=new C();gain=context.createGain();source=context.createMediaElementSource(audio);source.connect(gain);gain.connect(context.destination)}context?.resume().catch(()=>{});applyVolume()}catch{applyVolume()}}
function save(){try{localStorage.setItem('sbfent-hoops-music',JSON.stringify({enabled,volume,shuffle}))}catch{}}
function report(){el('musicQuick').textContent=(enabled?'♫ ':'MUTED · ')+(index<0?'SBFENT SOUNDTRACK':TRACKS[index].title);el('musicQuick').setAttribute('aria-pressed',String(enabled));el('musicToggle').textContent=enabled?'MUSIC ON':'MUSIC OFF';el('musicToggle').setAttribute('aria-pressed',String(enabled));el('musicShuffle').textContent=shuffle?'SHUFFLE ON':'SHUFFLE OFF';el('musicShuffle').setAttribute('aria-pressed',String(shuffle));el('musicVolume').value=String(Math.round(volume*100));el('musicVolumeLabel').textContent=Math.round(volume*100)+'%';el('musicStatus').textContent=index<0?'15 SBFENT tracks · Starts when you hit the court':TRACKS[index].title+' · '+(status==='playing'?'PLAYING':status==='tap'?'TAP RESUME MUSIC':status==='error'?'TRACK UNAVAILABLE':!enabled?'MUSIC OFF':suspended?'PAUSED':status.toUpperCase());if(index>=0)select.value=String(index);el('musicRetry').hidden=status!=='tap'&&status!=='error';}
function refill(){queue=TRACKS.map((_,i)=>i).filter(i=>i!==index);if(shuffle){for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}}else{queue.sort((a,b)=>((a-index+TRACKS.length)%TRACKS.length)-((b-index+TRACKS.length)%TRACKS.length))}}
function choose(i){i=(i+TRACKS.length)%TRACKS.length;if(index!==i){if(index>=0)history.push(index);audio.pause();audio.src='../stamped-out/audio/'+TRACKS[i].file;index=i;}report();}
async function play(){const generation=++request;if(!enabled||suspended||!unlocked){audio.pause();status='paused';report();return;}if(index<0)choose(0);unlockAudio();applyVolume();status='loading';report();try{await audio.play();if(generation!==request)return;status='playing';failures.clear();}catch(e){if(generation!==request)return;status=e?.name==='NotSupportedError'?'error':'tap';}report();}
function next(){if(!queue.length)refill();const i=queue.shift();choose(i??0);return play()}
const api={tracks:TRACKS,start(){unlocked=true;suspended=false;if(index<0)choose(0);else if(audio.ended)next();return play()},pause(){suspended=true;return play()},resume(){unlocked=true;suspended=false;return play()},next,previous(){const i=history.pop();if(i!==undefined){choose(i);history.pop();}return play()},state(){return {index,enabled,volume,shuffle,status,suspended}}};
audio.addEventListener('ended',()=>{if(enabled&&!suspended)next()});
audio.addEventListener('error',()=>{if(index<0)return;status='error';report();if(enabled&&!suspended){failures.add(index);if(failures.size<TRACKS.length){if(!queue.length)refill();queue=queue.filter(i=>!failures.has(i));if(queue.length)next();}}});
el('musicToggle').onclick=()=>{enabled=!enabled;unlocked=true;save();play()};
el('musicNext').onclick=()=>{unlocked=true;next()};el('musicPrevious').onclick=()=>{unlocked=true;api.previous()};
el('musicShuffle').onclick=()=>{shuffle=!shuffle;queue=[];save();report()};
select.onchange=()=>{unlocked=true;choose(Number(select.value)||0);queue=queue.filter(i=>i!==index);play()};
el('musicVolume').oninput=()=>{volume=Math.max(0,Math.min(1,Number(el('musicVolume').value)/100));applyVolume();save();report()};
el('musicRetry').onclick=()=>{unlocked=true;failures.clear();if(status==='error'){audio.load();}play()};
document.addEventListener('visibilitychange',()=>{if(document.hidden){suspended=true;play()}});
el('musicQuick').onclick=()=>el('musicToggle').onclick();window.HoopsMusic=api;report();
})();

