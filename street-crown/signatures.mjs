import {courseFrame,COURSE_LENGTH} from './course.mjs';
import {drawMetroCar,drawFestivalStand,drawFreightHauler} from './street-props.mjs';
export const SIGNATURES=Object.freeze([
 {id:'block-dash',name:'BLOCK PARTY DASH',start:7800,end:12000,hint:'FOLLOW THE GOLD COINS · COLLECT 5',kind:'coins',target:10},
 {id:'metro-chase',name:'BEAT THE METRO',start:17000,end:24000,hint:'BOOST ALONGSIDE THE TRAIN · BEAT ITS 4.2s RUN',kind:'time',target:4.2},
 {id:'freight-flight',name:'FREIGHT FLIGHT',start:26000,end:30300,hint:'RIGHT RAMP → JUMP THE HAULER · LAND CLEAN',kind:'jump',target:1},
 {id:'skyline-run',name:'SKYLINE CROWN RUN',start:30000,end:39100,hint:'TAKE ROOFTOP RUN → JUMP · LAND CLEAN',kind:'route',target:1},
 {id:'island-flight',name:'EMERALD AIR RUN',start:13000,end:17000,hint:'TAKE THE WIDE RAMP · LAND CLEAN',kind:'jump',target:1},
 {id:'cosmic-dash',name:'COSMIC COIN RUN',start:21000,end:25000,hint:'FOLLOW THE COIN LINE',kind:'coins',target:5}
]);
export function stepSignature(race,previous){const p=race.player,m=SIGNATURES[race.track];if(p.finishTime!==null)return;const lap=Math.floor(Math.max(0,previous)/COURSE_LENGTH),start=lap*COURSE_LENGTH+m.start,end=lap*COURSE_LENGTH+m.end;
 if(previous<start&&p.distance>=start&&!race.momentRuns.some(r=>r.lap===lap)){const run={lap,started:race.time,startCoins:p.coins,startLandings:p.cleanLandings||0,startJumps:p.jumps||0,routeSeen:false,done:false,success:false};race.momentRuns.push(run);race.emit('momentStart',{id:0,name:m.name,hint:m.hint});}
 const run=race.momentRuns.find(r=>r.lap===lap&&!r.done);if(!run)return;if(p.route==='roof')run.routeSeen=true;
 if(p.distance>=end){const landed=(p.cleanLandings||0)>run.startLandings,jumped=(p.jumps||0)>run.startJumps;run.done=true;run.elapsed=race.time-run.started;run.success=m.kind==='coins'?p.coins-run.startCoins>=m.target:m.kind==='time'?run.elapsed<=m.target:m.kind==='jump'?jumped&&landed:run.routeSeen&&jumped&&landed;if(run.success){p.signatureWins=(p.signatureWins||0)+1;p.stuntCoins+=40;}race.emit('momentEnd',{id:0,name:m.name,success:run.success});}
}
export function signatureStatus(race){const m=SIGNATURES[race.track],run=race.momentRuns?.find(r=>!r.done);if(!run)return null;const p=race.player,base=run.lap*COURSE_LENGTH,progress=Math.max(0,Math.min(1,(p.distance-base-m.start)/(m.end-m.start)));return {name:m.name,hint:m.kind==='time'?`${Math.max(0,m.target-race.time+run.started).toFixed(1)}s · BOOST TO BEAT THE TRAIN`:m.hint,progress};}
export function drawSignatureScene(s,race,time,reduced=false){const m=SIGNATURES[race.track],lap=Math.floor(Math.max(0,race.player.distance)/COURSE_LENGTH),frame=(d,l,h=0)=>courseFrame(d,l,h,race.track),near=d=>Math.abs(d-race.player.distance)<11500;
 if(race.track===0){for(const side of [-1,1]){const d=lap*COURSE_LENGTH+8900;if(near(d)){const f=frame(d,side*1.72);drawFestivalStand(s,f.position,f.heading,side,reduced?0:time);}}}
 if(race.track===1){const run=race.momentRuns?.find(r=>r.lap===lap),d=lap*COURSE_LENGTH+m.start+(run?Math.max(0,race.time-run.started)*((m.end-m.start)/m.target):0);if(d<lap*COURSE_LENGTH+m.end+2000&&near(d)){for(let i=0;i<3;i++){const f=frame(d-i*950,1.82);drawMetroCar(s,f.position,f.heading,reduced?0:time,i);}for(let a=Math.max(lap*COURSE_LENGTH+m.start-2500,race.player.distance-2500);a<Math.min(lap*COURSE_LENGTH+m.end+3000,race.player.distance+10000);a+=220){const f=frame(a,1.82),p=f.position;for(const side of [-1,1]){const x=f.right.map((v,i)=>p[i]+v*side*220+(i===1?-6:0));s.face([x,x.map((v,i)=>v+f.forward[i]*210),x.map((v,i)=>v+f.forward[i]*210+f.right[i]*12),x.map((v,i)=>v+f.right[i]*12)],'#b5c3c4');}}}}
 if(race.track===2){const d=lap*COURSE_LENGTH+28300;if(near(d)){const f=frame(d,.48);drawFreightHauler(s,f.position,f.heading,reduced?0:time);}}
 if(race.track===3){for(const d0 of [32400,38200])for(const side of [-1,1]){const d=lap*COURSE_LENGTH+d0;if(near(d)){const f=frame(d,side*1.58);s.text(f.position.map((v,i)=>v+(i===1?480:0)),d0===32400?'♛ SKYLINE RUN':'♛ CLEAN LANDING','#ffe6a6',105);}}}
}
