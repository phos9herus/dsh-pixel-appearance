import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = dirname(fileURLToPath(import.meta.url))
const root = dirname(srcDir)
const fragments = [
  '00-head.js',
  '10-engine.js',
  '20-store.js',
  '30-settings.js',
  '40-runtime.js',
  '45-response.js',
  '47-review.js',
  '99-tail.js',
]

const parts = fragments.map((file) => {
  const path = join(srcDir, file)
  const text = readFileSync(path, 'utf8').replace(/\s+$/u, '')
  return text
})

const output = [...parts, ''].join('\n')

writeFileSync(join(root, 'client.js'), output)
console.log(`client.js written (${output.length} bytes)`)
