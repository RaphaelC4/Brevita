interface Props { className?: string }

export default function FloodIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M24 8L10 22h5v10h18V22h5L24 8z" stroke="var(--color-paper)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 34c-3 1.5-5 3-5 5 0 1.5 1.5 2.5 3 2.5s3-1 4.5-2.5c1.5 1.5 3 2.5 4.5 2.5s3-1 4.5-2.5c1.5 1.5 3 2.5 4.5 2.5s3-1 3-2.5c0-2-2-3.5-5-5" stroke="var(--color-paper)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
