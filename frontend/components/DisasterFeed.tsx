"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import type { DisasterEvent, DisasterData } from "@/lib/disasters"
import { getTypeColor, typeOptions, continentOptions, formatSocial, getDataSources } from "@/lib/disasters"

interface Props {
  onEventsChange?: (events: DisasterEvent[], byCountry: Record<string, number>) => void
}

export default function DisasterFeed({ onEventsChange }: Props) {
  const [data, setData] = useState<DisasterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("All")
  const [continentFilter, setContinentFilter] = useState("All")
  const [timeFilter, setTimeFilter] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/disasters/live")
      const json: DisasterData = await res.json()
      setData(json)
      setLastUpdated(new Date())
      onEventsChange?.(json.events, json.byCountry)
    } catch {
      // keep old data
    } finally {
      setLoading(false)
    }
  }, [onEventsChange])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 60000)
    return () => clearInterval(intervalRef.current)
  }, [fetchData])

  const now = Date.now()
  const filtered = (data?.events || []).filter((e) => {
    if (typeFilter !== "All" && e.type !== typeFilter) return false
    if (continentFilter !== "All" && e.continent !== continentFilter) return false
    if (timeFilter === "24h") {
      const age = now - new Date(e.date).getTime()
      if (age > 86400000) return false
    }
    if (timeFilter === "7d") {
      const age = now - new Date(e.date).getTime()
      if (age > 604800000) return false
    }
    return true
  })

  const secondsAgo = lastUpdated ? Math.floor((now - lastUpdated.getTime()) / 1000) : 0

  const pulseItems = (data?.events || [])
    .filter((e) => e.social && (e.social.twitter > 0 || e.social.facebook > 0))
    .slice(0, 8)

  return (
    <div>
      {/* Social Pulse */}
      {pulseItems.length > 0 && (
        <div className="social-pulse">
          <span className="social-pulse-label">SOCIAL</span>
          <div className="social-pulse-track">
            <div className="social-pulse-scroll">
              {pulseItems.map((e, i) => {
                const sources = getDataSources(e.type, e.continent).join("\n")
                return (
                  <Link
                    key={`pulse-${i}`}
                    href={`/policies/new?type=${e.type}&location=${e.country}&trigger=${encodeURIComponent(e.title)}&sources=${encodeURIComponent(sources)}`}
                    className="social-pulse-item"
                  >
                    <span className="social-pulse-type" style={{ background: getTypeColor(e.type) }} />
                    <span className="social-pulse-title">{e.title}</span>
                    <span className="social-pulse-counts">
                      X {formatSocial(e.social?.twitter || 0)} · FB {formatSocial(e.social?.facebook || 0)}
                    </span>
                  </Link>
                )
              })}
              {/* duplicate for seamless scroll */}
              {pulseItems.map((e, i) => {
                const sources = getDataSources(e.type, e.continent).join("\n")
                return (
                  <Link
                    key={`pulse-dupe-${i}`}
                    href={`/policies/new?type=${e.type}&location=${e.country}&trigger=${encodeURIComponent(e.title)}&sources=${encodeURIComponent(sources)}`}
                    className="social-pulse-item"
                    aria-hidden="true"
                  >
                    <span className="social-pulse-type" style={{ background: getTypeColor(e.type) }} />
                    <span className="social-pulse-title">{e.title}</span>
                    <span className="social-pulse-counts">
                      X {formatSocial(e.social?.twitter || 0)} · FB {formatSocial(e.social?.facebook || 0)}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="feed-header">
        <div className="feed-header-left">
          <span className="feed-live-dot" />
          <span className="feed-total">
            <strong>{loading ? "..." : filtered.length}</strong> events
          </span>
          <span className="feed-total muted">
            of <strong>{data?.total || 0}</strong> tracked
          </span>
          {lastUpdated && (
            <span className="feed-updated muted">
              Updated {secondsAgo < 5 ? "just now" : `${secondsAgo}s ago`}
            </span>
          )}
        </div>
        <button className="feed-refresh-btn" onClick={fetchData} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="feed-filters">
        <div className="filter-group">
          {continentOptions.map((c) => (
            <button
              key={c}
              className={`filter-chip ${continentFilter === c ? "filter-chip-active" : ""}`}
              onClick={() => setContinentFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filter-group">
          {typeOptions.map((t) => (
            <button
              key={t}
              className={`filter-chip ${typeFilter === t ? "filter-chip-active" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="filter-group">
          {[
            { value: "all", label: "All time" },
            { value: "24h", label: "24 hours" },
            { value: "7d", label: "7 days" },
          ].map((t) => (
            <button
              key={t.value}
              className={`filter-chip ${timeFilter === t.value ? "filter-chip-active" : ""}`}
              onClick={() => setTimeFilter(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed grid */}
      {loading && !data ? (
        <div className="skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line skeleton-line-mid" />
              <div className="skeleton-line skeleton-line-short" />
              <div className="skeleton-line" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="feed-loading">
          <p className="muted">No events match the current filters.</p>
        </div>
      ) : (
        <div className="feed-list">
          {filtered.slice(0, 40).map((e) => (
            <div key={e.id} className="feed-card">
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="feed-card-link">
                <div className="feed-card-meta">
                  <span className="feed-source">{e.source}</span>
                  <span className="feed-type-badge" style={{ background: getTypeColor(e.type) }}>
                    {e.type}
                  </span>
                  <span className="feed-country">{e.country}</span>
                  {e.continent && <span className="feed-continent">{e.continent}</span>}
                </div>
                <p className="feed-title">{e.title}</p>
                <p className="feed-date muted">
                  {e.date
                    ? new Date(e.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </a>
              {e.social && (e.social.twitter > 0 || e.social.facebook > 0) && (
                <div className="feed-social-row">
                  <span className="feed-social-label">Social mentions:</span>
                  {e.social.twitter > 0 && <span className="feed-social-count">X {formatSocial(e.social.twitter)}</span>}
                  {e.social.facebook > 0 && <span className="feed-social-count">FB {formatSocial(e.social.facebook)}</span>}
                  {e.social.instagram > 0 && <span className="feed-social-count">IG {formatSocial(e.social.instagram)}</span>}
                </div>
              )}
              {(() => {
                const sources = getDataSources(e.type, e.continent).join("\n")
                return (
                  <Link
                    href={`/policies/new?type=${e.type}&location=${e.country}&trigger=${encodeURIComponent(e.title)}&sources=${encodeURIComponent(sources)}`}
                    className="feed-create-link"
                  >
                    → Create policy for this event
                  </Link>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
