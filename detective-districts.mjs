// Small, shared architectural details reuse the existing SBFENT materials.
export function districtDetails({location,inside,box,plane,surface,signTexture,materials:m,detail:d,crafted:c,textures}){
 const lights=[];
 const panel=(label,fill='#17372b')=>signTexture(label,fill==='#17372b'?'#b4eea0':'#ffdf96');
 if(!inside){
  // Open service lanes connect the original lot to the extended district.
  for(const x of [-20,20]){for(let z=8;z<59;z+=6)surface(x,z,.12,2.2,d.gold);box(x,0,26,.12,2.6,.12,d.chrome,false);plane(x,1.5,26.1,4.8,.7,signTexture('SBFENT / SERVICE AISLE'));for(const z of [33,55])box(x,0,z,2.4,1.8,2.4,location===2?m.black:(textures.warehouse?.crate||c.wood),true);}

  if(location===0){plane(0,8.5,-16.1,11,.6,panel('BIG OLE RIG / SBFENT DINER'));}
  if(location===1){for(const x of [-9,9]){box(x,0,18,2.4,3.3,.25,m.black,false);plane(x,.8,18.17,2.1,1.8,panel('SBFENT SOUND'));box(x,3.35,18,2.5,.12,.35,d.gold,false);}for(const x of [-18,18])lights.push([x,2,8,'#48e7b1']);plane(0,8.5,-16.1,11,.7,panel('SBFENT STUDIO / AFTER-HOURS SESSION'));}
  if(location===2){for(const x of [-10,10]){box(x,0,17,.18,3,.18,d.chrome,false);box(x,3,17,2.8,.15,.7,d.gold,false);lights.push([x,2.8,17,'#e56db9']);}for(const x of [-6,6])surface(x,25,1.5,12,m.purple);plane(0,8.5,-16.1,11,.7,panel('STAMPED LOUNGE / VIP'));}
 }else{
  if(location===3){surface(0,-24.5,8.8,.12,d.gold);for(const x of [-3.5,3.5])for(let z=-23;z<-14;z+=3)surface(x,z,.1,1.4,d.chrome);}
  if(location===0){for(const x of [-6,6])for(const z of [-4,3]){box(x,0,z-2.3,3.8,1.6,.45,m.leather||m.purple,false);box(x,.45,z-2.12,3.5,.65,.28,m.leather||c.wood,false);box(x,.7,z,3.6,.12,1.9,d.cream,false);box(x+.65,.85,z,.27,.35,.27,d.chrome,false);box(x-.6,.85,z,.45,.06,.45,d.cream,false);}for(const x of [-7,0,7]){plane(x,2.2,-28.1,5,1.7,panel(x?'SBFENT DINER':'BIG OLE RIG / MENU'));lights.push([x,3.7,-24,'#ffd09c']);}for(let z=-27;z<-13;z+=4)surface(0,z,.15,2,d.gold);}
  if(location===1){for(const x of [-3,0,3]){box(x,1.3,-9,2.1,.2,2.4,m.black,false);plane(x,1.8,-10,1.8,1,panel('SBFENT / REC'));for(let i=0;i<5;i++){box(x-.65+i*.32,1.52,-8.5,.12,.06,.8,i%2?d.gold:d.chrome,false);}lights.push([x,2.4,-9,'#5bcecf']);}for(const x of [-8,8])for(const z of [-18,-25]){box(x,0,z,2.1,3,1.2,m.black,false);plane(x,.7,z+.62,1.8,1.5,panel('SBFENT SOUND'));}plane(0,3,-28.1,10,1.3,panel('SBFENT ARCHIVE / SESSION RECORDS'));}
  if(location===2){box(0,.7,-10,7.5,1.3,1.8,m.black,false);plane(0,1,-8.98,6.5,.8,panel('SBFENT / STAMPED LOUNGE'));for(const x of [-6,6])for(const z of [-19,-25]){box(x,0,z,.18,1.3,.18,d.chrome,false);box(x,1.3,z,2.3,.15,2.3,m.black,false);box(x+.3,1.45,z,.18,.4,.18,d.chrome,false);lights.push([x,3,z,'#c275eb']);}plane(0,3,-28.1,10,1.3,panel('VIP / COAT-CHECK RECORDS'));}
 }
 return lights;
}
