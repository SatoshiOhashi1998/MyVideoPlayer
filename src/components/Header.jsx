// src/components/Header.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Header() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setInput(searchParams.get('q') || '');
    setSearchType(searchParams.get('type') || 'all');
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (input) params.set('q', input);
    if (searchType && searchType !== 'all') params.set('type', searchType);
    navigate(`/?${params.toString()}`);
    setShowSettings(false);
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #e5e5e5', height: '56px', position: 'relative' }}>
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', width: '120px' }}>
        MyTube
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', flex: '1', justifyContent: 'center', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="検索"
          style={{ width: '100%', padding: '8px 16px', borderRadius: '20px 0 0 20px', border: '1px solid #ccc', outline: 'none' }}
        />
        
        <button 
          type="button" 
          onClick={() => setShowSettings(!showSettings)}
          title="詳細設定"
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderLeft: 'none', cursor: 'pointer', backgroundColor: showSettings ? '#eee' : '#f8f8f8' }}
        >
          ⚙️
        </button>

        <button type="submit" style={{ padding: '8px 20px', borderRadius: '0 20px 20px 0', border: '1px solid #ccc', borderLeft: 'none', cursor: 'pointer', backgroundColor: '#f8f8f8' }}>
          🔍
        </button>

        {showSettings && (
          <div ref={settingsRef} style={{ position: 'absolute', top: '45px', right: '50px', background: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, width: '200px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>検索対象</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="radio" name="searchType" value="all" checked={searchType === 'all'} onChange={(e) => setSearchType(e.target.value)} />
              デフォルト
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="radio" name="searchType" value="video" checked={searchType === 'video'} onChange={(e) => setSearchType(e.target.value)} />
              動画のみ
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="radio" name="searchType" value="audio" checked={searchType === 'audio'} onChange={(e) => setSearchType(e.target.value)} />
              音声のみ
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="radio" name="searchType" value="youtube" checked={searchType === 'youtube'} onChange={(e) => setSearchType(e.target.value)} />
              YouTubeのみ
            </label>
          </div>
        )}
      </form>

      <div style={{ width: '120px' }}></div>
    </header>
  );
}