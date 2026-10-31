// The rigs keep one world-space heading. Painted sides sit on a solid trailer and cab.
export function rigScene(x,z,{box,mesh,quad,wheel,materials:m,detail:d,textures}){
 box(x,.8,z-1,2.9,3.35,7,m.green,false);box(x,4.15,z-1,3,.14,7.1,m.green,false);
 box(x,0.65,z+3.4,2.6,3.1,2,m.green,false);box(x,.7,z+5.05,2.45,1.4,1.3,m.green,false);
 box(x,2.3,z+4.43,2.25,1.05,.05,d.glass,false);box(x,1,z+5.73,1.55,1.1,.07,d.chrome,false);box(x,.45,z+5.8,2.95,.28,.16,d.chrome,false);
 for(const side of [-1,1]){const xx=x+side*1.53,tex=textures.rigs?.[side<0?3:2];if(tex){const points=[[xx,.05,z-4.5],[xx,.05,z+6],[xx,4.3,z+6],[xx,4.3,z-4.5]],q=quad(points,tex);if(side>0){q.points.reverse();q.uvs.reverse();q.uvs=q.uvs.map(([u,v])=>[1-u,v]);}mesh(q);}for(const zz of [-3.4,-2.2,4.85])wheel(x+side*1.37,.62,z+zz,.62);box(x+side*1.3,1,z+3,.12,4.1,.16,d.chrome,false);}
 if(textures.rigNose)mesh(quad([[x-1.3,.28,z+5.87],[x+1.3,.28,z+5.87],[x+1.3,2.65,z+5.87],[x-1.3,2.65,z+5.87]],textures.rigNose));
 if(textures.rigTail){const q=quad([[x+1.4,.55,z-4.59],[x-1.4,.55,z-4.59],[x-1.4,4.1,z-4.59],[x+1.4,4.1,z-4.59]],textures.rigTail);mesh(q);}
 for(const xx of [-1.05,-.7,.7,1.05])box(x+xx,1.7,z+5.78,.25,.15,.06,d.gold,false);
 for(const zz of [-4,-2,0,2])for(const side of [-1,1])box(x+side*1.5,3.9,z+zz,.06,.09,.25,d.gold,false);
 box(x,.5,z-4.57,2.95,.22,.15,d.chrome,false);
}
