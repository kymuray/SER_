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

function HeroSection() {
  return (
    <section className="hero-copy" aria-labelledby="home-title">
      <div className="hero-copy__intro">

        <h1 id="home-title">
          Você não precisa passar por tudo sozinho.
        </h1>

        <p>
          O SER é um espaço seguro para você conversar, ser ouvido e se sentir
          acolhido.
        </p>

        <a className="booking-button" href="/agendar">
          <span>Agendar Atendimento</span>
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M4.5 12h14M12.5 5.5 19 12l-6.5 6.5" />
          </svg>
        </a>
      </div>

      <div className="hero-copy__steps">
        <p className="section-eyebrow">Como funciona</p>
        <h2>Simples do começo ao fim</h2>

        <ol className="steps-list">
          {steps.map(({ title, description }, index) => (
            <li className="steps-list__item" key={title}>
              <span
                className={`steps-list__number ${
                  index === 2 ? 'steps-list__number--highlight' : ''
                }`}
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
      </div>
    </section>
  )
}

export default HeroSection