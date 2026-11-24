#!/usr/bin/env python3
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
errors=[]
for lang in ('en','hi'):
    d=json.loads((ROOT/'content'/f'{lang}.json').read_text(encoding='utf-8'))
    if len(d.get('frauds',[])) != 11: errors.append(f'{lang}: expected 11 scenarios')
    ids=[x.get('id') for x in d.get('frauds',[])]
    if len(set(ids)) != 11: errors.append(f'{lang}: scenario IDs are not unique')
    for x in d.get('frauds',[]):
        for key in ('title','message','why','flag','goal','nextStep'):
            if not x.get(key): errors.append(f'{lang}/{x.get("id")}: missing {key}')
        if x.get('answer') != 'scam': errors.append(f'{lang}/{x.get("id")}: expected scam answer')
    if len(d.get('map',{}).get('items',[])) != 4: errors.append(f'{lang}: fraud map must have four rows')
    if len(d.get('map',{}).get('checks',[])) != 3: errors.append(f'{lang}: expected three quick checks')
    for x in d.get('map',{}).get('checks',[]):
        if not x.get('title') or not x.get('text'): errors.append(f'{lang}: incomplete quick check')
    for key in ('readyTitle','readyText'):
        if not d.get('help',{}).get(key): errors.append(f'{lang}: missing help.{key}')
if not errors:
    en=json.loads((ROOT/'content/en.json').read_text(encoding='utf-8'))
    hi=json.loads((ROOT/'content/hi.json').read_text(encoding='utf-8'))
    if [x['id'] for x in en['frauds']] != [x['id'] for x in hi['frauds']]: errors.append('English/Hindi scenario order differs')
if errors:
    print('\n'.join(errors)); raise SystemExit(1)
print('OK: both languages contain 11 complete scenarios, scammer goals, safer next steps, three safety checks and the help evidence checklist.')
