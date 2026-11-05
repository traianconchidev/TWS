// TWS Pinterest multi-format render — 1080x1620 (2:3), quiet-luxury editorial.
// Usage: node render_pin_fmt.js <pins.json> [outdir]
// Each item: { format: 'colorstory'|'capsule'|'styling'|'colorcode', out:'x.png', ... }
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

const CSS = `
@font-face{font-family:'Cinzel';font-weight:400;src:url(data:font/woff2;base64,${cinzel400}) format('woff2');}
@font-face{font-family:'Cinzel';font-weight:600;src:url(data:font/woff2;base64,${cinzel600}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:300;src:url(data:font/woff2;base64,${mont300}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:400;src:url(data:font/woff2;base64,${mont400}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:500;src:url(data:font/woff2;base64,${mont500}) format('woff2');}
:root{--ink:#1B2327;--bg:#F6F5F3;--accent:#C5B6A5;--tile:#ECEAE4;--line:#D9D4CB;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1620px;background:var(--bg);}
.pin{width:1080px;height:1620px;background:var(--bg);position:relative;
  display:flex;flex-direction:column;align-items:center;padding:60px 60px 64px;overflow:hidden;}
.header{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:13px;}
.mono{height:52px;}
.eyebrow{font-family:'Montserrat';font-weight:300;font-size:20px;letter-spacing:.42em;
  color:var(--ink);text-transform:uppercase;padding-left:.42em;}
.footer{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;}
.rule{width:60px;height:1px;background:var(--ink);opacity:.45;}
.title{font-family:'Cinzel';font-weight:600;color:var(--ink);text-transform:uppercase;
  letter-spacing:.16em;text-align:center;padding-left:.16em;line-height:1.12;font-size:58px;}
.subtitle{font-family:'Montserrat';font-weight:400;color:var(--accent);
  letter-spacing:.14em;text-align:center;font-size:25px;text-transform:lowercase;}
.cta{display:inline-flex;align-items:center;gap:13px;background:var(--ink);color:var(--bg);
  font-family:'Montserrat';font-weight:500;font-size:22px;letter-spacing:.3em;text-transform:uppercase;
  padding:19px 44px 19px 50px;border-radius:44px;margin-top:6px;box-shadow:0 12px 26px rgba(27,35,39,.20);}
.cta .arrow{font-weight:400;letter-spacing:0;opacity:.9;}
.body{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;min-height:0;gap:34px;margin:26px 0;}

/* swatches (colorstory) */
.swatches{display:flex;width:100%;gap:18px;height:360px;}
.sw{flex:1 1 0;border-radius:10px;position:relative;display:flex;flex-direction:column;justify-content:flex-end;
  padding:26px;box-shadow:0 16px 34px rgba(27,35,39,.14);}
.sw .nm{font-family:'Cinzel';font-weight:600;font-size:34px;letter-spacing:.08em;text-transform:uppercase;line-height:1;}
.sw .hx{font-family:'Montserrat';font-weight:400;font-size:19px;letter-spacing:.22em;margin-top:9px;opacity:.86;}
.looks3{display:flex;width:100%;gap:16px;height:470px;}
.looks3 .lk{flex:1 1 0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;padding:8px;position:relative;}
.looks3 .lk img{width:100%;height:100%;object-fit:contain;object-position:center;}
.stlab{position:absolute;left:0;right:0;bottom:0;padding:16px 14px 13px;
  background:linear-gradient(to top,rgba(27,35,39,.72),rgba(27,35,39,0));
  font-family:'Montserrat';font-weight:500;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:var(--bg);text-align:center;}

/* styling hero piece */
.herobox{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}
.herotag{font-family:'Montserrat';font-weight:300;font-size:18px;letter-spacing:.4em;text-transform:uppercase;color:var(--accent);}
.heroimg{width:380px;height:300px;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;padding:10px;box-shadow:0 12px 28px rgba(27,35,39,.12);}
.heroimg img{width:100%;height:100%;object-fit:contain;object-position:center;}

/* capsule pairs (model top / flat-lay bottom, per outfit column) */
.caps{display:flex;width:100%;height:100%;gap:18px;}
.capcol{flex:1 1 0;display:flex;flex-direction:column;gap:12px;min-height:0;}
.capcol .m{flex:1.7 1 0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;padding:8px;min-height:0;}
.capcol .f{flex:1 1 0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;padding:8px;min-height:0;}
.capcol .m img,.capcol .f img{width:100%;height:100%;object-fit:contain;object-position:center;}
.caplab{flex:0 0 auto;text-align:center;font-family:'Montserrat';font-weight:500;font-size:19px;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink);padding-top:3px;}

/* palette strip (palette format) */
.pstrip{display:flex;width:100%;gap:12px;height:72px;flex:0 0 auto;}
.pstrip .psw{flex:1 1 0;border-radius:8px;display:flex;align-items:center;justify-content:center;
  font-family:'Montserrat';font-weight:500;font-size:21px;letter-spacing:.2em;text-transform:uppercase;box-shadow:0 8px 20px rgba(27,35,39,.12);}

/* capsule grid */
.grid{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:16px;width:100%;height:100%;}
.grid.g3{grid-template-columns:1fr 1fr 1fr;}
.cell{background:var(--tile);border-radius:8px;overflow:hidden;position:relative;display:flex;padding:8px;}
.cell img{width:100%;height:100%;object-fit:contain;object-position:center;}
.cell .num{position:absolute;top:14px;left:16px;font-family:'Cinzel';font-weight:600;font-size:26px;
  color:var(--bg);text-shadow:0 2px 10px rgba(0,0,0,.4);letter-spacing:.04em;}
.cell .lab{position:absolute;left:0;right:0;bottom:0;padding:16px 18px 14px;
  background:linear-gradient(to top,rgba(27,35,39,.72),rgba(27,35,39,0));
  font-family:'Montserrat';font-weight:500;font-size:20px;letter-spacing:.2em;text-transform:uppercase;color:var(--bg);}

/* colorcode — look image dominant, color box smaller accent */
.codeblock{width:100%;height:300px;flex:0 0 auto;border-radius:12px;display:flex;flex-direction:column;justify-content:center;
  align-items:center;gap:12px;box-shadow:0 14px 32px rgba(27,35,39,.16);position:relative;}
.codeblock .cnm{font-family:'Cinzel';font-weight:600;font-size:64px;letter-spacing:.08em;text-transform:uppercase;line-height:1;}
.codeblock .code{font-family:'Montserrat';font-weight:400;font-size:21px;letter-spacing:.34em;opacity:.85;}
.codeblock .tagtop{position:absolute;top:22px;left:0;right:0;text-align:center;font-family:'Montserrat';
  font-weight:300;font-size:17px;letter-spacing:.4em;text-transform:uppercase;opacity:.7;}
.proof{width:100%;flex:1 1 auto;min-height:0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;padding:10px;}
.proof img{width:100%;height:100%;object-fit:contain;object-position:center;}
`;

