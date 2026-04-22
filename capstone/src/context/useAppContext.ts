import { useContext } from 'react'
import { AppContext } from './appContextInstance'
import type { LoanRecord } from '../types'
import { isOverdue } from '../utils/date'

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider')
  }
  return context
}

export function getLoanStatus(loan: LoanRecord): 'active' | 'overdue' | 'completed' {
  if (loan.returnedAt) {
    return 'completed'
  }

  if (isOverdue(loan.dueAt)) {
    return 'overdue'
  }

  return 'active'
}
