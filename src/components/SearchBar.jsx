import React, { useState } from 'react'

export default function SearchBar({ onSearch, onLocate, loading }) {
  const [zip, setZip] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (zip.trim()) onSearch(zip.trim())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        placeholder="Enter zip code (e.g. 20001)"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        maxLength={10}
        aria-label="Zip code search"
      />
      <button type="submit" disabled={loading}>Search</button>
      <button type="button" onClick={onLocate} disabled={loading} className="locate-btn">
        📍 Use My Location
      </button>
    </form>
  )
}
