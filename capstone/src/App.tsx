import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MyLoansPage = lazy(() => import('./pages/MyLoansPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))

function App() {
  return (
    <Suspense fallback={<p>Cargando pagina...</p>}>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="books/:workId" element={<BookDetailPage />} />
          <Route
            path="my-loans"
            element={
              <ProtectedRoute>
                <MyLoansPage />
              </ProtectedRoute>
            }
          />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