function toDataURI(p){
  if(!p || !fs.existsSync(p)) return null;
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext==='png'?'image/png':(ext==='jpg'||ext==='jpeg')?'image/jpeg':'image/png';
  return `data:${mime};base64,${B(p)}`;
}
const imgTag = (p,cls='') => { const u=toDataURI(p); return u?`<img class="${cls}" src="${u}">`:''; };
// readable text color on a hex background
function txtOn(hex){ const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return (0.299*r+0.587*g+0.114*b) > 150 ? '#1B2327' : '#F6F5F3'; }

const header = (eyebrow) =>
  `<div class="header"><img class="mono" src="data:image/png;base64,${monogram}"><div class="eyebrow">${eyebrow||''}</div></div>`;
const footer = (title,subtitle,hint) =>
  `<div class="footer"><div class="rule"></div><div class="title">${title||''}</div>`+
  (subtitle?`<div class="subtitle">${subtitle}</div>`:'')+
  (hint?`<div class="cta">${hint}<span class="arrow">→</span></div>`:'')+`</div>`;

function colorstory(p){
  const sw = (p.swatches||[]).slice(0,3).map(s=>{
    const tc = txtOn(s.hex);
    return `<div class="sw" style="background:${s.hex};color:${tc}"><div class="nm">${s.name||''}</div><div class="hx">${s.hex.toUpperCase()}</div></div>`;
  }).join('');
  const looks = (p.looks||[]).slice(0,3).map(i=>`<div class="lk">${imgTag(i)}</div>`).join('');
  return `<div class="pin">${header(p.eyebrow||'COLOR STORY')}
    <div class="body"><div class="swatches">${sw}</div>${looks?`<div class="looks3">${looks}</div>`:''}</div>
    ${footer(p.title,p.subtitle,p.hint||'shop the palette')}</div>`;
}

