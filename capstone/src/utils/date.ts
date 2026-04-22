const LOAN_DAYS = 14

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function calculateDueDate(fromDateIso: string): string {
  const date = new Date(fromDateIso)
  date.setDate(date.getDate() + LOAN_DAYS)
  return date.toISOString()
}

export function isOverdue(dueAtIso: string): boolean {
  return new Date(dueAtIso).getTime() < Date.now()
}
