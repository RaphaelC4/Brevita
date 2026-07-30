import type { Metadata } from "next"
import "./globals.css"
import Nav from "@/components/Nav"
import ScrollProgress from "@/components/ScrollProgress"
import BreakingTicker from "@/components/BreakingTicker"
import Footer from "@/components/Footer"
import GrainOverlay from "@/components/GrainOverlay"
import SoundToggle from "@/components/SoundToggle"
import { WalletProvider } from "@/lib/wallet"

export const metadata: Metadata = {
  title: "Brevita - Parametric Insurance on GenLayer",
  description:
    "Insurance that pays out based on real-world events using on-chain data and AI verification.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <WalletProvider>
          <BreakingTicker />
          <ScrollProgress />
          <Nav />
          <main className="page-fade">{children}</main>
          <Footer />
          <GrainOverlay />
          <SoundToggle />
        </WalletProvider>
      </body>
    </html>
  )
}
