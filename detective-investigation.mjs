import {CASES,caseBeat} from './detective-cases.mjs';
export const INVESTIGATION_KEY='sbfent-detective-investigation-v1';
export const freshInvestigation=()=>({version:1,objects:[],witnesses:[]});
export function cleanInvestigation(v){if(!v||v.version!==1)return freshInvestigation();return {version:1,objects:[...new Set((Array.isArray(v.objects)?v.objects:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<12))],witnesses:[...new Set((Array.isArray(v.witnesses)?v.witnesses:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<400))]};}
const PROPS=[
 [{name:'Delivery crate',detail:'The broken seal and crown paint match the missing shipment.',kind:'crate'},{name:'Freight dispatch case',detail:'A duplicate route sheet connects the south freight lane to SBFENT Studio.',kind:'case'},{name:'Diner receipt',detail:'The receipt places the courier at the diner before the shipment left.',kind:'paper'}],
 [{name:'Studio access reader',detail:'The after-hours access log records a second visit to the archive.',kind:'case'},{name:'Session drive case',detail:'The annex recording preserves the background bass from Stamped Lounge.',kind:'case'},{name:'Archive folder',detail:'The copied security still identifies the lounge courier.',kind:'paper'}],
 [{name:'VIP guest list',detail:'The same courier appears on the lounge guest list under another name.',kind:'paper'},{name:'Service-lane crate',detail:'Its shipping seal matches the crate photographed at the truckstop.',kind:'crate'},{name:'Coat-check ledger',detail:'The pickup entry links the VIP room to the FBH loading dock.',kind:'paper'}],
 [{name:'Equipment dispatch case',detail:'The equipment log matches the vehicle seen leaving Stamped Lounge.',kind:'case'},{name:'South-lot shipping crate',detail:'The serial labels identify pieces from the missing SBFENT crown.',kind:'crate'},{name:'Warehouse inventory',detail:'The conveyor records and loading manifest account for the recovered shipment.',kind:'paper'}]
];
export function evidenceNodes(location,level=1,{warehouse=false,blocked=()=>false}={}){
 const spots=warehouse?[[2,-4,true],[-4,-15,true],[3,-26,true]]:[[4,8,false],[-4,43,false],[-3,-24,true]];
 return PROPS[location].map((p,i)=>{let [x,z,inside]=spots[i];if(blocked(x,z,inside)){let found=false;for(let r=1;r<=4&&!found;r++)for(const [dx,dz]of [[r,0],[-r,0],[0,r],[0,-r]])if(!blocked(x+dx,z+dz,inside)){x+=dx;z+=dz;found=true;break;}}return {...p,id:location*3+i,index:i,x,z,inside,active:i===(level-1)%3};});
}
export function inspectEvidence(record,node){const out=cleanInvestigation(record),fresh=!out.objects.includes(node.id);if(fresh)out.objects.push(node.id);return {record:out,fresh};}
export function recordWitness(record,location,level,id){const out=cleanInvestigation(record),key=location*100+(level-1)*10+id;if(!out.witnesses.includes(key))out.witnesses.push(key);return out;}
export function witnessDialogue(location,level,question='saw'){
 const c=CASES[location],[clue,line]=caseBeat(location,level);
 return question==='route'?{title:'WHICH WAY DID THEY GO?',text:['Follow the freight dispatch trail into the diner, then the studio.','The archive recording points to the Stamped Lounge service entrance.','The lounge pickup went to FBH Yard. Check the workshop and warehouse.','The trail runs through the storage racks, conveyor bay, and rear loading dock.'][location]}:{title:'WHAT DID YOU SEE?',text:line+' Check the '+clue.toLowerCase()+' before you close this lead.'};
}
export function evidenceSummary(v){const r=cleanInvestigation(v);return `${r.objects.length}/12 objects inspected · ${r.witnesses.length} witness statements`;}

export function investigationLog(v){const r=cleanInvestigation(v);return {objects:r.objects.map(id=>({name:PROPS[Math.floor(id/3)][id%3].name,text:PROPS[Math.floor(id/3)][id%3].detail})),witnesses:r.witnesses.slice(-4).reverse().map(key=>{const location=Math.floor(key/100),level=Math.floor(key%100/10)+1;return {name:CASES[location].place+' / LEAD '+level,text:caseBeat(location,level)[1]};})};}
