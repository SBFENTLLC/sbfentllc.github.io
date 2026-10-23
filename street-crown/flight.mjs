export const FLIGHT_SECONDS=2,FLIGHT_COOLDOWN=12,FLIGHT_FUEL=0,FLIGHT_USES=5;
export function flightHeight(r){if(!r.flight||r.air<=0)return 0;const progress=1-Math.max(0,Math.min(1,r.air/(r.airTotal||FLIGHT_SECONDS)));return Math.sin(progress*Math.PI)*640;}
export function flightsLeft(r){return Math.max(0,FLIGHT_USES-(r.flights||0));}
export function canFly(race,id=0){const r=race.racers[id];return !!r&&(race.practice||flightsLeft(r)>0)&&race.phase==='racing'&&r.finishTime===null&&r.rescue<=0&&!(r.ghostTime>0)&&!(r.frozen>0)&&r.spin<=0&&r.air<=0&&(r.flightCd||0)<=0&&r.speed>=250&&r.fuel>=FLIGHT_FUEL;}
