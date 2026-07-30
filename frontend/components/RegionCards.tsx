"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const regions = [
  { name: "Africa", color: "#D4AF37", count: "2,340" },
  { name: "Americas", color: "#C0A060", count: "4,120" },
  { name: "Asia", color: "#B89840", count: "5,670" },
  { name: "Europe", color: "#A88830", count: "3,890" },
  { name: "Middle East", color: "#C8A850", count: "1,450" },
  { name: "Oceania", color: "#B09040", count: "980" },
]

export default function RegionCards() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="region-cards-section">
      <div className="page-container">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Stories by Region
        </motion.p>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Every corner, covered.
        </motion.h2>
      </div>

      <div className="region-grid">
        {regions.map((region, i) => (
          <RegionCard key={region.name} region={region} index={i} inView={inView} />
        ))}
      </div>
    </section>
  )
}

function RegionCard({
  region,
  index,
  inView,
}: {
  region: { name: string; color: string; count: string }
  index: number
  inView: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouse = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
  }

  const handleLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)"
  }

  return (
    <motion.div
      ref={cardRef}
      className="region-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      <div className="region-card-visual" style={{ background: `linear-gradient(135deg, ${region.color}22, ${region.color}11)` }}>
        <div className="region-card-ring" style={{ borderColor: region.color }}>
          <span className="region-card-initial">{region.name[0]}</span>
        </div>
      </div>
      <div className="region-card-body">
        <h3 className="region-card-name">{region.name}</h3>
        <p className="region-card-count">
          <strong>{region.count}</strong> policies active
        </p>
      </div>
    </motion.div>
  )
}
