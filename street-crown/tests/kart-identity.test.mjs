import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPuppetGarage,Scene} from '../puppet3d.mjs';
import {RACERS} from '../roster.mjs';
import {SPECIAL_VEHICLES} from '../garage-expansion.mjs';
import {kartBodyFilter} from '../kart-identity.mjs';
function canvas(){const draws=[],stack=[],target={filter:'none',save(){stack.push(this.filter)},restore(){this.filter=stack.pop()},drawImage(img,...args){draws.push({img,args,filter:this.filter})},createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}};return {draws,c:new Proxy(target,{get(o,k){return k in o?o[k]:()=>{};}})};}
const vehicles=['stock',...SPECIAL_VEHICLES.map(v=>v.id)];
test('every racer keeps the exact original artwork in the garage with every vehicle kit and wrap',()=>{for(const racer of RACERS)for(const vehicle of vehicles)for(const wrap of [0,1]){const {c,draws}=canvas(),img={naturalWidth:320,naturalHeight:320,racer:racer.id};renderPuppetGarage(c,800,600,racer.id,wrap,img,0,['paint-neon','skin-midnight'],vehicle);assert.equal(draws.length,2);assert.ok(draws.every(d=>d.img===img));assert.equal(draws[0].filter,'none');assert.equal(draws[0].args[3],208);assert.match(draws[1].filter,/hue-rotate/);}});
test('race sprites preserve the original driver pixels with still and animated puppet poses for every kit',()=>{for(const racer of RACERS)for(const vehicle of vehicles)for(const pose of [null,{lean:.4,bob:.3,nod:.2}]){const {c,draws}=canvas(),img={naturalWidth:320,naturalHeight:320,racer:racer.id},scene=new Scene(c,800,600,[0,0,-1000],[0,0,0]);scene.sprite([0,0,0],img,400,400,{filter:'none',bodyFilter:kartBodyFilter(1,['paint-neon']),puppet:pose,vehicle,racer:racer.id,wrap:1});scene.paint();assert.ok(draws.length>=2);for(const d of draws){assert.equal(d.img,img);if(d.args[1]<208)assert.equal(d.filter,'none');else assert.match(d.filter,/hue-rotate/);}}});
test('missing artwork is never replaced by a generated character',()=>{for(const v of vehicles){const {c,draws}=canvas();renderPuppetGarage(c,800,600,0,0,null,0,[],v);assert.equal(draws.length,0);}});
import {readFileSync} from 'node:fs';
test('art registration and renderer share one cache-versioned module instance',()=>{const app=readFileSync(new URL('../app.mjs',import.meta.url),'utf8'),render=readFileSync(new URL('../render.mjs',import.meta.url),'utf8');const registered=app.match(/import \{setPuppetArt\} from "([^"]+)"/)[1],drawn=render.match(/from "([^"]+)"/)[1];assert.equal(registered,drawn);});
