import re, os, sys

def check_file(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()
    
    # Extract template section only
    m = re.search(r'<template>(.*)</template>', content, re.DOTALL)
    if not m:
        return []
    
    template = m.group(1)
    issues = []
    
    for i, line in enumerate(template.split('\n'), 1):
        stripped = line.strip()
        # Skip blank and comment lines
        if not stripped:
            continue
        if stripped.startswith('<!--'):
            continue
        if stripped.startswith('//') or stripped.startswith('*'):
            continue
        # Remove inline HTML comments
        no_comment = re.sub(r'<!--.*?-->', '', line)
        # Skip lines that already use t()
        if "t('tools." in no_comment or 't("tools.' in no_comment:
            continue
        # Find visible Chinese chars
        chinese = re.findall(r'[\u4e00-\u9fff]+', no_comment)
        if chinese:
            issues.append((i, ''.join(chinese[:3]), line.strip()[:70]))
    
    return issues

tools_dir = 'src/tools'
results = {}
for root, dirs, files in os.walk(tools_dir):
    for f in files:
        if not f.endswith('.vue'):
            continue
        path = os.path.join(root, f)
        issues = check_file(path)
        if issues:
            results[path] = issues

# Sort by number of issues descending
for path, issues in sorted(results.items(), key=lambda x: -len(x[1])):
    print(f"\n{path} ({len(issues)} issues):")
    for ln, zh, preview in issues[:8]:
        print(f"  L{ln}: [{zh}] {preview}")
