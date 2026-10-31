import {INVESTIGATION_KEY,cleanInvestigation} from './detective-investigation.mjs?v=deductions-v8';
import {OUTDOOR,INDOOR} from './detective-cases.mjs';
export const DETECTIVE_STORY_KEY='sbfent-detective-story-v2';
export const LEGACY_STORY_KEY='sbfent-story-v1';
export function validDetectiveStory(v){
 if(!v||v.version!==1||!Number.isInteger(v.location)||v.location<0||v.location>3||!Number.isInteger(v.level)||v.level<1||v.level>10||!Array.isArray(v.collected)||v.collected.length>10||new Set(v.collected).size!==v.collected.length||!v.collected.every(n=>Number.isInteger(n)&&n>=0&&n<10))return null;
 const out={version:1,location:v.location,level:v.level,collected:[...v.collected],complete:v.complete===true,inside:v.inside===true};
 if(typeof v.deduced==='boolean')out.deduced=v.deduced;
 if(typeof v.investigated==='boolean')out.investigated=v.investigated;
 const p=v.player,b=out.inside?INDOOR:OUTDOOR,bound=b.maxX;
 if(p&&Number.isFinite(p.x)&&Math.abs(p.x)<=bound&&Number.isFinite(p.z)&&p.z>=b.minZ&&p.z<=b.maxZ&&Number.isFinite(p.yaw))out.player={x:p.x,z:p.z,yaw:p.yaw%(Math.PI*2)};
 return out;
}
export function loadDetectiveStory(storage){
 try{const current=validDetectiveStory(JSON.parse(storage.getItem(DETECTIVE_STORY_KEY)));if(current)return current;}catch{}
 // Detective and Stamped Out once shared a key. Only migrate a detective-shaped
 // record; never alter or delete the fighting game's record.
 try{const legacy=validDetectiveStory(JSON.parse(storage.getItem(LEGACY_STORY_KEY)));if(legacy){try{storage.setItem(DETECTIVE_STORY_KEY,JSON.stringify(legacy));}catch{}return legacy;}}catch{}
 return null;
}
export function saveDetectiveStory(storage,value){const v=validDetectiveStory(value);if(!v)throw Error('Invalid detective progress.');storage.setItem(DETECTIVE_STORY_KEY,JSON.stringify(v));return v;}
export function searchClue(targets,inside){const here=targets.filter(t=>t.inside===inside).length,other=targets.length-here;return here?here+' lizard'+(here===1?'':'s')+' left '+(inside?'inside':'outside')+'. Scan to reveal them.':other?'Area clear! '+(inside?'Go outside':'Enter the building')+' for '+other+' more.':'All found! Case section complete.';}
const FILES_KEY='sbfent-detective-files-v1';
const cleanFiles=v=>Array.isArray(v)?[...new Set(v.filter(n=>Number.isInteger(n)&&n>=0&&n<10))]:[];
const KEYS=[DETECTIVE_STORY_KEY,'sbfent-flex-bucks','sbfent-detective-flex-best',FILES_KEY,'sbfent-detective-flex-best-120',INVESTIGATION_KEY];
export function exportDetective(storage){let files=[];try{files=cleanFiles(JSON.parse(storage.getItem(FILES_KEY)||'[]'));}catch{}return JSON.stringify({game:'sbfent-detective-flex',version:1,files,investigation:cleanInvestigation((()=>{try{return JSON.parse(storage.getItem(INVESTIGATION_KEY));}catch{return null;}})()),best120:Number(storage.getItem(KEYS[4]))||0,story:loadDetectiveStory(storage),bucks:Number(storage.getItem(KEYS[1]))||0,best:Number(storage.getItem(KEYS[2]))||0},null,2);}
export function restoreDetective(storage,text){
 if(typeof text!=='string'||text.length>20000)throw Error('Choose a Detective Flex backup under 20 KB.');
 const v=JSON.parse(text),story=v.story===null?null:validDetectiveStory(v.story);
 if(v.game!=='sbfent-detective-flex'||v.version!==1||v.story!==null&&!story||![v.bucks,v.best].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000000))throw Error('This is not a valid Detective Flex backup.');
 if(v.best120!==undefined&&(!Number.isSafeInteger(v.best120)||v.best120<0||v.best120>1000000000))throw Error('Invalid standard-hunt score.');
 const before=KEYS.map(k=>storage.getItem(k)),after=[story?JSON.stringify(story):null,String(v.bucks),String(v.best),v.files===undefined?before[3]:JSON.stringify(cleanFiles(v.files)),v.best120===undefined?before[4]:String(v.best120),v.investigation===undefined?before[5]:JSON.stringify(cleanInvestigation(v.investigation))];
 try{KEYS.forEach((k,i)=>after[i]===null?storage.removeItem(k):storage.setItem(k,after[i]));}
 catch(error){KEYS.forEach((k,i)=>{try{before[i]===null?storage.removeItem(k):storage.setItem(k,before[i]);}catch{}});throw error;}
}
