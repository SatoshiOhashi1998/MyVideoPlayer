// src/components/Header.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?q=${input}`);
  };

  return (
    <header style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #e5e5e5', height: '56px' }}>
      {/* 左側のロゴエリア */}
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', width: '120px' }}>
        MyTube
      </div>

      {/* 中央の検索バー */}
      <form onSubmit={handleSearch} style={{ display: 'flex', flex: '1', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="検索"
          style={{ width: '100%', padding: '8px 16px', borderRadius: '20px 0 0 20px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '8px 20px', borderRadius: '0 20px 20px 0', border: '1px solid #ccc', borderLeft: 'none', cursor: 'pointer', backgroundColor: '#f8f8f8' }}>
          🔍
        </button>
      </form>

      {/* 右側の隙間調整用（ロゴと幅を合わせる） */}
      <div style={{ width: '120px' }}></div>
    </header>
  );
}
