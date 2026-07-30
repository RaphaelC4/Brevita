"use client"

import { useState } from "react"
import { resolveDisputeOnChain } from "@/lib/contract"

interface Props {
  policyId: number
  onResolved: (verdict: "TRUE" | "FALSE") => void
}

type Stage = "idle" | "resolving" | "resolved" | "error"

export default function DisputePanel({ policyId, onResolved }: Props) {
  const [stage, setStage] = useState<Stage>("idle")
  const [verdict, setVerdict] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAppeal() {
    setStage("resolving")
    setError(null)

    try {
      const receipt: any = await resolveDisputeOnChain(policyId)
      const outcome = (receipt?.verdict ?? receipt?.result ?? null) as string | null
      if (!outcome) {
        throw new Error("Resolved on-chain, but couldn't read the verdict from the response - check the policy status.")
      }
      setVerdict(outcome)
      onResolved(outcome === "TRUE" ? "TRUE" : "FALSE")
      setStage("resolved")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve on-chain")
      setStage("error")
    }
  }

  return (
    <div className="dispute-panel">
      <h3 className="dispute-panel-title">Appeal</h3>

      <div className="dispute-timeline">
        <div className="dispute-step dispute-step-active">
          <span className="dispute-step-number">1</span>
          <span>Auto-adjudication denied</span>
        </div>
        <div className={`dispute-step${["resolving", "resolved"].includes(stage) ? " dispute-step-active" : ""}`}>
          <span className="dispute-step-number">2</span>
          <span>Final ruling via GenLayer validator consensus</span>
        </div>
        <div className={`dispute-step${stage === "resolved" ? " dispute-step-active" : ""}`}>
          <span className="dispute-step-number">3</span>
          <span>Settled on Brevita</span>
        </div>
      </div>

      {stage === "idle" && (
        <button className="btn btn-primary" onClick={handleAppeal} style={{ justifyContent: "center" }}>
          Request final ruling
        </button>
      )}

      {stage === "resolving" && (
        <p className="dispute-status">Validators are reviewing the evidence for a final ruling...</p>
      )}

      {stage === "resolved" && verdict && (
        <div className="dispute-verdict">
          <p className="dispute-verdict-label">Final verdict:</p>
          <p className={`dispute-verdict-outcome ${verdict === "TRUE" ? "verdict-true" : "verdict-false"}`}>
            {verdict}
          </p>
          <p className="dispute-status" style={{ color: "#059669", marginTop: "var(--space-sm)" }}>
            Resolved on-chain.
          </p>
        </div>
      )}

      {stage === "error" && error && (
        <div className="dispute-error">
          <p style={{ color: "#dc2626", fontSize: "var(--text-sm)" }}>{error}</p>
          <button className="btn" onClick={() => setStage("idle")} style={{ marginTop: "var(--space-xs)" }}>
            Try again
          </button>
        </div>
      )}

      <p className="dispute-credit muted">
        Decided by GenLayer's own AI-validator consensus - a second, stricter round of the
        same verification used for automatic adjudication.
      </p>
    </div>
  )
}
