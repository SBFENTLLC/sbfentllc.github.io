const KEY='sbfent-ghosts-circuit-districts-v3';
class PersonalGhost{
 constructor(storage){this.storage=storage;this.frames=[];this.best=null;this.next=0;this.eligible=true;}
 start(race,resumed=false){this.key=[race.track,race.laps,race.player.char,race.difficulty].join(':');this.frames=[];this.next=0;this.eligible=!resumed;this.best=null;try{const all=JSON.parse(this.storage.getItem(KEY)||'[]');const b=all.find(x=>x.key===this.key);if(b&&Number.isFinite(b.time)&&Array.isArray(b.frames)&&b.frames.length<=2400&&b.frames.every(f=>Array.isArray(f)&&f.length===5&&f.slice(0,4).every(Number.isFinite)&&f[0]>=0&&f[0]<=451&&f[1]>=0&&f[1]<=300000&&Math.abs(f[2])<=3&&f[3]>=0&&f[3]<=2&&(f[4]===''||['alley','roof','river'].includes(f[4])))&&b.frames.every((f,i)=>i===0||f[0]>=b.frames[i-1][0]))this.best=b;}catch{} }
 record(race){if(!this.eligible||race.phase==='countdown'||race.time<this.next||this.frames.length>=2400)return;this.next=race.time+.2;const p=race.player;this.frames.push([race.time,p.distance,p.x,p.air,p.route||'']);}
 at(time){const a=this.best?.frames;if(!a?.length||time>a[a.length-1][0])return null;let lo=0,hi=a.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(a[mid][0]<time)lo=mid+1;else hi=mid;}const b=a[lo],p=a[Math.max(0,lo-1)],t=b[0]===p[0]?0:Math.max(0,Math.min(1,(time-p[0])/(b[0]-p[0])));return {distance:p[1]+(b[1]-p[1])*t,x:p[2]+(b[2]-p[2])*t,air:p[3]+(b[3]-p[3])*t,route:t<.5?p[4]:b[4]};}
 finish(race){this.next=0;this.record(race);if(!this.eligible||race.player.finishTime===null||this.best&&this.best.time<=race.time)return false;const record={key:this.key,time:race.time,frames:this.frames};try{let all=JSON.parse(this.storage.getItem(KEY)||'[]');if(!Array.isArray(all))all=[];all=all.filter(x=>x.key!==this.key).slice(-11);all.push(record);this.storage.setItem(KEY,JSON.stringify(all));this.best=record;return true;}catch{return false;}}
}

export {PersonalGhost};
