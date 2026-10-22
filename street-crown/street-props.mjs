import {paintBox} from './geometry.mjs';
// Lightweight world-space models. All details share the object's position and heading.
const TAU=Math.PI*2;
const local=(p,rot)=>(x,y,z)=>[p[0]+x*Math.cos(rot)+z*Math.sin(rot),p[1]+y,p[2]-x*Math.sin(rot)+z*Math.cos(rot)];
function cuboid(s,t,x,y,z,w,h,d,color){const a=[[-1,0,-1],[1,0,-1],[1,0,1],[-1,0,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]].map(([a,b,c])=>t(x+a*w/2,y+b*h,z+c*d/2));paintBox(s,a,color);}
function cylinder(s,t,x,y,z,r,h,color,n=10){const a=Array.from({length:n},(_,i)=>[x+Math.cos(i/n*TAU)*r,z+Math.sin(i/n*TAU)*r]);for(let i=0;i<n;i++){const b=a[(i+1)%n],v=a[i];s.face([t(v[0],y,v[1]),t(b[0],y,b[1]),t(b[0],y+h,b[1]),t(v[0],y+h,v[1])],i%3===0?'#364653':color);}s.face(a.map(([a,b])=>t(a,y+h,b)),color);}
function tire(s,t,x,y,z,time,detail){const n=detail?12:8,ring=(xx,a,r)=>t(xx,y+Math.cos(a)*r,z+Math.sin(a)*r);for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU;s.face([ring(x-24,a,90),ring(x+24,a,90),ring(x+24,b,90),ring(x-24,b,90)],i%2?'#17242c':'#28343e');for(const side of [-1,1]){const xx=x+side*25;s.face([ring(xx,a,90),ring(xx,b,90),ring(xx,b,56),ring(xx,a,56)],'#111c26');s.face([t(xx,y,z),ring(xx,a+time,55),ring(xx,b+time,55)],i%2?'#cad3d5':'#758a97');}}}
export function drawCityBus(s,p,heading,time=0,detail=true){
 const t=local(p,heading),w=360,front=575,rear=-575;
 const profile=[[-w+30,74],[w-30,74],[w,102],[w,445],[w-42,505],[-w+42,505],[-w,445],[-w,102]];
 for(let j=0;j<6;j++){const z0=rear+j*(front-rear)/6,z1=rear+(j+1)*(front-rear)/6;for(let i=0;i<profile.length;i++){const a=profile[i],b=profile[(i+1)%profile.length];s.face([t(a[0],a[1],z0),t(b[0],b[1],z0),t(b[0],b[1],z1),t(a[0],a[1],z1)],i===3||i===4?'#dae4dd':i===5?'#3a7082':'#24695f');}}
 for(const z of [rear,front])s.face(profile.map(([x,y])=>t(x,y,z)),z===rear?'#256c63':'#39867b');
 cuboid(s,t,0,55,0,630,50,1030,'#172831');cuboid(s,t,0,505,40,420,52,580,'#c2d0cc');cuboid(s,t,0,555,-20,330,12,350,'#798e95');
 for(const side of [-1,1]){for(const z of [-340,340])tire(s,t,side*386,90,z,time,detail);
  const x=side*362;
  s.face([t(x,220,-505),t(x,442,-505),t(x,442,493),t(x,220,493)],'#132d3b');
  s.face([t(x+side,193,-530),t(x+side,215,-530),t(x+side,215,530),t(x+side,193,530)],'#e9c574');
  for(let z=-480;z<470;z+=190){s.face([t(x+side*2,242,z),t(x+side*2,417,z),t(x+side*2,417,z+158),t(x+side*2,242,z+158)],'#71a8bb');if(detail){s.face([t(x+side*3,265,z+9),t(x+side*3,405,z+9),t(x+side*3,405,z+50),t(x+side*3,265,z+115)],'#b4d6dc');cuboid(s,t,side*335,224,z+75,18,50,64,'#294b5b');}}
  cuboid(s,t,side*384,309,535,60,14,28,'#172f39');cuboid(s,t,side*411,285,535,22,70,65,'#263d49');
 }
 // Split front windshield, rear glass, destination panels, bumpers and lamps.
 for(const z of [-577,577]){s.face([t(-280,235,z),t(280,235,z),t(280,420,z),t(-280,420,z)],'#163641');s.face([t(-255,260,z+(z>0?1:-1)),t(-255,403,z+(z>0?1:-1)),t(-75,403,z+(z>0?1:-1)),t(30,260,z+(z>0?1:-1))],'#92becb');cuboid(s,t,0,422,z,520,48,12,'#102a2e');cuboid(s,t,0,77,z,670,32,38,'#a9b9b9');for(const x of [-280,280]){cuboid(s,t,x,129,z,56,28,14,z<0?'#f16c59':'#fff4bf');cuboid(s,t,x,171,z,56,15,14,'#ffbf55');}cuboid(s,t,0,118,z,136,25,13,'#e6ce82');}
 s.text(t(0,449,-591),'SBFENT CITY','#f9d98c',43);s.text(t(0,449,591),'01 · CROWN CIRCUIT','#f9d98c',35);
 // Folding passenger doors and side route livery.
 s.face([t(365,82,318),t(365,426,318),t(365,426,520),t(365,82,520)],'#183d47');for(const z of [323,425])s.face([t(367,106,z),t(367,410,z),t(367,410,z+87),t(367,106,z+87)],'#689ca9');
 
}
export const RAMP_LENGTH=760,RAMP_HEIGHT=220;
export const rampDeckHeight=u=>RAMP_HEIGHT*Math.pow(Math.max(0,Math.min(1,u)),1.5);
export function rampApproachHeight(r,ramps,length=60000){for(const o of ramps){if((o.route||null)!==(r.route||null)||Math.abs(r.x-o.x)>=(o.width||.3))continue;const z=Math.floor(Math.max(0,r.distance)/length)*length+o.z,u=(r.distance-z+RAMP_LENGTH)/RAMP_LENGTH;if(u>=0&&u<=1)return rampDeckHeight(u);}return 0;}
export function drawLaunchRamp(s,at,width,time=0,reduced=false){
 const left=-width,right=width,n=8;
 for(let i=0;i<n;i++){const u=i/n,v=(i+1)/n,z=-RAMP_LENGTH+u*RAMP_LENGTH,zz=-RAMP_LENGTH+v*RAMP_LENGTH,y=rampDeckHeight(u)+7,yy=rampDeckHeight(v)+7;
  s.face([at(z,left,y),at(z,right,y),at(zz,right,yy),at(zz,left,yy)],i%2?'#41697b':'#48778a');
  for(const side of [-1,1]){const x=side*width;s.face([at(z,x,3),at(zz,x,3),at(zz,x,yy+12),at(z,x,y+12)],'#233e4e');s.face([at(z,x-side*.022,y+3),at(z,x,y+3),at(zz,x,yy+3),at(zz,x-side*.022,yy+3)],'#f5cf77');}
 }
 s.face([at(0,left,0),at(0,right,0),at(0,right,RAMP_HEIGHT+7),at(0,left,RAMP_HEIGHT+7)],'#192f3d');
 for(const side of [-1,1])for(let i=1;i<=3;i++){const u=i/4,z=-RAMP_LENGTH+u*RAMP_LENGTH,y=rampDeckHeight(u);s.face([at(z,side*width,0),at(z+35,side*width,0),at(z+35,side*width,y),at(z,side*width,y)],'#bd9b56');}
 // Painted chevrons follow the actual sloped deck rather than floating above it.
 const paint=(z,x)=>at(z,x,rampDeckHeight((z+RAMP_LENGTH)/RAMP_LENGTH)+12);
 for(const u of [.30,.57,.83]){const z=-RAMP_LENGTH+u*RAMP_LENGTH;for(const side of [-1,1])s.face([paint(z-60,side*width*.50),paint(z-95,side*width*.50),paint(z-20,0),paint(z+15,0)],'#f7dea1');}
 s.text(at(-RAMP_LENGTH-100,0,8),'JUMP','#f2d996',75);
}
export function drawStreetHazard(s,p,heading,type,time=0,detail=true){const t=local(p,heading);
 if(type==='cones'){for(const x of [-145,145]){cuboid(s,t,x,0,0,150,14,150,'#26323b');for(const [bottom,top,y,h,color] of [[57,25,14,95,'#f78732'],[25,14,109,38,'#f8ebd2'],[14,3,147,48,'#f78732']])for(let i=0;i<8;i++){const a=i/8*TAU,b=(i+1)/8*TAU;s.face([t(x+Math.cos(a)*bottom,y,Math.sin(a)*bottom),t(x+Math.cos(b)*bottom,y,Math.sin(b)*bottom),t(x+Math.cos(b)*top,y+h,Math.sin(b)*top),t(x+Math.cos(a)*top,y+h,Math.sin(a)*top)],color);}}return;}
 if(type==='barrels'){for(const x of [-100,100]){cylinder(s,t,x,0,0,78,195,'#c95b42');for(const y of [25,104,174])cylinder(s,t,x,y,0,82,13,y===104?'#f0dac1':'#54606a');cylinder(s,t,x,195,0,71,5,'#aa4b3b');if(detail)cylinder(s,t,x+25,200,12,12,3,'#293b43',8);}return;}
 if(type==='signs'){for(const x of [-80,80]){cuboid(s,t,x,0,0,18,175,18,'#86949a');cuboid(s,t,x,0,0,95,12,110,'#354b56');}const a=[[-160,215],[0,375],[160,215],[0,55]];s.face(a.map(([x,y])=>t(x,y,-12)),'#6f552c');s.face(a.map(([x,y])=>t(x*.91,215+(y-215)*.91,-15)),'#ffcf56');s.text(t(0,195,-20),'!', '#38372c',150);return;}
 // Portable striped roadwork barricade, with braces and amber beacons.
 for(const x of [-200,200]){cuboid(s,t,x,0,0,65,105,180,'#2c4551');cuboid(s,t,x,70,0,32,95,40,'#b9c5c4');}
 cuboid(s,t,0,105,0,490,85,45,'#f6e0aa');for(let x=-205;x<230;x+=85)s.face([t(x,110,-24),t(x+43,110,-24),t(x+85,185,-24),t(x+42,185,-24)],'#dc7937');
 for(const x of [-200,200]){cylinder(s,t,x,190,0,25,16,'#314851',8);cylinder(s,t,x,206,0,25,28,Math.sin(time*5)>0?'#ffcb65':'#d6903f',8);}
}
export function drawRoadPool(s,at,type){const color=type==='mud'?'#775135':type==='slime'?'#62ba8e':'#5e99ae',ring=Array.from({length:14},(_,i)=>{const a=i/14*TAU,r=1+(i%3-1)*.1;return at(Math.sin(a)*170*r,Math.cos(a)*.24*r,6);});s.face(ring,color);if(type==='puddle'){for(const offset of [-.1,.06])s.face([at(-100,offset,8),at(80,offset+.05,8),at(130,offset+.08,8),at(-70,offset+.03,8)],'#b8d7d8');}else for(const x of [-.11,.11])s.face([at(-160,x-.012,9),at(140,x-.012,9),at(140,x+.012,9),at(-160,x+.012,9)],type==='mud'?'#463e33':'#3c8b74');}
export function drawItemCrate(s,p,heading,time){const t=local(p,heading);cuboid(s,t,0,0,0,90,90,90,'#665ba6');for(const x of [-44,44])for(const z of [-44,44])cuboid(s,t,x,-3,z,12,97,12,'#e0c784');s.text(t(0,74,-49),'?','#fff4c2',72);s.text(t(0,74,49),'?','#fff4c2',72);}
export function drawStorefront(s,p,heading,side,index,height=700){const t=local(p,heading),x=-side*307,signs=['SBFENT RECORDS','CROWN ARCADE','JUICE BAR','FLEX GARAGE'];
 // Recessed shopfront, glazed door, striped awning and brick courses.
 s.face([t(x,8,-260),t(x,190,-260),t(x,190,260),t(x,8,260)],'#263d48');
 for(const z of [-180,140])s.face([t(x-side,28,z-65),t(x-side,164,z-65),t(x-side,164,z+65),t(x-side,28,z+65)],'#83b7bd');
 s.face([t(x-side*2,0,-35),t(x-side*2,172,-35),t(x-side*2,172,55),t(x-side*2,0,55)],'#9cbdbb');cuboid(s,t,x-side*4,75,42,8,24,5,'#f4d18c');
 for(let z=-280;z<280;z+=70){s.face([t(x,220,z),t(x-side*135,175,z),t(x-side*135,175,z+70),t(x,220,z+70)],Math.floor((z+280)/70)%2?'#e3c18c':'#2d7771');s.face([t(x-side*135,175,z),t(x-side*135,150,z),t(x-side*135,150,z+70),t(x-side*135,175,z+70)],'#e4c28d');}
 s.text(t(x-side*10,263,0),signs[index%signs.length],'#ffe0a0',49);
 for(const y of [300,490,680].filter(y=>y<height-30)){s.face([t(x-side*.5,y,-292),t(x-side*.5,y+4,-292),t(x-side*.5,y+4,292),t(x-side*.5,y,292)],'#d4aa7d');}
 // A cylindrical planter outside the shop, with clustered foliage.
 cylinder(s,t,x-side*170,0,230,62,62,'#b98c63');for(const [a,y] of [[0,62],[.8,90],[1.7,73]])cylinder(s,t,x-side*170+Math.sin(a)*20,y,230+Math.cos(a)*18,57,30,'#4f8362',8);
}

