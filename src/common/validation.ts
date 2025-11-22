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