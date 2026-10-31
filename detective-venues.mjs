// Walkable venues share the same world coordinates and preserve saved cases.
export function venueScene({location,inside,box,mesh,quad,plane,surface,signTexture,materials:m,detail:d,crafted:c}){
 if(!inside||![1,2].includes(location))return [];const lights=[];
 const cylinder=(x,y,z,r,h,tex,segments=8)=>{for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;mesh(quad([[x+Math.sin(a)*r,y,z+Math.cos(a)*r],[x+Math.sin(b)*r,y,z+Math.cos(b)*r],[x+Math.sin(b)*r,y+h,z+Math.cos(b)*r],[x+Math.sin(a)*r,y+h,z+Math.cos(a)*r]],tex));}};
 if(location===1){
  // Recording control room in front; large vocal/live room and archive behind it.
  plane(0,3.7,-12.45,12,1,signTexture('SBFENT SOUND / LIVE ROOM','#91e4db'));
  for(const x of [-9,9])for(let z=-9;z<8;z+=3){box(x,1,z,.3,2.5,1.7,m.black,false);box(x,1.1,z+.88,.12,2.25,.05,d.gold,false);}
  for(const x of [-5,5]){box(x,0,-17,.13,3.5,.13,d.chrome,false);box(x,3.45,-17,4,.12,.12,d.chrome,false);}
  for(const x of [-3,3]){box(x,.02,-20,.12,2.5,.12,d.chrome,false);cylinder(x,2.45,-20,.16,.48,m.black);cylinder(x+.28,2.37,-20,.23,.06,d.chrome);surface(x,-20,2.5,3,c.carpet);box(x,2,-20,.9,.1,.65,m.black,false);lights.push([x,3.5,-20,'#70cdd8']);}
  for(const x of [-8,8]){box(x,0,-25,1.4,3.5,1.3,m.black,true);plane(x,1.4,-24.3,1.1,.8,signTexture('SBFENT / RACK'));for(let i=0;i<5;i++)box(x,1+i*.4,-24.31,.8,.07,.03,d.gold,false);}
  for(const x of [-2.7,0,2.7]){box(x,1.6,-9.7,1.65,.85,.12,m.black,false);plane(x,1.69,-9.62,1.43,.64,signTexture('REC / ||||||','#79f4ba'));}
  surface(0,-20,8,8,c.carpet);plane(0,3.8,-28,11,.7,signTexture('LIVE / VOCALS / SESSION ARCHIVE','#eed9a4'));
  for(const x of [-8,8])for(const z of [-20,3]){box(x,4,z,.1,.08,3,d.gold,false);lights.push([x,3.6,z,'#6dcdd8']);}
 }else{
  // A full club: open dance floor, DJ stage, poles, bar and separate VIP booths.
  const tones=[{color:[.45,.12,.5]},{color:[.08,.55,.5]},{color:[.8,.34,.13]},{color:[.2,.28,.65]}];
  for(let row=0;row<5;row++)for(let col=0;col<5;col++)surface((col-2)*1.15,2-row*1.15,1.07,1.07,tones[(row+col)%4],.04);
  for(const x of [-3.15,3.15])surface(x,-.3,.09,6.2,d.gold,.05);for(const z of [-3.4,2.8])surface(0,z,6.4,.09,d.gold,.05);
  for(const x of [-4.2,4.2]){surface(x,-19,2.5,2.5,m.black,.035);cylinder(x,.04,-19,.075,4.3,d.chrome,10);cylinder(x,.05,-19,.3,.09,d.gold);box(x,4.25,-19,.6,.1,.6,d.chrome,false);box(x,0,-19,.15,3.8,.15,d.chrome,true);lights.push([x,3.5,-19,'#ed6bcd']);}
  box(0,.8,-10,4.8,.8,1.35,m.black,false);plane(0,1.05,-9.29,4.4,.48,signTexture('SBFENT / DJ FLEX','#f2cf82'));
  for(const x of [-1.2,1.2]){cylinder(x,1.62,-10,.48,.055,d.chrome);cylinder(x,1.68,-10,.18,.04,m.black);}
  box(0,0,-26.3,8,1.2,1.5,m.black,true);box(0,1.2,-26.3,8.2,.12,1.7,d.gold,false);plane(0,.3,-25.52,7,.7,signTexture('STAMPED / VIP BAR','#efbd75'));
  for(let i=0;i<9;i++){const x=-3.4+i*.85,tex=[m.green,m.purple,d.gold][i%3];box(x,1.33,-26.3,.2,.5,.2,tex,false);box(x,1.83,-26.3,.08,.18,.08,d.chrome,false);}
  for(const x of [-8.4,8.4])for(const z of [-18,-24]){box(x,.25,z,2.6,.55,2.2,m.leather||m.purple,false);box(x,.8,z-.85,2.6,1,.35,m.leather||m.purple,false);box(x+Math.sign(x)*1.1,.65,z,.25,.6,2.1,m.leather||m.purple,false);}
  plane(0,4,-28.01,10,.8,signTexture('STAMPED LOUNGE / AFTER HOURS','#f8d497'));plane(0,3.4,-12.4,9,.7,signTexture('DANCE / VIP / LIVE DJ','#dd95ee'));
  for(const x of [-6,6])for(const z of [-2,-15,-23])lights.push([x,3.3,z,z===-2?'#c45df1':'#ed8b65']);
 }
 return lights;
}
