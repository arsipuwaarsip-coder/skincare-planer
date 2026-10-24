import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import htm from 'htm';
import './index.css';
const html=htm.bind(React.createElement);
const DAYS=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
const CATS={cleanser:'Cleanser',serum:'Serum',moisturizer:'Moisturizer',sunscreen:'Sunscreen',retinol:'Retinol',exfoliant:'Eksfoliasi',mask:'Masker',other:'Lainnya'};
const OBS=['Kering','Tertarik','Kemerahan','Perih','Kusam','Closed comedones','Halus','Terhidrasi'];
const KEY='skincare-planner-v1';
const btn='rounded-xl border border-bd bg-card px-3 py-2 text-sm',pri='rounded-xl bg-sg text-white px-3 py-2 text-sm',inp='w-full rounded-xl border border-bd bg-bg px-3 py-2 text-sm';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=iso(new Date());
const wdi=s=>(new Date(s+'T00:00').getDay()+6)%7;
const addD=(s,n)=>{const x=new Date(s+'T00:00');x.setDate(x.getDate()+n);return iso(x)};
let uid=0;const nid=p=>p+Date.now().toString(36)+(uid++);
const P=(id,brand,name,cat,usage='')=>({id,brand,name,cat,img:'',ing:'',actives:'',usage,notes:'',on:true,del:false});
const prods=()=>[P('p1','SKIN1004','Madagascar Centella Light Cleansing Oil','cleanser','Cleanser pertama (double cleansing).'),
P('p2','SKIN1004','Madagascar Centella Ampoule Foam','cleanser','Cleanser kedua.'),
P('p3','Skintific','Lic It Sunscreen SPF 50+ PA++++','sunscreen','Pagi, langkah terakhir.'),
P('p4','SKIN1004','Retinol 0.2 Boosting Shot Ampoule','retinol','Ikuti petunjuk kemasan.'),
P('p5','','Glycolic Acid Gel 10% with Tranexamic Acid','exfoliant','Belum dijadwalkan.'),
P('p6','Avoskin','Your Skin Bae Marine Collagen 10% Ginseng Root','serum'),
P('p7','Azarine','Hydramax Water Bank Serum','serum'),
P('p8','Skin Game','Kind Cream Moisturizer','moisturizer'),
P('p9','Pyunkang Yul','Moisture Cream','moisturizer'),
P('p10','Madam Gie','Sheet Mask (varian perlu dikonfirmasi)','mask','Sesuai petunjuk kemasan.'),
P('p11','SOME BY MI','Real Snail Sheet Mask','mask','Sesuai petunjuk kemasan.')];
const S=(name,pid=null,notes='')=>({id:nid('s'),name,pid,notes});
const sched=()=>{
 const am=s=>[S('Bilas air / cleanser lembut',null,'Jika diperlukan'),...(s?[S('Serum',s)]:[]),S('Moisturizer','p8'),S('Sunscreen','p3','Setiap pagi')];
 const cl=()=>[S('Cleansing oil','p1'),S('Facial cleanser','p2')],mo=p=>S('Moisturizer',p);
 const ret=n=>S(n,'p4','Ikuti petunjuk kemasan; hanya jika kulit toleran. Jika kering/perih, hapus dan pakai recovery.');
 const pm=[[...cl(),S('Serum hidrasi (opsional)','p7'),mo('p8')],
 [...cl(),S('Keringkan wajah sepenuhnya',null,'Tunggu benar-benar kering'),ret('Retinol'),mo('p8')],
 [...cl(),S('Serum hidrasi','p7'),mo('p9')],
 [...cl(),{...S('Sheet mask','p11','Sesuai petunjuk kemasan; lewati jika kulit iritasi'),mk:1},mo('p8')],
 [...cl(),S('Serum hidrasi','p7'),mo('p8')],
 [...cl(),ret('Retinol (sesi kedua)'),mo('p9')],
 [...cl(),S('Serum hidrasi','p7'),mo('p9')]];
 const ams=['p6',0,0,0,'p7',0,0],o={};DAYS.forEach((x,i)=>{o[x]={am:am(ams[i]),pm:pm[i]}});return o};
