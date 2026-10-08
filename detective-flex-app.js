(() => {
  'use strict';
  const card=document.querySelector('[data-install-card]');
  const button=document.querySelector('[data-install-app]');
  const status=document.querySelector('[data-install-status]');
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let promptEvent=null;
  function sync(){card.hidden=standalone();}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;button.hidden=false;status.textContent='Ready to install. Add Detective Flex to your home screen or desktop.';});
  button.addEventListener('click',async()=>{if(!promptEvent)return;button.disabled=true;try{const current=promptEvent;promptEvent=null;await current.prompt();const choice=await current.userChoice;status.textContent=choice.outcome==='accepted'?'Installation requested. Look for the Detective Flex icon.':'You can install later, or keep playing here.';}catch{status.textContent='Use your browser’s install menu to add Detective Flex.';}finally{button.disabled=false;button.hidden=true;}});
  window.addEventListener('appinstalled',()=>{promptEvent=null;button.hidden=true;status.textContent='Detective Flex is installed. Open it from its app icon.';});
  window.matchMedia('(display-mode: standalone)').addEventListener('change',sync);
  sync();
})();
