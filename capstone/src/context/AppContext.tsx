import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AppContext } from './appContextInstance'
import { calculateDueDate } from '../utils/date'
import { readStorage, writeStorage } from '../utils/storage'
import type { LoanRecord, ReadingStatus, UserSession } from '../types'

const AUTH_KEY = 'capstone.auth'
const LOANS_KEY = 'capstone.loans'
const RESERVATIONS_KEY = 'capstone.reservations'
const READING_KEY = 'capstone.reading-status'
const WISHLIST_KEY = 'capstone.wishlist'

function normalizeUserId(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, '-')
}

const SIMULATED_ACCOUNTS: Record<string, string> = {
  dario: 'password',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() =>
    readStorage<UserSession | null>(AUTH_KEY, null),
  )
  const [loans, setLoans] = useState<LoanRecord[]>(() =>
    readStorage<LoanRecord[]>(LOANS_KEY, []),
  )
  const [reservations, setReservations] = useState<Record<string, { userId: string; reservedAt: string }[]>>(() =>
    readStorage<Record<string, { userId: string; reservedAt: string }[]>>(
      RESERVATIONS_KEY,
      {},
    ),
  )
  const [readingStatuses, setReadingStatuses] = useState<Record<string, ReadingStatus>>(
    () => readStorage<Record<string, ReadingStatus>>(READING_KEY, {}),
  )
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage<string[]>(WISHLIST_KEY, []),
  )

  useEffect(() => {
    writeStorage(AUTH_KEY, currentUser)
  }, [currentUser])

  useEffect(() => {
    writeStorage(LOANS_KEY, loans)
  }, [loans])

  useEffect(() => {
    writeStorage(RESERVATIONS_KEY, reservations)
  }, [reservations])

  useEffect(() => {
    writeStorage(READING_KEY, readingStatuses)
  }, [readingStatuses])

  useEffect(() => {
    writeStorage(WISHLIST_KEY, wishlist)
  }, [wishlist])

  const login = useCallback((username: string, password: string) => {
    const cleanUser = username.trim()
    const expectedPassword = SIMULATED_ACCOUNTS[cleanUser.toLowerCase()]

    if (!expectedPassword || password !== expectedPassword) {
      return false
    }

    setCurrentUser({
      id: normalizeUserId(cleanUser),
      name: cleanUser,
    })
    return true
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const borrowBook = useCallback(
    ({ workId, title }: { workId: string; title: string }) => {
      if (!currentUser) {
        return
      }

      const borrowedAt = new Date().toISOString()
      const dueAt = calculateDueDate(borrowedAt)

      setLoans((previousLoans) => [
        {
          id: `${workId}-${currentUser.id}-${borrowedAt}`,
          workId,
          title,
          userId: currentUser.id,
          borrowedAt,
          dueAt,
        },
        ...previousLoans,
      ])
    },
    [currentUser],
  )

  const reserveBook = useCallback(
    (workId: string) => {
      if (!currentUser) {
        return
      }

      setReservations((previousReservations) => {
        const currentQueue = previousReservations[workId] ?? []
        const alreadyReserved = currentQueue.some(
          (entry) => entry.userId === currentUser.id,
        )

        if (alreadyReserved) {
          return previousReservations
        }

        return {
          ...previousReservations,
          [workId]: [
            ...currentQueue,
            { userId: currentUser.id, reservedAt: new Date().toISOString() },
          ],
        }
      })
    },
    [currentUser],
  )

  const returnBook = useCallback((loanId: string) => {
    setLoans((previousLoans) =>
      previousLoans.map((loan) => {
        if (loan.id !== loanId || loan.returnedAt) {
          return loan
        }

        return {
          ...loan,
          returnedAt: new Date().toISOString(),
        }
      }),
    )
  }, [])

  const updateReadingStatus = useCallback((workId: string, status: ReadingStatus) => {
    setReadingStatuses((previousStatuses) => ({
      ...previousStatuses,
      [workId]: status,
    }))
  }, [])

  const addWishlist = useCallback((workId: string) => {
    setWishlist((previousWishlist) => {
      if (previousWishlist.includes(workId)) {
        return previousWishlist
      }
      return [...previousWishlist, workId]
    })
  }, [])

  const removeWishlist = useCallback((workId: string) => {
    setWishlist((previousWishlist) =>
      previousWishlist.filter((storedWorkId) => storedWorkId !== workId),
    )
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      loans,
      reservations,
      readingStatuses,
      wishlist,
      login,
      logout,
      borrowBook,
      reserveBook,
      returnBook,
      updateReadingStatus,
      addWishlist,
      removeWishlist,
    }),
    [
      addWishlist,
      borrowBook,
      currentUser,
      loans,
      login,
      logout,
      readingStatuses,
      removeWishlist,
      reservations,
      reserveBook,
      returnBook,
      updateReadingStatus,
      wishlist,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
