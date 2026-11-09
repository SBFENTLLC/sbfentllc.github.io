'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const styles = {
    all: {label:'All-court', speed:3.94, touch:.02, defense:.02, dunkRange:2.32, cut:3.35, tempo:3},
    quick: {label:'Quick handles', speed:4.35, touch:-.03, defense:0, dunkRange:2.12, crossBonus:.19, cut:3.6, tempo:2.6},
    deep: {label:'Deep range', speed:3.76, touch:.09, defense:-.03, dunkRange:2.04, cut:5.5, tempo:3.2},
    rim: {label:'Rim attack', speed:3.94, touch:-.04, defense:.035, dunkRange:2.85, cut:2.3, tempo:2.8},
    stop: {label:'Lockdown', speed:3.77, touch:0, defense:.14, dunkRange:2.43, cut:3.2, tempo:3.5}
  };
  // Team colors, home court, captain and two specialists. Alternate captains reorder the same roster.
  const definitions = [
    ['Stamp City','STP','#d9ff75','#223831','sunset','all',['Flex A Lot', 'Little Juice', 'Goldie', 'Big Stamp', 'Detective Flex'],'First on the blacktop. Last to leave.'],
    ['Rim Reapers','RPR','#b68bff','#2b123a','street','rim',['Grave Rise', 'Bone Step', 'Hex Shot', 'Tomb Tip', 'Night Fang'],'The city’s reigning champs own the air.', 'horns'],
    ['Neon Vipers','VPR','#78ed9b','#16384d','sunset','quick',['Neon Nova', 'Sidewinder', 'Fang', 'Venom', 'Zipline'],'Their first move is a setup for the second.', 'crest'],
    ['Concrete Kings','CNK','#ffc075','#3d2226','blue','stop',['Quiet Money', 'Big Pressure', 'Mason', 'Brick', 'Mortar'],'They make every inch of the paint expensive.'],
    ['Skyline Flight','SKY','#7bd7ff','#203962','sunset','rim',['Clara', 'Cloud Nine', 'Altitude', 'Jet', 'Skyhook'],'Watch for back cuts and passes over the rim.'],
    ['Midnight Static','MID','#8fa2ff','#292049','street','deep',['DJ Blackout', 'Lady Static', 'Echo', 'Frequency', 'Dial Tone'],'They space the floor and let it fly.'],
    ['Southside Sparks','SPK','#ff9871','#442438','sunset','quick',['Redline', 'Matchstick', 'Voltage', 'Fuse', 'Ember'],'Quick feet and faster hands.'],
    ['Emerald Empire','EMR','#4fe4c2','#173c46','emerald','all',['Onyx', 'Mint Condition', 'Ace Green', 'Jade', 'Lucky Leaf'],'Three threats who can trade jobs on the fly.'],
    ['Iron Giants','IRN','#c1c9e2','#3f4757','blue','stop',['Iron Haul', 'Kiln', 'Rivet', 'Anvil', 'Steel Toe'],'A wall in the lane with a mean counterattack.', 'horns'],
    ['Sunset Royals','ROY','#f3a7d6','#542840','sunset','deep',['Violet V', 'Prince Fade', 'Rose Gold', 'Duchess', 'Satin'],'Long-range buckets with no hesitation.'],
    ['Backlot Bandits','BBT','#f3d472','#332741','street','quick',['The Bootlegger', 'Getaway', 'Switch', 'Pickpocket', 'Night Shift'],'Expect a crossover the second you lean.'],
    ['Ice District','ICE','#b9e8ff','#264353','blue','stop',['Zero Chill', 'Frostbite', 'Hail', 'Blizzard', 'Snowcap'],'Cold hands on defense and patient possessions.', 'crest'],
    ['Inferno Syndicate','INF','#ff785f','#401a2c','street','rim',['The False King', 'Ashfall', 'Hotstep', 'Cinder', 'Blaze'],'They turn every opening into a drive.', 'horns'],
    ['Moon Court','MOON','#e9b8ff','#3e2b5a','street','deep',['Orbit', 'Eclipse', 'Crater', 'Cosmo', 'Satellite'],'They pull defenders deep and shoot over the top.', 'crest'],
    ['Tempo Collective','TMP','#f1efc3','#353153','emerald','all',['Cadence', 'Downbeat', 'Remix', 'Hi-Hat', 'Sample'],'They keep the ball moving until somebody slips.'],
    ['Harbor Hounds','HBR','#5bc9e2','#233951','sunset','stop',['Foxy', 'Undertow', 'Dockside', 'Anchor', 'Low Tide'],'They chase every cut, then hit back downhill.']
  ];
  const humanSkins = ['#784831','#ad7050','#d2a17c','#965b40','#e7b99a','#633e31'];
  const creatureSkins = ['#8069bd','#589875','#749bc3','#b65e56','#9a79af'];
  const hairColors = ['#222033','#3c2924','#ba8b40','#252d38','#342a50'];
  const haircuts = ['locs','fade','curls','high','braids'];
  const returning = {
    'Flex A Lot':{hairStyle:'fade'},
    'Little Juice':{hairStyle:'locs',hair:'#202337',role:'quick'},
    'Goldie':{hairStyle:'curls',hair:'#d5a440'},
    'Detective Flex':{hairStyle:'fade'},
    'DJ Blackout':{hairStyle:'braids'},
  };
  // Each entry names a special, five ratings (pace, handles, shot, finish, defense), and a costume piece.
  const playerCards = [
    ['Stamped Out|85878|band','Blue Flame Rush|99643|wrap','Gold Standard|67895|gold','Stamp Press|43599|patch','Case Closed|75849|shades'],
    ['Graveyard Flight|84695|horn','Bone Breaker|98664|bones','Hex From Deep|61948|mono','Tombstone Tip|44598|patch','Night Bite|87659|fang'],
    ['Neon Blitz|99555|visor','Sidewinder Slip|89746|wrap','Fang First|82785|fang','Venom Lock|63689|hood','Zipline Jam|96793|band'],
    ['Quiet Collection|64659|shades','Pressure Drop|52899|patch','Mason Line|66788|brows','Brick Wall|43899|guard','Mortar Shot|65967|band'],
    ['Clara Skyhook|77796|ribbon','Cloud Nine Glide|86694|wrap','Altitude Check|72598|shades','Jet Stream|99763|visor','Skyhook High|75988|patch'],
    ['Bass Drop|76965|headset','Static Storm|88757|visor','Echo Chamber|67878|brows','Frequency Fade|58963|shades','Dial Tone|78954|mono'],
    ['Redline Rush|98784|band','Matchstick Flick|89853|brows','Voltage Vault|83598|visor','Fuse Break|96964|patch','Ember Step|78746|wrap'],
    ['Onyx Shift|88658|hood','Mint Condition|58972|shades','Ace Green Lift|74893|band','Jade Press|64849|mono','Lucky Bounce|86785|ribbon'],
    ['Iron Haul Drop|53799|guard','Kiln Burn|65689|horn','Rivet Lock|62679|patch','Anvil Hammer|41599|guard','Steel Toe Lift|76897|bones'],
    ['Violet Reign|89866|ribbon','Royal Fade|57954|crown','Rose Gold Rush|76984|gold','Duchess Downpour|68946|crown','Satin Spin|98942|wrap'],
    ['Counterfeit Combo|89775|hood','Getaway Glide|99754|wrap','Switch Step|88945|brows','Pocket Pick|95669|patch','Night Shift Finish|84787|shades'],
    ['Subzero Stop|65849|visor','Frostbite Trap|56699|fang','Hail From Deep|62967|mono','Blizzard Jam|74598|hood','Snowcap Slide|97648|wrap'],
    ['False Coronation|76889|crown','Ashfall Hammer|73697|bones','Hotstep Pop|99864|band','Cinder Crush|54798|horn','Blaze Through|96695|fang'],
    ['Orbital Lift|75896|visor','Eclipse Screen|74689|hood','Crater Slam|64799|patch','Cosmic Range|67958|mono','Satellite Spin|89956|crown'],
    ['Cadence Cut|87774|band','Downbeat Drop|64896|headset','Remix Reset|98767|shades','Hi-Hat High Rise|85897|brows','Sample Swipe|77949|gold'],
    ['Foxy Rush|99566|fang','Undertow Sweep|86769|wrap','Dockside Denial|64879|patch','Anchor Down|42699|guard','Low Tide Floater|78967|hood']
  ];
  const roles = ['all','quick','deep','rim','stop'];
  const teams = definitions.map(([name,tag,color,trim,gym,style,names,scout,creature],i) => {
    const roster = names.map((name,slot) => {
      const serial = i*5+slot;
      const [special, digits, accessory] = playerCards[i][slot].split('|');
      const ratings = [...digits].map(value=>60+Number(value)*4);
      const [pace,handles,shooting,finishing,guard] = ratings;
      const look = returning[name] || {};
      const peak = Math.max(...ratings);
      const preferred = ratings[roles.indexOf(style)]===peak ? style :
        roles.find((key,index)=>key!=='all'&&ratings[index]===peak);
      const role = look.role || preferred || 'all';
      return {
        ...styles[role],...look,name:name.toUpperCase(),number:String((serial*7+1)%99).padStart(2,'0'),
        color,trim,ratings,special,accessory,patchSide:serial%2===0?1:-1,
        face:Math.floor(serial/5)%4,eye:slot%3,
        skin:creature&&name!=='The False King'?creatureSkins[(i+slot)%creatureSkins.length]:humanSkins[(i+slot*2)%humanSkins.length],
        hair:look.hair||hairColors[(i*2+slot)%hairColors.length],
        hairStyle:look.hairStyle||haircuts[(i+slot*2)%haircuts.length],
        width:.90+(guard-64)*.008,height:.93+(finishing-64)*.005,
        creature:name==='The False King'?undefined:creature,
        speed:3.5+(pace-64)*.028,
        touch:(shooting-80)*.006,
        crossBonus:(handles-64)*.008,
        crossCost:24-(handles-64)*.21,
        crossRecovery:.76-(handles-64)*.008,
        dunkRange:1.95+(finishing-64)*.033,
        finishTouch:(finishing-80)*.005,
        defense:(guard-74)*.006,
        blockRange:2.05+(guard-64)*.019,
        blockWindow:.38+(guard-64)*.006,
        finish:role==='quick'?'wrap':role==='rim'?'glide':'hammer'
      };
    });
    return {id:tag,name,tag,color,trim,gym,style:styles[style],roster,scout};
  });
  const byName = Object.fromEntries(teams.flatMap(team=>team.roster.map(player=>[player.name,player])));
  byName.FLEX=byName['FLEX A LOT'];
  byName['LIL JUICE']=byName['LITTLE JUICE'];
  const byId = Object.fromEntries(teams.map(team => [team.id,team]));
  const rounds = ['Round of 16','Quarterfinal','Semifinal','Championship'];
  const venues = ['sunset','street','emerald','blue'];
  const targets = [11,13,15,21];
  const seedOrder = [1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11];
  const storageKey = 'sbfent-hoops-cup-v1';
  let saved = {};
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    if (data && typeof data==='object') saved = data;
  } catch {}
  const bounded = (value,max) => Number.isInteger(value) ? Math.min(max,Math.max(0,value)) : 0;
  function record(id) {
    const row = saved[id] || {};
    return {round:bounded(row.round,3),cups:bounded(row.cups,99999),losses:bounded(row.losses,99999)};
  }

  function bracket(home) {
    const boss = home.id==='RPR' ? byId.MID : byId.RPR;
    const rest = teams.filter(team=>team!==home&&team!==boss);
    const offset = teams.indexOf(home) % rest.length;
    const seeded = [home,boss,...rest.slice(offset),...rest.slice(0,offset)];
    let entrants = seedOrder.map(seed => ({seed,team:seeded[seed-1]}));
    return rounds.map(() => {
      const pairs = [];
      for (let i=0; i<entrants.length; i+=2) pairs.push(entrants.slice(i,i+2));
      entrants = pairs.map(([a,b]) => a.seed<b.seed?a:b);
      return pairs;
    });
  }

  function choose(home, slot, player, full) {
    const captain = slot===5 ? {...player,color:home.color} : home.roster[slot];
    const available = home.roster.filter((_,i)=>i!==(slot===5?0:slot));
    if (full) return [captain,...available];
    const first = home.roster[Number($('squadStarterA').value)];
    const second = home.roster[Number($('squadStarterB').value)];
    const a = available.includes(first) ? first : available[0];
    const b = available.includes(second)&&second!==a ? second : available.find(p=>p!==a);
    return [captain,a,b];
  }

  function config(cup, player, full=false) {
    const home = byId[$('squadHome').value] || teams[0];
    const slot = bounded(Number($('squadCaptain').value),5);
    const round = record(home.id).round;
    const away = cup ? bracket(home)[round][0][1].team : byId[$('squadAway').value];
    if (!cup && !full && !$('squadHome').value) return null;
    const opponent = away&&away!==home ? away : teams.find(team=>team!==home);
    return {
      home,away:opponent,homeRoster:choose(home,slot,player,full),awayRoster:opponent.roster,
      round,roundName:rounds[round],gym:cup?venues[round]:home.gym,
      target:cup?targets[round]:21,difficulty:round===3?2:round>0?1:0
    };
  }

  function finish(match, won) {
    const id = match.home.id;
    const previous = record(id);
    const champion = won && match.round===3;
    const next = {
      round:won&&!champion ? match.round+1 : 0,
      cups:previous.cups+(champion?1:0),
      losses:previous.losses+(won?0:1)
    };
    saved[id] = next;
    try { localStorage.setItem(storageKey,JSON.stringify(saved)); } catch {}
    return {champion,next};
  }

  function option(select,value,text) {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = text;
    select.append(item);
  }

  function teamPreview(team) {
    $('squadName').textContent = team.name;
    $('squadScout').textContent = team.style.label+' · '+team.scout;
    $('squadCard').style.setProperty('--squad-color',team.color);
    $('squadRoster').replaceChildren();
    for (const player of team.roster) {
      const row = document.createElement('li');
      row.textContent = '#'+player.number+'  '+player.name+' · '+player.label;
      $('squadRoster').append(row);
    }
  }

  function render() {
    const mode = $('mode').value;
    const cup = mode==='cup';
    const full = mode==='full';
    const shown = cup||full||mode==='crew';
    $('squadSetup').hidden = !shown;
    if (!shown) return;
    const homeSelect = $('squadHome');
    const captainSelect = $('squadCaptain');
    const currentHome = byId[homeSelect.value];
    const previousSlot = Number(captainSelect.value);
    const home = currentHome || teams[0];
    if ((cup||full) && !currentHome) homeSelect.value = home.id;
    homeSelect.options[0].disabled = cup||full;
    const enabled = !!homeSelect.value;
    $('squadOptions').hidden = !enabled;
    if (!enabled) return;
    $('squadRivalLabel').hidden = cup;
    const awaySelect = $('squadAway');
    const oldRival = awaySelect.value;
    awaySelect.replaceChildren();
    for (const team of teams) if (team!==home) option(awaySelect,team.id,team.name);
    if (byId[oldRival] && oldRival!==home.id) awaySelect.value=oldRival;
    captainSelect.replaceChildren();
    home.roster.forEach((player,i)=>option(captainSelect,String(i),player.name+' · '+player.label));
    option(captainSelect,'5','My Player · Lead the squad');
    captainSelect.value=String(bounded(previousSlot,5));
    $('squadStarters').hidden = full;
    lineup(home);
    teamPreview(home);

    $('cupBracket').hidden = !cup;
    if (!cup) return;
    const progress = record(home.id);
    const match = config(true);
    $('cupStatus').textContent = match.roundName+' · vs '+match.away.name+' · First to '+match.target+
      ' · '+progress.cups+' '+(progress.cups===1?'title':'titles');
    const board = $('cupRounds');
    board.replaceChildren();
    bracket(home).forEach((pairs,i)=>{
      const col = document.createElement('section');
      const heading = document.createElement('b');
      heading.textContent = rounds[i];
      col.append(heading);
      pairs.forEach(([a,b],j)=>{
        const pair = document.createElement('p');
        pair.className = j===0 ? i===progress.round?'cupCurrent':i<progress.round?'cupWon':'' : '';
        const names = [a,b].map(({seed,team})=>seed+' '+team.name);
        pair.textContent = (j===0&&i<progress.round?'W · ':'')+names.join(' / ');
        col.append(pair);
      });
      board.append(col);
    });
  }

  function lineup(home) {
    const captain = Number($('squadCaptain').value);
    const a = $('squadStarterA'), b = $('squadStarterB');
    const keepA = a.value, keepB = b.value;
    const choices = home.roster.map((player,i)=>({player,i})).filter(({i})=>i!==(captain===5?0:captain));
    a.replaceChildren();
    choices.forEach(({player,i})=>option(a,String(i),player.name));
    if (choices.some(({i})=>String(i)===keepA)) a.value=keepA;
    b.replaceChildren();
    choices.filter(({i})=>String(i)!==a.value).forEach(({player,i})=>option(b,String(i),player.name));
    if (choices.some(({i})=>String(i)===keepB&&keepB!==a.value)) b.value=keepB;
  }

  function renderGallery() {
    const team = byId[$('puppetTeam').value] || teams[0];
    const cards = $('puppetCards');
    cards.replaceChildren();
    for (const player of team.roster) {
      const card = document.createElement('article');
      card.className = 'puppetCard';
      const portrait = document.createElement('div');
      portrait.className = 'puppetPortrait';
      portrait.innerHTML = window.HoopsPuppets?.portrait(player) || '';
      const info = document.createElement('div');
      const name = document.createElement('h3');
      name.textContent = player.name;
      const special = document.createElement('p');
      special.className = 'puppetSpecial';
      special.textContent = player.label+' · '+player.special;
      const stats = document.createElement('dl');
      ['Speed','Handles','Shot','Finish','Defense'].forEach((label,i)=>{
        const term = document.createElement('dt'), value = document.createElement('dd');
        term.textContent = label;
        value.textContent = String(player.ratings[i]);
        stats.append(term,value);
      });
      info.append(name,special,stats);
      card.append(portrait,info);
      cards.append(card);
    }
  }

  const gallery = $('puppetTeam');
  teams.forEach(team=>option(gallery,team.id,team.name));
  gallery.onchange=renderGallery;
  $('puppetRoster').ontoggle=()=>{if($('puppetRoster').open)renderGallery();};
  $('squadCaptain').onchange=()=>lineup(byId[$('squadHome').value]);
  $('squadStarterA').onchange=()=>lineup(byId[$('squadHome').value]);
  option($('squadHome'),'','Classic crew · Choose player below');
  teams.forEach(team=>option($('squadHome'),team.id,team.name));
  $('squadHome').value='';
  $('squadHome').onchange=()=>{
    $('squadCaptain').value='0';
    if (byId[$('squadHome').value]) {
      gallery.value=$('squadHome').value;
      if ($('puppetRoster').open) renderGallery();
    }
    $('mode').onchange();
  };
  window.HoopsSquads = {config,finish,render,find:name=>byName[name]};
})();
