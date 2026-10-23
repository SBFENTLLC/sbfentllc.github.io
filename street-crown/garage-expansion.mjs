export const SPECIAL_VEHICLES=Object.freeze([
 {id:'formula',name:'SBFENT Crown Formula',coins:1250,icon:'⚑',body:'#d64b67',accent:'#f6d477',description:'Open-wheel racer with a pointed nose, front wing and crown roll hoop. Fast; light armor.',top:1.07,accel:1.02,grip:1.02,armor:.86},
 {id:'drifter',name:'SBFENT Beat Drifter',coins:1600,icon:'♫',body:'#7043b8',accent:'#a9ff56',description:'Low drift coupe with flared arches, speaker deck and neon underglow. Tight grip; balanced pace.',top:1.01,accel:1.03,grip:1.13,armor:.96},
 {id:'rocket',name:'SBFENT Flex Rocket',coins:2600,icon:'✦',body:'#b85025',accent:'#75ebff',description:'Twin-jet speedster with swept fins and a long racing nose. Strong launch; lighter armor.',top:1.05,accel:1.09,grip:.95,armor:.9},
 {id:'cruiser',name:'SBFENT Crown GT',coins:350,icon:'♛',body:'#217b62',accent:'#f0cc70',description:'Wide-body street coupe, gold crown rims and a twin-deck wing. Extra grip; gentler launch.',top:1.02,accel:.96,grip:1.06,armor:1.05},
 {id:'monster',name:'SBFENT Stampede',coins:900,icon:'▣',body:'#733da2',accent:'#f1b65e',description:'Lifted trophy truck, exposed suspension and rooftop spotlights. More armor; less speed.',top:.96,accel:.95,grip:.94,armor:1.2},
 {id:'hover',name:'SBFENT Neon Phantom',coins:2000,icon:'◈',body:'#265b8e',accent:'#6af5ef',description:'Winged hover racer, glowing turbine pods and a split nose. Agile; lighter armor.',top:1.04,accel:1.04,grip:1.08,armor:.9}
]);
export const BONUS_LOCATIONS=Object.freeze([
 {track:4,name:'Emerald Island Speedway',coins:600,icon:'❖',description:'Emerald waterfront roads, palm-like crown trees and sweeping coastal turns.'},
 {track:5,name:'Cosmic Crown Circuit',coins:1400,icon:'✦',description:'A purple night circuit through a glowing observatory district.'}
]);
export const GARAGE_GEAR=Object.freeze([
 {id:'ice-block',name:'SBFENT Ice Stamp',price:280,icon:'❄',description:'Throw a crown-stamped ice block. Freezes a rival for 1.4 seconds, then melts with a protected restart.'},
 {id:'fireball',name:'SBFENT Flex Fire',price:300,icon:'♨',description:'Throw a blazing crown comet. Sparks, a spinout and a short scorch trail; shields block it.'},
 {id:'crown-disc',name:'SBFENT Crown Disc',price:180,icon:'✹',description:'A quick homing disc. One launch at the start of every race.'},
 {id:'paint-pop',name:'SBFENT Paint Pop',price:240,icon:'●',description:'A colorful thrown paint capsule with a wider hit window.'},
 {id:'speaker-bomb',name:'SBFENT Bass Bomb',price:320,icon:'▥',description:'A heavy thrown speaker that bursts near a racer.'}
]);
export const SHOP_PAINTS=Object.freeze([
 {id:'paint-emerald',name:'Emerald + Gold',body:'#228866',accent:'#f5ce72',filter:'hue-rotate(85deg) saturate(1.35)'},
 {id:'paint-neon',name:'Neon Purple + Orange',body:'#7938b4',accent:'#ff902d',filter:'hue-rotate(265deg) saturate(1.7)'},
 {id:'paint-pink',name:'Pink + Purple',body:'#de569c',accent:'#ac72e4',filter:'hue-rotate(310deg) saturate(1.5)'},
 {id:'paint-ice',name:'Ice Blue + Silver',body:'#3b9bd5',accent:'#d3f4fc',filter:'hue-rotate(175deg) saturate(.95) brightness(1.15)'}
]);
export const vehicleFor=id=>SPECIAL_VEHICLES.find(v=>v.id===id);
export const paintFor=cosmetics=>SHOP_PAINTS.find(p=>(cosmetics||[]).includes(p.id));
export const gearFor=id=>GARAGE_GEAR.find(g=>g.id===id);
export const vehicleStats=(stats,id)=>{const v=vehicleFor(id);return !v?stats:{...stats,top:stats.top*v.top,accel:stats.accel*v.accel,grip:stats.grip*v.grip,armor:stats.armor*v.armor};};
export const milestoneUnlocked=(earned,requirement)=>Number(earned)>=requirement;
export function healthDamage(force=.6,kind='hit'){return ['mud','slime','puddle'].includes(kind)?8:Math.round(16+Math.max(0,Math.min(1,force))*18);}
