"use client"

import { useState } from "react"
import { checkAndTrigger } from "@/lib/contract"

interface TriggerClaimButtonProps {
  policyId: number
  onTriggered?: () => void
}

export default function TriggerClaimButton({ policyId, onTriggered }: TriggerClaimButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleTrigger() {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const receipt: any = await checkAndTrigger(policyId)
      const verdict = receipt?.verdict ?? receipt?.result ?? null
      setResult(verdict)
      onTriggered?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-md)" }}>
      <button
        className="btn btn-primary"
        onClick={handleTrigger}
        disabled={loading}
        style={{ justifyContent: "center" }}
      >
        {loading ? "Checking..." : "Check & trigger claim"}
      </button>

      {result && (
        <div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontFamily: "var(--font-outlier)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: result === "YES" ? "#059669" : "#B09168",
            }}
          >
            Verdict: {result}
          </p>
          {result !== "YES" && (
            <p style={{ fontSize: "var(--text-xs)", marginTop: "var(--space-xs)" }} className="muted">
              Auto-adjudication denied. You can request a final ruling below.
            </p>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontSize: "var(--text-sm)", color: "#dc2626" }}>{error}</p>
      )}

      <p className="muted" style={{ fontSize: "var(--text-xs)" }}>
        This will fetch live data and run AI analysis on-chain. Gas fees apply.
      </p>
    </div>
  )
}
