export const ARENAS=[
 {id:'rooftop',name:'SBFENT Rooftop',file:'rooftop.webp'},
 {id:'studio',name:'SBFENT Studio',file:'studio.webp'},
 {id:'vault',name:'The Vault',file:'vault.webp'},
 {id:'workshop',name:'Bootleg Workshop',file:'workshop.webp'},
 {id:'blockparty',name:'Carolina Block Party',file:'blockparty.webp',chapter:0},
 {id:'underground',name:'Neon Underground',file:'underground.webp',chapter:1},
 {id:'motoryard',name:'Flex Motor Yard',file:'motoryard.webp',chapter:2},
 {id:'penthouse',name:'Crown Penthouse',file:'penthouse.webp',chapter:3}
];
export function availableArena(id,chapters=[]){const arena=ARENAS.find(a=>a.id===id);return !!arena&&(arena.chapter===undefined||chapters[arena.chapter]?.cleared===true);}
