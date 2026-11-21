import { readFileSync } from 'node:fs';

const file = 'src/features/orders/orders.ts';
const bad = /\bany\b|@ts-ignore|@ts-nocheck|as unknown as/;
const hits = readFileSync(file, 'utf8').split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => bad.test(l));
if (hits.length) {
  for (const [n, l] of hits) console.error(`${file}:${n}: ${l.trim()}`);
  process.exit(1);
}
