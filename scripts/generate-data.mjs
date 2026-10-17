import { readFile, writeFile } from 'node:fs/promises'
import { generateDataset } from '../src/data/generate.ts'

const destination = new URL('../src/data/temperatures-2025.json', import.meta.url)
const expected = `${JSON.stringify(generateDataset(), null, 2)}\n`

if (process.argv.includes('--check')) {
  const actual = await readFile(destination, 'utf8')
  if (actual !== expected) {
    throw new Error('Bundled data differs from the deterministic generator. Run npm run data:generate.')
  }
  const dataset = JSON.parse(expected)
  const total = dataset.days.reduce((sum, day) => sum + Object.keys(day.temperaturesC).length, 0)
  const missing = dataset.days.reduce((sum, day) => sum + Object.values(day.temperaturesC).filter((value) => value === null).length, 0)
  console.log(`Dataset matches generator: ${dataset.days.length} dates, ${total} temperatures (${missing} documented gaps), seed ${dataset.metadata.seed}.`)
} else {
  await writeFile(destination, expected)
  console.log('Generated src/data/temperatures-2025.json.')
}
