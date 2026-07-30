interface Props { className?: string }

export default function TerrorismIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M24 8L8 16v6c0 8.8 7 17.2 16 20 9-2.8 16-11.2 16-20v-6L24 8z" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 20v6" stroke="var(--color-paper)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="30" r="1.2" fill="var(--color-paper)" />
      <path d="M17 20c2.5-1.5 8.5-1.5 14 0" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
