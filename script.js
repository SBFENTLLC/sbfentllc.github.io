document.documentElement.classList.add('js');
const toggle=document.querySelector('.menu-toggle');
const menu=document.getElementById('navMenu');
toggle.hidden=false;
function closeMenu(){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.lastElementChild.textContent='＋';}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.lastElementChild.textContent=open?'−':'＋';});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
matchMedia('(min-width:901px)').addEventListener('change',closeMenu);
document.getElementById('year').textContent=new Date().getFullYear();
