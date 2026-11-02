'use strict';

/* ── CURSOR ── */
const $c=document.getElementById('cursor');
if($c){
  document.addEventListener('mousemove',e=>{$c.style.left=e.clientX+'px';$c.style.top=e.clientY+'px'});
  document.querySelectorAll('button,a,input,select,textarea,.prod-card,.ath-card,.ins-card,.testi-card,.pillar,.team-card,.brand-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>$c.classList.add('big'));
    el.addEventListener('mouseleave',()=>$c.classList.remove('big'));
  });
}

/* ── SCROLL REVEAL ── */
const rObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rObs.unobserve(e.target);}});
},{threshold:.08});
function initReveal(){document.querySelectorAll('.r,.rs,.rfade').forEach(el=>{el.classList.remove('in');rObs.observe(el)});}

/* ── NAVIGATION ── */
function go(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nav-links button').forEach(b=>b.classList.remove('active'));
  const pg=document.getElementById('page-'+page);
  if(pg)pg.classList.add('on');
  const nl=document.getElementById('nl-'+page);
  if(nl)nl.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(initReveal,80);
  closeMobileNav();
}
function toggleNav(){
  const l=document.querySelector('.nav-links');
  if(!l)return;
  if(l.dataset.open==='1'){closeMobileNav();}
  else{
    l.style.cssText='display:flex;flex-direction:column;position:absolute;top:58px;left:0;right:0;background:rgba(255,255,255,.97);padding:20px 24px;gap:18px;border-bottom:1px solid rgba(0,0,0,.07);backdrop-filter:blur(20px);z-index:599';
    l.dataset.open='1';
  }
}
function closeMobileNav(){
  const l=document.querySelector('.nav-links');
  if(!l)return;
  if(window.innerWidth<=960)l.style.display='';
  l.dataset.open='0';
}
window.addEventListener('resize',()=>{if(window.innerWidth>960){const l=document.querySelector('.nav-links');if(l)l.style.cssText=''}});

/* ── TABS ── */
function aTab(name,btn){
  document.querySelectorAll('.tab-pane').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.atab').forEach(t=>t.classList.remove('on'));
  const p=document.getElementById('tab-'+name);
  if(p)p.classList.add('on');
  if(btn)btn.classList.add('on');
}

/* ── FILTER PILLS (shop + insights) ── */
document.addEventListener('click',e=>{
  const pill=e.target.closest('.fpill');
  if(!pill)return;
  const group=pill.parentElement;
  group.querySelectorAll('.fpill').forEach(p=>p.classList.remove('on'));
  pill.classList.add('on');
  const filter=pill.dataset.filter;
  if(!filter)return;

  // Only filter shop products when the pill is inside .shop-filters
  if(!group.classList.contains('shop-filters'))return;

  const grid=document.getElementById('shop-grid');
  if(!grid)return;
  const items=grid.querySelectorAll('[data-cat]');
  items.forEach(c=>{
    // Never hide the section header dividers or institutional block
    if(c.classList.contains('shop-sec-hd') || c.classList.contains('inst-block')){
      c.style.display=''; return;
    }
    if(filter==='all'||c.dataset.cat.split(' ').includes(filter)){c.style.display='';}  // a card can sit in several categories
    else{c.style.display='none';}
  });
  // When filtering, show the international section header only if international is in scope
  const intlHd=grid.querySelector('.shop-sec-hd[data-cat="international"]');
  if(intlHd){
    intlHd.style.display=(filter==='all'||filter==='international')?'':'none';
  }
});

/* ── VARIANT PRICE UPDATE ── */
function updatePrice(productId, price){
  const el=document.getElementById('pp-'+productId);
  if(el)el.textContent='₹'+parseInt(price).toLocaleString('en-IN');
  // swap the card photo when the chosen weight has its own image
  const sel=document.getElementById('vs-'+productId);
  const opt=sel&&sel.selectedOptions[0];
  if(opt&&opt.dataset.img){const img=sel.closest('.prod-card').querySelector('.prod-img');if(img)img.src=opt.dataset.img;}
}
function getPrice(productId){
  const sel=document.getElementById('vs-'+productId);
  if(sel)return parseInt(sel.value);
  const el=document.getElementById('pp-'+productId);
  if(el){const m=el.textContent.replace(/[₹,from\s]/g,'');return parseInt(m)||0;}
  return 0;
}

/* ── WHATSAPP ENQUIRY ── */
function waEnquiry(product, price){
  const msg=encodeURIComponent(
    `Hello Amentum Sports! 👋\n\nI am interested in the following:\n\n🏹 *Product:* ${product}\n💰 *Price:* ${price}\n\nPlease share more details on availability, variants, and delivery to my location.\n\nThank you!`
  );
  const waNum = localStorage.getItem('site_wa_num') || '+919827654830';
  window.open(`https://wa.me/${waNum}?text=${msg}`,'_blank');
}

/* ── RAZORPAY PAYMENT ── */
/* ════════════════════════════════════════════
   CHECKOUT — Product Variants, OTP, Coupon
════════════════════════════════════════════ */

// ── Product variant data (mirrors the HTML dropdowns) ──
const PRODUCT_VARIANTS = {
  'nalwa': [{label:'700g / 80m — ₹18,000', price:18000}, {label:'800g / 90m — ₹26,000', price:26000}],
  'chhatrapati': [{label:'600g / 60m — ₹16,250', price:16250}, {label:'800g / 80m — ₹18,200', price:18200}],
  'olympic-gold': [{label:'600g / 55m — ₹13,000', price:13000}, {label:'700g / 70m — ₹14,300', price:14300}, {label:'800g / 70m — ₹14,300', price:14300}],
  'black-panther': [{label:'600g — ₹8,400', price:8400}, {label:'700g — ₹8,640', price:8640}, {label:'800g — ₹9,000', price:9000}, {label:'900g — ₹11,000', price:11000}, {label:'1000g — ₹12,500', price:12500}],
  'purple-white': [{label:'500g / 50m — ₹7,800', price:7800}],
  'shakti-red': [{label:'500g / 60m — ₹12,000', price:12000}],
  'amentum-red': [{label:'600g — ₹4,940', price:4940}, {label:'700g — ₹5,070', price:5070}, {label:'800g — ₹5,460', price:5460}],
  'gold-kids': [{label:'400g — ₹4,800', price:4800}, {label:'500g / 50m — ₹4,900', price:4900}],
  'vayuj-400g': [{label:'400g · Multi-color — ₹1,298', price:1298}],
  'vayuj-300g': [{label:'300g — ₹1,180', price:1180}]
};

let _payProduct='', _baseAmount=0, _payProductId='', _discountAmt=0;
// _baseAmount = always the raw variant price, never touched after selection
// _discountAmt = deducted from _baseAmount to get final

