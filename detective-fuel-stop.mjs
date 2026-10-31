// A drive-through diesel court with clear lanes; only the pump bases and columns collide.
export function fuelStop({box,mesh,quad,plane,surface,signTexture,materials:m,detail:d}){
 const red={color:[.62,.055,.045]},white={color:[.83,.83,.74]},black=m.black;
 const hose=(x,z,side)=>{const pts=[[x+side*.4,2.35],[x+side*.9,2.12],[x+side*1.02,1.25],[x+side*.94,.62],[x+side*.66,.48],[x+side*.46,.75],[x+side*.47,1.55]];for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i],len=Math.hypot(bx-ax,by-ay),dx=-(by-ay)/len*.045,dy=(bx-ax)/len*.045,q=quad([[ax-dx,ay-dy,z],[bx-dx,by-dy,z],[bx+dx,by+dy,z],[ax+dx,ay+dy,z]],black);mesh(q);const back={...q,points:[...q.points].reverse(),uvs:[...q.uvs].reverse()};mesh(back);}box(x+side*.47,1.48,z,.13,.36,.13,d.chrome,false);};
 for(const x of [-7,7]){
  surface(x,-3,2.9,4.5,d.concrete);box(x,.03,-3,2.7,.18,4.2,white,false);
  box(x,.2,-3,1.25,1.1,1.05,red,false);box(x,1.3,-3,1.4,1.35,1.1,white,false);box(x,2.65,-3,1.6,.2,1.22,red,false);
  for(const side of [-1,1]){const zz=-3+side*.565,q=quad([[x-.56,1.7,zz],[x+.56,1.7,zz],[x+.56,2.25,zz],[x-.56,2.25,zz]],signTexture('DIESEL / 00.00','#9ce8c3'));if(side<0){q.points.reverse();q.uvs.reverse();}mesh(q);hose(x,zz+.03*side,1);}
  plane(x,.45,-2.46,1,.5,signTexture('SBFENT', '#f4d285'));
  for(const dx of [-1.15,1.15])for(const dz of [-1.5,1.5]){box(x+dx,.2,-3+dz,.13,1.05,.13,d.gold,false);box(x+dx,1.2,-3+dz,.18,.13,.18,d.chrome,false);}
  for(const dz of [-2.3,2.3])surface(x,-3+dz,3.2,.13,d.gold);
 }
 for(const x of [-9.3,9.3]){box(x,.1,-4.8,.5,6,.5,d.concrete,true);box(x,.1,-4.8,.58,.65,.58,red,false);}
 box(0,6.05,-3,20.2,.28,5.8,white,false);box(0,6.35,-3,20.4,.24,5.95,red,false);
 for(const x of [-7,0,7]){box(x,6.0,-3,2,.07,1,d.cream,false);plane(x,6.15,.04,5.6,.52,signTexture(x?'DIESEL':'SBFENT FUEL','#ffdfa0'));}
 return [[-7,3,-3,'#ffd292'],[7,3,-3,'#ffd292'],[0,5.7,-3,'#d3ecff']];
}
