export function readStorage<T>(key: string, fallback: T): T {
  try {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) {
      return fallback
    }
    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
