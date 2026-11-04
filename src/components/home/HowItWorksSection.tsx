const steps = [
  {
    title: 'Cadastre-se ou Faça o Login',
    description: 'Identifique-se de forma simples.',
  },
  {
    title: 'Escolha um horário',
    description: 'Veja as opções disponíveis na agenda.',
  },
  {
    title: 'Confirme',
    description: 'Revise os dados e pronto.',
  },
]

function HowItWorksSection() {
  return (
    <section
      className="how-it-works"
      aria-labelledby="how-it-works-title"
    >
      <p className="section-eyebrow">Como funciona</p>
      <h2 id="how-it-works-title">Simples do começo ao fim</h2>

      <ol className="steps-list">
        {steps.map(({ title, description }, index) => (
          <li className="steps-list__item" key={title}>
            <span
              className={`steps-list__number ${index === 2 ? 'steps-list__number--highlight' : ''}`}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="steps-list__copy">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default HowItWorksSection
