import { Route, Routes } from 'react-router-dom'
import HomePage from '../features/library/pages/HomePage.jsx'
import WatchPage from '../features/watch/pages/WatchPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/watch" element={<WatchPage />} />
    </Routes>
  )
}
