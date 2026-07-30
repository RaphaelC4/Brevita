interface Props { className?: string }

export default function StepPayoutIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M20 16l-4 8h6l-2 8 8-10h-6l2-6z" fill="var(--color-paper)" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="14" stroke="var(--color-paper)" strokeWidth="0.75" opacity="0.3" />
    </svg>
  )
}
