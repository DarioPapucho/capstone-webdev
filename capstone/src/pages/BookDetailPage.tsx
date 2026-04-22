import {
  Accordion,
  Box,
  Button,
  Heading,
  HStack,
  Image,
  List,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'
import { getCoverUrl, getBookDetail } from '../services/openLibrary'
import type { BookDetail, ReadingStatus } from '../types'
import { isAvailableByRule } from '../utils/availability'

type DetailLocationState = { firstPublishYear?: number }

export default function BookDetailPage() {
  const { workId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    borrowBook,
    currentUser,
    reservations,
    reserveBook,
    readingStatuses,
    updateReadingStatus,
    wishlist,
    addWishlist,
    removeWishlist,
  } = useAppContext()

  const [book, setBook] = useState<BookDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!workId) {
      return
    }
    const stableWorkId = workId

    async function fetchDetail() {
      setIsLoading(true)
      setError(null)

      try {
        const detail = await getBookDetail(stableWorkId)
        setBook(detail)
      } catch (detailError) {
        setError((detailError as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDetail()
  }, [workId])

  const isAvailable = useMemo(() => (workId ? isAvailableByRule(workId) : false), [workId])
  const queue = workId ? reservations[workId] ?? [] : []
  const isInWishlist = workId ? wishlist.includes(workId) : false
  const statusValue = workId ? readingStatuses[workId] ?? 'reading' : 'reading'

  function ensureAuth(): boolean {
    if (currentUser) {
      return true
    }
    navigate('/auth/login')
    return false
  }

  function handleBorrow() {
    if (!book || !ensureAuth()) {
      return
    }

    borrowBook({ workId: book.workId, title: book.title })
  }

  function handleReserve() {
    if (!workId || !ensureAuth()) {
      return
    }

    reserveBook(workId)
  }

  function handleReadingStatusChange(nextStatus: ReadingStatus) {
    if (!workId) {
      return
    }

    updateReadingStatus(workId, nextStatus)
  }

  function toggleWishlist() {
    if (!workId) {
      return
    }

    if (isInWishlist) {
      removeWishlist(workId)
      return
    }

    addWishlist(workId)
  }

  if (!workId) {
    return (
      <Stack>
        <Text>Libro no valido.</Text>
        <RouterLink to="/" style={{ color: '#0d9488' }}>
          Volver al catalogo
        </RouterLink>
      </Stack>
    )
  }

  if (isLoading) {
    return <Text>Cargando detalle...</Text>
  }

  if (error) {
    return <Text color="red.600">{error}</Text>
  }

  if (!book) {
    return <Text>No se encontro el libro.</Text>
  }

  const coverUrl = getCoverUrl(book.coverId, 'L')
  const yearFromCatalog = (location.state as DetailLocationState | null)?.firstPublishYear
  const displayYear = yearFromCatalog ?? book.firstPublishYear

  return (
    <Stack gap={4}>
      <Heading size="md">{book.title}</Heading>
      <Text>Autores: {book.authors.join(', ')}</Text>
      <Text>Ano: {displayYear ?? 'No disponible'}</Text>
      <Text>Estado: {isAvailable ? 'Disponible' : 'Prestado'}</Text>
      <Text>Reservas en cola: {queue.length}</Text>

      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={`Portada de ${book.title}`}
          loading="lazy"
          maxW="380px"
          w="full"
          borderRadius="md"
        />
      ) : (
        <Text color="gray.600">Sin imagen de portada</Text>
      )}

      <Box>
        <Heading size="sm" mb={2}>
          Descripcion
        </Heading>
        <Text>{book.description ?? 'Sin descripcion disponible'}</Text>
      </Box>

      {book.subjects.length ? (
        <Accordion.Root collapsible variant="outline" size="sm" defaultValue={[]}>
          <Accordion.Item value="subjects">
            <Accordion.ItemTrigger>
              <Accordion.ItemIndicator />
              <Text as="span" flex="1" textAlign="start" fontWeight="medium">
                Generos / subjects ({book.subjects.length})
              </Text>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                <List.Root ps={4} maxH="360px" overflowY="auto">
                  {book.subjects.map((subject) => (
                    <List.Item key={subject}>{subject}</List.Item>
                  ))}
                </List.Root>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      ) : (
        <Box>
          <Heading size="sm" mb={2}>
            Generos / subjects
          </Heading>
          <Text>No hay categorias disponibles</Text>
        </Box>
      )}

      <Box>
        <Heading size="sm" mb={2}>
          Acciones
        </Heading>
        <HStack wrap="wrap">
          {isAvailable ? (
            <Button type="button" onClick={handleBorrow}>
              Tomar prestado
            </Button>
          ) : (
            <Button type="button" onClick={handleReserve}>
              Reservar
            </Button>
          )}

          <Button type="button" variant="outline" onClick={toggleWishlist}>
            {isInWishlist ? 'Quitar de deseos' : 'Agregar a deseos'}
          </Button>
        </HStack>
      </Box>

      <Box>
        <Heading size="sm" mb={2}>
          Estado de lectura
        </Heading>
        <select
          value={statusValue}
          onChange={(event) =>
            handleReadingStatusChange(event.target.value as ReadingStatus)
          }
          style={{ border: '1px solid #cbd5e0', borderRadius: '6px', padding: '8px' }}
        >
          <option value="reading">Leyendo</option>
          <option value="completed">Completado</option>
          <option value="wishlist">Lista de deseos</option>
        </select>
      </Box>

      <RouterLink to="/" style={{ color: '#0d9488' }}>
        Volver al catalogo
      </RouterLink>
    </Stack>
  )
}
