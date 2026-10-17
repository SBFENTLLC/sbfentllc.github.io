// The title screen uses the same masked fighter art as the playable match.
export function drawLaunchScene(ctx,fx,time,reduced=false){
 const t=reduced?0:time,bob=Math.sin(t*3)*4,phase=Math.floor(t*1.5)%6;
 ctx.clearRect(0,0,1000,400);ctx.save();ctx.translate(0,-120);
 for(const [id,x,face] of [[0,285,1],[1,715,-1]]){
  ctx.save();ctx.fillStyle=id?'#a675ff44':'#bfff6533';ctx.beginPath();ctx.ellipse(x,510,125,18,0,0,Math.PI*2);ctx.fill();
  const pose=reduced?0:phase===id+1?2:phase===id+3?3:0;
  fx.rawSprite(ctx,{id,character:id,outfit:1,x:x+(reduced?0:Math.sin(t*2+id)*12),y:bob,face,pose,rotation:0,stun:0,knockdown:0},pose);ctx.restore();
 }
 ctx.font='italic 900 45px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('VS',500,340);ctx.restore();
}
