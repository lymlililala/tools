import re

with open('src/pages/articles/articles.data.ts', 'r') as f:
    content = f.read()

# Check these slugs that should have been updated in batch4
test_slugs = [
    'string-obfuscator-guide',
    'text-statistics-guide',
    'chronometer-guide',
    'benchmark-builder-guide',
    'qr-code-generator-guide',
    'svg-placeholder-guide',
    'color-palette-generator-guide',
    'phone-formatter-guide',
    'iban-validator-guide',
    'json-to-csv-guide',
    'number-formatter-guide',
    'device-information-guide',
    'mime-types-guide',
    'user-agent-parser-guide',
    'keycode-info-guide',
    'slugify-string-guide',
    'html-entities-guide',
    'basic-auth-generator-guide',
    'safelink-decoder-guide',
    'wifi-qr-code-guide',
    'camera-recorder-guide',
    'xml-to-json-guide'
]

for slug in test_slugs:
    slug_pos = content.find(f"slug: '{slug}'")
    if slug_pos == -1:
        print(f'{slug}: SLUG NOT FOUND')
        continue
    
    content_start = content.find('content: `', slug_pos)
    if content_start == -1:
        print(f'{slug}: CONTENT FIELD NOT FOUND')
        continue
    
    text_start = content_start + len('content: `')
    
    pos = text_start
    while pos < len(content):
        if content[pos] == '`' and (pos == 0 or content[pos-1] != '\\'):
            break
        pos += 1
    
    article_text = content[text_start:pos]
    wc = len(article_text.split())
    first_words = ' '.join(article_text.split()[:15])
    print(f'{slug}: {wc} words | First words: "{first_words}"')
