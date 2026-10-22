const CITY_ROUTES=Object.freeze([
 {id:'alley',name:'CROWN ALLEY',start:10500,end:15500,side:-1,offset:1.03,lift:0,boost:1.10,color:'#dcadff'},
 {id:'roof',name:'ROOFTOP RUN',start:32000,end:38600,side:1,offset:1.02,lift:420,boost:1.13,color:'#ffe49a'},
 {id:'river',name:'RIVER EXPRESS',start:46600,end:52600,side:1,offset:1.03,lift:-75,boost:1.09,color:'#99f3ed'}
]);
const ACTIVE_ROUTES=CITY_ROUTES;
const routeAt=id=>CITY_ROUTES.find(r=>r.id===id);
function routeShape(distance,id){const r=routeAt(id);if(!r)return {center:0,width:1,height:0,blend:0};const z=((distance%60000)+60000)%60000,t=Math.max(0,Math.min(1,(z-r.start)/(r.end-r.start))),b=Math.min(1,t*3,(1-t)*3),smooth=b*b*(3-2*b);return {center:r.side*(.65+r.offset*smooth),width:.5+.12*smooth,height:r.lift*smooth,blend:smooth};}
function routeEntry(previous,distance,lane){return ACTIVE_ROUTES.find(r=>{const start=Math.floor(Math.max(0,previous)/60000)*60000+r.start;return previous<start&&distance>=start&&lane*r.side>.48&&Math.abs(lane)<1.2;});}
const worldLane=(distance,lane,route)=>{const q=routeShape(distance,route);return q.center+lane*q.width;};
const routeLane=(distance,lane,route)=>{const q=routeShape(distance,route);return (lane-q.center)/q.width;};
export {CITY_ROUTES,ACTIVE_ROUTES,routeAt,routeShape,routeEntry,worldLane,routeLane};
