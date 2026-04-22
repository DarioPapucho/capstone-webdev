export type ReadingStatus = 'reading' | 'completed' | 'wishlist'

export interface BookSummary {
  workId: string
  title: string
  authors: string[]
  firstPublishYear?: number
  subjects: string[]
  coverId?: number
  editionCount: number
  popularityScore: number
}

export interface BookDetail extends BookSummary {
  description?: string
}

export interface LoanRecord {
  id: string
  workId: string
  title: string
  userId: string
  borrowedAt: string
  dueAt: string
  returnedAt?: string
}

export interface ReservationRecord {
  userId: string
  reservedAt: string
}

export interface UserSession {
  id: string
  name: string
}
