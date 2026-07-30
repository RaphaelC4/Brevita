interface Props { className?: string }

export default function WarIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M14 10l10 14-10 14" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 10l-10 14 10 14" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="2.5" fill="var(--color-paper)" />
      <path d="M20 16h4M20 24h4M20 32h4" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M8 8l32 32" stroke="var(--color-paper)" strokeWidth="0.75" opacity="0.3" />
    </svg>
  )
}
