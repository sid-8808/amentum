'use strict';
/* ══════════════════════════════════════════════════════
   AMENTUM ADMIN PANEL — admin.js
══════════════════════════════════════════════════════ */

/* ── AUTH ── */
const ADMIN_CREDS_KEY = 'adm_creds';
function getCreds(){ try{return JSON.parse(localStorage.getItem(ADMIN_CREDS_KEY))||{u:'admin',p:'amentum2025'};}catch{return{u:'admin',p:'amentum2025'};}}
function doLogin(){
  const u=document.getElementById('l-user').value.trim();
  const p=document.getElementById('l-pass').value;
  const c=getCreds();
  if(u===c.u&&p===c.p){
    sessionStorage.setItem('adm_auth','1');
    document.getElementById('login-screen').style.display='none';
    document.getElementById('admin-app').classList.add('show');
    init();
  } else {
    document.getElementById('l-err').textContent='Incorrect username or password.';
    setTimeout(()=>document.getElementById('l-err').textContent='',2500);
  }
}
function doLogout(){sessionStorage.removeItem('adm_auth');location.reload();}
function changePassword(){
  const p1=document.getElementById('s-pw1').value;
  const p2=document.getElementById('s-pw2').value;
  if(!p1||!p2){admToast('Please enter both fields.','error');return;}
  if(p1!==p2){admToast('Passwords do not match.','error');return;}
  const c=getCreds();
  localStorage.setItem(ADMIN_CREDS_KEY,JSON.stringify({u:c.u,p:p1}));
  admToast('Password changed. You will be logged out.','success');
  setTimeout(doLogout,1800);
}

