"use client"

import { useState, useRef, useCallback } from "react"

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playWhoosh = useCallback(() => {
    if (!enabled) return
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.03, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }, [enabled])

  const toggle = () => {
    if (!enabled) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    setEnabled((v) => !v)
  }

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      onMouseEnter={playWhoosh}
      aria-label={enabled ? "Mute ambient sound" : "Enable ambient sound"}
      title={enabled ? "Sound on" : "Sound off"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {enabled ? (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </>
        ) : (
          <>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M23 9l-6 6M17 9l6 6" />
          </>
        )}
      </svg>
    </button>
  )
}
