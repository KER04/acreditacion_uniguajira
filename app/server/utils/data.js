import { readFile, writeFile, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = join(__dirname, '../../src/data')
export const PUBLIC_DIR = join(__dirname, '../../public')

export async function readData(filename) {
  try {
    const raw = await readFile(join(DATA_DIR, filename), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function writeData(filename, data) {
  await writeFile(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export async function fileExists(path) {
  try { await access(path); return true } catch { return false }
}
