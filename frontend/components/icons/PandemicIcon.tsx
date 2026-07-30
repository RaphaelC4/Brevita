interface Props { className?: string }

export default function PandemicIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <circle cx="24" cy="24" r="5" fill="var(--color-paper)" />
      <path d="M24 12v4M24 32v4M12 24h4M32 24h4" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 15.5l2.5 2.5M30 30l2.5 2.5M15.5 32.5l2.5-2.5M30 18l2.5-2.5" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <circle cx="24" cy="24" r="13" stroke="var(--color-paper)" strokeWidth="0.75" opacity="0.3" strokeDasharray="2 3" />
    </svg>
  )
}
