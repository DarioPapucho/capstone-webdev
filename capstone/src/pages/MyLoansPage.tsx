import { Box, Button, Heading, List, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { getLoanStatus, useAppContext } from '../context/useAppContext'
import { formatDate } from '../utils/date'

export default function MyLoansPage() {
  const { currentUser, loans, returnBook } = useAppContext()

  const userLoans = useMemo(
    () => loans.filter((loan) => loan.userId === currentUser?.id),
    [currentUser?.id, loans],
  )

  if (!currentUser) {
    return <Text>Debes iniciar sesion para ver tus prestamos.</Text>
  }

  return (
    <Stack gap={4}>
      <Heading size="md">Mis prestamos</Heading>
      {userLoans.length === 0 ? (
        <Text>No tienes prestamos registrados.</Text>
      ) : (
        <List.Root gap={3}>
          {userLoans.map((loan) => {
            const loanStatus = getLoanStatus(loan)

            return (
              <List.Item key={loan.id} listStyleType="none">
                <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                  <Text>Titulo: {loan.title}</Text>
                  <Text>Prestamo: {formatDate(loan.borrowedAt)}</Text>
                  <Text>Vencimiento: {formatDate(loan.dueAt)}</Text>
                  <Text>Estado: {loanStatus}</Text>
                  {loan.returnedAt && <Text>Devuelto: {formatDate(loan.returnedAt)}</Text>}
                  {loanStatus !== 'completed' && (
                    <Button mt={2} size="sm" onClick={() => returnBook(loan.id)}>
                      Marcar como devuelto
                    </Button>
                  )}
                </Box>
              </List.Item>
            )
          })}
        </List.Root>
      )}
    </Stack>
  )
}
