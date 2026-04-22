import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BookCard } from '../components/BookCard'
import { searchBooks } from '../services/openLibrary'
import type { BookSummary } from '../types'

type SortMode = 'author' | 'popularity' | 'year'

export default function CatalogPage() {
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [books, setBooks] = useState<BookSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalFound, setTotalFound] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('popularity')

  useEffect(() => {
    if (activeQuery.trim().length < 2) {
      return
    }

    const controller = new AbortController()

    async function runSearch() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await searchBooks(activeQuery, page, controller.signal)
        setTotalFound(result.totalFound)
        setBooks((previousBooks) =>
          page === 1 ? result.books : [...previousBooks, ...result.books],
        )
      } catch (searchError) {
        if ((searchError as Error).name === 'AbortError') {
          return
        }
        setError((searchError as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    void runSearch()

    return () => controller.abort()
  }, [activeQuery, page])

  const shownBooks = useMemo(() => {
    const sortedBooks = [...books]

    if (sortMode === 'author') {
      sortedBooks.sort((leftBook, rightBook) =>
        (leftBook.authors[0] ?? '').localeCompare(rightBook.authors[0] ?? ''),
      )
    }

    if (sortMode === 'popularity') {
      sortedBooks.sort(
        (leftBook, rightBook) => rightBook.popularityScore - leftBook.popularityScore,
      )
    }

    if (sortMode === 'year') {
      sortedBooks.sort(
        (leftBook, rightBook) =>
          (rightBook.firstPublishYear ?? 0) - (leftBook.firstPublishYear ?? 0),
      )
    }

    return sortedBooks
  }, [books, sortMode])

  const hasMore = books.length < totalFound

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanQuery = searchInput.trim()

    if (cleanQuery.length < 2) {
      setError('La busqueda requiere minimo 2 caracteres.')
      return
    }

    setPage(1)
    setBooks([])
    setActiveQuery(cleanQuery)
  }

  function handleLoadMore() {
    setPage((currentPage) => currentPage + 1)
  }

  return (
    <Stack gap={5}>
      <Heading size="md">Catalogo</Heading>

      <form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Input
            id="search"
            name="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por titulo, autor o palabra clave"
            required
            minLength={2}
            bg="white"
          />
          <Button type="submit" alignSelf="start">
            Buscar
          </Button>
        </Stack>
      </form>

      <Text color="gray.700">
        Busqueda activa:{' '}
        <strong>{activeQuery.trim() ? activeQuery : 'ninguna'}</strong> | Resultados
        cargados: {books.length} de {totalFound}
      </Text>

      <Box>
        <Text fontSize="sm" mb={1}>
          Ordenar por
        </Text>
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          style={{ border: '1px solid #cbd5e0', borderRadius: '6px', padding: '8px' }}
        >
          <option value="author">Autor</option>
          <option value="popularity">Popularidad</option>
          <option value="year">Fecha de publicacion</option>
        </select>
      </Box>

      {error && <Text color="red.600">{error}</Text>}
      {isLoading && (
        <HStack>
          <Spinner size="sm" />
          <Text>Cargando...</Text>
        </HStack>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {shownBooks.map((book) => (
          <BookCard key={book.workId} book={book} />
        ))}
      </SimpleGrid>

      {!isLoading && hasMore && (
        <Button type="button" onClick={handleLoadMore} alignSelf="start">
          Cargar mas
        </Button>
      )}
    </Stack>
  )
}
