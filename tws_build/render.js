// TWS Editorial Grid — render engine v3
// Carousel 1080x1350. Slide types: cover, typecover, model, product, accessories,
// editorial (full-bleed), quote, tip, stat, cta. Per-slide theme: warm | stone | noir.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const B = (p) => fs.readFileSync(p).toString('base64');
const FONT = (f) => B(path.join('node_modules/@fontsource', f));
const cinzel600 = FONT('cinzel/files/cinzel-latin-600-normal.woff2');
const cinzel400 = FONT('cinzel/files/cinzel-latin-400-normal.woff2');
const mont300 = FONT('montserrat/files/montserrat-latin-300-normal.woff2');
const mont400 = FONT('montserrat/files/montserrat-latin-400-normal.woff2');
const mont500 = FONT('montserrat/files/montserrat-latin-500-normal.woff2');
const monogram = B('assets/tws_monogram.png');
const monogramLight = fs.existsSync('assets/tws_monogram_light.png') ? B('assets/tws_monogram_light.png') : null;
const lockup = B('assets/tws_lockup.png');
const lockupLight = fs.existsSync('assets/tws_lockup_light.png') ? B('assets/tws_lockup_light.png') : null;

// Palette themes. Default (warm) matches the original brand look exactly.
const THEMES = {
  warm:  {bg:'#F6F5F3', ink:'#1B2327', accent:'#C5B6A5', soft:'rgba(27,35,39,.6)', soft2:'rgba(27,35,39,.42)', line:'rgba(27,35,39,.26)', light:false},
  stone: {bg:'#EAE7E1', ink:'#1B2327', accent:'#A79E92', soft:'rgba(27,35,39,.6)', soft2:'rgba(27,35,39,.42)', line:'rgba(27,35,39,.26)', light:false},
  noir:  {bg:'#15191B', ink:'#F2F0EC', accent:'#9A8F80', soft:'rgba(242,240,236,.65)', soft2:'rgba(242,240,236,.45)', line:'rgba(242,240,236,.28)', light:true},
};
function themeVars(name){
  const t = THEMES[name] || THEMES.warm;
  return `--ink:${t.ink};--bg:${t.bg};--accent:${t.accent};--soft:${t.soft};--soft2:${t.soft2};--line:${t.line};`;
}
const isLight = (name) => (THEMES[name]||THEMES.warm).light;

