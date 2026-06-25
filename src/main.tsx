import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { PrivacyScreen } from './screens/PrivacyScreen.tsx'
import { TermsScreen } from './screens/TermsScreen.tsx'

const path = window.location.pathname

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/privacy' ? <PrivacyScreen /> : path === '/terms' ? <TermsScreen /> : <App />}
    <Analytics />
  </StrictMode>,
)
