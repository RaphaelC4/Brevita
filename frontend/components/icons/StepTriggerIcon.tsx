interface Props { className?: string }

export default function StepTriggerIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <circle cx="24" cy="24" r="4" fill="var(--color-paper)" />
      <circle cx="24" cy="24" r="8" stroke="var(--color-paper)" strokeWidth="1" opacity="0.7" />
      <circle cx="24" cy="24" r="12" stroke="var(--color-paper)" strokeWidth="0.75" opacity="0.4" />
      <path d="M24 12v-2M24 38v-2M12 24h-2M38 24h-2" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M26 22l4-4" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
