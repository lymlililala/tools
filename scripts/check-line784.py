with open('src/pages/articles/articles.data.ts', 'rb') as f:
    lines = f.readlines()
line = lines[783]  # 0-indexed, so line 784
decoded = line.decode('utf-8', errors='replace')
print(f"Length: {len(decoded.rstrip())}")
print(f"Repr: {repr(decoded)}")
# Check col 61 (0-indexed: 60)
chars = list(decoded)
for i, c in enumerate(chars[:80]):
    print(f"  col{i+1}: {repr(c)}")
