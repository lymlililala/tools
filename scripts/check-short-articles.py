import re

with open('src/pages/articles/articles.data.ts', 'r') as f:
    content = f.read()

slugs = re.findall(r"slug:\s*'([^']+)'", content)
contents = re.findall(r'content:\s*`([\s\S]*?)`\s*,?\s*\}', content)

print(f'Total slugs: {len(slugs)}')
print(f'Total content blocks: {len(contents)}')

short_articles = []
for i, c in enumerate(contents):
    word_count = len(c.split())
    if word_count < 400:
        slug = slugs[i] if i < len(slugs) else f'unknown-{i}'
        short_articles.append((slug, word_count))

print(f'Short articles (<400 words): {len(short_articles)}')
for slug, wc in short_articles:
    print(f'  - {slug}: {wc} words')
