import {paintBox} from './geometry.mjs';
import {courseFrame,courseDelta,COURSE_LENGTH} from './course.mjs';
import {branchOpening} from './road-surface.mjs';
export const CITY_ZONES=[
 ['Record Row','Lakefront Park','Crown Market','Festival Mile'],
 ['Metro Quarter','Neon Gardens','Beat District','Crown After Dark'],
 ['Foundry Row','Freight Depot','Motor Park','Finish Yard'],
 ['Skyline Promenade','Cloud Gardens','Crown Heights','Victory Terrace'],
 ['Emerald Harbor','Island Gardens','Golden Shore','Crown Marina'],
 ['Moonlight Plaza','Crystal Gardens','Orbit Row','Starlight Finish']
];
export const zoneAt=(distance,track=0)=>CITY_ZONES[track]?.[Math.floor((((distance%COURSE_LENGTH)+COURSE_LENGTH)%COURSE_LENGTH)/15000)]||CITY_ZONES[0][0];
const palettes=[['#47765d','#769559','#b2aa82'],['#315e64','#45978e','#667994'],['#69704e','#8c8a57','#b9a17b'],['#5c7d75','#8da386','#c0aec6'],['#237e6d','#65ad82','#d9c18e'],['#68558b','#8d7fb5','#6a698f']];
function block(s,t,x,y,z,w,h,d,color){const a=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2],[-w/2,h,d/2]].map(([a,b,c])=>t(x+a,y+b,z+c));paintBox(s,a,color);}
function crownTree(s,t,x,z,colors,detail){block(s,t,x,0,z,34,220,34,'#79654d');const n=detail?8:5;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,r=165;s.face([t(x+Math.cos(a)*r,200,z+Math.sin(a)*r),t(x+Math.cos(b)*r,200,z+Math.sin(b)*r),t(x+Math.cos(b)*r*.72,340,z+Math.sin(b)*r*.72),t(x+Math.cos(a)*r*.72,340,z+Math.sin(a)*r*.72)],colors[i%2]);s.face([t(x+Math.cos(a)*r*.72,340,z+Math.sin(a)*r*.72),t(x+Math.cos(b)*r*.72,340,z+Math.sin(b)*r*.72),t(x,425,z)],colors[(i+1)%2]);}}
// Furniture belongs outside sidewalks; routes retain their clear entrance corridor.
export function streetscapeSlots(origin,track){const out=[];for(let d=600;d<COURSE_LENGTH;d+=1200){const delta=courseDelta(d,origin);if(delta < -1200||delta > 9000)continue;for(const side of [-1,1]){if([-900,0,900].some(offset=>branchOpening(d+offset,side)))continue;out.push({distance:d,side,lane:side*1.58,detail:Math.abs(delta)<4200,park:Math.floor(d/15000)===1||track>=3,index:d/1200});}}return out;}
export function drawCityPolish(s,origin,track,time=0,reduced=false){const colors=palettes[track]||palettes[0];s.layer=1;for(const slot of streetscapeSlots(origin,track)){const {distance,side,detail,park,index}=slot,f=courseFrame(distance,slot.lane,0,track),t=(x,y,z)=>f.position.map((v,k)=>v+f.right[k]*x+f.forward[k]*z+(k===1?y:0)),away=side;
 if(park){block(s,t,away*410,-15,0,600,28,880,colors[2]);crownTree(s,t,away*410,-210,colors,detail);crownTree(s,t,away*570,220,colors,detail);}else{block(s,t,0,0,0,130,65,190,colors[2]);crownTree(s,t,0,25,colors,detail);}
 if(detail){
 // Slatted benches, litter bins and drain covers establish scale beside the racing lane.
 for(const z of [-150,150])block(s,t,away*70,0,440+z,22,65,22,'#364e55');
 for(let z=310;z<610;z+=55){block(s,t,away*70,65,z,120,12,35,'#b99561');block(s,t,away*125,80,z,15,85,35,'#aa8458');}
 block(s,t,-away*65,0,-430,65,112,65,'#315f58');block(s,t,-away*65,112,-430,78,10,78,'#d2b36f');
 for(let z=-220;z<=220;z+=55)block(s,t,-away*145,1,z,42,2,16,'#394b50');
 }
 // Lamps face the sidewalk and never bridge the road.
 block(s,t,away*40,0,700,22,540,22,'#3a505a');block(s,t,away*15,540,700,110,25,80,track===1?'#83f1e4':'#f4daa0');
 if(track===1){block(s,t,away*40,85,700,28,340,28,'#5e979a');if(detail)s.text(t(away*40,610,700),'♪','#b6f3ef',90);}
 if(detail&&Math.floor(index)%3===0){block(s,t,away*80,0,-700,25,290,25,'#344c57');s.text(t(away*80,350,-700),zoneAt(distance,track).toUpperCase(),track===1?'#92f4e5':'#ffe3a7',65);}
 }
}
export function drawDistrictSky(c,w,h,track,reduced=false,time=0){c.save();if(track===1||track===5){for(let i=0;i<23;i++){c.fillStyle=i%4?'#b9e4f154':'#d7edff9c';c.fillRect(w*((i*.137)%1),h*(.025+(i%5)*.035),i%4?1.5:2,1.5);}c.fillStyle='#e0e9ec';c.beginPath();c.arc(w*.78,h*.13,h*.036,0,Math.PI*2);c.fill();}else{const haze=c.createRadialGradient(w*.76,h*.1,1,w*.76,h*.1,h*.23);haze.addColorStop(0,'#fff3d391');haze.addColorStop(1,'#fff3d300');c.fillStyle=haze;c.fillRect(w*.4,0,w*.6,h*.4);c.fillStyle='#fff1cf';c.beginPath();c.arc(w*.76,h*.1,h*.034,0,Math.PI*2);c.fill();for(let i=0;i<5;i++){const x=w*((.09+i*.23+(reduced?0:time*.0004))%1),y=h*(.04+(i%3)*.035);c.fillStyle='#f3f4ec55';c.beginPath();c.ellipse(x,y,w*.045,h*.012,0,0,Math.PI*2);c.fill();}}c.restore();}
