import re

with open('src/pages/articles/articles.data.ts', 'r') as f:
    content = f.read()

slugs = re.findall(r"slug:\s*'([^']+)'", content)
contents = re.findall(r'content:\s*`([\s\S]*?)`\s*,?\s*\}', content)

# Print all articles and word counts
for i, (slug, c) in enumerate(zip(slugs, contents)):
    wc = len(c.split())
    if wc < 500:
        print(f'{slug}: {wc} words')
