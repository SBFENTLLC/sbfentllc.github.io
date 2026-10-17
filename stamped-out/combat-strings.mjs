// Ground strings are hit-confirmed and capped; whiffs and guard cannot cancel.
export const COMBO_ROUTES=['P P P K','P K P K','K P P K','K K P K','DOWN+P P K','P P DOWN+K'];
export function strikeVariant(name,chain=0,{crouch=false,running=false}={}){
 if(name!=='punch'&&name!=='kick')return null;
 if(crouch)return name==='punch'?{variant:'body hook',low:true,damageFactor:.82,rangeBonus:0}:{variant:'low sweep',low:true,sweep:true,damageFactor:.85,rangeBonus:14};
 if(running)return {variant:name==='punch'?'running straight':'running side kick',damageFactor:1,rangeBonus:20};
 return {variant:(name==='punch'?['jab','cross','hook','uppercut','straight']:['front kick','roundhouse','heel kick','side kick','roundhouse'])[Math.min(chain,4)],damageFactor:Math.max(.55,1-chain*.12),rangeBonus:Math.min(chain*7,21)};
}
export function canGroundChain(f,name){return !!f.move?.connected&&!f.move.airborne&&['punch','kick'].includes(f.move.name)&&['punch','kick'].includes(name)&&!f.move.stanceShift&&!f.move.braceSetup&&!f.move.load&&!f.move.counter&&(f.character!==15||f.move.low)&&f.chain<(f.character===0||f.character===11?4:3);}
