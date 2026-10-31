import {caseBeat} from './detective-cases.mjs?v=deductions-v8';
import {evidenceNodes} from './detective-investigation.mjs?v=movement-v9';
export const STAFF=Object.freeze([
 {name:'Miss Renee',role:'Diner manager',x:-2,z:-5,intro:'I work this counter. I notice who comes in—and whose story changes.'},
 {name:'Keys',role:'Sound engineer',x:5,z:-16,intro:'You can erase a name from a sign-in sheet. The session still leaves a trace.'},
 {name:'Velvet',role:'Lounge host',x:-5,z:-15,intro:'I keep the guest list. A loud room does not make a quiet pickup invisible.'},
 {name:'Dee',role:'Warehouse dispatcher',x:2,z:-21,intro:'I log the deliveries. If the labels and the load disagree, I want to know why.'}
]);
export function staffDialogue(location,level=1,question='saw',{warehouse=false}={}){
 const person=STAFF[location],[lead,line]=caseBeat(location,level),node=evidenceNodes(location,level,{warehouse}).find(n=>n.active);
 const route=['Search between the parked rigs and pump islands outside, then check the diner booths and rear tables.','Check both sides of the control desk, the live room and the archive. The outdoor annex has its own trail.','Search the dance floor edges, behind the VIP booths, and the coat-check end of the club. The service lane continues outside.','Work the storage aisles, conveyor bay and loading dock. Leave the tall racks alone; use the clear cross aisles.'][location];
 return {title:question==='route'?'WHERE SHOULD I SEARCH?':question==='alibi'?'ANYONE ACTING SUSPICIOUS?':lead,tag:person.name.toUpperCase()+' · '+person.role.toUpperCase(),text:question==='route'?route+' This lead needs the '+node.name.toLowerCase()+' '+(node.inside?'inside the building.':'outside in the district.'):question==='alibi'?person.intro+' Compare the witness’s alibi with the physical records before you accuse anyone.':person.intro+' '+line+' Look for the '+node.name.toLowerCase()+', and question the lizards you catch.'};
}
export function recordStaff(record,location,level){const key=location*10+level-1;if(!record.staff.includes(key))record.staff.push(key);return record;}
