(() => {
 const launch=document.getElementById('detectiveLaunch'),enter=document.getElementById('detectiveEnter'),app=document.querySelector('.app-wrap');
 if(!launch||!enter)return;
 if(app)app.inert=true;
 enter.addEventListener('click',()=>{launch.hidden=true;document.body.classList.remove('sbf-launch-open');if(app)app.inert=false;document.querySelector('[data-game-mode]')?.focus({preventScroll:true});});
})();
