"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function EditorsPick() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])

  return (
    <section ref={ref} className="editors-pick">
      <motion.div className="editors-pick-bg" style={{ scale, y }}>
        <div className="editors-pick-overlay" />
        <div className="editors-pick-grain" />
      </motion.div>

      <motion.div className="editors-pick-content" style={{ opacity }}>
        <p className="section-label">Editor&apos;s Pick</p>
        <h2 className="editors-pick-heading">
          Climate risk is moving faster
          <br />
          than insurance ever has.
        </h2>
        <p className="editors-pick-sub">
          Parametric contracts settle in minutes, not months.
          <br />
          No adjuster. No queue. No paper trail.
        </p>
        <a href="/policies/new" className="globe-btn">
          See how it works
        </a>
      </motion.div>
    </section>
  )
}
