#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
data = {lang: json.loads((ROOT / 'content' / f'{lang}.json').read_text(encoding='utf-8')) for lang in ('en', 'hi')}
(ROOT / 'content.js').write_text('/* Generated from content/en.json and content/hi.json. */\nwindow.FRAUD_LABS_CONTENT = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print('Built content.js')