function buyNow(productName, amountINR, productId){
  _payProduct   = productName;
  _baseAmount   = amountINR;
  _payProductId = productId;
  _discountAmt  = 0;

  const n=document.getElementById('pay-prod-name');
  const pr=document.getElementById('pay-prod-price');
  if(n) n.textContent = productName;
  if(pr) pr.textContent = '₹'+amountINR.toLocaleString('en-IN');

  const varWrap = document.getElementById('pay-variant-wrap');
  const varSel  = document.getElementById('pay-variant');
  const variants = PRODUCT_VARIANTS[productId];
  if(variants && variants.length > 1){
    varSel.innerHTML = variants.map(v=>`<option value="${v.price}">${v.label}</option>`).join('');
    varWrap.style.display = '';
    // keep the weight the customer picked on the product card
    const picked = variants.findIndex(v=>v.price===amountINR);
    varSel.selectedIndex = picked>=0 ? picked : 0;
    _baseAmount = variants[varSel.selectedIndex].price;
    if(pr) pr.textContent = '₹'+_baseAmount.toLocaleString('en-IN');
  } else {
    varWrap.style.display = 'none';
    varSel.innerHTML = '';
  }

  updateTotalDisplay();
  document.getElementById('pay-modal').classList.add('open');
  resetOTPState();
  const coup=document.getElementById('pay-coupon');
  const coupMsg=document.getElementById('coupon-msg');
  if(coup) coup.value='';
  if(coupMsg){coupMsg.style.display='none';coupMsg.className='';}
}

function onVariantChange(){
  const varSel = document.getElementById('pay-variant');
  if(!varSel) return;
  // Update base price from new variant selection — reset discount too
  _baseAmount   = parseInt(varSel.value) || _baseAmount;
  _discountAmt  = 0;
  const coup=document.getElementById('pay-coupon');
  const coupMsg=document.getElementById('coupon-msg');
  if(coup) coup.value='';
  if(coupMsg){coupMsg.style.display='none';coupMsg.className='';}
  updateTotalDisplay();
}

function updateTotalDisplay(){
  const total = document.getElementById('pay-total');
  const btn   = document.getElementById('pay-btn-text');
  const finalAmt = Math.max(0, _baseAmount - _discountAmt);
  if(total) total.textContent = '₹'+finalAmt.toLocaleString('en-IN');
  if(btn)   btn.textContent   = 'Pay ₹'+finalAmt.toLocaleString('en-IN')+' Securely →';
}

