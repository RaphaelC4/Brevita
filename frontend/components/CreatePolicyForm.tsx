"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createPolicy, getPolicyCount } from "@/lib/contract"
import { useWallet } from "@/lib/wallet"

const EVENT_TYPES = [
  { value: "drought", label: "Drought" },
  { value: "hurricane", label: "Hurricane" },
  { value: "flood", label: "Flood" },
  { value: "wildfire", label: "Wildfire" },
  { value: "earthquake", label: "Earthquake" },
  { value: "pandemic", label: "Pandemic" },
  { value: "heatwave", label: "Heatwave" },
  { value: "civil-unrest", label: "Civil Unrest" },
  { value: "war", label: "War" },
  { value: "terrorism", label: "Terrorism" },
]

export default function CreatePolicyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { connected, connect } = useWallet()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuggested, setIsSuggested] = useState(false)
  const [form, setForm] = useState({
    eventType: "drought",
    location: "",
    triggerCondition: "",
    payout: "",
    dataSources: "",
    expiresAfterDays: "90",
  })

  useEffect(() => {
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const trigger = searchParams.get("trigger")
    const sources = searchParams.get("sources")
    if (type || location || trigger || sources) {
      setForm((prev) => ({
        ...prev,
        eventType: type ? type.toLowerCase() : prev.eventType,
        location: location || prev.location,
        triggerCondition: trigger || prev.triggerCondition,
        dataSources: sources || prev.dataSources,
      }))
      setIsSuggested(true)
    }
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!connected) {
      setError("Connect your wallet first")
      await connect()
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const sources = form.dataSources
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)

      const countBefore = await getPolicyCount()

      await createPolicy({
        event_type: form.eventType,
        location: form.location,
        trigger_condition: form.triggerCondition,
        data_sources: sources,
        payout: Number(form.payout),
        expires_after_days: Number(form.expiresAfterDays),
      })

      // Policy IDs are sequential, but a read right after an accepted
      // write can briefly lag - poll until the count actually moves
      // instead of trusting a single immediate read.
      let policyId: number | null = null
      for (let i = 0; i < 10; i++) {
        const count = await getPolicyCount()
        if (count > countBefore) {
          policyId = count
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      if (policyId === null) {
        throw new Error("Policy was created but hasn't shown up yet - check the dashboard in a moment.")
      }

      router.push(`/policies/${policyId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-lg)" }}>
      {isSuggested && (
        <div className="suggested-banner">
          Suggested from live event — pre-filled from disaster monitor.
        </div>
      )}
      <div className="form-group">
        <label className="form-label" htmlFor="eventType">
          Disaster type
        </label>
        <select
          id="eventType"
          name="eventType"
          className="form-select"
          value={form.eventType}
          onChange={handleChange}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          className="form-input"
          placeholder="e.g. Miami-Dade County, Florida"
          value={form.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="triggerCondition">
          Trigger condition
        </label>
        <textarea
          id="triggerCondition"
          name="triggerCondition"
          className="form-input"
          rows={3}
          placeholder="e.g. Category 4+ hurricane making landfall within 50km"
          value={form.triggerCondition}
          onChange={handleChange}
          required
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="payout">
          Payout amount (GEN)
        </label>
        <input
          id="payout"
          name="payout"
          type="number"
          className="form-input"
          placeholder="1000"
          min="1"
          value={form.payout}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="expiresAfterDays">
          Coverage period (days)
        </label>
        <input
          id="expiresAfterDays"
          name="expiresAfterDays"
          type="number"
          className="form-input"
          min="1"
          value={form.expiresAfterDays}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="dataSources">
          Data source URLs (one per line)
        </label>
        <textarea
          id="dataSources"
          name="dataSources"
          className="form-input"
          rows={4}
          placeholder={
            "https://weather.com/news/hurricane-tracker\nhttps://nhc.noaa.gov"
          }
          value={form.dataSources}
          onChange={handleChange}
          required
          style={{ resize: "vertical" }}
        />
        <p className="muted" style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-2xs)" }}>
          The contract will fetch these URLs to verify the event.
        </p>
      </div>

      {error && (
        <p style={{ color: "var(--color-accent)", fontSize: "var(--text-sm)" }}>{error}</p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
        style={{ alignSelf: "start" }}
      >
        {submitting ? "Creating..." : connected ? "Create policy" : "Connect wallet to create"}
      </button>
    </form>
  )
}
