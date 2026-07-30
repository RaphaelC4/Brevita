interface Props { className?: string }

export default function DroughtIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <circle cx="24" cy="16" r="5" stroke="var(--color-paper)" strokeWidth="1.5" />
      <path d="M24 11v-2M24 23v-2M31.5 13.5l1.5-1.5M15 13.5l-1.5-1.5M31.5 18.5l1.5 1.5M15 18.5l-1.5 1.5" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 32c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 32c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M16 40h16" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
