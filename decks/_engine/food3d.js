/* Procedural hero food objects for the object-deck engine. Each returns a THREE.Group whose meshes are separate parts (for exploding). */
function noiseTex(THREE,{size=512,base='#888',spots=[],grain=18,seed=1}={}){
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,size,size);
  let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  spots.forEach(([col,n,min,max,a])=>{for(let i=0;i<n;i++){g.globalAlpha=a*r();g.fillStyle=col;g.beginPath();g.ellipse(r()*size,r()*size,min+r()*(max-min),min+r()*(max-min),r()*3,0,7);g.fill()}});
  g.globalAlpha=1;const d=g.getImageData(0,0,size,size);for(let i=0;i<d.data.length;i+=4){const n=(r()-.5)*grain;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n}g.putImageData(d,0,0);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t}
function bumpTex(THREE,{size=512,n=900,min=1,max=5,seed=3}={}){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,size,size);let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<n;i++){const v=Math.floor(90+r()*120);g.fillStyle=`rgb(${v},${v},${v})`;g.globalAlpha=.5;g.beginPath();g.arc(r()*size,r()*size,min+r()*(max-min),0,7);g.fill()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}

export function buildBurger(THREE){
  const G=new THREE.Group();let y=0;const add=(m,h)=>{m.position.y=y+h/2;m.userData.part=1;G.add(m);y+=h;return m};
  const lathe=(pts,seg=96)=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg);
  const crust=noiseTex(THREE,{base:'#b8692a',spots:[['#7a3d14',260,6,30,.35],['#e3a45c',200,4,22,.35],['#5b2b0e',60,2,8,.4]],grain:14,seed:7});
  const bunMat=new THREE.MeshPhysicalMaterial({map:crust,roughness:.55,clearcoat:.35,clearcoatRoughness:.5,sheen:.4,sheenColor:new THREE.Color('#f3c27a'),bumpMap:bumpTex(THREE,{n:1400}),bumpScale:1.2});
  const crumb=new THREE.MeshStandardMaterial({map:noiseTex(THREE,{base:'#efd6a2',spots:[['#d8b477',500,1,5,.6],['#fff1cf',300,1,4,.5]],grain:30,seed:11}),roughness:1});
  // bottom bun
  const bb=new THREE.Group();const bbh=.34;
  const bbg=lathe([[0,-bbh/2],[.9,-bbh/2],[1.02,-bbh/2+.06],[1.06,0],[1.04,bbh/2-.02],[0,bbh/2-.02]]);bb.add(new THREE.Mesh(bbg,bunMat));
  const bc=new THREE.Mesh(new THREE.CircleGeometry(1.03,96),crumb);bc.rotation.x=-Math.PI/2;bc.position.y=bbh/2-.015;bb.add(bc);add(bb,bbh);
  // sauce
  const sauce=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.02,.03,96),new THREE.MeshPhysicalMaterial({color:'#e9a23b',roughness:.25,clearcoat:1}));add(sauce,.03);
  // lettuce
  const lg=new THREE.CircleGeometry(1.2,160,0);const lp=lg.attributes.position;for(let i=0;i<lp.count;i++){const x=lp.getX(i),z=lp.getY(i),r=Math.hypot(x,z),a=Math.atan2(z,x);lp.setZ(i,Math.sin(a*14)*.07*r*r+Math.sin(a*5+1)*.04*r)}lg.computeVertexNormals();
  const lettuce=new THREE.Mesh(lg,new THREE.MeshPhysicalMaterial({color:'#5f9e2f',roughness:.45,side:THREE.DoubleSide,sheen:.6,sheenColor:new THREE.Color('#d8ff9a'),clearcoat:.5}));lettuce.rotation.x=-Math.PI/2;add(lettuce,.08);
  // tomato
  const tom=new THREE.Group();[[-.35,.1],[.4,-.15]].forEach(([x,z])=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.07,64),new THREE.MeshPhysicalMaterial({color:'#d8392b',roughness:.3,clearcoat:.8}));t.position.set(x,0,z);tom.add(t);const inr=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.072,48),new THREE.MeshPhysicalMaterial({color:'#f06a4a',roughness:.35,clearcoat:.6}));inr.position.set(x,0,z);tom.add(inr)});add(tom,.07);
  // patty + cheese x2
  const pattyMat=new THREE.MeshStandardMaterial({map:noiseTex(THREE,{base:'#4b2716',spots:[['#2a130a',600,2,10,.6],['#7a4326',300,2,8,.5],['#9a5a33',120,1,4,.5]],grain:30,seed:5}),roughness:.75,bumpMap:bumpTex(THREE,{n:2200,min:1,max:4,seed:9}),bumpScale:3});
  const sideTex=noiseTex(THREE,{size:256,base:'#3a1d0f',spots:[['#1e0d05',500,1,5,.7],['#6b391e',260,1,4,.6],['#8f5530',80,1,2,.5]],grain:36,seed:8});sideTex.repeat.set(9,.28);
  const pattySide=new THREE.MeshStandardMaterial({map:sideTex,roughness:.8,bumpMap:bumpTex(THREE,{n:1800,min:1,max:3,seed:4}),bumpScale:4});
  const cheeseMat=new THREE.MeshPhysicalMaterial({color:'#f5b523',roughness:.32,clearcoat:.6,sheen:.3});
  function patty(seed){const g=new THREE.CylinderGeometry(1.12,1.1,.2,96,4);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),r=Math.hypot(x,z);if(r>.9){const k=1+Math.sin(a*7+seed)*.03+Math.sin(a*17+seed*2)*.02;p.setX(i,x*k);p.setZ(i,z*k)}p.setY(i,p.getY(i)+Math.sin(x*6+seed)*Math.cos(z*5)*.012)}g.computeVertexNormals();return new THREE.Mesh(g,[pattySide,pattyMat,pattyMat])}
  function cheese(rot){const g=new THREE.BoxGeometry(2.0,.03,2.0,24,1,24);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z);if(r>.95){p.setY(i,p.getY(i)-(r-.95)*(r-.95)*.9)}}g.computeVertexNormals();const m=new THREE.Mesh(g,cheeseMat);m.rotation.y=rot;return m}
  add(patty(1),.2);add(cheese(.3),.04);add(patty(4),.2);add(cheese(1.1),.04);
  // pickles
  const pk=new THREE.Group();[[-.4,.2],[.3,.35],[.1,-.4]].forEach(([x,z],k)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.035,40),new THREE.MeshPhysicalMaterial({color:'#8a9a3a',roughness:.35,clearcoat:.7}));m.position.set(x,0,z);m.rotation.z=.08*k;pk.add(m)});add(pk,.04);
  // top bun
  const th=.8;const tpts=[];for(let i=0;i<=24;i++){const t=i/24,a=t*Math.PI/2;tpts.push([Math.cos(a)*1.08*(1-.04*t),Math.sin(a)*th*(0.9+.1*Math.cos(a))])}tpts.unshift([1.0,-.02]);tpts.push([0,th]);
  const top=new THREE.Group();top.add(new THREE.Mesh(lathe(tpts),bunMat));const under=new THREE.Mesh(new THREE.CircleGeometry(1.02,96),crumb);under.rotation.x=Math.PI/2;top.add(under);
  const seedG=new THREE.SphereGeometry(.035,10,8);seedG.scale(1,.45,1.9);const seeds=new THREE.InstancedMesh(seedG,new THREE.MeshPhysicalMaterial({color:'#f4e7c4',roughness:.4,clearcoat:.6}),90);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3();let s=13;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<90;i++){const a=rnd()*Math.PI*2,phi=Math.acos(1-rnd()*.8);const rr=Math.sin(phi)*1.07,yy=Math.cos(phi)*th*.98;v.set(Math.cos(a)*rr,yy+.005,Math.sin(a)*rr);const n=new THREE.Vector3(v.x/1.07,v.y/th,v.z/1.07).normalize();q.setFromUnitVectors(new THREE.Vector3(0,1,0),n);const tw=new THREE.Quaternion().setFromAxisAngle(n,rnd()*6);q.premultiply(tw);m4.compose(v,q,new THREE.Vector3(1,1,1));seeds.setMatrixAt(i,m4)}top.add(seeds);
  add(top,th);
  G.position.y=-y/2;const W=new THREE.Group();W.add(G);return W;
}

