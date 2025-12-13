import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createHashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

import HomePage from './pages/HomePage'
import NewStudentPage from './pages/NewStudentPage'
import StudentDetailPage from './pages/StudentDetailPage'
import NewFormPage from './pages/NewFormPage'
import FormDetailPage from './pages/FormDetailPage'
import PrintFormPage from './pages/PrintFormPage'

const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/students/new', element: <NewStudentPage /> },
  { path: '/students/:studentId', element: <StudentDetailPage /> },
  { path: '/students/:studentId/forms/new', element: <NewFormPage /> },
  { path: '/students/:studentId/forms/:formId', element: <FormDetailPage /> },
  { path: '/students/:studentId/forms/:formId/print', element: <PrintFormPage /> },
  { path: '/students/:studentId/forms/:formId/pdf', element: <PrintFormPage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
