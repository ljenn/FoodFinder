import React, { useState } from 'react'

export default function EventCard({ event, highlight, onSelect }) {
  const [expanded, setExpanded] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const isToday = event.date === today
  const isPast = event.date && event.date < today

  return (
    <article
      className={`event-card ${highlight ? 'highlighted' : ''} ${isPast ? 'past' : ''}`}
      onClick={() => onSelect(event)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      aria-label={`${event.name}, ${event.date}`}
    >
      <div className="card-header">
        <div>
          <h3>{event.name}</h3>
          <p className="org">{event.organization}</p>
        </div>
        <div className="badges">
          {isToday && <span className="badge today">Today</span>}
          {isPast && <span className="badge past-badge">Past</span>}
          {!event.spotsAvailable && <span className="badge full">Full</span>}
        </div>
      </div>

      <div className="card-meta">
        {event.date && <span>📅 {formatDate(event.date)}</span>}
        {event.hours && <span>🕐 {event.hours}</span>}
        {event.recurring && <span>🔁 {event.recurring}</span>}
      </div>

      <p className="address">📍 {event.address}</p>

      <div className="food-chips">
        {event.foodTypes.map((f) => (
          <span key={f} className="food-chip">{f}</span>
        ))}
      </div>

      <button
        className="details-toggle"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
        aria-expanded={expanded}
        type="button"
      >
        {expanded ? 'Hide details ▲' : 'Show details ▼'}
      </button>

      {expanded && (
        <div className="card-details">
          <p><strong>Requirements:</strong> {event.requirements || 'Contact for details'}</p>
          {event.notes && <p><strong>Notes:</strong> {event.notes}</p>}
          {event.contact && <p><strong>Contact:</strong> <a href={`tel:${event.contact}`}>{event.contact}</a></p>}
          {event.website && (
            <p>
              <strong>More info:</strong>{' '}
              <a href={event.website} target="_blank" rel="noopener noreferrer">
                {event.website}
              </a>
            </p>
          )}
          {event.source && (
            <p className="card-source">
              Source:{' '}
              {event.sourceUrl
                ? <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">{event.source}</a>
                : event.source}
            </p>
          )}
        </div>
      )}
    </article>
  )
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
