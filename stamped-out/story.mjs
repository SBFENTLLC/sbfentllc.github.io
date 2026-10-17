import {availableArena} from './arenas.mjs';
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
 ]},
 {name:'Heavy Freight',reward:'IRON HAUL + FLEX MOTOR YARD',boss:14,arena:'motoryard',encounters:[
  {opponent:9,title:'01 / Freight check',arena:'blockparty',text:'The signal points to stolen cargo leaving the city. Big Stamp holds the freight manifest.',hint:'Stay outside his grab range. Bait a slow approach, then punish. Tap GRAB quickly if caught.'},
  {opponent:7,title:'02 / Follow the money',arena:'underground',text:'Quiet Money financed the convoy. Flex needs the destination before the trucks roll out.',hint:'Grabs beat his strong guard. Bait a heavy straight and punish its long recovery.'},
  {opponent:14,title:'03 / Iron Haul',arena:'motoryard',text:'Iron Haul is loading the last truck at Flex Motor Yard. Stop the convoy and take back the cargo.',hint:'K braces, then P unleashes a heavy armored straight. It absorbs one light hit during wind-up. Grab, use a heavy strike, or block and punish recovery.'}
 ]},
 {name:'The Real Crown',reward:'THE FALSE KING + CROWN PENTHOUSE',boss:15,arena:'penthouse',encounters:[
  {opponent:8,title:'01 / Last delivery',arena:'motoryard',text:'The convoy is stopped, but Neon Nova carries one final crown upstairs. Flex has to catch her first.',hint:'Block her dash and punish its recovery. Her speed is high, but clean punches still stop her approach.'},
  {opponent:4,title:'02 / Gold at the gate',arena:'underground',text:'Goldie guards the penthouse access. Take the key and finish what started on the rooftop.',hint:'Avoid walking into her clinch. Bait a missed grab, punish, and be ready to escape a throw.'},
  {opponent:15,title:'03 / The False King',arena:'penthouse',text:'The counterfeit crown belongs to one man. Flex steps into Crown Penthouse to take the whole operation down.',hint:'Watch his named stance: RUSH is quick, REACH has long punches, POWER is slow and heavy. K switches stance during a vulnerable pause. Block, bait a miss, then punish.'}
 ]}

];
export class StoryProgress{
 constructor(storage){this.storage=storage;this.chapters=CHAPTERS.map(()=>({next:0,cleared:false}));this.active=0;this.saved=true;try{const v=JSON.parse(storage.getItem(STORY_KEY));if(v?.version===1)this.chapters[0]=this.valid(v);else if(v?.version===2||v?.version===3||v?.version===4){this.chapters=this.chapters.map((_,i)=>this.valid(v.chapters?.[i]));for(let i=1;i<this.chapters.length;i++)if(!this.chapters[i-1].cleared)this.chapters[i]={next:0,cleared:false};this.active=Number.isInteger(v.active)&&this.chapters[v.active]&&(v.active===0||this.chapters[v.active-1].cleared)?v.active:0;}}catch{}}
 valid(v){const cleared=v?.cleared===true;return {cleared,next:Number.isInteger(v?.next)?Math.max(0,Math.min(cleared?3:2,v.next)):0};}
 get chapter(){return CHAPTERS[this.active];}
 get next(){return this.chapters[this.active].next;}
 get cleared(){return this.chapters[this.active].cleared;}
 get encounter(){return this.chapter.encounters[Math.min(this.next,2)];}
 get unlocked(){return this.chapters[0].cleared;}
 isUnlocked(character){return character>=12?this.chapters[character-12]?.cleared===true:character>=0&&character<12;}
 arenaUnlocked(key){return availableArena(key,this.chapters);}
 select(chapter){if(!Number.isInteger(chapter)||!CHAPTERS[chapter]||chapter>0&&!this.chapters[chapter-1].cleared)return false;this.active=chapter;this.persist();return true;}
 win(index){if(index!==this.next||this.next>=3)return false;const c=this.chapters[this.active];c.next++;c.cleared=c.cleared||c.next===3;this.persist();return true;}
 advanceChapter(){if(!this.cleared||this.active>=CHAPTERS.length-1)return false;return this.select(this.active+1);}
 replay(){if(!this.cleared)return false;this.chapters[this.active].next=0;this.persist();return true;}
 persist(){try{this.storage.setItem(STORY_KEY,JSON.stringify({version:4,active:this.active,chapters:this.chapters}));this.saved=true;}catch{this.saved=false;}}
}

// CPU decisions get gradually quicker; damage and the selected difficulty
// rules do not change. Arcade/training keep their usual pace.
export const storyPace=(chapter,encounter)=>.85+Math.max(0,Math.min(11,chapter*3+encounter))*.035;
