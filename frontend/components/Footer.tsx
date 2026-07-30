import Link from "next/link"

export default function Footer() {
  return (
    <footer className="foot-corp">
      <div className="foot-corp-inner">
        <div className="foot-corp-brand">
          <p className="foot-corp-wordmark">Brevita</p>
          <p className="foot-corp-tagline">Parametric insurance, on-chain.</p>
        </div>
        <div className="foot-corp-col">
          <h4>Navigate</h4>
          <Link href="/">Home</Link>
          <Link href="/disasters">Disasters</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/about">About</Link>
          <Link href="/policies/new">Create</Link>
        </div>
        <div className="foot-corp-col">
          <h4>Resources</h4>
          <Link href="/about">Documentation</Link>
          <Link href="https://genlayer.com" target="_blank" rel="noopener noreferrer">GenLayer</Link>
          <Link href="/about">Contact</Link>
        </div>
        <p className="foot-corp-legal">
          &copy; {new Date().getFullYear()} Brevita &middot; Built on GenLayer
        </p>
      </div>
    </footer>
  )
}
