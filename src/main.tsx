import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PythonProvider } from 'react-py'
import { ThemeProvider } from './theme/ThemeContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PythonProvider>
          <App />
        </PythonProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
