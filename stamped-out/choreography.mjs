const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
// The model owns contact and damage. This supplies continuous visual poses
// for the same sequence clock, including both the attacker and the victim.
export function sequenceFighters(fighters,sequence){
 const out=fighters.map(f=>({...f,move:f.move?{...f.move}:null}));if(!sequence)return out;
 const s=sequence,a=out[s.id],b=out[s.target],t=s.elapsed,d=s.face,c=s.center,character=s.character??s.id;
 a.move=null;b.move=null;a.stun=0;b.stun=0;a.crouch=false;b.crouch=false;
 a.face=d;b.face=-d;a.pose=0;b.pose=5;a.x=c-d*85;b.x=c+d*65;a.y=0;b.y=0;
 if(s.kind==='throw'){
  const throwEnd=character===9?125:175,wind=clamp(t/.3,0,1),flight=clamp((t-.3)/.52,0,1);
  a.x=lerp(s.origin[0].x,c-d*80,smooth(wind));a.grapplePose=t<.15?0:t<.3?1:t<.6?2:3;
  if(character===1&&t>=.3&&t<.75)a.grapplePose=1;
  b.x=lerp(c-d*20,c+d*throwEnd,smooth(flight));b.y=t<.3?lerp(0,65,wind):Math.sin(flight*Math.PI)*175+65*(1-flight);
  b.rotation=t<.3?-.18*d:(flight*Math.PI*1.45)*d;
  if(t>=.82){b.x=c+d*throwEnd;b.y=0;b.rotation=-2.3*d;a.grapplePose=3;}
  if(character>=2){a.grapplePose=undefined;a.pose=t<.3?4:t<.65?7:3;if(character===3){a.y=t>.3&&t<.82?Math.sin(flight*Math.PI)*95:0;a.rotation=t>.3&&t<.82?-flight*Math.PI*1.2*d:0;}else a.rotation=t>.3&&t<.82?-.16*d:0;}
  if(character===4){a.pose=t<.3?4:t<.65?7:2;a.rotation=t>.3&&t<.82?-.06*d:0;}if(character===5){a.pose=t<.3?4:2;a.x=lerp(c-d*80,c-d*115,smooth(flight));}
  if(character===6)a.pose=7;if(character===7)a.pose=t<.3?4:2;
  if(character===8){a.pose=t<.3?4:7;a.x=lerp(c-d*100,c-d*80,smooth(flight));}
  if(character===9){a.pose=t<.3?4:t<.82?7:2;a.rotation=t>.3&&t<.82?flight*.3*d:0;}
  if(character===10){a.pose=t<.3?4:3;a.rotation=t>.3&&t<.82?-flight*.35*d:0;}
  if(character===11)a.pose=t<.3?4:2;
  return out;
 }
 if(character===0){
  // Body blow -> uppercut -> aerial carry -> two-handed crown-stamp slam.
  const approach=smooth(t/.32);a.x=lerp(s.origin[0].x,c-d*85,approach);
  if(t<.85){a.pose=Math.floor(t*13)%2?2:0;b.x=c+d*(65+Math.sin(t*20)*7);b.rotation=Math.sin(t*17)*.08;}
  else if(t<1.5){const p=(t-.85)/.65;a.pose=7;b.y=Math.sin(p*Math.PI/2)*145;b.rotation=-.25*d;b.x=c+d*80;}
  else if(t<2.25){const p=(t-1.5)/.75;a.x=c-d*30;a.y=Math.sin(p*Math.PI/2)*150;a.grapplePose=2;b.x=c+d*45;b.y=150+Math.sin(p*Math.PI)*25;b.rotation=.6*d;}
  else if(t<2.65){const p=smooth((t-2.25)/.4);a.x=c-d*50;a.y=150*(1-p);a.grapplePose=3;b.x=lerp(c+d*45,c+d*175,p);b.y=150*(1-p);b.rotation=lerp(.6,-2.3,p)*d;}
  else{a.x=c-d*80;a.grapplePose=3;b.x=c+d*175;b.rotation=-2.3*d;}
 }else if(character===1){
  // Three alternating clone strikes, then an airborne kick through the center.
  if(t<1.95){const beat=Math.min(2,Math.floor(t/.6)),side=beat%2?-d:d;a.face=side;a.x=c-side*115;a.pose=Math.floor(t*12)%2?2:0;b.x=c+Math.sin(t*24)*13;b.rotation=Math.sin(t*21)*.12;}
  else if(t<2.7){const p=smooth((t-1.95)/.75);a.face=d;a.x=lerp(c-d*200,c+d*15,p);a.y=Math.sin(p*Math.PI)*135;a.grapplePose=2;b.x=c+d*lerp(0,100,p);b.y=Math.max(0,(p-.5)*60);}
  else{const p=smooth((t-2.7)/.55);a.x=lerp(c+d*15,c-d*80,p);a.y=(1-p)*25;a.grapplePose=3;b.x=c+d*175;b.y=Math.sin(p*Math.PI)*45;b.rotation=-2.3*d;}
 }else if(character===2){
  // Foxy crosses the center on alternating kick passes, then a heel drop.
  if(t<1.95){const pass=Math.min(2,Math.floor(t/.58)),p=(t-pass*.58)/.58,side=pass%2?-d:d;a.face=side;a.pose=3;a.x=lerp(c-side*145,c+side*90,smooth(p));a.y=Math.sin(clamp(p,0,1)*Math.PI)*45;b.x=c+Math.sin(t*22)*12;b.rotation=Math.sin(t*15)*.08;}
  else if(t<2.55){const p=(t-1.95)/.6;a.face=d;a.pose=3;a.x=lerp(c-d*130,c-d*25,smooth(p));a.y=Math.sin(p*Math.PI)*145;a.rotation=-p*.8*d;b.x=c+d*65;b.y=p*35;}
  else{const p=smooth((t-2.55)/.5);a.pose=4;a.x=lerp(c-d*25,c-d*80,p);b.x=c+d*175;b.rotation=-2.3*d;b.y=Math.sin(p*Math.PI)*30;}
 }else if(character===3){
  // Clara launches, follows into the air, and corkscrews down through a kick.
  if(t<1.02){a.pose=t<.38?2:7;b.y=Math.max(0,(t-.35)/.67)*125;a.x=c-d*75;b.x=c+d*65;b.rotation=-.25*d;}
  else if(t<2.45){const p=(t-1.02)/1.43;a.pose=3;a.x=c-d*50+Math.sin(p*Math.PI)*55;a.y=120+Math.sin(p*Math.PI)*75;a.rotation=p*Math.PI*2*d;b.x=c+d*70;b.y=125+Math.sin(p*Math.PI)*65;b.rotation=-p*.6*d;}
  else if(t<2.85){const p=smooth((t-2.45)/.4);a.pose=3;a.x=lerp(c-d*50,c-d*20,p);a.y=120*(1-p);a.rotation=(1-p)*Math.PI*2*d;b.x=lerp(c+d*70,c+d*175,p);b.y=125*(1-p);b.rotation=-2.3*p*d;}
  else{a.pose=7;a.x=c-d*80;b.x=c+d*175;b.rotation=-2.3*d;}
 }else if(character===4){
  // Goldie catches, hoists, carries overhead, then drives a powerbomb down.
  a.x=c-d*75;a.pose=t<.42?4:7;
  if(t<1.08){const p=smooth(t/1.08);b.x=lerp(c+d*65,c+d*15,p);b.y=p*95;b.rotation=p*.4*d;}
  else if(t<2.42){const p=(t-1.08)/1.34;a.y=Math.sin(p*Math.PI)*30;b.x=c+d*10;b.y=145+Math.sin(p*Math.PI)*45;b.rotation=(.4+p*Math.PI*.7)*d;}
  else if(t<2.9){const p=smooth((t-2.42)/.48);a.pose=2;a.x=lerp(c-d*75,c-d*35,p);b.x=lerp(c+d*10,c+d*175,p);b.y=145*(1-p);b.rotation=lerp(Math.PI*.7,-2.3,p)*d;}
  else{a.pose=7;a.x=c-d*80;b.x=c+d*175;b.rotation=-2.3*d;}
 }else if(character===5){
  // Onyx slips back, reverses with a straight, and circles for the last hit.
  if(t<.3){a.pose=4;a.x=lerp(c-d*70,c-d*135,smooth(t/.3));}
  else if(t<1.5){const pass=Math.floor((t-.3)/.6),side=pass%2?-d:d,p=(t-.3-pass*.6)/.6;a.pose=2;a.face=side;a.x=lerp(c-side*155,c-side*115,smooth(p));b.x=c+Math.sin(t*23)*9;b.rotation=Math.sin(t*18)*.1;}
  else if(t<2.6){const p=(t-1.5)/1.1;a.pose=2;a.face=d;a.x=lerp(c-d*160,c-d*35,smooth(p));a.y=Math.sin(p*Math.PI)*35;b.x=c+d*lerp(40,90,p);b.y=p*65;b.rotation=-p*.5*d;}
  else{const p=smooth((t-2.6)/.5);a.pose=7;a.x=lerp(c-d*35,c-d*80,p);b.x=c+d*175;b.y=(1-p)*65;b.rotation=-2.3*d;}
 }else if(character===6){
  // DJ holds the sound lane, lifts with rising bass, then drops the final beat.
  a.pose=7;a.x=c-d*155;
  if(t<.98){b.x=c+d*50+Math.sin(t*24)*10;b.rotation=Math.sin(t*20)*.1;}
  else if(t<2.3){const p=(t-.98)/1.32;b.x=c+d*80;b.y=80*Math.sin(p*Math.PI/2);a.y=Math.sin(p*Math.PI)*30;b.rotation=-.35*d;}
  else if(t<2.8){const p=smooth((t-2.3)/.5);a.pose=3;b.x=lerp(c+d*80,c+d*175,p);b.y=80*(1-p);b.rotation=-2.3*p*d;}
  else{a.pose=7;a.x=c-d*80;b.x=c+d*175;b.rotation=-2.3*d;}
 }else if(character===7){
  // Quiet Money advances behind guard, works the body, then commits a straight.
  if(t<1.05){a.pose=t<.42?4:2;a.x=lerp(c-d*140,c-d*95,smooth(t/1.05));b.x=c+d*65;b.rotation=Math.sin(t*22)*.08;}
  else if(t<2.15){a.pose=Math.floor(t*10)%2?2:4;a.x=c-d*95;b.x=c+d*70;b.y=Math.max(0,Math.sin((t-1.05)*3)*35);}
  else if(t<2.75){const p=(t-2.15)/.6;a.pose=p<.55?4:2;a.x=lerp(c-d*130,c-d*45,smooth(p));b.x=c+d*75;}
  else{const p=smooth((t-2.75)/.5);a.pose=2;a.x=lerp(c-d*45,c-d*80,p);b.x=c+d*175;b.y=Math.sin(p*Math.PI)*55;b.rotation=-2.3*d;}
 }else if(character===8){
  // Lime dash passes cross on three beats before a rising palm finish.
  if(t<1.95){const pass=Math.min(2,Math.floor(t/.58)),p=(t-pass*.58)/.58,side=pass%2?-d:d;a.pose=2;a.face=side;a.x=lerp(c-side*190,c+side*75,smooth(p));b.x=c+Math.sin(t*20)*10;b.rotation=Math.sin(t*22)*.1;}
  else if(t<2.55){const p=(t-1.95)/.6;a.face=d;a.pose=7;a.x=lerp(c-d*140,c-d*45,smooth(p));a.y=Math.sin(p*Math.PI)*70;b.x=c+d*85;b.y=p*100;b.rotation=-p*.4*d;}
  else{const p=smooth((t-2.55)/.5);a.pose=7;a.x=c-d*80;b.x=c+d*175;b.y=(1-p)*100;b.rotation=-2.3*d;}
 }else if(character===9){
  // Clinch into a carried spinning powerbomb.
  a.pose=t<.42?4:7;a.x=c-d*80;
  if(t<1.08){const p=smooth(t/1.08);b.x=lerp(c+d*65,c+d*20,p);b.y=p*110;b.rotation=p*.3*d;}
  else if(t<2.6){const p=(t-1.08)/1.52;a.y=Math.sin(p*Math.PI)*70;a.rotation=p*Math.PI*2*d;b.x=c+d*25;b.y=130+Math.sin(p*Math.PI)*55;b.rotation=(.3+p*Math.PI*2)*d;}
  else if(t<3.08){const p=smooth((t-2.6)/.48);a.pose=2;a.y=50*(1-p);b.x=lerp(c+d*25,c+d*175,p);b.y=130*(1-p);b.rotation=lerp(Math.PI*2,-2.3,p)*d;}
  else{a.pose=7;b.x=c+d*175;b.rotation=-2.3*d;}
 }else if(character===10){
  // A low sweep turns into a rising violet kick spiral and heel drop.
  if(t<1.02){a.pose=3;a.x=c-d*95;a.rotation=Math.sin(t*5)*.25*d;b.x=c+d*60;b.y=t>.38?30:0;b.rotation=(t>.38?.45:0)*d;}
  else if(t<2.35){const p=(t-1.02)/1.33;a.pose=7;a.x=c-d*60;a.y=Math.sin(p*Math.PI/2)*145;a.rotation=p*Math.PI*2*d;b.x=c+d*70;b.y=70+Math.sin(p*Math.PI/2)*80;b.rotation=p*.7*d;}
  else if(t<2.82){const p=smooth((t-2.35)/.47);a.pose=3;a.x=c-d*40;a.y=145*(1-p);b.x=lerp(c+d*70,c+d*175,p);b.y=150*(1-p);b.rotation=-2.3*p*d;}
  else{a.pose=7;a.x=c-d*80;b.x=c+d*175;b.rotation=-2.3*d;}
 }else if(character===11){
  // Redline drives a rushing three-punch string into a leaping uppercut.
  if(t<1.8){a.pose=Math.floor(t*14)%2?2:0;a.x=lerp(c-d*170,c-d*75,smooth(t/1.8));b.x=c+d*65+Math.sin(t*23)*8;b.rotation=Math.sin(t*20)*.08;}
  else if(t<2.6){const p=(t-1.8)/.8;a.pose=7;a.x=lerp(c-d*75,c-d*25,smooth(p));a.y=Math.sin(p*Math.PI/2)*120;b.x=c+d*85;b.y=p*160;b.rotation=-p*.5*d;}
  else{const p=smooth((t-2.6)/.5);a.pose=7;a.x=lerp(c-d*25,c-d*80,p);a.y=120*(1-p);b.x=c+d*175;b.y=160*(1-p);b.rotation=-2.3*d;}
 }
 if(character===12){
  a.pose=t<.45?4:t<1.15?2:7;a.x=c-d*80;
  if(t<1.15){b.x=c+d*40;b.y=smooth(t/1.15)*135;b.rotation=-.25*d;}
  else if(t<1.95){const p=smooth((t-1.15)/.8);b.x=c+d*65;b.y=135*(1-p);b.rotation=-2.3*p*d;}
  else if(t<3.05){const p=(t-1.95)/1.1;a.y=Math.sin(p*Math.PI)*75;b.x=c+d*75;b.y=Math.sin(p*Math.PI)*180;b.rotation=(-2.3+p*4)*d;}
  else{a.pose=3;b.x=c+d*175;b.y=0;b.rotation=-2.3*d;}
 }
 if(character===13){
  // Trap cage launches the victim, then a grounded lightning command slams.
  a.pose=t<.4?3:7;a.x=c-d*125;b.x=c+d*65;
  if(t<1.12){b.y=smooth(t/1.12)*100;b.rotation=Math.sin(t*18)*.12;}
  else if(t<2.6){b.y=110+Math.sin((t-1.12)/1.48*Math.PI)*55;b.rotation=Math.sin(t*22)*.2;}
  else if(t<3){const p=smooth((t-2.6)/.4);b.y=110*(1-p);b.rotation=-2.3*p*d;b.x=lerp(c+d*65,c+d*175,p);}
  else{a.pose=7;b.x=c+d*175;b.y=0;b.rotation=-2.3*d;}
 }
 if(character===14){
  // Braced body blows, freight carry, then a shoulder-driven final launch.
  a.x=c-d*85;a.pose=t<.42?4:t<1.4?2:7;
  if(t<1.4){b.x=c+d*60;b.rotation=Math.sin(t*16)*.1*d;}
  else if(t<2.35){const p=(t-1.4)/.95;a.x=lerp(c-d*130,c-d*45,smooth(p));b.x=lerp(c+d*40,c+d*105,smooth(p));b.y=Math.sin(p*Math.PI)*90;b.rotation=p*.4*d;}
  else if(t<2.95){const p=smooth((t-2.35)/.6);a.x=lerp(c-d*140,c-d*50,p);b.x=lerp(c+d*100,c+d*175,p);b.y=Math.sin(p*Math.PI)*100;b.rotation=p*1.5*d;}
  else{a.pose=7;a.x=c-d*80;b.x=c+d*175;b.y=0;b.rotation=-2.3*d;}
 }
 if(character===15){
  // The fake crown combines stolen rushes, a long straight and a heavy slam.
  if(t<1.3){const side=Math.floor(t/.55)%2?-d:d;a.face=side;a.pose=2;a.x=c-side*95;b.x=c+Math.sin(t*18)*10;b.rotation=Math.sin(t*15)*.12;}
  else if(t<1.9){const p=(t-1.3)/.6;a.face=d;a.pose=2;a.x=lerp(c-d*155,c-d*65,smooth(p));b.x=c+d*85;b.y=p*125;b.rotation=-p*.4*d;}
  else if(t<2.65){const p=(t-1.9)/.75;a.pose=7;a.face=d;a.x=c-d*60;a.y=Math.sin(p*Math.PI)*95;b.x=c+d*80;b.y=125+Math.sin(p*Math.PI)*60;b.rotation=p*.65*d;}
  else if(t<3.05){const p=smooth((t-2.65)/.4);a.pose=7;a.face=d;a.y=0;b.x=lerp(c+d*80,c+d*175,p);b.y=125*(1-p);b.rotation=-2.3*p*d;}
  else{a.pose=7;a.face=d;a.x=c-d*80;b.x=c+d*175;b.y=0;b.rotation=-2.3*d;}
 }
 return out;
}



