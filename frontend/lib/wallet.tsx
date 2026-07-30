"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { setActiveAccount } from "./genlayer"

interface WalletState {
  address: string | null
  connected: boolean
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const accounts = await (window as any).ethereum?.request({
        method: "eth_requestAccounts",
      })

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        setActiveAccount(accounts[0])
        return
      }

      const gen = (window as any).genlayer
      if (gen) {
        const acc = await gen.connect()
        setAddress(acc)
        setActiveAccount(acc)
        return
      }

      setError("No wallet found. Install MetaMask or a GenLayer-compatible wallet.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setError(null)
    setActiveAccount(null)
  }, [])

  return (
    <WalletContext.Provider value={{ address, connected: !!address, connecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return ctx
}
