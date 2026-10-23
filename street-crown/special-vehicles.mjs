import {paintBox} from './geometry.mjs';
import {vehicleFor,paintFor} from './garage-expansion.mjs';
// Shared showroom/race geometry: small, readable toy racers with real silhouettes.
export function drawSpecialVehicle(s,p,heading,char,vehicle,cosmetics,img,time=0,reduced=false,driverRenderer=null,boost=false,shield=false){
 const v=vehicleFor(vehicle);if(!v)return false;
 const paint=paintFor(cosmetics),body=paint?.body||v.body,accent=paint?.accent||v.accent;
 const monster=vehicle==='monster',hover=vehicle==='hover',formula=vehicle==='formula',rocket=vehicle==='rocket',drift=vehicle==='drifter';
 const bob=hover&&!reduced?Math.sin(time*4)*7:0,lift=monster?150:hover?100:formula?40:65;
 const t=(x,y,z)=>[p[0]+x*Math.cos(heading)+z*Math.sin(heading),p[1]+y+bob,p[2]-x*Math.sin(heading)+z*Math.cos(heading)];
 const box=(x,y,z,w,h,d,color)=>paintBox(s,[[-1,0,-1],[1,0,-1],[1,0,1],[-1,0,1],[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]].map(([a,b,c])=>t(x+a*w/2,y+b*h,z+c*d/2)),color);
 const face=(pts,color)=>s.face(pts.map(a=>t(...a)),color);
 const hull=(sections,color)=>{for(let i=0;i<sections.length-1;i++){const a=sections[i],b=sections[i+1];face([[-a[1],a[2],a[0]],[a[1],a[2],a[0]],[b[1],b[2],b[0]],[-b[1],b[2],b[0]]],color);for(const side of [-1,1])face([[side*a[1],lift,a[0]],[side*b[1],lift,b[0]],[side*b[1],b[2],b[0]],[side*a[1],a[2],a[0]]],color);}
 const a=sections[0],b=sections.at(-1);for(const q of [a,b])face([[-q[1],lift,q[0]],[q[1],lift,q[0]],[q[1],q[2],q[0]],[-q[1],q[2],q[0]]],color);};
 // The long nose of the formula and jet cars contrasts with coupe/hover bodies.
 hull(formula?[[-205,105,lift+40],[-80,100,lift+85],[75,65,lift+60],[255,32,lift+25]]:rocket?[[-220,130,lift+55],[-40,150,lift+90],[150,90,lift+55],[270,45,lift+20]]:[[-205,145,lift+45],[-145,168,lift+75],[70,153,lift+90],[190,130,lift+45],[215,105,lift+20]],body);
 // Racing stripe, curved fender wedges and split headlights.
 face([[-20,lift+92,70],[20,lift+92,70],[14,lift+48,188],[-14,lift+48,188]],accent);
 for(const side of [-1,1]){box(side*(formula?80:112),lift+29,198,formula?35:58,10,10,'#dcfbff');if(!formula)face([[side*145,lift+20,-165],[side*183,lift+16,-130],[side*175,lift+58,-95],[side*148,lift+73,-135]],accent);box(side*100,lift+25,-211,50,9,9,'#ff5a86');}
 // Open cockpit, padded seat and driver; all characters keep their identity.
 box(0,lift+63,-30,128,35,105,'#142633');box(0,lift+68,-62,112,58,25,accent);
 if(driverRenderer)driverRenderer(s,t(0,lift+75,-20),char,body,heading,.68);
 else if(img&&(img.naturalWidth||img.width))s.sprite(t(0,lift+240,-20),img,150,140,{crop:[.2,.02,.6,.38],pivot:.5});
 face([[-70,lift+100,45],[70,lift+100,45],[60,lift+139,15],[-60,lift+139,15]],'#93d5e2');
 const radius=monster?100:formula?65:68,axle=monster?210:formula?188:174;
 for(const side of [-1,1]){
  box(side*130,lift-8,0,15,16,310,accent);
  if(hover){hullPod(side);continue;}
  for(const z of [-140,140]){const x=side*axle,cy=radius,at=(xx,a,r)=>t(xx,cy+Math.cos(a)*r,z+Math.sin(a)*r);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,b=(i+1)/12*Math.PI*2;s.face([at(x-29,a,radius),at(x+29,a,radius),at(x+29,b,radius),at(x-29,b,radius)],i%2?'#18232d':'#293d49');const out=x+side*30;s.face([at(out,a,radius),at(out,b,radius),at(out,b,radius*.65),at(out,a,radius*.65)],'#0d1822');const spin=reduced?0:time*2;s.face([t(out,cy,z),at(out,a+spin,radius*.62),at(out,b+spin,radius*.62)],i%2?accent:'#4c6a7b');}s.text(t(x+side*32,cy,z),'♛',accent,32);if(monster)box(side*125,75,z,14,90,14,'#dbe7df');}
 }
 function hullPod(side){box(side*206,45,0,85,38,350,'#223c56');box(side*206,35,0,87,12,330,accent);for(const z of [-135,135]){box(side*207,20,z,65,18,65,'#8beeff');s.text(t(side*207,83,z),'✦',accent,42);}}
 const wing=(width,height,z)=>{for(const side of [-1,1])box(side*90,lift+60,z,12,height-60,15,'#253948');box(0,lift+height,z,width,12,48,accent);for(const side of [-1,1])box(side*width/2,lift+height-14,z,10,38,60,body);};
 if(formula){wing(375,110,-190);box(0,lift,240,310,12,45,accent);for(const side of [-1,1])box(side*74,lift+124,-62,12,55,15,accent);box(0,lift+178,-62,160,12,15,accent);}
 else if(monster){box(0,lift+169,-120,270,14,30,'#253948');for(const x of [-100,-35,35,100])box(x,lift+177,-120,34,27,20,'#fff1b0');box(0,lift-10,219,290,30,24,'#73828a');}
 else if(hover||rocket){wing(hover?340:300,145,-180);for(const side of [-1,1]){face([[side*105,lift+65,-140],[side*195,lift+170,-220],[side*174,lift+45,-210]],accent);box(side*82,lift+20,-228,60,50,65,'#23394e');box(side*82,lift+25,-264,44,38,8,'#93eeff');}}
 else {wing(drift?365:315,130,-184);if(!drift)box(0,lift+148,-184,315,7,35,body);}
 if(drift){for(const side of [-1,1]){box(side*90,lift+75,-145,65,70,40,'#152635');s.text(t(side*90,lift+112,-169),'◎',accent,65);}for(const z of [-130,0,130])box(0,10,z,260,5,30,accent);}
 if(boost)for(const side of [-1,1]){const len=100+(reduced?0:Math.sin(time*35)*30);face([[side*65-18,lift+15,-250],[side*65+18,lift+15,-250],[side*65,lift+23,-250-len]],'#73eaff');}
 if(shield)for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box(Math.cos(a)*250,18,Math.sin(a)*270,18,20,18,'#9beeff');}
 s.text(t(0,lift+70,-221),'SBFENT',accent,28);s.text(t(0,lift+112,110),'♛',accent,43);s.text(t(0,lift+49,214),String(char+1).padStart(2,'0'),accent,23);return true;
}
