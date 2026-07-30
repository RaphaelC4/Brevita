"use client"

import { useState } from "react"
import Reveal from "./Reveal"
import { globalRegions, defaultRegion } from "@/lib/disasters"

const disasterTypes = [
  { value: "drought", label: "Drought", risk: 1.2 },
  { value: "hurricane", label: "Hurricane", risk: 2.0 },
  { value: "flood", label: "Flood", risk: 1.8 },
  { value: "wildfire", label: "Wildfire", risk: 1.5 },
  { value: "earthquake", label: "Earthquake", risk: 1.3 },
  { value: "pandemic", label: "Pandemic", risk: 2.5 },
  { value: "heatwave", label: "Heatwave", risk: 1.3 },
  { value: "civil-unrest", label: "Civil Unrest", risk: 1.8 },
  { value: "war", label: "War", risk: 3.0 },
  { value: "terrorism", label: "Terrorism", risk: 2.2 },
]

function formatGEN(n: number) {
  return n.toLocaleString() + " GEN"
}

export default function CoverageCalculator() {
  const [disaster, setDisaster] = useState("drought")
  const [coverage, setCoverage] = useState(50000)
  const [region, setRegion] = useState(defaultRegion)

  const dType = disasterTypes.find((d) => d.value === disaster)!
  const r = globalRegions.find((rg) => rg.value === region)!
  const monthly = Math.round(coverage * 0.01 * dType.risk * r.mult)
  const annual = monthly * 12

  return (
    <section className="calc-section">
      <div className="page-container">
        <Reveal as="p" className="section-label">
          Pricing
        </Reveal>
        <Reveal as="h2" className="calc-heading">
          What would your policy cost?
        </Reveal>
        <Reveal className="calc-grid">
          <div className="calc-form">
            <div className="form-group">
              <label className="form-label" htmlFor="calc-disaster">Disaster type</label>
              <select id="calc-disaster" className="form-select" value={disaster} onChange={(e) => setDisaster(e.target.value)}>
                {disasterTypes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="calc-coverage">Coverage amount</label>
              <input id="calc-coverage" className="form-input" type="number" min={1000} max={500000} step={1000} value={coverage} onChange={(e) => setCoverage(Number(e.target.value))} />
              <input type="range" min={1000} max={500000} step={1000} value={coverage} onChange={(e) => setCoverage(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--color-accent)" }} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="calc-region">Region</label>
              <select id="calc-region" className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                {globalRegions.map((rg) => (
                  <option key={rg.value} value={rg.value}>{rg.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="calc-result">
            <p className="calc-result-label">Estimated premium</p>
            <p className="calc-result-monthly">{formatGEN(monthly)}<span className="calc-result-period">/month</span></p>
            <p className="calc-result-annual muted">{formatGEN(annual)} /year</p>
            <p className="calc-result-note muted">
              Based on {dType.label.toLowerCase()} risk in {r.label}. Actual premium may vary.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
