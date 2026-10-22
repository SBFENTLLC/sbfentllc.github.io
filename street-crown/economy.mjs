import {SHOP_PAINTS} from './garage-expansion.mjs';
const UPGRADE_KEYS=['speed','accel','nitro','handling','armor','jump','magnet','power'];
const UPGRADE_LABELS={speed:'Speed',accel:'Acceleration',nitro:'Nitro',handling:'Handling',armor:'Armor',jump:'Jump / Landing',magnet:'Coin Magnet',power:'Power / Recharge'};
const UPGRADE_COSTS=[100,250,500,900,1500];
const MAX_UPGRADE=5;
function emptyUpgrade(){return Object.fromEntries(UPGRADE_KEYS.map(k=>[k,0]));}
function normalizeUpgrade(value={}){const out=emptyUpgrade();for(const k of UPGRADE_KEYS)out[k]=Math.max(0,Math.min(MAX_UPGRADE,Number(value?.[k])|0));return out;}
function upgradeCap(storyStep=0){return Math.max(1,Math.min(MAX_UPGRADE,1+Math.floor(Math.max(0,storyStep)/2)));}
function upgradeCost(level){return UPGRADE_COSTS[Math.max(0,Math.min(UPGRADE_COSTS.length-1,level|0))]??Infinity;}
function upgradeStats(driver,levels={}){const u=normalizeUpgrade(levels);return {
 top:driver.top*(1+u.speed*.035),
 accel:driver.accel*(1+u.accel*.07),
 grip:driver.grip*(1+u.handling*.045),
 armor:driver.armor*(1+u.armor*.06),
 nitroTop:1+u.nitro*.055,
 nitroDrain:Math.max(.68,1-u.nitro*.045),
 jump:1+u.jump*.08,
 landingBoost:u.jump*.11,
 power:1+u.power*.08,
 recharge:1-u.power*.03,
 magnet:.29+u.magnet*.045
};}
const COSMETICS=Object.freeze([
 ...SHOP_PAINTS.map(p=>({...p,category:'Truck colorway',price:150,unlock:0,effect:p.id})),
 {id:'decal-block',category:'Decal',name:'Block Champion Badge',price:0,unlock:0,showdown:0,effect:'decal-block'},
 {id:'underglow-signal',category:'Underglow',name:'Signal Glow',price:0,unlock:0,showdown:1,effect:'underglow-signal'},
 {id:'wheels-yard',category:'Wheels',name:'Freight Star Wheels',price:0,unlock:0,showdown:2,effect:'wheels-yard'},
 {id:'paint-skyline',category:'Truck colorway',name:'Skyline Royal Paint',price:0,unlock:0,showdown:3,effect:'paint-skyline'},
 {id:'decal-star',category:'Decal',name:'Skill Star Decal',price:0,unlock:0,skill:true,effect:'decal-star'},
 {id:'smoke-bluefire',category:'Tire smoke',name:'Blue Fire Smoke',price:0,unlock:0,skill:true,effect:'smoke-bluefire'},
 {id:'paint-sunrise',category:'Truck colorway',name:'Sunrise Champion',price:0,unlock:0,skill:true,effect:'paint-sunrise'},
 {id:'pose-juice',category:'Victory pose',name:'Juice Spin',price:0,unlock:0,skill:true,effect:'pose-juice'},
 {id:'paint-bluefire',category:'Truck colorway',name:'Blue Fire Paint',price:250,unlock:0,effect:'paint-bluefire'},
 {id:'wheels-crown',category:'Wheels',name:'Crown Spokes',price:350,unlock:1,effect:'wheels-crown'},
 {id:'underglow-royal',category:'Underglow',name:'Royal Glow',price:300,unlock:1,effect:'underglow-royal'},
 {id:'horn-stamp',category:'Horn',name:'Stamp Horn',price:200,unlock:2,effect:'horn-stamp'},
 {id:'exhaust-blue',category:'Exhaust',name:'Blue Flame Exhaust',price:450,unlock:2,effect:'exhaust-blue'},
 {id:'smoke-gold',category:'Tire smoke',name:'Gold Smoke',price:275,unlock:3,effect:'smoke-gold'},
 {id:'decal-crown',category:'Decal',name:'Crown Circuit Decal',price:325,unlock:3,effect:'decal-crown'},
 {id:'outfit-street',category:'Character outfit',name:'Street Crown Fit',price:600,unlock:4,effect:'outfit-street'},
 {id:'hair-crown',category:'Hairstyle',name:'Crown Cut',price:500,unlock:4,effect:'hair-crown'},
 {id:'chain-iced',category:'Chain / accessory',name:'Iced Crown Chain',price:650,unlock:5,effect:'chain-iced'},
 {id:'pose-pressure',category:'Victory pose',name:'Pressure Pose',price:700,unlock:6,effect:'pose-pressure'},
 {id:'skin-midnight',category:'Special truck skin',name:'Midnight Crown',price:900,unlock:8,effect:'skin-midnight'}
]);
function cosmeticTier(storyStep=0){return Math.max(0,Math.min(8,storyStep|0));}

export {UPGRADE_KEYS,UPGRADE_LABELS,UPGRADE_COSTS,MAX_UPGRADE,emptyUpgrade,normalizeUpgrade,upgradeCap,upgradeCost,upgradeStats,COSMETICS,cosmeticTier};
