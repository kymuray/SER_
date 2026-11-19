import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  cancelAppointment,
  getAppointmentsByStudent,
  rescheduleAppointment,
  type AppointmentData,
} from '../../services/appointmentService'
import { getStudent } from '../../services/studentService'
import {
  getAvailableTimes,
  type AvailableTime,
} from '../../services/availabilityService'
import './MeusAgendamentos.css'

function parseDateParts(date: string | unknown) {
  if (typeof date !== 'string') {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim())

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsedDate = new Date(year, month - 1, day)

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return { year, month, day, parsedDate }
}

function formatDate(date: string | unknown) {
  const parts = parseDateParts(date)

  if (!parts) {
    return 'Data não disponível'
  }

  return parts.parsedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function ScheduledAppointmentCard({
  appointment,
  onReschedule,
  onCancel,
}: {
  appointment: AppointmentData
  onReschedule: () => void
  onCancel: () => void
}) {
  return (
    <div className="appointment-card appointment-card--scheduled">
      <div className="appointment-card__date">
        <span>{parseDateParts(appointment.data)?.parsedDate.toLocaleDateString('pt-BR', { weekday: 'long' }) ?? 'Data'}</span>
        <strong>{parseDateParts(appointment.data)?.day.toString().padStart(2, '0') ?? '--'}</strong>
        <span>{parseDateParts(appointment.data)?.parsedDate.toLocaleDateString('pt-BR', { month: 'long' }) ?? 'Data'}</span>
      </div>

      <div className="appointment-card__details">
        <p className="appointment-card__status">Agendamento confirmado</p>
        <h3>Escuta SER</h3>

        <div className="appointment-card__meta">
          <span>{appointment.horario} — 30 minutos</span>
          <span>Sala do SER</span>
          <span>{formatDate(appointment.data)}</span>
        </div>

        <div className="appointment-card__actions">
          <button
            type="button"
            className="appointment-card__button appointment-card__button--neutral"
            onClick={onReschedule}
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
      <div className="appointment-card__empty-copy">
        <p className="appointment-card__status">Sem agendamento</p>
        <h3>Nenhum atendimento agendado</h3>
        <p className="appointment-card__description">
          Quando você marcar uma escuta, os detalhes aparecerão aqui.
        </p>
      </div>

      <Link className="appointment-card__action" to="/agendar">
        Agendar escuta
      </Link>
    </div>
  )
}

export default function MeusAgendamentos() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [rescheduling, setRescheduling] = useState<AppointmentData | null>(null)
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([])
  const [newSlotId, setNewSlotId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function loadAppointments() {
    if (!user) return

    setLoading(true)
    setFeedback('')

    try {
      const student = await getStudent(user.uid)

      if (!student?.id_aluno) {
        throw new Error('Não foi possível identificar o aluno.')
      }

      const data = await getAppointmentsByStudent(student.id_aluno)
      setAppointments(data.filter((item) => item.status === 'agendado'))
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível carregar seus agendamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [user])

  async function openReschedule(appointment: AppointmentData) {
    setRescheduling(appointment)
    setNewSlotId(null)
    setFeedback('')

    try {
      const slots = await getAvailableTimes()
      setAvailableTimes(
        slots.filter(
          (slot) =>
            slot.disponivel &&
            `${slot.data} ${slot.horario}` !==
              `${appointment.data} ${appointment.horario}`,
        ),
      )
    } catch {
      setFeedback('Não foi possível carregar os horários disponíveis.')
    }
  }

  async function handleReschedule() {
    if (!rescheduling || !newSlotId) return

    const newSlot = availableTimes.find((slot) => slot.id_horario === newSlotId)

    if (!newSlot) return

    setSaving(true)
    setFeedback('')

    try {
      await rescheduleAppointment(
        rescheduling.id_agendamento,
        newSlot.data,
        newSlot.horario,
        newSlot.id_horario,
      )

      setRescheduling(null)
      await loadAppointments()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível reagendar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel(appointment: AppointmentData) {
    const confirmed = window.confirm(
      'Deseja realmente cancelar este agendamento?',
    )

    if (!confirmed) return

    setSaving(true)
    setFeedback('')

    try {
      await cancelAppointment(appointment.id_agendamento)
      await loadAppointments()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível cancelar o agendamento.')
    } finally {
      setSaving(false)
    }
  }

  const nextAppointment = appointments[0] ?? null

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

        <div className="appointments-page__summary">
          <strong>{nextAppointment ? 1 : 0}</strong>
          <span>agendamento ativo</span>
        </div>
      </header>

      {feedback && <p className="form-feedback" role="alert">{feedback}</p>}

      <section className="appointments-section" aria-labelledby="upcoming-title">
        <div className="appointments-section__heading">
          <p className="appointments-section__eyebrow">Acompanhe seu cuidado</p>
          <h2 id="upcoming-title">Próximo atendimento</h2>
        </div>

        {loading ? (
          <div className="appointment-card appointment-card--empty">
            <div className="appointment-card__empty-copy">
              <p>Carregando seus agendamentos...</p>
            </div>
          </div>
        ) : nextAppointment ? (
          <ScheduledAppointmentCard
            appointment={nextAppointment}
            onReschedule={() => openReschedule(nextAppointment)}
            onCancel={() => handleCancel(nextAppointment)}
          />
        ) : (
          <EmptyAppointmentCard />
        )}
      </section>

      {rescheduling && (
        <div
          className="management-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRescheduling(null)
          }}
        >
          <section className="management-modal" role="dialog" aria-modal="true">
            <header className="management-modal__header">
              <div>
                <p className="eyebrow">Reagendamento</p>
                <h2>Escolha um novo horário</h2>
              </div>
            </header>

            <div className="management-detail-content">
              <p>
                Seu horário atual: <strong>{formatDate(rescheduling.data)}, às {rescheduling.horario}</strong>
              </p>

              <label htmlFor="new-slot">Novo horário</label>
              <select
                id="new-slot"
                value={newSlotId ?? ''}
                onChange={(event) => setNewSlotId(Number(event.target.value) || null)}
                disabled={saving}
              >
                <option value="">Selecione um horário</option>
                {availableTimes.map((slot) => (
                  <option key={slot.id_horario} value={slot.id_horario}>
                    {formatDate(slot.data)} — {slot.horario}
                  </option>
                ))}
              </select>

              <div className="management-modal__footer">
                <button
                  type="button"
                  className="management-secondary-button"
                  onClick={() => setRescheduling(null)}
                  disabled={saving}
                >
                  Voltar
                </button>
                <button
                  type="button"
                  className="management-primary-button"
                  onClick={handleReschedule}
                  disabled={!newSlotId || saving}
                >
                  {saving ? 'Salvando...' : 'Confirmar reagendamento'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <p className="booking-footnote">
        Precisa de um novo horário? <Link to="/agendar">Agendar escuta</Link>.
      </p>
    </main>
  )
}
