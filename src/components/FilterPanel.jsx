import React from 'react'
import { foodTypeOptions } from '../data/mockEvents'

const RADIUS_OPTIONS = [5, 10, 25, 50]

export default function FilterPanel({ filters, onChange }) {
  const toggle = (key, value) => {
    const current = filters[key] || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: updated })
  }

  return (
    <aside className="filter-panel" aria-label="Filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <p className="filter-label">Searching near</p>
        <p className="active-zip">
          {filters.activeZip
            ? <>ZIP <strong>{filters.activeZip}</strong></>
            : 'Washington, DC (default)'}
        </p>
      </div>

      <div className="filter-group">
        <label className="filter-label" htmlFor="radius-filter">
          Within {filters.radiusMiles || 25} miles
        </label>
        <input
          id="radius-filter"
          type="range"
          min="5"
          max="50"
          step="5"
          value={filters.radiusMiles || 25}
          onChange={(e) => onChange({ ...filters, radiusMiles: Number(e.target.value) })}
          className="radius-slider"
        />
        <div className="radius-labels">
          {RADIUS_OPTIONS.map((v) => (
            <span key={v}>{v}mi</span>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="date-filter">Date</label>
        <input
          id="date-filter"
          type="date"
          value={filters.date || ''}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        />
        {filters.date && (
          <button className="clear-btn" onClick={() => onChange({ ...filters, date: '' })}>
            Clear date
          </button>
        )}
      </div>

      <div className="filter-group">
        <p className="filter-label">Food Types</p>
        <div className="chip-group">
          {foodTypeOptions.map((type) => (
            <button
              key={type}
              className={`chip ${filters.foodTypes?.includes(type) ? 'active' : ''}`}
              onClick={() => toggle('foodTypes', type)}
              type="button"
              aria-pressed={filters.foodTypes?.includes(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <p className="filter-label">Requirements</p>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.noRequirements || false}
            onChange={(e) => onChange({ ...filters, noRequirements: e.target.checked })}
          />
          No requirements only
        </label>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.spotsAvailable || false}
            onChange={(e) => onChange({ ...filters, spotsAvailable: e.target.checked })}
          />
          Spots available only
        </label>
      </div>

      <button
        className="clear-all-btn"
        onClick={() => onChange({ foodTypes: [], radiusMiles: filters.radiusMiles, searchCenter: filters.searchCenter })}
        type="button"
      >
        Clear all filters
      </button>
    </aside>
  )
}
