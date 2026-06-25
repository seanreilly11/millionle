import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { PrivacyScreen } from './screens/PrivacyScreen.tsx'

const isPrivacy = window.location.pathname === '/privacy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPrivacy ? <PrivacyScreen /> : <App />}
    <Analytics />
  </StrictMode>,
)
