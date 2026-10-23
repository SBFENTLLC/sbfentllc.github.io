(() => {
 const toggle=document.querySelector('.menu-toggle'),menu=document.getElementById('navMenu');
 if(toggle&&menu){
  document.documentElement.classList.add('js');
  toggle.hidden=false;
  const icon=toggle.querySelector('span');
  function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');if(icon)icon.textContent='＋';}
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));if(icon)icon.textContent=open?'−':'＋';});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
  matchMedia('(min-width:901px)').addEventListener('change',closeMenu);
 }
 const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
})();
