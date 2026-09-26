import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import Header from '../components/layout/Header.jsx'
import UniversalPlayer from '../features/player/components/UniversalPlayer.jsx'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <UniversalPlayer />
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
