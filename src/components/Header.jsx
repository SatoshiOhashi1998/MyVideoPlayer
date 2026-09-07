// src/components/Header.jsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [searchParams] = useSearchParams();

  const [input, setInput] = useState(
    searchParams.get('q') || ''
  );

  const [searchType, setSearchType] = useState(
    searchParams.get('search_type') || 'default'
  );

  const [showSettings, setShowSettings] = useState(false);

  const settingsRef = useRef(null);

  const navigate = useNavigate();


  /* =========================
     URLパラメータ変更時
     ========================= */

  useEffect(() => {
    setInput(searchParams.get('q') || '');
    setSearchType(
      searchParams.get('search_type') || 'default'
    );
  }, [searchParams]);


  /* =========================
     設定メニュー外クリック
     ========================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);


  /* =========================
     検索
     ========================= */

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (input) {
      params.set('q', input);
    }

    if (
      searchType &&
      searchType !== 'default'
    ) {
      params.set('search_type', searchType);
    }

    navigate(`/?${params.toString()}`);

    setShowSettings(false);
  };


  return (
    <header className="app-header">

      {/* ロゴ */}
      <div
        className="app-logo"
        onClick={() => navigate('/')}
      >
        MyTube
      </div>


      {/* 検索 */}
      <form
        className="search-form"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="検索"
          className="search-input"
        />


        {/* 詳細設定 */}
        <button
          type="button"
          onClick={() =>
            setShowSettings(!showSettings)
          }
          title="詳細設定"
          className={`search-settings-button ${
            showSettings ? 'active' : ''
          }`}
        >
          ⚙️
        </button>


        {/* 検索ボタン */}
        <button
          type="submit"
          className="search-submit-button"
        >
          🔍
        </button>


        {/* 検索設定メニュー */}
        {showSettings && (
          <div
            ref={settingsRef}
            className="search-settings"
          >

            <div className="search-settings-title">
              検索対象
            </div>


            <label className="search-type-option">
              <input
                type="radio"
                name="searchType"
                value="default"
                checked={searchType === 'default'}
                onChange={(e) =>
                  setSearchType(e.target.value)
                }
              />
              デフォルト
            </label>


            <label className="search-type-option">
              <input
                type="radio"
                name="searchType"
                value="video"
                checked={searchType === 'video'}
                onChange={(e) =>
                  setSearchType(e.target.value)
                }
              />
              動画のみ
            </label>


            <label className="search-type-option">
              <input
                type="radio"
                name="searchType"
                value="audio"
                checked={searchType === 'audio'}
                onChange={(e) =>
                  setSearchType(e.target.value)
                }
              />
              音声のみ
            </label>


            <label className="search-type-option">
              <input
                type="radio"
                name="searchType"
                value="youtube"
                checked={searchType === 'youtube'}
                onChange={(e) =>
                  setSearchType(e.target.value)
                }
              />
              YouTube
            </label>

          </div>
        )}

      </form>


      {/* 左右の幅を揃える */}
      <div className="header-spacer" />

    </header>
  );
}