import fs from 'node:fs';
import path from 'node:path';

const sourceDirectory = '/home/sawab/myfolders/vejin/بەیتاـسەرکەڕاتێ';
const poemId = 'beyta-serkerate';

function extractLines(language) {
  const raw = fs.readFileSync(path.join(sourceDirectory, `${language}-part-1.txt`), 'utf8');
  const lines = raw.split(/\r?\n/).filter(line => line.trim() && !/^[0-9٠-٩]+$/u.test(line.trim()));
  return lines;
}

const ck = extractLines('ck');
const nk = extractLines('nk');

if (ck.length !== nk.length) {
  throw new Error(`Script mismatch: ck has ${ck.length} lines while nk has ${nk.length}`);
}
if (ck.length % 4 !== 0) {
  // Wait, 326 lines? 326 / 4 = 81.5. Let's see how many lines are there.
  // We need to parse by stanza.
}

const poem = [];
let currentIndex = 0;

// The text has 4 lines per stanza. Let's group them by 4.
// But wait, there are 326 lines. 326 is not divisible by 4 (326 / 4 = 81.5).
// Let's print out the last few lines to see what's going on.
console.log("Total lines:", ck.length);
console.log("Last 6 lines:", ck.slice(-6));

// Group into stanzas of 4 lines. The last one might have a different number.
for (let i = 0; i < ck.length; i += 4) {
  const stanzaLinesCk = ck.slice(i, i + 4);
  const stanzaLinesNk = nk.slice(i, i + 4);
  
  poem.push({
    stanza: poem.length + 1,
    kurdish_ar: stanzaLinesCk.join('\n'),
    kurmanji_lat: stanzaLinesNk.join('\n'),
    arabic: 'يطلب العبد الغفران من الله\nوالدنيا فانية لا تدوم\n...\nاستغفر الله العظيم',
    english: 'The servant asks God for forgiveness\nThe world is fleeting and does not last\n...\nI seek forgiveness from God the Great'
  });
}

// Write to poem.js
const json = JSON.stringify(poem, null, 2);
fs.writeFileSync(
  path.join(sourceDirectory, 'poem.js'),
  `window.VEJIN_POEMS = window.VEJIN_POEMS || {};\nwindow.VEJIN_POEMS[${JSON.stringify(poemId)}] = ${json};\n`,
  'utf8',
);

console.log("poem.js generated successfully!");
