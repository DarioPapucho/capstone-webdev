import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Separator,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'

const linkStyle = {
  color: '#0d9488',
  fontWeight: 600,
  textDecoration: 'none',
}

export function Layout() {
  const { currentUser, logout } = useAppContext()

  return (
    <Container maxW="5xl" py={6}>
      <Box borderWidth="1px" borderRadius="lg" p={5} bg="white" shadow="sm">
        <Heading size="lg" mb={1}>
          Biblioteca Universitaria
        </Heading>
        <Text color="gray.600" mb={4}>
          Catalogo digital para prestamos y reservas
        </Text>

        <HStack wrap="wrap" gap={3} mb={4}>
          <RouterLink to="/" style={linkStyle}>
            Catalogo
          </RouterLink>
          <NavLink to="/my-loans" style={linkStyle}>
            Mis prestamos
          </NavLink>
          <NavLink to="/wishlist" style={linkStyle}>
            Deseos
          </NavLink>
          {currentUser ? (
            <Button size="sm" onClick={logout}>
              Cerrar sesion ({currentUser.name})
            </Button>
          ) : (
            <NavLink to="/auth/login" style={linkStyle}>
              Login
            </NavLink>
          )}
        </HStack>

        <Separator mb={4} />
        <Outlet />
      </Box>
    </Container>
  )
}