/* ── STORAGE HELPERS ── */
const LS = {
  get:(k,def)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch{return def;}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

/* ── DEFAULT DATA ── */
const DEFAULT_PRODUCTS = [
  {id:'nalwa',name:'Amentum Blue Green - The Nalwa',code:'AM-BLGR',cat:'competition',level:'Pro / Elite',flex:'Low',wacert:true,
   img:'https://static.wixstatic.com/media/a4300d_584ea8d99d8b4d4191e793388e4c82ba~mv2.jpg/v1/fill/w_480,h_480,al_c,q_80/a4300d_584ea8d99d8b4d4191e793388e4c82ba~mv2.jpg',
   imgbg:'#dff4f6',desc:'Blue-Green · World Athletics Certified. Named after legendary warrior Haqiqat Rai Nalwa.',
   active:true,variants:[{label:'700g / 80m — ₹18,000',price:18000},{label:'800g / 90m — ₹26,000',price:26000}]},
  {id:'chhatrapati',name:'Amentum Purple - The Chhatrapati',code:'AM-PUO',cat:'competition',level:'Intermediate / Pro',flex:'Low',wacert:false,
   img:'../images/Purple_White.png',imgbg:'#f0edff',desc:'Purple · Named after Chhatrapati Shivaji Maharaj.',
   active:true,variants:[{label:'600g / 60m — ₹16,250',price:16250},{label:'800g / 80m — ₹18,200',price:18200}]},
  {id:'olympic-gold',name:'Amentum Olympic Gold',code:'AM-BLY',cat:'competition',level:'Intermediate',flex:'Medium / Low',wavert:false,
   img:'../images/Olympic_gold.png',imgbg:'#fef9e8',desc:'Gold finish · Competition spec for women and sub-elite athletes.',
   active:true,variants:[{label:'600g / 55m — ₹13,000',price:13000},{label:'700g / 70m — ₹14,300',price:14300},{label:'800g / 70m — ₹14,300',price:14300}]},
  {id:'black-panther',name:'Amentum Black Panther',code:'AM-BLA',cat:'training',level:'Intermediate',flex:'Medium',wavert:false,
   img:'../images/Black_Panther.jpg',imgbg:'#f0f0f0',desc:'High-impact alloy for daily training in all conditions.',
   active:true,variants:[{label:'600g — ₹8,400',price:8400},{label:'700g — ₹8,640',price:8640},{label:'800g — ₹9,000',price:9000},{label:'900g — ₹11,000',price:11000},{label:'1000g — ₹12,500',price:12500}]},
  {id:'purple-white',name:'Amentum Shakti - Purple',code:'AM-PRWH',cat:'training',level:'Beginner / Intermediate',flex:'Medium',wavert:false,
   img:'../images/Purple_White_2.png',imgbg:'#f0edff',desc:'Two-tone purple and white · 500g · 50m range.',
   active:true,variants:[{label:'500g / 50m — ₹7,800',price:7800}]},
  {id:'shakti-red',name:'Amentum Shakti - Red',code:'',cat:'training',level:'Intermediate',flex:'Medium',wavert:true,
   img:'../images/amentum-shakti-red.jpg',imgbg:'#fff0ef',desc:'Red and white · 500g · 60m range · World Athletics certified.',
   active:true,variants:[{label:'500g / 60m — ₹12,000',price:12000}]},
  {id:'amentum-red',name:'Amentum Red',code:'AM-RED',cat:'youth',level:'Beginner',flex:'Medium',wavert:false,
   img:'https://static.wixstatic.com/media/a4300d_1bd34bb95e8e464b867418e26336a3b8~mv2.jpg/v1/fill/w_400,h_280/a4300d_1bd34bb95e8e464b867418e26336a3b8~mv2.jpg',
   imgbg:'#fff0ef',desc:'Vibrant red · 600g · High-visibility academy workhorse.',
   active:true,variants:[{label:'600g — ₹4,940',price:4940},{label:'700g — ₹5,070',price:5070},{label:'800g — ₹5,460',price:5460}]},
  {id:'gold-kids',name:'Amentum Gold Kids',code:'AM-GK500',cat:'youth',level:'Beginner',flex:'Soft',wavert:false,
   img:'../images/gold_500gms.png',imgbg:'#fefae8',desc:'Gold finish · 500g · 50m range · For school programmes.',
   active:true,variants:[{label:'400g — ₹4,800',price:4800},{label:'500g / 50m — ₹4,900',price:4900}]},
  {id:'vayuj-400g',name:'Amentum Vayuj 400g - Multi-color',code:'AM-VJ400',cat:'mini',level:'Grassroots',flex:'N/A',wavert:false,
   img:'../images/blue_vayuj_400gm.jpg',imgbg:'#edfff5',desc:'400g · Record Setter Series · Safe rubber tip.',
   active:true,variants:[{label:'400g · Multi-color — ₹1,298',price:1298}]},
  {id:'vayuj-300g',name:'Amentum Vayuj 300g - The Record Setter Mini Javelin',code:'AM-VJ300',cat:'mini',level:'Grassroots / Special Olympics',flex:'N/A',wavert:false,
   img:'../images/gold_vayuj_300gm.jpg',imgbg:'#fffde8',desc:'300g · Official Special Olympics Bharat approved.',
   active:true,variants:[{label:'300g — ₹1,180',price:1180}]}
];

const DEFAULT_ARTICLES = [
  {id:'neeraj-90m',title:"Neeraj Chopra Breaks 90m — India's Greatest Athletic Milestone",cat:'India News',date:'May 2025',read:'8 min',author:'Amentum Editorial',status:'published',summary:"On May 16, 2025, Neeraj Chopra became the first Indian athlete to throw beyond 90 metres — 90.23m at the Doha Diamond League.",body:'<p>On May 16, 2025, Neeraj Chopra achieved what Indian athletics had long dreamed of — throwing the javelin beyond 90 metres for the first time. The Olympic champion launched a 90.23m effort at the Doha Diamond League.</p>'},
  {id:'nc-classic',title:"NC Classic 2025: India Hosts Its First World Athletics Gold Level Event",cat:'India News',date:'July 2025',read:'7 min',author:'Amentum Editorial',status:'published',summary:"Neeraj Chopra won the inaugural NC Classic in Bengaluru with 86.18m — India's first-ever World Athletics Continental Tour Gold event.",body:'<p>The Sree Kanteerava Stadium in Bengaluru made history on July 5, 2025 — hosting India\'s first-ever World Athletics Continental Tour Gold Level event.</p>'},
  {id:'nadeem-olympic',title:"Arshad Nadeem's 92.97m Olympic Record — A New Era for South Asian Javelin",cat:'World Athletics',date:'Aug 2024',read:'7 min',author:'Amentum Editorial',status:'published',summary:"At Paris 2024, Arshad Nadeem threw 92.97m to win Olympic gold while Neeraj Chopra took silver with 89.45m.",body:'<p>August 8, 2024. The Stade de France. In a javelin final that will be discussed for decades, Arshad Nadeem of Pakistan launched a 92.97m throw.</p>'},
  {id:'biomechanics',title:"The Biomechanics of a 90-Metre Throw: Grip, Run-up, Release",cat:"Pro's Playbook",date:'June 2025',read:'10 min',author:'Amentum Training Team',status:'published',summary:"What separates an 80m thrower from a 90m thrower? Breaking down the four critical phases.",body:'<p>The difference between an 80-metre throw and a 90-metre throw is not primarily about strength. It is about the synchronisation of four biomechanical phases.</p>'},
  {id:'zelezny-record',title:"Jan Železný's 98.48m — Why the World Record Has Stood for 30 Years",cat:'World Athletics',date:'Mar 2025',read:'9 min',author:'Amentum Editorial',status:'published',summary:"Set in Jena, Germany in May 1996, the men's javelin world record remains one of sport's most enduring marks.",body:'<p>On May 25, 1996, at the Ernst-Abbe-Sportfeld in Jena, Jan Železný launched a javelin 98.48 metres. Nearly three decades later, it remains the world record.</p>'},
  {id:'ajc-2024',title:"Amentum Javelin Championship 2024 — Grassroots Glory Across India",cat:'Amentum in Action',date:'Apr 2024',read:'5 min',author:'Amentum Sports',status:'published',summary:"Our flagship annual competition attracted athletes from 18+ states. Multiple talents went on to compete at national level.",body:'<p>The Amentum Javelin Championship (AJC) returned for its third edition in 2024, cementing its place as India\'s most significant dedicated grassroots javelin event.</p>'},
  {id:'india-depth',title:"India's New Javelin Depth: From Neeraj Chopra to Sachin Yadav and Beyond",cat:'India News',date:'Sep 2025',read:'7 min',author:'Amentum Editorial',status:'published',summary:"India's javelin scene is no longer a one-man show. Sachin Yadav's 86.27m PB at Tokyo 2025 signals genuine international depth.",body:'<p>For most of the past decade, India\'s javelin story had one protagonist. But 2025 has started to change the narrative.</p>'},
  {id:'injury-prevention',title:"Injury Prevention for Javelin Athletes: Shoulder, Elbow, and Wrist",cat:"Pro's Playbook",date:'Apr 2025',read:'8 min',author:'Amentum Training Team',status:'published',summary:"The javelin throw generates enormous forces. Evidence-based prevention strategies from Amentum's training programme.",body:'<p>The javelin throw generates some of the highest forces of any throwing event. The shoulder joint experiences enormous stress through delivery.</p>'},
  {id:'special-olympics',title:"Special Olympics Bharat Partnership: Teaching Mini-Javelin Across India",cat:'Amentum in Action',date:'Feb 2025',read:'5 min',author:'Amentum Sports',status:'published',summary:"As the official Mini-Javelin partner of Special Olympics India, Amentum trained coaches nationwide.",body:'<p>When Amentum Sports became the official Mini-Javelin partner of Special Olympics India, we committed to training coaches across the country.</p>'},
  {id:'business-of-javelin',title:"The Business of Javelin in India: Why It's Finally Happening",cat:'Industry Deep Dive',date:'Jan 2025',read:'9 min',author:'Amentum Editorial',status:'published',summary:"From Neeraj Chopra's Tokyo gold to proliferating grassroots competition, India's javelin ecosystem is at an inflection point.",body:'<p>Before Neeraj Chopra\'s 2021 Tokyo gold, no domestic javelin manufacturer existed in India. Import duties made international-grade equipment inaccessible.</p>'},
  {id:'choosing-javelin',title:"Choosing the Right Javelin: A Complete Guide for Indian Athletes",cat:'Equipment Guide',date:'May 2025',read:'11 min',author:'Amentum Product Team',status:'published',summary:"Weight, stiffness, balance point, aerodynamics — choosing a javelin is more technical than most coaches realise.",body:'<p>Choosing the right javelin is one of the most consequential decisions an athlete and coach can make.</p>'},
  {id:'la2028',title:"India at LA 2028: What It Will Take for Multiple Javelin Medals",cat:'Mission 2028',date:'Oct 2024',read:'12 min',author:'Amentum Editorial',status:'published',summary:"Neeraj Chopra showed India can win Olympic gold. Can the country build a team for multiple medals at Los Angeles?",body:'<p>When Neeraj Chopra won gold in Tokyo and silver in Paris, India became a permanent fixture in Olympic javelin discussion.</p>'}
];

const DEFAULT_ATHLETES = [
  {id:'ath1',name:'Arjun Rathore',ig:'@arjunrathore_throws',cat:'Open',state:'Haryana',pb:84.3,age:22,gear:'The Nalwa',status:'sponsored',verified:true},
  {id:'ath2',name:'Kavya Menon',ig:'@kavya_javelin',cat:'Women',state:'Kerala',pb:61.8,age:20,gear:'The Chhatrapati',status:'sponsored',verified:true},
  {id:'ath3',name:'Rohit Sharma',ig:'@rohit_spear',cat:'Open',state:'Punjab',pb:81.5,age:24,gear:'Black Panther',status:'active',verified:true},
  {id:'ath4',name:'Priya Mukherjee',ig:'@priyathrows',cat:'Women',state:'West Bengal',pb:58.2,age:19,gear:'Olympic Gold',status:'active',verified:false},
  {id:'ath5',name:'Vikram Kulkarni',ig:'@vk_athletics',cat:'Open',state:'Maharashtra',pb:79.1,age:21,gear:'Black Panther',status:'active',verified:true},
  {id:'ath6',name:'Divya Singh',ig:'@divya_throws',cat:'U-18',state:'UP',pb:54.6,age:18,gear:'Purple White',status:'active',verified:false}
];

const DEFAULT_COUPONS = [
  {code:'AMENTUM10',type:'percent',value:10,desc:'10% off for all',active:true,uses:0},
  {code:'JAVELIN5',type:'flat',value:500,desc:'₹500 off any order',active:true,uses:0},
  {code:'ARENA15',type:'percent',value:15,desc:'15% off for Arena athletes',active:true,uses:0},
  {code:'LAUNCH20',type:'percent',value:20,desc:'Launch offer — 20% off',active:false,uses:12}
];

/* ── STATE ── */
let products=[], articles=[], athletes=[], coupons=[];
let editingProdId=null, editingArtId=null, editingAthId=null;

/* ── NAV ── */
function nav(panel, btn){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+panel).classList.add('active');
  if(btn) btn.classList.add('active');
  renderPanel(panel);
}

