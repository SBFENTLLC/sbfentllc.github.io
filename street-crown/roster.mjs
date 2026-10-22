const rows=[
['Flex A Lot','Pressure driver','Balanced exits · crown authority',['#173e35','#dfb956'],['#15181d','#deb94f'],1540,1.08,1,1.05,'Crown Shot','bolt','Crown Guard','shield'],
['The Bootlegger','Trickster','Slippery lines · deceptive traps',['#492b68','#c8b86c'],['#272932','#bcfa65'],1560,.95,1.08,.9,'Counterfeit Crate','trap','Double Take','decoy'],
['Foxy','Escape artist','Fast launch · sharp turns',['#df672b','#17151b'],['#e64a98','#242029'],1480,1.3,1.24,.78,'Fox Slick','slick','Fox Step','dodge'],
['Clara','Air specialist','Agile slides · extra ramp boost',['#694298','#e7bc64'],['#c7364b','#191a24'],1510,1.16,1.18,.84,'Scarlet Spin','spin','Sky Step','dodge'],
['Goldie','Power cruiser','Heavy impact · steady exits',['#d0a446','#25242c'],['#346c51','#e6c76b'],1590,.82,.91,1.3,'Gold Rush','magnet','Gold Standard','absorb'],
['Onyx','Counter racer','Patient grip · reflected attacks',['#292735','#a9a1d9'],['#1e343b','#b8e3e8'],1500,1.08,1.16,.96,'Shadow Shard','homing','Mirror Guard','reflect'],
['DJ Blackout','Bass drifter','Wide slides · long boost holds',['#173952','#68e4ed'],['#50346d','#e6b9f8'],1520,1.02,1.04,1,'Bass Wave','pulse','Sound Barrier','shield'],
['Quiet Money','Precision driver','Stable lines · calculated pressure',['#272b31','#d7bd74'],['#334b3b','#c0d795'],1570,.9,1.12,1.16,'Vault Lock','slow','Quiet Cover','absorb'],
['Neon Nova','Boost runner','Quick launch · light armor',['#557739','#cbff65'],['#164b67','#7de6ff'],1530,1.24,1.08,.8,'Neon Blitz','dash','Afterimage','decoy'],
['Big Stamp','Heavy hauler','Strong shoves · slow turns',['#76543b','#e3bc79'],['#442d5d','#d5b7f4'],1600,.78,.84,1.4,'Stamp Ram','ram','Heavy Cover','fortify'],
['Violet V','Drift dancer','Deep slides · nimble steering',['#6d4391','#d9b4ff'],['#263764','#c4d3ff'],1490,1.15,1.3,.86,'Reign Disc','homing','Violet Slip','dodge'],
['Redline','Rush racer','Fast straights · committed slides',['#b53532','#ffb36b'],['#282830','#ff6b54'],1630,1.04,.9,.95,'Heat Wave','flame','Overdrive','cleanse'],
['Big Pressure','Clinch bruiser','Heavy contact · punishing blasts',['#8b6634','#ffd66d'],['#302d38','#cf9aff'],1580,.8,.88,1.45,'Pressure Quake','quake','Pressure Shell','fortify'],
['Lady Static','Trap technician','Quick turns · electric control',['#553c79','#72e8ff'],['#243d5b','#c397ff'],1505,1.12,1.2,.88,'Static Jam','emp','Signal Reset','cleanse'],
['Iron Haul','Armored racer','Stable weight · heavy projectiles',['#40494d','#f3aa5d'],['#655c44','#e6d29b'],1610,.76,.86,1.5,'Freight Scrap','heavy','Iron Plate','fortify'],
['The False King','Versatile rival','High speed · demanding steering',['#50366d','#e0c46c'],['#c4b68e','#382b4d'],1620,1,.98,1.08,'Royal Counterfeit','royal','Borrowed Crown','reflect'],
['Little Juice','Speed / trick racer','Small truck · big pressure · blue-fire boost',['#071528','#168cff'],['#090b10','#48c7ff'],1600,1.34,1.16,.76,'JUICE BOOST','juice','Blue Flame Slip','dodge']
];
const REACTIONS=[
 ['Aw man!','Crown pressure!','Clean air!','Not today!','Let’s move!','Stamped!'],
 ['That crate was fake!','Try this line!','Too easy!','You got lucky!','Bootleg speed!','Run it back!'],
 ['Come on!','Fox on the run!','Catch some air!','Almost had me!','Gone!','That was slick!'],
 ['I hit something!','Sky step!','Up top!','Good pass!','Lift off!','Clean landing!'],
 ['Not the paint!','Gold rush!','Heavy air!','I see you!','Golden lane!','Worth every coin!'],
 ['Shadow check!','Out of the shadows!','Quiet jump!','Nice move!','Mirror speed!','Calculated!'],
 ['Bass drop!','Drop the bass!','Turn it up!','You passed the DJ?','Full volume!','Crowd went crazy!'],
 ['Special delivery!','Money line!','Exact landing!','Noted.','On schedule!','Paid in full!'],
 ['Whoa!','Catch the glow!','Neon jump!','Good one!','Nova boost!','Too bright!'],
 ['Make room!','Stamp it!','Big air!','You squeezed by!','Heavy boost!','Stamped approved!'],
 ['Easy!','Violet slip!','Dance in the air!','Nice pass!','Purple pressure!','That was smooth!'],
 ['Hot lane!','Redline!','Full send!','You got me!','Overdrive!','Still moving!'],
 ['Too much pressure!','Pressure up!','Big jump!','I felt that!','Push through!','Pressure wins!'],
 ['Signal jam!','Static live!','Airwave!','Signal lost!','Full charge!','Channel clear!'],
 ['Freight hit!','Clear the lane!','Heavy lift!','Passing freight?','Full haul!','Delivered!'],
 ['My crown!','Crown is mine!','Royal air!','Lucky pass!','Borrowed speed!','Bow down!'],
 ['Aw man!','I’m too fast!','Let’s go!','You can’t catch me!','JUICE BOOST!','Blue fire!']
];
const RACERS=rows.map((r,id)=>({id,name:r[0],style:r[1],bio:r[2],colors:[r[3],r[4]],top:r[5],accel:r[6],grip:r[7],armor:r[8],attack:r[9],attackType:r[10],defense:r[11],defenseType:r[12],attackWait:id===16?10:11+(id%4),defenseWait:id===16?9:9+(id%3),nitroPower:id===16?1.14:1,reactions:{crash:[REACTIONS[id][0],'Come on!'],pass:[REACTIONS[id][1]],jump:[REACTIONS[id][2]],passed:[REACTIONS[id][3]],nitro:[REACTIONS[id][4]],win:[REACTIONS[id][5]],lose:['Run it back!','Next race.'],stuck:['I’m stuck!',REACTIONS[id][0]],hit:['Watch out!',REACTIONS[id][0]]}}));
const RACER_COUNT=RACERS.length;
const TRACKS=[
{id:0,name:'Carolina Block Party',district:'01 / THE BLOCK',tag:'Warm streets. Cold rivals.',sky:['#251c3d','#e28d71'],road:'#30303b',edge:'#caa65c',accent:'#ceff90',curve:1.65,hills:.15,scene:'city',seed:17},
{id:1,name:'Neon Underground',district:'02 / THE SIGNAL',tag:'Find your line beneath the city.',sky:['#070c20','#243557'],road:'#222636',edge:'#62d9dd',accent:'#be92ff',curve:2.2,hills:.3,scene:'tunnel',seed:38},
{id:2,name:'Flex Motor Yard',district:'03 / HEAVY FREIGHT',tag:'Steel, speed and no borrowed crowns.',sky:['#352e40','#ddaa66'],road:'#393638',edge:'#d6b67b',accent:'#c4ed7c',curve:1.9,hills:.5,scene:'yard',seed:64},
{id:3,name:'Crown Skyway',district:'04 / THE REAL CROWN',tag:'Own the skyline. Earn the crown.',sky:['#12162f','#725280'],road:'#2c2939',edge:'#d6bd7b',accent:'#dfbaff',curve:2.4,hills:.65,scene:'sky',seed:91},
{id:4,name:'Emerald Island Speedway',district:'SPECIAL / EMERALD ISLAND',tag:'A coin-earned coastal crown run.',sky:['#82dcd0','#c9e7c2'],road:'#384b4d',edge:'#f0d58f',accent:'#8cf3c9',curve:1.8,hills:.25,scene:'island',seed:124},
{id:5,name:'Cosmic Crown Circuit',district:'SPECIAL / COSMIC CROWN',tag:'Race beneath the neon constellations.',sky:['#171b3e','#655486'],road:'#32334f',edge:'#a6efef',accent:'#d5a1ff',curve:2.35,hills:.5,scene:'cosmic',seed:155}
];
const MISSIONS=[
{title:'A crown is earned',rival:1,track:0,goal:3,before:['Flex has a truck, a crew, and an invitation that was never meant for him. Tonight, the Crown Circuit comes through the block.','Bootlegger is selling fake entries and calling himself the face of SBFENT. Finish in the top three. Show the neighborhood who actually shows up.'],after:'The block knows your name. Foxy, Clara and Onyx offer to ride with you. Bootlegger wants a rematch.',unlock:[1,2,3,5]},
{title:'Counterfeit finish',rival:1,track:0,goal:1,before:['Bootlegger has moved the finish party to his corner of the block. He thinks a few fake crates can buy him a real crown.','Win the race. Watch for traps on the inside line, protect your boost, and make the last corner count.'],after:'Bootlegger loses his grip on the block. DJ Blackout sends a signal: the next race starts underground.',unlock:[6,16]},
{title:'Follow the bass',rival:6,track:1,goal:3,before:['DJ Blackout is keeping the underground station alive, but Lady Static is scrambling his broadcast. The Circuit needs a clean signal.','Reach the top three through the neon bends. Drift for speed; spend your defense before a blast catches you.'],after:'Your run carries the signal across the city. Violet and Nova join the circuit. Quiet Money offers information, for a price.',unlock:[7,8,10]},
{title:'Static on the line',rival:13,track:1,goal:1,before:['Lady Static is racing for control of the station. She is not a villain to her crew—she thinks only her rules will keep them safe.','Win her respect on the track. Her electric jam drains boost, so carry a defense into close traffic.'],after:'Static opens the channel. A freight convoy carrying stolen SBFENT wraps is heading into the Motor Yard.',unlock:[13]},
{title:'Heavy freight',rival:9,track:2,goal:3,before:['Big Stamp meets you at the yard gates. His crew has been blamed for a stolen shipment, and he wants his name cleared.','Place in the top three. Heavy trucks hold their line; take the ramps and use a charged drift to pass cleanly.'],after:'The shipment ledger points to the False King. Stamp and Goldie bring their crews. Redline wants in on the chase.',unlock:[4,9,11]},
{title:'Under pressure',rival:12,track:2,goal:1,before:['Big Pressure has the yard exit blocked. Iron Haul is caught between a paid delivery and the people who trusted him.','Win this race to get the evidence out. Pressure can shove you wide; keep a shield for the exposed turns.'],after:'Pressure steps aside. Iron brings the ledger himself. The False King has one last race waiting above the city.',unlock:[12,14]},
{title:'Borrowed skyline',rival:15,track:3,goal:3,before:['The Crown Skyway is all polished steel and borrowed glory. Every neighborhood you helped is watching the live feed.','Finish in the top three to reach the final. The edges are unforgiving, but a quick rescue brings you back with protection.'],after:'The crew reaches the final together. The False King can copy a trick, but he cannot copy the people behind your stamp.',unlock:[]},
{title:'The real crown',rival:15,track:3,goal:1,before:['No stolen logos. No fake finish. Just the last race and the crown the whole city came to see.','Win the Crown Circuit. Read the bends, defend your line, and let the hardest part of the record carry you home.'],after:'Flex takes the real crown—and shares the podium with the crew. Every district is open. The Crown Cup is yours to race again.',unlock:[15]}
];

const CREW_BEATS=[
 [2,"Foxy","You don't need first place to prove yourself. Find your line and bring the crew home.",20,1,0],
 [16,"Little Juice","I'll light up the ramps! Get some air, grab those coins, and let's catch Bootlegger!",25,2,0],
 [6,"DJ Blackout","Listen to the beat. Hold your drift, let it charge, then let it fly!",25,0,2],
 [13,"Lady Static","You earned a clear signal. Keep your wheels moving and show me a clean run.",30,1,1],
 [9,"Big Stamp","We're hauling hope, little racer. There's room for every truck on this crew.",35,2,0],
 [14,"Iron Haul","The ledger belongs to the neighborhood. I'll help you get it home. Use those ramps!",35,2,1],
 [3,"Clara","Look how far we've come! Take the skyway one turn at a time. We've got you.",40,2,1],
 [16,"Little Juice","Everybody's watching, Flex! Whatever happens, we race together. Blue fire, big heart!",40,2,2]
];
for(const [i,m] of MISSIONS.entries()){const [id,name,line,coins,jumps,drifts]=CREW_BEATS[i];m.crew={id,name,line};m.bonus={coins,jumps,drifts};}

export {RACERS,RACER_COUNT,TRACKS,MISSIONS};
