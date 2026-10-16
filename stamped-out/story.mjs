export const STORY_KEY='sbfent-story-v1';
export const ENCOUNTERS=[
 {opponent:1,title:'01 / Counterfeit trail',arena:'rooftop',text:'Bootleg stamps are flooding the block. Flex follows the first lead to the rooftop.',hint:'Bootlegger has long kicks. Block, close in, then confirm your punches.'},
 {opponent:11,title:'02 / No brakes',arena:'rooftop',text:'Redline guards the route to the block party. Win the fight and make him clear the way.',hint:'Block the rush. His chain stops on guard; punish the recovery.'},
 {opponent:12,title:'03 / Big Pressure',arena:'blockparty',text:'Big Pressure has the stolen shipment. Take back the stamp in front of the whole block.',hint:'His shoulder charge flashes gold and absorbs one light hit. Block, jump, or grab; punish the long recovery.'}
];
export const CHAPTERS=[
 {name:'Take Back the Stamp',reward:'BIG PRESSURE + CAROLINA BLOCK PARTY',boss:12,arena:'blockparty',encounters:ENCOUNTERS},
 {name:'Signal Lost',reward:'LADY STATIC + NEON UNDERGROUND',boss:13,arena:'underground',encounters:[
  {opponent:6,title:'01 / Follow the bass',arena:'blockparty',text:'The recovered shipment carries a hijacked broadcast signal. DJ Blackout knows where it started.',hint:'Block or jump his waves, then close the gap while he recovers.'},
  {opponent:5,title:'02 / Dead air',arena:'rooftop',text:'Onyx stands between Flex and the underground relay. Keep your timing sharp.',hint:'Avoid predictable punches into perfect guard. Mix your timing and threaten GRAB.'},
  {opponent:13,title:'03 / Lady Static',arena:'underground',text:'Lady Static is broadcasting counterfeit stamps from the Neon Underground. Shut her signal down.',hint:'Ground K plants a trap. Watch the cyan ring: jump, block, or hit Lady Static to break it. Punish the setup.'}
 ]}
];
export class StoryProgress{
 constructor(storage){this.storage=storage;this.chapters=[{next:0,cleared:false},{next:0,cleared:false}];this.active=0;this.saved=true;try{const v=JSON.parse(storage.getItem(STORY_KEY));if(v?.version===1)this.chapters[0]=this.valid(v);else if(v?.version===2){this.chapters=this.chapters.map((_,i)=>this.valid(v.chapters?.[i]));if(!this.chapters[0].cleared)this.chapters[1]={next:0,cleared:false};this.active=v.active===1&&this.chapters[0].cleared?1:0;}}catch{}}
 valid(v){const cleared=v?.cleared===true;return {cleared,next:Number.isInteger(v?.next)?Math.max(0,Math.min(cleared?3:2,v.next)):0};}
 get chapter(){return CHAPTERS[this.active];}
 get next(){return this.chapters[this.active].next;}
 get cleared(){return this.chapters[this.active].cleared;}
 get encounter(){return this.chapter.encounters[Math.min(this.next,2)];}
 get unlocked(){return this.chapters[0].cleared;}
 isUnlocked(character){return character===12?this.chapters[0].cleared:character===13?this.chapters[1].cleared:character<12;}
 arenaUnlocked(key){return key==='rooftop'||CHAPTERS.some((c,i)=>c.arena===key&&this.chapters[i].cleared);}
 select(chapter){if(!Number.isInteger(chapter)||!CHAPTERS[chapter]||chapter===1&&!this.unlocked)return false;this.active=chapter;this.persist();return true;}
 win(index){if(index!==this.next||this.next>=3)return false;const c=this.chapters[this.active];c.next++;c.cleared=c.cleared||c.next===3;this.persist();return true;}
 replay(){if(!this.cleared)return false;this.chapters[this.active].next=0;this.persist();return true;}
 persist(){try{this.storage.setItem(STORY_KEY,JSON.stringify({version:2,active:this.active,chapters:this.chapters}));this.saved=true;}catch{this.saved=false;}}
}
