#!/usr/bin/env python3
"""
Generate sitemap.xml for HOK QuickRef from heroes.json and static pages.
Run: python3 generate-sitemap.py
Output: sitemap.xml in project root
"""
import json
import os
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, ElementTree, tostring
from xml.dom import minidom

BASE_URL = "https://hokquickref.com"
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
HEROES_JSON = os.path.join(PROJECT_DIR, "data", "heroes.json")
SITEMAP_OUT = os.path.join(PROJECT_DIR, "sitemap.xml")

# Static pages with their priority and change frequency
STATIC_PAGES = [
    ("/",                  "1.0",  "daily"),
    ("/heroes.html",       "0.9",  "daily"),
    ("/items.html",        "0.8",  "weekly"),
    ("/strategy.html",     "0.8",  "weekly"),
    ("/tips.html",         "0.7",  "weekly"),
]


def build_sitemap():
    urlset = Element(
        "urlset",
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9",
    )

    today = datetime.utcnow().strftime("%Y-%m-%d")

    # Static pages
    for path, priority, changefreq in STATIC_PAGES:
        url = SubElement(urlset, "url")
        SubElement(url, "loc").text = f"{BASE_URL}{path}"
        SubElement(url, "lastmod").text = today
        SubElement(url, "changefreq").text = changefreq
        SubElement(url, "priority").text = priority

    # Hero detail pages from heroes.json
    with open(HEROES_JSON) as f:
        data = json.load(f)

    heroes = data.get("heroes", [])
    for hero in heroes:
        slug = hero["slug"]
        url = SubElement(urlset, "url")
        SubElement(url, "loc").text = f"{BASE_URL}/hero.html?hero={slug}"
        SubElement(url, "lastmod").text = today
        SubElement(url, "changefreq").text = "weekly"
        SubElement(url, "priority").text = "0.7"

    # Pretty-print XML
    raw = tostring(urlset, encoding="utf-8")
    dom = minidom.parseString(raw)
    pretty = dom.toprettyxml(indent="  ", encoding="utf-8")

    with open(SITEMAP_OUT, "wb") as f:
        f.write(pretty)

    print(f"✅ Sitemap generated: {SITEMAP_OUT}")
    print(f"   URLs: {len(STATIC_PAGES)} static + {len(heroes)} heroes = {len(STATIC_PAGES) + len(heroes)} total")


if __name__ == "__main__":
    build_sitemap()
