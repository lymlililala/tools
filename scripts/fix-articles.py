#!/usr/bin/env python3
"""
Fix articles.data.ts by removing duplicate old short articles (lines 6525-9528)
Keep: lines 1-6524 (existing articles ending with yaml-viewer)
Delete: lines 6525-9528 (old short versions of the 31 new articles)
Keep: lines 9529-end (new detailed versions of the 31 articles)
"""

with open('/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

total = len(lines)
print(f'Total lines: {total}')

# Print key lines for verification (0-indexed)
for i in [6522, 6523, 6524, 6525, 6526, 9525, 9526, 9527, 9528]:
    print(f'Line {i+1}: {repr(lines[i])}')

# Strategy: remove lines 6525 to 9528 (0-indexed: 6524 to 9527)
# Keep lines 0-6523 and lines 9528 onwards
keep_start = 6524  # 0-indexed: line 6525 starts here (to be removed from)
keep_end = 9528    # 0-indexed: line 9529 starts here (to be kept from)

print(f'\nRemoving lines {keep_start+1} to {keep_end} ({keep_end - keep_start} lines)')
print(f'Removed section starts with: {repr(lines[keep_start])}')
print(f'Removed section ends with: {repr(lines[keep_end-1])}')
print(f'Content after removed section starts with: {repr(lines[keep_end])}')

# Create new file content
new_lines = lines[:keep_start] + lines[keep_end:]
print(f'\nNew total lines: {len(new_lines)}')
print(f'Last line before network section: {repr(new_lines[keep_start-1])}')
print(f'First line of network section: {repr(new_lines[keep_start])}')

# Write the fixed file
with open('/Users/lym/Documents/code/tools/src/pages/articles/articles.data.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('\nFile written successfully!')