export function latteTex(THREE){const S=1024,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
  const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);gr.addColorStop(0,'#c58b55');gr.addColorStop(.75,'#a2622e');gr.addColorStop(.95,'#6e3b17');gr.addColorStop(1,'#4a250e');g.fillStyle=gr;g.fillRect(0,0,S,S);
  // tulip latte art
  g.fillStyle='#f6ead6';g.shadowColor='rgba(120,70,30,.5)';g.shadowBlur=18;
  const cx=S/2;[[0.62,.2,.17],[0.45,.17,.14],[0.3,.14,.11]].forEach(([yy,rx,ry])=>{g.beginPath();g.ellipse(cx,S*yy,S*rx,S*ry,0,Math.PI,0);g.ellipse(cx,S*yy,S*rx,S*ry*.55,0,0,Math.PI,true);g.fill()});
  g.beginPath();g.ellipse(cx,S*.2,S*.075,S*.07,0,0,7);g.fill();g.fillRect(cx-5,S*.2,10,S*.52);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}

export function buildCup(THREE,{color='#ba583a',inner='#f4ecdc'}={}){
  const G=new THREE.Group();const V=(a,b)=>new THREE.Vector2(a,b);
  const glaze=new THREE.MeshPhysicalMaterial({color,roughness:.28,clearcoat:1,clearcoatRoughness:.12,bumpMap:bumpTex(THREE,{n:500,min:1,max:3,seed:21}),bumpScale:.25});
  const white=new THREE.MeshPhysicalMaterial({color:inner,roughness:.2,clearcoat:1,clearcoatRoughness:.08});
  // saucer
  const sp=[V(0,0),V(1.15,0),V(1.32,.07),V(1.36,.12),V(1.3,.12),V(1.1,.06),V(.55,.05),V(.5,.07),V(0,.07)];
  const saucer=new THREE.Mesh(new THREE.LatheGeometry(sp,128),glaze);saucer.userData.part=1;G.add(saucer);
  // cup outer + inner
  const H=1.05,R=.72;const outer=[V(.38,0),V(.42,.02),V(.46,.04),V(.62,.25),V(.7,.6),V(R,H)];for(let i=0;i<outer.length;i++)outer[i].y+=.09;
  const cup=new THREE.Group();cup.add(new THREE.Mesh(new THREE.LatheGeometry(outer,128),glaze));
  const inn=[V(R,H+.09),V(R-.045,H+.09),V(R-.07,.7),V(.58,.3),V(.4,.15),V(0,.15)];cup.add(new THREE.Mesh(new THREE.LatheGeometry(inn,128),white));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(R-.022,.024,16,128),white);rim.rotation.x=Math.PI/2;rim.position.y=H+.09;cup.add(rim);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.26,.055,20,64,Math.PI*1.25),glaze);handle.position.set(R+.08,.62,0);handle.rotation.z=-Math.PI*.62;cup.add(handle);
  cup.userData.part=1;G.add(cup);
  // coffee surface
  const coffee=new THREE.Mesh(new THREE.CircleGeometry(R-.06,96),new THREE.MeshPhysicalMaterial({map:latteTex(THREE),roughness:.35,clearcoat:.9,clearcoatRoughness:.2}));coffee.rotation.x=-Math.PI/2;coffee.position.y=H-.04;
  const cw=new THREE.Group();cw.userData.part=1;cw.add(coffee);G.add(cw);
  G.position.y=-.6;const W=new THREE.Group();W.add(G);return W;
}
