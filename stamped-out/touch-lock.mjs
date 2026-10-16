// Keep browser scrolling and long-press UI away from the fighting controls.
// iOS system-edge gestures remain under the operating system's control.
export function setupTouchLock(isPlaying,{doc=document,win=globalThis}={}){
 const stop=e=>{if(isPlaying()&&e.cancelable!==false)e.preventDefault();};
 doc.addEventListener('touchmove',stop,{passive:false});
 for(const name of ['gesturestart','gesturechange','contextmenu'])doc.addEventListener(name,stop,{passive:false});
 const sync=()=>doc.body?.classList.toggle('fighting',isPlaying());
 win.addEventListener('orientationchange',()=>{if(isPlaying())win.scrollTo?.(0,0);});
 return {sync,enter(){sync();win.scrollTo?.(0,0);const root=doc.documentElement;
  // Fullscreen is optional; a rejected request must never stop a match.
  if(root?.requestFullscreen&&!doc.fullscreenElement)try{Promise.resolve(root.requestFullscreen({navigationUI:'hide'})).then(()=>win.screen?.orientation?.lock?.('landscape')).catch(()=>{});}catch{}
 }};
}
