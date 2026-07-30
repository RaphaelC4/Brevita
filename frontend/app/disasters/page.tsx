"use client"

import { useState, useCallback } from "react"
import DisasterFeed from "@/components/DisasterFeed"
import DisasterMap from "@/components/DisasterMap"
import Reveal from "@/components/Reveal"
import type { DisasterEvent } from "@/lib/disasters"
import { getTypeColor, formatSocial } from "@/lib/disasters"

const tabs = [
  { key: "map", label: "Map" },
  { key: "feed", label: "Feed" },
  { key: "social", label: "Social" },
] as const

type TabKey = (typeof tabs)[number]["key"]

export default function DisastersPage() {
  const [events, setEvents] = useState<DisasterEvent[]>([])
  const [byCountry, setByCountry] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [activeTab, setActiveTab] = useState<TabKey>("map")

  const handleEventsChange = useCallback((e: DisasterEvent[], c: Record<string, number>) => {
    setEvents(e)
    setByCountry(c)
    setTotal(e.length)
  }, [])

  const socialEvents = events.filter(
    (e) => e.social && (e.social.twitter > 0 || e.social.facebook > 0)
  )

  return (
    <div className="disasters-page">
      <Reveal as="h1" className="disasters-heading">
        Live disaster monitor.
      </Reveal>
      <Reveal as="p" className="disasters-subtitle muted" delay={1}>
        Real-time disaster events aggregated from ReliefWeb, USGS, and GDACS.
      </Reveal>

      <div className="disasters-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`disasters-tab${activeTab === t.key ? " disasters-tab-active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="disasters-content">
        {activeTab === "map" && (
          <Reveal className="disasters-map-section" delay={2}>
            <DisasterMap events={events} byCountry={byCountry} />
          </Reveal>
        )}

        {activeTab === "feed" && (
          <Reveal delay={3}>
            <DisasterFeed onEventsChange={handleEventsChange} />
          </Reveal>
        )}

        {activeTab === "social" && (
          <Reveal delay={3}>
            {socialEvents.length === 0 ? (
              <p className="muted">
                No social mentions data yet. Switch to the Feed tab to load events.
              </p>
            ) : (
              <div className="social-grid">
                {socialEvents.slice(0, 30).map((e) => (
                  <div key={e.id} className="social-card">
                    <div className="social-card-header">
                      <span
                        className="feed-type-badge"
                        style={{ background: getTypeColor(e.type) }}
                      >
                        {e.type}
                      </span>
                      <span className="feed-source">{e.source}</span>
                    </div>
                    <p className="feed-title">{e.title}</p>
                    <div className="social-card-footer">
                      <span className="feed-country">{e.country}</span>
                      <span className="social-card-counts">
                        X {formatSocial(e.social?.twitter || 0)} · FB{" "}
                        {formatSocial(e.social?.facebook || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        )}
      </div>
    </div>
  )
}
