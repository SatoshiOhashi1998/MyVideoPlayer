import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Header.css'

const SEARCH_TYPES = [
  ['default', 'デフォルト'],
  ['video', '動画のみ'],
  ['audio', '音声のみ'],
  ['youtube', 'YouTube'],
]

export default function Header() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const settingsRef = useRef(null)
  const firstSearchTypeRef = useRef(null)
  const [input, setInput] = useState(searchParams.get('q') || '')
  const [searchType, setSearchType] = useState(searchParams.get('search_type') || 'default')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setInput(searchParams.get('q') || '')
    setSearchType(searchParams.get('search_type') || 'default')
  }, [searchParams])

  useEffect(() => {
    if (showSettings) {
      firstSearchTypeRef.current?.focus()
    }
  }, [showSettings])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()

    if (input) params.set('q', input)
    if (searchType && searchType !== 'default') params.set('search_type', searchType)

    const queryString = params.toString()
    navigate(queryString ? `/?${queryString}` : '/')
    setShowSettings(false)
  }

  return (
    <header className="app-header">
      <button className="app-logo" onClick={() => navigate('/')}>
        MyTube
      </button>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="検索"
          className="search-input"
        />

        <button
          type="button"
          onClick={() => setShowSettings((value) => !value)}
          title="詳細設定"
          className={`search-settings-button ${showSettings ? 'active' : ''}`}
        >
          ⚙️
        </button>

        <button type="submit" className="search-submit-button">🔍</button>

        {showSettings && (
          <div ref={settingsRef} className="search-settings">
            <div className="search-settings-title">検索対象</div>
            {SEARCH_TYPES.map(([value, label], index) => (
              <label key={value} className="search-type-option">
                <input
                  ref={index === 0 ? firstSearchTypeRef : null}
                  type="radio"
                  name="searchType"
                  value={value}
                  checked={searchType === value}
                  onChange={(event) => setSearchType(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        )}
      </form>

      <div className="header-spacer" />
    </header>
  )
}
