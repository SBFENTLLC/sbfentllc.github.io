export const JUICE_ID=16;
export const DETECTIVE_ID=17;
export const portraitFor=id=>id===4?'assets/driver-kart-4-hair.png':id===JUICE_ID?'assets/little-juice-front.webp':id===DETECTIVE_ID?'assets/detective-front.webp':`assets/driver-kart-${id}.webp`;
export const kartFor=id=>id===4?'assets/kart-4-hair.png':id===JUICE_ID?'assets/little-juice-rear.webp':id===DETECTIVE_ID?'assets/detective-rear.webp':`assets/kart-${id}.webp`;
