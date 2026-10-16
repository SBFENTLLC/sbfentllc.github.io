import {CHAPTERS} from './story.mjs';
export const STORY_SCENES=[
 [
  {before:[['NARRATOR','A familiar crown is appearing on bills all over the block. The stamp is wrong. Someone is selling Flex’s name.'],['FLEX','That crown belongs to the people who built it. Tell me where the shipment went.'],['BOOTLEGGER','You want answers? Come take them.']],after:[['BOOTLEGGER','Redline moved the last box. He’s still on the roof.'],['FLEX','Then the trail doesn’t end here. Nobody gets to sell a fake version of our story.']]},
  {before:[['NARRATOR','Footsteps race over the rooftop. Redline waits by the fire escape, blocking the route to the block party.'],['REDLINE','You caught the runner. Let’s see if you can stop the rush.'],['FLEX','I’m not here to race. I’m here for that shipment.']],after:[['REDLINE','Big Pressure has it. The whole block is watching him tonight.'],['FLEX','Good. They can watch me bring it home.']]},
  {before:[['NARRATOR','The block party falls quiet. Big Pressure stands over crates marked with the stolen stamp.'],['BIG PRESSURE','This block moves when I say it moves.'],['FLEX','Then tonight it moves with me.']],after:[['NARRATOR','The crowd erupts. Flex breaks open the shipment and returns the real bills to the block.'],['FLEX','Wait. These boxes have relay numbers on them. This wasn’t just a street hustle.'],['NARRATOR','CHAPTER COMPLETE. Big Pressure and Carolina Block Party are unlocked. The signal leads underground.']]}
 ],
 [
  {before:[['NARRATOR','A pirate signal cuts through the block party speakers. Flex follows the bass to DJ Blackout.'],['DJ BLACKOUT','That signal hijacked my set. You think I’m giving up my booth without a fight?'],['FLEX','I need the source. Drop the noise and listen.']],after:[['DJ BLACKOUT','A relay under the city. Onyx is keeping everyone away from it.'],['FLEX','Keep the real music playing. I’ll handle the rest.']]},
  {before:[['NARRATOR','Above the relay entrance, Onyx waits without a word. Every move Flex makes is being measured.'],['ONYX','The next door costs more than strength. Show me your timing.'],['FLEX','Then watch closely.']],after:[['ONYX','You earned the way through. Lady Static is behind the broadcast.'],['FLEX','Respect. Now it’s time to turn her signal off.']]},
  {before:[['NARRATOR','Neon cables light the tunnel. Every screen repeats the counterfeit crown. Lady Static owns the frequency.'],['LADY STATIC','One signal. A thousand copies. You can’t punch a broadcast.'],['FLEX','I only have to reach the person running it.']],after:[['NARRATOR','The transmitters go dark. One final message flashes: FREIGHT CLEARED FOR DEPARTURE.'],['FLEX','They’re moving the rest out of the city. Not tonight.'],['NARRATOR','CHAPTER COMPLETE. Lady Static and Neon Underground are unlocked. Follow the freight.']]}
 ],
 [
  {before:[['NARRATOR','The block party loading dock is nearly empty. Big Stamp holds the last freight manifest.'],['BIG STAMP','Every load gets my approval. You don’t have it.'],['FLEX','Put the paperwork down. We’re doing this in person.']],after:[['BIG STAMP','Quiet Money paid for the convoy. He’s waiting at the underground exchange.'],['FLEX','Then I know whose account to close.']]},
  {before:[['NARRATOR','Below the city, Quiet Money calmly closes a ledger. The stolen stamp has funded every truck in the yard.'],['QUIET MONEY','The numbers are already settled. You arrived too late.'],['FLEX','I’m changing the balance.']],after:[['QUIET MONEY','Iron Haul has the final cargo. The destination is a private penthouse.'],['FLEX','First the trucks. Then the man upstairs.']]},
  {before:[['NARRATOR','Engines roar at Flex Motor Yard. Iron Haul stands between Flex and the last departing truck.'],['IRON HAUL','This load goes through. Nobody stops a full delivery.'],['FLEX','That’s my stamp on those crates. Your route ends here.']],after:[['NARRATOR','The convoy stops. Inside the truck, Flex finds a golden crown and an address above the city.'],['FLEX','Neon Nova took the last one upstairs. We’re close.'],['NARRATOR','CHAPTER COMPLETE. Iron Haul and Flex Motor Yard are unlocked. The real crown is within reach.']]}
 ],
 [
  {before:[['NARRATOR','Nova’s final delivery is about to leave the motor yard. The city lights reflect off the counterfeit crown.'],['NEON NOVA','You stopped the convoy. You won’t catch the express.'],['FLEX','You’re running out of road.']],after:[['NEON NOVA','Goldie has the penthouse key. Find her at the underground gate.'],['FLEX','No more deliveries. I’m going straight to the source.']]},
  {before:[['NARRATOR','The penthouse lift waits behind a guarded gate. Goldie turns its only key between her fingers.'],['GOLDIE','A crown has weight. You sure you can carry it?'],['FLEX','I never carried it alone. This is for the whole block.']],after:[['GOLDIE','Take the key. He’s expecting someone who bows.'],['FLEX','He’s about to be disappointed.']]},
  {before:[['NARRATOR','Above the city, the False King sits beneath a stolen symbol. Four trails have led to this room.'],['THE FALSE KING','I gave your stamp an empire. You should thank me.'],['FLEX','You copied the crown. You never earned the story.']],after:[['NARRATOR','The counterfeit crown hits the floor. Across the city, the false stamps go dark.'],['FLEX','Music. The people. The work. That’s what makes a real stamp.'],['NARRATOR','THE REAL CROWN. Flex returns to the block. All four bosses and arenas are unlocked. Your story stays saved.']]}
 ]
];
export class StoryCinema{
 constructor(){this.scene=null;this.page=0;this.elapsed=0;}
 open(chapter,index,moment='before'){
  const entry=STORY_SCENES[chapter]?.[index];if(!entry||!['before','after','defeat'].includes(moment))throw Error('Unknown story scene');
  this.page=0;this.elapsed=0;this.scene={chapter,index,moment,arena:CHAPTERS[chapter].encounters[index].arena,opponent:CHAPTERS[chapter].encounters[index].opponent,title:CHAPTERS[chapter].name,
   lines:moment==='defeat'?[['NARRATOR','The trail is still there. Flex takes a breath, studies the last exchange, and gets ready to try again.'],['FLEX','One setback doesn’t erase the work. Run it back.']]:entry[moment]};return this.current;
 }
 get active(){return this.scene!==null;}
 get current(){return this.scene?{...this.scene,speaker:this.scene.lines[this.page][0],text:this.scene.lines[this.page][1],page:this.page,total:this.scene.lines.length,last:this.page===this.scene.lines.length-1}:null;}
 next(){if(!this.scene)return false;if(++this.page>=this.scene.lines.length){this.close();return false;}return true;}
 close(){this.scene=null;this.page=0;}
 tick(dt){if(this.scene)this.elapsed+=Math.max(0,Math.min(dt,.05));}
}
export function drawStoryCutouts(ctx,fx,scene,time,outfits=[0,0]){
 if(!scene)return;const t=fx.reduced?0:Math.min(1,time),progress=fx.reduced?1:Math.min(1,time*2);
 ctx.save();ctx.fillStyle='#0c0816b8';ctx.fillRect(0,0,1000,562.5);
 ctx.fillStyle='#1d1038c9';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(570,0);ctx.lineTo(390,430);ctx.lineTo(0,430);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#e8c77b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(570,0);ctx.lineTo(390,430);ctx.stroke();
 const winner=scene.moment==='after';
 fx.rawSprite(ctx,{id:0,character:0,outfit:outfits[0],x:260-(1-progress)*55,y:30,face:1,pose:winner?7:4,rotation:0},winner?7:4);
 fx.rawSprite(ctx,{id:1,character:scene.opponent,outfit:outfits[1],x:755+(1-progress)*55,y:30,face:-1,pose:winner?5:0,rotation:winner?-.08:0},winner?5:0);
 ctx.fillStyle='#080610';ctx.fillRect(0,0,1000,40);ctx.fillRect(0,426,1000,137);ctx.textAlign='center';ctx.font='900 13px Arial';ctx.fillStyle='#ebd3a0';ctx.fillText('CHAPTER '+(scene.chapter+1)+' / '+scene.title.toUpperCase(),500,26);
 ctx.restore();
}
