import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { FeesPage } from './pages/FeesPage'
import './styles.css'

// Open /#signup for the signup page (TICKET-13), /#fees for the fees page (TICKET-14).
const Page = location.hash === '#signup' ? SignupPage : location.hash === '#fees' ? FeesPage : LoginPage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>
)
