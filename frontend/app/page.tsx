"use client"

import Link from "next/link"
import GlobeHero from "@/components/GlobeHero"
import HowItWorks from "@/components/HowItWorks"
import CoverageCalculator from "@/components/CoverageCalculator"
import FAQ from "@/components/FAQ"
import WalletConnect from "@/components/WalletConnect"
import Reveal from "@/components/Reveal"

export default function Home() {
  return (
    <>
      <GlobeHero />

      <HowItWorks />

      <CoverageCalculator />

      <FAQ />

      <section className="cta-section">
        <div className="page-container">
          <Reveal delay={1}>
            <p className="section-label">Get started</p>
            <h2>Insurance that moves as fast as the world changes.</h2>
            <p style={{ color: "var(--color-muted)", marginBottom: "var(--space-lg)", maxWidth: "45ch", marginInline: "auto" }}>
              Create a policy. Fund it. If the trigger condition is met, the contract pays out — no adjuster, no queue, no paper trail.
            </p>
            <div className="cta-actions">
              <WalletConnect />
              <Link href="/policies/new" className="globe-btn">
                Create a policy
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
