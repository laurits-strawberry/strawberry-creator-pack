(function(){
  if(matchMedia('print').matches)return;
  const root=document.documentElement;root.classList.add('deckmode');
  const deck=document.querySelector('.deck'),slides=[...deck.querySelectorAll('.slide')];
  const ui=document.createElement('div');ui.className='deck-ui';ui.innerHTML='<span class="h">← → to navigate · F for fullscreen</span><span class="n"></span><i class="bar"></i>';document.body.appendChild(ui);
  let i=Math.max(0,Math.min(slides.length-1,(parseInt(location.hash.slice(1))||1)-1));
  function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);deck.style.transform=`scale(${s}) translate(-50%,-50%)`;deck.style.transformOrigin='0 0';deck.style.left='50%';deck.style.top='50%';deck.style.transform=`translate(-50%,-50%) scale(${s})`;deck.style.transformOrigin='50% 50%'}
  function show(n){i=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,k)=>{s.classList.toggle('on',k===i);s.classList.toggle('past',k<i)});
    ui.querySelector('.n').textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');ui.querySelector('.bar').style.width=((i+1)/slides.length*100)+'%';
    history.replaceState(null,'','#'+(i+1));slides[i].querySelectorAll('video').forEach(v=>{v.currentTime=0;v.play().catch(()=>{})});
    document.dispatchEvent(new CustomEvent('slide',{detail:{index:i,slide:slides[i]}}))}
  addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();show(i+1)}if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){e.preventDefault();show(i-1)}if(e.key==='Home')show(0);if(e.key==='End')show(slides.length-1);if(e.key==='f'||e.key==='F'){document.fullscreenElement?document.exitFullscreen():root.requestFullscreen()}});
  addEventListener('click',e=>{if(e.target.closest('a,button,input'))return;show(e.clientX>innerWidth*.3?i+1:i-1)});
  let tx=0;addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(d<0?i+1:i-1)});
  let idle;addEventListener('mousemove',()=>{ui.classList.remove('idle');clearTimeout(idle);idle=setTimeout(()=>ui.classList.add('idle'),2500)});setTimeout(()=>ui.classList.add('idle'),4000);
  addEventListener('resize',fit);fit();requestAnimationFrame(()=>show(i));
  window.deck={show,get index(){return i},slides};
})();