export function drawDistrictAccent(s,p,heading,side,track,time=0){const t=local(p,heading),road=-side;
 if(track===0){
  // Block-party speaker cart and record-shop flags, outside the shoulder.
  for(const z of [-140,140]){cuboid(s,t,0,0,z,220,340,170,'#2d4852');for(const y of [90,245]){const n=12;for(let i=0;i<n;i++){const a=i/n*TAU,b=(i+1)/n*TAU;s.face([t(road*112,y,z),t(road*113,y+Math.cos(a)*62,z+Math.sin(a)*62),t(road*113,y+Math.cos(b)*62,z+Math.sin(b)*62)],'#c8aa64');}}}s.text(t(0,410,0),'BLOCK PARTY','#f9d995',80);
 }else if(track===1){
  // Subway entrance beside the road. The canopy never spans the racing lane.
  for(const z of [-310,310])cuboid(s,t,road*20,0,z,40,400,40,'#244653');cuboid(s,t,-road*150,390,0,420,45,760,'#305e6d');cuboid(s,t,road*60,400,0,18,18,750,'#7de4dc');for(let z=-230;z<=230;z+=115)cuboid(s,t,-road*80,0,z,240,35,90,'#7c9197');s.text(t(road*70,330,0),'SBFENT METRO','#a1ebe1',75);s.text(t(road*70,235,0),'UNDERGROUND','#f1d5ad',45);
 }else if(track===2){
  // Shipping containers with ribs, doors and a short crane facing away from the road.
  for(const z of [-190,190]){cuboid(s,t,-road*160,0,z,360,220,310,z<0?'#936c4d':'#596f79');for(let x=-310;x<=-20;x+=48)cuboid(s,t,-road*Math.abs(x),10,z-157,14,198,9,'#b4a78c');}for(const z of [-430,430])cuboid(s,t,-road*390,0,z,55,800,55,'#e0af5c');cuboid(s,t,-road*390,760,0,75,80,930,'#cc974d');s.text(t(0,300,0),'FLEX FREIGHT','#ffe1a0',65);
 }else{
  // Skyline viewing terrace, gold railings and tilted solar panels.
  cuboid(s,t,-road*120,0,0,380,55,700,'#c1b8bd');for(const z of [-330,330]){cuboid(s,t,-road*290,55,z,24,175,24,'#dbbf7d');cuboid(s,t,-road*290,210,0,20,20,680,'#dfc88c');}for(const z of [-180,100])s.face([t(-road*20,70,z),t(-road*240,140,z),t(-road*240,140,z+190),t(-road*20,70,z+190)],'#345f7b');s.text(t(road*80,285,0),'CROWN SKYWAY','#ffe7b0',72);
 }
}
// Signature set pieces use recognizable vehicle details rather than plain blocks.
export function drawMetroCar(s,p,heading,time=0,index=0){const t=local(p,heading);cuboid(s,t,0,70,0,460,310,860,'#afbfc2');cuboid(s,t,0,380,0,420,40,820,'#5c7984');for(const side of [-1,1]){for(const z of [-330,-110,110,330]){cuboid(s,t,side*232,203,z,8,135,150,'#234758');cuboid(s,t,side*237,228,z-30,5,100,30,'#8cbac7');}cuboid(s,t,side*234,126,0,12,32,830,'#eac77d');for(const z of [-290,290])tire(s,t,side*215,62,z,time,true);}for(const z of [-433,433]){cuboid(s,t,0,190,z,360,150,10,'#1b3d4c');for(const x of [-170,170])cuboid(s,t,x,120,z,35,25,12,'#ffe9ab');}s.text(t(0,430,0),index===0?'SBFENT METRO':'CROWN LINE','#ffe4a4',65);}
export function drawFestivalStand(s,p,heading,side,time=0){const t=local(p,heading);for(const x of [-270,270])for(const z of [-230,230])cuboid(s,t,x,0,z,22,420,22,'#d7b66f');for(let x=-300;x<300;x+=100)s.face([t(x,420,-280),t(x+100,420,-280),t(x+100,500,0),t(x,500,0)],(x/100)%2?'#d67b9a':'#f2cf82');cuboid(s,t,0,0,0,560,160,430,'#3b8b7c');for(const x of [-170,170]){cuboid(s,t,x,160,0,120,180,120,'#233b4b');for(const y of [210,290])s.text(t(x,y,-65),'◉','#e4bf71',70);}s.text(t(0,560,0),'BLOCK PARTY','#ffe5aa',85);for(let i=0;i<3;i++){const x=-210+i*210,y=300+Math.sin(time*4+i)*14;s.text(t(x,y,-280),'★',['#f5ca70','#acdfcb','#d5b0e8'][i],55);}}
export function drawFreightHauler(s,p,heading,time=0){const t=local(p,heading);cuboid(s,t,0,80,-50,410,240,700,'#446d7c');cuboid(s,t,0,80,370,390,240,230,'#d5964e');cuboid(s,t,0,230,493,325,85,8,'#234657');cuboid(s,t,0,60,494,400,35,22,'#b5c3c4');for(const side of [-1,1]){for(const z of [-270,50,365])tire(s,t,side*218,65,z,time,true);for(let z=-365;z<250;z+=80)cuboid(s,t,side*207,90,z,12,215,10,'#7596a1');cuboid(s,t,side*150,135,497,40,25,10,'#fff1b0');}s.text(t(0,355,-50),'FLEX FREIGHT','#ffe1a3',65);}
