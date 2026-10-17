// Keep game touches and viewport resize from moving the play surface.
// Native OS edge gestures remain outside a website's control.
export function setupTouchLock(isPlaying,{doc=document,win=globalThis}={}){
 let width=0,height=0;
 const pin=()=>{if(isPlaying())win.scrollTo?.(0,0);};
 const measure=()=>{const w=win.innerWidth||0,h=win.innerHeight||0;if(!width||Math.abs(w-width)>90||!isPlaying()){width=w;height=h;}const style=doc.documentElement?.style;style?.setProperty?.('--play-width',width+'px');style?.setProperty?.('--play-height',height+'px');pin();};
 const stop=e=>{if(isPlaying()&&e.cancelable!==false)e.preventDefault();};
 doc.addEventListener('touchmove',stop,{passive:false,capture:true});
 doc.addEventListener('touchstart',e=>{if(e.target?.closest?.('#controls,#arena'))stop(e);},{passive:false,capture:true});
 for(const name of ['gesturestart','gesturechange','gestureend','contextmenu','wheel'])doc.addEventListener(name,stop,{passive:false,capture:true});
 const sync=()=>{doc.body?.classList.toggle('fighting',isPlaying());measure();};
 win.addEventListener('scroll',pin,{passive:true});win.addEventListener('resize',measure);win.visualViewport?.addEventListener('scroll',pin);win.visualViewport?.addEventListener('resize',pin);
 win.addEventListener('orientationchange',()=>{width=0;measure();});
 return {sync,size:()=>({width:width||win.innerWidth,height:height||win.innerHeight}),enter(){sync();const root=doc.documentElement;
  if(root?.requestFullscreen&&!doc.fullscreenElement)try{Promise.resolve(root.requestFullscreen({navigationUI:'hide'})).then(()=>win.screen?.orientation?.lock?.('landscape')).catch(()=>{});}catch{}
 }};
}
