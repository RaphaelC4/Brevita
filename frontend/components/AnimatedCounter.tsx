"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  end: number
  suffix?: string
  prefix?: string
  decimals?: number
  label: string
  delay?: number
}

export default function AnimatedCounter({ end, suffix = "", prefix = "", decimals = 0, label, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.unobserve(el)

        setTimeout(() => {
          const duration = 1500
          const steps = 30
          const increment = end / steps
          let current = 0
          let step = 0

          const timer = setInterval(() => {
            step++
            current = Math.min(Math.round(increment * step * 100) / 100, end)
            setCount(current)
            if (step >= steps) clearInterval(timer)
          }, duration / steps)
        }, delay)
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, delay])

  return (
    <div ref={ref} className="stat-cell">
      <p className="stat-number">
        {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
      </p>
      <p className="stat-label">{label}</p>
    </div>
  )
}
