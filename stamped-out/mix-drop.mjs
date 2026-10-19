// A deliberate space reset, separate from each fighter's POWER and SUPER.
export const MIX_DROP=Object.freeze({wind:.65,active:.08,recovery:.45,range:250,damage:4,push:150,cooldown:18,initial:12});
export function drawMixGesture(ctx,f,color,reduced=false){
 const t=f.move?.t??0;if(f.move?.name!=='mix'||t>MIX_DROP.wind)return;
 const p=Math.min(1,t/MIX_DROP.wind),scratch=reduced?0:Math.sin(t*36),x=f.x+f.face*60,y=365-f.y;
 ctx.save();ctx.translate(x,y);ctx.scale(f.face,1);ctx.strokeStyle=color;ctx.fillStyle='#100e23d9';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-48,4);ctx.lineTo(55,4);ctx.lineTo(69,26);ctx.lineTo(-63,26);ctx.closePath();ctx.fill();ctx.stroke();
 for(const cx of [-27,32]){ctx.save();ctx.translate(cx,10);ctx.scale(1,.36);for(const r of [22,15,7]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}ctx.rotate(scratch*.9);ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(19,0);ctx.stroke();ctx.restore();}
 // Lit forearms and fingers follow a back-and-forth record-scratching gesture.
 ctx.strokeStyle='#fff0c2';ctx.lineWidth=4;ctx.lineCap='round';
 for(const [side,cx] of [[-1,-27],[1,32]]){const reach=cx+scratch*9*side;ctx.beginPath();ctx.moveTo(-42+side*12,-23);ctx.lineTo(reach-8,-6);ctx.lineTo(reach,7);ctx.stroke();ctx.lineWidth=2;for(let finger=0;finger<3;finger++){ctx.beginPath();ctx.moveTo(reach-3+finger*3,3);ctx.lineTo(reach-1+finger*3,11);ctx.stroke();}}
 ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,15,77,29,0,-Math.PI/2,-Math.PI/2+p*Math.PI*2);ctx.stroke();ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText('MIX → DROP',0,-36);ctx.restore();
}
export function drawMixBurst(ctx,drop,reduced=false){
 const p=Math.min(1,drop.age/.6);ctx.save();ctx.translate(drop.x,360);ctx.strokeStyle=drop.color;ctx.lineWidth=reduced?3:5*(1-p)+1;ctx.globalAlpha=(1-p)*.8;
 for(let i=0;i<(reduced?1:3);i++){const r=reduced?90:40+p*250-i*24;if(r<5)continue;ctx.beginPath();ctx.ellipse(0,0,r,r*.5,0,0,Math.PI*2);ctx.stroke();}
 ctx.font='italic 900 24px Arial';ctx.textAlign='center';ctx.fillStyle=drop.color;ctx.fillText('DROP!',0,-90);ctx.restore();
}
