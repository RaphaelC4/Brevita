"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import BrevitaLogo from "@/components/icons/BrevitaLogo"

const links = [
  { href: "/", label: "Home" },
  { href: "/disasters", label: "Disasters" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/policies/new", label: "Create" },
]

export default function Nav() {
  const path = usePathname()

  return (
    <header className="nav-corp">
      <div className="nav-corp-inner">
        <Link href="/" className="nav-corp-logo">
          <BrevitaLogo className="nav-corp-mark-svg" />
          <span className="nav-corp-wordmark">Brevita</span>
        </Link>
        <nav className="nav-corp-nav" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-corp-link${path === l.href ? " nav-corp-link-active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
