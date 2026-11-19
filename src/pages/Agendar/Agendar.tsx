import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getStudent } from '../../services/studentService'
import {
  createAppointment,
  type AppointmentData,
} from '../../services/appointmentService'
import {
  getAvailableTimes,
  type AvailableTime,
} from '../../services/availabilityService'

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

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

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function Agendar() {
  const { user } = useAuth()
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [day, setDay] = useState<number | null>(null)
  const [time, setTime] = useState('')
  const [step, setStep] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmed, setConfirmed] = useState<AppointmentData | null>(null)
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([])
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  useEffect(() => {
    let active = true

    async function loadTimes() {
      setLoadingTimes(true)
      setError('')

      try {
        const data = await getAvailableTimes()
        if (active) setAvailableTimes(data)
      } catch {
        if (active) setError('Não foi possível carregar os horários disponíveis.')
      } finally {
        if (active) setLoadingTimes(false)
      }
    }

    loadTimes()

    return () => {
      active = false
    }
  }, [])

  const slotsByDate = useMemo(() => {
    const map = new Map<string, AvailableTime[]>()

    for (const slot of availableTimes) {
      const current = map.get(slot.data) ?? []
      current.push(slot)
      map.set(slot.data, current)
    }

    return map
  }, [availableTimes])

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()

  const monthName = month.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const selectedDate = day
    ? `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : ''

  const dateLabel = selectedDate ? formatDate(selectedDate) : ''

  const availableDays = new Set(
    availableTimes
      .filter((slot) => slot.disponivel)
      .map((slot) => slot.data)
      .filter((date) => date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`))
      .map((date) => Number(date.slice(-2))),
  )

  function changeMonth(offset: number) {
    setMonth(new Date(year, monthIndex + offset, 1))
    setDay(null)
    setTime('')
    setStep(1)
    setShowConfirmation(false)
    setError('')
  }

  function selectDay(selectedDay: number) {
    setDay(selectedDay)
    setTime('')
    setStep(2)
    setShowConfirmation(false)
    setError('')
  }

  function selectTime(selectedTime: string) {
    setTime(selectedTime)
    setStep(3)
    setShowConfirmation(false)
    setError('')
  }

  async function confirmAppointment() {
    if (!user || !day || !time || !selectedDate) return

    setLoading(true)
    setError('')

    try {
      const student = await getStudent(user.uid)

      if (!student?.id_aluno) {
        throw new Error('Não foi possível identificar o aluno.')
      }

      const slot = slotsByDate
        .get(selectedDate)
        ?.find((item) => item.horario === time && item.disponivel)

      if (!slot) {
        throw new Error('Este horário não está mais disponível.')
      }

      const idAgendamento = await createAppointment({
        id_horario: slot.id_horario,
        id_responsavel: 1,
        id_aluno: student.id_aluno,
        data: selectedDate,
        horario: time,
        status: 'agendado',
      })

      const appointment = await import('../../services/appointmentService').then(
        ({ getAppointment }) => getAppointment(idAgendamento),
      )

      setConfirmed(appointment)
      setAvailableTimes((current) =>
        current.map((item) =>
          item.id_horario === slot.id_horario
            ? { ...item, disponivel: false, id_agendamento: idAgendamento }
            : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível confirmar o agendamento.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <main className="page-shell booking-shell">
        <StepsIndicator step={3} />

        <section className="confirmation-card">
          <div className="success-mark" aria-hidden="true">✓</div>
          <span className="status-pill">Agendamento confirmado</span>

          <h1>Seu momento está reservado.</h1>

          <p>
            Seu agendamento foi salvo no sistema. Você poderá consultar,
            remarcar ou cancelar quando precisar.
          </p>

          <div className="booking-summary">
            <div>
              <small>Data</small>
              <strong>{formatDate(confirmed.data)}</strong>
            </div>

            <div>
              <small>Horário</small>
              <strong>{confirmed.horario} — 30 minutos</strong>
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
          Escolha uma data e um horário disponível para seu atendimento de acolhimento.
        </p>
      </header>

      <StepsIndicator step={step} />

      {error && <p className="form-feedback" role="alert">{error}</p>}

      <div className="booking-grid">
        <section className="surface-card calendar-card">
          <div className="calendar-head">
            <button className="icon-button" type="button" aria-label="Mês anterior" onClick={() => changeMonth(-1)}>‹</button>
            <h2>{monthName}</h2>
            <button className="icon-button" type="button" aria-label="Próximo mês" onClick={() => changeMonth(1)}>›</button>
          </div>

          <div className="calendar-grid">
            {weekdays.map((weekday, index) => (
              <span className="weekday" key={`${weekday}-${index}`}>{weekday}</span>
            ))}

            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`empty-${index}`} aria-hidden="true" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const calendarDay = index + 1
              const candidate = new Date(year, monthIndex, calendarDay)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const enabled = candidate >= today && availableDays.has(calendarDay)

              return (
                <button
                  className={`day-button ${day === calendarDay ? 'selected' : ''}`}
                  disabled={!enabled || loadingTimes}
                  key={calendarDay}
                  type="button"
                  aria-pressed={day === calendarDay}
                  onClick={() => selectDay(calendarDay)}
                  title={enabled ? 'Horários disponíveis' : 'Sem horários disponíveis'}
                >
                  {calendarDay}
                </button>
              )
            })}
          </div>

          <div className="calendar-legend">
            <span><i /> Disponível</span>
            <span><i className="legend-selected" /> Selecionado</span>
          </div>

          <p className="availability-note">
            Os horários exibidos são cadastrados pela responsável e possuem duração fixa de 30 minutos.
          </p>
        </section>

        <section className="surface-card time-card">
          <p className="eyebrow">{day ? dateLabel : 'Selecione uma data'}</p>

          <h2>{day ? `${day} de ${monthName.split(' de ')[0]}` : 'Horários disponíveis'}</h2>

          <p className="field-hint">
            {loadingTimes
              ? 'Carregando horários...'
              : day
                ? 'Selecione um horário disponível:'
                : 'Escolha primeiro uma data com horários disponíveis.'}
          </p>

          <div className="time-options">
            {(slotsByDate.get(selectedDate) ?? []).map((slot) => (
              <button
                className={time === slot.horario ? 'chosen' : ''}
                disabled={!day || !slot.disponivel || loading}
                key={slot.id_horario}
                type="button"
                aria-pressed={time === slot.horario}
                onClick={() => selectTime(slot.horario)}
              >
                {slot.horario}
              </button>
            ))}
          </div>

          {day && !(slotsByDate.get(selectedDate) ?? []).length && (
            <p className="field-hint">Não há horários disponíveis para esta data.</p>
          )}

          {day && time && (
            <div className="selected-slot">
              Horário escolhido: <strong>{time}</strong> — 30 minutos
            </div>
          )}

          <button
            className="button button--primary button--wide"
            disabled={!day || !time || loading}
            type="button"
            onClick={() => setShowConfirmation(true)}
          >
            {loading ? 'Salvando...' : 'Continuar'}
          </button>

          {showConfirmation && day && time && (
            <div className="confirm-inline">
              <p>
                Confirme sua escolha: <strong>{dateLabel}, às {time}</strong>.
              </p>

              <p className="field-hint">
                O horário será reservado no Firestore após a confirmação.
              </p>

              <button
                className="button button--primary button--wide"
                type="button"
                disabled={loading}
                onClick={confirmAppointment}
              >
                {loading ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </div>
          )}
        </section>
      </div>

      <p className="booking-footnote">
        Já possui um horário? <Link to="/agendamentos">Consulte seus agendamentos</Link>.
      </p>
    </main>
  )
}
