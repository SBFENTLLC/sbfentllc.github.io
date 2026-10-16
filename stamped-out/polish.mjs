export const DEFAULT_CONTROLS={size:'standard',hand:'right'};
export function loadControls(storage){try{const s=JSON.parse(storage.getItem('sbfent-controls')||'{}');return {size:s.size==='large'?'large':'standard',hand:s.hand==='left'?'left':'right'};}catch{return {...DEFAULT_CONTROLS};}}
export class MatchRecord {
 constructor(storage){this.storage=storage;this.saved={matches:0,wins:0,bestCombo:0};try{const s=JSON.parse(storage.getItem('sbfent-record')||'{}');for(const k of Object.keys(this.saved))if(Number.isSafeInteger(s[k])&&s[k]>=0)this.saved[k]=s[k];this.saved.wins=Math.min(this.saved.wins,this.saved.matches);}catch{}this.reset();}
 reset(training=false){this.training=training;this.finished=false;this.current={damage:0,hits:0,bestCombo:0,counters:0,punishes:0,throws:0,escapes:0};}
 event(e){const c=this.current;if(e.type==='hit'&&e.id===0){c.damage+=e.damage;c.hits++;c.bestCombo=Math.max(c.bestCombo,e.combo||1);if(e.counter)c.counters++;if(e.punish)c.punishes++;if(e.move==='throw')c.throws++;}if(e.type==='throwEscape'&&e.id===0)c.escapes++;
  if(e.type==='matchover'&&!this.finished){this.finished=true;if(!this.training){this.saved.matches++;if(e.winner===0)this.saved.wins++;this.saved.bestCombo=Math.max(this.saved.bestCombo,c.bestCombo);try{this.storage.setItem('sbfent-record',JSON.stringify(this.saved));}catch{}}}
 }
 get summary(){const c=this.current;return `${c.damage} damage · ${c.bestCombo} best combo · ${c.counters} counters · ${c.punishes} punishes · ${c.throws} throws`;}
 get label(){const s=this.saved;return s.matches?`${s.wins} W / ${s.matches-s.wins} L · BEST ${s.bestCombo} HIT COMBO`:'YOUR FIRST STAMP STARTS HERE';}
}
export const COACH={lowguard:'The dummy crouch-blocks. Low sweeps cause chip; grabs still beat guard.',jab:'Get within punch reach. The dummy jabs regularly. Time BLOCK, then tap P when Onyx’s counter is ready.',stand:'Get close. Tap P, then P → K as the punch lands. Only landed hits can chain.',guard:'The dummy holds BLOCK. Strikes chip; GRAB breaks the guard. Supers can be blocked.',jump:'The dummy jumps. Ground grabs miss airborne targets—wait for the landing.'};
