import './MeusAgendamentos.css'

type Appointment = {
  month: string
  day: string
  weekday: string
  status: string
  title: string
  time: string
  location: string
}

const nextAppointment: Appointment | null = null

function ScheduledAppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="appointment-card appointment-card--scheduled">
      <div className="appointment-card__date" aria-label={`${appointment.month}, dia ${appointment.day}, ${appointment.weekday}`}>
        <span>{appointment.month}</span>
        <strong>{appointment.day}</strong>
        <span>{appointment.weekday}</span>
      </div>
      <div className="appointment-card__details">
        <p className="appointment-card__status">{appointment.status}</p>
        <h3>{appointment.title}</h3>
        <div className="appointment-card__meta">
          <span>{appointment.time}</span>
          <span>{appointment.location}</span>
        </div>
        <div className="appointment-card__actions">
          <button type="button" className="appointment-card__button appointment-card__button--neutral">
            Remarcar
          </button>
          <button type="button" className="appointment-card__button appointment-card__button--danger">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyAppointmentCard() {
  return (
    <div className="appointment-card appointment-card--empty">
      <div className="appointment-card__date appointment-card__date--empty" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
          <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h3M8 17h6" />
        </svg>
      </div>
      <div className="appointment-card__empty-copy">
        <p className="appointment-card__status">Sem agendamento</p>
        <h3>Nenhum atendimento agendado</h3>
        <p className="appointment-card__description">
          Quando você marcar uma escuta, os detalhes aparecerão aqui.
        </p>
      </div>
      <a className="appointment-card__action" href="/agendar">
        Agendar escuta
      </a>
    </div>
  )
}

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
          <strong>{nextAppointment ? 1 : 0}</strong>
          <span>agendamentos</span>
        </div>
      </header>

      <section className="appointments-section" aria-labelledby="upcoming-title">
        <div className="appointments-section__heading">
          <p className="appointments-section__eyebrow">Acompanhe seu cuidado</p>
          <h2 id="upcoming-title">Próximo atendimento</h2>
        </div>

        {nextAppointment ? (
          <ScheduledAppointmentCard appointment={nextAppointment} />
        ) : (
          <EmptyAppointmentCard />
        )}
      </section>
    </main>
  )
}

export default MeusAgendamentos
