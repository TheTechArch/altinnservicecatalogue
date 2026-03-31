import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LangProvider } from './lang'
import { EnvProvider } from './env'
import { ThemeProvider } from './theme'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <EnvProvider>
            <App />
          </EnvProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
