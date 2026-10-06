import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import App from './App'
import './styles/tokens.css'
import './styles/app.css'
import './styles/plan.css'
import './styles/admin.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </HashRouter>
  </StrictMode>
)
