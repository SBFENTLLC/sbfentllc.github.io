// Design targets for the complete roster. The first twelve are playable in
// the starting roster, followed by story bosses. Each entry names both its advantage and its counterplay.
export const ROSTER=[
 {name:'Flex A Lot',style:'Pressure boxing',strength:'Fast hands and close-range combos',weakness:'Short punch reach; kicks need commitment',special:'Stamped Out',superStyle:'Body blows, aerial launch, crown-stamp slam',playable:true},
 {name:'The Bootlegger',style:'Trickster kickboxing',strength:'Long kicks and a four-hit cinematic special',weakness:'Slower movement and longer recovery',special:'Counterfeit Combo',superStyle:'Clone crossfire and flying-kick finish',playable:true},
 {name:'Foxy',style:'Evasive kickboxing',strength:'Quick retreats and punish kicks',weakness:'Low damage per hit; vulnerable when cornered',special:'Foxy Rush',superStyle:'Zigzag kick rush',playable:true},
 {name:'Clara',style:'Aerial acrobatics',strength:'Air combos and jumping mixups',weakness:'Predictable landings can be punished',special:'Scarlet Spin',superStyle:'Red aerial corkscrew',playable:true},
 {name:'Goldie',style:'Power grappling',strength:'Throws break a defensive guard',weakness:'Slow approach and limited reach',special:'Gold Standard',superStyle:'Gold lift and ground slam',playable:true},
 {name:'Onyx',style:'Counter striking',strength:'Rewards accurate defensive timing',weakness:'Missed counters leave long openings',special:'Onyx Reversal',superStyle:'Shadow counter barrage',playable:true},
 {name:'DJ Blackout',style:'Sound-wave zoning',strength:'Controls distance with sound bursts',weakness:'Weaker close-up defense; slow projectile recovery',special:'Bass Drop',superStyle:'Concentric bass shockwaves',playable:true},
 {name:'Quiet Money',style:'Defensive boxing',strength:'Strong guard and deliberate heavy punches',weakness:'Slow attacks can be baited and whiff-punished',special:'Silent Investment',superStyle:'Delayed golden straight',playable:true},
 {name:'Neon Nova',style:'Dash striking',strength:'Fast approach and quick repositioning',weakness:'Light damage; unsafe dash endings',special:'Neon Blitz',superStyle:'Lime lightning dash chain',playable:true},
 {name:'Big Stamp',style:'Wrestling',strength:'Strong grabs and corner pressure',weakness:'Very limited aerial and long-range options',special:'Crown Crusher',superStyle:'Spinning crown powerbomb',playable:true},
 {name:'Violet V',style:'Capoeira',strength:'Low sweeps and spinning kick mixups',weakness:'Long spinning recoveries invite counters',special:'Purple Reign',superStyle:'Violet rising kick spiral',playable:true},
 {name:'Redline',style:'Rushdown brawling',strength:'Relentless advancing attacks',weakness:'Overcommitment loses to patient blocking',special:'Overdrive',superStyle:'Orange-red rushing uppercut',playable:true},
 {name:'Big Pressure',style:'Heavyweight clinch brawling',strength:'Armored charges and close-range crushing force',weakness:'Slow movement and highly telegraphed charges',special:'Pressure Break',superStyle:'Ground-splitting double slam',boss:true},
 {name:'Lady Static',style:'Electric trap boxing',strength:'Deceptive timing and space control',weakness:'Light close-range damage and vulnerable setup time',special:'Static Storm',superStyle:'Electric trap detonation',boss:true},
 {name:'Iron Haul',style:'Armored stance fighting',strength:'Can absorb a light hit during selected heavy attacks',weakness:'Throws and recovery punishes beat armor',special:'Full Load',superStyle:'Freight-charge shoulder smash',boss:true},
 {name:'The False King',style:'Stolen-technique stance switching',strength:'Versatile moves from several disciplines',weakness:'Visible stance changes and costly missed specials',special:'False Coronation',superStyle:'Counterfeit crown storm',boss:true}
];
export const PROTOTYPE=[
 {speed:240,jump:650,moves:{punch:{wind:.085,active:.10,recovery:.17,range:118,damage:12},kick:{wind:.22,active:.13,recovery:.31,range:155,damage:11},special:{wind:.23,active:.18,recovery:.60,range:300,damage:26},grab:{wind:.12,active:.08,recovery:.45,range:108,damage:16}}},
 {speed:210,jump:610,moves:{punch:{wind:.14,active:.10,recovery:.22,range:128,damage:9},kick:{wind:.17,active:.13,recovery:.37,range:185,damage:10},special:{wind:.19,active:.18,recovery:.75,range:260,damage:30},grab:{wind:.15,active:.08,recovery:.5,range:112,damage:14}}},
 {speed:265,jump:635,backSpeed:320,moves:{punch:{wind:.105,active:.09,recovery:.20,range:110,damage:8},kick:{wind:.15,active:.11,recovery:.29,range:178,damage:8},special:{wind:.20,active:.16,recovery:.68,range:285,damage:24},grab:{wind:.115,active:.08,recovery:.43,range:103,damage:12}}},
 {speed:230,jump:765,airSpeed:1.22,moves:{punch:{wind:.12,active:.10,recovery:.21,range:116,damage:10},kick:{wind:.18,active:.12,recovery:.34,range:165,damage:9},special:{wind:.21,active:.18,recovery:.72,range:275,damage:28},grab:{wind:.14,active:.08,recovery:.48,range:105,damage:13}}},
 {speed:185,jump:570,moves:{punch:{wind:.16,active:.10,recovery:.28,range:105,damage:14},kick:{wind:.25,active:.13,recovery:.40,range:138,damage:12},special:{wind:.27,active:.18,recovery:.90,range:210,damage:34},grab:{wind:.18,active:.10,recovery:.60,range:118,damage:23}}},
 {speed:220,jump:635,moves:{punch:{wind:.13,active:.10,recovery:.26,range:122,damage:10},kick:{wind:.20,active:.12,recovery:.35,range:160,damage:11},special:{wind:.20,active:.16,recovery:.76,range:265,damage:29},grab:{wind:.14,active:.08,recovery:.49,range:106,damage:14}}},
 {speed:215,jump:620,moves:{punch:{wind:.13,active:.10,recovery:.25,range:112,damage:8},kick:{wind:.28,active:.10,recovery:.50,range:165,damage:9},special:{wind:.24,active:.18,recovery:.80,range:340,damage:29},grab:{wind:.15,active:.08,recovery:.51,range:104,damage:13}}},
 {speed:190,jump:590,moves:{punch:{wind:.24,active:.10,recovery:.40,range:140,damage:16},kick:{wind:.26,active:.12,recovery:.43,range:160,damage:12},special:{wind:.29,active:.18,recovery:.85,range:260,damage:31},grab:{wind:.17,active:.08,recovery:.53,range:110,damage:17}}},
 {speed:285,jump:660,moves:{punch:{wind:.10,active:.10,recovery:.20,range:112,damage:9},kick:{wind:.18,active:.12,recovery:.32,range:170,damage:8},special:{wind:.20,active:.17,recovery:.78,range:300,damage:25},grab:{wind:.12,active:.08,recovery:.47,range:102,damage:12}}},
 {speed:175,jump:540,moves:{punch:{wind:.18,active:.10,recovery:.30,range:110,damage:15},kick:{wind:.28,active:.13,recovery:.45,range:145,damage:12},special:{wind:.31,active:.18,recovery:1,range:195,damage:36},grab:{wind:.21,active:.10,recovery:.65,range:130,damage:26}}},
 {speed:240,jump:690,moves:{punch:{wind:.12,active:.10,recovery:.24,range:112,damage:9},kick:{wind:.22,active:.12,recovery:.42,range:180,damage:10},special:{wind:.22,active:.18,recovery:.82,range:280,damage:28},grab:{wind:.15,active:.08,recovery:.51,range:105,damage:14}}},
 {speed:255,jump:635,moves:{punch:{wind:.10,active:.10,recovery:.30,range:118,damage:10},kick:{wind:.20,active:.12,recovery:.34,range:160,damage:10},special:{wind:.19,active:.18,recovery:.90,range:260,damage:31},grab:{wind:.14,active:.08,recovery:.50,range:108,damage:15}}},
 {speed:165,jump:510,moves:{punch:{wind:.26,active:.10,recovery:.40,range:140,damage:18},kick:{wind:.62,active:.12,recovery:.72,range:175,damage:19},special:{wind:.35,active:.18,recovery:1.05,range:230,damage:38},grab:{wind:.24,active:.10,recovery:.70,range:120,damage:24}}},
 {speed:235,jump:675,moves:{punch:{wind:.12,active:.10,recovery:.27,range:118,damage:8},kick:{wind:.28,active:.10,recovery:.55,range:170,damage:8},special:{wind:.26,active:.18,recovery:.90,range:310,damage:32},grab:{wind:.16,active:.08,recovery:.53,range:108,damage:14}}}
];
export const moveFor=(id,name)=>PROTOTYPE[id]?.moves[name];

