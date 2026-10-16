import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./boot-v26.mjs',import.meta.url),'utf8').replace("import('./game.js?v=26')","(globalThis.bootLoaded=true,Promise.resolve())");
async function boot(oldVersion,offline=false){
 const order=[];let fail=false,loads=0;
 const active={state:'activated',postMessage(data,[port]){port.deliver({version:26});}},prior={postMessage(data,[port]){port.deliver({version:oldVersion});}};
 const serviceWorker={controller:prior,async register(){order.push('register');if(offline)throw Error('offline');return {active,async update(){order.push('update');serviceWorker.controller=active;}};}};
 const link={set href(value){order.push('style');assert(value.includes('26-ready'));queueMicrotask(()=>this.onload());}};
 const context={navigator:{serviceWorker},document:{querySelector:()=>link,getElementById:()=>({addEventListener(){fail=true;}})},setTimeout,clearTimeout,Promise,
  MessageChannel:class{constructor(){this.port1={close(){}};this.port2={deliver:data=>queueMicrotask(()=>this.port1.onmessage({data}))};}}};
 vm.runInNewContext(source,context);for(let n=0;n<12;n++)await new Promise(setImmediate);
 return {order,loaded:context.bootLoaded,fail};
}
test('a returning v25 player activates v26 and refreshes CSS before loading the engine',async()=>{
 const r=await boot(25);assert.equal(r.loaded,true);assert.equal(r.fail,false);assert.deepEqual(r.order,['register','update','style']);
});
test('an already-current worker starts offline without losing cached gameplay',async()=>{
 const r=await boot(26,true);assert.equal(r.loaded,true);assert.equal(r.fail,false);assert.deepEqual(r.order,['register','style']);
});
