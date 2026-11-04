type BenefitIconName = 'conversation' | 'shield' | 'clock'

const benefits: { label: string; icon: BenefitIconName }[] = [
  { label: 'Escuta e Atendimento', icon: 'conversation' },
  { label: 'Sigilo e Respeito', icon: 'shield' },
  { label: 'Atendimento de 30 minutos', icon: 'clock' },
]

function BenefitIcon({ name }: { name: BenefitIconName }) {
  if (name === 'conversation') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M5 4.75h14a1.25 1.25 0 0 1 1.25 1.25v8A1.25 1.25 0 0 1 19 15.25h-5.5L9 18.5v-3.25H5A1.25 1.25 0 0 1 3.75 14V6A1.25 1.25 0 0 1 5 4.75Z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    )
  }

  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="m12 2.75 2.45 1.55 2.9.16.95 2.74 2.1 2-1 2.72.5 2.86-2.4 1.65-1.3 2.6-2.9-.16L12 20.25l-2.45-1.55-2.9-.16-.95-2.74-2.1-2 1-2.72-.5-2.86 2.4-1.65 1.3-2.6 2.9.16L12 2.75Z" />
        <path d="m9.2 11.9 1.8 1.8 3.8-3.9" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 6.75v5.5l3.5 2" />
    </svg>
  )
}

function BenefitsSection() {
  return (
    <section className="benefits" aria-label="Benefícios do atendimento">
      <ul className="benefits__list">
        {benefits.map(({ label, icon }) => (
          <li className="benefits__item" key={label}>
            <BenefitIcon name={icon} />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BenefitsSection