function capsule(p){
  // outfits: each a column — model on top (larger), flat-lay below, label under. Title N = distinct outfits.
  const outfits = (p.outfits||[]).slice(0,4);
  const cols = outfits.map((o,i)=>
    `<div class="capcol">
      <div class="m">${imgTag(o.model)}</div>
      <div class="f">${imgTag(o.flat)}</div>
      <div class="caplab">${o.label||('LOOK '+String(i+1).padStart(2,'0'))}</div>
    </div>`).join('');
  return `<div class="pin">${header(p.eyebrow||'CAPSULE WARDROBE')}
    <div class="body"><div class="caps">${cols}</div></div>
    ${footer(p.title||((outfits.length||3)+' WAYS'),p.subtitle,p.hint||'shop the capsule')}</div>`;
}

function styling(p){
  // one hero piece shown alone, then the SAME piece styled into N different outfits (on model), labelled by occasion.
  const ways = (p.ways||[]).slice(0,4);
  const looks = ways.map(w=>`<div class="lk">${imgTag(w.img)}${w.label?`<div class="stlab">${w.label}</div>`:''}</div>`).join('');
  const hero = p.hero?`<div class="herobox"><div class="herotag">${p.heroLabel||'THE PIECE'}</div><div class="heroimg">${imgTag(p.hero)}</div></div>`:'';
  return `<div class="pin">${header(p.eyebrow||'STYLING GUIDE')}
    <div class="body">${hero}<div class="looks3">${looks}</div></div>
    ${footer(p.title||('STYLED '+ways.length+' WAYS'),p.subtitle,p.hint||'shop the looks')}</div>`;
}

function colorcode(p){
  const tc = txtOn(p.swatch||'#5B2A38');
  return `<div class="pin">${header(p.eyebrow||'COLOR OF THE SEASON')}
    <div class="body">
      <div class="codeblock" style="background:${p.swatch};color:${tc}">
        <div class="tagtop">${p.tag||'pantone-inspired · 2026'}</div>
        <div class="cnm">${p.name||''}</div>${p.code?`<div class="code">${p.code}</div>`:''}
      </div>
      ${p.look?`<div class="proof">${imgTag(p.look)}</div>`:''}
    </div>
    ${footer(p.title||p.name,p.subtitle,p.hint||'shop the shade')}</div>`;
}

function palette(p){
  const sw = (p.swatches||[]).slice(0,3).map(s=>{
    const tc = txtOn(s.hex);
    return `<div class="psw" style="background:${s.hex};color:${tc}">${s.name||''}</div>`;
  }).join('');
  const cells = (p.cells||[]).slice(0,6);
  const html = cells.map((c,i)=>`<div class="cell"><span class="num">${c.num||String(i+1).padStart(2,'0')}</span>${imgTag(c.img)}${c.label?`<div class="lab">${c.label}</div>`:''}</div>`).join('');
  return `<div class="pin">${header(p.eyebrow||'ONE PALETTE')}
    <div class="body">
      ${sw?`<div class="pstrip">${sw}</div>`:''}
      <div class="grid g3" style="flex:1 1 auto;min-height:0;height:auto;">${html}</div>
    </div>
    ${footer(p.title||'6 WAYS · ONE PALETTE',p.subtitle,p.hint||'shop the palette')}</div>`;
}

const BUILD = { colorstory, capsule, styling, colorcode, palette };

(async ()=>{
  const inFile = process.argv[2];
  if(!inFile || !inFile.endsWith('.json')){ console.error('pass a pins.json'); process.exit(1); }
  const pins = JSON.parse(fs.readFileSync(inFile,'utf8'));
  const outdir = process.argv[3]||'pins_fmt';
  fs.mkdirSync(outdir,{recursive:true});
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1080,height:1620},deviceScaleFactor:2});
  for(const p of pins){
    const fn = BUILD[p.format];
    if(!fn){ console.error('unknown format', p.format); continue; }
    const html=`<!doctype html><html><head><meta charset="utf8"><style>${CSS}</style></head><body>${fn(p)}</body></html>`;
    await page.setContent(html,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.pin').screenshot({path:path.join(outdir,p.out)});
    console.log('rendered', p.format, '→', p.out);
  }
  await browser.close();
})();
