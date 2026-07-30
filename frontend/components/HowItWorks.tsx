import Reveal from "./Reveal"
import StepCreateIcon from "./icons/StepCreateIcon"
import StepFundIcon from "./icons/StepFundIcon"
import StepTriggerIcon from "./icons/StepTriggerIcon"
import StepPayoutIcon from "./icons/StepPayoutIcon"

const steps = [
  {
    num: "01",
    title: "Create a policy",
    desc: "Choose a disaster, set your coverage, define the trigger. No paperwork, no agent.",
    Icon: StepCreateIcon,
  },
  {
    num: "02",
    title: "Fund the contract",
    desc: "Deposit your premium in GEN into the smart contract. Held securely until payout or expiry.",
    Icon: StepFundIcon,
  },
  {
    num: "03",
    title: "Trigger event",
    desc: "Real-world data from NOAA, drought monitors, seismic networks, and other verified sources is checked automatically.",
    Icon: StepTriggerIcon,
  },
  {
    num: "04",
    title: "Automatic payout",
    desc: "If the trigger is met, the contract pays out immediately. No adjuster, no delay.",
    Icon: StepPayoutIcon,
  },
]

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="page-container">
        <Reveal as="p" className="section-label">
          How it works
        </Reveal>
        <Reveal as="h2" className="how-heading">
          Simple. Smart. Secure.
        </Reveal>
        <div className="how-grid">
          {steps.map((s, i) => (
            <Reveal as="article" className="how-step" key={s.num} delay={i}>
              <div className="how-step-icon">
                <s.Icon />
              </div>
              <p className="how-step-num">{s.num}</p>
              <h3 className="how-step-title">{s.title}</h3>
              <p className="how-step-desc">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
