import {hasAlternate,outfitFor,outfitName,loadOutfits} from './outfits.mjs';
import {FIGHTERS} from './roster.mjs';
export function setupSelection(fx,onChange=()=>{},isUnlocked=()=>false,storage={getItem:()=>null,setItem(){}}){
 const $=id=>document.getElementById(id);let player=0,opponent=1;const looks=loadOutfits(storage);
 function update(){
  for(const f of FIGHTERS){const locked=f.boss&&!isUnlocked(f.index);$('pick'+f.index).disabled=locked;$('pick'+f.index).setAttribute('aria-label',locked?f.name+' — unlock in story mode':f.name);} 
  $('playerBoss').disabled=$('opponentBoss').disabled=!isUnlocked(12);$('playerStatic').disabled=$('opponentStatic').disabled=!isUnlocked(13);$('playerHaul').disabled=$('opponentHaul').disabled=!isUnlocked(14);$('playerKing').disabled=$('opponentKing').disabled=!isUnlocked(15);
  for(const [slot,character] of [['player',player],['opponent',opponent]]){const supported=hasAlternate(character);$(slot+'Alternate').disabled=!supported;$(slot+'Alternate').textContent=supported?outfitName(character):'Alternate outfit · coming later';$(slot+'Outfit').value=String(outfitFor(character,looks[slot][character]));}
  $('playerCharacter').value=String(player);$('opponentCharacter').value=String(opponent);
  for(const f of FIGHTERS)$('pick'+f.index).setAttribute('aria-pressed',String(player===f.index));
  const f=FIGHTERS[player];$('fighterDetail').textContent=`${f.name} · ${f.style}. ${f.strength}. Weakness: ${f.weakness}. Combo: ${f.combo}.`;
  onChange([player,opponent]);drawPortraits();
 }
 for(const f of FIGHTERS)$('pick'+f.index).addEventListener('click',()=>{if(!f.boss||isUnlocked(f.index)){player=f.index;update();}});
 $('playerCharacter').addEventListener('change',()=>{player=Number($('playerCharacter').value);if(!FIGHTERS[player]||FIGHTERS[player].boss&&!isUnlocked(player))player=0;update();});
 $('opponentCharacter').addEventListener('change',()=>{opponent=Number($('opponentCharacter').value);if(!FIGHTERS[opponent]||FIGHTERS[opponent].boss&&!isUnlocked(opponent))opponent=1;update();});
 function drawPortraits(){for(const f of FIGHTERS){const c=$('portrait'+f.index),ctx=c.getContext?.('2d');if(!ctx)continue;ctx.clearRect(0,0,150,160);ctx.save();ctx.scale(.44,.44);fx.rawSprite(ctx,{id:0,character:f.index,outfit:outfitFor(f.index,looks.player[f.index]),x:170,y:150,face:1,stun:0,knockdown:0,move:null},0);ctx.restore();}}
 for(const slot of ['player','opponent'])$(slot+'Outfit').addEventListener('change',()=>{const character=slot==='player'?player:opponent;looks[slot][character]=outfitFor(character,$(slot+'Outfit').value);try{storage.setItem('sbfent-outfits',JSON.stringify(looks));}catch{}update();});
 update();
 return {
  refresh:update,
  get characters(){return [player,opponent];},
  get outfits(){return [outfitFor(player,looks.player[player]),outfitFor(opponent,looks.opponent[opponent])];},
  outfitFor:(character,slot='player')=>outfitFor(character,looks[slot][character]),
  drawPortraits
 };
}
