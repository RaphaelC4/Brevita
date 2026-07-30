interface Props { className?: string }

export default function CivilUnrestIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <circle cx="24" cy="18" r="3.5" fill="var(--color-paper)" />
      <path d="M16 30c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 38h28" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 34c1.5-1.5 4.5-1.5 6 0s4.5 1.5 6 0 4.5-1.5 6 0" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M24 8v3" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
