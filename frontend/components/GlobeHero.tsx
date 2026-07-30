"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { gsap } from "gsap"
import { motion, AnimatePresence } from "framer-motion"

interface City {
  name: string
  country: string
  lat: number
  lng: number
  headline: string
  image: string
}

const cities: City[] = [
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, headline: "Flood monitoring expanded across coastal regions", image: "" },
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.006, headline: "Storm surge coverage hits record adoption", image: "" },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, headline: "Heatwave parametric policies surge 340%", image: "" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, headline: "Earthquake triggers automated payouts", image: "" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, headline: "Drought coverage expands to MENA region", image: "" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, headline: "Wildfire parametric insurance now live", image: "" },
]

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

export default function GlobeHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    earth: THREE.Mesh
    atmosphere: THREE.Mesh
    markers: THREE.Sprite[]
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
    animId: number
  } | null>(null)
  const [activeCity, setActiveCity] = useState<City | null>(null)
  const [loaded, setLoaded] = useState(false)

  const handleCityClick = useCallback((city: City) => {
    setActiveCity(city)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const w = container.clientWidth
    const h = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 0, 3.2)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const group = new THREE.Group()
    scene.add(group)

    const textureLoader = new THREE.TextureLoader()
    const fallbackGeo = new THREE.SphereGeometry(1, 64, 64)

    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1a3a5c,
      emissive: 0x0a1a2a,
      emissiveIntensity: 0.1,
      specular: new THREE.Color(0x333333),
      shininess: 5,
    })
    const earth = new THREE.Mesh(fallbackGeo, earthMat)
    group.add(earth)

    // Flip V on the UVs instead of using texture.flipY - some browser/GPU
    // combos route flipY'd 2D texture uploads through a 3D-texture upload
    // path internally, which WebGL forbids FLIP_Y on. This sidesteps that
    // entirely rather than relying on Three.js's default flipY=true.
    const uvAttr = fallbackGeo.attributes.uv as THREE.BufferAttribute
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setY(i, 1 - uvAttr.getY(i))
    }
    uvAttr.needsUpdate = true

    textureLoader.load(
      "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
      (tex) => {
        tex.flipY = false
        earthMat.map = tex
        earthMat.color.set(0xffffff)
        earthMat.needsUpdate = true
      },
      undefined,
      () => {},
    )

    textureLoader.load(
      "https://unpkg.com/three-globe/example/img/earth-night.jpg",
      (tex) => {
        tex.flipY = false
        earthMat.emissiveMap = tex
        earthMat.emissiveIntensity = 0.6
        earthMat.needsUpdate = true
      },
      undefined,
      () => {},
    )

    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.83, 0.69, 0.22, intensity * 0.6);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    })
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.15, 64, 64), atmosphereMat)
    group.add(atmosphere)

    const ambientLight = new THREE.AmbientLight(0x404060)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 3, 5)
    scene.add(dirLight)

    const backLight = new THREE.DirectionalLight(0x4466ff, 0.4)
    backLight.position.set(-3, -1, -5)
    scene.add(backLight)

    const starCount = 1500
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(starCount * 3)
    const starSizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      const r = 5 + Math.random() * 20
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPos[i * 3 + 2] = r * Math.cos(phi)
      starSizes[i] = 0.5 + Math.random() * 1.5
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1))

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.03,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    const markerGroup = new THREE.Group()
    group.add(markerGroup)

    const markerMat = new THREE.SpriteMaterial({
      map: (() => {
        const c = document.createElement("canvas")
        c.width = 64
        c.height = 64
        const ctx = c.getContext("2d")!
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
        gradient.addColorStop(0, "rgba(212, 175, 55, 1)")
        gradient.addColorStop(0.2, "rgba(212, 175, 55, 0.6)")
        gradient.addColorStop(0.5, "rgba(212, 175, 55, 0.2)")
        gradient.addColorStop(1, "rgba(212, 175, 55, 0)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 64, 64)
        return new THREE.CanvasTexture(c)
      })(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const markers: THREE.Sprite[] = []
    const markerData: { sprite: THREE.Sprite; phase: number }[] = []

    cities.forEach((city) => {
      const pos = latLngToVector3(city.lat, city.lng, 1.01)
      const sprite = new THREE.Sprite(markerMat.clone())
      sprite.position.copy(pos)
      sprite.scale.set(0.12, 0.12, 1)
      sprite.userData.cityIndex = markerData.length
      markerGroup.add(sprite)
      markers.push(sprite)
      markerData.push({ sprite, phase: Math.random() * Math.PI * 2 })
    })

    sceneRef.current = {
      scene,
      camera,
      renderer,
      earth,
      atmosphere,
      markers,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      animId: 0,
    }

    let time = 0
    function animate() {
      time += 0.005

      group.rotation.y += 0.0005

      const m = mouseRef.current
      gsap.to(group.rotation, {
        x: m.y * 0.05,
        y: group.rotation.y + m.x * 0.02,
        duration: 1.5,
        overwrite: "auto",
      })

      markerData.forEach((md) => {
        const scale = 0.08 + Math.sin(time * 2 + md.phase) * 0.04
        md.sprite.scale.set(scale, scale, 1)
        const m = md.sprite.material as THREE.SpriteMaterial
        m.opacity = 0.3 + Math.sin(time * 2 + md.phase) * 0.3
      })

      stars.rotation.y += 0.0001

      renderer.render(scene, camera)
      sceneRef.current!.animId = requestAnimationFrame(animate)
    }
    animate()

    setLoaded(true)

    gsap.from(camera.position, {
      z: 8,
      duration: 2.5,
      ease: "power3.out",
      onUpdate: () => camera.lookAt(0, 0, 0),
    })

    const handleResize = () => {
      const cw = container.clientWidth
      const ch = container.clientHeight
      camera.aspect = cw / ch
      camera.updateProjectionMatrix()
      renderer.setSize(cw, ch)
    }
    window.addEventListener("resize", handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
      if (sceneRef.current) {
        sceneRef.current.mouse.x = (e.clientX / w) * 2 - 1
        sceneRef.current.mouse.y = -(e.clientY / h) * 2 + 1
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    const handleClick = (e: MouseEvent) => {
      if (!sceneRef.current) return
      const rect = canvas.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
      sceneRef.current.mouse.set(mx, my)
      sceneRef.current.raycaster.setFromCamera(sceneRef.current.mouse, camera)

      const intersects = sceneRef.current.raycaster.intersectObjects(markers)
      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Sprite
        const idx = obj.userData.cityIndex as number
        if (idx !== undefined) {
          handleCityClick(cities[idx])
        }
      }
    }
    canvas.addEventListener("click", handleClick)

    return () => {
      cancelAnimationFrame(sceneRef.current?.animId ?? 0)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleClick)
      renderer.dispose()
    }
  }, [handleCityClick])

  return (
    <section ref={containerRef} className="globe-hero">
      <canvas ref={canvasRef} className="globe-canvas" />

      <div className="globe-overlay">
        <motion.h1
          className="globe-headline"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {"The World,".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="globe-char"
              initial={{ opacity: 0, y: 40, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
          <br />
          {"Pictured.".split("").map((ch, i) => (
            <motion.span
              key={`b-${i}`}
              className="globe-char globe-char-accent"
              initial={{ opacity: 0, y: 40, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.6, delay: 1.6 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="globe-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Parametric insurance powered by GenLayer.
          <br />
          Every risk, every region, covered.
        </motion.p>

        <motion.div
          className="globe-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlobeButton href="/policies/new">Get insured</GlobeButton>
          <GlobeButton href="/about" variant="ghost">
            How it works
          </GlobeButton>
        </motion.div>
      </div>

      <div className="globe-gradient-bg" />

      <AnimatePresence>
        {activeCity && (
          <motion.div
            className="city-card"
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="city-card-visual">
              <div className="city-card-placeholder">
                <span>{activeCity.country[0]}</span>
              </div>
            </div>
            <div className="city-card-body">
              <p className="city-card-location">
                {activeCity.name}, {activeCity.country}
              </p>
              <h3 className="city-card-headline">{activeCity.headline}</h3>
              <button className="city-card-close" onClick={() => setActiveCity(null)}>
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function GlobeButton({
  href,
  children,
  variant,
}: {
  href: string
  children: React.ReactNode
  variant?: "ghost"
}) {
  const btnRef = useRef<HTMLAnchorElement>(null)

  const handleMouse = (e: React.MouseEvent) => {
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: "power2.out" })
  }

  const handleLeave = () => {
    const el = btnRef.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power2.out" })
  }

  return (
    <a
      ref={btnRef}
      href={href}
      className={`globe-btn ${variant === "ghost" ? "globe-btn-ghost" : ""}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      {children}
      {variant !== "ghost" && <span className="globe-btn-glow" />}
    </a>
  )
}
