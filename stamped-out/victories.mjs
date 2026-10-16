import {fighterFor} from './roster.mjs';
export const VICTORY_SECONDS=5.8;
export const VICTORIES=[
 {title:'COUNT THE STAMP',action:'Flex counts his Flex bills.',prop:'bills'},
 {title:'STAMP DENIED',action:'Bootlegger tries his counterfeit stamp. It jams.',prop:'denied'},
 {title:'SIGNED WITH A KISS',action:'Foxy spins and blows a kiss to the crowd.',prop:'hearts'},
 {title:'STICK THE LANDING',action:'Clara flips through the air and takes a bow.',prop:'flip'},
 {title:'GOLD STANDARD',action:'Goldie flips a gold coin and catches it.',prop:'coin'},
 {title:'RESPECT THE GUARD',action:'Onyx salutes, then bows in silence.',prop:'guard'},
 {title:'ONE MORE DROP',action:'DJ Blackout scratches a victory mix.',prop:'decks'},
 {title:'PROFIT LOCKED',action:'Quiet Money balances the ledger and closes the case.',prop:'ledger'},
 {title:'NEON SIGNATURE',action:'Neon Nova dashes out a neon signature.',prop:'neon'},
 {title:'OFFICIALLY STAMPED',action:'Big Stamp stomps a crown seal into the floor.',prop:'seal'},
 {title:'PURPLE REIGN',action:'Violet V cartwheels through a violet ribbon.',prop:'ribbon'},
 {title:'CHECKERED FINISH',action:'Redline slides across the finish and raises a fist.',prop:'finish'},
 {title:'THE BLOCK SHAKES',action:'Big Pressure flexes as shockwaves roll out.',prop:'quake'},
 {title:'SIGNAL RESTORED',action:'Lady Static tunes a lightning halo.',prop:'signal'},
 {title:'SIGNED. SEALED. DELIVERED.',action:'Iron Haul seals a freight crate and stamps it delivered.',prop:'crate'},
 {title:'SELF-CROWNED',action:'The False King lowers a crown onto his own head.',prop:'crown'}
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function victoryPose(character,time,reduced=false){
 const t=Math.max(0,time),p={x:500,y:0,face:1,pose:7,rotation:0};
 if(reduced)return p;
 if(character===0||character===6||character===7){p.pose=4;p.rotation=Math.sin(t*4)*.025;}
 if(character===1){p.pose=t<2?2:5;p.rotation=t<2?Math.sin(t*7)*.06:-.12;}
 if(character===2){p.x+=Math.sin(Math.min(t,1.5)*Math.PI)*45;p.pose=t<1.5?3:7;p.rotation=Math.sin(Math.min(t,1.5)*Math.PI)*.12;}
 if(character===3){const q=clamp((t-.3)/1.4,0,1);p.y=Math.sin(q*Math.PI)*155;p.rotation=q<1?q*Math.PI*2:0;p.pose=q<1?6:t<2.8?4:7;}
 if(character===4)p.pose=t%2<1?4:7;
 if(character===5){p.pose=4;p.rotation=Math.sin(clamp((t-.8)/1.8,0,1)*Math.PI)*.24;}
 if(character===8){p.x=500+Math.sin(Math.min(t,2.4)*Math.PI*1.25)*150*Math.max(0,1-t/2.8);p.pose=t<2.4?1:7;}
 if(character===9){p.y=t<.8?Math.sin(t/.8*Math.PI)*65:0;p.pose=t<.8?6:7;}
 if(character===10){const q=clamp(t/1.7,0,1);p.rotation=q<1?-q*Math.PI*2:0;p.x=430+q*140;p.pose=q<1?3:7;}
 if(character===11){p.x=350+Math.min(t/1.2,1)*150;p.rotation=t<1.2?.14:0;p.pose=t<1.2?1:7;}
 if(character===12){p.pose=7;p.rotation=Math.sin(t*2)*.035;}
 if(character===13){p.pose=t<2?4:7;p.y=8+Math.sin(t*2)*8;}
 if(character===14){p.pose=7;p.y=Math.sin(Math.min(t,1)*Math.PI)*12;}
 if(character===15)p.pose=t<2.4?4:7;
 return p;
}
function crown(ctx,x,y,size,color){ctx.save();ctx.translate(x,y);ctx.scale(size/100,size/100);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-50,-30);ctx.lineTo(-35,30);ctx.lineTo(35,30);ctx.lineTo(50,-30);ctx.lineTo(18,-5);ctx.lineTo(0,-45);ctx.lineTo(-18,-5);ctx.closePath();ctx.fill();ctx.restore();}
function bill(ctx,img,x,y,w=110,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);if(img?.complete&&img.naturalWidth)ctx.drawImage(img,42,19,1450,548,-w/2,-w*.19,w,w*.38);else{ctx.fillStyle='#e4d6a2';ctx.fillRect(-w/2,-w*.19,w,w*.38);ctx.fillStyle='#1c4431';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('FLEX 1000',0,4);}ctx.restore();}
function ring(ctx,x,y,r,color){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,r,r*.2,0,0,Math.PI*2);ctx.stroke();}
export function drawCelebration(ctx,fx,f,time,bills){
 const character=f.character??f.id,profile=fighterFor(f),v=VICTORIES[character],t=Math.max(0,time),motion=fx.reduced?0:t;
 ctx.save();ctx.fillStyle='#090611e8';ctx.fillRect(0,0,1000,562.5);
 const light=ctx.createRadialGradient(500,330,20,500,330,350);light.addColorStop(0,profile.color+'55');light.addColorStop(1,profile.color+'00');ctx.fillStyle=light;ctx.fillRect(100,90,800,450);
 for(let i=0;i<3;i++)ring(ctx,500,505,120+i*40,profile.color+'55');
 ctx.fillStyle=profile.color;ctx.textAlign='center';ctx.font='900 12px Arial';ctx.fillText('S B F E N T   /   V I C T O R Y',500,45);ctx.fillStyle='#fff0cc';ctx.font='italic 900 30px Arial';ctx.fillText(profile.name.toUpperCase()+' WINS',500,84);
 const pose={...f,...victoryPose(character,motion,fx.reduced),move:null,stun:0,knockdown:0,crouch:false,grapplePose:undefined};
 if(character===8&&!fx.reduced)for(let i=1;i<=3;i++)fx.rawSprite(ctx,{...pose,x:pose.x-i*55},pose.pose,.12/i);
 if(character===10){ctx.save();ctx.strokeStyle='#cf9bff';ctx.lineWidth=9;ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(pose.x,355,135,80,motion*2,0,Math.PI*1.6);ctx.stroke();ctx.restore();}
 fx.rawSprite(ctx,pose,pose.pose);
 ctx.save();ctx.translate(pose.x-500,0);
 switch(v.prop){
 case 'bills':{
  for(let i=0;i<5;i++)bill(ctx,bills,447+i*3,356-i*3,108,-.08);
  const count=fx.reduced?.5:(t*2.8)%1;
  bill(ctx,bills,450+count*95,335-Math.sin(count*Math.PI)*22,112,-.15+count*.3);
  for(const [x,y] of [[407,361],[530+count*12,359-count*6]]){ctx.fillStyle=f.outfit===1?'#563089':'#11131b';ctx.beginPath();ctx.ellipse(x,y,27,14,-.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d9bc6a';ctx.lineWidth=3;ctx.stroke();}
  ctx.fillStyle='#e9dca9';ctx.font='bold 13px Arial';ctx.fillText('FLEX BILLS · '+Math.min(9,Math.floor(t*2.8)+1)+' STACKS',500,463);break;
 }
 case 'denied':ctx.save();ctx.translate(570,344);ctx.rotate(Math.sin(motion*7)*.15);ctx.fillStyle='#694427';ctx.fillRect(-22,-27,44,38);ctx.fillStyle='#efbd61';ctx.fillRect(-43,7,86,20);ctx.restore();ctx.fillStyle='#ff7975';ctx.font='900 24px Arial';if(t>1.4)ctx.fillText('COUNTERFEIT: DENIED',500,440);break;
 case 'hearts':for(let i=0;i<4;i++){const q=(motion*.45+i*.21)%1;ctx.fillStyle='#ff9cd9';ctx.font=(22+q*15)+'px Arial';ctx.fillText('♥',560+q*130,320-q*120);}break;
 case 'flip':ctx.fillStyle='#e4b4ff';ctx.font='900 16px Arial';ctx.fillText(t>1.8?'PERFECT LANDING':'AIRBORNE',500,463);break;
 case 'coin':{const q=(motion*.5)%1,y=300-Math.sin(q*Math.PI)*140;ctx.fillStyle='#ffe08c';ctx.beginPath();ctx.ellipse(570,y,Math.max(3,18*Math.abs(Math.cos(motion*8))),20,0,0,Math.PI*2);ctx.fill();ctx.font='bold 18px Arial';ctx.fillText('♛',570,y+7);break;}
 case 'guard':ring(ctx,500,500,85+Math.sin(motion*2)*8,'#a5defa');ctx.font='bold 16px Arial';ctx.fillStyle='#d9efff';ctx.fillText('RESPECT.',500,450);break;
 case 'decks':ctx.fillStyle='#171822';ctx.fillRect(378,353,244,66);for(const x of [430,570]){ctx.fillStyle='#050508';ctx.beginPath();ctx.arc(x,383,27,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6ddfff';ctx.beginPath();ctx.arc(x,383,20,motion*5,motion*5+4.4);ctx.stroke();}for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#d0ff78':'#6ddfff';ctx.fillRect(469+i*7,406,4,-10-Math.abs(Math.sin(motion*4+i))*30);}break;
 case 'ledger':ctx.save();ctx.translate(505,358);ctx.rotate(-.1);ctx.fillStyle='#244530';ctx.fillRect(-80,-25,160,60);ctx.strokeStyle='#e4c36d';ctx.strokeRect(-80,-25,160,60);ctx.fillStyle='#edd88e';ctx.font='900 14px Arial';ctx.fillText(t<2.4?'BALANCE: +1 WIN':'ACCOUNT CLOSED',0,9);ctx.restore();break;
 case 'neon':ctx.strokeStyle='#bcff46';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(320,438);ctx.lineTo(380,375);ctx.lineTo(405,428);ctx.lineTo(450,375);ctx.lineTo(490,425);ctx.lineTo(670,408);ctx.stroke();break;
 case 'seal':{const q=clamp(t-.8,0,1);ring(ctx,500,497,90+q*130,'#81a9ff');crown(ctx,500,475,75,'#a8c9ff');ctx.fillStyle='#a8c9ff';ctx.font='900 15px Arial';ctx.fillText('APPROVED',500,456);break;}
 case 'ribbon':for(let i=0;i<8;i++){ctx.fillStyle='#cf9bff';ctx.beginPath();ctx.arc(500+Math.cos(i+motion)*160,330+Math.sin(i+motion)*85,4,0,Math.PI*2);ctx.fill();}break;
 case 'finish':for(let i=0;i<12;i++)for(let j=0;j<2;j++){ctx.fillStyle=(i+j)%2?'#e9e2d4':'#242330';ctx.fillRect(310+i*32,470+j*15,32,15);}ctx.strokeStyle='#ff9455';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(340,486+i*6);ctx.lineTo(460,486+i*6);ctx.stroke();}break;
 case 'quake':for(let i=0;i<3;i++){const q=(motion*.6+i/3)%1;ctx.save();ctx.globalAlpha=1-q;ring(ctx,500,500,80+q*250,'#ffd46b');ctx.restore();}crown(ctx,500,185,50,'#ffd46b');break;
 case 'signal':for(let i=0;i<4;i++){ctx.strokeStyle='#70f5ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(500,280,115+i*17,motion+i, motion+i+1.6);ctx.stroke();}ctx.fillStyle='#e7ffff';ctx.font='900 24px Arial';ctx.fillText('⚡',500,175);break;
 case 'crate':ctx.save();ctx.translate(150,200);ctx.fillStyle='#694c31';ctx.fillRect(427,177,146,82);ctx.strokeStyle='#c8ac7a';ctx.lineWidth=5;ctx.strokeRect(427,177,146,82);ctx.beginPath();ctx.moveTo(430,180);ctx.lineTo(570,256);ctx.moveTo(570,180);ctx.lineTo(430,256);ctx.stroke();ctx.fillStyle='#dfff96';ctx.font='900 13px Arial';ctx.fillText(t<1.6?'SBFENT FREIGHT':'DELIVERED',500,228);ctx.restore();break;
 case 'crown':crown(ctx,500,170-70*(1-clamp(t/2.4,0,1)),85,'#ffd271');break;
 }
 ctx.restore();ctx.fillStyle='#090611e8';ctx.fillRect(0,519,1000,44);ctx.font='900 16px Arial';ctx.fillStyle=profile.color;ctx.fillText(v.title,500,545);ctx.restore();
}
