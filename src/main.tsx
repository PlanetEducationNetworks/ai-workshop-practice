import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { FeesPage } from './pages/FeesPage'
import { SIBLING_STUDENT } from './data/student'
import './styles.css'

// Open /#signup for the signup page (TICKET-13), /#fees or /#fees-sibling for the fees page (TICKET-14).
const Page =
  location.hash === '#signup' ? SignupPage
  : location.hash === '#fees' ? FeesPage
  : location.hash === '#fees-sibling' ? () => <FeesPage student={SIBLING_STUDENT} />
  : LoginPage

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>
)
