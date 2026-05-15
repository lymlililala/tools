#!/usr/bin/env python3
"""Check context around specific line numbers."""

with open('src/pages/articles/articles.data.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check lines 782-787 (0-indexed: 781-786)
print("=== Lines 782-787 ===")
for i in range(781, 787):
    print(f"{i+1}: {repr(lines[i])}")

print()

# Check lines 1146-1151
print("=== Lines 1146-1151 ===")
for i in range(1145, 1151):
    print(f"{i+1}: {repr(lines[i])}")