function renderPanel(p){
  if(p==='products') renderProducts();
  if(p==='insights') renderArticles();
  if(p==='athletes') renderAthletes();
  if(p==='leaderboard') renderLeaderboard();
  if(p==='coupons') renderCoupons();
  if(p==='enrollments') renderEnrollments();
  if(p==='settings'){
    const rzp=LS.get('site_rzp_key','');
    const k=LS.get('site_msg91_key','');
    const t=LS.get('site_msg91_tpl','');
    const wa=LS.get('site_wa_num','+919827654830');
    if(rzp) document.getElementById('s-rzp').value=rzp;
    if(k)   document.getElementById('s-msg91-key').value=k;
    if(t)   document.getElementById('s-msg91-tpl').value=t;
    if(wa)  document.getElementById('s-wa').value=wa;
    const ga=LS.get('site_ga_id','');
    if(ga) document.getElementById('s-ga').value=ga;
  }
}

/* ── INIT ── */
function init(){
  products  = LS.get('adm_products', DEFAULT_PRODUCTS);
  articles  = LS.get('adm_articles', DEFAULT_ARTICLES);
  athletes  = LS.get('adm_athletes', DEFAULT_ATHLETES);
  coupons   = LS.get('adm_coupons',  DEFAULT_COUPONS);
  renderDashboard();
  updateSidebarCounts();
}

