"use client"

import { useEffect, useState } from "react"
import type { DisasterData } from "@/lib/disasters"
import { getTypeColor } from "@/lib/disasters"

export default function BreakingTicker() {
  const [items, setItems] = useState<{ id: string; title: string; type: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchTicker() {
      try {
        const res = await fetch("/api/disasters/live")
        const json: DisasterData = await res.json()
        if (!cancelled) {
          const latest = json.events
            .filter((e) => e.lat && e.lng && e.type !== "Other")
            .slice(0, 30)
            .map((e) => ({ id: e.id, title: e.title, type: e.type }))
          setItems(latest)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTicker()
    const interval = setInterval(fetchTicker, 120000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const display = items.length > 0 ? items : loading
    ? [{ id: "loading", title: "Loading live updates...", type: "Other" }]
    : [{ id: "empty", title: "No breaking news at this time", type: "Other" }]

  return (
    <div className="ticker-wrap">
      <span className="ticker-label">Breaking news</span>
      <div className="ticker-track">
        <div className="ticker-scroll">
          {[...display, ...display].map((item, i) => (
            <span key={`${item.id}-${i}`} className="ticker-item">
              <span className="ticker-dot" style={{ background: getTypeColor(item.type) }} />
              {item.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
