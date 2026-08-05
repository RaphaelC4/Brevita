"use client"

import { useState } from "react"
import { checkAndTrigger, getPolicy } from "@/lib/contract"

interface TriggerClaimButtonProps {
  policyId: number
  onTriggered?: () => void
}

const STATUS_PAID_OUT = 2
const STATUS_DISPUTED = 5

type Outcome = "APPROVED" | "DENIED"

export default function TriggerClaimButton({ policyId, onTriggered }: TriggerClaimButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Outcome | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleTrigger() {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      // check_and_trigger authorizes the write against the connected
      // wallet (writeContract throws if no signer is attached, and
      // throws again if the transaction actually reverted on-chain).
      await checkAndTrigger(policyId)

      // Derive the outcome from refreshed on-chain state rather than
      // guessing at the write receipt's return-value shape (unreliable -
      // genlayer-js doesn't document a stable field for this). Both "NO"
      // and "UNDECIDED" verdicts land on the same DISPUTED status, so we
      // can't distinguish those after the fact - but the distinction
      // that actually matters to the user (paid vs needs appeal) is
      // always correctly reflected in policy.status.
      const policy = await getPolicy(policyId)
      setResult(policy.status === STATUS_PAID_OUT ? "APPROVED" : "DENIED")
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
              color: result === "APPROVED" ? "#059669" : "#B09168",
            }}
          >
            {result === "APPROVED" ? "Approved - paid out" : "Not approved"}
          </p>
          {result === "DENIED" && (
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
