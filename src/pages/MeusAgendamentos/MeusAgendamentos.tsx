
import { useState } from 'react'
import './MeusAgendamentos.css'
import {
  getAppointment,
  removeAppointment,
  type Appointment,
} from '../../utils/appointments'

function ScheduledAppointmentCard({
  appointment,
  onCancel,
}: {
  appointment: Appointment
  onCancel: () => void
}) {
  const date = new Date(`${appointment.date}T12:00:00`)

  const month = date.toLocaleDateString('pt-BR', { month: 'long' })
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit' })
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })

  return (
    <div className="appointment-card appointment-card--scheduled">
      <div
        className="appointment-card__date"
        aria-label={`${month}, dia ${day}, ${weekday}`}
      >
        <span>{month}</span>
        <strong>{day}</strong>
        <span>{weekday}</span>
      </div>

      <div className="appointment-card__details">
        <p className="appointment-card__status">{appointment.status}</p>
        <h3>{appointment.title}</h3>

        <div className="appointment-card__meta">
          <span>
            {appointment.time} — {appointment.durationMinutes} minutos
          </span>
          <span>{appointment.location}</span>
        </div>

        <div className="appointment-card__actions">
          <button
            type="button"
            className="appointment-card__button appointment-card__button--neutral"
          >
            Remarcar
          </button>

          <button
            type="button"
            className="appointment-card__button appointment-card__button--danger"
            onClick={onCancel}
          >
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
      <div
        className="appointment-card__date appointment-card__date--empty"
        aria-hidden="true"
      >
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
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(
    () => getAppointment()
  )

  function handleCancelAppointment() {
    const confirmed = window.confirm(
      'Deseja realmente cancelar seu agendamento demonstrativo?'
    )

    if (!confirmed) return

    removeAppointment()
    setNextAppointment(null)
  }

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

        <div
          className="appointments-page__summary"
          aria-label="Resumo de agendamentos"
        >
          <strong>{nextAppointment ? 1 : 0}</strong>
          <span>agendamentos</span>
        </div>
      </header>

      <section
        className="appointments-section"
        aria-labelledby="upcoming-title"
      >
        <div className="appointments-section__heading">
          <p className="appointments-section__eyebrow">
            Acompanhe seu cuidado
          </p>
          <h2 id="upcoming-title">Próximo atendimento</h2>
        </div>

        {nextAppointment ? (
          <ScheduledAppointmentCard
            appointment={nextAppointment}
            onCancel={handleCancelAppointment}
          />
        ) : (
          <EmptyAppointmentCard />
        )}
      </section>
    </main>
  )
}

export default MeusAgendamentos
