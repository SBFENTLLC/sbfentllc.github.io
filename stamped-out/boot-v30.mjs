// This new entry URL bypasses the previous worker's cache-first game.js.
// Returning players must not receive new HTML with the old combat engine.
const version=worker=>new Promise(resolve=>{
 if(!worker||typeof MessageChannel==='undefined'){resolve(null);return;}
 const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();resolve(null);},1200);
 channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data?.version);};
 worker.postMessage({type:'VERSION'},[channel.port2]);
});
async function prepare(){
 if(!('serviceWorker' in navigator))return;
 const prior=navigator.serviceWorker.controller;
 if(prior&&await version(prior)===30){navigator.serviceWorker.register('sw.js').catch(()=>{});return;}
 const registration=await navigator.serviceWorker.register('sw.js');
 if(!prior)return; // First visit loads current modules directly from the network.
 await registration.update();
 const worker=registration.installing||registration.waiting||registration.active;
 if(worker&&worker.state!=='activated')await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Update is still downloading.')),45000);
  const changed=()=>{if(worker.state==='activated'){clearTimeout(timer);resolve();}else if(worker.state==='redundant'){clearTimeout(timer);reject(Error('Update could not install.'));}};
  worker.addEventListener('statechange',changed);changed();
 });
 if(await version(navigator.serviceWorker.controller)!==30)throw Error('The update is not ready yet.');
}
async function refreshStyle(){
 const link=document.querySelector('link[rel="stylesheet"]');if(!link)return;
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Style update timed out.')),15000);link.onload=()=>{clearTimeout(timer);resolve();};link.onerror=()=>{clearTimeout(timer);reject(Error('Style update failed.'));};link.href='game.css?v=30-ready';});
}
prepare().then(refreshStyle).then(()=>import('./game.js?v=30')).catch(()=>{
 const status=document.getElementById('launchStatus'),button=document.getElementById('launchPlay');
 status.textContent='The update could not finish. Check your connection, then reload. Your saved progress is unchanged.';
 button.disabled=false;button.textContent='RELOAD UPDATE →';button.addEventListener('click',()=>location.reload());
});
