// Simulation consumes ordinary slow frames; small collision probes prevent tunnelling.
export function frameDelta(elapsed){return Math.min(.25,Math.max(0,Number(elapsed)||0));}
export function moveDetective(player,forward,strafe,speed,elapsed,blocked){
 const dt=frameDelta(elapsed),length=Math.max(1,Math.hypot(forward,strafe)),dx=(Math.sin(player.yaw)*forward+Math.cos(player.yaw)*strafe)/length*speed*dt,dz=(-Math.cos(player.yaw)*forward+Math.sin(player.yaw)*strafe)/length*speed*dt;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));let distance=0;
 for(let i=0;i<steps;i++){const x=player.x,z=player.z;if(!blocked(player.x+dx/steps,player.z))player.x+=dx/steps;if(!blocked(player.x,player.z+dz/steps))player.z+=dz/steps;distance+=Math.hypot(player.x-x,player.z-z);}
 return distance;
}
export function smoothAngle(current,target,dt){if(current===null||!Number.isFinite(current))return target;const difference=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+difference*(1-Math.exp(-14*frameDelta(dt)));}
export function animateFrames(actor,key,index,dt){
 if(actor.key!==key){actor.key=key;actor.index=actor.previous=index;actor.mix=1;}
 else if(actor.index!==index){actor.previous=actor.index;actor.index=index;actor.mix=0;}
 else actor.mix=Math.min(1,actor.mix+frameDelta(dt)/.065);
 return {index:actor.index,previous:actor.previous,mix:actor.mix};
}
