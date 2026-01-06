import { useState } from 'react'

export default function SearchBar({ onSearch, placeholder = 'Search mail...' }) {
  const [query, setQuery] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-outlook-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-1.5 rounded text-sm text-white placeholder-outlook-text-secondary focus:outline-none focus:ring-1 focus:ring-outlook-blue transition-all"
        style={{
          background: '#2a2a2a',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="Search mail"
      />
    </div>
  )
}

