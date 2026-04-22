import { createContext } from 'react'
import type {
  LoanRecord,
  ReadingStatus,
  ReservationRecord,
  UserSession,
} from '../types'

export interface ReservationMap {
  [workId: string]: ReservationRecord[]
}

export interface ReadingStatusMap {
  [workId: string]: ReadingStatus
}

export interface AppContextValue {
  currentUser: UserSession | null
  loans: LoanRecord[]
  reservations: ReservationMap
  readingStatuses: ReadingStatusMap
  wishlist: string[]
  login: (username: string, password: string) => boolean
  logout: () => void
  borrowBook: (payload: { workId: string; title: string }) => void
  reserveBook: (workId: string) => void
  returnBook: (loanId: string) => void
  updateReadingStatus: (workId: string, status: ReadingStatus) => void
  addWishlist: (workId: string) => void
  removeWishlist: (workId: string) => void
}

export const AppContext = createContext<AppContextValue | undefined>(undefined)
