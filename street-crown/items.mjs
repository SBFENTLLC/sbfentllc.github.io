export const ITEMS=Object.freeze([
 {id:'crown',name:'Crown Disc',color:'#f4d16e',icon:'♛',speed:3100,force:.65},
 {id:'stamp',name:'Stamp Crate',color:'#b78a64',icon:'SBF',speed:2300,force:1},
 {id:'bill',name:'Flex Bill',color:'#7ce3a3',icon:'$',speed:2900,force:.4,homing:true},
 {id:'bass',name:'Bass Bomb',color:'#c3a0fa',icon:'♫',speed:2600,force:.7},
 {id:'paint',name:'Purple Splash',color:'#b58bff',icon:'✦',speed:2800,force:.4},
 {id:'ice',name:'Ice Cube',color:'#a2edff',icon:'❄',speed:2900,force:.4},
 {id:'cone',name:'Street Cone',color:'#ffb379',icon:'▲',speed:2500,force:.55},
 {id:'tire',name:'Rolling Tire',color:'#c1c8d4',icon:'◎',speed:3000,force:.8},
 {id:'spark',name:'Static Orb',color:'#e8daff',icon:'ϟ',speed:3100,force:.45},
 {id:'parcel',name:'SBF Parcel',color:'#dec69b',icon:'▣',speed:2700,force:.75}
].map(Object.freeze));
export const itemInfo=id=>ITEMS.find(i=>i.id===id)||({boost:{id:'boost',name:'Nitro',icon:'↑',color:'#a2edff'},shield:{id:'shield',name:'Shield',icon:'♛',color:'#7ce3a3'},oil:{id:'oil',name:'Oil Slick',icon:'●',color:'#b58bff'},rocket:{id:'rocket',name:'Rocket',icon:'↑',color:'#f4d16e'}}[id])||null;
export const itemIcon=id=>'assets/item-'+id+'.svg';
