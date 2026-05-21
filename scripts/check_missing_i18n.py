#!/usr/bin/env python3
"""检测 Vue 组件中使用了 t('tools.xxx.yyy') 但在 zh.yml 中未定义的键"""
import re
import os

vue_dir = 'src/tools'
zh_file = 'locales/zh.yml'

with open(zh_file, encoding='utf-8') as f:
    zh_content = f.read()

missing = {}
for root, dirs, files in os.walk(vue_dir):
    for fname in files:
        if not fname.endswith('.vue'):
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, encoding='utf-8') as f:
            content = f.read()
        # 匹配 t('tools.tool-name.key') 或 t("tools.tool-name.key")
        keys = re.findall(r"t\(['\"]tools\.([^'\"]+)['\"]\)", content)
        for key in keys:
            parts = key.split('.')
            if len(parts) < 2:
                continue
            tool = parts[0]
            sub_key = parts[1]
            # 检查 zh.yml 中是否存在这个键（简单检查缩进后跟 key:）
            pattern = rf'^\s+{re.escape(sub_key)}\s*:'
            if not re.search(pattern, zh_content, re.MULTILINE):
                full_key = f'tools.{key}'
                if tool not in missing:
                    missing[tool] = set()
                missing[tool].add(full_key)

if not missing:
    print("✅ All i18n keys found in zh.yml")
else:
    total = sum(len(v) for v in missing.values())
    print(f"❌ Found {total} missing key(s) in zh.yml:\n")
    for tool in sorted(missing):
        print(f"  [{tool}]")
        for k in sorted(missing[tool]):
            print(f"    {k}")
