import {courseFrame, COURSE_LENGTH} from './course.mjs';
import {ACTIVE_ROUTES, routeAt, routeShape} from './routes.mjs';
const cache=new Map();
export function mapGeometry(track=0){
 if(cache.has(track))return cache.get(track);
 const main=Array.from({length:161},(_,i)=>courseFrame(i/160*COURSE_LENGTH,0,0,track).position);
 const routes=ACTIVE_ROUTES.map(r=>({id:r.id,color:r.color,points:Array.from({length:41},(_,i)=>{const d=r.start+i/40*(r.end-r.start),q=routeShape(d,r.id);return courseFrame(d,q.center,0,track).position;})}));
 const all=[...main,...routes.flatMap(r=>r.points)],xs=all.map(p=>p[0]),ys=all.map(p=>p[2]);
 const result={main,routes,minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};cache.set(track,result);return result;
}
export function routeGuide(race){
 const p=race.player;
 if(p.route){const r=routeAt(p.route),z=((p.distance%COURSE_LENGTH)+COURSE_LENGTH)%COURSE_LENGTH;return r.end-z<1500?'MERGE AHEAD · FOLLOW ARROWS':r.name;}
 const remaining=COURSE_LENGTH*race.laps-p.distance;
 if(remaining<8000)return 'CHECKERED FLAG AHEAD';
 const z=((p.distance%COURSE_LENGTH)+COURSE_LENGTH)%COURSE_LENGTH,r=ACTIVE_ROUTES.find(r=>r.start-z>=0&&r.start-z<2800);
 return r?`${r.side<0?'←':'→'} ${r.name}`:'GOLD ARROW = YOU';
}
export function drawCircuitMap(c,w,h,race){
 const g=mapGeometry(race.track),pad=17,scale=Math.min((w-pad*2)/(g.maxX-g.minX),(h-pad*2)/(g.maxY-g.minY)),cx=(g.minX+g.maxX)/2,cy=(g.minY+g.maxY)/2;
 const at=p=>[w/2+(p[0]-cx)*scale,h/2+(p[2]-cy)*scale];
 c.clearRect(0,0,w,h);c.fillStyle='#10262ddd';c.fillRect(0,0,w,h);c.lineJoin='round';c.lineCap='round';
 const line=(points,color,width)=>{c.beginPath();points.forEach((p,i)=>{const [x,y]=at(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 line(g.main,'#223f48',14);line(g.main,'#d8e3da',5);
 for(const r of g.routes)line(r.points,r.id===race.player.route?'#ffde76':r.color,r.id===race.player.route?6:3);
 const start=at(g.main[0]);c.fillStyle='#ffffff';c.fillRect(start[0]-4,start[1]-4,8,8);c.fillStyle='#172b36';c.fillRect(start[0]-4,start[1]-4,4,4);c.fillRect(start[0],start[1],4,4);
 for(const r of [...race.racers].sort((a,b)=>b.id-a.id)){const q=routeShape(r.distance,r.route),f=courseFrame(r.distance,q.center+r.x*q.width,0,race.track),[x,y]=at(f.position);c.save();c.translate(x,y);c.strokeStyle='#10262d';c.lineWidth=2;
  if(r.id===0){c.rotate(Math.atan2(f.forward[2],f.forward[0])+Math.PI/2);c.fillStyle='#ffda6e';c.beginPath();c.moveTo(0,-9);c.lineTo(6,7);c.lineTo(0,4);c.lineTo(-6,7);c.closePath();c.fill();c.stroke();}
  else{c.fillStyle=r.char===16?'#58caff':['#b9ffcb','#e4baff','#ffae87','#8aebed','#efb3d2'][r.id-1];c.beginPath();c.arc(0,0,5,0,Math.PI*2);c.fill();c.stroke();}c.restore();
 }
}
