#!/usr/bin/env python3
# TWS flat-lay composer — builds a transparent cutout composition (comp.png)
# for the render_pin_fmt.js `comp` format. Two layouts: "flatlay" (hero centred,
# pieces around) and "lookday" (model on the left, flat-lay of pieces on the right).
#
# Usage: python compose.py config.json
# config = {
#   "out": "comp.png", "layout": "flatlay"|"lookday",
#   "pieces": [ {"img":"path", "role":"hero|bottoms|bag|shoes|jewelry|accent",
#                "cut":"flood"|"global"|"none", "tol":24} , ... ],
#   "model":  {"img":"path", "cut":"flood", "tol":20}          # lookday only
# }
# ROLES (flatlay slots): hero (centre, large), bottoms (right), bag (lower-left),
#   shoes (lower-right), jewelry (upper-right), accent (upper-left).
# CUT: "flood" = flood-fill from borders (keeps light garments; good default for
#   clothes). "global" = remove ALL near-white (use for dark/black items & jewellery,
#   removes enclosed holes cleanly). "none" = image already has alpha (e.g. from
#   Higgsfield remove_background — preferred for best quality).
import sys, json, os
from collections import deque
from PIL import Image, ImageFilter

def floodcut(im, tol=24):
    im = im.convert("RGBA"); w,h = im.size; px = im.load()
    cs = [px[1,1],px[w-2,1],px[1,h-2],px[w-2,h-2]]
    bg = tuple(sum(c[i] for c in cs)//4 for i in range(3))
    near = lambda p: abs(p[0]-bg[0])+abs(p[1]-bg[1])+abs(p[2]-bg[2]) < tol*3
    seen = [[False]*w for _ in range(h)]; dq = deque()
    for x in range(w):
        for y in (0,h-1):
            if near(px[x,y]) and not seen[y][x]: seen[y][x]=True; dq.append((x,y))
    for y in range(h):
        for x in (0,w-1):
            if near(px[x,y]) and not seen[y][x]: seen[y][x]=True; dq.append((x,y))
    while dq:
        x,y = dq.popleft()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny = x+dx,y+dy
            if 0<=nx<w and 0<=ny<h and not seen[ny][nx] and near(px[nx,ny]):
                seen[ny][nx]=True; dq.append((nx,ny))
    for y in range(h):
        for x in range(w):
            if seen[y][x]: r,g,b,a = px[x,y]; px[x,y]=(r,g,b,0)
    bb = im.getbbox()
    return im.crop(bb) if bb else im

def globalcut(im, tol=48):
    im = im.convert("RGBA"); px = im.load(); w,h = im.size
    for y in range(h):
        for x in range(w):
            r,g,b,a = px[x,y]
            if r>255-tol and g>255-tol and b>255-tol and max(r,g,b)-min(r,g,b)<22:
                px[x,y] = (r,g,b,0)
    bb = im.getbbox()
    return im.crop(bb) if bb else im

def load_cut(spec):
    im = Image.open(spec["img"]).convert("RGBA")
    mode = spec.get("cut","flood"); tol = spec.get("tol")
    if mode == "flood":  im = floodcut(im, tol if tol is not None else 24)
    elif mode == "global": im = globalcut(im, tol if tol is not None else 48)
    else:
        bb = im.getbbox();  im = im.crop(bb) if bb else im   # just trim transparent
    return im

def shadow(im, blur=19, op=56):
    a = im.split()[3]
    sh = Image.new("RGBA", im.size, (22,24,22,0))
    sh.putalpha(a.point(lambda v:int(v*op/255)))
    return sh.filter(ImageFilter.GaussianBlur(blur))

def place(cv, im, cx, cy, w, rot=0, sop=56):
    h = int(im.height*w/im.width); im = im.resize((w,h), Image.LANCZOS)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    x = int(cx-im.width/2); y = int(cy-im.height/2)
    cv.alpha_composite(shadow(im, 19, sop), (x+5, y+13))
    cv.alpha_composite(im, (x,y))

# role -> (cx, cy, w, rot) on a 964x1180 canvas (flatlay). REALISTIC PROPORTIONS:
# bottoms = full-length & tall (anchor), hero (top) large, bag/shoes medium,
# jewelry/accent small. Draw order matters (later = on top).
# PIECES ARE LAID STRAIGHT (rot=0) — do not tilt garments.
FLAT = {
    "bottoms": (695,615,290, 0),   # jeans/trousers — full length, tall, right anchor
    "hero":    (305,405,450, 0),   # top/sweater — large, upper-left
    "accent":  (600,235,275, 0),   # belt/scarf — straight, upper-centre (keep visible)
    "bag":     (250,810,250, 0),   # handbag — medium, mid-left
    "shoes":   (360,1035,315, 0),  # shoes — medium, lower-left
    "jewelry": (845,300,108, 0),   # earrings — small, top-right
}
FLAT_ORDER = ["bottoms","hero","accent","bag","shoes","jewelry"]
# lookday: model left; flat-lay pieces on the right half
LOOK = {
    "bottoms": (710,585,275, 3),
    "accent":  (820,330,200,-12),
    "jewelry": (585,320,120, 0),
    "bag":     (610,885,230,-6),
    "shoes":   (830,930,255, 9),
    "hero":    (700,560,300,-2),
}
LOOK_ORDER = ["bottoms","accent","hero","jewelry","bag","shoes"]

def build(cfg):
    W,H = cfg.get("canvas",[964,1180])
    cv = Image.new("RGBA",(W,H),(0,0,0,0))
    layout = cfg.get("layout","flatlay")
    byrole = {p["role"]: p for p in cfg.get("pieces",[])}
    if layout == "lookday" and cfg.get("model"):
        m = load_cut(cfg["model"]); place(cv, m, 232, 600, 470, 0, sop=48)
        from PIL import ImageDraw
        ImageDraw.Draw(cv).line([(472,120),(472,1060)], fill=(31,38,42,38), width=2)
        slots, order = LOOK, LOOK_ORDER
    else:
        slots, order = FLAT, FLAT_ORDER
    for role in order:
        if role in byrole:
            cx,cy,w,rot = slots[role]
            place(cv, load_cut(byrole[role]), cx, cy, w, rot)
    cv.save(cfg["out"]); print("composed", cfg["out"], cv.size)

if __name__ == "__main__":
    cfg = json.load(open(sys.argv[1]))
    build(cfg)