function closePayModal(){
  document.getElementById('pay-modal').classList.remove('open');
  document.body.style.overflow='';
  ['pay-fname','pay-lname','pay-phone','pay-otp','pay-email',
   'pay-address','pay-city','pay-pincode','pay-coupon'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  const st=document.getElementById('pay-state');
  if(st) st.selectedIndex=0;
  resetOTPState();
  _discountAmt=0;
  const coupMsg=document.getElementById('coupon-msg');
  if(coupMsg){coupMsg.style.display='none';coupMsg.className='';}
}

/* ═══════════════════════════════════════════════════════════════════
   WHATSAPP OTP — Powered by MSG91 SendOTP Widget
   ─────────────────────────────────────────────────────────────────
   How it works:
     1. Admin enters MSG91 Auth Key + WhatsApp Template ID in Admin
        → Settings panel and saves.
     2. Customer enters mobile number and clicks "Send OTP on WhatsApp"
     3. MSG91 sends a 6-digit OTP directly to the customer's WhatsApp
     4. Customer enters the OTP — MSG91 verifies it server-side
     5. On success → checkout proceeds

   Setup (one-time):
     a) Sign up at https://msg91.com (free trial credits included)
     b) Go to SMS/OTP → SendOTP → Create Template
        Template: "{{otp}} is your OTP for Amentum Sports checkout.
                   Valid for 10 minutes. Do not share."
        Select channel: WhatsApp
     c) Copy your Auth Key and Template ID
     d) Open Admin Panel → Settings → paste both keys → Save
   ═══════════════════════════════════════════════════════════════ */

let _otpVerified=false, _otpTimer=null, _otpSeconds=0, _otpPhone='';

/* ── Load MSG91 widget script once ── */
function loadMSG91Widget(){
  if(window._msg91Loaded) return;
  window._msg91Loaded = true;
  const s = document.createElement('script');
  s.src = 'https://control.msg91.com/app/assets/otp-provider/otp-provider.js';
  s.async = true;
  document.head.appendChild(s);
}
document.addEventListener('DOMContentLoaded', loadMSG91Widget);

async function sendOTP(){
  const phone = (document.getElementById('pay-phone')||{}).value.trim()||'';
  if(phone.length!==10 || !/^\d{10}$/.test(phone)){
    toast('Please enter a valid 10-digit mobile number.');return;
  }

  const authKey    = localStorage.getItem('site_msg91_key')||'';
  const templateId = localStorage.getItem('site_msg91_tpl')||'';

  const btn = document.getElementById('otp-send-btn');
  btn.disabled=true; btn.textContent='Sending…';

  _otpPhone = '91'+phone; // MSG91 needs country code prefix

  if(!authKey || !templateId){
    // ── Dev / Demo mode: generate OTP locally, show in toast ──
    const devCode = Math.floor(100000+Math.random()*900000).toString();
    window._devOTP = devCode;
    showOTPInput();
    btn.disabled=false; btn.textContent='Resend OTP';
    toast('⚠️ MSG91 keys not configured. Demo OTP: '+devCode, 5000);
    console.warn('[Amentum OTP - Dev Mode] OTP:', devCode);
    return;
  }

  // ── Production: MSG91 SendOTP Widget ──
  if(typeof sendOTPHandler === 'undefined'){
    // Widget not loaded yet — retry after short wait
    await new Promise(r=>setTimeout(r,1200));
    if(typeof sendOTPHandler === 'undefined'){
      btn.disabled=false; btn.textContent='Send OTP on WhatsApp';
      toast('OTP service loading. Please try again.'); return;
    }
  }

  const config = {
    authkey:     authKey,
    mobile:      _otpPhone,
    template_id: templateId,
    otp_length:  6,
    otp_expiry:  10   // minutes
  };

  sendOTPHandler(config, 'whatsapp',
    function(res){
      // Success — OTP dispatched to WhatsApp
      showOTPInput();
      btn.disabled=false; btn.textContent='Resend OTP';
      toast('✅ OTP sent to +91 '+phone+' on WhatsApp!');
    },
    function(err){
      btn.disabled=false; btn.textContent='Send OTP on WhatsApp';
      const msg = (err && (err.message||err.Description||JSON.stringify(err)))||'Failed to send OTP.';
      toast('❌ OTP error: '+msg);
    }
  );
}

function showOTPInput(){
  document.getElementById('otp-input-wrap').style.display='';
  startOTPTimer();
}

function startOTPTimer(){
  _otpSeconds=600; // 10 mins to match MSG91 expiry
  const timerEl  = document.getElementById('otp-timer');
  const resendBtn= document.getElementById('otp-resend-btn');
  if(resendBtn) resendBtn.style.display='none';
  if(_otpTimer) clearInterval(_otpTimer);
  _otpTimer=setInterval(()=>{
    _otpSeconds--;
    const m=Math.floor(_otpSeconds/60), s=_otpSeconds%60;
    if(timerEl) timerEl.textContent=`Expires in ${m}:${s.toString().padStart(2,'0')}`;
    if(_otpSeconds<=0){
      clearInterval(_otpTimer);
      if(timerEl) timerEl.textContent='OTP expired. Please resend.';
      if(resendBtn) resendBtn.style.display='';
    }
  },1000);
}

function resendOTP(){
  resetOTPState();
  sendOTP();
}

function verifyOTP(){
  const entered=(document.getElementById('pay-otp')||{}).value.trim()||'';
  if(entered.length!==6){return false;}

  const authKey    = localStorage.getItem('site_msg91_key')||'';
  const templateId = localStorage.getItem('site_msg91_tpl')||'';

  // Dev mode: compare against locally-stored OTP
  if(!authKey||!templateId){
    if(entered===window._devOTP){
      markOTPVerified(); return true;
    } else {
      toast('❌ Incorrect OTP. Please check and try again.');
      return false;
    }
  }

  // Production: verify via MSG91 server-side
  if(typeof verifyOTPHandler==='undefined'){
    toast('OTP service not loaded. Please refresh.');return false;
  }

  const config = { authkey:authKey, mobile:_otpPhone, otp:entered };
  verifyOTPHandler(config,
    function(res){
      markOTPVerified();
      toast('✅ Mobile number verified!');
    },
    function(err){
      const msg=(err&&(err.message||err.Description||JSON.stringify(err)))||'Incorrect OTP.';
      toast('❌ '+msg);
      document.getElementById('pay-otp').value='';
    }
  );
  return true; // async — actual result handled in callbacks
}

function markOTPVerified(){
  _otpVerified=true;
  if(_otpTimer) clearInterval(_otpTimer);
  document.getElementById('otp-verified-badge').style.display='';
  document.getElementById('otp-timer').textContent='';
  const btn=document.getElementById('otp-send-btn');
  if(btn){btn.textContent='✓ Verified';btn.disabled=true;btn.classList.add('verified');}
  const resend=document.getElementById('otp-resend-btn');
  if(resend) resend.style.display='none';
}

// Auto-verify when 6th digit entered
document.addEventListener('input',e=>{
  if(e.target.id==='pay-otp' && e.target.value.length===6) verifyOTP();
});

function resetOTPState(){
  _otpVerified=false; _otpPhone=''; window._devOTP='';
  if(_otpTimer) clearInterval(_otpTimer);
  const wrap=document.getElementById('otp-input-wrap');
  const badge=document.getElementById('otp-verified-badge');
  const btn=document.getElementById('otp-send-btn');
  const timer=document.getElementById('otp-timer');
  const resend=document.getElementById('otp-resend-btn');
  if(wrap) wrap.style.display='none';
  if(badge) badge.style.display='none';
  if(btn){btn.textContent='Send OTP';btn.disabled=false;btn.classList.remove('verified');}
  if(timer) timer.textContent='';
  if(resend) resend.style.display='none';
}

/* ── COUPON CODE ── */
const COUPONS = {
  'AMENTUM10': {type:'percent', value:10, label:'10% off'},
  'JAVELIN5':  {type:'flat',    value:500, label:'₹500 off'},
  'ARENA15':   {type:'percent', value:15, label:'15% off'},
  'LAUNCH20':  {type:'percent', value:20, label:'20% off'},
};

function applyCoupon(){
  const code=(document.getElementById('pay-coupon')||{}).value.trim().toUpperCase();
  const msgEl=document.getElementById('coupon-msg');
  if(!code){
    msgEl.style.display='none';
    _discountAmt=0;
    updateTotalDisplay();
    return;
  }

  // Always compute discount off the clean _baseAmount (never off already-discounted price)
  const coupon=COUPONS[code];
  if(!coupon){
    msgEl.textContent='❌ Invalid coupon code.';
    msgEl.className='error'; msgEl.style.display='';
    _discountAmt=0;
    updateTotalDisplay(); return;
  }
  _discountAmt = coupon.type==='percent'
    ? Math.round(_baseAmount * coupon.value/100)
    : Math.min(coupon.value, _baseAmount);
  msgEl.textContent=`✅ Coupon applied — ${coupon.label} (₹${_discountAmt.toLocaleString('en-IN')} saved)`;
  msgEl.className='success'; msgEl.style.display='';
  updateTotalDisplay();
}

function initRazorpay(){
  const fname=(document.getElementById('pay-fname')||{}).value.trim()||'';
  const lname=(document.getElementById('pay-lname')||{}).value.trim()||'';
  const phone=(document.getElementById('pay-phone')||{}).value.trim()||'';
  const email=(document.getElementById('pay-email')||{}).value.trim()||'';
  const address=(document.getElementById('pay-address')||{}).value.trim()||'';
  const city=(document.getElementById('pay-city')||{}).value.trim()||'';
  const pincode=(document.getElementById('pay-pincode')||{}).value.trim()||'';
  const state=(document.getElementById('pay-state')||{}).value||'';
  const coupon=(document.getElementById('pay-coupon')||{}).value.trim()||'';
  const varSel=document.getElementById('pay-variant');
  const variantLabel=varSel&&varSel.selectedOptions[0]?varSel.selectedOptions[0].text:'';

  // Validation
  if(!fname){toast('Please enter your first name.');return;}
  if(!lname){toast('Please enter your last name.');return;}
  if(phone.length!==10){toast('Please enter a valid 10-digit mobile number.');return;}
  if(!_otpVerified){toast('Please verify your mobile number with OTP before proceeding.');return;}
  if(!email||!email.includes('@')){toast('Please enter a valid email address.');return;}
  if(!address){toast('Please enter your delivery address.');return;}
  if(!city){toast('Please enter your city.');return;}
  if(!state){toast('Please select your state.');return;}
  if(pincode.length!==6){toast('Please enter a valid 6-digit pincode.');return;}

  const name=`${fname} ${lname}`;
  const fullAddress=`${address}, ${city}, ${state} — ${pincode}`;
  const finalAmt=Math.max(0, _baseAmount-_discountAmt);

  const options={
    key: localStorage.getItem('site_rzp_key') || 'rzp_live_REPLACE_WITH_YOUR_KEY',
    amount:finalAmt*100,
    currency:'INR',
    name:'Amentum Sports',
    description:_payProduct+(variantLabel?` (${variantLabel})`:''),
    image:'images/amentum_logo.png',
    handler:function(response){
      closePayModal();
      const msg=encodeURIComponent(
        `✅ *Payment Successful — Amentum Sports*\n\n`+
        `*Product:* ${_payProduct}\n`+(variantLabel?`*Variant:* ${variantLabel}\n`:'')+
        `*Amount Paid:* ₹${finalAmt.toLocaleString('en-IN')}`+(coupon?` (Coupon: ${coupon})\n`:'\n')+
        `*Razorpay ID:* ${response.razorpay_payment_id}\n\n`+
        `*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n`+
        `*Address:* ${fullAddress}\n\n`+
        `Please confirm my order and share the delivery timeline. Thank you!`
      );
      window.open(`https://wa.me/${localStorage.getItem('site_wa_num')||'+919827654830'}?text=${msg}`,'_blank');
      toast('Payment successful! 🎉 Order confirmed — '+response.razorpay_payment_id);
    },
    prefill:{name,contact:'91'+phone,email},
    notes:{address:fullAddress,product:_payProduct,variant:variantLabel,coupon:coupon||'None'},
    theme:{color:'#c8171a'},
    modal:{ondismiss:()=>updateTotalDisplay()}
  };

  if(typeof Razorpay==='undefined'){
    const msg=encodeURIComponent(
      `🏹 *New Order — Amentum Sports*\n\n*Product:* ${_payProduct}\n`+(variantLabel?`*Variant:* ${variantLabel}\n`:'')+
      `*Amount:* ₹${finalAmt.toLocaleString('en-IN')}`+(coupon?` (Coupon: ${coupon})\n`:'\n')+
      `*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n*Address:* ${fullAddress}\n\nPlease send payment link.`
    );
    window.open(`https://wa.me/${localStorage.getItem('site_wa_num')||'+919827654830'}?text=${msg}`,'_blank');
    closePayModal();
    toast('Order sent via WhatsApp. We will share a payment link shortly!');
    return;
  }
  const rzp=new Razorpay(options);
  rzp.on('payment.failed',r=>toast('Payment failed: '+r.error.description));

  rzp.on('payment.failed',r=>toast('Payment failed: '+r.error.description));
  rzp.open();
}

/* ── ARTICLE POPUPS ── */
function openArticle(id){
  const el=document.getElementById('art-'+id);
  if(el){el.classList.add('open');document.body.style.overflow='hidden';}
}
function closeArticle(id){
  const el=document.getElementById('art-'+id);
  if(el){el.classList.remove('open');document.body.style.overflow='';}
}
// Close on Escape
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    document.querySelectorAll('.article-overlay.open').forEach(o=>{
      o.classList.remove('open');document.body.style.overflow='';
    });
    closePayModal();
  }
});
// Close article overlay on background click
document.addEventListener('click',e=>{
  if(e.target.classList.contains('article-overlay')){
    e.target.classList.remove('open');
    document.body.style.overflow='';
  }
});

