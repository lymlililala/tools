#!/usr/bin/env python3
"""
Replace 31 short articles in articles.data.ts with detailed versions.
Strategy: Read the file, find each article by its slug, replace the entire article object.
"""

import re
import sys

ARTICLES_FILE = '/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts'

# Target slugs to replace
TARGET_SLUGS = [
    'ipv4-subnet-calculator-guide',
    'mac-address-guide',
    'ipv4-range-expander-guide',
    'ipv4-address-converter-guide',
    'ipv6-ula-generator-guide',
    'mac-address-lookup-guide',
    'percentage-calculator-guide',
    'bmi-calculator-guide',
    'mortgage-calculator-guide',
    'math-evaluator-guide',
    'eta-calculator-guide',
    'lorem-ipsum-guide',
    'text-diff-guide',
    'emoji-picker-guide',
    'string-obfuscator-guide',
    'text-statistics-guide',
    'chronometer-guide',
    'benchmark-builder-guide',
    'qr-code-generator-guide',
    'svg-placeholder-guide',
    'color-palette-generator-guide',
    'phone-formatter-guide',
    'iban-validator-guide',
    'number-formatter-guide',
    'wifi-qr-code-guide',
    'camera-recorder-guide',
    'ascii-art-generator-guide',
    'numeronym-generator-guide',
    'random-decision-picker-guide',
    'pdf-signature-checker-guide',
    'income-tax-calculator-guide',
]

# New article content files
CONTENT_FILES = [
    '/Users/lym/Documents/code/tools/scripts/content_network.py',
    # More files will be added for other categories
]

def find_article_bounds(content, slug):
    """Find the start and end indices of an article object with the given slug."""
    # Find the slug line
    slug_pattern = re.compile(r"slug:\s*'" + re.escape(slug) + r"'")
    match = slug_pattern.search(content)
    if not match:
        return None, None
    
    # From the slug position, find the opening { before it
    # Search backwards for '  {' (article objects are indented with 2 spaces)
    pos = match.start()
    # Go back to find '  {'
    start = content.rfind('\n  {', 0, pos)
    if start == -1:
        start = content.rfind('  {', 0, pos)
    if start == -1:
        return None, None
    # Include the newline before it
    while start > 0 and content[start-1] == '\n':
        start -= 1
    
    # From the slug position, find the closing }, 
    # Need to handle nested braces in the content field
    # The article object ends with '  },' at the same indentation level
    pos = match.end()
    depth = 0
    in_template = False
    i = start
    while i < len(content):
        c = content[i]
        if c == '`' and content[i:i+1] == '`':
            # Check for template literal start/end
            # This is a simplification; template literals with backticks are complex
            pass
        if c == '{' and not in_template:
            depth += 1
        elif c == '}' and not in_template:
            depth -= 1
            if depth == 0:
                # Found the closing brace
                # Look for the comma after it
                end = i + 1
                while end < len(content) and content[end] in ' \t':
                    end += 1
                if end < len(content) and content[end] == ',':
                    end += 1
                # Include trailing newline
                while end < len(content) and content[end] == '\n':
                    end += 1
                return start, end
        i += 1
    
    return None, None

def main():
    with open(ARTICLES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"File length: {len(content)} chars")
    
    # Try finding one article
    slug = 'ipv4-subnet-calculator-guide'
    start, end = find_article_bounds(content, slug)
    if start is not None:
        print(f"Found article '{slug}': chars {start}-{end}")
        print(f"First 100 chars: {repr(content[start:start+100])}")
        print(f"Last 100 chars: {repr(content[max(0,end-100):end])}")
    else:
        print(f"Could not find article '{slug}'")

if __name__ == '__main__':
    main()
