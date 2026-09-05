import os
import sys
from PIL import Image

def pack_ico():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root, 'public')
    app_dir = os.path.join(root, 'app')

    p16_path = os.path.join(public_dir, 'tmp-16.png')
    p32_path = os.path.join(public_dir, 'tmp-32.png')
    p48_path = os.path.join(public_dir, 'tmp-48.png')

    if not (os.path.exists(p16_path) and os.path.exists(p32_path) and os.path.exists(p48_path)):
        print("Missing temporary PNG frames!")
        sys.exit(1)

    p16 = Image.open(p16_path)
    p32 = Image.open(p32_path)
    p48 = Image.open(p48_path)

    ico_pub = os.path.join(public_dir, 'favicon.ico')
    ico_app = os.path.join(app_dir, 'favicon.ico')

    # Save multi-resolution ICO with true 16x16, 32x32, 48x48 frames
    p32.save(ico_pub, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[p16, p48])
    p32.save(ico_app, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[p16, p48])

    print("[OK] Created Multi-Resolution ICO (16, 32, 48px)")

if __name__ == '__main__':
    pack_ico()
