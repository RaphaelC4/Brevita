"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import PolicyCard from "@/components/PolicyCard"
import WalletConnect from "@/components/WalletConnect"
import { getPoliciesByHolder } from "@/lib/contract"
import { useWallet } from "@/lib/wallet"

interface Policy {
  id: number
  event_type: string
  location: string
  trigger_condition: string
  payout: number
  status: number
  created_at: number
  expires_at: number
}

const STATUS_LABELS: Record<number, string> = {
  0: "Active",
  1: "Triggered",
  2: "Paid Out",
  3: "Expired",
  4: "Cancelled",
  5: "In Dispute",
}

export default function Dashboard() {
  const { address, connected } = useWallet()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      if (!connected || !address) return
      setLoading(true)
      try {
        const data = await getPoliciesByHolder(address)
        setPolicies(data)
      } catch {
        setPolicies([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [connected, address])

  return (
    <div className="page-container" style={{ paddingBlock: "var(--space-2xl)" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-md)",
          marginBottom: "var(--space-2xl)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600 }}>
            Dashboard
          </h1>
          <p className="muted" style={{ fontSize: "var(--text-sm)" }}>
            {policies.length} polic{policies.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "center" }}>
          <WalletConnect />
          <Link href="/policies/new" className="btn btn-primary">
            New policy
          </Link>
        </div>
      </header>

      {!connected ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-4xl) 0",
            color: "var(--color-neutral)",
          }}
        >
          <p style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-md)" }}>
            Connect your wallet to view policies
          </p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "var(--space-3xl) 0" }}>
          <p className="muted">Loading policies...</p>
        </div>
      ) : policies.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-3xl) 0",
          }}
        >
          <p className="muted" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-lg)" }}>
            No policies yet
          </p>
          <Link href="/policies/new" className="btn">
            Create your first policy
          </Link>
        </div>
      ) : (
        <div className="policy-grid">
          {policies.map((p) => (
            <Link
              key={p.id}
              href={`/policies/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <PolicyCard policy={p} statusLabel={STATUS_LABELS[p.status] ?? "Unknown"} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
