/* Deliberately terrible 2003-PowerPoint engine. Every transition is a crime. */
const FX=['spin','star','bounce','zoomtwirl','checker','flyleft','swirl','blinds'];
export function startSlop(){
  const st=document.querySelector('.stage'),S=[...document.querySelectorAll('.slide')];let i=0,busy=false;
  const fit=()=>{const k=Math.min(innerWidth/1920,innerHeight/1080);st.style.transform=`translate(-50%,-50%) scale(${k})`};addEventListener('resize',fit);fit();
  const show=(n,fx)=>{if(busy||n<0||n>=S.length)return;busy=true;const a=S[i],b=S[n];[...b.classList].filter(c=>c.startsWith('fx-')).forEach(c=>b.classList.remove(c));b.classList.add('on','fx-'+(fx||FX[n%FX.length]));a.classList.add('out');
    b.querySelectorAll('[data-in]').forEach((el,k)=>{el.style.animation='none';el.offsetWidth;el.style.animation=`${el.dataset.in} .9s ${.6+k*.35}s both cubic-bezier(.3,1.6,.5,1)`});
    setTimeout(()=>{a.classList.remove('on','out');busy=false},1100);i=n;document.querySelector('.pg').textContent=`Slide ${i+1} of ${S.length}`};
  S[0].classList.add('on');document.querySelector('.pg').textContent=`Slide 1 of ${S.length}`;
  addEventListener('keydown',e=>{if(['ArrowRight',' ','PageDown','Enter'].includes(e.key))show(i+1);if(['ArrowLeft','PageUp'].includes(e.key))show(i-1)});
  st.addEventListener('click',e=>show(e.clientX>innerWidth/2?i+1:i-1));
  let ty=0;addEventListener('touchstart',e=>ty=e.touches[0].clientX);addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-ty;if(Math.abs(d)>40)show(d<0?i+1:i-1)});
}
