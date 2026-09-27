import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import SetupScreen from './screens/SetupScreen'
import LiveScreen from './screens/LiveScreen'
import FeedbackScreen from './screens/FeedbackScreen'

const router = createBrowserRouter([
  { path: '/', element: <SetupScreen /> },
  { path: '/live', element: <LiveScreen /> },
  { path: '/feedback', element: <FeedbackScreen /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
