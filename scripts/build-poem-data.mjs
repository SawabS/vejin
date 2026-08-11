import fs from 'node:fs';
import path from 'node:path';

const [, , sourceDirectory, poemId] = process.argv;

if (!sourceDirectory || !poemId) {
  console.error('Usage: node scripts/build-poem-data.mjs <source-directory> <poem-id>');
  process.exit(1);
}

const naturalPartOrder = (a, b) => {
  const number = name => Number(name.match(/part-(\d+)/)?.[1] ?? 0);
  return number(a) - number(b);
};

function extractLines(language) {
  const files = fs.readdirSync(sourceDirectory)
    .filter(name => name.startsWith(`${language}-part-`) && name.endsWith('.md'))
    .sort(naturalPartOrder);

  if (!files.length) throw new Error(`No ${language} source parts found in ${sourceDirectory}`);

  return files.flatMap(file => {
    const raw = fs.readFileSync(path.join(sourceDirectory, file), 'utf8');
    const lines = raw.split(/\r?\n/);
    const contentStart = lines.findIndex(line => /^(?:Font:|فۆنت:).+1416182024\s*$/u.test(line));
    if (contentStart < 0) throw new Error(`Could not find the poem start marker in ${file}`);

    return lines.slice(contentStart + 1).filter(line => {
      const text = line.trim();
      return text && !/^[0-9٠-٩]+$/u.test(text) && !text.startsWith('[');
    });
  });
}

const ck = extractLines('ck');
const nk = extractLines('nk');

if (ck.length !== nk.length) {
  throw new Error(`Script mismatch: ck has ${ck.length} lines while nk has ${nk.length}`);
}
if (ck.length % 2 !== 0) {
  throw new Error(`Expected qesîde couplets, but found an odd line count (${ck.length})`);
}

const poem = [];
for (let index = 0; index < ck.length; index += 2) {
  poem.push({
    stanza: index / 2 + 1,
    kurdish_ar: `${ck[index]}\n${ck[index + 1]}`,
    kurmanji_lat: `${nk[index]}\n${nk[index + 1]}`,
  });
}

const translationsPath = path.join(sourceDirectory, 'poem_translations.json');
let runtimePoem = poem;

if (fs.existsSync(translationsPath)) {
  const translated = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
  if (translated.length !== poem.length) {
    throw new Error(`Translation mismatch: expected ${poem.length} stanzas, found ${translated.length}`);
  }

  translated.forEach((stanza, index) => {
    const source = poem[index];
    if (stanza.stanza !== source.stanza ||
        stanza.kurdish_ar !== source.kurdish_ar ||
        stanza.kurmanji_lat !== source.kurmanji_lat) {
      throw new Error(`Translated source text differs at stanza ${source.stanza}`);
    }
    for (const language of ['arabic', 'english']) {
      const lines = String(stanza[language] || '').split('\n').filter(line => line.trim());
      if (lines.length !== 2) {
        throw new Error(`Expected two ${language} lines at stanza ${source.stanza}`);
      }
    }
  });
  runtimePoem = translated;
}

const json = JSON.stringify(runtimePoem, null, 2);
fs.writeFileSync(
  path.join(sourceDirectory, 'poem.js'),
  `window.VEJIN_POEMS = window.VEJIN_POEMS || {};\nwindow.VEJIN_POEMS[${JSON.stringify(poemId)}] = ${json};\n`,
  'utf8',
);

console.log(
  `Built ${poem.length} paired stanzas (${ck.length} lines per script)` +
  (runtimePoem === poem ? '.' : ' with Arabic and English translations.'),
);
