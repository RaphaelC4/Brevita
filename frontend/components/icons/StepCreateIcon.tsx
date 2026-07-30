interface Props { className?: string }

export default function StepCreateIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M16 14h16a2 2 0 012 2v16a2 2 0 01-2 2H16a2 2 0 01-2-2V16a2 2 0 012-2z" stroke="var(--color-paper)" strokeWidth="1.5" />
      <path d="M18 24l3 3 5-5" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 19h12" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
