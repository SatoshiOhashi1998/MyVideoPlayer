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
        <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <h1>My Video App</h1>
        </header>
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