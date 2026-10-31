// Pin only the play surface. Scrollable pause/help panels keep their own scroll.
export function installScreenLock({doc=globalThis.document,win=globalThis,active}={}){
 if(!doc?.body)return null;let locked=false,savedY=0,savedX=0,prior=null;
 const playing=active||(()=>!!doc.querySelector('.detective-app-view,body.racing,body.fighting'));
 const keys=['position','top','left','right','width','height','overflow','overscrollBehavior'];
 const pin=()=>{if(locked&&(win.scrollY||win.scrollX))win.scrollTo?.(0,0);};
 const sync=()=>{const on=!!playing();if(on===locked)return;locked=on;if(on){savedY=win.scrollY||0;savedX=win.scrollX||0;prior=Object.fromEntries(keys.map(k=>[k,doc.body.style[k]||'']));Object.assign(doc.body.style,{position:'fixed',top:'0px',left:'0px',right:'0px',width:'100%',height:doc.body.classList.contains('fighting')?'var(--play-height,100%)':'100%',overflow:'hidden',overscrollBehavior:'none'});doc.documentElement.classList.add('arcade-screen-locked');win.scrollTo?.(0,0);}else{Object.assign(doc.body.style,prior);doc.documentElement.classList.remove('arcade-screen-locked');win.scrollTo?.(savedX,savedY);}};
 const scrollable=target=>{for(let n=target;n&&n!==doc.body;n=n.parentElement)if(n.matches?.('dialog,.overlay,.panel,.investigation-panel,.cinema-caption,.story-dialogue,.modal,.arcade-scroll')&&n.scrollHeight>n.clientHeight+1)return true;return false;};
 const stop=e=>{if(locked&&!scrollable(e.target)&&e.cancelable!==false)e.preventDefault();};
 for(const type of ['touchmove','gesturestart','gesturechange','wheel'])doc.addEventListener(type,stop,{passive:false,capture:true});
 win.addEventListener?.('scroll',pin,{passive:true});win.visualViewport?.addEventListener('scroll',pin);
 const Observer=win.MutationObserver;const observer=Observer?new Observer(sync):null;observer?.observe(doc.body,{attributes:true,attributeFilter:['class','hidden'],subtree:true});sync();return {sync,get locked(){return locked;},destroy(){observer?.disconnect();if(locked){locked=false;Object.assign(doc.body.style,prior);doc.documentElement.classList.remove('arcade-screen-locked');win.scrollTo?.(savedX,savedY);}for(const type of ['touchmove','gesturestart','gesturechange','wheel'])doc.removeEventListener?.(type,stop,true);win.removeEventListener?.('scroll',pin);win.visualViewport?.removeEventListener?.('scroll',pin);}};
}
if(typeof document!=='undefined')installScreenLock();