const fresh=()=>({profile:{type:'Kering cenderung sensitif',concerns:'Kusam, closed comedones',prio:'Hidrasi, skin barrier, pencerahan bertahap, penanganan closed comedones secara hati-hati',notes:''},products:prods(),sched:sched(),logs:{},diary:{},ack:[],mask:{pid:'p11',day:3,t:'pm',rem:false,skip:false}});
const ok=o=>o&&Array.isArray(o.products)&&Array.isArray(o.ack)&&o.logs&&o.diary&&o.profile&&o.mask&&o.sched&&DAYS.every(x=>o.sched[x]&&Array.isArray(o.sched[x].am)&&Array.isArray(o.sched[x].pm));
const load=()=>{try{const m={...fresh(),...JSON.parse(localStorage.getItem(KEY))};return ok(m)?m:fresh()}catch(e){return fresh()}};
const lab=(d,s)=>{const p=d.products.find(x=>x.id===s.pid);return s.name+(p?' · '+(p.brand+' '+p.name).trim():'')};
const stepsOf=(d,date,t)=>{const l=d.logs[date];return date<today&&l?l.steps.filter(s=>s.t===t):d.sched[DAYS[wdi(date)]][t].map(s=>({id:s.id,t,label:lab(d,s),pid:s.pid,notes:s.notes}))};
const catOf=(d,s)=>{const p=d.products.find(x=>x.id===s.pid);return p&&!p.del&&p.on?p.cat:null};
const warns=(d,sc)=>{const w=[],A=m=>w.push({m});
 const act=i=>{const c=sc[DAYS[i]].pm.map(s=>catOf(d,s));return{r:c.includes('retinol'),e:c.includes('exfoliant')}};
 DAYS.forEach((x,i)=>{const a=act(i),b=act((i+1)%7),n=DAYS[(i+1)%7];
  if(a.r&&a.e)A(`${x} PM: retinol dan eksfoliasi dijadwalkan di malam yang sama. Kombinasi ini sering dihindari pada kulit kering/sensitif; pertimbangkan malam terpisah.`);
  if((a.r||a.e)&&(b.r||b.e))A(`${x} → ${n} PM: dua treatment aktif berurutan. Beri jeda atau pantau toleransi kulit.`);
  if(!sc[x].am.some(s=>catOf(d,s)==='sunscreen'))A(`${x} AM: belum ada sunscreen. Pakai sunscreen setiap pagi, terutama saat memakai retinol.`)});
 return w};
const shrink=(f,m,cb)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,m/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.7))};i.src=r.result};r.readAsDataURL(f)};

const Bar=({v,n})=>html`<div class="h-2 rounded-full bg-sl overflow-hidden"><div class="h-full bg-sg" style=${{width:(n?100*v/n:0)+'%'}}></div></div>`;
const Card=({children,c=''})=>html`<div class="rounded-2xl border border-bd bg-card p-4 ${c}">${children}</div>`;
const Th=({p,s=40})=>html`<div class="shrink-0 rounded-lg bg-sl overflow-hidden grid place-items-center text-xs" style=${{width:s,height:s}}>${p&&p.img?html`<img src=${p.img} class="w-full h-full object-cover" alt="">`:'🧴'}</div>`;
const DateBar=({date,setDate})=>html`<div class="flex gap-2"><input type="date" class=${inp} value=${date} onChange=${e=>e.target.value&&setDate(e.target.value)}/><button class=${btn} onClick=${()=>setDate(today)}>Hari ini</button></div>`;
const Warns=({d,set,sc})=>{const w=warns(d,sc),a=w.filter(x=>!d.ack.includes(x.m));
 return html`${a.map(x=>html`<div key=${x.m} class="rounded-xl border border-rs p-3 text-sm mb-2">⚠ ${x.m}<button class="block mt-1 text-xs underline text-mu" onClick=${()=>set(n=>{n.ack.push(x.m)})}>Saya sudah membaca, tetap pakai</button></div>`)}${w.length>a.length?html`<p class="text-xs text-mu">${w.length-a.length} peringatan Anda abaikan.</p>`:''}<p class="text-xs text-mu">Peringatan hanya saran, bukan nasihat medis. Jika kulit kering, perih, atau iritasi, utamakan recovery.</p>`};

