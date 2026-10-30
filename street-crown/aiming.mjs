import {itemInfo} from './items.mjs';
// Straight throws retain their lane; only homing items can acquire another lane.
export function aimTarget(race,racer=race.player,item=racer.item){const spec=itemInfo(item);if(!spec?.speed||race.phase!=='racing'||racer.finishTime!==null||racer.rescue>0||racer.spin>0)return null;
 return race.racers.filter(other=>{const gap=other.distance-racer.distance,closing=spec.speed-other.speed;return other.id!==racer.id&&other.finishTime===null&&other.rescue<=0&&other.air<=.25&&(other.route||null)===(racer.route||null)&&gap>120&&closing>0&&gap<Math.min(8000,closing*4+220)&&(spec.homing||Math.abs(other.x-racer.x)<.28);}).sort((a,b)=>a.distance-b.distance)[0]||null;
}
export function aimLabel(race){const p=race.player,spec=itemInfo(p.item);if(!spec?.speed)return '';if(p.spin>0)return 'RECOVERING · HOLD YOUR ITEM';const target=aimTarget(race);if(!target)return spec.homing?'NO TARGET AHEAD':'STEER TO LINE UP';return target.shield>0||target.invuln>0?'TARGET GUARDED':spec.homing?'HOMING TARGET':'IN YOUR THROWING LINE';}
