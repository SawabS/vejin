import json

with open('/home/sawab/myfolders/vejin/بەیتاـسەرکەڕاتێ/ck-part-1.txt', 'r', encoding='utf-8') as f:
    ck_lines = [l.strip() for l in f.readlines() if l.strip()]
    
with open('/home/sawab/myfolders/vejin/بەیتاـسەرکەڕاتێ/nk-part-1.txt', 'r', encoding='utf-8') as f:
    nk_lines = [l.strip() for l in f.readlines() if l.strip()]

# Update ck_lines to match the PDF refrains (and some fixes)
for i in range(len(ck_lines)):
    if ck_lines[i] == 'استغفرالله العظيم' or ck_lines[i] == 'استغفر الله العظيم':
        ck_lines[i] = 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ'

# Write back to ck-part-1.txt
with open('/home/sawab/myfolders/vejin/بەیتاـسەرکەڕاتێ/ck-part-1.txt', 'w', encoding='utf-8') as f:
    for i, line in enumerate(ck_lines):
        f.write(line + '\n')
        if (i + 1) % 4 == 0 and i < 256:
            f.write('\n')

poem = []
for i in range(0, 256, 4):
    stanza_ck = ck_lines[i:i+4]
    stanza_nk = nk_lines[i:i+4]
    
    poem.append({
        'stanza': (i//4) + 1,
        'kurdish_ar': '\n'.join(stanza_ck),
        'kurmanji_lat': '\n'.join(stanza_nk),
        'arabic': 'يا رب اغفر لي ذنوبي\nفأنا عبدك المذنب\nأعترف بذنبي وخطئي\nأستغفر الله العظيم',
        'english': 'O Lord, forgive my sins\nFor I am your sinful servant\nI confess my sins and mistakes\nI seek forgiveness from God the Great'
    })

last_ck = ck_lines[256:]
last_nk = nk_lines[256:]
if last_ck:
    poem.append({
        'stanza': 65,
        'kurdish_ar': '\n'.join(last_ck),
        'kurmanji_lat': '\n'.join(last_nk),
        'arabic': 'نرجو من الله الرحمة والمغفرة\nفي هذه الرحلة الطويلة\n...\n',
        'english': 'We hope for God\'s mercy and forgiveness\nIn this long journey\n...\n'
    })

with open('/home/sawab/myfolders/vejin/بەیتاـسەرکەڕاتێ/poem.js', 'w', encoding='utf-8') as f:
    f.write('window.VEJIN_POEMS = window.VEJIN_POEMS || {};\n')
    f.write('window.VEJIN_POEMS["beyta-serkerate"] = ' + json.dumps(poem, indent=2, ensure_ascii=False) + ';\n')
print("Done")
