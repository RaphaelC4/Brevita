export default function AboutPage() {
  return (
    <div className="page-container" style={{ paddingBlock: "var(--space-2xl)" }}>
      <article style={{ maxWidth: "65ch", margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-3xl)",
            lineHeight: 1.1,
            marginBottom: "var(--space-lg)",
          }}
        >
          How Brevita works
        </h1>

        <p className="muted" style={{ fontSize: "var(--text-md)", lineHeight: 1.65 }}>
          Brevita is parametric cover for events you can measure. The contract does not estimate
          loss, wait for a desk, or ask for a second opinion. It reads the terms, watches the
          evidence, and settles when the trigger is met.
        </p>

        <hr />

        <h2
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", marginBottom: "var(--space-md)" }}
        >
          What parametric means here
        </h2>
        <p style={{ lineHeight: 1.65, marginBottom: "var(--space-lg)" }}>
          Parametric cover pays when a defined event happens. If the hurricane crosses the line you
          set, the policy pays. There is no loss assessment, no adjuster visit, and no paper trail
          to clear.
        </p>

        <h2
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", marginBottom: "var(--space-md)" }}
        >
          What GenLayer adds
        </h2>
        <p style={{ lineHeight: 1.65, marginBottom: "var(--space-lg)" }}>
          GenLayer Intelligent Contracts can read live web data and call language models directly on
          chain. Brevita uses that path to pull evidence from sources like NOAA and USGS, then asks
          the network to settle the question against the policy terms.
        </p>

        <h2
          style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", marginBottom: "var(--space-md)" }}
        >
          The policy lifecycle
        </h2>

        <ol style={{ display: "grid", gap: "var(--space-lg)", lineHeight: 1.65, paddingLeft: "var(--space-lg)" }}>
          <li>
            <strong>Write.</strong> Choose the peril, location, trigger condition, and payout.
          </li>
          <li>
            <strong>Fund.</strong> Lock the capital on chain. The policy is live and visible.
          </li>
          <li>
            <strong>Watch.</strong> Anyone can call the check function once the event window closes.
          </li>
          <li>
            <strong>Settle.</strong> If the condition is met, the contract transfers funds
            automatically to the policy holder.
          </li>
        </ol>
      </article>
    </div>
  )
}
