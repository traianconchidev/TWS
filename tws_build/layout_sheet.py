#!/usr/bin/env python3
# TWS — 5 collage layout templates, rendered as labelled wireframes (2:3 pins).
from PIL import Image, ImageDraw, ImageFont

INK=(31,38,42); BG=(247,245,242); TILE=(233,229,222); CAMEL=(183,154,116)
LINE=(206,198,188); SOFT=(120,124,128); WHITE=(255,255,255)
SER="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SERB="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SAN="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SANB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def F(p,s): return ImageFont.truetype(p,s)

# box = (label, cx, cy, w, h) as fractions of the panel drawing area
L1=dict(name="1 · EDITORIAL HERO", tag="titlu serif + palette · cel mai mare reach",
    header=True, palette=True, boxes=[
    ("HERO",.35,.46,.42,.32),("BOTTOMS",.71,.63,.24,.46),
    ("BAG",.18,.70,.24,.17),("SHOES",.33,.90,.26,.12),("BIJU",.60,.30,.15,.10)])
L2=dict(name="2 · CLASSIC GRID", tag="workhorse · hero STG, accesorii DR, jos ancoră",
    header=False, palette=False, boxes=[
    ("HERO",.30,.32,.40,.30),("GLASSES+BIJU",.78,.22,.22,.12),
    ("BOTTOMS",.57,.64,.28,.50),("BAG",.18,.60,.26,.18),
    ("SHOES",.28,.87,.28,.13),("WATCH",.83,.46,.13,.12)])
L3=dict(name="3 · ASYM VERTICAL", tag="pantalon ancoră verticală · spațiu negativ elegant",
    header=False, palette=False, boxes=[
    ("BOTTOMS",.25,.56,.30,.66),("HERO",.70,.33,.40,.30),
    ("BAG",.73,.63,.26,.18),("SHOES",.75,.87,.26,.13),("BIJU",.42,.13,.15,.08)])
L4=dict(name="4 · MODEL + FLAT-LAY", tag="look purtat + piese · intenție 'shop the look'",
    header=False, palette=True, divider=True, boxes=[
    ("MODEL",.24,.54,.40,.82),("HERO",.62,.27,.26,.20),
    ("BOTTOMS",.83,.44,.18,.30),("BAG",.60,.61,.22,.16),
    ("SHOES",.80,.75,.22,.12),("BIJU",.60,.13,.12,.07)])
L5=dict(name="5 · LABELED / SHOPPABLE", tag="etichete + 'Link' · driver direct de click afiliat",
    header=False, palette=False, labels=True, boxes=[
    ("HERO",.33,.40,.40,.32),("BOTTOMS",.60,.62,.26,.50),
    ("BAG · Link",.82,.32,.17,.13),("BIJU · Link",.84,.50,.13,.09),
    ("SHOES · Link",.80,.70,.20,.12)])
LAYOUTS=[L1,L2,L3,L4,L5]

PW,PH=470,700           # panel inner drawing area
PAD=26; TITLE_H=58; NOTE_H=40
FULL_W=PAD+PW+PAD; FULL_H=TITLE_H+PH+NOTE_H

def panel(cfg):
    im=Image.new("RGB",(FULL_W,FULL_H),BG); d=ImageDraw.Draw(im)
    # title
    d.text((PAD,16),cfg["name"],font=F(SANB,24),fill=INK)
    ox,oy=PAD,TITLE_H
    # frame
    d.rectangle([ox,oy,ox+PW,oy+PH],outline=LINE,width=2)
    # inner bg
    d.rectangle([ox+2,oy+2,ox+PW-2,oy+PH-2],fill=WHITE)
    # editorial header band
    top=oy+6
    if cfg.get("header"):
        bh=int(PH*0.14)
        d.text((ox+PW/2,top+bh*0.34),"THE EDIT",font=F(SERB,30),fill=INK,anchor="mm")
        d.text((ox+PW/2,top+bh*0.72),"quiet luxury · styled by TWS",font=F(SER,15),fill=SOFT,anchor="mm")
        d.line([ox+PW*0.3,top+bh,ox+PW*0.7,top+bh],fill=CAMEL,width=2)
        top=oy+6+bh
    area_y=top; area_h=(oy+PH-6)-top
    if cfg.get("divider"):
        dx=ox+PW*0.47
        d.line([dx,area_y+10,dx,oy+PH-14],fill=LINE,width=1)
    # boxes
    for b in cfg["boxes"]:
        lb,cx,cy,w,h=b
        bx=ox+cx*PW; by=area_y+cy*area_h
        bw=w*PW; bh=h*area_h
        x0,y0,x1,y1=bx-bw/2,by-bh/2,bx+bw/2,by+bh/2
        d.rounded_rectangle([x0,y0,x1,y1],radius=10,fill=TILE,outline=CAMEL,width=2)
        d.text((bx,by),lb,font=F(SANB,15),fill=INK,anchor="mm")
        if cfg.get("labels"):
            # leader dash to right margin label already baked into lb ("· Link")
            pass
    # palette dots bottom-right
    if cfg.get("palette"):
        cols=[(31,38,42),(183,154,116),(214,205,191),(150,140,128),(240,236,230)]
        px=ox+PW-20; py=oy+PH-20
        for i,c in enumerate(reversed(cols)):
            d.ellipse([px-16,py-16,px,py],fill=c,outline=WHITE,width=1); px-=20
    # note
    d.text((PAD,TITLE_H+PH+10),cfg["tag"],font=F(SAN,15),fill=SOFT)
    return im

panels=[panel(c) for c in LAYOUTS]
# grid 3 cols x 2 rows (5 + header cell)
GAP=22; HEAD=120
cols=3; rows=2
cw=FULL_W; ch=FULL_H
W=cols*cw+(cols+1)*GAP
H=HEAD+rows*ch+(rows+1)*GAP
sheet=Image.new("RGB",(W,H),(252,251,249)); ds=ImageDraw.Draw(sheet)
ds.text((GAP,30),"TWS — 5 TEMPLATE DE COLAJ",font=F(SERB,44),fill=INK)
ds.text((GAP,86),"quiet-luxury · 2:3 · fundal neutru · ce arăt = ce vând",font=F(SER,22),fill=SOFT)
# legend box top-right
lx=W-GAP-cw
ds.text((lx,34),"REGULĂ GRID",font=F(SANB,20),fill=INK)
leg=["• hero sus (piesa-cheie, cea mai mare)","• jos = ancoră verticală (full-length)",
     "• accesorii grupate (biju/ochelari sus)","• geantă mid · pantofi jos","• fundal scos · piese drepte"]
for i,t in enumerate(leg):
    ds.text((lx,66+i*20),t,font=F(SAN,15),fill=(70,74,78))
pos=[(0,0),(1,0),(2,0),(0,1),(1,1)]
for p,(c,r) in zip(panels,pos):
    x=GAP+c*(cw+GAP); y=HEAD+GAP+r*(ch+GAP)
    sheet.paste(p,(x,y))
sheet.save("/home/claude/tws_clone/tws_build/layout_templates.png")
print("saved", sheet.size)
