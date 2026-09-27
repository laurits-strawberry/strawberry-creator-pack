import {start} from '../_engine/actors.js';
const meta=await (await fetch('img/meta.json')).json();
const cb=meta.bb.croissant;
const NB=meta.beans.length;let seed=7;const R=()=>(seed=(seed*16807)%2147483647)/2147483647;
const beans=meta.beans.map(([w,h],k)=>({id:'b'+k,src:'img/bean'+k+'.png',w,h,z:5,cls:'bean',k:.7+R()*.6,a0:R()*6.283,r0:R()*360,sc:.42+R()*.2,rr:R(),rr2:R()}));
const actors=[
 {id:'cro',src:'img/croissant.png',w:cb[2]-cb[0],h:cb[3]-cb[1],z:3,cls:'cro'},
 {id:'terra',src:'img/cup_terra.png',w:1024,h:1024,z:10,cls:'cup'},
 {id:'sage',src:'img/cup_sage.png',w:1024,h:1024,z:11,cls:'cup'},
 {id:'esp',src:'img/cup_esp.png',w:1024,h:1024,z:12,cls:'cup'},
 ...beans];
const cup=(x,y,s,r,glaze='terra',extra={})=>{const o={};['terra','sage','esp'].forEach(g=>o[g]={x,y,s,r,o:g===glaze||(g==='terra')?1:0,...extra});
  // terra is the base layer; others fade in above it
  if(glaze!=='terra'){o.terra.o=1}return o};
// bean bar chart: columns 2025..2028
const cols=[3,5,8,12];const chart=[];cols.forEach((n,c)=>{for(let k=0;k<n;k++)chart.push([1190+c*170+(k%2)*34-17,900-Math.floor(k/2)*62-(k%2)*10])});
await start({actors,
 pose(i,t,T){
  const o={};
  if(i===0){Object.assign(o,cup(960,530,.74,T*5));o.cro={x:-500,y:800,s:.6,r:-30,o:1};
    beans.forEach((b,k)=>{const a=b.a0+T*.06*(b.rr>.5?1:-1)*.8,rad=440+b.rr2*200;o[b.id]={x:960+Math.cos(a)*rad*1.55,y:530+Math.sin(a)*rad*.62,s:b.sc,r:b.r0+T*20*(b.rr-.5),o:1,stiff:40,damp:9}})}
  if(i===1){Object.assign(o,cup(1400,470,.72,-24+Math.sin(T*.5)*2));o.cro={x:1080,y:900,s:.62,r:-18,o:1,stiff:70,damp:12};
    beans.forEach((b,k)=>{const x=1000+b.rr*900,y=b.rr2<.5?-120-b.rr2*400:1200+b.rr2*300;o[b.id]={x:k<7?1650+b.rr*230:x,y:k<7?820+b.rr2*260:y,s:b.sc,r:b.r0,o:1,stiff:50,damp:10}})}
  if(i===2){Object.assign(o,cup(560,560,.66,40));o.cro={x:-600,y:1000,s:.6,r:-60,o:1};
    beans.forEach((b,k)=>{const d=.2+k*.035;const a=k*.55+T*.15,rad=360+k*3.2;const tx=560+Math.cos(a)*rad*.95,ty=560+Math.sin(a)*rad*.95;
      o[b.id]=t<d?{x:560+(b.rr-.5)*300,y:-200,s:b.sc,r:b.r0,o:1}:{x:tx,y:ty,s:b.sc*1.05,r:b.r0+k*20+T*12,o:1,stiff:70,damp:11}})}
  if(i===3){Object.assign(o,cup(640,560,3.3,-30+T*2));o.cro={x:-800,y:540,s:.6,r:0,o:1};
    beans.forEach(b=>{o[b.id]={x:960+Math.cos(b.a0)*1500,y:540+Math.sin(b.a0)*1100,s:b.sc*3,r:b.r0,o:1,stiff:60,damp:12}})}
  if(i>=4&&i<=6){const g=['terra','sage','esp'][i-4];Object.assign(o,cup(1360,560,.76,[0,120,240][i-4]+Math.sin(T*.6)*3,g,{stiff:70,damp:13}));o.cro={x:-800,y:900,s:.6,r:0,o:1};
    beans.forEach((b,k)=>{if(k<10){const a=k/10*6.283+T*.12+(i-4)*.8;o[b.id]={x:1360+Math.cos(a)*470,y:560+Math.sin(a)*430,s:b.sc,r:b.r0+T*25,o:1,stiff:60,damp:11}}else o[b.id]={x:2300+b.rr*300,y:b.rr2*1080,s:b.sc,r:b.r0,o:1,stiff:40,damp:10}})}
  if(i===7){Object.assign(o,cup(2500,-400,.5,30));o.cro={x:2300,y:300,s:.5,r:0,o:1};
    beans.forEach((b,k)=>{const d=.4+k*.045;if(k<chart.length){const [x,y]=chart[k];o[b.id]=t<d?{x,y:-150,s:.5,r:b.r0,o:1}:{x,y,s:.52,r:(b.rr-.5)*40,o:1,stiff:170,damp:14}}else o[b.id]={x:2300,y:b.rr2*1080,s:b.sc,r:0,o:1}})}
  if(i===8){Object.assign(o,cup(960,640,.62,T*6));o.cro={x:-800,y:900,s:.6,r:0,o:1};
    beans.forEach((b,k)=>{const a=b.a0,burst=t>.6;const rad=burst?700+b.rr2*500:20;o[b.id]={x:960+Math.cos(a)*rad*1.3,y:640+Math.sin(a)*rad,s:b.sc*1.1,r:b.r0+T*90*(b.rr-.5),o:1,stiff:burst?35:200,damp:burst?7:20}})}
  return o}});
