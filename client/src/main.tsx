import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Default dark theme before React loads (prevents light flash)
const root = document.documentElement
root.classList.remove('theme-light')
root.classList.add('theme-dark')
try {
  const stored = localStorage.getItem('interviewiq-display-settings')
  if (stored) {
    const parsed = JSON.parse(stored) as { theme?: string }
    if (parsed.theme === 'light') {
      root.classList.remove('theme-dark')
      root.classList.add('theme-light')
    }
  }
} catch {
  /* keep dark default */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
