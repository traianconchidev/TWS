// TWS Pinterest multi-format render — 1080x1620 (2:3), quiet-luxury editorial.
// Usage: node render_pin_fmt.js <pins.json> [outdir]
// Formats: 'flatlay' | 'colorstory' | 'moodboard' | 'capsule' | 'styling' | 'colorcode' | 'palette'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const B = (p) => fs.readFileSync(p).toString('base64');
const FONT = (f) => B(path.join('node_modules/@fontsource', f));
const pf400 = FONT('playfair-display/files/playfair-display-latin-400-normal.woff2');
const pf500 = FONT('playfair-display/files/playfair-display-latin-500-normal.woff2');
const pf600 = FONT('playfair-display/files/playfair-display-latin-600-normal.woff2');
const mont300 = FONT('montserrat/files/montserrat-latin-300-normal.woff2');
const mont400 = FONT('montserrat/files/montserrat-latin-400-normal.woff2');
const mont500 = FONT('montserrat/files/montserrat-latin-500-normal.woff2');
const mont600 = FONT('montserrat/files/montserrat-latin-600-normal.woff2');
const monogram = B('assets/tws_monogram.png');

const CSS = `
@font-face{font-family:'Playfair';font-weight:400;src:url(data:font/woff2;base64,${pf400}) format('woff2');}
@font-face{font-family:'Playfair';font-weight:500;src:url(data:font/woff2;base64,${pf500}) format('woff2');}
@font-face{font-family:'Playfair';font-weight:600;src:url(data:font/woff2;base64,${pf600}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:300;src:url(data:font/woff2;base64,${mont300}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:400;src:url(data:font/woff2;base64,${mont400}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:500;src:url(data:font/woff2;base64,${mont500}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:600;src:url(data:font/woff2;base64,${mont600}) format('woff2');}
:root{--ink:#1F262A;--bg:#F5F2EE;--paper:#EFEBE4;--accent:#B79A74;--tile:#E7E2D9;--line:#DAD4C9;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1620px;}
.pin{width:1080px;height:1620px;background:
   radial-gradient(120% 90% at 50% 0%, #FAF8F4 0%, var(--bg) 55%, var(--paper) 100%);
  position:relative;display:flex;flex-direction:column;align-items:center;padding:56px 58px 60px;overflow:hidden;}
.header{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;z-index:5;}
.mono{height:50px;}
.eyebrow{font-family:'Montserrat';font-weight:400;font-size:19px;letter-spacing:.44em;
  color:var(--ink);text-transform:uppercase;padding-left:.44em;opacity:.82;}
.footer{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:15px;width:100%;z-index:5;}
.rule{width:54px;height:1px;background:var(--accent);}
.title{font-family:'Playfair';font-weight:500;color:var(--ink);
  letter-spacing:.01em;text-align:center;line-height:1.08;font-size:62px;}
.title.caps{text-transform:uppercase;letter-spacing:.06em;font-size:54px;}
.subtitle{font-family:'Montserrat';font-weight:400;color:var(--accent);
  letter-spacing:.16em;text-align:center;font-size:24px;text-transform:lowercase;}
.cta{display:inline-flex;align-items:center;gap:13px;background:var(--ink);color:var(--bg);
  font-family:'Montserrat';font-weight:500;font-size:21px;letter-spacing:.3em;text-transform:uppercase;
  padding:18px 42px 18px 48px;border-radius:44px;margin-top:4px;box-shadow:0 14px 28px rgba(31,38,42,.22);}
.cta .arrow{font-weight:400;letter-spacing:0;opacity:.9;}
.body{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;min-height:0;}

/* ---- FLATLAY (overlapping editorial) ---- */
.stage{position:relative;width:100%;flex:1 1 auto;min-height:0;margin:14px 0;}
.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.42;z-index:0;}
.fl{position:absolute;display:flex;align-items:center;justify-content:center;z-index:2;}
.fl img{max-width:100%;max-height:100%;object-fit:contain;
  filter:drop-shadow(0 18px 26px rgba(31,38,42,.20));}

/* ---- COLORSTORY / MOODBOARD (tiles + Pantone chips) ---- */
.csgrid{position:relative;width:100%;flex:1 1 auto;min-height:0;display:grid;gap:14px;}
.csgrid.g4{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;}
.csgrid.g3{grid-template-columns:1fr 1fr;grid-template-rows:1.25fr 1fr;}
.cstile{background:var(--tile);border-radius:10px;overflow:hidden;box-shadow:0 8px 22px rgba(31,38,42,.08);}
.cstile.span2{grid-column:span 2;}
.cstile img{width:100%;height:100%;object-fit:cover;object-position:center top;}
.chips{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:18px;z-index:4;}
.chip{background:#fff;border-radius:6px;padding:13px 13px 15px;box-shadow:0 18px 38px rgba(31,38,42,.26);width:162px;}
.chip .block{height:128px;border-radius:3px;}
.chip .pt{font-family:'Montserrat';font-weight:600;font-size:12px;letter-spacing:.16em;margin-top:11px;color:#1F262A;}
.chip .nm{font-family:'Montserrat';font-weight:500;font-size:17px;margin-top:3px;color:#1F262A;text-transform:capitalize;}
.chip .hx{font-family:'Montserrat';font-weight:300;font-size:12px;letter-spacing:.12em;color:#8C877D;margin-top:2px;}
.plus{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:5;
  font-family:'Playfair';font-weight:400;font-size:40px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.35);}

/* ---- existing: capsule / styling / colorcode / palette ---- */
.looks3{display:flex;width:100%;gap:16px;height:470px;}
.looks3 .lk{flex:1 1 0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;position:relative;}
.looks3 .lk img{width:100%;height:100%;object-fit:cover;object-position:center top;}
.stlab{position:absolute;left:0;right:0;bottom:0;padding:16px 14px 13px;
  background:linear-gradient(to top,rgba(31,38,42,.72),rgba(31,38,42,0));
  font-family:'Montserrat';font-weight:500;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:#fff;text-align:center;}
.herobox{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;margin-bottom:24px;}
.herotag{font-family:'Montserrat';font-weight:300;font-size:18px;letter-spacing:.4em;text-transform:uppercase;color:var(--accent);}
.heroimg{width:420px;height:300px;display:flex;}
.heroimg img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;filter:drop-shadow(0 12px 22px rgba(31,38,42,.14));}
.caps{display:flex;width:100%;height:100%;gap:18px;}
.capcol{flex:1 1 0;display:flex;flex-direction:column;gap:12px;min-height:0;}
.capcol .m{flex:1.7 1 0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;min-height:0;}
.capcol .f{flex:1 1 0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;min-height:0;}
.capcol .m img{width:100%;height:100%;object-fit:cover;object-position:center top;}
.capcol .f img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;}
.caplab{flex:0 0 auto;text-align:center;font-family:'Montserrat';font-weight:500;font-size:19px;
  letter-spacing:.16em;text-transform:uppercase;color:var(--ink);padding-top:3px;}
.codeblock{width:100%;height:300px;flex:0 0 auto;border-radius:12px;display:flex;flex-direction:column;justify-content:center;
  align-items:center;gap:12px;box-shadow:0 16px 34px rgba(31,38,42,.18);position:relative;margin-bottom:22px;}
.codeblock .cnm{font-family:'Playfair';font-weight:600;font-size:66px;letter-spacing:.02em;line-height:1;}
.codeblock .code{font-family:'Montserrat';font-weight:400;font-size:21px;letter-spacing:.34em;opacity:.85;}
.codeblock .tagtop{position:absolute;top:22px;left:0;right:0;text-align:center;font-family:'Montserrat';
  font-weight:300;font-size:17px;letter-spacing:.4em;text-transform:uppercase;opacity:.7;}
.proof{width:100%;flex:1 1 auto;min-height:0;background:var(--tile);border-radius:8px;overflow:hidden;display:flex;}
.proof img{width:100%;height:100%;object-fit:cover;object-position:center top;}
`;

