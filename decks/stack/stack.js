import {start} from '../_engine/actors.js';
const L=await (await fetch('img/layers.json')).json();
const step={topbun:128,cheese1:14,patty1:52,cheese2:14,patty2:56,pickles:14,tomato:22,lettuce:66};
const names=['Brioche bun','Cheese','Smashed patty','Cheese','Smashed patty','Pickles','Tomato','Lettuce','Toasted bun'];
let ty=0;L.forEach(l=>{l.sy=ty;ty+=step[l.n]||0});
const last=L[L.length-1],Hs=last.sy+last.h,eTop=L[0].y,He=last.y+last.h-eTop;
const actors=L.map((l,j)=>({id:l.n,src:'img/'+l.n+'.png',w:l.w,h:l.h,z:20-j,cls:'food',k:1-j*.04}));
function burger(bx,by,s,sp=0,rot=0){const o={},c=Math.cos(rot*Math.PI/180),sn=Math.sin(rot*Math.PI/180);const cen=Hs/2+(eTop+He/2-Hs/2)*sp;
  L.forEach(l=>{const dx=l.x+l.w/2-512,dy=(l.sy+(l.y-l.sy)*sp)+l.h/2-cen;o[l.n]={x:bx+s*(dx*c-dy*sn),y:by+s*(dx*sn+dy*c),s,r:rot,o:1}});return o}
const scatter=[[1250,230,.62,-18],[1640,300,.6,24],[1180,520,.6,12],[1560,560,.62,-30],[1330,760,.6,-8],[1720,820,.55,40],[1220,950,.55,16],[1650,1020,.6,-12],[1400,420,.55,6]];
// labels
const lbls=L.map((l,j)=>{const d=document.createElement('div');d.className='lbl';d.innerHTML='<i></i>'+String(j+1).padStart(2,'0')+' '+names[j];document.getElementById('astage').appendChild(d);return d});
const A=document.getElementById('astage');
await start({actors,
 pose(i,t,T){
  if(i===0){const o=burger(960,570,.95,0,0);L.forEach((l,j)=>{const d=.35+(8-j)*.17;if(t<d)o[l.n]={x:o[l.n].x,y:-420,s:.95,r:(j%2?14:-14),o:1};else Object.assign(o[l.n],{stiff:200,damp:15})});return o}
  if(i===1){const o=burger(1370,545,.93,1,0);L.forEach((l,j)=>{o[l.n].y+=Math.sin(T*1.4+j)*5;o[l.n].r=Math.sin(T*.9+j*1.7)*2});return o}
  if(i===2){const o={};const bx=1330,s=1.55,py=640;
    L.forEach((l,j)=>{o[l.n]={x:900+j*140,y:1600+j*40,s:.8,r:j*30-90,o:1}});
    o.topbun={x:2400,y:-500,s:1,r:40,o:1};
    const smashed=t>1.0;o.patty1={x:bx,y:t<.95?py-260:py,s,sx:smashed?(t<1.25?1.2:1.07):1,sy:smashed?(t<1.25?.66:.9):1,r:0,o:1,stiff:t<1.25?600:160,damp:t<1.25?20:14};
    const pT=py-L[2].h*s*.32;
    o.cheese1={x:bx-4,y:t<1.9?-400:pT,s:s*1.02,r:0,o:1,stiff:220,damp:16};
    if(t>2.7)o.topbun={x:bx,y:pT-L[0].h*s*.3,s:s*.98,r:0,o:1,stiff:220,damp:16};
    return o}
  if(i===3)return burger(760,520,2.35,0,-3);
  if(i===4)return burger(530,590,.95,0,5+Math.sin(T*.8)*3);
  if(i===5){const o={};L.forEach((l,j)=>{const [x,y,s,r]=scatter[j];o[l.n]={x,y:y+Math.sin(T*1.2+j)*8,s,r:r+Math.sin(T*.7+j)*3,o:1,stiff:90,damp:13}});return o}
  if(i===6)return burger(960,565,.8,0,0);
 },
 onFrame(i,t,T,{act}){
  L.forEach((l,j)=>{const a=act[l.n].p;lbls[j].style.transform=`translate(${a.x+l.w*a.s/2+24}px,${a.y-8}px)`});
  if(i===6&&t>1.5){const s=.8,right=960+(L[0].x+L[0].w-512)*s,top=565-Hs*s/2;const R=Math.round(Math.min(1,(t-1.5)*9)*74);
    const c=[[right+6,top+Hs*s*.30],[right+30,top+Hs*s*.46],[right+4,top+Hs*s*.62],[right+48,top+Hs*s*.36],[right+46,top+Hs*s*.56]];
    const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><mask id='m'><rect width='1920' height='1080' fill='white'/>${c.map(([x,y])=>`<circle cx='${x.toFixed(0)}' cy='${y.toFixed(0)}' r='${R}' fill='black'/>`).join('')}</mask></defs><rect width='1920' height='1080' fill='black' mask='url(#m)'/></svg>`;
    const u=`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;if(A._m!==u){A._m=u;A.style.maskImage=u;A.style.webkitMaskImage=u;A.style.maskSize=A.style.webkitMaskSize='1920px 1080px';A.style.maskMode='alpha'}}
  else if(A._m){A._m='';A.style.maskImage='';A.style.webkitMaskImage=''}
 }});
