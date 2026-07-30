"use client"

import { useRef, useEffect, useState } from "react"

interface Props {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  as?: "div" | "section" | "article" | "span" | "p" | "h1" | "h2" | "h3"
  delay?: number
}

export default function Reveal({ children, className = "", style, as: Tag = "div", delay }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as any}
      className={`reveal${visible ? " reveal-visible" : ""} ${className}`}
      style={{ ...style, "--i": delay ?? (style as any)?.["--i"] } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