/* ── ENROLL — PROFILE PREVIEW ── */
const pd={};
function upPrev(el,k){
  pd[k]=el.value;
  const fn=pd.fn||'Athlete',ln=pd.ln||'Name';
  const nameEl=document.getElementById('pv-name');
  if(nameEl)nameEl.textContent=fn+' '+ln;
  const avEl=document.getElementById('pv-av');
  if(avEl){const ini=((fn[0]||'')+(ln[0]||'')).toUpperCase();avEl.textContent=ini||'🏃';avEl.style.fontSize=ini?'18px':'24px';}
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('pv-handle',pd.ig||'@handle');
  s('pv-loc',(pd.st||'State')+' · '+(pd.cat||'Category'));
  s('pv-pb',pd.pb||'—');
  s('pv-age',pd.age||'—');
  s('pv-gear',pd.gear||'Amentum Gear');
}

/* ── FILE UPLOAD ── */
let _uploadedFile=null;
function handleFileSelect(input){
  if(input.files&&input.files[0]){
    _uploadedFile=input.files[0];
    showFilePreview(_uploadedFile.name);
  }
}
function handleDrop(e){
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('dragover');
  const file=e.dataTransfer.files[0];
  if(file&&file.type.startsWith('image/')){
    _uploadedFile=file;
    showFilePreview(file.name);
  } else {toast('Please drop an image file (JPG or PNG).');}
}
function showFilePreview(name){
  const prev=document.getElementById('file-preview');
  const nameEl=document.getElementById('file-name');
  if(prev)prev.classList.add('show');
  if(nameEl)nameEl.textContent=name;
}
function clearFile(){
  _uploadedFile=null;
  const prev=document.getElementById('file-preview');
  const inp=document.getElementById('javelin-photo');
  if(prev)prev.classList.remove('show');
  if(inp)inp.value='';
}

function doEnroll(){
  const fn=(document.querySelector('[oninput*="fn"]')||{}).value||pd.fn||'';
  const ln=(document.querySelector('[oninput*="ln"]')||{}).value||pd.ln||'';
  if(!fn&&!ln){toast('Please enter your name to continue.');return;}
  if(!pd.ig){toast('Please enter your Instagram handle.');return;}
  const msg=encodeURIComponent(
    `🏹 *Athlete Enrollment — Amentum Sports*\n\n`+
    `*Name:* ${fn} ${ln}\n*Instagram:* ${pd.ig||''}\n`+
    `*State:* ${pd.st||'—'} · *Category:* ${pd.cat||'—'}\n`+
    `*Personal Best:* ${pd.pb||'—'}m · *Age:* ${pd.age||'—'}\n`+
    `*Current Gear:* ${pd.gear||'—'}\n`+
    (_uploadedFile?`*Javelin Photo:* ✅ ${_uploadedFile.name} (will be shared separately)\n`:'')+
    `\nI have followed @amentum.sports on Instagram. Please verify and add me to the Athlete Arena!`
  );
  // Persist to admin enrollment queue
  try{
    const q = JSON.parse(localStorage.getItem('adm_enrollments')||'[]');
    q.push({id:'enr_'+Date.now(),name:(fn+' '+ln).trim(),ig:pd.ig||'',state:pd.st||'',cat:pd.cat||'',pb:pd.pb||'',age:pd.age||'',gear:pd.gear||'',status:'pending',submitted:new Date().toLocaleString('en-IN')});
    localStorage.setItem('adm_enrollments',JSON.stringify(q));
  }catch(e){}
  window.open(`https://wa.me/${localStorage.getItem('site_wa_num')||'+919827654830'}?text=${msg}`,'_blank');
  toast('Enrollment sent via WhatsApp! 🎯 We will verify your @amentum.sports follow within 48 hours.');
}

/* ── TOAST ── */
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid=setTimeout(()=>t.classList.remove('show'),4800);
}

