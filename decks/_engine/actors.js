/* Photo-actor deck engine. Every actor (a cut-out photo) springs to a per-slide target.
   start({actors:[{id,src,w,h,z}], pose:(i,tIn,T,api)=>({id:{x,y,s,sx,sy,r,o}}), onFrame?(i,tIn,T,api)}) */
export async function start(cfg){
  const front=document.getElementById('front'),back=document.getElementById('back'),A=document.getElementById('astage');
  const S=[...front.querySelectorAll('.slide')];
  S.forEach(s=>{const b=document.createElement('section');b.className='slide';s.querySelectorAll('.bk').forEach(x=>b.appendChild(x));back.appendChild(b);s._b=b});
  const fit=()=>{const k=Math.min(innerWidth/1920,innerHeight/1080);[front,back,A].forEach(x=>x.style.transform=`translate(-50%,-50%) scale(${k})`)};addEventListener('resize',fit);fit();
  const act={};
  await Promise.all(cfg.actors.map(a=>new Promise(res=>{const im=new Image();im.onload=res;im.onerror=res;im.src=a.src;im.className='actor'+(a.cls?' '+a.cls:'');im.style.width=a.w+'px';im.style.height=a.h+'px';im.style.zIndex=a.z||1;A.appendChild(im);
    act[a.id]={...a,el:im,p:{x:960,y:-800,s:1,sx:1,sy:1,r:0,o:0},v:{x:0,y:0,s:0,sx:0,sy:0,r:0,o:0},k:a.k||1}})));
  const ui=document.createElement('div');ui.className='deck-ui3';ui.innerHTML='<span class="h">← → to navigate · F fullscreen</span><span class="n"></span><i class="bar"></i>';document.body.appendChild(ui);
  let i=0,tEnter=performance.now();
  function go(n){n=Math.max(0,Math.min(S.length-1,n));if(n===i&&document.body.classList.contains('ready'))return;i=n;tEnter=performance.now();
    S.forEach((s,k)=>{s.classList.toggle('on',k===n);s._b.classList.toggle('on',k===n)});
    const s=S[n];document.body.style.background=s.dataset.bg||'';document.body.dataset.theme=s.dataset.theme||'';document.body.dataset.slide=n;
    ui.querySelector('.n').textContent=String(n+1).padStart(2,'0')+' / '+String(S.length).padStart(2,'0');ui.querySelector('.bar').style.width=((n+1)/S.length*100)+'%';history.replaceState(null,'','#'+(n+1))}
  const api={act};const T0=performance.now();let last=T0;
  const keys=['x','y','s','sx','sy','r','o'];
  function frame(now){const dt=Math.min(1/30,(now-last)/1000);last=now;const T=(now-T0)/1000,tIn=(now-tEnter)/1000;
    const P=cfg.pose(i,tIn,T,api)||{};
    for(const id in act){const a=act[id],t=Object.assign({x:a.p.x,y:a.p.y,s:a.p.s,sx:1,sy:1,r:a.p.r,o:0},P[id]||{});
      const K=(t.stiff||120)*a.k,D=(t.damp||17)*Math.sqrt(a.k);
      for(const q of keys){const f=K*(t[q]-a.p[q])-D*a.v[q];a.v[q]+=f*dt;a.p[q]+=a.v[q]*dt}
      if(t.snap){for(const q of keys){a.p[q]=t[q];a.v[q]=0}}
      const p=a.p;a.el.style.opacity=Math.max(0,Math.min(1,p.o));
      a.el.style.transform=`translate(${p.x-a.w/2}px,${p.y-a.h/2}px) rotate(${p.r}deg) scale(${p.s*p.sx},${p.s*p.sy})`}
    if(cfg.onFrame)cfg.onFrame(i,tIn,T,api);
    requestAnimationFrame(frame)}
  addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();go(i+1)}if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){e.preventDefault();go(i-1)}if(e.key==='f'||e.key==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}});
  addEventListener('click',e=>{if(e.target.closest('a,button'))return;go(e.clientX>innerWidth*.3?i+1:i-1)});
  let tx=0;addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)go(d<0?i+1:i-1)});
  setTimeout(()=>ui.classList.add('idle'),4000);
  i=-1;go(Math.max(0,(parseInt(location.hash.slice(1))||1)-1));requestAnimationFrame(frame);document.body.classList.add('ready');
  return {go};
}
export const rnd=(seed=>()=>(seed=(seed*16807)%2147483647)/2147483647)(42);
