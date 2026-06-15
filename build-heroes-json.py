#!/usr/bin/env python3
"""Rebuild heroes_content.json from all heroes/*/ .md files."""
import json, os

HEROES_DIR = os.path.join(os.path.dirname(__file__), 'heroes')
OUTPUT = os.path.join(os.path.dirname(__file__), 'data', 'heroes_content.json')

def build():
    all_content = {}
    for slug in sorted(os.listdir(HEROES_DIR)):
        hero_path = os.path.join(HEROES_DIR, slug)
        if not os.path.isdir(hero_path):
            continue
        all_content[slug] = {}
        for panel in ['overview', 'tips', 'build']:
            md_path = os.path.join(hero_path, panel + '.md')
            if os.path.exists(md_path):
                with open(md_path, 'r') as f:
                    all_content[slug][panel] = f.read()

    with open(OUTPUT, 'w') as f:
        json.dump(all_content, f, ensure_ascii=False)

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f'Built {OUTPUT}: {size_kb:.0f} KB, {len(all_content)} heroes')

if __name__ == '__main__':
    build()
