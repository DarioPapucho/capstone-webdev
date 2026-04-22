const HASH_MODULO = 4

function hashId(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

export function isAvailableByRule(workId: string): boolean {
  const currentDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const hash = hashId(`${workId}-${currentDay}`)
  return hash % HASH_MODULO !== 0
}