export const SUPER_SEQUENCES=[
 {duration:3.15,beats:[{at:.35,damage:5},{at:.9,damage:5},{at:1.5,damage:6},{at:2.65,damage:10}]},
 {duration:3.25,beats:[{at:.4,damage:6},{at:1,damage:6},{at:1.6,damage:6},{at:2.7,damage:12}]},
 {duration:3.05,beats:[{at:.32,damage:4},{at:.86,damage:5},{at:1.45,damage:5},{at:2.55,damage:10}]},
 {duration:3.35,beats:[{at:.38,damage:5},{at:1.02,damage:5},{at:1.8,damage:7},{at:2.85,damage:11}]},
 {duration:3.40,beats:[{at:.42,damage:5},{at:1.08,damage:6},{at:1.82,damage:7},{at:2.9,damage:16}]},
 {duration:3.10,beats:[{at:.30,damage:6},{at:.82,damage:5},{at:1.50,damage:6},{at:2.60,damage:12}]},
 {duration:3.30,beats:[{at:.35,damage:5},{at:.98,damage:6},{at:1.65,damage:6},{at:2.80,damage:12}]},
 {duration:3.25,beats:[{at:.42,damage:5},{at:1.05,damage:6},{at:1.72,damage:6},{at:2.75,damage:14}]},
 {duration:3.05,beats:[{at:.30,damage:5},{at:.88,damage:5},{at:1.48,damage:5},{at:2.55,damage:10}]},
 {duration:3.60,beats:[{at:.42,damage:6},{at:1.08,damage:6},{at:1.90,damage:8},{at:3.08,damage:16}]},
 {duration:3.35,beats:[{at:.38,damage:5},{at:1.02,damage:6},{at:1.78,damage:6},{at:2.82,damage:11}]},
 {duration:3.10,beats:[{at:.28,damage:6},{at:.84,damage:6},{at:1.42,damage:7},{at:2.60,damage:12}]},
 {duration:3.6,beats:[{at:.45,damage:6},{at:1.15,damage:8},{at:1.95,damage:10},{at:3.05,damage:14}]},
 {duration:3.5,beats:[{at:.40,damage:5},{at:1.12,damage:7},{at:1.95,damage:7},{at:3.00,damage:13}]}
];
export const THROW_SEQUENCE={duration:1.05,escapeWindow:.3,impactAt:.82};

