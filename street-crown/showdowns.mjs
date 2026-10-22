export const SHOWDOWNS=Object.freeze([
 {track:0,index:1,rival:1,title:'THE BLOCK BELONGS TO US',line:'No fake finish today! Bring your best line—I brought mine.',cue:[196,233,294,392],song:0,reward:'decal-block',rewardName:'Block Champion Badge',coins:100,color:'#f4cd79'},
 {track:1,index:3,rival:13,title:'CLEAR THE AIRWAVES',line:'Can you keep your rhythm when the signal gets wild? Show me!',cue:[311,415,466,622],song:1,reward:'underglow-signal',rewardName:'Signal Glow',coins:150,color:'#9ae8ff'},
 {track:2,index:5,rival:12,title:'PRESSURE AT THE YARD',line:'Big truck, big heart. Earn your way past me, racer!',cue:[147,196,220,294],song:2,reward:'wheels-yard',rewardName:'Freight Star Wheels',coins:200,color:'#ffb766'},
 {track:3,index:7,rival:15,title:'THE REAL CROWN',line:'The whole city is watching. Let the final corner decide!',cue:[262,330,392,523],song:3,reward:'paint-skyline',rewardName:'Skyline Royal Paint',coins:300,color:'#d5b0ff'}
]);
export const showdownFor=index=>SHOWDOWNS.find(s=>s.index===index)||null;