const Dash=({d,set,go})=>{
 const st=t=>{const s=stepsOf(d,today,t);return[s.filter(x=>d.logs[today]&&d.logs[today].done[x.id]).length,s.length,s]};
 const [a,an,as]=st('am'),[p,pn,ps]=st('pm'),dn=id=>d.logs[today]&&d.logs[today].done[id];
 const nx=(new Date().getHours()<15?[...as,...ps]:[...ps,...as]).find(s=>!dn(s.id)),tot=an+pn?Math.round(100*(a+p)/(an+pn)):0,m=d.mask;
 return html`<div class="space-y-3"><${Card}><p class="text-sm text-mu">${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
 <p class="text-3xl font-serif mt-1">${tot}% <span class="text-sm text-mu font-sans">selesai hari ini</span></p>
 <div class="mt-3 space-y-2">${[['☀ AM',a,an],['☾ PM',p,pn]].map(([l,v,n])=>html`<div key=${l}><div class="flex justify-between text-sm"><span>${l}</span><span>${v}/${n}</span></div><${Bar} v=${v} n=${n}/></div>`)}</div><//>
 <${Card}><p class="text-xs text-mu">Langkah berikutnya</p><p class="mt-1">${nx?nx.label:(an+pn?'Semua langkah hari ini selesai 🌿':'Belum ada langkah dijadwalkan')}</p>
 <div class="flex gap-2 mt-3"><button class=${pri} onClick=${()=>go('routine')}>Buka rutinitas</button><button class=${btn} onClick=${()=>go('plan')}>Edit jadwal</button></div><//>
 ${!m.skip&&m.rem&&m.day===wdi(today)?html`<${Card}>🗓 Pengingat: hari ini jadwal sheet mask (${m.t.toUpperCase()}). Lewati jika kulit iritasi.<//>`:''}
 <${Card}><b class="text-sm">Peringatan jadwal</b><div class="mt-2"><${Warns} d=${d} set=${set} sc=${d.sched}/></div><//></div>`};

const Routine=({d,set,date,setDate})=>{
 const tog=id=>set(n=>{let l=n.logs[date];if(!l||date>=today){const s=[];['am','pm'].forEach(t=>stepsOf(n,date,t).forEach(x=>s.push({id:x.id,t,label:x.label,pid:x.pid,notes:x.notes})));l=n.logs[date]={steps:s,done:l?l.done:{}}}if(l.done[id])delete l.done[id];else l.done[id]=1});
 const lg=d.logs[date],sec=(t,ic)=>{const s=stepsOf(d,date,t),dn=s.filter(x=>lg&&lg.done[x.id]).length;
  return html`<${Card}><div class="flex justify-between mb-2"><b>${ic} ${t.toUpperCase()}</b><span class="text-sm text-mu">${dn}/${s.length}</span></div><${Bar} v=${dn} n=${s.length}/>
  <div class="mt-3 space-y-2">${s.length?s.map((x,i)=>{const c=lg&&lg.done[x.id];return html`<label key=${x.id} class="flex items-center gap-3 p-2 rounded-xl border border-bd ${c?'bg-sl opacity-70':''}"><input type="checkbox" class="w-6 h-6 accent-sg" checked=${!!c} onChange=${()=>tog(x.id)}/><${Th} p=${d.products.find(q=>q.id===x.pid)} s=${36}/><span class="flex-1 text-sm ${c?'line-through':''}"><span class="text-mu">${i+1}.</span> ${x.label}${x.notes?html`<em class="block text-xs text-mu">${x.notes}</em>`:''}</span></label>`}):html`<p class="text-sm text-mu">Belum ada langkah.</p>`}</div><//>`};
 return html`<div class="space-y-3"><${DateBar} date=${date} setDate=${setDate}/><p class="text-sm text-mu">${DAYS[wdi(date)]}${date<today&&lg?' · memakai catatan riwayat tanggal ini':''}</p>${sec('am','☀')}${sec('pm','☾')}</div>`};

const Plan=({d,set,ask})=>{
 const [dr,setDr]=useState(null),[di,setDi]=useState(wdi(today)),[t,setT]=useState('pm');
 const sc=dr||d.sched,x=DAYS[di],L=sc[x][t],mk=d.mask,masks=d.products.filter(p=>p.cat==='mask'&&!p.del);
 const ed=f=>setDr(p=>{const n=JSON.parse(JSON.stringify(p));f(n);return n});
 const up=(i,k,v)=>ed(n=>{n[x][t][i][k]=v}),mv=(i,j)=>ed(n=>{const a=n[x][t];if(a[j])[a[i],a[j]]=[a[j],a[i]]});
 const dup=()=>ed(n=>{const to=DAYS[+document.getElementById('dup').value];['am','pm'].forEach(k=>{n[to][k]=n[x][k].map(s=>({...s,id:nid('s')}))})});
 const setMask=pt=>set(n=>{const m=Object.assign(n.mask,pt);DAYS.forEach(dd=>['am','pm'].forEach(k=>{n.sched[dd][k]=n.sched[dd][k].filter(s=>!s.mk)}));
  if(!m.skip&&m.pid){const r=n.sched[DAYS[m.day]][m.t],i=r.findIndex(s=>{const p=n.products.find(q=>q.id===s.pid);return p&&p.cat==='moisturizer'});r.splice(i<0?r.length:i,0,{id:nid('s'),name:'Sheet mask',pid:m.pid,notes:'Sesuai petunjuk kemasan; lewati jika kulit iritasi',mk:1})}});
 const used=new Set(Object.values(d.sched).flatMap(r=>[...r.am,...r.pm].map(s=>s.pid))),un=d.products.filter(p=>p.on&&!p.del&&!used.has(p.id));
 return html`<div class="space-y-3"><div class="flex gap-2 flex-wrap">${dr?html`<button class=${pri} onClick=${()=>{set(n=>{n.sched=dr});setDr(null)}}>Simpan</button><button class=${btn} onClick=${()=>setDr(null)}>Batal</button>`:html`<button class=${pri} onClick=${()=>setDr(JSON.parse(JSON.stringify(d.sched)))}>Edit jadwal</button><button class=${btn} onClick=${()=>ask('Reset jadwal ke template awal? Riwayat checklist tidak terhapus.',()=>set(n=>{n.sched=sched()}))}>Reset template</button>`}</div>
 <div class="flex gap-1 overflow-x-auto">${DAYS.map((n,i)=>html`<button key=${n} class="${i===di?'bg-sg text-white':'bg-card'} border border-bd rounded-full px-3 py-1 text-sm" onClick=${()=>setDi(i)}>${n.slice(0,3)}</button>`)}</div>
 <div class="flex gap-2">${['am','pm'].map(k=>html`<button key=${k} class="${k===t?'bg-sg text-white':'bg-card'} flex-1 border border-bd rounded-xl py-2 text-sm" onClick=${()=>setT(k)}>${k==='am'?'☀ AM':'☾ PM'}</button>`)}</div>
 <${Card}><b>${x} · ${t.toUpperCase()}</b><div class="mt-2 space-y-2">${L.map((s,i)=>dr?html`<div key=${s.id} class="rounded-xl border border-bd p-2 space-y-1"><input class=${inp} value=${s.name} onChange=${e=>up(i,'name',e.target.value)}/><select class=${inp} value=${s.pid||''} onChange=${e=>up(i,'pid',e.target.value||null)}><option value="">(tanpa produk)</option>${d.products.filter(p=>!p.del).map(p=>html`<option key=${p.id} value=${p.id}>${(p.brand+' '+p.name).trim()}</option>`)}</select><input class=${inp} placeholder="Catatan" value=${s.notes} onChange=${e=>up(i,'notes',e.target.value)}/><div class="flex gap-1"><button class=${btn} onClick=${()=>mv(i,i-1)}>↑</button><button class=${btn} onClick=${()=>mv(i,i+1)}>↓</button><button class=${btn} onClick=${()=>ed(n=>{n[x][t].splice(i,1)})}>Hapus</button></div></div>`:html`<div key=${s.id} class="flex items-center gap-3 text-sm"><${Th} p=${d.products.find(p=>p.id===s.pid)} s=${32}/><span>${i+1}. ${lab(d,s)}${s.notes?html`<em class="block text-xs text-mu">${s.notes}</em>`:''}</span></div>`)}${L.length?'':html`<p class="text-sm text-mu">Belum ada langkah.</p>`}</div>
 ${dr?html`<button class="${btn} mt-2" onClick=${()=>ed(n=>{n[x][t].push({id:nid('s'),name:'Langkah baru',pid:null,notes:''})})}>+ Tambah langkah</button><div class="flex gap-2 mt-2"><select id="dup" class=${inp}>${DAYS.map((n,i)=>html`<option key=${n} value=${i}>${n}</option>`)}</select><button class="${btn} shrink-0" onClick=${dup}>Duplikat hari ke</button></div>`:''}<//>
 <${Warns} d=${d} set=${set} sc=${sc}/>
 ${dr?'':html`<${Card}><b>Sheet mask</b><div class="mt-2 space-y-2 text-sm"><select class=${inp} value=${mk.pid} onChange=${e=>setMask({pid:e.target.value})}>${masks.map(p=>html`<option key=${p.id} value=${p.id}>${(p.brand+' '+p.name).trim()}</option>`)}</select><div class="flex gap-1 flex-wrap">${DAYS.map((n,i)=>html`<button key=${n} class="${i===mk.day?'bg-sg text-white':'bg-card'} border border-bd rounded-full px-3 py-1" onClick=${()=>setMask({day:i})}>${n.slice(0,3)}</button>`)}</div>
 <select class=${inp} value=${mk.t} onChange=${e=>setMask({t:e.target.value})}><option value="pm">PM</option><option value="am">AM</option></select>
 <label class="flex gap-2 items-center"><input type="checkbox" checked=${mk.rem} onChange=${()=>set(n=>{n.mask.rem=!n.mask.rem})}/> Ingatkan di Beranda</label>
 <label class="flex gap-2 items-center"><input type="checkbox" checked=${mk.skip} onChange=${()=>setMask({skip:!mk.skip})}/> Lewati sesi masker (mis. kulit iritasi)</label></div><//>
 ${un.length?html`<${Card}><b>Belum dijadwalkan</b><p class="text-xs text-mu">Tidak otomatis dijadwalkan, termasuk bersama retinol.</p><div class="mt-2 space-y-2">${un.map(p=>html`<div key=${p.id} class="flex items-center gap-3 text-sm"><${Th} p=${p} s=${32}/>${(p.brand+' '+p.name).trim()}</div>`)}</div><//>`:''}`}</div>`};

const Inv=({d,set,ask})=>{
 const [e,setE]=useState(null),blank={id:'',brand:'',name:'',cat:'other',img:'',ing:'',actives:'',usage:'',notes:'',on:true,del:false};
 const save=()=>{if(!e.name.trim())return;set(n=>{const i=n.products.findIndex(p=>p.id===e.id);if(i<0)n.products.push({...e,id:nid('p')});else n.products[i]=e});setE(null)};
 const del=p=>{const c=Object.values(d.sched).flatMap(r=>[...r.am,...r.pm]).filter(s=>s.pid===p.id).length;ask(`Hapus "${p.name}"? ${c?c+' langkah jadwal masih memakai produk ini (nama tetap tampil). ':''}Riwayat checklist tetap tersimpan dan produk bisa dipulihkan.`,()=>set(n=>{n.products.find(x=>x.id===p.id).del=true}))};
 if(e)return html`<${Card}><div class="space-y-2">${[['brand','Brand'],['name','Nama produk']].map(([k,l])=>html`<label key=${k} class="block text-xs text-mu">${l}<input class=${inp} value=${e[k]} onChange=${v=>setE({...e,[k]:v.target.value})}/></label>`)}
 <label class="block text-xs text-mu">Kategori<select class=${inp} value=${e.cat} onChange=${v=>setE({...e,cat:v.target.value})}>${Object.entries(CATS).map(([k,v])=>html`<option key=${k} value=${k}>${v}</option>`)}</select></label>
 ${[['ing','Ingredients (isi hanya jika terverifikasi)'],['actives','Bahan aktif & konsentrasi (jika terverifikasi)'],['usage','Petunjuk pemakaian'],['notes','Catatan pribadi']].map(([k,l])=>html`<label key=${k} class="block text-xs text-mu">${l}<textarea rows="2" class=${inp} value=${e[k]} onChange=${v=>setE({...e,[k]:v.target.value})}></textarea></label>`)}
 <div class="flex items-center gap-3"><${Th} p=${e} s=${56}/><input type="file" accept="image/*" class="text-xs" onChange=${v=>{const f=v.target.files[0];f&&shrink(f,300,u=>setE(q=>({...q,img:u})))}}/></div>
 <label class="flex gap-2 text-sm"><input type="checkbox" checked=${e.on} onChange=${()=>setE({...e,on:!e.on})}/> Aktif</label>
 <div class="flex gap-2"><button class=${pri} onClick=${save}>Simpan</button><button class=${btn} onClick=${()=>setE(null)}>Batal</button></div></div><//>`;
 const ac=d.products.filter(p=>!p.del),dl=d.products.filter(p=>p.del);
 return html`<div class="space-y-3"><button class=${pri} onClick=${()=>setE({...blank})}>+ Tambah produk</button>${ac.length?'':html`<p class="text-sm text-mu">Belum ada produk.</p>`}
 ${ac.map(p=>html`<${Card} key=${p.id} c=${p.on?'':'opacity-60'}><div class="flex gap-3"><${Th} p=${p} s=${56}/><div class="flex-1 min-w-0"><p class="text-xs text-mu">${p.brand} · ${CATS[p.cat]}${p.on?'':' · nonaktif'}</p><p class="text-sm font-medium">${p.name}</p>${p.usage?html`<p class="text-xs text-mu mt-1">${p.usage}</p>`:''}</div></div><div class="flex gap-2 mt-2"><button class=${btn} onClick=${()=>setE({...p})}>Edit</button><button class=${btn} onClick=${()=>del(p)}>Hapus</button></div><//>`)}
 ${dl.length?html`<${Card}><b class="text-sm">Produk terhapus</b>${dl.map(p=>html`<div key=${p.id} class="flex justify-between items-center text-sm mt-2"><span>${p.name}</span><button class=${btn} onClick=${()=>set(n=>{n.products.find(q=>q.id===p.id).del=false})}>Pulihkan</button></div>`)}<//>`:''}</div>`};

const Diary=({d,set,date,setDate})=>{
 const e=d.diary[date]||{obs:[],note:'',img:''},sv=f=>set(n=>{f(n.diary[date]||(n.diary[date]={obs:[],note:'',img:''}))});
 return html`<div class="space-y-3"><${DateBar} date=${date} setDate=${setDate}/>
 <${Card}><b>Kondisi kulit</b><div class="flex flex-wrap gap-2 mt-2">${OBS.map(o=>html`<button key=${o} class="${e.obs.includes(o)?'bg-sg text-white':'bg-card'} border border-bd rounded-full px-3 py-1 text-sm" onClick=${()=>sv(q=>{q.obs=q.obs.includes(o)?q.obs.filter(z=>z!==o):[...q.obs,o]})}>${o}</button>`)}</div>
 <textarea rows="3" class="${inp} mt-3" placeholder="Catatan singkat" value=${e.note} onChange=${v=>sv(q=>{q.note=v.target.value})}></textarea>
 <div class="flex items-center gap-3 mt-2">${e.img?html`<img src=${e.img} class="w-16 h-16 rounded-lg object-cover" alt="">`:''}<input type="file" accept="image/*" class="text-xs" onChange=${v=>{const f=v.target.files[0];f&&shrink(f,400,u=>sv(q=>{q.img=u}))}}/>${e.img?html`<button class=${btn} onClick=${()=>sv(q=>{q.img=''})}>Hapus foto</button>`:''}</div>
 <p class="text-xs text-mu mt-2">Catatan pribadi, bukan diagnosis, dan bukan bukti efektivitas produk.</p><//>
 <${Card}><b>7 hari terakhir</b><div class="mt-2 space-y-2">${[0,1,2,3,4,5,6].map(i=>{const x=addD(date,-i),q=d.diary[x];return html`<div key=${x} class="flex gap-3 text-sm border-t border-bd pt-2"><span class="w-20 shrink-0 text-mu">${x.slice(5)}</span><span class="flex-1">${q&&(q.obs.length||q.note)?(q.obs.join(', ')+(q.note?' — '+q.note:'')):html`<i class="text-mu">kosong</i>`}</span>${q&&q.img?html`<img src=${q.img} class="w-10 h-10 rounded object-cover" alt="">`:''}</div>`})}</div><//></div>`};

const Settings=({d,set,ask,rep})=>{
 const [tx,setTx]=useState(''),[ms,setMs]=useState(''),out=JSON.stringify(d);
 const imp=s=>{try{const o={...fresh(),...JSON.parse(s)};if(!ok(o))throw 0;rep(o);setMs('Data berhasil diimpor.')}catch(e){setMs('Data tidak valid; data saat ini tidak diubah.')}};
 return html`<div class="space-y-3"><${Card}><b>Profil kulit</b><div class="mt-2 space-y-2">${[['type','Tipe kulit'],['concerns','Concern'],['prio','Prioritas'],['notes','Catatan kondisi kulit']].map(([k,l])=>html`<label key=${k} class="block text-xs text-mu">${l}<textarea rows="2" class=${inp} value=${d.profile[k]} onChange=${e=>set(n=>{n.profile[k]=e.target.value})}></textarea></label>`)}</div><p class="text-xs text-mu mt-2">Catatan pribadi, bukan diagnosis.</p><//>
 <${Card}><b>Data & cadangan</b><p class="text-xs text-mu mt-1">Data tersimpan di localStorage browser/perangkat ini saja. Tidak ada sinkronisasi cloud dan tidak ada server. Cadangkan secara berkala.</p>
 <textarea readOnly class="${inp} mt-2 h-24 font-mono text-xs" value=${out} onFocus=${e=>e.target.select()}></textarea>
 <button class="${btn} mt-2" onClick=${()=>{try{navigator.clipboard.writeText(out).then(()=>setMs('Disalin ke clipboard.'),()=>setMs('Salin manual dari kotak di atas.'))}catch(e){setMs('Salin manual dari kotak di atas.')}}}>Salin data (JSON)</button>
 <textarea class="${inp} mt-3 h-20 font-mono text-xs" placeholder="Tempel JSON cadangan di sini" value=${tx} onChange=${e=>setTx(e.target.value)}></textarea>
 <div class="flex gap-2 mt-2"><button class=${btn} onClick=${()=>ask('Impor menimpa data saat ini. Lanjutkan?',()=>imp(tx))}>Impor dari teks</button><label class="${btn} cursor-pointer">Pilih file<input type="file" accept=".json,application/json" class="hidden" onChange=${e=>{const f=e.target.files[0];f&&f.text().then(s=>ask('Impor menimpa data saat ini. Lanjutkan?',()=>imp(s)))}}/></label></div>${ms?html`<p class="text-sm mt-2">${ms}</p>`:''}<//>
 <${Card}><button class="${btn} border-rs" onClick=${()=>ask('Hapus SEMUA data (produk, jadwal, checklist, diary)? Tidak bisa dibatalkan.',()=>{try{localStorage.removeItem(KEY)}catch(e){}rep(fresh())})}>Hapus semua data</button><//></div>`};

const TABS=[['home','Beranda','🏠',Dash],['routine','Harian','✅',Routine],['plan','Jadwal','📅',Plan],['inv','Produk','🧴',Inv],['diary','Diary','📓',Diary],['set','Setelan','⚙️',Settings]];
const App=()=>{
 const [d,setD]=useState(load),[tab,setTab]=useState('home'),[date,setDate]=useState(today),[cf,setCf]=useState(null),[err,setErr]=useState(0);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(d));setErr(0)}catch(e){setErr(1)}},[d]);
 const set=f=>setD(p=>{const n=JSON.parse(JSON.stringify(p));f(n);return n}),ask=(m,f)=>setCf({m,f});
 const C=TABS.find(t=>t[0]===tab)[3];
 return html`<main class="max-w-2xl mx-auto p-4 pb-28 space-y-3"><h1 class="text-2xl font-serif">Skincare Planner</h1>
 ${err?html`<div class="rounded-xl border border-rs p-3 text-sm">Penyimpanan penuh atau tidak tersedia: perubahan belum tersimpan. Ekspor data di Setelan.</div>`:''}
 <${C} d=${d} set=${set} ask=${ask} rep=${setD} date=${date} setDate=${setDate} go=${setTab}/></main>
 <nav class="fixed bottom-0 inset-x-0 z-40 border-t border-bd bg-card" style=${{paddingBottom:'env(safe-area-inset-bottom,0px)'}}><div class="max-w-2xl mx-auto grid grid-cols-6">${TABS.map(([k,l,i])=>html`<button key=${k} class="py-2 text-[11px] ${tab===k?'text-sg font-bold':'text-mu'}" onClick=${()=>setTab(k)}><div class="text-lg">${i}</div>${l}</button>`)}</div></nav>
 ${cf?html`<div class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><div class="max-w-sm w-full rounded-2xl bg-card border border-bd p-4"><p class="text-sm">${cf.m}</p><div class="flex gap-2 mt-3 justify-end"><button class=${btn} onClick=${()=>setCf(null)}>Batal</button><button class=${pri} onClick=${()=>{cf.f();setCf(null)}}>Ya, lanjut</button></div></div></div>`:''}`};
createRoot(document.getElementById('r')).render(html`<${App}/>`);
