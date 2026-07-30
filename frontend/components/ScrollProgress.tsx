"use client"

import { useEffect, useState } from "react"

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
      setProgress(pct)
      setVisible(scrollTop > 60)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "2px",
        zIndex: 999,
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          transform: `scaleX(${progress})`,
          transformOrigin: "left",
          background: "var(--color-accent)",
          transition: "transform 80ms ease-out",
        }}
      />
    </div>
  )
}
