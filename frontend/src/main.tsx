import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import LiveScreen from './screens/LiveScreen'
import FeedbackScreen from './screens/FeedbackScreen'
import MascotScreen from './screens/MascotScreen'

const router = createBrowserRouter([
  { path: '/', element: <HomeScreen /> },
  { path: '/setup', element: <SetupScreen /> },
  { path: '/live', element: <LiveScreen /> },
  { path: '/feedback', element: <FeedbackScreen /> },
  { path: '/maskot', element: <MascotScreen /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
