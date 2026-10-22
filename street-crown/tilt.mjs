const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function screenTilt(beta,gamma,angle=0){const a=angle*Math.PI/180;return gamma*Math.cos(a)+beta*Math.sin(a);}
class TiltSteering{
 constructor(env=globalThis){this.env=env;this.enabled=false;this.calibrated=false;this.zero=0;this.raw=0;this.output=0;this.updated=-Infinity;this.sensitivity=1;this.invert=false;this.angle=0;this.listener=e=>this.sample(e);this.motionListener=e=>this.motion(e);this.orientationAt=-Infinity;this.reason='';}
 now(){return this.env.performance?.now?.()??Date.now();}
 orientation(){return this.env.screen?.orientation?.angle??this.env.orientation??0;}
 async enable(){this.reason='';const C=this.env.DeviceOrientationEvent,M=this.env.DeviceMotionEvent;if(!C&&!M){this.reason='Motion sensors are unavailable in this viewer. Open the game in Safari.';return false;}try{
 // Request both iOS sensor permissions inside the same button gesture.
 const grants=await Promise.all([C,M].filter(Boolean).map(K=>typeof K.requestPermission==='function'?K.requestPermission():Promise.resolve('granted')));
 if(!grants.includes('granted')){this.reason='Motion permission was denied. Allow Motion & Orientation in Safari settings.';return false;}
 this.disable();this.enabled=true;this.calibrated=false;this.env.addEventListener('deviceorientation',this.listener,{passive:true});this.env.addEventListener('devicemotion',this.motionListener,{passive:true});return true;
 }catch{this.disable();this.reason='This viewer blocked motion access. Open the game in Safari and tap USE TILT.';return false;}}
 motion(e){if(!this.enabled)return;if(this.now()-this.orientationAt<500)return;const g=e.accelerationIncludingGravity;if(!g||!Number.isFinite(g.x)||!Number.isFinite(g.y)||!Number.isFinite(g.z)||Math.hypot(g.x,g.y,g.z)<2)return;const a=this.orientation()*Math.PI/180,side=g.x*Math.cos(a)-g.y*Math.sin(a),vertical=Math.hypot(g.x*Math.sin(a)+g.y*Math.cos(a),g.z);this.accept(Math.atan2(side,vertical)*180/Math.PI);}
 accept(raw){const angle=this.orientation();if(angle!==this.angle)this.calibrated=false;this.angle=angle;this.raw=raw;this.updated=this.now();if(!this.calibrated)this.calibrate();}
 disable(){this.env.removeEventListener?.('deviceorientation',this.listener);this.env.removeEventListener?.('devicemotion',this.motionListener);this.orientationAt=-Infinity;this.enabled=false;this.output=0;this.updated=-Infinity;}
 sample(e){if(!this.enabled||!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;this.orientationAt=this.now();this.accept(screenTilt(e.beta,e.gamma,this.orientation()));}
 calibrate(){if(!Number.isFinite(this.updated)||this.now()-this.updated>900)return false;this.zero=this.raw;this.output=0;this.calibrated=true;return true;}
 get hasSignal(){return this.enabled&&this.calibrated&&this.now()-this.updated<900;}
 value(dt=1/60){if(!this.hasSignal){this.output=0;return 0;}let angle=((this.raw-this.zero+540)%360)-180;angle*=this.invert?-1:1;const dead=2.5,target=Math.abs(angle)<=dead?0:Math.sign(angle)*clamp((Math.abs(angle)-dead)/(24/this.sensitivity),0,1);this.output+=(target-this.output)*Math.min(1,dt*10);return this.output;}
}

export {screenTilt,TiltSteering};
