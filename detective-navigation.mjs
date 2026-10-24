// Bounded grid search. Never returns a shortcut through a collider.
export function walkingPath(start,goal,blocked,bounds){
 const [x0,x1,z0,z1]=bounds,inside=(x,z)=>x>=x0&&x<=x1&&z>=z0&&z<=z1&&!blocked(x,z),clear=(a,b)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.2);for(let i=1;i<=n;i++)if(!inside(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;};
 if(!inside(goal.x,goal.z))return [];
 if(clear(start,goal))return [goal];
 const key=(x,z)=>`${x},${z}`,nodes=new Map(),open=[];
 const add=(x,z,g,parent)=>{const id=key(x,z),old=nodes.get(id);if(old&&old.g<=g)return;const n={x,z,g,f:g+Math.hypot(goal.x-x,goal.z-z),parent};nodes.set(id,n);open.push(n);};
 const sx=Math.round(start.x),sz=Math.round(start.z);if(!inside(sx,sz)||!clear(start,{x:sx,z:sz}))return [];add(sx,sz,0,null);
 for(let tries=0;open.length&&tries<6000;tries++){
  let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;const n=open.splice(best,1)[0];if(nodes.get(key(n.x,n.z))!==n)continue;
  if(Math.hypot(n.x-goal.x,n.z-goal.z)<1.5&&clear(n,goal)){const path=[goal];for(let a=n;a;a=a.parent)path.unshift({x:a.x,z:a.z});let from=start,result=[];while(path.length){let i=path.length-1;while(i>0&&!clear(from,path[i]))i--;from=path[i];result.push(from);path.splice(0,i+1);}return result;}
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const next={x:n.x+dx,z:n.z+dz};if(inside(next.x,next.z)&&clear(n,next))add(next.x,next.z,n.g+Math.hypot(dx,dz),n);}
 }
 return [];
}
