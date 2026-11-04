# 선생님 화면 녹화에서 'localhost:3000/join?...' 주소 줄만 흰색으로 가린다 (수업코드가 뜬 프레임에만)
import sys, glob
from PIL import Image, ImageDraw
box = (1280, 640, 1920, 712)
n = 0
for f in sorted(glob.glob(sys.argv[1] + '/*.jpg')):
    im = Image.open(f).convert('RGB')
    g = im.crop(box).convert('L')
    lo, hi = g.getextrema()
    if lo < 200:  # 글자가 있을 때만
        ImageDraw.Draw(im).rectangle(box, fill=(255, 255, 255))
        im.save(f, quality=95); n += 1
print('masked', n)
