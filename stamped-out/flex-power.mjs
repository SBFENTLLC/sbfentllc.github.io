const clamp=x=>Math.max(0,Math.min(1,x));
export function drawFlexPower(ctx,fx,f,time){
 const p=clamp(time/2.25),motion=fx.reduced?0:time,charge=clamp(p/.62),cx=f.id===0?320:680;
 ctx.save();ctx.fillStyle='#0b0619f2';ctx.fillRect(0,0,1000,562.5);
 const g=ctx.createRadialGradient(cx,310,15,cx,310,240);g.addColorStop(0,'#dfff7777');g.addColorStop(.45,'#7430a966');g.addColorStop(1,'#17062400');ctx.fillStyle=g;ctx.fillRect(0,0,1000,562.5);
 ctx.save();ctx.translate(cx,500);ctx.scale(1.13,1.13);fx.rawSprite(ctx,{...f,x:0,y:510,pose:p<.3?4:p<.65?2:7,move:null,stun:0,knockdown:0,crouch:false,rotation:fx.reduced?0:Math.sin(motion*4)*.055},p<.3?4:p<.65?2:7);ctx.restore();
 ctx.strokeStyle='#caff65';ctx.lineWidth=3;
 for(let i=0;i<4;i++){const q=fx.reduced?i/4:(motion*.65+i/4)%1;ctx.globalAlpha=(1-q)*.6;ctx.beginPath();ctx.ellipse(cx,493,45+q*220,8+q*35,0,0,Math.PI*2);ctx.stroke();}
 ctx.globalAlpha=1;
 // Crown rises from the charge then locks into place above the fighter.
 ctx.save();ctx.translate(cx,175-(1-charge)*85);ctx.scale(.8+charge*.35,.8+charge*.35);ctx.fillStyle='#eaff8a';ctx.beginPath();ctx.moveTo(-56,-30);ctx.lineTo(-38,20);ctx.lineTo(38,20);ctx.lineTo(56,-30);ctx.lineTo(20,-9);ctx.lineTo(0,-55);ctx.lineTo(-20,-9);ctx.closePath();ctx.fill();ctx.restore();
 if(!fx.reduced)for(let i=0;i<12;i++){const a=motion*1.7+i*Math.PI/6,x=cx+Math.cos(a)*(100+charge*85),y=325+Math.sin(a)*120;ctx.save();ctx.translate(x,y);ctx.rotate(a*.45);ctx.globalAlpha=.55;ctx.fillStyle=i%2?'#d4ff75':'#e9ce8a';ctx.fillRect(-16,-7,32,14);ctx.restore();}
 const tx=f.id===0?635:365;ctx.textAlign='center';ctx.fillStyle='#cfff76';ctx.font='900 15px Arial';ctx.fillText('FLEX A LOT',tx,195);ctx.fillStyle='#fff1c8';ctx.font='italic 900 36px Arial';ctx.fillText('STAMPED OUT',tx,250);ctx.font='900 16px Arial';ctx.fillStyle='#caff65';ctx.fillText(p<.3?'PLANT THE FEET':p<.65?'LOAD THE HANDS':'CROWN BREAKER',tx,296);
 ctx.fillStyle='#caff6525';ctx.fillRect(tx-135,325,270,7);ctx.fillStyle='#caff65';ctx.fillRect(tx-135,325,270*charge,7);ctx.fillStyle='#b9a7cf';ctx.font='900 11px Arial';ctx.fillText('BODY BARRAGE / LAUNCH / CROWN SLAM',tx,366);ctx.restore();
}