function toDataURI(p){
  if(!p || !fs.existsSync(p)) return null;
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext==='png'?'image/png':(ext==='jpg'||ext==='jpeg')?'image/jpeg':'image/png';
  return `data:${mime};base64,${B(p)}`;
}
const imgTag = (p,cls='') => { const u=toDataURI(p); return u?`<img class="${cls}" src="${u}">`:''; };
function txtOn(hex){ const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return (0.299*r+0.587*g+0.114*b) > 150 ? '#1F262A' : '#F6F5F3'; }

const header = (eyebrow) =>
  `<div class="header"><img class="mono" src="data:image/png;base64,${monogram}"><div class="eyebrow">${eyebrow||''}</div></div>`;
const footer = (title,subtitle,hint,caps) =>
  `<div class="footer"><div class="rule"></div><div class="title${caps?' caps':''}">${title||''}</div>`+
  (subtitle?`<div class="subtitle">${subtitle}</div>`:'')+
  (hint?`<div class="cta">${hint}<span class="arrow">→</span></div>`:'')+`</div>`;

// FLATLAY — hero piece large + supporting pieces overlapping, white dropped via multiply.
// p.pieces = [imgPath,...] ordered hero-first. p.accent = hex (subtle color blob).
const FL_SLOTS = [
  {left:70, top:150, w:540, h:700, rot:-3, z:3},   // hero (coat/blazer)
  {left:560,top:70,  w:430, h:770, rot:3,  z:2},   // bottoms (trousers/jeans)
  {left:355,top:40,  w:380, h:430, rot:-2, z:4},   // top/knit (tucked at collar)
  {left:95, top:710, w:330, h:320, rot:-6, z:5},   // bag
  {left:575,top:730, w:400, h:300, rot:5,  z:5},   // shoes
  {left:430,top:470, w:250, h:250, rot:2,  z:6},   // scarf/accessory
  {left:150,top:470, w:200, h:200, rot:-4, z:6},   // jewelry
];
function flatlay(p){
  const pieces = (p.pieces||[]).slice(0,FL_SLOTS.length);
  const blob = p.accent?`<div class="blob" style="left:180px;top:300px;width:620px;height:620px;background:${p.accent};"></div>`:'';
  const els = pieces.map((img,i)=>{ const s=FL_SLOTS[i];
    return `<div class="fl" style="left:${s.left}px;top:${s.top}px;width:${s.w}px;height:${s.h}px;transform:rotate(${s.rot}deg);z-index:${s.z};">${imgTag(img)}</div>`;
  }).join('');
  return `<div class="pin">${header(p.eyebrow||'THE EDIT')}
    <div class="body"><div class="stage">${blob}${els}</div></div>
    ${footer(p.title,p.subtitle,p.hint||'shop the look')}</div>`;
}