/* ── CHATBOT ── */
const KB={
  greet:`Hi! 👋 Welcome to Amentum Sports — Asia's largest javelin store.\n\nHow can I help you today? You can ask about our javelins, how to order, international brands, the Amentum Javelin Championship, pricing, or anything else!`,
  products:`Our complete Amentum range (direct buy):\n\n🥇 *Amentum Blue Green - The Nalwa* — 700g / 80m ₹18,000 | 800g / 90m ₹26,000\n🥈 *Amentum Purple - The Chhatrapati* — 600g / 60m ₹16,250 | 800g / 80m ₹18,200\n🏅 *Amentum Olympic Gold* — 600g / 55m ₹13,000 | 700g / 70m ₹14,300 | 800g / 70m ₹14,300\n⚡ *Amentum Black Panther* — 600g ₹8,400 | 700g ₹8,640 | 800g ₹9,000 | 900g ₹11,000 | 1000g ₹12,500\n💜 *Amentum Shakti - Purple* — 500g / 50m ₹7,800\n❤️ *Amentum Shakti - Red* — 500g / 60m ₹12,000 · WA Certified\n🔴 *Amentum Red* — 600g ₹4,940 | 700g ₹5,070 | 800g ₹5,460\n⭐ *Amentum Gold Kids* — 400g ₹4,800 | 500g / 50m ₹4,900\n🌿 *Amentum Vayuj 400g - Multi-color* — 400g · Multi-color ₹1,298\n🌿 *Amentum Vayuj 300g - The Record Setter Mini Javelin* — 300g ₹1,180\n\nUse the weight dropdown on each product to select your variant.`,
  order:`*How to order Amentum Javelins (direct payment):*\n1. Go to the Shop page\n2. Select your weight/variant from the dropdown\n3. Click "Buy Now"\n4. Enter your details (name, phone, address)\n5. Pay via Razorpay — UPI, Cards, Net Banking, Wallets accepted\n6. WhatsApp confirmation sent automatically\n\n*International Brands (Nemeth, Polanik, Nordic, Gill, Nishi, Denfi, Turbojav):*\n→ Click "Send Enquiry via WhatsApp"\n→ We respond within 24 hrs`,
  international:`We carry 7 world-class brands — all WhatsApp enquiry-based:\n\n🇭🇺 *Nemeth Javelins* — Hungary\n🇵🇱 *Polanik* — Poland\n🇸🇪 *Nordic Sport* — Sweden\n🇺🇸 *Gill Athletics* — USA\n🇯🇵 *Nishi Athletics* — Japan\n🇩🇰 *Denfi Sport* — Denmark\n🌍 *Turbojav* — Global\n\nZero import duty. WhatsApp: +91 9827654830`,
  ajc:`*Amentum Javelin Championship (AJC)* — our flagship annual event:\n\n🏆 Launched 2022\n🗺️ 18+ states represented\n👶 6 age categories (U-12 to Open)\n🎯 Every winner gets an Amentum javelin\n\nMultiple AJC alumni now compete at national and international level. AJC 2026 registrations opening soon — send us a WhatsApp to participate!`,
  ambassador:`Our brand ambassador is *Davinder Singh Kang*:\n\n🏅 First Indian to qualify for World Athletics Championships Javelin Final (London 2017)\n🥉 Asian Athletics Bronze 2017 — 83.29m\n🎯 Personal Best: 84.57m · National Champion\n🇮🇳 Mentor and workshop coach across India\n\nDavinder represents the fighting spirit of Indian javelin.`,
  pricing:`*Exact pricing from amentums.com:*\n\n• Amentum Vayuj 300g - The Record Setter Mini Javelin 300g — ₹1,180\n• Amentum Vayuj 400g - Multi-color 400g · Multi-color — ₹1,298\n• Amentum Gold Kids 400g — ₹4,800\n• Amentum Gold Kids 500g / 50m — ₹4,900\n• Amentum Red 600g — ₹4,940\n• Amentum Red 700g — ₹5,070\n• Amentum Red 800g — ₹5,460\n• Amentum Shakti - Purple 500g / 50m — ₹7,800\n• Amentum Shakti - Red 500g / 60m — ₹12,000\n• Amentum Black Panther 600g — ₹8,400\n• Amentum Black Panther 700g — ₹8,640\n• Amentum Black Panther 800g — ₹9,000\n• Amentum Black Panther 900g — ₹11,000\n• Amentum Black Panther 1000g — ₹12,500\n• Amentum Olympic Gold 600g / 55m — ₹13,000\n• Amentum Olympic Gold 700g / 70m — ₹14,300\n• Amentum Olympic Gold 800g / 70m — ₹14,300\n• Amentum Purple - The Chhatrapati 600g / 60m — ₹16,250\n• Amentum Purple - The Chhatrapati 800g / 80m — ₹18,200\n• Amentum Blue Green - The Nalwa 700g / 80m — ₹18,000\n• Amentum Blue Green - The Nalwa 800g / 90m — ₹26,000\n\n*International brands:* WhatsApp for pricing`,
  payment:`We accept via Razorpay:\n\n💳 Credit / Debit Cards\n📱 UPI (GPay, PhonePe, Paytm)\n🏦 Net Banking\n👛 Wallets\n\nAll 100% secured by Razorpay. After payment → WhatsApp confirmation with delivery details.`,
  shipping:`Pan-India shipping. Zero customs on all Amentum products.\n\nSaves 15-30% vs. importing javelins yourself.\n\nDelivery: 3–7 business days. Bulk/institutional orders: dedicated logistics support.\n\n📞 +91 9827654830`,
  bulk:`Institutional bulk packages:\n\n📦 Starter — 10 units · ₹28,000\n📦 Academy — 25 units · ₹64,000\n📦 Elite — 50 units · ₹1,18,000\n\nIncludes coach onboarding + training. Pay on the shop page or WhatsApp for custom quote.\n\n💬 wa.me/+919827654830`,
  special_olympics:`Amentum is the *Official Mini-Javelin Partner of Special Olympics India*.\n\nOur Vayuj 300g is Special Olympics Bharat approved — safe rubber tip, aerodynamic fin design.\n\nWe train coaches nationwide on Mini-Javelin systems for specially-abled athletes.`,
  contact:`📞 *+91 9827654830*\n💬 *WhatsApp:* wa.me/+919827654830\n📸 *Instagram:* @amentum.sports\n📘 *Facebook:* facebook.com/amentumsports\n▶️ *YouTube:* @amentumsports5857\n🌐 *amentums.com*`,
  team:`Co-founders:\n\n👤 *Aditya Bhargava* — Masters Biomedical Engineering, UConn USA.\n\n👤 *Siddharth Patil* — India at Asia-Pacific Tchoukball 2010. Co-founded CoachKhoj. Ex Zee TAJ TV (TEN Sports).`,
  default:`Great question! For the most accurate answer contact us:\n\n💬 *WhatsApp:* wa.me/+919827654830\n📞 *+91 9827654830*\n📸 *@amentum.sports*\n\nWe respond within a few hours!`
};
function getChatReply(msg){
  const m=msg.toLowerCase();
  if(m.match(/^(hi|hello|hey|namaste|good morning|good afternoon|good evening|yo\b)/))return KB.greet;
  if(m.match(/product|javelin|model|what.*sell|full list|range|which.*javelin|list.*javelin/))return KB.products;
  if(m.match(/how.*order|place.*order|how.*buy|where.*buy|can i buy/))return KB.order;
  if(m.match(/international|nemeth|polanik|nordic|gill|nishi|denfi|turbojav|foreign brand/))return KB.international;
  if(m.match(/championship|ajc|event|competition|grassroot|tournament|register/))return KB.ajc;
  if(m.match(/ambassador|davinder|kang|brand.*ambassador|who.*ambassador/))return KB.ambassador;
  if(m.match(/price|cost|rupee|inr|₹|how much|rate|expensive|cheap/))return KB.pricing;
  if(m.match(/payment|pay|razorpay|upi|card|net banking|checkout/))return KB.payment;
  if(m.match(/ship|deliver|dispatch|customs|pan.india|how long|when.*arrive/))return KB.shipping;
  if(m.match(/bulk|institution|academy.*order|school.*order|wholesale|large.*order/))return KB.bulk;
  if(m.match(/special olympics|disable|specially.abled|vayuj|mini.*javelin/))return KB.special_olympics;
  if(m.match(/contact|phone|whatsapp|number|email|reach|talk/))return KB.contact;
  if(m.match(/team|founder|aditya|siddharth|co.?founder|who.*built|who.*started/))return KB.team;
  return KB.default;
}
function addMsg(text,role){
  const msgs=document.getElementById('chat-msgs');
  const div=document.createElement('div');
  div.className='msg '+role;
  const now=new Date();
  const t=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const fmt=text.replace(/\*(.*?)\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  div.innerHTML=`<div class="msg-bub">${fmt}</div><div class="msg-time">${t}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  const msgs=document.getElementById('chat-msgs');
  const d=document.createElement('div');
  d.id='typing-ind';d.className='msg bot';
  d.innerHTML='<div class="typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=document.getElementById('typing-ind');if(t)t.remove();}
function sendMsg(){
  const inp=document.getElementById('chat-inp');
  const msg=inp.value.trim();
  if(!msg)return;
  inp.value='';
  inp.style.height='auto';
  addMsg(msg,'user');
  document.getElementById('chat-quick').style.display='none';
  showTyping();
  setTimeout(()=>{removeTyping();addMsg(getChatReply(msg),'bot');},600+Math.random()*600);
}
function sendQ(msg){document.getElementById('chat-inp').value=msg;sendMsg();}
function openChat(preMsg){
  if(!chatOpen)toggleChat();
  if(preMsg)setTimeout(()=>{document.getElementById('chat-inp').value=preMsg;sendMsg();},400);
}
let chatOpen=false,chatInited=false;
function toggleChat(){
  const win=document.getElementById('chat-win');
  chatOpen=!chatOpen;
  win.classList.toggle('open',chatOpen);
  if(chatOpen&&!chatInited){chatInited=true;setTimeout(()=>addMsg(KB.greet,'bot'),350);}
  if(chatOpen)setTimeout(()=>document.getElementById('chat-inp').focus(),320);
}
// Auto-resize chat textarea
document.addEventListener('input',e=>{
  if(e.target.id==='chat-inp'){
    e.target.style.height='auto';
    e.target.style.height=Math.min(e.target.scrollHeight,100)+'px';
  }
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',()=>initReveal());


/* ══════════════════════════════════════════════════════════════
   CMS SYNC — reads admin panel changes and renders to main site
══════════════════════════════════════════════════════════════ */

const CMS = {
  get(k, def){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } }
};

/* ── Master init: apply all admin changes on page load ── */
function cmsInit(){
  cmsApplyContent();
  cmsApplyStats();
  cmsRenderShopProducts();
  cmsRenderHomeProducts();
  cmsRenderInsights();
  cmsRenderHomeInsightPreview();
  cmsRenderArenaProfiles();
  cmsRenderArenaLeaderboard();
  cmsSyncCoupons();
}

/* ── 1. HERO / MISSION / AJC CONTENT ── */
function cmsApplyContent(){
  const c = CMS.get('site_content', null);
  if(!c) return;

  // Hero
  const h = document.getElementById('hero-title');
  const s = document.getElementById('hero-sub');
  if(h && c.hero?.h) h.innerHTML = c.hero.h;
  if(s && c.hero?.sub) s.textContent = c.hero.sub;

  // Mission paragraphs
  if(c.mission){
    const ms = document.querySelectorAll('.mission-sec p');
    if(ms[0] && c.mission.p1) ms[0].textContent = c.mission.p1;
    if(ms[1] && c.mission.p2) ms[1].textContent = c.mission.p2;
  }

  // AJC stats
  if(c.ajc){
    const ajcEls = document.querySelectorAll('.ajc-stat-val');
    // Update AJC numbers by targeting the specific DM Serif divs inside the AJC grid
    const ajcGrid = document.querySelectorAll('#page-home section[style*="--ink"] [style*="font-size:40px"]');
    if(ajcGrid[0] && c.ajc.year) ajcGrid[0].textContent = c.ajc.year;
    if(ajcGrid[1] && c.ajc.states) ajcGrid[1].textContent = c.ajc.states;
    if(ajcGrid[2] && c.ajc.cats) ajcGrid[2].textContent = c.ajc.cats;
  }
}

/* ── 2. STATS BAR ── */
function cmsApplyStats(){
  const c = CMS.get('site_content', null);
  if(!c?.stats) return;
  const bar = document.getElementById('stats-bar');
  if(!bar) return;
  bar.innerHTML = c.stats.map(st =>
    `<div class="stat-item"><div class="stat-n"><em>${st.n}</em></div><div class="stat-l">${st.l}</div></div>`
  ).join('');
}

/* ── 3. SHOP PAGE — full product grid ── */
function cmsRenderShopProducts(){
  const products = CMS.get('site_products', null);
  if(!products) return;

  const grid = document.getElementById('shop-grid');
  if(!grid) return;

  // Keep the international brands divider + brand cards + institutional block (after amentum products)
  // Remove only the amentum product cards (those with data-cat != international, != institutional marker)
  const existing = [...grid.querySelectorAll('.prod-card:not(.intl-card), .shop-sec-hd:not([data-cat="international"])')];
  existing.forEach(el => el.remove());

  // Build product cards for active products
  const active = products.filter(p => p.active !== false && p.cat !== 'international');
  const html = active.map(p => buildProductCard(p)).join('');

  // Insert before the international divider
  const intlDivider = grid.querySelector('.shop-sec-hd[data-cat="international"]');
  if(intlDivider){
    grid.insertAdjacentHTML('afterbegin', html);
  } else {
    const instBlock = grid.querySelector('.inst-block');
    if(instBlock) instBlock.insertAdjacentHTML('beforebegin', html);
    else grid.insertAdjacentHTML('afterbegin', html);
  }

  // Update PRODUCT_VARIANTS in checkout
  // PRODUCT_VARIANTS is a top-level const (not on window) — reference it directly
  active.forEach(p => {
    PRODUCT_VARIANTS[p.id] = p.variants.map(v=>({label:v.label, price:v.price}));
  });
}

function buildProductCard(p){
  const multi = p.variants && p.variants.length > 1;
  const firstPrice = p.variants?.[0]?.price || 0;
  const certBadge = (p.wavert||p.wacert) ? '<span class="wa-badge">WA Cert</span>' : '';

  const variantHtml = multi
    ? `<div class="variant-select-wrap">
        <span class="variant-label">Select Weight / Range</span>
        <select class="variant-select" id="vs-${p.id}" onchange="updatePrice('${p.id}',this.value)">
          ${p.variants.map(v=>`<option value="${v.price}"${v.img?` data-img="${v.img}"`:''}>${v.label}</option>`).join('')}
        </select>
       </div>`
    : `<div style="font-size:12px;color:var(--dim);margin-bottom:14px">${p.variants?.[0]?.label||''}</div>`;

  const priceDisplay = multi
    ? `from ₹${firstPrice.toLocaleString('en-IN')}`
    : `₹${firstPrice.toLocaleString('en-IN')}`;

  const imgStyle = p.imgbg ? `background:${p.imgbg}` : 'background:#f5f4f1';

  return `<div class="prod-card" data-cat="${p.cat}">
    <div class="prod-img-wrap" style="${imgStyle}">
      <img class="prod-img" src="${p.img||''}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="prod-meta">
      <div class="prod-series">${p.code||''} · ${p.cat} · ${p.flex||''} Flex ${certBadge}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-desc">${p.desc||''}</div>
      ${variantHtml}
      <div class="prod-footer">
        <span class="prod-price" id="pp-${p.id}">${priceDisplay}</span>
        <div class="prod-actions">
          <button class="btn-enquire" onclick="waEnquiry('${p.name.replace(/'/g,"\\'")}',document.getElementById('pp-${p.id}').textContent)">Enquire</button>
          <button class="btn-buynow" onclick="buyNow('${p.name.replace(/'/g,"\\'")}',getPrice('${p.id}'),'${p.id}')">Buy Now →</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ── 4. HOME — flagship 3 products ── */
