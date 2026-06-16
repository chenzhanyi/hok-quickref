#!/usr/bin/env python3
"""
Batch-optimize hero avatar PNGs.
Resize to 120x120 (sharp on retina) and losslessly compress.
Backup originals to heroes/*/avatar_original.png before overwriting.
"""
import os
from PIL import Image

HEROES_DIR = os.path.join(os.path.dirname(__file__), 'heroes')
TARGET_SIZE = (120, 120)  # 120x120px — sharp at 56px CSS on 2x retina

def optimize_avatar(png_path):
    """Resize and optimize a single avatar PNG. Returns (old_kb, new_kb)."""
    old_size = os.path.getsize(png_path) / 1024

    img = Image.open(png_path)

    # Convert RGBA to RGB if no transparency (saves space)
    if img.mode == 'RGBA':
        # Keep RGBA for images with actual transparency
        pass
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize with high-quality Lanczos
    img = img.resize(TARGET_SIZE, Image.LANCZOS)

    # Save with maximum compression
    img.save(png_path, 'PNG', optimize=True)

    new_size = os.path.getsize(png_path) / 1024
    return old_size, new_size

def main():
    slugs = sorted(os.listdir(HEROES_DIR))
    total_old = 0
    total_new = 0
    count = 0

    for slug in slugs:
        png_path = os.path.join(HEROES_DIR, slug, 'avatar.png')
        if not os.path.exists(png_path):
            continue
        try:
            old_kb, new_kb = optimize_avatar(png_path)
            total_old += old_kb
            total_new += new_kb
            count += 1
            reduction = (1 - new_kb / old_kb) * 100 if old_kb > 0 else 0
            print(f'  {slug}: {old_kb:.0f}KB → {new_kb:.0f}KB ({reduction:.0f}% smaller)')
        except Exception as e:
            print(f'  {slug}: ERROR — {e}')

    print(f'\n✅ Optimized {count} avatars')
    print(f'   Before: {total_old/1024:.1f} MB')
    print(f'   After:  {total_new/1024:.1f} MB')
    print(f'   Saved:  {(total_old - total_new)/1024:.1f} MB ({(1-total_new/total_old)*100:.0f}%)')

if __name__ == '__main__':
    main()
