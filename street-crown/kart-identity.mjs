import {RACERS} from './roster.mjs';
import {paintFor,vehicleFor} from './garage-expansion.mjs';
// Paint belongs to the kart. The upper 65% holds the original puppet identity.
export function kartBodyFilter(wrap=0,cosmetics=[],flash=0){
 return [wrap?'hue-rotate(45deg)':'',cosmetics.includes('paint-skyline')?'hue-rotate(85deg) saturate(1.4)':'',cosmetics.includes('paint-sunrise')?'hue-rotate(310deg) saturate(1.4)':'',cosmetics.includes('paint-bluefire')?'hue-rotate(175deg) saturate(1.3)':'',cosmetics.includes('skin-midnight')?'brightness(.72) contrast(1.25)':'',paintFor(cosmetics)?.filter||'',flash?'brightness(1.6)':''].filter(Boolean).join(' ')||'none';
}
// Shared bolt-on kits for the showroom, shop cards and race. Never draw a driver
// here: the same original racer-and-kart image remains visible for every kit.
export function drawKartUpgrades(c,x,y,w,h,vehicle='stock',racer=0,wrap=0,cosmetics=[]){
 if(!vehicleFor(vehicle))return;
 const paint=paintFor(cosmetics),[base,gold]=RACERS[racer].colors[wrap%2],body=paint?.body||base,accent=paint?.accent||gold;
 c.save();c.translate(x,y);c.scale(w,h);c.filter='none';c.lineWidth=.009;
 const panel=(a,b,d,e,color=body)=>{c.fillStyle=color;c.strokeStyle=accent;c.fillRect(a,b,d,e);c.strokeRect(a,b,d,e);};
 const wing=()=>{panel(.1,.70,.035,.13);panel(.865,.70,.035,.13);panel(.07,.68,.86,.045,accent);};
 if(vehicle==='formula'){wing();panel(.09,.94,.82,.035,accent);}
 else if(vehicle==='drifter'){wing();for(const a of [.24,.63]){panel(a,.81,.13,.13,'#10232e');c.beginPath();c.strokeStyle=accent;c.arc(a+.065,.875,.044,0,Math.PI*2);c.stroke();}}
 else if(vehicle==='rocket'){for(const a of [.16,.73]){panel(a,.81,.11,.15,'#192d3c');panel(a+.025,.93,.06,.045,'#86eaff');}}
 else if(vehicle==='cruiser'){wing();panel(.24,.94,.52,.025,accent);}
 else if(vehicle==='monster'){for(const a of [.055,.835]){panel(a,.77,.11,.21,'#15202c');for(let b=.79;b<.96;b+=.04)panel(a+.015,b,.08,.012,accent);}}
 else if(vehicle==='hover'){for(const a of [.015,.86]){panel(a,.78,.125,.14,body);panel(a+.015,.90,.095,.025,'#8beeff');}}
 c.restore();
}
