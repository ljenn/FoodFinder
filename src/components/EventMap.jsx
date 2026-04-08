import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [16, 26],
  iconAnchor: [8, 26],
  popupAnchor: [1, -22],
  shadowSize: [26, 26],
})

const highlightIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [16, 26],
  iconAnchor: [8, 26],
  popupAnchor: [1, -22],
  shadowSize: [26, 26],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [16, 26],
  iconAnchor: [8, 26],
  shadowSize: [26, 26],
})

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 13)
  }, [center, map])
  return null
}

export default function EventMap({ events, selectedEvent, userLocation, searchCenter, onSelect }) {
  // Initial center: user location > search result > first event > DC default
  const initialCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : searchCenter
    ? [searchCenter.lat, searchCenter.lng]
    : events.length > 0
    ? [events[0].lat, events[0].lng]
    : [38.9072, -77.0369] // Washington DC

  // Recenter priority: explicit search > user location
  const recenterTarget = searchCenter
    ? [searchCenter.lat, searchCenter.lng]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : null

  return (
    <MapContainer center={initialCenter} zoom={12} className="map-container" aria-label="Map of food events">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={recenterTarget} />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.lat, event.lng]}
          icon={selectedEvent?.id === event.id ? highlightIcon : new L.Icon.Default()}
          eventHandlers={{ click: () => onSelect(event) }}
        >
          <Popup maxWidth={280}>
            <div className="map-popup">
              <strong className="popup-name">{event.name}</strong>
              {event.organization && <p className="popup-org">{event.organization}</p>}
              <p className="popup-address">📍 {event.address}</p>
              {(event.date || event.hours || event.recurring) && (
                <p className="popup-meta">
                  {event.date && <span>📅 {event.date} · </span>}
                  {event.hours && <span>🕐 {event.hours}</span>}
                  {event.recurring && <span> · 🔁 {event.recurring}</span>}
                </p>
              )}
              {event.foodTypes?.length > 0 && (
                <div className="popup-chips">
                  {event.foodTypes.map((f) => (
                    <span key={f} className="food-chip">{f}</span>
                  ))}
                </div>
              )}
              {event.requirements && (
                <p className="popup-detail"><strong>Requirements:</strong> {event.requirements}</p>
              )}
              {event.notes && (
                <p className="popup-detail"><strong>Notes:</strong> {event.notes}</p>
              )}
              {event.contact && (
                <p className="popup-detail"><strong>Contact:</strong> <a href={`tel:${event.contact}`}>{event.contact}</a></p>
              )}
              {event.website && (
                <p className="popup-detail">
                  <a href={event.website} target="_blank" rel="noopener noreferrer">More info →</a>
                </p>
              )}
              {event.source && (
                <p className="popup-source">
                  Source:{' '}
                  {event.sourceUrl
                    ? <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">{event.source}</a>
                    : event.source}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your location</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
