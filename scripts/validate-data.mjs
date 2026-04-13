import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ajv = addFormats(new Ajv({ allErrors: true }));
const load = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'));

const pairs = [
  ['src/data/roster.json', 'src/data/schema/roster.schema.json'],
  ['src/data/games.json',  'src/data/schema/games.schema.json'],
  ['src/data/media.json',  'src/data/schema/media.schema.json'],
];

let failed = false;
for (const [dataPath, schemaPath] of pairs) {
  const data = load(dataPath);
  const validate = ajv.compile(load(schemaPath));
  if (!validate(data)) {
    console.error(`FAIL ${dataPath}`, validate.errors);
    failed = true;
  } else {
    console.log(`OK   ${dataPath}`);
  }
}
process.exit(failed ? 1 : 0);
