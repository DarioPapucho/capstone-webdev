import type { BookDetail, BookSummary } from '../types'

const OPEN_LIBRARY_BASE_URL =
  import.meta.env.VITE_OPEN_LIBRARY_BASE_URL ?? 'https://openlibrary.org'
const COVERS_BASE_URL =
  import.meta.env.VITE_OPEN_LIBRARY_COVERS_URL ?? 'https://covers.openlibrary.org'

interface SearchDoc {
  key: string
  title?: string
  author_name?: string[]
  first_publish_year?: number
  subject?: string[]
  cover_i?: number
  edition_count?: number
  ratings_count?: number
  want_to_read_count?: number
}

interface SearchResponse {
  docs: SearchDoc[]
  num_found: number
}

interface WorkAuthor {
  author?: {
    key?: string
  }
}

interface WorkResponse {
  key: string
  title?: string
  description?: string | { value?: string }
  subjects?: string[]
  covers?: number[]
  first_publish_date?: string
  first_publish_year?: number
  publish_date?: string
  authors?: WorkAuthor[]
}

interface AuthorResponse {
  name?: string
}

function normalizeSubjects(subjects: string[] = []): string[] {
  return [...new Set(subjects.map((subject) => subject.trim()).filter(Boolean))]
}

function workKeyToId(key: string): string {
  return key.replace('/works/', '')
}

function parseDescription(
  rawDescription: WorkResponse['description'] | undefined,
): string | undefined {
  if (!rawDescription) {
    return undefined
  }

  if (typeof rawDescription === 'string') {
    return rawDescription
  }

  return rawDescription.value
}

function parseYearFromDate(dateString?: string): number | undefined {
  if (!dateString) {
    return undefined
  }

  const match = dateString.match(/\d{4}/)
  return match ? Number(match[0]) : undefined
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })

  if (response.status === 429) {
    throw new Error('La API limitó temporalmente las peticiones. Intenta de nuevo.')
  }

  if (!response.ok) {
    throw new Error('No se pudo obtener información de Open Library.')
  }

  return (await response.json()) as T
}

function toBookSummary(doc: SearchDoc): BookSummary {
  const editionCount = doc.edition_count ?? 0
  const popularityScore =
    doc.ratings_count ?? doc.want_to_read_count ?? doc.edition_count ?? 0

  return {
    workId: workKeyToId(doc.key),
    title: doc.title ?? 'Sin título',
    authors: doc.author_name ?? ['Autor desconocido'],
    firstPublishYear: doc.first_publish_year,
    subjects: normalizeSubjects(doc.subject ?? []),
    coverId: doc.cover_i,
    editionCount,
    popularityScore,
  }
}

async function fetchAuthors(workData: WorkResponse): Promise<string[]> {
  if (!workData.authors?.length) {
    return ['Autor desconocido']
  }

  const authorRequests = workData.authors
    .map((entry) => entry.author?.key)
    .filter((key): key is string => Boolean(key))
    .map(async (key) => {
      const authorData = await fetchJson<AuthorResponse>(
        `${OPEN_LIBRARY_BASE_URL}${key}.json`,
      )
      return authorData.name?.trim()
    })

  const authorNames = (await Promise.all(authorRequests)).filter(
    (name): name is string => Boolean(name),
  )

  return authorNames.length ? authorNames : ['Autor desconocido']
}

export function getCoverUrl(coverId?: number, size: 'S' | 'M' | 'L' = 'M'): string | null {
  if (!coverId) {
    return null
  }
  return `${COVERS_BASE_URL}/b/id/${coverId}-${size}.jpg`
}

export async function searchBooks(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<{ books: BookSummary[]; totalFound: number }> {
  const url = new URL(`${OPEN_LIBRARY_BASE_URL}/search.json`)
  url.searchParams.set('q', query)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', '20')

  const data = await fetchJson<SearchResponse>(url.toString(), signal)

  return {
    books: data.docs.map(toBookSummary),
    totalFound: data.num_found,
  }
}

export async function getBookDetail(workId: string): Promise<BookDetail> {
  const workData = await fetchJson<WorkResponse>(
    `${OPEN_LIBRARY_BASE_URL}/works/${workId}.json`,
  )

  const authors = await fetchAuthors(workData)
  const firstPublishYear =
    workData.first_publish_year ??
    parseYearFromDate(workData.first_publish_date) ??
    parseYearFromDate(workData.publish_date)

  return {
    workId,
    title: workData.title ?? 'Sin título',
    authors,
    description: parseDescription(workData.description),
    firstPublishYear,
    subjects: normalizeSubjects(workData.subjects),
    coverId: workData.covers?.[0],
    editionCount: 0,
    popularityScore: 0,
  }
}
