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
 if(prior&&await version(prior)===26){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});return;}
 const registration=await navigator.serviceWorker.register('sw.js',{updateViaCache:'none'});
 if(!prior)return; // First visit loads current modules directly from the network.
 await registration.update();
 const worker=registration.installing||registration.waiting||registration.active;
 if(worker&&worker.state!=='activated')await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Update is still downloading.')),45000);
  const changed=()=>{if(worker.state==='activated'){clearTimeout(timer);resolve();}else if(worker.state==='redundant'){clearTimeout(timer);reject(Error('Update could not install.'));}};
  worker.addEventListener('statechange',changed);changed();
 });
 if(await version(navigator.serviceWorker.controller)!==26)throw Error('The update is not ready yet.');
}
async function refreshStyle(){await Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(link=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Style update timed out.')),15000);link.onload=()=>{clearTimeout(timer);resolve();};link.onerror=()=>{clearTimeout(timer);reject(Error('Style update failed.'));};const url=new URL(link.href,location.href);url.searchParams.set('release','20261030-recovered');link.href=url.href;})));}
prepare().then(refreshStyle).then(()=>import('./app.mjs?release=20261030-recovered')).catch(()=>{
 const status=document.getElementById('launchStatus')||document.getElementById('releaseStatus'),button=document.getElementById('launchPlay')||document.getElementById('releaseRetry');
 status.textContent='The update could not finish. Check your connection, then reload. Your saved progress is unchanged.';
 button.hidden=false;button.disabled=false;button.textContent='RELOAD UPDATE →';button.addEventListener('click',()=>location.reload());
});
