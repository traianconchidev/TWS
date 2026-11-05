// TWS Pinterest pin — 3-look triptych (1080x1620, 2:3). "One skirt, three ways".
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const B = (p) => fs.readFileSync(p).toString('base64');
const FONT = (f) => B(path.join('node_modules/@fontsource', f));
const cinzel600 = FONT('cinzel/files/cinzel-latin-600-normal.woff2');
const mont300 = FONT('montserrat/files/montserrat-latin-300-normal.woff2');
const mont400 = FONT('montserrat/files/montserrat-latin-400-normal.woff2');
const mont500 = FONT('montserrat/files/montserrat-latin-500-normal.woff2');
const monogram = B('assets/tws_monogram.png');

const toURI = (p) => {
  const e = path.extname(p).slice(1).toLowerCase();
  const m = e === 'png' ? 'image/png' : 'image/jpeg';
  return `data:${m};base64,${B(p)}`;
};

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outdir = process.argv[3] || 'pins';

const CSS = `
@font-face{font-family:'Cinzel';font-weight:600;src:url(data:font/woff2;base64,${cinzel600}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:300;src:url(data:font/woff2;base64,${mont300}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:400;src:url(data:font/woff2;base64,${mont400}) format('woff2');}
@font-face{font-family:'Montserrat';font-weight:500;src:url(data:font/woff2;base64,${mont500}) format('woff2');}
:root{--ink:#1B2327;--bg:#F6F5F3;--accent:#C5B6A5;}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1620px;background:var(--bg);}
.pin{width:1080px;height:1620px;background:var(--bg);position:relative;
  display:flex;flex-direction:column;align-items:center;padding:56px 54px 60px;overflow:hidden;}
.header{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;}
.mono{height:52px;}
.eyebrow{font-family:'Montserrat';font-weight:300;font-size:20px;letter-spacing:.42em;
  color:var(--ink);text-transform:uppercase;padding-left:.42em;}
.trio{flex:1 1 auto;display:flex;gap:12px;width:100%;min-height:0;margin:26px 0 22px;}
.col{flex:1;display:flex;flex-direction:column;min-height:0;}
.ph{flex:1 1 auto;overflow:hidden;min-height:0;background:#EAE7E1;}
.ph img{width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;}
.clabel{flex:0 0 auto;font-family:'Montserrat';font-weight:400;font-size:17px;letter-spacing:.24em;
  color:var(--ink);text-transform:uppercase;text-align:center;padding:12px 0 2px;padding-left:.24em;}
.footer{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;}
.rule{width:60px;height:1px;background:var(--ink);opacity:.5;}
.title{font-family:'Cinzel';font-weight:600;color:var(--ink);text-transform:uppercase;
  letter-spacing:.18em;text-align:center;padding-left:.18em;line-height:1.08;font-size:58px;}
.subtitle{font-family:'Montserrat';font-weight:400;color:var(--accent);
  letter-spacing:.14em;text-align:center;font-size:25px;text-transform:lowercase;}
.cta{display:inline-flex;align-items:center;gap:14px;background:var(--ink);color:var(--bg);
  font-family:'Montserrat';font-weight:500;font-size:23px;letter-spacing:.3em;text-transform:uppercase;
  padding:20px 46px 20px 52px;border-radius:46px;margin-top:6px;
  box-shadow:0 14px 30px rgba(27,35,39,.22);}
.cta .arrow{font-weight:400;letter-spacing:0;opacity:.9;}
`;

const cols = cfg.looks.map(l => `
  <div class="col"><div class="ph"><img src="${toURI(l.img)}"></div>
  <div class="clabel">${l.label}</div></div>`).join('');

const html = `<!doctype html><html><head><meta charset="utf8"><style>${CSS}</style></head>
<body><div class="pin">
  <div class="header"><img class="mono" src="data:image/png;base64,${monogram}"><div class="eyebrow">${cfg.eyebrow}</div></div>
  <div class="trio">${cols}</div>
  <div class="footer"><div class="rule"></div>
    <div class="title">${cfg.title}</div>
    <div class="subtitle">${cfg.subtitle}</div>
    <div class="cta">${cfg.hint}<span class="arrow">→</span></div></div>
</div></body></html>`;

(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1620 }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.pin').screenshot({ path: path.join(outdir, cfg.out) });
  console.log('rendered', cfg.out);
  await browser.close();
})();
