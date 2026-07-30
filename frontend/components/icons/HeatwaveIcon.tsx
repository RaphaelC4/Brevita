interface Props { className?: string }

export default function HeatwaveIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <rect x="14" y="10" width="8" height="26" rx="4" stroke="var(--color-paper)" strokeWidth="1.5" />
      <path d="M14 18h8M14 26h8" stroke="var(--color-paper)" strokeWidth="1" opacity="0.5" />
      <path d="M30 14l3 3-3 3" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 21l3 3-3 3" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 28l3 3-3 3" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 40h16" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
