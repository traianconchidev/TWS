#!/usr/bin/env python3
# Builds the INNER collage (5 arrangements) then wraps each in the standard TWS pin
# frame via render_pin_fmt.js `comp`. Frame identical across all 5; only the inner
# arrangement changes. Run: python test_pins.py   (needs node + render_pin_fmt.js)
import json, subprocess, os
C="/tmp/claude-0/c"; OUT="/tmp/claude-0/pins_out"
os.makedirs(OUT, exist_ok=True)
def p(role,name,cut="none"): return {"img":f"{C}/{name}.png","role":role,"cut":cut}

OFF=[p("hero","off_knit"),p("bottoms","off_jeans"),p("bag","off_bag"),
     p("shoes","off_loafers"),p("jewelry","off_earrings")]
LUXE=[p("bottoms","luxe_trousers"),p("bag","luxe_tote"),p("shoes","luxe_flats"),
      p("jewelry","luxe_earrings"),p("accent","luxe_belt")]

jobs=[
 dict(out="inner_t1.png", layout="editorial", pieces=OFF),
 dict(out="inner_t2.png", layout="flatlay",   pieces=OFF),
 dict(out="inner_t3.png", layout="asym",      pieces=OFF),
 dict(out="inner_t4.png", layout="lookday",   pieces=LUXE,
      model={"img":f"{C}/luxe_model.png","cut":"none"}),
 dict(out="inner_t5.png", layout="shop",      pieces=OFF,
      labels={"hero":["Oversized Knit","Link →"],"bottoms":["Wide Jeans","Link →"],
              "bag":["Leather Bag","Link →"],"shoes":["Loafers","Link →"],
              "jewelry":["Gold Hoops","Link →"]}),
]
for j in jobs:
    cfg=dict(j); cfg["out"]=f"{OUT}/{j['out']}"
    cpath=f"{OUT}/_cfg.json"; json.dump(cfg,open(cpath,"w"))
    subprocess.run(["python3","compose.py",cpath],check=True)

pins=[
 dict(format="comp",out="pin_t1_editorial.png",comp=f"{OUT}/inner_t1.png",
      eyebrow="THE EDIT · OFF-DUTY",title="The Cocoa Knit",subtitle="cream & cocoa, weekend ease",hint="shop the edit"),
 dict(format="comp",out="pin_t2_grid.png",comp=f"{OUT}/inner_t2.png",
      eyebrow="THE EDIT · OFF-DUTY",title="Off-Duty Neutrals",subtitle="knit, denim, loafers",hint="shop the edit"),
 dict(format="comp",out="pin_t3_asym.png",comp=f"{OUT}/inner_t3.png",
      eyebrow="THE EDIT · OFF-DUTY",title="Cream & Cocoa",subtitle="the vertical edit",hint="shop the edit"),
 dict(format="comp",out="pin_t4_lookday.png",comp=f"{OUT}/inner_t4.png",
      eyebrow="THE EDIT · 9 TO 5 LUXE",title="The Camel Blazer",subtitle="desk to dinner",hint="shop the edit"),
 dict(format="comp",out="pin_t5_labeled.png",comp=f"{OUT}/inner_t5.png",
      eyebrow="THE EDIT · OFF-DUTY",title="Shop the Look",subtitle="five pieces, one edit",hint="shop the edit"),
]
json.dump(pins,open(f"{OUT}/pins.json","w"))
subprocess.run(["node","render_pin_fmt.js",f"{OUT}/pins.json",OUT],check=True)
print("done")
