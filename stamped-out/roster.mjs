// Design targets for the complete roster. Only the first two are playable in
// this review build. Each entry names both its advantage and its counterplay.
export const ROSTER=[
 {name:'Flex A Lot',style:'Pressure boxing',strength:'Fast hands and close-range combos',weakness:'Short punch reach; kicks need commitment',special:'Stamped Out',superStyle:'Body blows, aerial launch, crown-stamp slam',playable:true},
 {name:'The Bootlegger',style:'Trickster kickboxing',strength:'Long kicks and a four-hit cinematic special',weakness:'Slower movement and longer recovery',special:'Counterfeit Combo',superStyle:'Clone crossfire and flying-kick finish',playable:true},
 {name:'Foxy',style:'Evasive kickboxing',strength:'Quick retreats and punish kicks',weakness:'Low damage per hit; vulnerable when cornered',special:'Foxy Rush',superStyle:'Zigzag kick rush'},
 {name:'Clara',style:'Aerial acrobatics',strength:'Air combos and jumping mixups',weakness:'Predictable landings can be punished',special:'Scarlet Spin',superStyle:'Red aerial corkscrew'},
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
 {speed:240,jump:650,moves:{punch:{wind:.085,active:.10,recovery:.17,range:118,damage:8},kick:{wind:.22,active:.13,recovery:.31,range:155,damage:11},special:{wind:.23,active:.18,recovery:.60,range:300,damage:26},grab:{wind:.12,active:.08,recovery:.45,range:108,damage:16}}},
 {speed:210,jump:610,moves:{punch:{wind:.14,active:.10,recovery:.22,range:128,damage:6},kick:{wind:.17,active:.13,recovery:.37,range:185,damage:10},special:{wind:.19,active:.18,recovery:.75,range:260,damage:30},grab:{wind:.15,active:.08,recovery:.5,range:112,damage:14}}}
];
export const moveFor=(id,name)=>PROTOTYPE[id]?.moves[name];

export const SUPER_SEQUENCES=[
 {duration:3.15,beats:[{at:.35,damage:5},{at:.9,damage:5},{at:1.5,damage:6},{at:2.65,damage:10}]},
 {duration:3.25,beats:[{at:.4,damage:6},{at:1,damage:6},{at:1.6,damage:6},{at:2.7,damage:12}]}
];
export const THROW_SEQUENCE={duration:1.05,escapeWindow:.3,impactAt:.82};
