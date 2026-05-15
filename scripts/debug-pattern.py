import re

with open('src/pages/articles/articles.data.ts', 'r') as f:
    content = f.read()

slug = 'string-obfuscator-guide'

# Method 1: Direct search
idx = content.find(f"slug: '{slug}'")
print(f"Slug found at index: {idx}")

# Show 500 chars around the slug including the content field
snippet = content[idx:idx+800]
print("Snippet:")
print(repr(snippet[:500]))
print("...")
print(repr(snippet[500:]))
print()

# Try the pattern that update_article uses
pattern = r"(slug:\s*'" + re.escape(slug) + r"'[\s\S]*?content:\s*`)([\s\S]*?)(`\s*,?\s*\})"
m = re.search(pattern, content)
if m:
    print("Pattern matched!")
    print(f"Content length: {len(m.group(2))} chars, {len(m.group(2).split())} words")
    print("Content preview:", repr(m.group(2)[:200]))
else:
    print("Pattern DID NOT match!")
    
    # Try a simpler test
    simple = r"slug:\s*'string-obfuscator-guide'"
    if re.search(simple, content):
        print("Simple slug pattern matches")
    
    # Check what comes after slug
    slug_match = re.search(r"slug:\s*'string-obfuscator-guide'([\s\S]{0,500})", content)
    if slug_match:
        print("Context after slug:")
        print(repr(slug_match.group(1)))