function save(){
  LS.set('adm_products', products);
  LS.set('adm_articles', articles);
  LS.set('adm_athletes', athletes);
  LS.set('adm_coupons',  coupons);
  // Push to main site's expected localStorage keys
  LS.set('site_products', products);
  LS.set('site_articles', articles);
  LS.set('site_athletes', athletes);
  LS.set('site_coupons',  coupons);
}

function updateSidebarCounts(){
  document.getElementById('sb-prod-count').textContent = products.length;
  document.getElementById('sb-art-count').textContent  = articles.length;
  document.getElementById('sb-ath-count').textContent  = athletes.length;
  document.getElementById('d-prod').textContent  = products.length;
  document.getElementById('d-art').textContent   = articles.length;
  document.getElementById('d-ath').textContent   = athletes.length;
  document.getElementById('d-coupons').textContent = coupons.filter(c=>c.active).length;
  const enr = LS.get('adm_enrollments',[]);
  document.getElementById('sb-enroll-count').textContent = enr.filter(e=>e.status==='pending').length;
}

/* ── DASHBOARD ── */
function renderDashboard(){
  const artEl = document.getElementById('d-recent-articles');
  const recent = [...articles].slice(-5).reverse();
  artEl.innerHTML = recent.length ? recent.map(a=>`
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="openArticleModal('${a.id}')">
      <div class="blog-status-dot ${a.status}"></div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:500;color:var(--text)">${a.title.slice(0,52)}…</div>
        <div style="font-size:11px;color:var(--dim)">${a.cat} · ${a.date}</div>
      </div>
      <span class="badge ${a.status==='published'?'badge-green':'badge-dim'}">${a.status}</span>
    </div>`).join('') : '<div class="empty-state"><p>No articles yet</p></div>';
}

