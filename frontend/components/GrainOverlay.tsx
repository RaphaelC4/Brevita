"use client"

import { useRef, useEffect } from "react"

export default function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const w = 256
    const h = 256
    canvas.width = w
    canvas.height = h

    function draw() {
      const imageData = ctx!.createImageData(w, h)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255
        data[i] = val
        data[i + 1] = val
        data[i + 2] = val
        data[i + 3] = 30
      }
      ctx!.putImageData(imageData, 0, 0)
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="grain-overlay"
      aria-hidden="true"
    />
  )
}
