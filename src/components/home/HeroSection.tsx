function HeroSection() {
  return (
    <section className="hero-copy" aria-labelledby="home-title">
      <h1 id="home-title">Você não precisa passar por tudo sozinho.</h1>
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
    </section>
  )
}

export default HeroSection
