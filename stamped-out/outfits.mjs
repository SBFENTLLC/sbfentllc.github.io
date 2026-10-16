export const hasAlternate=character=>character===0||character===1;
export const outfitFor=(character,outfit)=>hasAlternate(character)&&Number(outfit)===1?1:0;
export const outfitName=character=>character===0?'Purple SBFENT tracksuit':'Blue SBFENT tracksuit';
export function loadOutfits(storage){let v;try{v=JSON.parse(storage.getItem('sbfent-outfits')||'{}');}catch{}return Object.fromEntries(['player','opponent'].map(slot=>[slot,{0:outfitFor(0,v?.[slot]?.[0]),1:outfitFor(1,v?.[slot]?.[1])}]));}
