import './MeusAgendamentos.css'

function MeusAgendamentos() {
  return (
    <main className="appointments-page" id="conteudo-principal">
        <header className="appointments-page__header">
          <div>
            <p className="appointments-page__eyebrow">Área do aluno</p>
            <h1>Meus agendamentos</h1>
            <p className="appointments-page__description">
              Acompanhe e gerencie seus atendimentos.
            </p>
          </div>
          <div className="appointments-page__summary" aria-label="Resumo de agendamentos">
            <strong>0</strong>
            <span>agendamentos</span>
          </div>
        </header>

        <section className="appointments-section" aria-labelledby="upcoming-title">
          <div className="appointments-section__heading">
            <div>
              <p className="appointments-section__eyebrow">Acompanhe seu cuidado</p>
              <h2 id="upcoming-title">Próximo atendimento</h2>
            </div>
          </div>

          <div className="appointment-card appointment-card--empty">
            <div className="appointment-card__empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" focusable="false">
                <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
                <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h3M8 17h6" />
              </svg>
            </div>
            <div className="appointment-card__empty-copy">
              <h3>Nenhum atendimento agendado</h3>
              <p>
                Quando você marcar uma escuta, os detalhes do seu próximo atendimento aparecerão aqui.
              </p>
            </div>
            <a className="appointment-card__action" href="/agendar">
              Agendar escuta
            </a>
          </div>
        </section>

        <section className="appointments-section appointments-section--history" aria-labelledby="history-title">
          <div className="appointments-section__heading">
            <div>
              <p className="appointments-section__eyebrow">Seus registros</p>
              <h2 id="history-title">Histórico de atendimentos</h2>
            </div>
          </div>

          <div className="history-empty">
            <div className="history-empty__mark" aria-hidden="true">—</div>
            <p>Ainda não há atendimentos concluídos ou cancelados.</p>
          </div>
        </section>
    </main>
  )
}

export default MeusAgendamentos
