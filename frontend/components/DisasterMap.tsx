"use client"

import { useState } from "react"
import Link from "next/link"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import type { DisasterEvent } from "@/lib/disasters"
import { getTypeColor, getDataSources } from "@/lib/disasters"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface Props {
  events: DisasterEvent[]
  byCountry: Record<string, number>
}

function getColor(count: number | undefined): string {
  if (!count || count === 0) return "oklch(30% 0.012 75)"
  if (count <= 2) return "oklch(42% 0.025 75)"
  if (count <= 5) return "oklch(52% 0.035 75)"
  if (count <= 10) return "oklch(60% 0.05 75)"
  return "oklch(68% 0.06 75)"
}

export default function DisasterMap({ events, byCountry }: Props) {
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null)
  const markers = events.filter((e) => e.lat !== 0 && e.lng !== 0).slice(0, 100)

  return (
    <div className="map-container">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties?.name || ""
              const count = byCountry[name] || 0
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(count)}
                  stroke="oklch(45% 0.02 75)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#B09168", outline: "none", cursor: "pointer" },
                    pressed: { fill: "#B09168", outline: "none" },
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({
                      name,
                      count,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })
          }
        </Geographies>
        {markers.map((e) => (
          <Marker
            key={e.id}
            coordinates={[e.lng, e.lat]}
            onClick={() => setSelectedEvent(e)}
          >
            <circle
              r={5}
              fill={getTypeColor(e.type)}
              stroke="white"
              strokeWidth={1.5}
              opacity={0.85}
              style={{ cursor: "pointer" }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x, top: tooltip.y - 40 }}>
          <strong>{tooltip.name}</strong> — {tooltip.count} active {tooltip.count === 1 ? "event" : "events"}
        </div>
      )}

      {selectedEvent && (
        <div className="map-popup-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="map-popup" onClick={(e) => e.stopPropagation()}>
            <button className="map-popup-close" onClick={() => setSelectedEvent(null)} aria-label="Close">
              ×
            </button>
            <div className="map-popup-header">
              <span className="feed-type-badge" style={{ background: getTypeColor(selectedEvent.type) }}>
                {selectedEvent.type}
              </span>
              <span className="feed-source">{selectedEvent.source}</span>
            </div>
            <p className="map-popup-title">{selectedEvent.title}</p>
            <p className="map-popup-location muted">{selectedEvent.country}{selectedEvent.continent ? ` · ${selectedEvent.continent}` : ""}</p>
            <div className="map-popup-actions">
              <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: "var(--text-xs)" }}>
                Read report
              </a>
              {(() => {
                const sources = getDataSources(selectedEvent.type, selectedEvent.continent).join("\n")
                return (
                  <Link
                    href={`/policies/new?type=${selectedEvent.type}&location=${selectedEvent.country}&trigger=${encodeURIComponent(selectedEvent.title)}&sources=${encodeURIComponent(sources)}`}
                    className="btn btn-primary"
                    style={{ fontSize: "var(--text-xs)" }}
                    onClick={() => setSelectedEvent(null)}
                  >
                    Create policy →
                  </Link>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="map-legend">
        {[
          { label: "0 events", color: "oklch(30% 0.012 75)" },
  { label: "1-2", color: "oklch(42% 0.025 75)" },
  { label: "3-5", color: "oklch(52% 0.035 75)" },
  { label: "6-10", color: "oklch(60% 0.05 75)" },
  { label: "10+", color: "oklch(68% 0.06 75)" },
        ].map((l) => (
          <span key={l.label} className="map-legend-item">
            <span className="map-legend-swatch" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}
