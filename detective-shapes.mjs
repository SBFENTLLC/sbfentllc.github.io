// Small CPU-side meshes; collision remains the original rectangular footprint.
const face=(points,tex,shade=1)=>({points,tex,color:[shade,shade,shade],uvs:points.map((_,i)=>i===0?[0,0]:i===1?[1,0]:i===2?[1,1]:[0,1])});
export function roundedPrism(x,y,z,w,h,d,tex){
 const r=Math.min(w,d)*.19,ring=[];
 for(const [cx,cz,base]of [[x+w/2-r,z+d/2-r,0],[x-w/2+r,z+d/2-r,90],[x-w/2+r,z-d/2+r,180],[x+w/2-r,z-d/2+r,270]])for(let i=0;i<=2;i++){const a=(base+i*45)*Math.PI/180;ring.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 const faces=[];for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],nx=b[1]-a[1],nz=a[0]-b[0],length=Math.hypot(nx,nz)||1,shade=.76+.18*(nx*.6+nz*.8)/length;const side=face([[a[0],y,a[1]],[a[0],y+h,a[1]],[b[0],y+h,b[1]],[b[0],y,b[1]]],tex,shade);side.uvs=[[0,0],[0,1],[1,1],[1,0]];faces.push(side);}
 // The ring is clockwise when seen from below; reverse for an upward top.
 const top=ring.map(([xx,zz])=>[xx,y+h,zz]).reverse();const t=face(top,tex,1.08);t.uvs=top.map(p=>[(p[0]-x+w/2)/w,(p[2]-z+d/2)/d]);faces.push(t);return faces;
}
export function canopy(x,y,z,w,h,d,tex){const faces=[],segments=10,rings=4;for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const points=[];for(const [a,b]of [[i,j],[i+1,j],[i+1,j+1],[i,j+1]]){const u=a/segments*Math.PI*2,v=-Math.PI/2+b/rings*Math.PI;points.push([x+Math.cos(u)*Math.cos(v)*w/2,y+Math.sin(v)*h/2,z+Math.sin(u)*Math.cos(v)*d/2]);}points.reverse();const unique=points.filter((p,k)=>!points.slice(0,k).some(q=>Math.hypot(...p.map((v,n)=>v-q[n]))<1e-6));faces.push(face(unique,tex,.75+.2*Math.cos(i/segments*Math.PI*2)+.15*j/rings));}return faces;}
export function puppetPose(distance,time,moving,reduced=false,options={}){
 if(reduced)return {step:0,lean:0,breath:1};
 const step=moving?Math.sin(distance*5.8):0,heading=Math.max(-1,Math.min(1,options.heading||0)),turn=Math.max(-1,Math.min(1,options.turn||0)),progress=Math.max(0,Math.min(1,options.progress||0)),pulse=Math.sin(progress*Math.PI),action=options.action||'';
 return {step,lean:(moving?step*.018:Math.sin(time*1.6)*.005)+heading*.055+turn*.04+(action==='scan'?-.035*pulse:0),breath:1+Math.sin(time*2.2)*.006,
 lift:(moving?Math.abs(step)*.018:0)+(action==='catch'?pulse*.12:0),width:1-Math.abs(heading)*.08,knee:moving?.085:0,
 stretch:action==='catch'?1+pulse*.045:action==='door'?1-pulse*.035:1};
}
