import { Box, Heading, Image, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { getCoverUrl } from '../services/openLibrary'
import type { BookSummary } from '../types'

interface BookCardProps {
  book: BookSummary
}

export function BookCard({ book }: BookCardProps) {
  const coverUrl = getCoverUrl(book.coverId, 'M')

  return (
    <RouterLink
      to={`/books/${book.workId}`}
      state={{ firstPublishYear: book.firstPublishYear }}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
      }}
    >
      <Box
        borderWidth="1px"
        borderRadius="md"
        p={4}
        bg="gray.50"
        h="100%"
        cursor="pointer"
        transition="background 0.15s ease"
        _hover={{ bg: 'gray.100' }}
      >
        <VStack align="start" gap={2}>
          <Heading size="sm">{book.title}</Heading>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Portada de ${book.title}`}
              loading="lazy"
              borderRadius="sm"
              maxH="300px"
              maxW="100%"
              w="full"
              objectFit="cover"
              pointerEvents="none"
            />
          ) : (
            <Text fontSize="sm" color="gray.600">
              Sin portada disponible
            </Text>
          )}
          <Text fontSize="sm">Autor(es): {book.authors.join(', ')}</Text>
          <Text fontSize="sm">Publicacion: {book.firstPublishYear ?? 'No disponible'}</Text>
          <Text fontSize="sm">Ediciones: {book.editionCount}</Text>
          <Text fontSize="sm">Popularidad: {book.popularityScore}</Text>
        </VStack>
      </Box>
    </RouterLink>
  )
}
