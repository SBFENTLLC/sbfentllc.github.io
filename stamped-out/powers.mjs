// Every fighter has a ready-at-round-start space-making power. The separate
// 100-point super meter still owns cinematic finishers. All shots can be guarded
// or jumped, expire at their range limit, and cost a cooldown even when interrupted.
const entries=[
 ['Crown Shot','crown','#f7d46f',680,430,9,75,4.8,.26],
 ['Counterfeit Card','card','#b99bff',620,460,8,80,4.8,.3],
 ['Foxfire','spark','#ff91c7',790,380,7,70,4.2,.22],
 ['Scarlet Crescent','crescent','#ff666d',720,410,8,75,4.5,.25],
 ['Gold Rush','orb','#ffca54',430,390,12,105,5.8,.4],
 ['Shadow Shard','shard','#aa9bff',900,450,8,65,4.6,.24],
 ['Bass Wave','wave','#6ddfff',650,440,9,90,4.8,.28],
 ['Vault Burst','hex','#e8ca7d',520,410,11,95,5.4,.36],
 ['Neon Bolt','bolt','#bcff65',980,480,7,65,4.4,.22],
 ['Ground Stamp','ground','#d8b276',500,380,11,105,5.6,.38],
 ['Reign Disc','disc','#cf87ff',750,430,9,80,4.8,.28],
 ['Redline Rocket','flame','#ff8354',860,420,9,85,4.8,.26],
 ['Pressure Quake','quake','#ffd46b',450,400,12,110,6,.44],
 ['Static Jolt','electric','#70f5ff',740,470,9,80,5,.3],
 ['Freight Blast','freight','#e4d39d',480,430,12,110,5.8,.42],
 ['Crown Break','royal','#d9a3ff',700,480,10,95,5.2,.34]
];
export const POWERS=entries.map(([name,shape,color,speed,range,damage,push,cooldown,wind],character)=>Object.freeze({name,shape,color,speed,range,damage,push,cooldown,wind,active:.1,recovery:.32,character,low:shape==='ground'||shape==='quake'}));
export const powerFor=character=>POWERS[character]??POWERS[0];
export function powerProjectile(f){const p=powerFor(f.character);return {...p,id:f.id,x:f.x+f.face*45,y:p.low?60:150,face:f.face,travel:0,age:0,ability:true};}
export function drawPowerShot(ctx,p,reduced=false){
 const data=p.ability?p:powerFor(6),time=reduced?0:p.age??0;
 ctx.save();ctx.translate(p.x,510-p.y);ctx.scale(p.face,1);ctx.strokeStyle=data.color;ctx.fillStyle=data.color;ctx.lineWidth=3;ctx.shadowBlur=reduced?0:16;ctx.shadowColor=data.color;
 // Tail length and silhouettes remain stable under reduced motion.
 ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(-62,-10);ctx.lineTo(-9,-20);ctx.lineTo(10,0);ctx.lineTo(-9,20);ctx.lineTo(-62,10);ctx.fill();ctx.globalAlpha=1;
 const path=points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));};
 switch(data.shape){
  case 'crown':case 'royal':path([[-27,18],[-33,-15],[-12,-2],[0,-30],[13,-2],[33,-15],[27,18],[-27,18]]);ctx.stroke();ctx.fillRect(-24,26,48,4);if(data.shape==='royal'){ctx.beginPath();ctx.ellipse(0,2,43,46,0,0,Math.PI*2);ctx.stroke();}break;
  case 'card':ctx.rotate(Math.sin(time*10)*.18);ctx.fillRect(-26,-35,52,70);ctx.strokeStyle='#fff';ctx.strokeRect(-21,-30,42,60);ctx.fillStyle='#3a2459';ctx.font='bold 24px Arial';ctx.textAlign='center';ctx.fillText('♛',0,8);break;
  case 'spark':path([[-30,0],[-8,-8],[0,-31],[9,-8],[32,0],[9,9],[0,31],[-9,9],[-30,0]]);ctx.stroke();break;
  case 'crescent':ctx.lineWidth=9;ctx.beginPath();ctx.arc(-6,0,33,-1.35,1.35);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.arc(-18,0,38,-1.2,1.2);ctx.stroke();break;
  case 'orb':ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff8c1';ctx.beginPath();ctx.arc(-6,-5,17,-2,1);ctx.stroke();break;
  case 'shard':path([[-38,-13],[39,0],[-38,17],[-9,0],[-38,-13]]);ctx.stroke();break;
  case 'wave':for(let i=0;i<3;i++){ctx.globalAlpha=1-i*.2;ctx.beginPath();ctx.ellipse(-i*12,0,18+i*5,48+i*6,0,-1.22,1.22);ctx.stroke();}break;
  case 'hex':ctx.rotate(time*2);path(Array.from({length:7},(_,i)=>[Math.cos(i*Math.PI/3)*35,Math.sin(i*Math.PI/3)*35]));ctx.stroke();ctx.fillRect(-13,-13,26,26);break;
  case 'bolt':case 'electric':path([[-42,-19],[-10,-6],[-20,-23],[40,0],[5,4],[19,22],[-42,-19]]);ctx.stroke();if(data.shape==='electric'){ctx.lineWidth=2;path([[-25,35],[-5,12],[5,25],[32,-28]]);ctx.stroke();}break;
  case 'ground':case 'quake':ctx.lineWidth=data.shape==='quake'?6:4;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(-i*17,14,36+i*6,40+i*4,0,-1.6,1.6);ctx.stroke();}path([[-34,42],[-12,25],[2,42],[20,20],[40,42]]);ctx.stroke();break;
  case 'disc':ctx.rotate(time*7);ctx.beginPath();ctx.ellipse(0,0,42,19,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,32,11,0,0,Math.PI*2);ctx.stroke();ctx.fillRect(-6,-6,12,12);break;
  case 'flame':path([[-53,-24],[-14,-12],[-25,-30],[31,-9],[42,0],[31,13],[-27,32],[-13,12],[-53,23],[-30,0],[-53,-24]]);ctx.stroke();ctx.fillStyle='#ffe3a0';ctx.beginPath();ctx.ellipse(17,0,20,10,0,0,Math.PI*2);ctx.fill();break;
  case 'freight':path([[-36,-22],[24,-22],[40,0],[24,22],[-36,22],[-22,0],[-36,-22]]);ctx.stroke();ctx.strokeStyle='#fff';for(let x=-14;x<=14;x+=14){ctx.beginPath();ctx.moveTo(x,-13);ctx.lineTo(x+10,13);ctx.stroke();}break;
 }
 ctx.restore();
}
