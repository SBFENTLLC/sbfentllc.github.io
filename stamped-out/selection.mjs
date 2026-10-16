import {FIGHTERS} from './roster.mjs';
export function setupSelection(fx,onChange=()=>{},isUnlocked=()=>false){
 const $=id=>document.getElementById(id);let player=0,opponent=1;
 function update(){
  for(const f of FIGHTERS){const locked=f.boss&&!isUnlocked(f.index);$('pick'+f.index).disabled=locked;$('pick'+f.index).setAttribute('aria-label',locked?f.name+' — unlock in story mode':f.name);} 
  $('playerBoss').disabled=$('opponentBoss').disabled=!isUnlocked(12);$('playerStatic').disabled=$('opponentStatic').disabled=!isUnlocked(13);$('playerHaul').disabled=$('opponentHaul').disabled=!isUnlocked(14);$('playerKing').disabled=$('opponentKing').disabled=!isUnlocked(15);
  $('playerCharacter').value=String(player);$('opponentCharacter').value=String(opponent);
  for(const f of FIGHTERS)$('pick'+f.index).setAttribute('aria-pressed',String(player===f.index));
  const f=FIGHTERS[player];$('fighterDetail').textContent=`${f.name} · ${f.style}. ${f.strength}. Weakness: ${f.weakness}. Combo: ${f.combo}.`;
  onChange([player,opponent]);
 }
 for(const f of FIGHTERS)$('pick'+f.index).addEventListener('click',()=>{if(!f.boss||isUnlocked(f.index)){player=f.index;update();}});
 $('playerCharacter').addEventListener('change',()=>{player=Number($('playerCharacter').value);if(!FIGHTERS[player]||FIGHTERS[player].boss&&!isUnlocked(player))player=0;update();});
 $('opponentCharacter').addEventListener('change',()=>{opponent=Number($('opponentCharacter').value);if(!FIGHTERS[opponent]||FIGHTERS[opponent].boss&&!isUnlocked(opponent))opponent=1;update();});
 update();
 return {
  refresh:update,
  get characters(){return [player,opponent];},
  drawPortraits(){for(const f of FIGHTERS){const c=$('portrait'+f.index),ctx=c.getContext?.('2d');if(!ctx)continue;ctx.clearRect(0,0,150,160);ctx.save();ctx.scale(.44,.44);fx.rawSprite(ctx,{id:0,character:f.index,x:170,y:150,face:1,stun:0,knockdown:0,move:null},0);ctx.restore();}}
 };
}
