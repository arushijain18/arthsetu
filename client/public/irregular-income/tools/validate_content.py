#!/usr/bin/env python3
"""Validate bilingual structure and minimum lesson coverage for ArthSetu."""
from pathlib import Path
import json, sys
ROOT = Path(__file__).resolve().parents[1]
EN = json.loads((ROOT/'content/en.json').read_text(encoding='utf-8'))
HI = json.loads((ROOT/'content/hi.json').read_text(encoding='utf-8'))
SCHEMES = json.loads((ROOT/'content/schemes.json').read_text(encoding='utf-8'))
errors=[]
def same_shape(a,b,path='root'):
    if type(a) is not type(b): errors.append(f'{path}: language types differ'); return
    if isinstance(a,dict):
        if set(a)!=set(b): errors.append(f'{path}: language keys differ'); return
        for k in a: same_shape(a[k],b[k],f'{path}.{k}')
    elif isinstance(a,list):
        if len(a)!=len(b): errors.append(f'{path}: list lengths differ'); return
        for i,(x,y) in enumerate(zip(a,b)): same_shape(x,y,f'{path}[{i}]')
    elif isinstance(a,str) and not b.strip(): errors.append(f'{path}: Hindi text is blank')
same_shape(EN,HI)
for tier, data in EN['tierLessons'].items():
    if len(data['cards'])<5: errors.append(f'{tier}: fewer than five lesson cards')
    if len(data['quiz'])!=3: errors.append(f'{tier}: expected three quiz questions')
for tier, data in HI['tierLessons'].items():
    if len(data['cards'])<5: errors.append(f'hi.{tier}: fewer than five lesson cards')
    if len(data['quiz'])!=3: errors.append(f'hi.{tier}: expected three quiz questions')
for language, data in [('en',EN),('hi',HI)]:
    if len(data['extras']['modules'])!=6: errors.append(f'{language}: expected six extra modules')
    for mod in data['extras']['modules']:
        if len(mod['cards'])<3: errors.append(f'{language}.{mod["id"]}: fewer than three cards')
        if len(mod['quiz'])!=3: errors.append(f'{language}.{mod["id"]}: expected three quiz questions')
for scheme in SCHEMES['schemes']:
    for key in ['id','name','who','who_hi','next','next_hi','caution','caution_hi','url','source']:
        if not scheme.get(key): errors.append(f'scheme {scheme.get("id")}: missing {key}')
    if not str(scheme.get('url','')).startswith('https://'): errors.append(f'scheme {scheme.get("id")}: URL must be HTTPS')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print('Bilingual JSON shape: matched')
print('Tier lessons:',sum(len(v['cards']) for v in EN['tierLessons'].values()),'cards;',sum(len(v['quiz']) for v in EN['tierLessons'].values()),'questions')
print('Extra modules:',sum(len(m['cards']) for m in EN['extras']['modules']),'cards;',sum(len(m['quiz']) for m in EN['extras']['modules']),'questions')
print('Safety-net entries:',len(SCHEMES['schemes']),'Last verified:',SCHEMES['lastVerified'])
