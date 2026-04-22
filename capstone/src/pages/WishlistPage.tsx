import { Box, Button, Heading, List, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'
import { isAvailableByRule } from '../utils/availability'

export default function WishlistPage() {
  const { wishlist, removeWishlist } = useAppContext()

  const availableNow = useMemo(
    () => wishlist.filter((workId) => isAvailableByRule(workId)),
    [wishlist],
  )

  const alerts = useMemo(
    () =>
      availableNow.map((workId) => `El libro ${workId} esta disponible ahora.`),
    [availableNow],
  )

  return (
    <Stack gap={4}>
      <Heading size="md">Lista de deseos</Heading>

      {alerts.length > 0 && (
        <Box borderWidth="1px" borderRadius="md" p={3} bg="green.50">
          <Heading size="sm" mb={2}>
            Avisos
          </Heading>
          <List.Root ps={4}>
            {alerts.map((message) => (
              <List.Item key={message}>{message}</List.Item>
            ))}
          </List.Root>
        </Box>
      )}

      {wishlist.length === 0 ? (
        <Text>No tienes libros en deseos.</Text>
      ) : (
        <List.Root gap={2}>
          {wishlist.map((workId) => (
            <List.Item key={workId} listStyleType="none">
              <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                <RouterLink to={`/books/${workId}`} style={{ color: '#0f766e' }}>
                  {workId}
                </RouterLink>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  ml={3}
                  onClick={() => removeWishlist(workId)}
                >
                  Quitar
                </Button>
              </Box>
            </List.Item>
          ))}
        </List.Root>
      )}
    </Stack>
  )
}
