"use client"

import { useState } from "react"
import { useWallet } from "@/lib/wallet"

interface WalletConnectProps {
  onConnect?: () => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { address, connected, connecting, connect, disconnect } = useWallet()
  const [showDisconnect, setShowDisconnect] = useState(false)

  async function handleConnect() {
    await connect()
    onConnect?.()
  }

  if (connected && address) {
    return (
      <div className="wallet-connected">
        <button
          className="wallet-chip"
          onClick={() => setShowDisconnect((v) => !v)}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        {showDisconnect && (
          <button
            className="wallet-disconnect-btn"
            onClick={() => {
              disconnect()
              setShowDisconnect(false)
            }}
          >
            Disconnect
          </button>
        )}
      </div>
    )
  }

  return (
    <button className="btn btn-primary" onClick={handleConnect} disabled={connecting}>
      {connecting ? "Connecting..." : "Connect wallet"}
    </button>
  )
}