const CSS = `
@font-face{font-family:'Cinzel';font-weight:600;src:url(data:font/woff2;base64,${cinzel600}) format('woff2');}
@font-face{font-family:'Cinzel';font-weight:400;src:url(data:font/woff2;base64,${cinzel400}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:300;src:url(data:font/woff2;base64,${mont300}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:400;src:url(data:font/woff2;base64,${mont400}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:500;src:url(data:font/woff2;base64,${mont500}) format('woff2');}
:root{--ink:#1B2327;--bg:#F6F5F3;--accent:#C5B6A5;--soft:rgba(27,35,39,.6);--soft2:rgba(27,35,39,.42);--line:rgba(27,35,39,.26);}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1350px;background:var(--bg);}
.slide{width:1080px;height:1350px;background:var(--bg);position:relative;
  display:flex;flex-direction:column;align-items:center;padding:50px 54px 56px;overflow:hidden;}
.slide.bleed{padding:0;}
.header{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:9px;}
.mono{height:50px;}
.eyebrow{font-family:'Montserrat';font-weight:300;font-size:18px;letter-spacing:.4em;
  color:var(--ink);text-transform:uppercase;padding-left:.4em;}
.focus{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;
  width:100%;min-height:0;margin:20px 0;}
.focus img{max-width:100%;max-height:100%;object-fit:contain;display:block;}
.focus.pad img{max-width:90%;}
.ph{display:flex;align-items:center;justify-content:center;border:1px solid var(--line);
  color:var(--soft2);font-family:'Montserrat';font-weight:300;font-size:21px;
  letter-spacing:.34em;text-transform:uppercase;text-align:center;width:88%;height:100%;}
.footer{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:15px;width:100%;}
.rule{width:60px;height:1px;background:var(--ink);opacity:.5;}
.title{font-family:'Cinzel';font-weight:600;color:var(--ink);text-transform:uppercase;
  letter-spacing:.2em;text-align:center;padding-left:.2em;line-height:1.1;}
.t-xl{font-size:78px;} .t-lg{font-size:60px;} .t-md{font-size:46px;}
.subtitle{font-family:'Montserrat';font-weight:400;color:var(--accent);
  letter-spacing:.14em;text-align:center;font-size:25px;text-transform:lowercase;}
.caption-el{font-family:'Montserrat';font-weight:300;color:var(--ink);opacity:.7;
  letter-spacing:.12em;text-align:center;font-size:22px;}
.pname{font-family:'Cinzel';font-weight:400;font-size:42px;letter-spacing:.13em;
  color:var(--ink);text-transform:uppercase;text-align:center;padding-left:.13em;line-height:1.1;}
.pmeta{font-family:'Montserrat';font-weight:300;font-size:22px;letter-spacing:.26em;
  color:var(--ink);text-transform:uppercase;text-align:center;}
.pcomp{font-family:'Montserrat';font-weight:300;font-size:20px;letter-spacing:.08em;
  color:var(--soft);text-align:center;}
.price{font-family:'Cinzel';font-weight:600;font-size:36px;letter-spacing:.1em;color:var(--ink);}
.ctasub{font-family:'Montserrat';font-weight:300;font-size:27px;letter-spacing:.14em;
  color:var(--ink);text-align:center;line-height:1.7;}
.ctasub b{font-weight:500;}
.ctabtn{display:inline-flex;align-items:center;background:var(--ink);color:var(--bg);
  font-family:'Montserrat';font-weight:500;font-size:34px;letter-spacing:.3em;text-transform:uppercase;
  padding:26px 62px 26px 68px;border-radius:60px;box-shadow:0 16px 34px rgba(27,35,39,.22);margin-top:8px;}
.lockup{height:168px;}
.hint{font-family:'Montserrat';font-weight:400;font-size:18px;letter-spacing:.34em;
  color:var(--soft2);text-transform:uppercase;padding-left:.34em;margin-top:4px;}
.accgrid{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:34px 46px;width:100%;}
.accitem{display:flex;flex-direction:column;align-items:center;gap:14px;width:270px;}
.accitem .imgwrap{height:300px;display:flex;align-items:center;justify-content:center;}
.accitem img{max-width:250px;max-height:300px;object-fit:contain;filter:drop-shadow(0 14px 22px rgba(27,35,39,.14));}
.prodimg{filter:drop-shadow(0 22px 36px rgba(27,35,39,.17));}
.accname{font-family:'Cinzel';font-weight:400;font-size:25px;letter-spacing:.07em;
  color:var(--ink);text-transform:uppercase;text-align:center;line-height:1.18;}
.accmeta{font-family:'Montserrat';font-weight:300;font-size:17px;letter-spacing:.2em;
  color:var(--soft);text-transform:uppercase;text-align:center;}
.accprice{font-family:'Cinzel';font-weight:600;font-size:23px;color:var(--ink);letter-spacing:.04em;}
/* --- new slide types --- */
.typecover{justify-content:center;gap:28px;}
.bigtype{font-family:'Cinzel';font-weight:600;color:var(--ink);text-transform:uppercase;
  letter-spacing:.12em;text-align:center;font-size:94px;line-height:1.1;padding-left:.12em;}
.bigsub{font-family:'Montserrat';font-weight:300;color:var(--accent);letter-spacing:.2em;
  font-size:30px;text-transform:lowercase;text-align:center;}
.kicker{font-family:'Montserrat';font-weight:400;font-size:20px;letter-spacing:.42em;
  color:var(--soft);text-transform:uppercase;padding-left:.42em;text-align:center;}
.edfull{position:absolute;inset:0;}
.edfull img{width:100%;height:100%;object-fit:cover;display:block;}
.edcapwrap{position:absolute;left:0;right:0;bottom:0;padding:54px;display:flex;flex-direction:column;
  align-items:center;gap:12px;background:linear-gradient(to top, rgba(0,0,0,.42), rgba(0,0,0,0));}
.edcapwrap.light *{color:#F6F5F3 !important;}
.edcap-title{font-family:'Cinzel';font-weight:600;font-size:52px;letter-spacing:.14em;text-transform:uppercase;text-align:center;line-height:1.1;}
.edcap{font-family:'Montserrat';font-weight:300;font-size:24px;letter-spacing:.12em;text-align:center;}
.quote{font-family:'Cinzel';font-weight:400;color:var(--ink);text-align:center;
  font-size:60px;line-height:1.3;letter-spacing:.03em;max-width:94%;}
.quote .mk{color:var(--accent);}
.qattr{font-family:'Montserrat';font-weight:300;letter-spacing:.3em;text-transform:uppercase;
  font-size:22px;color:var(--soft);margin-top:34px;text-align:center;}
.tipwrap{width:100%;display:flex;flex-direction:column;gap:30px;align-items:flex-start;padding:0 10px;}
.tipitem{display:flex;gap:28px;align-items:baseline;width:100%;}
.tipnum{font-family:'Cinzel';font-weight:600;font-size:48px;color:var(--accent);min-width:74px;text-align:left;}
.tiptext{font-family:'Montserrat';font-weight:300;font-size:31px;line-height:1.38;color:var(--ink);text-align:left;}
.tiptext b{font-weight:500;}
.statnum{font-family:'Cinzel';font-weight:600;font-size:210px;color:var(--ink);line-height:.98;}
.statlabel{font-family:'Montserrat';font-weight:400;letter-spacing:.28em;text-transform:uppercase;
  font-size:30px;color:var(--ink);text-align:center;}
.statsub{font-family:'Montserrat';font-weight:300;font-size:25px;color:var(--soft);
  text-align:center;letter-spacing:.08em;margin-top:12px;max-width:80%;line-height:1.5;}
`;

