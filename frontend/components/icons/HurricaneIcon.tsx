interface Props { className?: string }

export default function HurricaneIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M24 8c-4 0-7 7-7 16s3 16 7 16 7-7 7-16-3-16-7-16z" stroke="var(--color-paper)" strokeWidth="1.5" />
      <path d="M24 13c-2.2 0-4 5-4 11s1.8 11 4 11 4-5 4-11-1.8-11-4-11z" stroke="var(--color-paper)" strokeWidth="1" opacity="0.7" />
      <path d="M24 18c-1.1 0-2 2.8-2 6s.9 6 2 6 2-2.8 2-6-.9-6-2-6z" stroke="var(--color-paper)" strokeWidth="1" opacity="0.5" />
      <path d="M10 24h3M35 24h3M24 8v3M24 37v3" stroke="var(--color-paper)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
