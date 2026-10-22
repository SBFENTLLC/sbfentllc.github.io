import {portraitFor} from "./racer-assets.mjs";
const placeSuffix = n => n===1?'ST':n===2?'ND':n===3?'RD':'TH';

class RaceStandings {
 constructor(root,position,suffix,roster,doc=globalThis.document){Object.assign(this,{root,position,suffix,roster,doc});this.rows=new Map();}
 start(racers){
  this.rows.clear();
  const nodes=racers.map(r=>{
   const d=this.roster[r.char],row=this.doc.createElement('div'),face=this.doc.createElement('span'),img=this.doc.createElement('img'),rank=this.doc.createElement('b'),you=this.doc.createElement('span'),status=this.doc.createElement('span');
   row.className='standing'+(r.id===0?' is-player':'')+(d.id===16?' is-juice':'');row.setAttribute('role','listitem');
   face.className='standing-face';img.src=portraitFor(d.id);img.alt='';img.draggable=false;face.append(img);
   rank.className='standing-rank';you.className='standing-you';you.textContent=r.id===0?'♛':'';status.className='standing-status';status.textContent='';
   row.append(face,rank,you,status);this.rows.set(r.id,{row,rank,status,name:d.name});return row;
  });
  this.root.replaceChildren(...nodes);this.update(racers);
 }
 update(ordered){
  ordered.forEach((r,index)=>{
   const entry=this.rows.get(r.id);if(!entry)return;const place=index+1;
   if(entry.place!==place){entry.place=place;entry.row.style.order=String(index);entry.rank.textContent=String(place);entry.row.setAttribute('aria-label',`${place}${placeSuffix(place).toLowerCase()}: ${entry.name}${r.id===0?', you':''}`);entry.row.dataset.place=String(place);}
   entry.status.textContent=r.rescue>0?'↺':r.spin>0||r.dazed>0?'✦':r.shield>0?'⬡':r.nitro?'↟':r.slow>0?'!':'';
   if(r.id===0){this.position.textContent=String(place);this.suffix.textContent=placeSuffix(place);}
  });
 }
}

export {placeSuffix,RaceStandings};
