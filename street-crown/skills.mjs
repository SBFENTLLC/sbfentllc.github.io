export const MEDALS=Object.freeze([
 {id:'coins',name:'Coin Runner',icon:'◉',field:'coins',levels:[25,60,110],reward:'decal-star',rewardTier:1},
 {id:'air',name:'Air Time',icon:'↟',field:'cleanLandings',levels:[1,3,5],reward:'smoke-bluefire',rewardTier:2},
 {id:'drift',name:'Drift Star',icon:'↝',field:'driftBoosts',levels:[1,4,7]},
 {id:'explore',name:'City Explorer',icon:'⌁',field:'routeVisits',levels:[1,2,3],reward:'paint-sunrise',rewardTier:2},
 {id:'signature',name:'Showtime',icon:'★',field:'signatureWins',levels:[1,2,3],reward:'pose-juice',rewardTier:1}
]);
export const TIER_NAMES=['LOCKED','BRONZE','SILVER','GOLD'];
export function medalResults(race){return MEDALS.map(m=>{const n=m.field==='routeVisits'?new Set(race.player.routesSeen||[]).size:Number(race.player[m.field])||0;return {...m,value:n,tier:m.levels.filter(v=>n>=v).length};});}
export function rivalryLine(char,kind,history={}){const passed=['Crown pass! I see you!','No counterfeit passes here!','Quick like a fox!','Nice line! Catch you in the air!','That pass was golden!','Out of the shadows—nice!','You passed the DJ? Turn it up!','A smart move. Well played!','Whoa, catch that glow!','Big Stamp wants a rematch!','Smooth moves, racer!','Hot pass! Keep it rolling!','I felt that pressure!','Signal received. Nice pass!','Passing freight? Respect!','You earned that pass!','Blue fire! Race you to the flag!'];if(kind==='rematch'&&(history.wins||0)>0)return ['You got me last time. Rematch!','New race, new crown!','I practiced that corner. Let’s race!'][char%3];return kind==='passed'?passed[char%passed.length]:['I found my line! Your move!','Catch me at the next corner!','Good race! Keep coming!'][char%3];}
