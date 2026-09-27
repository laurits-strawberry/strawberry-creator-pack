/* Strawberry object deck: one real 3D object travels through clean slides.
   Slide attributes: data-x data-y (screen fractions -1..1), data-s (scale), data-rx/ry/rz (deg),
   data-variant, data-explode (0..1), data-bg (css color), data-theme (light|dark), data-spin (idle deg/s) */
import * as THREE from 'three';
import { GLTFLoader } from '../3d/lib/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from '../3d/lib/addons/environments/RoomEnvironment.js';

export async function start(opts){
  const o=Object.assign({exposure:1,env:1,fov:28,explodeAxis:'radial',explodeDist:1.2,baseRot:[0,0,0],keyLight:2.2,dur:1500},opts);
  const front=document.querySelector('.stage');
  const slides=[...front.querySelectorAll('.slide')];
  // back stage (content behind the object)
  const back=document.createElement('div');back.className='stage back';document.body.insertBefore(back,document.body.firstChild);
  slides.forEach(s=>{const b=document.createElement('section');b.className='slide';s.querySelectorAll('.bk').forEach(el=>b.appendChild(el));back.appendChild(b)});
  const bslides=[...back.children];
  // renderer
  const canvas=document.createElement('canvas');canvas.id='gl';document.body.insertBefore(canvas,front);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=o.exposure;
  const scene=new THREE.Scene();
  const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;scene.environmentIntensity=o.env;
  const key=new THREE.DirectionalLight(0xffffff,o.keyLight);key.position.set(-3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,o.keyLight*.6);rim.position.set(4,2,-4);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(o.fov,1,0.01,100);camera.position.set(0,0,6);
  // shadow blob
  const sc=document.createElement('canvas');sc.width=sc.height=256;const g=sc.getContext('2d');const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.5,'rgba(0,0,0,.22)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
  // load
  const gltf=o.build?{scene:await o.build(THREE,renderer,{key,rim,scene,camera}),userData:{},parser:null}:await new GLTFLoader().loadAsync(o.model);
  const model=gltf.scene;
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const k=2/Math.max(size.x,size.y,size.z);
  const inner=new THREE.Group();model.position.sub(center);inner.add(model);inner.scale.setScalar(k);
  const base=new THREE.Group();base.rotation.set(...o.baseRot.map(THREE.MathUtils.degToRad));base.add(inner);
  const pivot=new THREE.Group();pivot.add(base);scene.add(pivot);
  const halfH=size.y*k/2;
  scene.updateMatrixWorld(true);
  // explode setup
  let grouped=false;model.traverse(m=>{if(m.userData&&m.userData.part)grouped=true});
  const parts=[];model.traverse(m=>{if(m.isMesh)m.frustumCulled=false;if(grouped?m.userData.part:m.isMesh){const c=new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());parts.push({m,p0:m.position.clone(),c})}});
  const mc=new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  parts.forEach(p=>{let d=p.c.clone().sub(mc);if(o.explodeAxis!=='radial'){const ax={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)}[o.explodeAxis];d=ax.clone().multiplyScalar(d.dot(ax))}
    // convert world-space offset into the mesh parent's local space
    const inv=new THREE.Matrix4().copy(p.m.parent.matrixWorld).invert();const a=new THREE.Vector3().applyMatrix4(inv),b=d.clone().applyMatrix4(inv);p.dir=b.sub(a)});
  if(o.onModel)o.onModel({model,parts,THREE,gltf});
  if(o.noExplode)parts.length=0;
  // variants
  const vext=(gltf.userData.gltfExtensions||{})['KHR_materials_variants'];const variants=vext?vext.variants.map(v=>v.name):[];
  let curVariant=null;
  async function selectVariant(name){if(!vext)return;if(/^VAR\d+$/.test(name))name=variants[+name.slice(3)];if(name===curVariant)return;curVariant=name;const vi=variants.indexOf(name);
    const jobs=[];model.traverse(obj=>{if(!obj.isMesh||!obj.userData.gltfExtensions)return;const def=obj.userData.gltfExtensions['KHR_materials_variants'];if(!def)return;
      if(!obj.userData.orig)obj.userData.orig=obj.material;const map=def.mappings.find(m=>m.variants.includes(vi));
      jobs.push(map?gltf.parser.getDependency('material',map.material).then(mat=>{obj.material=mat;gltf.parser.assignFinalMaterial(obj)}):Promise.resolve(obj.material=obj.userData.orig))});await Promise.all(jobs)}
  window.deck3d={variants,parts,model};document.body.dataset.variants=variants.join('|');document.body.dataset.parts=parts.length+':'+parts.slice(0,40).map(p=>p.m.name).join('|');console.log('variants',variants,'parts',parts.map(p=>p.m.name));
  // state
  const deg=THREE.MathUtils.degToRad;
  const read=s=>({x:+(s.dataset.x||0),y:+(s.dataset.y||0),s:+(s.dataset.s||1),q:new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(+(s.dataset.rx||0)),deg(+(s.dataset.ry||0)),deg(+(s.dataset.rz||0)),'XYZ')),e:+(s.dataset.explode||0),sh:s.dataset.shadow===undefined?1:+s.dataset.shadow,spin:+(s.dataset.spin||0),variant:s.dataset.variant,bg:s.dataset.bg,theme:s.dataset.theme});
  const states=slides.map(read);
  const cur={x:0,y:0,s:1,q:new THREE.Quaternion(),e:0,sh:1};let from=null,to=null,t0=0,dur=o.dur,spinAcc=0;
  function halfW(){const h=Math.tan(deg(o.fov/2))*camera.position.z;return {w:h*camera.aspect,h}}
  function resize(){const W=innerWidth,H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();const s=Math.min(W/1920,H/1080);[front,back].forEach(st=>st.style.transform=`translate(-50%,-50%) scale(${s})`)}
  addEventListener('resize',resize);resize();
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  let i=0;
  const ui=document.createElement('div');ui.className='deck-ui3';ui.innerHTML='<span class="h">← → to navigate · F fullscreen</span><span class="n"></span><i class="bar"></i>';document.body.appendChild(ui);
  function go(n,instant){n=Math.max(0,Math.min(slides.length-1,n));i=n;
    slides.forEach((s,k)=>{s.classList.toggle('on',k===n);bslides[k].classList.toggle('on',k===n)});
    const st=states[n];if(st.bg)document.body.style.background=st.bg;document.body.dataset.theme=st.theme||'';
    from={x:cur.x,y:cur.y,s:cur.s,q:cur.q.clone(),e:cur.e,sh:cur.sh};to=st;t0=performance.now();dur=instant?1:o.dur;spinAcc=spinAcc%360;
    if(st.variant){setTimeout(()=>selectVariant(st.variant),instant?0:dur*.42)}
    ui.querySelector('.n').textContent=String(n+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');ui.querySelector('.bar').style.width=((n+1)/slides.length*100)+'%';history.replaceState(null,'','#'+(n+1));
    document.dispatchEvent(new CustomEvent('slide',{detail:{index:n}}))}
  const clock=new THREE.Clock();
  function frame(){const now=performance.now(),dt=clock.getDelta(),T=clock.elapsedTime;
    if(to){const p=Math.min(1,(now-t0)/dur),e=ease(p);cur.x=from.x+(to.x-from.x)*e;cur.y=from.y+(to.y-from.y)*e;cur.s=from.s+(to.s-from.s)*e;cur.e=from.e+(to.e-from.e)*e;cur.sh=from.sh+(to.sh-from.sh)*e;cur.q.slerpQuaternions(from.q,to.q,e);}
    const {w,h}=halfW();const bob=Math.sin(T*1.1)*0.025;
    pivot.position.set(cur.x*w,cur.y*h+bob,0);pivot.scale.setScalar(cur.s);
    spinAcc+=((to&&to.spin)||0)*dt;
    const idle=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(T*.6)*0.02,deg(spinAcc)+Math.sin(T*.45)*0.05,0));
    pivot.quaternion.copy(cur.q).multiply(idle);
    parts.forEach(p=>{p.m.position.copy(p.p0).addScaledVector(p.dir,cur.e*o.explodeDist)});
    shadow.position.set(pivot.position.x,cur.y*h-halfH*cur.s*1.05-0.02,0);shadow.scale.set(2.2*cur.s,1.1*cur.s,1);shadow.material.opacity=o.noShadow?0:cur.sh*(1-Math.abs(bob)*4);
    if(o.tick)o.tick(T,dt,i);renderer.render(scene,camera);requestAnimationFrame(frame)}
  frame();
  addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();go(i+1)}if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){e.preventDefault();go(i-1)}if(e.key==='Home')go(0);if(e.key==='End')go(slides.length-1);if(e.key==='f'||e.key==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}});
  addEventListener('click',e=>{if(e.target.closest('a,button,input'))return;go(e.clientX>innerWidth*.3?i+1:i-1)});
  let tx=0;addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)go(d<0?i+1:i-1)});
  let idl;addEventListener('mousemove',()=>{ui.classList.remove('idle');clearTimeout(idl);idl=setTimeout(()=>ui.classList.add('idle'),2500)});setTimeout(()=>ui.classList.add('idle'),4000);
  const startN=Math.max(0,Math.min(slides.length-1,(parseInt(location.hash.slice(1))||1)-1));
  go(startN,true);document.body.classList.add('ready');
  window.deck3d.go=go;return {go,variants};
}
