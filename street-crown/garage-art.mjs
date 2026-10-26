// Card canvases need another paint if their racer artwork arrives after opening.
const pending=new WeakMap();
export function paintGarageCards(root,image,draw){
 pending.get(root)?.();pending.delete(root);
 const paint=()=>root.querySelectorAll('[data-vehicle-art]').forEach(draw);
 paint();
 if(!image||image.complete&&image.naturalWidth)return;
 const loaded=()=>{pending.delete(root);paint();};
 image.addEventListener('load',loaded,{once:true});
 pending.set(root,()=>image.removeEventListener('load',loaded));
}