function cmsRenderHomeProducts(){
  const products = CMS.get('site_products', null);
  if(!products) return;
  const grid = document.getElementById('home-prod-grid');
  if(!grid) return;

  const active = products.filter(p => p.active !== false && p.cat !== 'international');
  const top3 = active.slice(0, 3);

  grid.innerHTML = top3.map(p => {
    const price = p.variants?.[0]?.price || 0;
    const fromLabel = p.variants?.length > 1 ? 'from ' : '';
    return `<div class="prod-card" onclick="go('shop')" style="cursor:pointer">
      <div class="prod-img-wrap" style="background:${p.imgbg||'#f5f4f1'}">
        <img class="prod-img" src="${p.img||''}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
      </div>
      <div class="prod-meta">
        <div class="prod-series">${p.code||''} · ${p.cat} · ${p.flex||''} Flex</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-desc">${p.desc||''}</div>
        <div class="prod-footer">
          <span class="prod-price">${fromLabel}₹${price.toLocaleString('en-IN')}</span>
          <button class="btn-buynow" onclick="event.stopPropagation();go('shop')">View in Shop →</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── 5. INSIGHTS PAGE — article cards + popups ── */
function cmsRenderInsights(){
  const articles = CMS.get('site_articles', null);
  if(!articles) return;

  const grid = document.getElementById('insights-grid');
  if(!grid) return;

  const published = articles.filter(a => a.status === 'published');

  // Render cards
  grid.innerHTML = published.map(a => `
    <div class="ins-card" onclick="openArticle('${a.id}')" data-artid="${a.id}">
      <div class="ins-cat">${a.cat} · ${a.date}</div>
      <div class="ins-t">${a.title}</div>
      <div class="ins-body">${a.summary||''}</div>
      <div class="ins-meta">${a.read} read</div>
      <span class="ins-arr">Read Full Article →</span>
    </div>`).join('');

  // Update featured article (first/latest published)
  const featTitle = document.querySelector('.feat-t');
  const featEx    = document.querySelector('.feat-ex');
  const featTag   = document.querySelector('.feat-tag');
  if(published[0] && featTitle){
    featTitle.textContent = published[0].title;
    if(featEx)  featEx.textContent  = published[0].summary||'';
    if(featTag) featTag.textContent = `${published[0].cat} · ${published[0].date}`;
    // Update the Read Full Article button
    const featBtn = document.querySelector('.feat-body .btn-fill');
    if(featBtn) featBtn.setAttribute('onclick', `openArticle('${published[0].id}')`);
  }

  // Re-render article popups dynamically
  cmsRenderArticlePopups(articles);
}

function cmsRenderArticlePopups(articles){
  // Remove old article overlays
  document.querySelectorAll('.article-overlay').forEach(el => el.remove());

  // Rebuild from admin data
  const popupsHtml = articles.map(a => `
    <div class="article-overlay" id="art-${a.id}">
      <div class="article-modal">
        <div class="art-header">
          <button class="art-close" onclick="closeArticle('${a.id}')" aria-label="Close">×</button>
          <div class="art-cat">${a.cat}</div>
          <div class="art-title">${a.title}</div>
          <div class="art-meta">${a.author||'Amentum Editorial'} · ${a.date} · ${a.read} read</div>
        </div>
        <div class="art-body">${a.body||'<p>Article content coming soon.</p>'}</div>
        <div class="art-footer">
          <button class="btn-fill" style="padding:10px 22px;font-size:12px" onclick="go('shop');closeArticle('${a.id}')">Shop Amentum Javelins →</button>
          <button class="btn-line" style="padding:10px 22px;font-size:12px" onclick="closeArticle('${a.id}')">Close</button>
        </div>
      </div>
    </div>`).join('');

  document.body.insertAdjacentHTML('beforeend', popupsHtml);
}

/* ── 6. HOME — insights preview (3 cards) ── */
function cmsRenderHomeInsightPreview(){
  const articles = CMS.get('site_articles', null);
  if(!articles) return;
  const grid = document.getElementById('home-ins-preview');
  if(!grid) return;
  const top3 = articles.filter(a=>a.status==='published').slice(0,3);
  grid.innerHTML = top3.map(a=>`
    <div class="ins-card" onclick="openArticle('${a.id}')">
      <div class="ins-cat">${a.cat} · ${a.date}</div>
      <div class="ins-t">${a.title}</div>
      <div class="ins-meta">${a.read} read</div>
      <span class="ins-arr">Read →</span>
    </div>`).join('');
}

/* ── 7. ATHLETE ARENA — profiles grid ── */
function cmsRenderArenaProfiles(){
  const athletes = CMS.get('site_athletes', null);
  if(!athletes) return;
  const grid = document.getElementById('arena-profiles-grid');
  if(!grid) return;
  grid.innerHTML = athletes.map(a => {
    const initials = a.name.split(' ').map(w=>w[0]).join('').slice(0,2);
    return `<div class="ath-card">
      <div class="ath-av" ${a.status==='sponsored'?'style="background:var(--red-bg);color:var(--red)"':''}>${initials}</div>
      <div class="ath-name">${a.name}</div>
      <div class="ath-role">${a.ig||''}${a.verified?' ✅':''}</div>
      <div class="ath-loc">${a.state||''} · ${a.cat||''}</div>
      <div class="ath-stats">
        <div><div class="ath-sv" style="color:var(--red)">${a.pb}<span style="font-size:11px;color:var(--dim)">m</span></div><div class="ath-sl">PB</div></div>
        <div><div class="ath-sv">${a.age}</div><div class="ath-sl">Age</div></div>
        <div><div class="ath-sv">#${athletes.filter(x=>x.cat===a.cat).sort((x,y)=>y.pb-x.pb).findIndex(x=>x.id===a.id)+1}</div><div class="ath-sl">Rank</div></div>
      </div>
    </div>`;
  }).join('');
}

/* ── 8. ATHLETE ARENA — leaderboard ── */
function cmsRenderArenaLeaderboard(){
  const athletes = CMS.get('site_athletes', null);
  if(!athletes) return;
  const tbody = document.getElementById('lb-tbody');
  if(!tbody) return;
  const sorted = [...athletes].sort((a,b)=>b.pb-a.pb);
  tbody.innerHTML = sorted.map((a,i) => `
    <div class="lb-row ${i<3?'gold':''}">
      <div class="lb-rank">${i+1}</div>
      <div class="lb-ath">
        <div class="lb-av">${a.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div><div class="lb-name">${a.name}</div><div class="lb-loc">${a.state||''} · ${a.age}</div></div>
      </div>
      <div class="lb-pb">${a.pb}<small>m</small></div>
      <div class="lb-badge-col"><span class="badge ${a.status==='sponsored'?'s':'l'}">${a.status==='sponsored'?'Sponsored':'Listed'}</span></div>
    </div>`).join('');
}

/* ── 9. SYNC COUPONS from admin to checkout ── */
function cmsSyncCoupons(){
  const adminCoupons = CMS.get('site_coupons', null);
  if(!adminCoupons) return;
  // COUPONS is a top-level const (not on window) — mutate it directly
  Object.keys(COUPONS).forEach(k => delete COUPONS[k]);
  adminCoupons.filter(c=>c.active).forEach(c=>{
    COUPONS[c.code] = {
      type: c.type,
      value: c.value,
      label: c.type==='percent' ? `${c.value}% off` : `₹${c.value} off`
    };
  });
}

/* ── Run on page load + re-run whenever admin makes changes ── */
document.addEventListener('DOMContentLoaded', cmsInit);

// Listen for storage changes from admin panel (same or other tab)
window.addEventListener('storage', e => {
  if(['site_products','site_articles','site_athletes','site_coupons','site_content'].includes(e.key)){
    cmsInit();
    initReveal();
    if(typeof toast === 'function') toast('Content updated from Admin Panel ✓');
  }
});

/* ── GOOGLE ANALYTICS — injected from Admin → Settings ── */
(function(){
  let raw = localStorage.getItem('site_ga_id');
  if(!raw) return;
  try{ raw = JSON.parse(raw); }catch(e){}
  if(!/^G-[A-Z0-9]{6,14}$/i.test(raw)) return;
  const id = raw.toUpperCase();
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id='+id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
  // SPA page-view tracking on internal navigation
  const _gaGo = window.go;
  if(typeof _gaGo === 'function'){
    window.go = function(page){
      _gaGo(page);
      gtag('event','page_view',{page_title:page,page_location:location.href+'#'+page});
    };
  }
})();

/* ══════════════════════════════════════════════════════════════
   LIVE AFI RANKINGS (Athlete Arena → AFI Rankings)
   Reads /api/rankings (Vercel function). Each part (senior / junior)
   falls back to the last good copy kept in this browser, and then to
   the lists baked into the page, so the tab never goes blank.
══════════════════════════════════════════════════════════════ */
const RK_STORE='afi_rankings_last_good';
let _rkLoaded=false;
const rkEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rkInitials=n=>String(n).split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const rkDate=d=>{const x=new Date(d);return isNaN(x)?d:x.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});};

function rkRenderList(key,rows,junior){
  const col=document.querySelector(`#tab-afi .rk-col[data-rk="${key}"]`);
  if(!col||!Array.isArray(rows)||!rows.length)return;
  col.querySelectorAll('.lb-row:not(.head)').forEach(r=>r.remove());
  rows.forEach((a,i)=>{
    const meta=junior
      ? `${rkEsc(a.state)} · born ${rkEsc(a.born)}`
      : a.news
        ? `${rkEsc(a.state)} · News report · ${rkEsc(rkDate(a.date))}`
        : `${rkEsc(a.state)} · ${rkEsc(a.comp)} · ${rkEsc(a.date)}`;
    const tag = a.nr ? ' <span class="rk-nr">NR</span>'
      : a.news ? ` <a class="rk-news" href="${rkEsc(a.news.url)}" target="_blank" rel="noopener" title="${rkEsc(a.news.title)}">NEWS</a>` : '';
    col.insertAdjacentHTML('beforeend',
      `<div class="lb-row${i<3?' gold':''} rk-row"><div class="lb-rank">${i+1}</div><div class="lb-ath"><div class="lb-av">${rkEsc(rkInitials(a.name))}</div><div><div class="lb-name">${rkEsc(a.name)}</div><div class="lb-loc">${meta}</div></div></div><div class="lb-pb">${Number(a.mark).toFixed(2)}<small>m</small>${tag}</div></div>`);
  });
}

function rkRender(data){
  const links=[];
  if(data.senior){
    const s=data.senior;
    ['men','women'].forEach(k=>rkRenderList(k,s[k],false));
    const note=document.getElementById('rk-senior-note');
    if(note)note.textContent=`Top 5 by best mark from the Athletics Federation of India's official ranking list${s.source.asOf?` (as of ${rkDate(s.source.asOf)})`:''}, plus newer marks reported in the news where an article names the athlete and the distance (tagged NEWS). AFI publishes senior lists only; these include athletes of all ages.`;
    links.push(`<a href="${rkEsc(s.source.url)}" target="_blank" rel="noopener" style="color:var(--red)">${rkEsc(s.source.name)} (PDF)</a>`);
  }
  if(data.junior){
    const j=data.junior;
    ['u20Boys','u20Girls','u18Boys','u18Girls'].forEach(k=>rkRenderList(k,j[k],true));
    const yr=(String(j.source.name).match(/\d{4}/)||[''])[0];
    const h=document.getElementById('rk-junior-title'); if(h)h.textContent=`Junior & Youth · National Championships ${yr}`;
    const n=document.getElementById('rk-junior-note');
    if(n)n.textContent=`Top 5 in the javelin finals at AFI's ${j.source.name}${j.source.dates?`, ${j.source.dates}`:''}. AFI does not publish a U20 or U18 season ranking, so these are the official final placings at India's national age-group championship.`;
    links.push(`<a href="${rkEsc(j.source.url)}" target="_blank" rel="noopener" style="color:var(--red)">AFI ${rkEsc(j.source.name)} results</a>`);
  }
  const src=document.getElementById('rk-sources');
  if(src&&links.length)src.innerHTML=`Sources: ${links.join(' · ')} · NR = National Record · NEWS = mark from a news report, not yet in AFI's official list`;
}

function rkStatus(text,warn){const el=document.getElementById('rk-status');if(el){el.textContent=text;el.classList.toggle('warn',!!warn);}}

async function loadRankings(force){
  if(_rkLoaded&&!force)return;
  _rkLoaded=true;
  const btn=document.getElementById('rk-refresh');
  if(btn){btn.disabled=true;btn.textContent='Refreshing…';}
  let saved=null; try{saved=JSON.parse(localStorage.getItem(RK_STORE)||'null');}catch(e){}
  try{
    const r=await fetch('/api/rankings'+(force?'?refresh=1':''),{cache:force?'no-store':'default'});
    const data=await r.json().catch(()=>null);
    if(!r.ok||!data||!data.ok)throw new Error('unavailable');
    // fill any part that failed this time from the last good copy
    const merged={...data,senior:data.senior||(saved&&saved.senior)||null,junior:data.junior||(saved&&saved.junior)||null};
    rkRender(merged);
    try{localStorage.setItem(RK_STORE,JSON.stringify({senior:merged.senior,junior:merged.junior,fetchedAt:data.fetchedAt}));}catch(e){}
    const partial=!data.senior||!data.junior;
    rkStatus(`Updated ${new Date(data.fetchedAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}${partial?' · some lists from last update':''}${data.news&&data.news.applied&&data.news.applied.length?` · ${data.news.applied.length} news update${data.news.applied.length>1?'s':''}`:''}`,partial);
    if(force&&typeof toast==='function')toast('Rankings refreshed from AFI ✓');
  }catch(e){
    if(saved&&(saved.senior||saved.junior)){
      rkRender(saved);
      rkStatus(`Live update unavailable · showing lists from ${rkDate(saved.fetchedAt)}`,true);
    }else{
      rkStatus('Live update unavailable · showing lists as last published on this page',true);
    }
    if(force&&typeof toast==='function')toast('Could not reach AFI right now. Showing the last saved rankings.');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='↻ Refresh rankings';}
  }
}
