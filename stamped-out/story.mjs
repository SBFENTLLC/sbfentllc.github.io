export const STORY_KEY='sbfent-story-v1';
export const ENCOUNTERS=[
 {opponent:1,title:'01 / Counterfeit trail',arena:'rooftop',text:'Bootleg stamps are flooding the block. Flex follows the first lead to the rooftop.',hint:'Bootlegger has long kicks. Block, close in, then confirm your punches.'},
 {opponent:11,title:'02 / No brakes',arena:'rooftop',text:'Redline guards the route to the block party. Win the fight and make him clear the way.',hint:'Block the rush. His chain stops on guard; punish the recovery.'},
 {opponent:12,title:'03 / Big Pressure',arena:'blockparty',text:'Big Pressure has the stolen shipment. Take back the stamp in front of the whole block.',hint:'His shoulder charge flashes gold and absorbs one light hit. Block, jump, or grab; punish the long recovery.'}
];
export class StoryProgress{
 constructor(storage){this.storage=storage;this.next=0;this.cleared=false;this.saved=true;try{const v=JSON.parse(storage.getItem(STORY_KEY));if(v?.version===1){this.cleared=v.cleared===true;this.next=Number.isInteger(v.next)?Math.max(0,Math.min(this.cleared?3:2,v.next)):0;}}catch{}}
 get encounter(){return ENCOUNTERS[Math.min(this.next,2)];}
 get unlocked(){return this.cleared;}
 win(index){if(index!==this.next||this.next>=3)return false;this.next++;this.cleared=this.cleared||this.next===3;this.persist();return true;}
 replay(){if(!this.cleared)return false;this.next=0;this.persist();return true;}
 persist(){try{this.storage.setItem(STORY_KEY,JSON.stringify({version:1,next:this.next,cleared:this.cleared}));this.saved=true;}catch{this.saved=false;}}
}
