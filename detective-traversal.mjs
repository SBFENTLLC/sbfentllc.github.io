import {frameDelta} from './detective-motion.mjs?v=movement-v9';
// Rounded shoulders slide past furniture corners; height gates are used only by a validated vault.
export function circleBlocked(x,z,colliders,bounds,clearance=0,radius=.32){
 const [x0,x1,z0,z1]=bounds;if(x<x0||x>x1||z<z0||z>z1)return true;
 return colliders.some(o=>(o.top??Infinity)>clearance&&Math.hypot(x-Math.max(o.x0,Math.min(o.x1,x)),z-Math.max(o.z0,Math.min(o.z1,z)))<radius);
}
export function planVault(player,heading,colliders,bounds){
 const dx=Math.sin(heading),dz=-Math.cos(heading),at=(d,h=0)=>circleBlocked(player.x+dx*d,player.z+dz*d,colliders,bounds,h);
 if(at(0))return null;let obstruction=false;
 for(let d=.15;d<=4.65;d+=.15){if(at(d,1.46))return null;if(at(d)){if(!obstruction&&d>1.25)return null;obstruction=true;}else if(obstruction&&!at(d+.35)&&!at(d+.65))return {x:player.x+dx*(d+.35),z:player.z+dz*(d+.35)};}
 return null;
}
export function jumpPose(time,duration=.78){const p=Math.max(0,Math.min(1,time/duration));return {height:Math.sin(Math.PI*p)*1.65,progress:p,landed:p===1};}
export function easeLocomotion(motion,forward,strafe,elapsed){
 if(Math.hypot(forward,strafe)<=.025){motion.forward=motion.strafe=0;return motion;}const dt=frameDelta(elapsed),n=Math.max(1,Math.hypot(forward,strafe)),active=Math.hypot(forward,strafe)>.025,a=1-Math.exp(-dt/(active?.085:.035));
 motion.forward=(motion.forward||0)+(forward/n-(motion.forward||0))*a;motion.strafe=(motion.strafe||0)+(strafe/n-(motion.strafe||0))*a;
 if(!active&&Math.hypot(motion.forward,motion.strafe)<.015)motion.forward=motion.strafe=0;return motion;
}
