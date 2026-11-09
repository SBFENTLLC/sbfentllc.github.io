'use strict';
(()=>{
const $=id=>document.getElementById(id);
const BUILDS={balanced:{label:'All-Court',speed:3.9,touch:0,dunkRange:2.25,defense:0,color:'#d9ff75'},handles:{label:'Handle Artist',speed:4.25,touch:-.025,dunkRange:2.15,defense:0,color:'#b898ef'},shooter:{label:'Shot Creator',speed:3.7,touch:.07,dunkRange:2,defense:0,color:'#7dc8ed'},slasher:{label:'Rim Riser',speed:4.05,touch:-.02,dunkRange:2.7,defense:.03,color:'#ef9b6c'}};
const CHAPTERS=[
{id:'the-call',title:'THE CALL',place:'FLEX PARK / OPEN RUN',gym:'street',rival:'LIL JUICE',color:'#a78ce5',skin:'#9a694b',hair:'#20212c',style:'handles',target:11,difficulty:0,
intro:[['FLEX','Nobody gets handed a stamp. You earn yours on the court.'],['LIL JUICE','Heard you got a handle. First to eleven. Show the block something.'],['COACH STAMP','Create space with CROSS. Save your stamina for the drive. Your first run starts here.']],
outro:[['LIL JUICE','Okay, I see you! Goldie runs the next court. Bring that same energy.'],['FLEX','One win gets attention. What you do next builds a name.']]},
{id:'golden-hour',title:'GOLDEN HOUR',place:'THE STAMP CENTER / INVITE RUN',gym:'blue',rival:'GOLDIE',color:'#e8ba50',skin:'#bc875b',hair:'#d5a440',style:'shooter',target:11,difficulty:0,
intro:[['GOLDIE','Juice said you can move. Let’s see if your jumper travels.'],['COACH STAMP','Goldie lives beyond the arc. Close the gap, contest the release, then find your own green.']],
outro:[['GOLDIE','That release is clean. Quiet Money’s people were watching.'],['FLEX','The next invite isn’t a favor. It’s a test.']]},
{id:'quiet-money',title:'NO FREE BUCKETS',place:'EMERALD ARENA / CLOSED RUN',gym:'emerald',rival:'QUIET MONEY',color:'#e6ece6',skin:'#8d6148',hair:'#202129',style:'defender',crew:true,target:15,difficulty:1,
intro:[['QUIET MONEY','Hype is loud. My defense isn’t. First to fifteen.'],['COACH STAMP','This is crew ball now. Use PASS to move it, cut to the rim and call an ALLEY-OOP. Protect the ball and spend your upgrade points.']],
outro:[['QUIET MONEY','You kept your composure. That’s worth more than the highlights.'],['FLEX','DJ Blackout wants you under the lights. This one’s going to be loud.']]},
{id:'blackout',title:'AFTER HOURS',place:'FLEX PARK / NIGHT SESSION',gym:'street',rival:'DJ BLACKOUT',color:'#7952ae',skin:'#895b42',hair:'#141b29',style:'pressure',crew:true,target:15,difficulty:1,
intro:[['DJ BLACKOUT','Music up. Lights on. Don’t let the crowd rush your game.'],['COACH STAMP','Get three buckets in a row to go ON FIRE. Keep your rhythm when the pressure comes.']],
outro:[['DJ BLACKOUT','That wasn’t luck. You got a whole crowd saying your name now.'],['FLEX','You’ve got one more run. The Crown doesn’t make room. Take your spot.']]},
{id:'the-crown',title:'STAMPED LEGACY',place:'THE STAMP CENTER / CROWN FINAL',gym:'blue',rival:'THE CROWN',color:'#d5a73e',skin:'#9d704e',hair:'#191d26',style:'allround',crew:true,target:21,difficulty:2,
intro:[['THE CROWN','Everybody’s got a story. Mine ends with this court still being mine.'],['FLEX','Your name. Your build. Your moment. First to twenty-one. Leave your stamp.']],
outro:[['THE CROWN','You earned it. This court knows your name now.'],['FLEX','From the first open run to the final bucket. That’s a stamped legacy. Keep building.']]}
];
const blank=()=>({version:1,name:'ROOKIE',build:'balanced',skin:'#b98159',hair:'#1d202a',hairStyle:'curls',jersey:'#d9ff75',chapter:0,xp:0,points:0,rep:0,wins:0,losses:0,upgrades:{shooting:0,handles:0,defense:0}});
const skins=['#6f4935','#8d5c42','#b98159','#d2a17c','#edc5a2'],hairs=['#1d202a','#d5a440','#79533d','#e1d8cc'],jerseys=['#d9ff75','#b898ef','#7dc8ed','#ef9b6c','#eeeeeb'];
const bounded=(v,n)=>Number.isFinite(Number(v))?Math.max(0,Math.min(n,Math.floor(Number(v)))):0;
function clean(v){const s=blank();if(!v||typeof v!=='object')return s;s.name=String(v.name||'ROOKIE').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,16)||'ROOKIE';for(const k of ['build'])if(BUILDS[v[k]])s[k]=v[k];for(const [k,a]of [['skin',skins],['hair',hairs],['jersey',jerseys],['hairStyle',['curls','locs','fade']]])if(a.includes(v[k]))s[k]=v[k];s.chapter=bounded(v.chapter,CHAPTERS.length);for(const k of ['xp','points','rep','wins','losses'])s[k]=bounded(v[k],1000000);for(const k of Object.keys(s.upgrades))s.upgrades[k]=bounded(v.upgrades?.[k],5);return s}
let save=blank(),sceneLines=[],sceneIndex=0,done=null,cancel=null;
try{save=clean(JSON.parse(localStorage.getItem('sbfent-hoops-myplayer')))}catch{}
function persist(){try{localStorage.setItem('sbfent-hoops-myplayer',JSON.stringify(save))}catch{}}
function player(){const b=BUILDS[save.build];return {name:save.name.toUpperCase(),...b,color:save.jersey,skin:save.skin,hair:save.hair,hairStyle:save.hairStyle,speed:b.speed+save.upgrades.handles*.10,touch:b.touch+save.upgrades.shooting*.012,defense:b.defense+save.upgrades.defense*.035,crossBonus:(save.build==='handles'?.25:0)+save.upgrades.handles*.04,myPlayer:true}}
function overall(){return Math.min(99,70+Math.floor(Object.values(save.upgrades).reduce((a,b)=>a+b,0)*1.7)+(save.chapter>=5?4:0))}
function config(){const c=CHAPTERS[Math.min(save.chapter,CHAPTERS.length-1)];return {...c,chapter:Math.min(save.chapter+1,5),player:player()}}
function forms(){for(const [id,k]of [['mpName','name'],['mpBuild','build'],['mpSkin','skin'],['mpHair','hair'],['mpHairStyle','hairStyle'],['mpJersey','jersey']])$(id).value=save[k]}
function preview(){$('mpPortrait').innerHTML=window.HoopsPuppets?.portrait(player())||'';$('mpPreviewName').textContent=save.name.toUpperCase();$('mpBuildInfo').textContent=BUILDS[save.build].label+' · '+(save.build==='handles'?'Fast handles and longer defender stuns.':save.build==='shooter'?'A stronger shooting touch from range.':save.build==='slasher'?'Explosive drives and a wider dunk window.':'A balance of shooting, speed and finishing.');}
function render(){preview();$('mpOverall').textContent=overall()+' OVR';$('mpProgress').textContent=(save.chapter>=5?'CROWN CHAMPION':('CHAPTER '+(save.chapter+1)+'/5 · '+CHAPTERS[save.chapter].title))+' · '+save.xp+' XP · '+save.rep+' STYLE REP';$('mpPoints').textContent=save.points+' UPGRADE POINTS';$('mpRecord').textContent=save.wins+' CAREER WINS / '+save.losses+' LOSSES';for(const key of ['shooting','handles','defense']){const b=$('upgrade-'+key);b.textContent=key.toUpperCase()+' '+save.upgrades[key]+'/5 · '+(save.upgrades[key]>=5?'MAX':'+1 POINT');b.disabled=save.points<1||save.upgrades[key]>=5;}
const map=$('chapterMap');map.replaceChildren();CHAPTERS.forEach((c,i)=>{const row=document.createElement('div');row.className='chapterRow '+(i<save.chapter?'cleared':i===save.chapter?'current':'locked');const n=document.createElement('b'),body=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');body.textContent=c.title+' / '+c.rival+' · '+(i<save.chapter?'CLEARED':i===save.chapter?'UP NEXT':'LOCKED');row.append(n,body);map.appendChild(row)});}
function readForm(){save=clean({...save,name:$('mpName').value,build:$('mpBuild').value,skin:$('mpSkin').value,hair:$('mpHair').value,hairStyle:$('mpHairStyle').value,jersey:$('mpJersey').value});persist();render();window.HoopsCareer.onPreview?.(config());}
function scene(title,lines,onDone,onCancel){sceneLines=lines;sceneIndex=0;done=onDone;cancel=onCancel;$('storyScene').hidden=false;$('storyChapter').textContent=title;showLine();}
function showLine(){const line=sceneLines[sceneIndex];$('storySpeaker').textContent=line[0];$('storyLine').textContent=line[1];$('storyCount').textContent=(sceneIndex+1)+' / '+sceneLines.length;$('storyNext').textContent=sceneIndex===sceneLines.length-1?'LET’S RUN →':'NEXT →';}
$('storyNext').onclick=()=>{if(sceneIndex+1<sceneLines.length){sceneIndex++;showLine()}else{$('storyScene').hidden=true;const cb=done;done=null;cb?.()}};
$('storyBack').onclick=()=>{$('storyScene').hidden=true;const cb=cancel;done=null;cancel=null;cb?.()};
for(const id of ['mpName','mpBuild','mpSkin','mpHair','mpHairStyle','mpJersey'])$(id).addEventListener('change',readForm);
$('mpSave').onclick=()=>{readForm();$('mpSaveStatus').textContent='My Player saved. Your career resumes from its last chapter.'};
for(const key of ['shooting','handles','defense'])$('upgrade-'+key).onclick=()=>{if(save.points<1||save.upgrades[key]>=5)return;save.points--;save.upgrades[key]++;persist();render();window.HoopsCareer.onPreview?.(config())};
window.HoopsCareer={player,config,scene,refresh:render,onPreview:null,
begin(onReady,onCancel){readForm();const c=config();window.HoopsCareer.onPreview?.(c);scene('CHAPTER '+c.chapter+' / '+c.title,c.intro,onReady,onCancel)},
finish(won,stats){const c=config();const rep=Math.max(0,(stats.greens||0)*10+(stats.dunks||0)*25+(stats.crosses||0)*5+(stats.steals||0)*15+(stats.showtime||0)*40+(stats.assists||0)*20+(stats.lobs||0)*35+(stats.combos||0)*10+(stats.specials||0)*25);const xp=(won?100:35)+Math.min(150,rep);save.xp+=xp;save.rep+=rep;save.points+=won?2:1;if(won){save.wins++;save.chapter=Math.min(CHAPTERS.length,save.chapter+1)}else save.losses++;persist();render();return {won,chapter:c.chapter,title:c.title,champion:won&&save.chapter>=5,summary:'+'+xp+' XP · +'+rep+' STYLE REP · +'+(won?2:1)+' UPGRADE POINTS',lines:won?c.outro:[['COACH STAMP','A loss is film to learn from. You earned an upgrade point. Spend it, find your rhythm and run this chapter back.']]};},
afterMatch(result,onDone){scene((result.won?'CHAPTER STAMPED':'BACK TO WORK')+' / '+result.title,result.lines,onDone,onDone)},
state(){return JSON.parse(JSON.stringify(save))}
};
forms();render();
})();
