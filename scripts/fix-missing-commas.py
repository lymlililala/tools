#!/usr/bin/env python3
"""Fix missing trailing commas after content template literals."""

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

fixes = [
    # Fix 1: json-to-yaml-converter article
    (
        '→ Try the [JSON to YAML Converter](/json-to-yaml-converter)`\n  },\n  {\n    slug: \'css-unit-converter-guide\'',
        '→ Try the [JSON to YAML Converter](/json-to-yaml-converter)`,\n  },\n  {\n    slug: \'css-unit-converter-guide\''
    ),
    # Fix 2: color-converter article
    (
        '→ Try the [Color Converter](/color-converter)`\n  },\n  {\n    slug: \'markdown-to-html-guide\'',
        '→ Try the [Color Converter](/color-converter)`,\n  },\n  {\n    slug: \'markdown-to-html-guide\''
    ),
]

for search, replace in fixes:
    if search in content:
        print(f"Found and fixing: {repr(search[:60])}")
        content = content.replace(search, replace, 1)
    else:
        print(f"Pattern NOT found: {repr(search[:60])}")

with open('src/pages/articles/articles.data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