// COLORSTORY — 2x2 (or hero) tiles of outfits/texture + Pantone chips center + big 2-color title.
// p.tiles=[img,...] (2-4), p.swatches=[{name,hex}], p.title e.g. "Stone & Noir"
function colorstory(p){
  const tiles = (p.tiles||p.looks||[]).slice(0,4);
  const grid = tiles.map((t,i)=>`<div class="cstile">${imgTag(t)}</div>`).join('');
  const sw = (p.swatches||[]).slice(0,2);
  const chips = sw.map(s=>`<div class="chip"><div class="block" style="background:${s.hex}"></div>
      <div class="pt">PANTONE&reg;</div><div class="nm">${s.name||''}</div><div class="hx">${s.hex.toUpperCase()}</div></div>`).join('');
  const gridCls = tiles.length>=4?'g4':(tiles.length===3?'g3':'g4');
  const spanFix = tiles.length===3 ? `<style>.csgrid.g3 .cstile:first-child{grid-column:span 2;}</style>`:'';
  return `<div class="pin">${header(p.eyebrow||'COLOR STORY')}
    <div class="body"><div class="csgrid ${gridCls}">${grid}${chips?`<div class="chips">${chips}</div>`:''}</div>${spanFix}</div>
    ${footer(p.title,p.subtitle,p.hint||'shop the palette')}</div>`;
}

// MOODBOARD — alias of colorstory with a texture tile emphasis (same renderer, different tiles mix)
const moodboard = colorstory;

function capsule(p){
  const outfits = (p.outfits||[]).slice(0,4);
  const cols = outfits.map((o,i)=>
    `<div class="capcol"><div class="m">${imgTag(o.model)}</div><div class="f">${imgTag(o.flat)}</div>
      <div class="caplab">${o.label||('LOOK '+String(i+1).padStart(2,'0'))}</div></div>`).join('');
  return `<div class="pin">${header(p.eyebrow||'CAPSULE WARDROBE')}
    <div class="body"><div class="caps">${cols}</div></div>
    ${footer(p.title||((outfits.length||3)+' Ways'),p.subtitle,p.hint||'shop the capsule')}</div>`;
}
function styling(p){
  const ways = (p.ways||[]).slice(0,4);
  const looks = ways.map(w=>`<div class="lk">${imgTag(w.img)}${w.label?`<div class="stlab">${w.label}</div>`:''}</div>`).join('');
  const hero = p.hero?`<div class="herobox"><div class="herotag">${p.heroLabel||'THE PIECE'}</div><div class="heroimg">${imgTag(p.hero)}</div></div>`:'';
  return `<div class="pin">${header(p.eyebrow||'STYLING GUIDE')}
    <div class="body">${hero}<div class="looks3">${looks}</div></div>
    ${footer(p.title||('Styled '+ways.length+' Ways'),p.subtitle,p.hint||'shop the looks')}</div>`;
}
function colorcode(p){
  const tc = txtOn(p.swatch||'#5B2A38');
  return `<div class="pin">${header(p.eyebrow||'COLOR OF THE SEASON')}
    <div class="body"><div class="codeblock" style="background:${p.swatch};color:${tc}">
        <div class="tagtop">${p.tag||'pantone-inspired · 2026'}</div>
        <div class="cnm">${p.name||''}</div>${p.code?`<div class="code">${p.code}</div>`:''}</div>
      ${p.look?`<div class="proof">${imgTag(p.look)}</div>`:''}</div>
    ${footer(p.title||p.name,p.subtitle,p.hint||'shop the shade')}</div>`;
}
function palette(p){
  // reuse colorstory grid look: tiles + chips, title "6 Ways · One Palette"
  return colorstory(Object.assign({eyebrow:'ONE PALETTE', hint:'shop the palette'}, p, {title:p.title||'Six Ways, One Palette'}));
}

const BUILD = { flatlay, colorstory, moodboard, capsule, styling, colorcode, palette };

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
