import * as Accordion from "@radix-ui/react-accordion"
import Reveal from "./Reveal"

const faqs = [
  {
    q: "What is parametric insurance?",
    a: "It pays when a defined event happens. The trigger is the contract, not a claims desk.",
  },
  {
    q: "How are triggers verified?",
    a: "Brevita reads live evidence from authoritative sources and settles against the policy terms on chain.",
  },
  {
    q: "What if no event happens?",
    a: "The policy expires, the cover ends, and no payout is made.",
  },
  {
    q: "How fast are payouts?",
    a: "Fast enough to feel mechanical. Once the trigger is met, the contract releases funds directly.",
  },
  {
    q: "What happens to the premium?",
    a: "It funds the risk period and stays visible in the contract ledger.",
  },
  {
    q: "Do I need a wallet?",
    a: "Yes. Brevita runs on GenLayer, so a compatible wallet is required to write and receive policies.",
  },
  {
    q: "Can I cancel early?",
    a: "Policies are not meant to be rewritten after funding. If you need flexibility, choose a shorter term.",
  },
  {
    q: "Which perils are supported?",
    a: "Drought, hurricane, flood, wildfire, earthquake, pandemic, heatwave, civil unrest, war, and terrorism.",
  },
]

export default function FAQ() {
  return (
    <section className="faq-section">
      <div className="page-container">
        <Reveal as="p" className="section-label">
          FAQ
        </Reveal>
        <Reveal as="h2" className="faq-heading">
          Questions, answered plainly.
        </Reveal>
        <Reveal>
          <Accordion.Root type="multiple" className="faq-list">
            {faqs.map((faq, i) => (
              <Accordion.Item value={`faq-${i}`} key={i} className="faq-item">
                <Accordion.Trigger className="faq-trigger">
                  <span>{faq.q}</span>
                  <span className="faq-chevron" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                  </span>
                </Accordion.Trigger>
                <Accordion.Content className="faq-content">
                  <p className="muted">{faq.a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Reveal>
      </div>
    </section>
  )
}
