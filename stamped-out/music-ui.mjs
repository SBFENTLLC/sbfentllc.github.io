import {Soundtrack,TRACKS} from './music.mjs';
export function setupMusic(){
 const $=id=>document.getElementById(id);
 const music=new Soundtrack(new Audio(),({track,status,enabled,volume,selection})=>{
  $('nowPlaying').hidden=!track;
  $('nowPlaying').textContent=track?`${status==='playing'?'♫':status==='loading'?'…':'Ⅱ'} ${track.title}${status==='tap'?' · TAP ♫ TO PLAY':status==='unavailable'?' · AUDIO UNAVAILABLE':''}`:'';
  $('musicToggle').setAttribute('aria-pressed',String(!enabled));$('musicToggle').setAttribute('aria-label',enabled?'Mute music':'Enable music');$('musicToggle').textContent=enabled?'♫':'♪';
  document.querySelectorAll('[data-music]').forEach(b=>{b.textContent=enabled?'Music ON':'Music OFF';b.setAttribute('aria-pressed',String(!enabled));});
  document.querySelectorAll('[data-track]').forEach(s=>s.value=selection);
  document.querySelectorAll('[data-volume]').forEach(s=>s.value=Math.round(volume*100));
 });
 const save=()=>{try{localStorage.setItem('sbfent-stamped-out-music',JSON.stringify({enabled:music.enabled,volume:music.audio.volume,selection:music.selection}));}catch{}};
 document.querySelectorAll('[data-track]').forEach(s=>{for(const t of TRACKS){const o=document.createElement('option');o.value=t.id;o.textContent=t.title;s.append(o);}s.addEventListener('change',()=>{music.unlocked=true;music.select(s.value);save();});});
 document.querySelectorAll('[data-volume]').forEach(s=>s.addEventListener('input',()=>{music.volume(s.value/100);save();}));
 const toggle=()=>{music.toggle();save();};document.querySelectorAll('[data-music]').forEach(b=>b.addEventListener('click',toggle));$('musicToggle').addEventListener('click',toggle);
 try{const s=JSON.parse(localStorage.getItem('sbfent-stamped-out-music')||'null');if(s){music.enabled=s.enabled!==false;music.volume(s.volume??.35);music.select(s.selection||'auto');}}catch{}
 music.report();return music;
}
