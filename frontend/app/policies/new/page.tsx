"use client"

import CreatePolicyForm from "@/components/CreatePolicyForm"
import WalletConnect from "@/components/WalletConnect"
import { Suspense } from "react"
import { useWallet } from "@/lib/wallet"

export default function NewPolicyPage() {
  const { connected } = useWallet()

  if (!connected) {
    return (
      <div className="page-container policy-shell">
        <section className="policy-hero">
          <p className="small-caps">Create policy</p>
          <h1 className="policy-title">Connect a wallet to write a policy.</h1>
          <p className="muted policy-copy">
            Once connected, you can set the peril, trigger, payout, and sources in one pass.
          </p>
          <WalletConnect />
        </section>
      </div>
    )
  }

  return (
    <div className="page-container policy-shell">
      <section className="policy-hero">
        <p className="small-caps">Create policy</p>
        <h1 className="policy-title">Define the terms once. Let the contract carry them.</h1>
        <p className="muted policy-copy">
          Brevita policies live on-chain, funded up front and settled when the trigger condition is met.
        </p>
      </section>

      <section className="policy-layout">
        <div className="policy-form-panel">
          <Suspense fallback={<p className="muted">Loading form...</p>}>
            <CreatePolicyForm />
          </Suspense>
        </div>
        <aside className="policy-surface">
          <p className="small-caps">Policy blueprint</p>
          <div className="policy-surface-list">
            <div>
              <span className="muted">Coverage</span>
              <strong>Disaster-specific, on-chain</strong>
            </div>
            <div>
              <span className="muted">Settlement</span>
              <strong>Automatic when trigger conditions are met</strong>
            </div>
            <div>
              <span className="muted">Visibility</span>
              <strong>History stays in the contract ledger</strong>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
