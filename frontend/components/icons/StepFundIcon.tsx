interface Props { className?: string }

export default function StepFundIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <circle cx="24" cy="24" r="10" stroke="var(--color-paper)" strokeWidth="1.5" />
      <path d="M24 18v12M21 21h6a1.5 1.5 0 010 3h-6M21 27h6a1.5 1.5 0 010 3h-6" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="14" stroke="var(--color-paper)" strokeWidth="0.75" opacity="0.3" strokeDasharray="2 3" />
    </svg>
  )
}
