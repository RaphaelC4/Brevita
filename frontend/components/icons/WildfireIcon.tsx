interface Props { className?: string }

export default function WildfireIcon({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="var(--color-accent)" />
      <path d="M24 40c5 0 10-3.5 10-10 0-5-3.5-10-6.5-13-1.2-1.2-2.5-2-3.5-1.5 0 0-1.5 2.5-3 5s-5 6.5-5 10c0 5 3.5 10 8 10z" fill="var(--color-paper)" opacity="0.9" />
      <path d="M27 30c0-2.5-1.5-5-3-6.5-1.5 1.5-3 4-3 6.5 0 1.8 1.5 3 3 3s3-1.2 3-3z" fill="var(--color-accent)" opacity="0.6" />
      <path d="M17 36c0-1.5-.8-3-1.5-4-.8.8-1.5 2.5-1.5 4 0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5z" fill="var(--color-accent)" opacity="0.4" />
    </svg>
  )
}
