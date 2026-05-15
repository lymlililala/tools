#!/usr/bin/env python3
"""Fix unescaped backticks in the articles.data.ts template literals."""

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File length: {len(content)} chars")

# The broken section: unescaped backticks in the base64-encoding-explained article
# Line 450: ``` (should be \`\`\`)
# Line 451: `user:password` (should be \`user:password\`)

# Find the problematic area
search = 'Authorization: Basic dXNlcjpwYXNzd29yZA==\n```\nDecoded: `user:password`'
replace = 'Authorization: Basic dXNlcjpwYXNzd29yZA==\n\\`\\`\\`\nDecoded: \\`user:password\\`'

if search in content:
    print("Found the broken pattern, fixing...")
    content = content.replace(search, replace, 1)
    with open('src/pages/articles/articles.data.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Pattern not found. Searching nearby...")
    idx = content.find('Authorization: Basic dXNlcjpwYXNzd29yZA==')
    if idx >= 0:
        print(f"Found auth string at index {idx}")
        print("Context (raw):")
        print(repr(content[idx:idx+200]))
    else:
        print("Auth string not found either")
