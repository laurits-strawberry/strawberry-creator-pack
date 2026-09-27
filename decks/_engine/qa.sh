#!/bin/bash
# usage: qa.sh deckdir name
cd "$1"; mkdir -p qa; rm -f qa/*; pdftoppm -r ${3:-36} -png "$2.pdf" qa/p
python3 - <<'PY'
from PIL import Image;import glob
fs=sorted(glob.glob('qa/p-*.png'));w,h=Image.open(fs[0]).size;cols=3
s=Image.new('RGB',(cols*w+(cols+1)*12,((len(fs)+cols-1)//cols)*(h+12)+12),'#555')
for k,f in enumerate(fs):s.paste(Image.open(f).convert('RGB'),(12+(k%cols)*(w+12),12+(k//cols)*(h+12)))
import time;n='qa/sheet_%d.jpg'%int(time.time());s.save(n,quality=88);print(n);print(len(fs))
PY
