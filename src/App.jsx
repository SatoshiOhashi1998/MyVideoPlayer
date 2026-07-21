// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import VideoPlayer from './components/VideoPlayer';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <VideoPlayer />
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch" element={<Watch />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    );
}

export default App;