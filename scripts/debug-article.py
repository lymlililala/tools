import re

with open('src/pages/articles/articles.data.ts', 'r') as f:
    content = f.read()

# Check where meta-tag-generator-guide appears in file
slug = 'meta-tag-generator-guide'
positions = [m.start() for m in re.finditer(re.escape(slug), content)]
print(f"Occurrences of '{slug}': {len(positions)} at positions: {positions}")

# Check the context around the first occurrence
if positions:
    start = max(0, positions[0] - 20)
    end = min(len(content), positions[0] + 200)
    print("Context:")
    print(repr(content[start:end]))
    print()

# Try the pattern
pattern = r"(slug:\s*'" + re.escape(slug) + r"'[\s\S]*?content:\s*`)([\s\S]*?)(`\s*,?\s*\})"
m = re.search(pattern, content)
if m:
    wc = len(m.group(2).split())
    print(f"Found content block, {wc} words")
    print("First 200 chars of content:", repr(m.group(2)[:200]))
else:
    print("Pattern NOT found!")
    # Check if slug exists without the pattern
    if slug in content:
        # Find surrounding context
        idx = content.index(slug)
        print("Surrounding context (500 chars):")
        print(repr(content[idx:idx+500]))