// Character identity is independent from left/right match slot.
export const FIGHTERS=[
 {key:'flex',color:'#d6ff63',quote:'REAL STAMP. REAL HANDS.',victory:'YOU CAN’T COUNTERFEIT THIS.',combo:'P → P → K',tip:'Get close. Confirm P → P → K after a landed punch.',cancels:{punch:['punch','kick']}},
 {key:'bootlegger',color:'#ffb05e',quote:'EVERY ORIGINAL HAS A COPY.',victory:'LOOKS REAL ENOUGH TO ME.',combo:'K → P',tip:'Use your long kick, then confirm into P at close range.',cancels:{kick:['punch']}},
 {key:'foxy',color:'#ff9cd9',quote:'CATCH ME IF YOU CAN.',victory:'TOO QUICK. TOO FOXY.',combo:'K → K',tip:'Land K → K. Your kick retreats on contact; backpedal to bait a miss.',cancels:{kick:['kick']},maxCancels:1},
 {key:'clara',color:'#d4a0ff',quote:'WATCH THE SKY.',victory:'SHOULD’VE LOOKED UP.',combo:'P → K · AIR K',tip:'Confirm P → K. Jump for air control, then protect your landing.',cancels:{punch:['kick']},maxCancels:1},
 {key:'goldie',color:'#ffda70',quote:'HEAVY HANDS. GOLD STANDARD.',victory:'THAT’S WHAT REAL WEIGHT DOES.',combo:'P → GRAB',tip:'Close the gap. Confirm P → GRAB; opponents can still escape your throw.',cancels:{punch:['grab']},maxCancels:1},
 {key:'onyx',color:'#a5defa',quote:'MAKE YOUR MOVE.',victory:'SAW THAT ONE COMING.',combo:'TIMED BLOCK → P',tip:'Tap BLOCK just before a punch or kick lands. Then P within 0.5s for an 18-damage counter.',cancels:{},maxCancels:0},
 {key:'dj',color:'#6ddfff',quote:'TURN IT ALL THE WAY UP.',victory:'THAT’S A WRAP ON YOUR SET.',combo:'K · SOUND WAVE',tip:'Ground K sends a sound wave. Control space, but recover before they get close.',cancels:{},maxCancels:0},
 {key:'quiet',color:'#f0cc73',quote:'LET THE HANDS TALK.',victory:'PROFIT. NO NOISE.',combo:'GUARD → P',tip:'Block, release, then punish with a heavy P. Grabs beat your guard; missed punches recover slowly.',cancels:{},maxCancels:0},
 {key:'nova',color:'#bcff46',quote:'BLINK. I’M ALREADY THERE.',victory:'COULDN’T KEEP UP.',combo:'DIRECTION + P → K',tip:'Hold left or right and tap P to dash-punch. No invincibility; missed dashes recover slowly.',cancels:{punch:['kick']},maxCancels:1},
 {key:'stamp',color:'#81a9ff',quote:'HEAVY IS THE CROWN.',victory:'STAMPED. SEALED. DONE.',combo:'CLOSE IN → GRAB',tip:'Walk them into the corner, then GRAB. Your 26-damage throw is strong but slow and escapable.',cancels:{},maxCancels:0},
 {key:'violet',color:'#ce9bff',quote:'STAY LIGHT ON YOUR FEET.',victory:'CAUGHT YOU OFF BALANCE.',combo:'K · LOW SWEEP',tip:'Ground K sweeps standing guard. Hold DOWN + BLOCK or jump to defend against it.',cancels:{},maxCancels:0},
 {key:'redline',color:'#ff9455',quote:'NO BRAKES. ALL PRESSURE.',victory:'RAN STRAIGHT THROUGH.',combo:'P → P → P',tip:'Your punches advance. Confirm P → P → P; blocked or missed rushes leave an opening.',cancels:{punch:['punch']},maxCancels:2},
 {key:'pressure',color:'#ffd46b',quote:'FEEL THE WHOLE BLOCK SHAKE.',victory:'PRESSURE MAKES THE RULES.',combo:'CHARGE · GRAB',tip:'Ground K winds up an armored shoulder charge. Absorbs one light hit; grabs, heavy attacks and recovery punishes beat it.',cancels:{},maxCancels:0},
 {key:'static',color:'#70f5ff',quote:'YOUR SIGNAL ENDS HERE.',victory:'OFF THE AIR.',combo:'K · ELECTRIC TRAP',tip:'Ground K plants one trap. It arms after 0.65 seconds. Jump or block it; hitting its owner breaks it. Air K stays a close kick.',cancels:{},maxCancels:0}
].map((f,i)=>({...ROSTER[i],...f,index:i,stats:PROTOTYPE[i]}));
export const fighterFor=f=>FIGHTERS[f?.character??f?.id??0]||FIGHTERS[0];
