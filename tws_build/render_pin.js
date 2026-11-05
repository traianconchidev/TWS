// TWS Pinterest pin render — 1080x1620 (2:3), minimalist, flat-lay hero
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const B = (p) => fs.readFileSync(p).toString('base64');
const FONT = (f) => B(path.join('node_modules/@fontsource', f));
const cinzel600 = FONT('cinzel/files/cinzel-latin-600-normal.woff2');
const mont300 = FONT('montserrat/files/montserrat-latin-300-normal.woff2');
const mont400 = FONT('montserrat/files/montserrat-latin-400-normal.woff2');
const monogram = B('assets/tws_monogram.png');

const CSS = `
@font-face{font-family:'Cinzel';font-weight:600;src:url(data:font/woff2;base64,${cinzel600}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:300;src:url(data:font/woff2;base64,${mont300}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:400;src:url(data:font/woff2;base64,${mont400}) format('woff2');}
:root{--ink:#1B2327;--bg:#F6F5F3;--accent:#C5B6A5;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1620px;background:var(--bg);}
.pin{width:1080px;height:1620px;background:var(--bg);position:relative;
  display:flex;flex-direction:column;align-items:center;padding:64px 60px 70px;overflow:hidden;}
.header{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:14px;}
.mono{height:58px;}
.eyebrow{font-family:'Montserrat';font-weight:300;font-size:21px;letter-spacing:.42em;
  color:var(--ink);text-transform:uppercase;padding-left:.42em;}
.hero{flex:1 1 auto;display:flex;align-items:center;justify-content:center;width:100%;min-height:0;margin:30px 0;}
.hero img{max-width:100%;max-height:100%;object-fit:contain;display:block;
  filter:drop-shadow(0 26px 44px rgba(27,35,39,.16));}
.footer{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;}
.rule{width:66px;height:1px;background:var(--ink);opacity:.5;}
.title{font-family:'Cinzel';font-weight:600;color:var(--ink);text-transform:uppercase;
  letter-spacing:.2em;text-align:center;padding-left:.2em;line-height:1.1;font-size:70px;}
.subtitle{font-family:'Montserrat';font-weight:400;color:var(--accent);
  letter-spacing:.14em;text-align:center;font-size:28px;text-transform:lowercase;}
.cta{display:inline-flex;align-items:center;gap:14px;background:var(--ink);color:var(--bg);
  font-family:'Montserrat';font-weight:500;font-size:24px;letter-spacing:.3em;text-transform:uppercase;
  padding:22px 50px 22px 56px;border-radius:48px;margin-top:10px;
  box-shadow:0 14px 30px rgba(27,35,39,.22);}
.cta .arrow{font-weight:400;letter-spacing:0;opacity:.9;}
`;

function toDataURI(p){
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext==='png'?'image/png':(ext==='jpg'||ext==='jpeg')?'image/jpeg':'image/png';
  return `data:${mime};base64,${B(p)}`;
}

const PINS = [
  {out:'pin_luxe.png', eyebrow:'THE EDIT · 9 TO 5 LUXE', title:'9 TO 5 LUXE', subtitle:'quiet-luxury workwear', hint:'shop the edit', img:'/home/claude/look1c/raw/flatlay.png'},
  {out:'pin_offduty.png', eyebrow:'THE EDIT · OFF-DUTY', title:'OFF-DUTY CASUAL', subtitle:'ease that reads expensive', hint:'shop the edit', img:'/home/claude/look2/flatlay_v2.png'},
  {out:'pin_studio.png', eyebrow:'THE EDIT · STUDIO NOIR', title:'STUDIO NOIR', subtitle:'evening, quietly done', hint:'shop the edit', img:'/home/claude/look3/flatlay_light2.png'},
];

function pinHTML(p){
  return `<div class="pin">
    <div class="header"><img class="mono" src="data:image/png;base64,${monogram}"><div class="eyebrow">${p.eyebrow}</div></div>
    <div class="hero"><img src="${toDataURI(p.img)}"></div>
    <div class="footer"><div class="rule"></div>
      <div class="title">${p.title}</div>
      <div class="subtitle">${p.subtitle}</div>
      <div class="cta">${p.hint}<span class="arrow">→</span></div></div>
  </div>`;
}

(async ()=>{
  let pins = PINS, outdir = process.argv[2]||'pins';
  if(process.argv[2] && process.argv[2].endsWith('.json')){
    pins = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
    outdir = process.argv[3]||'pins';
  }
  fs.mkdirSync(outdir,{recursive:true});
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1080,height:1620},deviceScaleFactor:2});
  for(const p of pins){
    const html=`<!doctype html><html><head><meta charset="utf8"><style>${CSS}</style></head><body>${pinHTML(p)}</body></html>`;
    await page.setContent(html,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.pin').screenshot({path:path.join(outdir,p.out)});
    console.log('rendered', p.out);
  }
  await browser.close();
})();