/* ── PRODUCTS ── */
function renderProducts(filter=''){
  const tbody = document.getElementById('products-tbody');
  const filtered = filter ? products.filter(p=>p.name.toLowerCase().includes(filter)||p.code.toLowerCase().includes(filter)) : products;
  tbody.innerHTML = filtered.map(p=>{
    const minP = Math.min(...p.variants.map(v=>v.price));
    const maxP = Math.max(...p.variants.map(v=>v.price));
    const priceStr = minP===maxP ? `₹${minP.toLocaleString('en-IN')}` : `₹${minP.toLocaleString('en-IN')} – ₹${maxP.toLocaleString('en-IN')}`;
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <img src="${p.img}" class="tbl-img" onerror="this.style.display='none'">
        <div><div class="tbl-name">${p.name}</div><div style="font-size:11px;color:var(--dim)">${p.code}</div></div>
      </div></td>
      <td><span class="badge badge-${catColor(p.cat)}">${p.cat}</span></td>
      <td><span class="tbl-price">${priceStr}</span><div style="font-size:11px;color:var(--dim)">${p.variants.length} variant${p.variants.length>1?'s':''}</div></td>
      <td><span class="badge ${p.active?'badge-green':'badge-dim'}">${p.active?'Active':'Hidden'}</span></td>
      <td><div class="tbl-actions">
        <button class="btn btn-icon btn-edit" onclick="openProductModal('${p.id}')" title="Edit">✏</button>
        <button class="btn btn-icon btn-del" onclick="toggleProductActive('${p.id}')" title="${p.active?'Hide':'Show'}">${p.active?'👁':'👁‍🗨'}</button>
        <button class="btn btn-icon btn-del" onclick="deleteProduct('${p.id}')" title="Delete">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterProducts(v){ renderProducts(v.toLowerCase()); }
function catColor(cat){ return {competition:'red',training:'blue',youth:'gold',mini:'green',international:'purple'}[cat]||'dim'; }

function openProductModal(id){
  editingProdId = id || null;
  const title = document.getElementById('prod-modal-title');
  title.textContent = id ? 'Edit Product' : 'Add Product';
  const p = id ? products.find(x=>x.id===id) : null;
  document.getElementById('pm-name').value = p?.name||'';
  document.getElementById('pm-code').value = p?.code||'';
  document.getElementById('pm-cat').value  = p?.cat||'competition';
  document.getElementById('pm-level').value= p?.level||'Intermediate';
  document.getElementById('pm-flex').value = p?.flex||'Medium';
  document.getElementById('pm-wa-cert').checked = p?.wavert||p?.wavert||false;
  document.getElementById('pm-desc').value = p?.desc||'';
  document.getElementById('pm-img').value  = p?.img||'';
  document.getElementById('pm-imgbg').value= p?.imgbg||'#f5f4f1';
  renderVariantRows(p?.variants||[{label:'',price:''}]);
  document.getElementById('prod-modal').classList.add('open');
}
function closeProdModal(){ document.getElementById('prod-modal').classList.remove('open'); editingProdId=null; }

function renderVariantRows(variants){
  const container = document.getElementById('pm-variants');
  container.innerHTML = variants.map((v,i)=>`
    <div class="variant-row" id="vr-${i}">
      <input type="text" value="${v.label||''}" placeholder="e.g. 800g / 90m — ₹26,000" style="flex:2;min-width:0">
      <input type="number" value="${v.price||''}" placeholder="26000" style="width:90px;text-align:right">
      <button class="btn btn-icon btn-del" onclick="removeVariantRow(${i})" style="flex-shrink:0">×</button>
    </div>`).join('');
}
function addVariantRow(){
  const rows = document.querySelectorAll('#pm-variants .variant-row');
  const i = rows.length;
  const div=document.createElement('div'); div.className='variant-row'; div.id='vr-'+i;
  div.innerHTML=`<input type="text" placeholder="e.g. 700g — ₹8,200" style="flex:2;min-width:0"><input type="number" placeholder="8200" style="width:90px;text-align:right"><button class="btn btn-icon btn-del" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById('pm-variants').appendChild(div);
}
function removeVariantRow(i){ document.getElementById('vr-'+i)?.remove(); }
function getVariantsFromForm(){
  return [...document.querySelectorAll('#pm-variants .variant-row')].map(row=>{
    const inputs=row.querySelectorAll('input');
    return {label:inputs[0].value.trim(), price:parseInt(inputs[1].value)||0};
  }).filter(v=>v.label);
}

function saveProduct(){
  const name=document.getElementById('pm-name').value.trim();
  if(!name){admToast('Product name is required.','error');return;}
  const variants=getVariantsFromForm();
  if(!variants.length){admToast('Add at least one variant.','error');return;}
  const data={
    id: editingProdId || 'prod_'+Date.now(),
    name, code:document.getElementById('pm-code').value.trim(),
    cat:document.getElementById('pm-cat').value,
    level:document.getElementById('pm-level').value,
    flex:document.getElementById('pm-flex').value,
    wavert:document.getElementById('pm-wa-cert').checked,
    desc:document.getElementById('pm-desc').value.trim(),
    img:document.getElementById('pm-img').value.trim(),
    imgbg:document.getElementById('pm-imgbg').value,
    active:true, variants
  };
  if(editingProdId){ products=products.map(p=>p.id===editingProdId?data:p); }
  else { products.push(data); }
  save(); renderProducts(); updateSidebarCounts();
  closeProdModal(); admToast(editingProdId?'Product updated.':'Product added.','success');
}

function deleteProduct(id){
  if(!confirm('Delete this product? This cannot be undone.'))return;
  products=products.filter(p=>p.id!==id); save(); renderProducts(); updateSidebarCounts();
  admToast('Product deleted.','info');
}
function toggleProductActive(id){
  products=products.map(p=>p.id===id?{...p,active:!p.active}:p);
  save(); renderProducts(); admToast('Product visibility updated.','info');
}

/* ── ARTICLES ── */
let artFilter='all', artSearch='';
function renderArticles(){
  const list=document.getElementById('articles-list');
  let filtered=articles;
  if(artFilter!=='all') filtered=filtered.filter(a=>a.status===artFilter);
  if(artSearch) filtered=filtered.filter(a=>a.title.toLowerCase().includes(artSearch)||a.cat.toLowerCase().includes(artSearch));
  list.innerHTML=filtered.length?filtered.map(a=>`
    <div class="blog-item">
      <div class="blog-status-dot ${a.status}"></div>
      <div style="flex:1;min-width:0">
        <div class="blog-item-cat">${a.cat}</div>
        <div class="blog-item-title">${a.title}</div>
        <div class="blog-item-meta">${a.author} · ${a.date} · ${a.read} read</div>
      </div>
      <span class="badge ${a.status==='published'?'badge-green':'badge-dim'}">${a.status}</span>
      <div class="blog-item-actions">
        <button class="btn btn-ghost btn-sm" onclick="openArticleModal('${a.id}')">Edit</button>
        <button class="btn btn-ghost btn-sm" onclick="toggleArticleStatus('${a.id}')">${a.status==='published'?'Unpublish':'Publish'}</button>
        <button class="btn btn-icon btn-del" onclick="deleteArticle('${a.id}')">🗑</button>
      </div>
    </div>`).join(''):'<div class="empty-state"><p>No articles found.</p></div>';
}
function filterArticles(f,btn){
  artFilter=f;
  document.querySelectorAll('.art-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderArticles();
}
function searchArticles(v){ artSearch=v.toLowerCase(); renderArticles(); }

function openArticleModal(id){
  editingArtId=id||null;
  const title=document.getElementById('art-modal-title');
  title.textContent=id?'Edit Article':'New Article';
  const a=id?articles.find(x=>x.id===id):null;
  document.getElementById('am-cat').value=a?.cat||'India News';
  document.getElementById('am-status').value=a?.status||'published';
  document.getElementById('am-title').value=a?.title||'';
  document.getElementById('am-summary').value=a?.summary||'';
  document.getElementById('am-author').value=a?.author||'Amentum Editorial';
  document.getElementById('am-date').value=a?.date||new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});
  document.getElementById('am-read').value=a?.read||'5 min';
  document.getElementById('am-body').innerHTML=a?.body||'';
  document.getElementById('art-modal').classList.add('open');
}
function closeArticleModal(){ document.getElementById('art-modal').classList.remove('open'); editingArtId=null; }

function rte(cmd,val){ document.getElementById('am-body').focus(); document.execCommand(cmd,false,val||null); }
function rteH4(){ document.getElementById('am-body').focus(); document.execCommand('formatBlock',false,'H4'); }
function rtePara(){ document.getElementById('am-body').focus(); document.execCommand('formatBlock',false,'P'); }

function saveArticle(forceStatus){
  const title=document.getElementById('am-title').value.trim();
  if(!title){admToast('Article title is required.','error');return;}
  const status=forceStatus||document.getElementById('am-status').value;
  const id=editingArtId||(title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)+'_'+Date.now());
  const data={
    id, title,
    cat:document.getElementById('am-cat').value,
    status,
    summary:document.getElementById('am-summary').value.trim(),
    author:document.getElementById('am-author').value.trim()||'Amentum Editorial',
    date:document.getElementById('am-date').value.trim(),
    read:document.getElementById('am-read').value.trim()||'5 min',
    body:document.getElementById('am-body').innerHTML
  };
  if(editingArtId){ articles=articles.map(a=>a.id===editingArtId?data:a); }
  else { articles.push(data); }
  save(); renderArticles(); renderDashboard(); updateSidebarCounts();
  closeArticleModal();
  admToast(status==='published'?'Article published!':'Saved as draft.','success');
}
function deleteArticle(id){
  if(!confirm('Delete this article?'))return;
  articles=articles.filter(a=>a.id!==id); save(); renderArticles(); updateSidebarCounts();
  admToast('Article deleted.','info');
}
function toggleArticleStatus(id){
  articles=articles.map(a=>a.id===id?{...a,status:a.status==='published'?'draft':'published'}:a);
  save(); renderArticles(); admToast('Article status updated.','success');
}

/* ── ATHLETES ── */
let athCatFilter='all';
function renderAthletes(){
  const grid=document.getElementById('athletes-grid');
  let filtered=athCatFilter==='all'?athletes:athletes.filter(a=>a.cat===athCatFilter);
  grid.innerHTML=filtered.length?filtered.map(a=>`
    <div class="ath-admin-card">
      <div class="ath-card-hd">
        <div class="ath-av-admin">${a.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div>
          <span class="badge ${a.status==='sponsored'?'badge-gold':a.status==='active'?'badge-green':'badge-dim'}">${a.status}</span>
          ${a.verified?'<span title="Instagram Verified" style="margin-left:4px;font-size:12px">✅</span>':''}
        </div>
      </div>
      <div class="ath-card-name">${a.name}</div>
      <div class="ath-card-meta">${a.ig} · ${a.state} · ${a.cat}</div>
      <div class="ath-card-meta" style="margin-top:2px">${a.gear||'—'}</div>
      <div class="ath-card-stats">
        <div><div class="ath-stat-v" style="color:var(--red)">${a.pb}m</div><div class="ath-stat-l">PB</div></div>
        <div><div class="ath-stat-v">${a.age}</div><div class="ath-stat-l">Age</div></div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="openAthleteModal('${a.id}')">Edit</button>
        <button class="btn btn-icon btn-del" onclick="deleteAthlete('${a.id}')">🗑</button>
      </div>
    </div>`).join(''):'<div class="empty-state" style="grid-column:1/-1"><p>No athletes found.</p></div>';
}
function filterAthletesCat(v){ athCatFilter=v; renderAthletes(); }

function openAthleteModal(id){
  editingAthId=id||null;
  document.getElementById('ath-modal-title').textContent=id?'Edit Athlete':'Add Athlete';
  const a=id?athletes.find(x=>x.id===id):null;
  document.getElementById('athm-name').value=a?.name||'';
  document.getElementById('athm-ig').value=a?.ig||'';
  document.getElementById('athm-cat').value=a?.cat||'Open';
  document.getElementById('athm-state').value=a?.state||'';
  document.getElementById('athm-pb').value=a?.pb||'';
  document.getElementById('athm-age').value=a?.age||'';
  document.getElementById('athm-gear').value=a?.gear||'';
  document.getElementById('athm-status').value=a?.status||'active';
  document.getElementById('athm-verified').checked=a?.verified||false;
  document.getElementById('ath-modal').classList.add('open');
}
function closeAthModal(){ document.getElementById('ath-modal').classList.remove('open'); editingAthId=null; }

function saveAthlete(){
  const name=document.getElementById('athm-name').value.trim();
  if(!name){admToast('Athlete name is required.','error');return;}
  const data={
    id:editingAthId||'ath_'+Date.now(),
    name, ig:document.getElementById('athm-ig').value.trim(),
    cat:document.getElementById('athm-cat').value,
    state:document.getElementById('athm-state').value.trim(),
    pb:parseFloat(document.getElementById('athm-pb').value)||0,
    age:parseInt(document.getElementById('athm-age').value)||0,
    gear:document.getElementById('athm-gear').value.trim(),
    status:document.getElementById('athm-status').value,
    verified:document.getElementById('athm-verified').checked
  };
  if(editingAthId){ athletes=athletes.map(a=>a.id===editingAthId?data:a); }
  else { athletes.push(data); }
  save(); renderAthletes(); updateSidebarCounts();
  closeAthModal(); admToast(editingAthId?'Athlete updated.':'Athlete added.','success');
}
function deleteAthlete(id){
  if(!confirm('Remove this athlete from the Arena?'))return;
  athletes=athletes.filter(a=>a.id!==id); save(); renderAthletes(); updateSidebarCounts();
  admToast('Athlete removed.','info');
}

/* ── LEADERBOARD ── */
let lbCat='Open';
function renderLeaderboard(){
  const sorted=[...athletes].filter(a=>a.cat===lbCat||lbCat==='all').sort((a,b)=>b.pb-a.pb);
  const tbody=document.getElementById('lb-tbody');
  tbody.innerHTML=sorted.length?sorted.map((a,i)=>`<tr>
    <td><strong style="font-family:'DM Serif Display',serif;font-size:20px;color:${i<3?'var(--red)':'var(--dim)'}">${i+1}</strong></td>
    <td><div style="font-weight:500;color:var(--text)">${a.name}</div><div style="font-size:11px;color:var(--dim)">${a.ig}</div></td>
    <td><strong style="font-size:16px;color:var(--text)">${a.pb}m</strong></td>
    <td>${a.state}</td>
    <td><span class="badge ${a.status==='sponsored'?'badge-gold':a.status==='active'?'badge-green':'badge-dim'}">${a.status}</span></td>
    <td><div style="display:flex;gap:6px">
      <button class="btn btn-ghost btn-sm" onclick="openAthleteModal('${a.id}')">Edit PB</button>
      ${i<3?`<span title="Top 3 — gets discount code" style="font-size:16px">🏆</span>`:''}
    </div></td>
  </tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--dim)">No athletes in this category</td></tr>';
}
function loadLeaderboardCat(v){ lbCat=v; renderLeaderboard(); }
function saveLeaderboard(){ save(); admToast('Leaderboard published to Athlete Arena!','success'); }

/* ── ENROLLMENTS ── */
function renderEnrollments(){
  const enr=LS.get('adm_enrollments',[]);
  const body=document.getElementById('enrollments-body');
  body.innerHTML=enr.length?enr.map(e=>`
    <div class="blog-item" style="margin-bottom:8px">
      <div style="flex:1">
        <div class="blog-item-title">${e.name} · ${e.ig}</div>
        <div class="blog-item-meta">${e.state} · ${e.cat} · PB: ${e.pb}m · Gear: ${e.gear||'—'}</div>
        <div class="blog-item-meta" style="margin-top:2px">Submitted: ${e.submitted||'—'}</div>
      </div>
      <span class="badge ${e.status==='pending'?'badge-gold':e.status==='approved'?'badge-green':'badge-red'}">${e.status}</span>
      <div style="display:flex;gap:6px;margin-left:12px">
        ${e.status==='pending'?`<button class="btn btn-green btn-sm" onclick="approveEnrollment('${e.id}')">Approve</button><button class="btn btn-outline btn-sm" onclick="rejectEnrollment('${e.id}')">Reject</button>`:''}
      </div>
    </div>`).join(''):'<div class="empty-state"><p>No enrollment requests yet.</p><p style="margin-top:6px;font-size:11px">When athletes submit the Enroll Now form, they will appear here.</p></div>';
}
function approveEnrollment(id){
  const enr=LS.get('adm_enrollments',[]).map(e=>e.id===id?{...e,status:'approved'}:e);
  LS.set('adm_enrollments',enr); renderEnrollments(); updateSidebarCounts();
  admToast('Enrollment approved. WhatsApp confirmation sent.','success');
}
function rejectEnrollment(id){
  const enr=LS.get('adm_enrollments',[]).map(e=>e.id===id?{...e,status:'rejected'}:e);
  LS.set('adm_enrollments',enr); renderEnrollments(); updateSidebarCounts();
  admToast('Enrollment rejected.','info');
}

/* ── COUPONS ── */
function renderCoupons(){
  const tbody=document.getElementById('coupons-tbody');
  tbody.innerHTML=coupons.map(c=>`<tr>
    <td><span class="coupon-code-display">${c.code}</span></td>
    <td>${c.type==='percent'?'Percentage':'Flat Amount'}</td>
    <td><strong>${c.type==='percent'?c.value+'%':'₹'+c.value.toLocaleString('en-IN')}</strong><div style="font-size:11px;color:var(--dim)">${c.desc||'—'}</div></td>
    <td><span class="badge ${c.active?'badge-green':'badge-dim'}">${c.active?'Active':'Inactive'}</span></td>
    <td>${c.uses||0}</td>
    <td><div style="display:flex;gap:6px">
      <button class="btn btn-ghost btn-sm" onclick="toggleCouponActive('${c.code}')">${c.active?'Disable':'Enable'}</button>
      <button class="btn btn-icon btn-del" onclick="deleteCoupon('${c.code}')">🗑</button>
    </div></td>
  </tr>`).join('');
}
function openCouponModal(){ document.getElementById('coup-modal').classList.add('open'); }
function saveCoupon(){
  const code=document.getElementById('cm-code').value.trim().toUpperCase();
  if(!code){admToast('Coupon code is required.','error');return;}
  if(coupons.find(c=>c.code===code)){admToast('Code already exists.','error');return;}
  coupons.push({
    code, type:document.getElementById('cm-type').value,
    value:parseFloat(document.getElementById('cm-value').value)||0,
    desc:document.getElementById('cm-desc').value.trim(),
    active:document.getElementById('cm-active').checked, uses:0
  });
  save(); renderCoupons(); updateSidebarCounts();
  document.getElementById('coup-modal').classList.remove('open');
  admToast('Coupon added!','success');
}
function toggleCouponActive(code){
  coupons=coupons.map(c=>c.code===code?{...c,active:!c.active}:c);
  save(); renderCoupons(); admToast('Coupon updated.','info');
}
function deleteCoupon(code){
  if(!confirm('Delete coupon '+code+'?'))return;
  coupons=coupons.filter(c=>c.code!==code); save(); renderCoupons();
  admToast('Coupon deleted.','info');
}

/* ── CONTENT ── */
function saveContent(){
  const content={
    hero:{h:document.getElementById('c-hero-h').value, sub:document.getElementById('c-hero-sub').value, cta1:document.getElementById('c-cta1').value, cta2:document.getElementById('c-cta2').value},
    stats:[{n:document.getElementById('s1n').value,l:document.getElementById('s1l').value},{n:document.getElementById('s2n').value,l:document.getElementById('s2l').value},{n:document.getElementById('s3n').value,l:document.getElementById('s3l').value},{n:document.getElementById('s4n').value,l:document.getElementById('s4l').value},{n:document.getElementById('s5n').value,l:document.getElementById('s5l').value}],
    mission:{p1:document.getElementById('c-mission1').value, p2:document.getElementById('c-mission2').value},
    ajc:{desc:document.getElementById('c-ajc').value, states:document.getElementById('ajc-states').value, cats:document.getElementById('ajc-cats').value, year:document.getElementById('ajc-year').value}
  };
  LS.set('site_content',content);
  admToast('Content saved and live on site!','success');
}

/* ── SETTINGS ── */
function saveSettings(){
  const rzp   = document.getElementById('s-rzp').value.trim();
  const msg91k= document.getElementById('s-msg91-key').value.trim();
  const msg91t= document.getElementById('s-msg91-tpl').value.trim();
  const wa    = document.getElementById('s-wa').value.trim();
  if(rzp)    LS.set('site_rzp_key',   rzp);
  if(msg91k) LS.set('site_msg91_key', msg91k);
  if(msg91t) LS.set('site_msg91_tpl', msg91t);
  if(wa)     LS.set('site_wa_num',    wa);
  const ga = document.getElementById('s-ga').value.trim();
  if(ga){
    if(!/^G-[A-Z0-9]{6,14}$/i.test(ga)){ admToast('Invalid GA ID. Format: G-XXXXXXXXXX','error'); return; }
    LS.set('site_ga_id', ga.toUpperCase());
  } else {
    localStorage.removeItem('site_ga_id');
  }
  admToast('Keys saved! GA tracking '+(ga?'active':'removed')+'. WhatsApp OTP via MSG91.','success');
}

function testOTP(){
  const k = LS.get('site_msg91_key','');
  const t = LS.get('site_msg91_tpl','');
  if(!k||!t){
    admToast('Please enter and save MSG91 Auth Key and Template ID first.','error');return;
  }
  const phone = prompt('Enter a 10-digit Indian mobile number to test WhatsApp OTP:');
  if(!phone||phone.length!==10){admToast('Invalid number.','error');return;}
  admToast('Opening main site for OTP test. Enter +91'+phone+' in checkout and click Send OTP.','info');
  window.open('../index.html','_blank');
}

/* ── DATA EXPORT / IMPORT ── */
function exportData(){
  const data={products,articles,athletes,coupons,content:LS.get('site_content',null),enrollments:LS.get('adm_enrollments',[]),exported:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='amentum-data-'+Date.now()+'.json';
  a.click();
  admToast('Data exported successfully.','success');
}
function importData(input){
  const file=input.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(data.products) products=data.products;
      if(data.articles) articles=data.articles;
      if(data.athletes) athletes=data.athletes;
      if(data.coupons)  coupons=data.coupons;
      if(data.content)  LS.set('site_content',data.content);
      if(data.enrollments) LS.set('adm_enrollments',data.enrollments);
      save(); renderDashboard(); updateSidebarCounts();
      admToast('Data imported successfully!','success');
    }catch{ admToast('Invalid JSON file.','error'); }
  };
  reader.readAsText(file);
}
function resetToDefaults(){
  if(!confirm('This will clear all custom data and restore factory defaults. Are you sure?'))return;
  products=DEFAULT_PRODUCTS; articles=DEFAULT_ARTICLES; athletes=DEFAULT_ATHLETES; coupons=DEFAULT_COUPONS;
  save(); renderDashboard(); updateSidebarCounts();
  admToast('All data reset to defaults.','info');
}

/* ── TOAST ── */
function admToast(msg,type='info'){
  const container=document.getElementById('adm-toast');
  const el=document.createElement('div');
  el.className=`adm-toast-item ${type}`;
  el.innerHTML=`<span>${{success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(()=>el.remove(),3500);
}

/* ── CLOSE MODALS ON BG CLICK ── */
document.addEventListener('click',e=>{
  if(e.target.classList.contains('modal-bg')) e.target.classList.remove('open');
});

/* ── AUTO-START ── */
window.addEventListener('DOMContentLoaded',()=>{
  if(sessionStorage.getItem('adm_auth')==='1'){
    document.getElementById('login-screen').style.display='none';
    document.getElementById('admin-app').classList.add('show');
    init();
  }
  document.getElementById('l-user').addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('l-pass').focus(); });
});
