// Arena dressing stays behind the fighters; it never displaces the camera or HUD.
export function drawStreetStamp(ctx,arena,beat,reduced=false){
 ctx.save();ctx.globalAlpha=.13;ctx.translate(500,511);ctx.scale(1,.25);ctx.rotate(-.09);ctx.strokeStyle='#e2cf8d';ctx.lineWidth=3;ctx.strokeRect(-190,-49,380,96);ctx.font='italic 900 53px Arial';ctx.textAlign='center';ctx.fillStyle='#e2cf8d';ctx.fillText('SBFENT',0,8);ctx.font='bold 16px Arial';ctx.fillText('PROTECT THE STAMP',0,34);ctx.restore();
 if(arena==='penthouse'||arena==='vault')return;
 ctx.save();ctx.translate(65,199);ctx.rotate(-.08);ctx.globalAlpha=.3;ctx.fillStyle='#090810';ctx.fillRect(-34,-31,118,68);ctx.strokeStyle='#b7d689';ctx.lineWidth=1;ctx.strokeRect(-34,-31,118,68);ctx.fillStyle='#eddfba';ctx.font='italic 900 13px Arial';ctx.textAlign='center';ctx.fillText('REP YOUR',25,-5);ctx.fillText('STAMP',25,13);ctx.restore();
 const pulse=reduced?0:beat?.pulse??0;if(pulse<.1)return;
 ctx.save();ctx.globalAlpha=pulse*.11;ctx.fillStyle='#d9a36a';for(let i=0;i<5;i++)ctx.fillRect(900+i*8,460-i*13,3,30);ctx.restore();
}
