"use client"

import { use, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import TriggerClaimButton from "@/components/TriggerClaimButton"
import DisputePanel from "@/components/DisputePanel"
import WalletConnect from "@/components/WalletConnect"
import { getPolicy } from "@/lib/contract"
import { useWallet } from "@/lib/wallet"

interface Policy {
  id: number
  holder: string
  event_type: string
  location: string
  trigger_condition: string
  data_sources: string[]
  payout: number
  premium: number
  status: number
  created_at: number
  expires_at: number
}

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Active", color: "var(--color-accent)" },
  1: { label: "Triggered", color: "#d97706" },
  2: { label: "Paid Out", color: "#059669" },
  3: { label: "Expired", color: "var(--color-neutral)" },
  4: { label: "Cancelled", color: "var(--color-muted)" },
  5: { label: "In Dispute", color: "#B09168" },
}

const EVENT_ICONS: Record<string, string> = {
  drought: "01/",
  hurricane: "02/",
  flood: "03/",
  wildfire: "04/",
  earthquake: "05/",
}

export default function PolicyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { connected } = useWallet()
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadPolicy = useCallback(async () => {
    try {
      const data = await getPolicy(Number(id))
      setPolicy(data)
    } catch {
      setPolicy(null)
    }
  }, [id])

  useEffect(() => { loadPolicy() }, [loadPolicy, reloadKey])

  if (!policy) {
    return (
      <div className="page-container" style={{ paddingBlock: "var(--space-2xl)", textAlign: "center" }}>
        <p className="muted">Policy not found.</p>
        <Link href="/dashboard" className="btn" style={{ marginTop: "var(--space-lg)" }}>
          &larr; Back to dashboard
        </Link>
      </div>
    )
  }

  const status = STATUS_LABELS[policy.status] ?? { label: "Unknown", color: "var(--color-neutral)" }
  const isActive = policy.status === 0
  const isDisputed = policy.status === 5

  async function handleDisputeResolved(verdict: "TRUE" | "FALSE") {
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="page-container" style={{ paddingBlock: "var(--space-2xl)" }}>
      <Link
        href="/dashboard"
        className="btn-ghost btn"
        style={{ marginBottom: "var(--space-xl)" }}
      >
        &larr; Dashboard
      </Link>

      <div
        style={{
          display: "grid",
          gap: "var(--space-2xl)",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <p
            className="small-caps"
            style={{ color: status.color, marginBottom: "var(--space-xs)" }}
          >
            {status.label}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-3xl)",
              fontWeight: 600,
              lineHeight: 1.1,
              marginBottom: "var(--space-md)",
              textTransform: "capitalize",
            }}
          >
            {policy.event_type}
          </h1>
          <p className="muted" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-lg)" }}>
            {policy.location}
          </p>

          <div
            style={{
              display: "grid",
              gap: "var(--space-lg)",
              borderTop: "var(--rule-hair) solid var(--color-rule)",
              paddingTop: "var(--space-lg)",
            }}
          >
            <div>
              <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
                Trigger condition
              </p>
              <p>{policy.trigger_condition}</p>
            </div>

            <div>
              <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
                Payout
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600 }}>
                {policy.payout} GEN
              </p>
            </div>

            <div>
              <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
                Data sources
              </p>
              <ul style={{ listStyle: "none", padding: 0, fontSize: "var(--text-sm)" }}>
                {policy.data_sources.map((url, i) => (
                  <li key={i} style={{ marginBottom: "var(--space-2xs)" }}>
                    <span className="neutral">{i + 1}.</span>{" "}
                    <span style={{ wordBreak: "break-all" }}>{url}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            borderLeft: "var(--rule-hair) solid var(--color-rule)",
            paddingLeft: "var(--space-2xl)",
            display: "grid",
            alignContent: "start",
            gap: "var(--space-lg)",
          }}
        >
          <div>
            <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
              Policy ID
            </p>
            <p className="tabular">{policy.id}</p>
          </div>

          <div>
            <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
              Created
            </p>
            <p>{new Date(policy.created_at * 1000).toLocaleDateString("en-US", { timeZone: "UTC" })}</p>
          </div>

          <div>
            <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
              Expires
            </p>
            <p>{new Date(policy.expires_at * 1000).toLocaleDateString("en-US", { timeZone: "UTC" })}</p>
          </div>

          <div>
            <p className="small-caps" style={{ marginBottom: "var(--space-2xs)" }}>
              Premium paid
            </p>
            <p>{policy.premium} GEN</p>
          </div>

          {!connected && (
            <div style={{ marginTop: "var(--space-lg)" }}>
              <WalletConnect />
            </div>
          )}

          {connected && isActive && (
            <TriggerClaimButton policyId={policy.id} onTriggered={() => setReloadKey((k) => k + 1)} />
          )}

          {connected && isDisputed && (
            <DisputePanel
              policyId={policy.id}
              onResolved={handleDisputeResolved}
            />
          )}
        </div>
      </div>
    </div>
  )
}
