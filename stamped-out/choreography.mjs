const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
// The model owns contact and damage. This supplies continuous visual poses
// for the same sequence clock, including both the attacker and the victim.
export function sequenceFighters(fighters,sequence){
 const out=fighters.map(f=>({...f,move:f.move?{...f.move}:null}));if(!sequence)return out;
 const s=sequence,a=out[s.id],b=out[s.target],t=s.elapsed,d=s.face,c=s.center;
 a.move=null;b.move=null;a.stun=0;b.stun=0;a.crouch=false;b.crouch=false;
 a.face=d;b.face=-d;a.pose=0;b.pose=5;a.x=c-d*85;b.x=c+d*65;a.y=0;b.y=0;
 if(s.kind==='throw'){
  const wind=clamp(t/.3,0,1),flight=clamp((t-.3)/.52,0,1);
  a.x=lerp(s.origin[0].x,c-d*80,smooth(wind));a.grapplePose=t<.15?0:t<.3?1:t<.6?2:3;
  if(s.id===1&&t>=.3&&t<.75)a.grapplePose=1;
  b.x=lerp(c-d*20,c+d*175,smooth(flight));b.y=t<.3?lerp(0,65,wind):Math.sin(flight*Math.PI)*175+65*(1-flight);
  b.rotation=t<.3?-.18*d:(flight*Math.PI*1.45)*d;
  if(t>=.82){b.x=c+d*175;b.y=0;b.rotation=-2.3*d;a.grapplePose=3;}
  return out;
 }
 if(s.id===0){
  // Body blow -> uppercut -> aerial carry -> two-handed crown-stamp slam.
  const approach=smooth(t/.32);a.x=lerp(s.origin[0].x,c-d*85,approach);
  if(t<.85){a.pose=Math.floor(t*13)%2?2:0;b.x=c+d*(65+Math.sin(t*20)*7);b.rotation=Math.sin(t*17)*.08;}
  else if(t<1.5){const p=(t-.85)/.65;a.pose=7;b.y=Math.sin(p*Math.PI/2)*145;b.rotation=-.25*d;b.x=c+d*80;}
  else if(t<2.25){const p=(t-1.5)/.75;a.x=c-d*30;a.y=Math.sin(p*Math.PI/2)*150;a.grapplePose=2;b.x=c+d*45;b.y=150+Math.sin(p*Math.PI)*25;b.rotation=.6*d;}
  else if(t<2.65){const p=smooth((t-2.25)/.4);a.x=c-d*50;a.y=150*(1-p);a.grapplePose=3;b.x=lerp(c+d*45,c+d*175,p);b.y=150*(1-p);b.rotation=lerp(.6,-2.3,p)*d;}
  else{a.x=c-d*80;a.grapplePose=3;b.x=c+d*175;b.rotation=-2.3*d;}
 }else{
  // Three alternating clone strikes, then an airborne kick through the center.
  if(t<1.95){const beat=Math.min(2,Math.floor(t/.6)),side=beat%2?-d:d;a.face=side;a.x=c-side*115;a.pose=Math.floor(t*12)%2?2:0;b.x=c+Math.sin(t*24)*13;b.rotation=Math.sin(t*21)*.12;}
  else if(t<2.7){const p=smooth((t-1.95)/.75);a.face=d;a.x=lerp(c-d*200,c+d*15,p);a.y=Math.sin(p*Math.PI)*135;a.grapplePose=2;b.x=c+d*lerp(0,100,p);b.y=Math.max(0,(p-.5)*60);}
  else{const p=smooth((t-2.7)/.55);a.x=lerp(c+d*15,c-d*80,p);a.y=(1-p)*25;a.grapplePose=3;b.x=c+d*175;b.y=Math.sin(p*Math.PI)*45;b.rotation=-2.3*d;}
 }
 return out;
}
