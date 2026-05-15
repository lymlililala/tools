#!/usr/bin/env python3
"""Check word counts for all articles."""
import re

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all article objects
slug_pattern = re.compile(r"slug:\s*'([^']+)'")
content_pattern = re.compile(r'content:\s*`(.*?)`\s*,?\s*\n\s*\}', re.DOTALL)

slugs = slug_pattern.findall(text)
print(f"Total articles: {len(slugs)}")
print()

# More reliable: split by slug
parts = re.split(r"(?=\n  \{\n    slug:)", text)

for part in parts[1:]:  # skip the header
    slug_match = re.search(r"slug:\s*'([^']+)'", part)
    cat_match = re.search(r"category:\s*'([^']+)'", part)
    content_match = re.search(r'content:\s*`(.*?)`\s*,?\s*\n\s*\}', part, re.DOTALL)
    
    if slug_match and content_match:
        slug = slug_match.group(1)
        cat = cat_match.group(1) if cat_match else 'Unknown'
        content = content_match.group(1)
        words = len(content.split())
        status = "✅" if words >= 800 else "⚠️ SHORT"
        print(f"{status} [{cat}] {slug}: {words} words")
    elif slug_match:
        slug = slug_match.group(1)
        print(f"❌ No content found: {slug}")
