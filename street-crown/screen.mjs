const NORMAL='width=device-width,initial-scale=1,viewport-fit=cover';
class RaceScreen{
 constructor(doc=globalThis.document,nav=globalThis.navigator,screen=globalThis.screen){this.doc=doc;this.nav=nav;this.screen=screen;this.wake=null;this.active=false;this.wanted=false;this.pending=false;}
 pin(on){this.active=on;this.doc.documentElement?.classList.toggle('race-locked',on);this.doc.querySelector?.('meta[name="viewport"]')?.setAttribute('content',on?NORMAL+',maximum-scale=1,user-scalable=no':NORMAL);}
 async awake(){this.wanted=true;if(!this.active||this.wake||this.pending||!this.nav?.wakeLock?.request)return;this.pending=true;try{const lock=await this.nav.wakeLock.request('screen');if(this.active&&this.wanted)this.wake=lock;else await lock.release();}catch{}finally{this.pending=false;}}
 async sleep(){this.wanted=false;const lock=this.wake;this.wake=null;try{await lock?.release();}catch{}}
 async landscape(){try{if(!this.screen?.orientation?.lock)return false;await this.screen.orientation.lock('landscape');this.orientationOwned=true;return true;}catch{return false;}}
 async release(){this.pin(false);await this.sleep();if(this.orientationOwned){try{this.screen?.orientation?.unlock?.();}catch{}this.orientationOwned=false;}}

}

export {RaceScreen};
