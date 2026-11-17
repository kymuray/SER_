import { useState } from 'react'
import { Link } from 'react-router-dom'
import { saveAppointment } from '../../utils/appointments'

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const availableTimes = [
  '09:00',
  '09:30',
  '10:30',
  '14:00',
  '14:30',
  '16:00',
]

function StepsIndicator({ step }: { step: number }) {
  return (
    <ol className="steps-indicator" aria-label={`Etapa ${step} de 3`}>
      {[1, 2, 3].map((number) => (
        <li
          className={number <= step ? 'is-active' : ''}
          key={number}
          aria-current={number === step ? 'step' : undefined}
        >
          {number}
        </li>
      ))}
    </ol>
  )
}

export default function Agendar() {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [day, setDay] = useState<number | null>(null)
  const [time, setTime] = useState('')
  const [step, setStep] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()

  const monthName = month.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const dateLabel = day
    ? new Date(year, monthIndex, day).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  const availableDays = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1,
  ).filter((date) =>
    [2, 3, 4].includes(new Date(year, monthIndex, date).getDay()),
  )

  function changeMonth(offset: number) {
    setMonth(new Date(year, monthIndex + offset, 1))
    setDay(null)
    setTime('')
    setStep(1)
    setShowConfirmation(false)
  }

  function selectDay(selectedDay: number) {
    setDay(selectedDay)
    setTime('')
    setStep(2)
    setShowConfirmation(false)
  }

  function selectTime(selectedTime: string) {
    setTime(selectedTime)
    setStep(3)
    setShowConfirmation(false)
  }

  function isTimeAvailable(selectedTime: string) {
    if (!day) return false

    const selectedWeekday = new Date(year, monthIndex, day).getDay()
    const hour = Number(selectedTime.slice(0, 2))

    // Terças e quartas pela manhã; quintas à tarde.
    if (selectedWeekday === 4) return hour >= 12
    return hour < 12
  }

  function confirmAppointment() {
    if (!day || !time) return

    const selectedDate = [
      year,
      String(monthIndex + 1).padStart(2, '0'),
      String(day).padStart(2, '0'),
    ].join('-')

    saveAppointment({
      date: selectedDate,
      time,
      status: 'Agendamento confirmado',
      title: 'Escuta SER',
      location: 'Sala do SER',
      durationMinutes: 30,
    })

    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <main className="page-shell booking-shell">
        <StepsIndicator step={3} />

        <section className="confirmation-card">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>

          <span className="status-pill">Agendamento confirmado</span>

          <h1>Seu momento está reservado.</h1>

          <p>
            Você poderá consultar, remarcar ou cancelar este agendamento quando
            precisar.
          </p>

          <div className="booking-summary">
            <div>
              <small>Data</small>
              <strong>{dateLabel}</strong>
            </div>

            <div>
              <small>Horário</small>
              <strong>{time} — 30 minutos</strong>
            </div>

            <div>
              <small>Local</small>
              <strong>Sala do SER</strong>
            </div>
          </div>

          <Link className="button button--primary" to="/agendamentos">
            Ver meu agendamento
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell booking-shell">
      <header className="page-heading">
        <p className="eyebrow">Programa SER</p>
        <h1>Agendar escuta</h1>
        <p className="page-lead">
          Escolha uma data e um horário disponível para seu atendimento de
          acolhimento.
        </p>
      </header>

      <StepsIndicator step={step} />

      <div className="booking-grid">
        <section className="surface-card calendar-card">
          <div className="calendar-head">
            <button
              className="icon-button"
              type="button"
              aria-label="Mês anterior"
              onClick={() => changeMonth(-1)}
            >
              ‹
            </button>

            <h2>{monthName}</h2>

            <button
              className="icon-button"
              type="button"
              aria-label="Próximo mês"
              onClick={() => changeMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="calendar-grid">
            {weekdays.map((weekday, index) => (
              <span className="weekday" key={`${weekday}-${index}`}>
                {weekday}
              </span>
            ))}

            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`empty-${index}`} aria-hidden="true" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const calendarDay = index + 1
              const candidate = new Date(year, monthIndex, calendarDay)
              const today = new Date()
              today.setHours(0, 0, 0, 0)

              const enabled =
                availableDays.includes(calendarDay) && candidate >= today

              return (
                <button
                  className={`day-button ${
                    day === calendarDay ? 'selected' : ''
                  }`}
                  disabled={!enabled}
                  key={calendarDay}
                  type="button"
                  aria-pressed={day === calendarDay}
                  onClick={() => selectDay(calendarDay)}
                >
                  {calendarDay}
                </button>
              )
            })}
          </div>

          <div className="calendar-legend">
            <span>
              <i />
              Disponível
            </span>
            <span>
              <i className="legend-selected" />
              Selecionado
            </span>
          </div>

          <p className="availability-note">
            Os horários ilustrativos seguem a disponibilidade semanal
            informada: terças e quartas pela manhã e quintas à tarde.
          </p>
        </section>

        <section className="surface-card time-card">
          <p className="eyebrow">
            {day ? dateLabel : 'Selecione uma data'}
          </p>

          <h2>
            {day
              ? `${day} de ${monthName.split(' de ')[0]}`
              : 'Horários disponíveis'}
          </h2>

          <p className="field-hint">
            {day
              ? 'Selecione um horário disponível:'
              : 'Escolha primeiro um dia destacado no calendário.'}
          </p>

          <div className="time-options">
            {availableTimes.map((availableTime) => (
              <button
                className={time === availableTime ? 'chosen' : ''}
                disabled={!day || !isTimeAvailable(availableTime)}
                key={availableTime}
                type="button"
                aria-pressed={time === availableTime}
                onClick={() => selectTime(availableTime)}
              >
                {availableTime}
              </button>
            ))}
          </div>

          {day && time && (
            <div className="selected-slot">
              Horário escolhido: <strong>{time}</strong>
            </div>
          )}

          <button
            className="button button--primary button--wide"
            disabled={!day || !time}
            type="button"
            onClick={() => setShowConfirmation(true)}
          >
            Continuar
          </button>

          {showConfirmation && day && time && (
            <div className="confirm-inline">
              <p>
                Confirme sua escolha:{' '}
                <strong>
                  {dateLabel}, às {time}
                </strong>
                .
              </p>

              <p className="field-hint">
                Confira os dados antes de confirmar o agendamento.
              </p>

              <button
                className="button button--primary button--wide"
                type="button"
                onClick={confirmAppointment}
              >
                Confirmar agendamento
              </button>
            </div>
          )}
        </section>
      </div>

      <p className="booking-footnote">
        Já possui um horário?{' '}
        <Link to="/agendamentos">Consulte seus agendamentos</Link>.
      </p>
    </main>
  )
}
