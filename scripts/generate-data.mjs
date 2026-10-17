import { readFile, writeFile } from 'node:fs/promises'
import { generateDataset } from '../src/data/generate.ts'

const destination = new URL('../src/data/temperatures-2025.json', import.meta.url)
const expected = `${JSON.stringify(generateDataset(), null, 2)}\n`

if (process.argv.includes('--check')) {
  const actual = await readFile(destination, 'utf8')
  if (actual !== expected) {
    throw new Error('Bundled data differs from the deterministic generator. Run npm run data:generate.')
  }
  console.log('Dataset matches generator: 365 dates, 1,095 temperatures, seed 5132025.')
} else {
  await writeFile(destination, expected)
  console.log('Generated src/data/temperatures-2025.json.')
}
