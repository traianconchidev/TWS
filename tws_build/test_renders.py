#!/usr/bin/env python3
# Renders 1 real pin per collage template (2:3, 1080x1620) using real cutouts.
# Serif = DejaVuSerif stand-in for Playfair (production uses Playfair in the JS renderer).
import compose
from PIL import Image, ImageDraw, ImageFont

C="/tmp/claude-0/c"; OUT="/tmp/claude-0/pins_out"
W,H=1080,1620
INK=(31,38,42); PAPER=(247,245,242); CAMEL=(183,154,116); TILE=(239,236,230)
SOFT=(120,124,128); CREAM=(240,236,230); LINE=(214,205,191)
SER="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SERB="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SAN="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def F(p,s): return ImageFont.truetype(p,s)

def place(cv, name, cx, cy, w, sop=60, rot=0):
    im=Image.open(f"{C}/{name}.png").convert("RGBA")
    bb=im.getbbox(); im=im.crop(bb) if bb else im
    h=int(im.height*w/im.width); im=im.resize((w,max(1,h)),Image.LANCZOS)
    if rot: im=im.rotate(rot,expand=True,resample=Image.BICUBIC)
    x=int(cx-im.width/2); y=int(cy-im.height/2)
    cv.alpha_composite(compose.shadow(im,22,sop),(x+6,y+16))
    cv.alpha_composite(im,(x,y))
    return (x,y,x+im.width,y+im.height)

def base():
    im=Image.new("RGBA",(W,H),PAPER+(255,)); return im

def spaced(s): return "  ".join(list(s))

def monogram(d, y=78):
    d.text((W/2,y),spaced("TWS"),font=F(SERB,40),fill=INK,anchor="mm")
    d.line([W/2-60,y+34,W/2+60,y+34],fill=CAMEL,width=2)

def palette_dots(d, cx, cy, r=15, gap=42):
    cols=[INK,CAMEL,(214,205,191),(150,140,128),(240,236,230)]
    x=cx-(len(cols)-1)*gap/2
    for c in cols:
        d.ellipse([x-r,cy-r,x+r,cy+r],fill=c,outline=PAPER,width=2); x+=gap

def cta(d, text, y=1520):
    tw=d.textlength(text,font=F(SANB,24))
    x0=W/2-tw/2-34; x1=W/2+tw/2+34
    d.rounded_rectangle([x0,y-30,x1,y+30],radius=30,fill=INK)
    d.text((W/2,y),text,font=F(SANB,24),fill=PAPER,anchor="mm")

def flourish_title(d, title, sub, y=120):
    d.text((W/2,y),title,font=F(SERB,62),fill=INK,anchor="mm")
    if sub: d.text((W/2,y+52),sub,font=F(SER,26),fill=SOFT,anchor="mm")

# ---------- T1 EDITORIAL HERO ----------
def t1():
    im=base(); d=ImageDraw.Draw(im)
    monogram(d,70)
    flourish_title(d,"THE EDIT","quiet luxury · off-duty",150)
    place(im,"off_jeans",760,860,300)
    place(im,"off_knit",400,650,470)
    place(im,"off_bag",225,990,260)
    place(im,"off_loafers",390,1255,300)
    place(im,"off_earrings",665,470,120)
    palette_dots(d,W/2,1455)
    cta(d,"SHOP THE EDIT  →",1540)
    im.convert("RGB").save(f"{OUT}/t1_editorial.png"); print("t1 ok")

# ---------- T2 CLASSIC GRID ----------
def t2():
    im=base(); d=ImageDraw.Draw(im)
    d.text((54,60),spaced("TWS"),font=F(SERB,30),fill=INK)
    d.text((W-54,74),"THE EDIT",font=F(SER,24),fill=SOFT,anchor="rm")
    place(im,"off_knit",370,470,440)
    place(im,"off_earrings",840,340,140)
    place(im,"off_jeans",640,900,300)
    place(im,"off_bag",225,870,275)
    place(im,"off_loafers",330,1250,300)
    d.line([54,1486,W-54,1486],fill=LINE,width=1)
    d.text((W/2,1536),"timelesswardrobestudio.com",font=F(SAN,24),fill=SOFT,anchor="mm")
    im.convert("RGB").save(f"{OUT}/t2_grid.png"); print("t2 ok")

# ---------- T3 ASYM VERTICAL ----------
def t3():
    im=base(); d=ImageDraw.Draw(im)
    monogram(d,74)
    place(im,"off_jeans",300,850,330)
    place(im,"off_knit",745,560,440)
    place(im,"off_bag",790,960,255)
    place(im,"off_loafers",805,1255,285)
    place(im,"off_earrings",475,280,120)
    d.text((W/2,1536),"OFF-DUTY  ·  CREAM & COCOA",font=F(SANB,24),fill=INK,anchor="mm")
    im.convert("RGB").save(f"{OUT}/t3_asym.png"); print("t3 ok")

# ---------- T4 MODEL + FLAT-LAY ----------
def t4():
    im=base(); d=ImageDraw.Draw(im)
    monogram(d,70)
    flourish_title(d,"LOOK DAY","styled by TWS",150)
    place(im,"luxe_model",300,900,470,sop=52)
    d.line([565,320,565,1430],fill=LINE,width=1)
    place(im,"luxe_trousers",770,640,150)
    place(im,"luxe_tote",660,920,230)
    place(im,"luxe_flats",850,1230,250)
    place(im,"luxe_earrings",695,360,130)
    place(im,"luxe_belt",835,1050,250)
    palette_dots(d,W*0.72,1470)
    im.convert("RGB").save(f"{OUT}/t4_lookday.png"); print("t4 ok")

# ---------- T5 LABELED / SHOPPABLE ----------
# All labels stacked in the RIGHT column (ref: 783-like "OUTFIT INSPIRATION").
def label(d, box, text, colx=720):
    x0,y0,x1,y1=box
    cyc=(y0+y1)/2
    px=min(x1, colx-12)
    d.ellipse([px-5,cyc-5,px+5,cyc+5],fill=CAMEL)
    d.line([px,cyc,colx-6,cyc],fill=CAMEL,width=2)
    name,link=text
    d.text((colx,cyc-14),name,font=F(SANB,24),fill=INK,anchor="lm")
    d.text((colx,cyc+14),link,font=F(SAN,21),fill=CAMEL,anchor="lm")

def t5():
    im=base(); d=ImageDraw.Draw(im)
    monogram(d,70)
    flourish_title(d,"SHOP THE LOOK",None,146)
    b_ear =place(im,"off_earrings",520,360,110)
    b_hero=place(im,"off_knit",330,600,380)
    b_bag =place(im,"off_bag",250,960,230)
    b_bot =place(im,"off_jeans",470,1090,255)
    b_sho =place(im,"off_loafers",330,1330,250)
    label(d,b_ear,("Gold Hoops","Link →"))
    label(d,b_hero,("Oversized Knit","Link →"))
    label(d,b_bag,("Leather Bag","Link →"))
    label(d,b_bot,("Wide Jeans","Link →"))
    label(d,b_sho,("Loafers","Link →"))
    d.text((W/2,1540),"5 pieces  ·  tap to shop each",font=F(SAN,24),fill=SOFT,anchor="mm")
    im.convert("RGB").save(f"{OUT}/t5_labeled.png"); print("t5 ok")

for fn in (t1,t2,t3,t4,t5): fn()
print("done")