function ph(label){return `<div class="ph">${label}</div>`;}
function monoTag(light){return `<img class="mono" src="data:image/png;base64,${light&&monogramLight?monogramLight:monogram}">`;}

function slideHTML(s){
  const light = isLight(s.theme);
  const mono = monoTag(light);
  let header='', focus='', footer='', bleed=false, cls='';
  if(s.type==='cover'){
    header = `${mono}${s.eyebrow?`<div class="eyebrow">${s.eyebrow}</div>`:''}`;
    focus = s.img ? `<img src="${s.img}">` : ph(s.visual||'FLAT-LAY');
    footer = `<div class="rule"></div>
      <div class="title ${s.size||'t-xl'}">${s.title}</div>
      ${s.subtitle?`<div class="subtitle">${s.subtitle}</div>`:''}
      ${s.hint?`<div class="hint">${s.hint}</div>`:''}`;
  } else if(s.type==='typecover'){
    cls='typecover';
    header = `${mono}${s.eyebrow?`<div class="eyebrow">${s.eyebrow}</div>`:''}`;
    focus = `<div style="flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;">
      ${s.kicker?`<div class="kicker">${s.kicker}</div>`:''}
      <div class="bigtype">${s.title}</div>
      ${s.subtitle?`<div class="bigsub">${s.subtitle}</div>`:''}</div>`;
    footer = s.hint?`<div class="rule"></div><div class="hint">${s.hint}</div>`:'';
  } else if(s.type==='model'){
    header = `<div class="eyebrow">${s.eyebrow||'THE LOOK'}</div>`;
    focus = s.img ? `<img src="${s.img}">` : ph(s.visual||'AI MODEL · ON-BODY');
    footer = s.caption?`<div class="rule"></div><div class="caption-el">${s.caption}</div>`:'';
  } else if(s.type==='product'){
    header = `<div class="eyebrow">THE DETAILS · NO.${s.index}</div>`;
    focus = s.img ? `<img class="prodimg" src="${s.img}">` : ph('PRODUCT');
    footer = `<div class="rule"></div>
      <div class="pname">${s.name}</div>
      <div class="pmeta">${s.brand}${s.code?' · '+s.code:''}</div>
      ${s.comp?`<div class="pcomp">${s.comp}</div>`:''}
      ${s.price?`<div class="price">${s.price}</div>`:''}`;
  } else if(s.type==='accessories'){
    header = `<div class="eyebrow">${s.eyebrow||'THE ACCESSORIES'}</div>`;
    const items = (s.items||[]).map(it=>`<div class="accitem">
      <div class="imgwrap"><img src="${it.img}"></div>
      <div class="accname">${it.name}</div>
      <div class="accmeta">${it.brand}</div>
      ${it.price?`<div class="accprice">${it.price}</div>`:''}</div>`).join('');
    focus = `<div class="accgrid">${items}</div>`;
    footer = `<div class="rule"></div><div class="caption-el">${s.caption||'the finishing touches'}</div>`;
  } else if(s.type==='editorial'){
    bleed = true;
    const capLight = (s.capLight!==undefined)? s.capLight : true;
    focus = `<div class="edfull"><img src="${s.img}"></div>
      ${(s.title||s.caption)?`<div class="edcapwrap ${capLight?'light':''}">
        ${s.title?`<div class="edcap-title">${s.title}</div>`:''}
        ${s.caption?`<div class="edcap">${s.caption}</div>`:''}</div>`:''}`;
  } else if(s.type==='quote'){
    header = `${mono}${s.eyebrow?`<div class="eyebrow">${s.eyebrow}</div>`:''}`;
    focus = `<div style="flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div class="quote"><span class="mk">“</span>${s.text}<span class="mk">”</span></div>
      ${s.attr?`<div class="qattr">${s.attr}</div>`:''}</div>`;
  } else if(s.type==='tip'){
    header = `${mono}<div class="eyebrow">${s.eyebrow||'STYLING NOTES'}</div>`;
    const items = (s.items||[]).map((it,i)=>`<div class="tipitem">
      <div class="tipnum">${String(i+1).padStart(2,'0')}</div>
      <div class="tiptext">${typeof it==='string'?it:it.text}</div></div>`).join('');
    focus = `<div style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;width:100%;">
      ${s.title?`<div class="title t-md" style="margin-bottom:46px;">${s.title}</div>`:''}
      <div class="tipwrap">${items}</div></div>`;
    footer = s.hint?`<div class="rule"></div><div class="hint">${s.hint}</div>`:'';
  } else if(s.type==='stat'){
    header = `${mono}<div class="eyebrow">${s.eyebrow||''}</div>`;
    focus = `<div style="flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
      <div class="statnum">${s.number}</div>
      <div class="statlabel">${s.label||''}</div>
      ${s.sub?`<div class="statsub">${s.sub}</div>`:''}</div>`;
  } else if(s.type==='cta'){
    header = `<div class="eyebrow">${s.eyebrow||''}</div>`;
    const lk = `<img class="lockup" src="data:image/png;base64,${light&&lockupLight?lockupLight:lockup}" style="margin:auto">`;
    focus = lk;
    const ctabtn = s.keyword ? `<div class="ctabtn">COMMENT ${s.keyword}</div>`
      : (s.subtitle?`<div class="ctasub">${s.subtitle}</div>`:'');
    footer = `<div class="rule"></div>
      <div class="title ${s.size||'t-lg'}">${s.title||'SHOP THE LOOK'}</div>
      ${ctabtn}`;
  }
  const style = `${themeVars(s.theme)}`;
  if(bleed){
    return `<div class="slide bleed" style="${style}">${focus}</div>`;
  }
  return `<div class="slide ${cls}" style="${style}"><div class="header">${header}</div>
    <div class="focus">${focus}</div>
    <div class="footer">${footer}</div></div>`;
}

function toDataURI(p){
  if(!p || p.startsWith('http') || p.startsWith('data:')) return p;
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext==='png'?'image/png':(ext==='jpg'||ext==='jpeg')?'image/jpeg':'image/png';
  return `data:${mime};base64,${B(p)}`;
}

(async ()=>{
  const slides = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  slides.forEach(s=>{ if(s.img) s.img = toDataURI(s.img); if(s.items) s.items.forEach(it=>{ if(it.img) it.img = toDataURI(it.img); }); });
  const outdir = process.argv[3]||'assets/out';
  fs.mkdirSync(outdir,{recursive:true});
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
  for(let i=0;i<slides.length;i++){
    const html=`<!doctype html><html><head><meta charset="utf8"><style>${CSS}</style></head>
      <body>${slideHTML(slides[i])}</body></html>`;
    await page.setContent(html,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const n=String(i+1).padStart(2,'0');
    await page.locator('.slide').screenshot({path:path.join(outdir,`slide_${n}.png`)});
    console.log('rendered slide',n,slides[i].type, slides[i].theme||'warm');
  }
  await browser.close();
})();
