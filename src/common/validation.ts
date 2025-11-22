export function ensureString(value: unknown, min = 1, max = 256): string {
  if (typeof value !== 'string') throw new Error('VALIDATION_ERROR')
  const v = value.trim()
  if (v.length < min || v.length > max) throw new Error('VALIDATION_ERROR')
  return v
}

export function ensureArrayOfStrings(value: unknown, min = 0): string[] {
  if (!Array.isArray(value)) throw new Error('VALIDATION_ERROR')
  const arr = value.map(v => ensureString(v))
  if (arr.length < min) throw new Error('VALIDATION_ERROR')
  return arr
}

export function ensureNumber(value: unknown, min?: number, max?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) throw new Error('VALIDATION_ERROR')
  let n = value
  if (typeof min === 'number') n = Math.max(min, n)
  if (typeof max === 'number') n = Math.min(max, n)
  return n
}