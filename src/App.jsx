import React, { useState, useMemo, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import EventCard from './components/EventCard'
import EventMap from './components/EventMap'
import { fetchAllEvents, dataSources, curatedEvents } from './data/fetchEvents'
import { distanceMiles } from './utils/distance'

export default function App() {
  // Start with curated data immediately — no blank screen or flicker
  const [events, setEvents] = useState(curatedEvents)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const DC_DEFAULT = { lat: 38.9072, lng: -77.0369, zip: '20001' }

  const [filters, setFilters] = useState({
    foodTypes: [],
    searchCenter: DC_DEFAULT,
    radiusMiles: 25,
    activeZip: DC_DEFAULT.zip,
  })
  const [view, setView] = useState('list')
  const [searched] = useState(true)
  const [error, setError] = useState('')
  const [showSources, setShowSources] = useState(false)
  const [searchCenter, setSearchCenter] = useState(DC_DEFAULT)
  const [lastUpdated, setLastUpdated] = useState(() => {
    const ts = parseInt(localStorage.getItem('foodfinder_events_ts') || '0', 10)
    return ts ? new Date(ts) : null
  })

  // Load data on mount, then refresh every 24 hours.
  // Uses localStorage to avoid redundant fetches across page reloads.
  useEffect(() => {
    const CACHE_KEY = 'foodfinder_events'
    const CACHE_TS_KEY = 'foodfinder_events_ts'
    const TTL = 24 * 60 * 60 * 1000 // 24 hours in ms

    async function loadEvents(force = false) {
      const cachedTs = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0', 10)
      const isStale = Date.now() - cachedTs > TTL

      if (!force && !isStale) {
        // Use cached data if fresh
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
          if (cached?.length > 0) {
            setEvents(cached)
            setLoading(false)
            return
          }
        } catch { /* fall through to fetch */ }
      }

      try {
        const results = await fetchAllEvents()
        if (results.length > 0) {
          setEvents(results)
          localStorage.setItem(CACHE_KEY, JSON.stringify(results))
          localStorage.setItem(CACHE_TS_KEY, String(Date.now()))
          setLastUpdated(new Date())
        }
      } catch {
        // Curated data already showing — silently ignore
      } finally {
        setLoading(false)
      }
    }

    loadEvents()

    // Re-check every 24 hours while the tab is open
    const interval = setInterval(() => loadEvents(true), TTL)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (zip) => {
    setError('')
    const zipStr = zip.replace(/\D/g, '').slice(0, 5)
    if (!zipStr) return
    setFilters((f) => ({ ...f, zipSearch: zipStr }))

    // Geocode the zip to recenter the map (Nominatim, free, no key needed)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipStr}&country=US&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        const center = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        setSearchCenter(center)
        setFilters((f) => ({ ...f, searchCenter: center, radiusMiles: f.radiusMiles || 25, activeZip: zipStr }))
      }
    } catch {
      // Map won't recenter but search filter still works
    }
  }

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setView('map')
      },
      () => {
        setError('Unable to retrieve your location. Please enter a zip code.')
      }
    )
  }

  const filtered = useMemo(() => {
    return events.filter((e) => {
      // Distance filter — only active after a zip search
      if (filters.searchCenter && e.lat && e.lng) {
        const miles = distanceMiles(
          filters.searchCenter.lat, filters.searchCenter.lng,
          e.lat, e.lng
        )
        if (miles > (filters.radiusMiles || 25)) return false
      }
      if (filters.date && e.date && e.date !== filters.date) return false
      if (filters.foodTypes?.length > 0) {
        const hasType = filters.foodTypes.some((t) => e.foodTypes?.includes(t))
        if (!hasType) return false
      }
      if (filters.noRequirements) {
        const req = (e.requirements || '').toLowerCase()
        if (!req.startsWith('none') && req !== '') return false
      }
      if (filters.spotsAvailable && !e.spotsAvailable) return false
      return true
    })
  }, [events, filters])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🥦</span>
            <div>
              <h1>Food Finder</h1>
              <p>Free food events near you</p>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} onLocate={handleLocate} loading={loading} />
        </div>
      </header>

      <main className="app-body">
        <FilterPanel filters={filters} onChange={setFilters} />

        <section className="results-section">
          {error && <div className="error-banner" role="alert">{error}</div>}

          <div className="results-toolbar">
            <div>
              <p className="results-count">
                {loading
                  ? `${filtered.length} events (loading more…)`
                  : `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`}
              </p>
              {lastUpdated && (
                <p className="last-updated">
                  Updated {lastUpdated.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              )}
            </div>
            <div className="view-toggle" role="group" aria-label="View toggle">
              <button
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                type="button"
              >
                List
              </button>
              <button
                className={view === 'map' ? 'active' : ''}
                onClick={() => setView('map')}
                type="button"
              >
                Map
              </button>
            </div>
          </div>

          {view === 'map' ? (
            <EventMap
              events={filtered}
              selectedEvent={selectedEvent}
              userLocation={userLocation}
              searchCenter={searchCenter}
              onSelect={setSelectedEvent}
            />
          ) : (
            <div className="event-list">
              {filtered.length === 0 && !loading && (
                <p className="no-results">No events match your filters. Try adjusting them.</p>
              )}
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  highlight={selectedEvent?.id === event.id}
                  onSelect={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Live data from{' '}
          <a href="https://opendata.dc.gov/datasets/DCGIS::capital-area-food-bank-emergency-food-provider" target="_blank" rel="noopener noreferrer">DC Open Data</a>,{' '}
          <a href="https://www.princegeorgescountymd.gov/departments-offices/food-pantry-services" target="_blank" rel="noopener noreferrer">Prince George's County DSS</a>,{' '}
          <a href="https://extension.umd.edu/resource/food-access-resources/" target="_blank" rel="noopener noreferrer">UMD Extension</a>, and{' '}
          <a href="https://mda.maryland.gov/" target="_blank" rel="noopener noreferrer">Maryland Dept. of Agriculture</a>.
          {' '}For emergencies, call <a href="tel:211">211</a> or visit{' '}
          <a href="https://www.capitalareafoodbank.org/find-food-assistance/" target="_blank" rel="noopener noreferrer">
            Capital Area Food Bank
          </a>.
        </p>
        <button className="sources-toggle" onClick={() => setShowSources(!showSources)} type="button">
          {showSources ? 'Hide data sources ▲' : 'View data sources ▼'}
        </button>
        {showSources && (
          <ul className="sources-list">
            {dataSources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
                {' '}— {s.publisher} ({s.license})
              </li>
            ))}
          </ul>
        )}
      </footer>
    </div>
  )
}
