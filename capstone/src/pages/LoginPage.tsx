import { Box, Button, Container, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, currentUser } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const cleanUser = username.trim()
    if (cleanUser.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres.')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    const ok = login(cleanUser, password)
    if (!ok) {
      setError('Usuario o contraseña incorrectos.')
      return
    }

    navigate(redirectPath)
  }

  if (currentUser) {
    return (
      <Container maxW="md" py={10}>
        <Stack gap={3}>
          <Text>Ya iniciaste sesion como {currentUser.name}.</Text>
          <RouterLink to="/" style={{ color: '#0d9488' }}>
            Ir al catalogo
          </RouterLink>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxW="md" py={10}>
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Heading size="md">Iniciar sesion</Heading>
            <Text fontSize="sm" color="gray.600">
              Cuentas demo: usuario <strong>dario</strong> / contraseña{' '}
              <strong>password</strong>
            </Text>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Usuario"
              required
              minLength={3}
              bg="white"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contraseña"
              required
              minLength={4}
              bg="white"
            />
            <Button type="submit" alignSelf="start">
              Entrar
            </Button>
            {error && <Text color="red.600">{error}</Text>}
            <RouterLink to="/" style={{ color: '#0d9488', fontSize: '14px' }}>
              Volver al catalogo sin iniciar sesion
            </RouterLink>
          </Stack>
        </form>
      </Box>
    </Container>
  )
}
