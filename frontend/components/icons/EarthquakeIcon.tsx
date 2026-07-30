interface Props { className?: string }

export default function EarthquakeIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M8 26h6l3-6 3 12 3-18 3 12 3-6 3 6h6" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 32v6M16 35v4M24 30v8M32 34v6M40 32v6" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
