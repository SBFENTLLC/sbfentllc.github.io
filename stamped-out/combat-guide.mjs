import {powerFor} from './powers.mjs';
import {fighterFor} from './roster.mjs';
export function combatGuide(character){
 const f=fighterFor({character});
 return {name:f.name,style:f.style,combo:f.combo,tip:f.tip,
  power:powerFor(character).name+' · Tap POWER for your space-making attack. Block or jump incoming shots; wait for recharge.',special:f.special+' · Fill the stamp meter, get in range, then tap ♛. A guard can stop it.',
  counter:f.weakness};
}
// Continue the same story session; the roster menu is only for a deliberate exit.
export function advanceStory(story){
 if(story.next<3)return 'encounter';
 if(story.active<3&&story.select(story.active+1)){if(story.next>=3)story.replay();return 'chapter';}
 return 'complete';
}
