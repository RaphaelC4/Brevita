interface PolicyCardProps {
  policy: {
    id: number
    event_type: string
    location: string
    trigger_condition: string
    payout: number
    status: number
  }
  statusLabel: string
}

const STATUS_COLORS: Record<number, string> = {
  0: "var(--color-accent)",
  1: "#d97706",
  2: "#059669",
  3: "var(--color-neutral)",
  4: "var(--color-muted)",
}

export default function PolicyCard({ policy, statusLabel }: PolicyCardProps) {
  return (
    <article className="policy-card">
      <p
        className="policy-status"
        style={{ color: STATUS_COLORS[policy.status] ?? "var(--color-neutral)" }}
      >
        {statusLabel}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-lg)",
          fontWeight: 600,
          lineHeight: 1.2,
          textTransform: "capitalize",
        }}
      >
        {policy.event_type}
      </h3>
      <p className="muted" style={{ fontSize: "var(--text-sm)" }}>
        {policy.location}
      </p>
      <p
        style={{
          fontSize: "var(--text-sm)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {policy.trigger_condition}
      </p>
      <p
        style={{
          fontFamily: "var(--font-outlier)",
          fontSize: "var(--text-md)",
          fontWeight: 600,
          marginTop: "var(--space-sm)",
        }}
      >
        {policy.payout} GEN
      </p>
    </article>
  )
}
