// Design targets for the complete roster. The first four are playable in
// this review build. Each entry names both its advantage and its counterplay.
export const ROSTER=[
 {name:'Flex A Lot',style:'Pressure boxing',strength:'Fast hands and close-range combos',weakness:'Short punch reach; kicks need commitment',special:'Stamped Out',superStyle:'Body blows, aerial launch, crown-stamp slam',playable:true},
 {name:'The Bootlegger',style:'Trickster kickboxing',strength:'Long kicks and a four-hit cinematic special',weakness:'Slower movement and longer recovery',special:'Counterfeit Combo',superStyle:'Clone crossfire and flying-kick finish',playable:true},
 {name:'Foxy',style:'Evasive kickboxing',strength:'Quick retreats and punish kicks',weakness:'Low damage per hit; vulnerable when cornered',special:'Foxy Rush',superStyle:'Zigzag kick rush',playable:true},
 {name:'Clara',style:'Aerial acrobatics',strength:'Air combos and jumping mixups',weakness:'Predictable landings can be punished',special:'Scarlet Spin',superStyle:'Red aerial corkscrew',playable:true},
 {name:'Goldie',style:'Power grappling',strength:'Throws break a defensive guard',weakness:'Slow approach and limited reach',special:'Gold Standard',superStyle:'Gold lift and ground slam'},
 {name:'Onyx',style:'Counter striking',strength:'Rewards accurate defensive timing',weakness:'Missed counters leave long openings',special:'Onyx Reversal',superStyle:'Shadow counter barrage'},
 {name:'DJ Blackout',style:'Sound-wave zoning',strength:'Controls distance with sound bursts',weakness:'Weaker close-up defense; slow projectile recovery',special:'Bass Drop',superStyle:'Concentric bass shockwaves'},
 {name:'Quiet Money',style:'Defensive boxing',strength:'Strong guard and deliberate heavy punches',weakness:'Slow attacks can be baited and whiff-punished',special:'Silent Investment',superStyle:'Delayed golden straight'},
 {name:'Neon Nova',style:'Dash striking',strength:'Fast approach and quick repositioning',weakness:'Light damage; unsafe dash endings',special:'Neon Blitz',superStyle:'Lime lightning dash chain'},
 {name:'Big Stamp',style:'Wrestling',strength:'Strong grabs and corner pressure',weakness:'Very limited aerial and long-range options',special:'Crown Crusher',superStyle:'Spinning crown powerbomb'},
 {name:'Violet V',style:'Capoeira',strength:'Low sweeps and spinning kick mixups',weakness:'Long spinning recoveries invite counters',special:'Purple Reign',superStyle:'Violet rising kick spiral'},
 {name:'Redline',style:'Rushdown brawling',strength:'Relentless advancing attacks',weakness:'Overcommitment loses to patient blocking',special:'Overdrive',superStyle:'Orange-red rushing uppercut'},
 {name:'Big Pressure',style:'Heavyweight clinch brawling',strength:'Armored charges and close-range crushing force',weakness:'Slow turns and highly telegraphed charges',special:'Pressure Break',superStyle:'Ground-splitting double slam',boss:true},
 {name:'Lady Static',style:'Feints and electric traps',strength:'Deceptive timing and space control',weakness:'Low resilience and vulnerable setup time',special:'Static Storm',superStyle:'Electric trap detonation',boss:true},
 {name:'Iron Haul',style:'Armored stance fighting',strength:'Can absorb a light hit during selected heavy attacks',weakness:'Throws and recovery punishes beat armor',special:'Full Load',superStyle:'Freight-charge shoulder smash',boss:true},
 {name:'The False King',style:'Stolen-technique stance switching',strength:'Versatile moves from several disciplines',weakness:'Visible stance changes and costly missed specials',special:'False Coronation',superStyle:'Counterfeit crown storm',boss:true}
];
export const PROTOTYPE=[
 {speed:240,jump:650,moves:{punch:{wind:.085,active:.10,recovery:.17,range:118,damage:12},kick:{wind:.22,active:.13,recovery:.31,range:155,damage:11},special:{wind:.23,active:.18,recovery:.60,range:300,damage:26},grab:{wind:.12,active:.08,recovery:.45,range:108,damage:16}}},
 {speed:210,jump:610,moves:{punch:{wind:.14,active:.10,recovery:.22,range:128,damage:9},kick:{wind:.17,active:.13,recovery:.37,range:185,damage:10},special:{wind:.19,active:.18,recovery:.75,range:260,damage:30},grab:{wind:.15,active:.08,recovery:.5,range:112,damage:14}}},
 {speed:265,jump:635,backSpeed:320,moves:{punch:{wind:.105,active:.09,recovery:.20,range:110,damage:8},kick:{wind:.15,active:.11,recovery:.29,range:178,damage:8},special:{wind:.20,active:.16,recovery:.68,range:285,damage:24},grab:{wind:.115,active:.08,recovery:.43,range:103,damage:12}}},
 {speed:230,jump:765,airSpeed:1.22,moves:{punch:{wind:.12,active:.10,recovery:.21,range:116,damage:10},kick:{wind:.18,active:.12,recovery:.34,range:165,damage:9},special:{wind:.21,active:.18,recovery:.72,range:275,damage:28},grab:{wind:.14,active:.08,recovery:.48,range:105,damage:13}}}
];
export const moveFor=(id,name)=>PROTOTYPE[id]?.moves[name];

export const SUPER_SEQUENCES=[
 {duration:3.15,beats:[{at:.35,damage:5},{at:.9,damage:5},{at:1.5,damage:6},{at:2.65,damage:10}]},
 {duration:3.25,beats:[{at:.4,damage:6},{at:1,damage:6},{at:1.6,damage:6},{at:2.7,damage:12}]},
 {duration:3.05,beats:[{at:.32,damage:4},{at:.86,damage:5},{at:1.45,damage:5},{at:2.55,damage:10}]},
 {duration:3.35,beats:[{at:.38,damage:5},{at:1.02,damage:5},{at:1.8,damage:7},{at:2.85,damage:11}]}
];
export const THROW_SEQUENCE={duration:1.05,escapeWindow:.3,impactAt:.82};

// Character identity is independent from left/right match slot.
export const FIGHTERS=[
 {key:'flex',color:'#d6ff63',quote:'REAL STAMP. REAL HANDS.',victory:'YOU CAN’T COUNTERFEIT THIS.',combo:'P → P → K',tip:'Get close. Confirm P → P → K after a landed punch.',cancels:{punch:['punch','kick']}},
 {key:'bootlegger',color:'#ffb05e',quote:'EVERY ORIGINAL HAS A COPY.',victory:'LOOKS REAL ENOUGH TO ME.',combo:'K → P',tip:'Use your long kick, then confirm into P at close range.',cancels:{kick:['punch']}},
 {key:'foxy',color:'#ff9cd9',quote:'CATCH ME IF YOU CAN.',victory:'TOO QUICK. TOO FOXY.',combo:'K → K',tip:'Land K → K. Your kick retreats on contact; backpedal to bait a miss.',cancels:{kick:['kick']},maxCancels:1},
 {key:'clara',color:'#d4a0ff',quote:'WATCH THE SKY.',victory:'SHOULD’VE LOOKED UP.',combo:'P → K · AIR K',tip:'Confirm P → K. Jump for air control, then protect your landing.',cancels:{punch:['kick']},maxCancels:1}
].map((f,i)=>({...ROSTER[i],...f,index:i,stats:PROTOTYPE[i]}));
export const fighterFor=f=>FIGHTERS[f?.character??f?.id??0]||FIGHTERS[0];
