import re

with open('src/pages/articles/articles.data.ts', 'r') as f:
    content = f.read()

# Find all article blocks
# Look for slug then content field
# Use a smarter approach: find slug, then find the next content: ` block
slug_pattern = re.compile(r"slug:\s*'([^']+)'")
slugs = slug_pattern.findall(content)
print(f'Total slugs found: {len(slugs)}')

short = []
ok = []

for slug in slugs:
    # Find this slug's position
    slug_pos = content.find(f"slug: '{slug}'")
    if slug_pos == -1:
        continue
    
    # Find the next content: ` after this position
    content_start = content.find('content: `', slug_pos)
    if content_start == -1:
        continue
    
    # Move past 'content: `'
    text_start = content_start + len('content: `')
    
    # Find the closing backtick (not escaped)
    pos = text_start
    while pos < len(content):
        if content[pos] == '`' and (pos == 0 or content[pos-1] != '\\'):
            break
        pos += 1
    
    article_text = content[text_start:pos]
    wc = len(article_text.split())
    
    if wc < 500:
        short.append((slug, wc))
    else:
        ok.append((slug, wc))

print(f'\nArticles >= 500 words: {len(ok)}')
print(f'Articles < 500 words: {len(short)}')
print()
print('Short articles:')
for slug, wc in short:
    print(f'  - {slug}: {wc} words')

print()
print(f'\nMin words: {min(wc for _, wc in ok + short) if ok + short else 0}')
print(f'Max words: {max(wc for _, wc in ok + short) if ok + short else 0}')
avg = sum(wc for _, wc in ok + short) / len(ok + short) if ok + short else 0
print(f'Avg words: {avg:.0f}')
