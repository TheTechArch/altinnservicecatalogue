import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LangProvider } from './lang'
import { EnvProvider } from './env'
import '@digdir/designsystemet-theme'
import '@digdir/designsystemet-css/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <EnvProvider>
          <App />
        </EnvProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
)
