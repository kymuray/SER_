import { useEffect, useMemo, useState } from 'react'
import {
  createAvailableTime,
  getAvailableTimes,
  type AvailableTime,
} from '../../services/availabilityService'
import {
  getAppointmentsByResponsible,
  type AppointmentData,
} from '../../services/appointmentService'
import { getStudentsByIds } from '../../services/studentService'
import { RESPONSAVEL_ID } from '../../services/responsibleService'

type AgendaItem = {
  appointment?: AppointmentData
  slot?: AvailableTime
  student?: string
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

export default function AgendaResponsavel() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [slots, setSlots] = useState<AvailableTime[]>([])
  const [students, setStudents] = useState<Record<number, string>>({})
  const [showAddTime, setShowAddTime] = useState(false)
  const [newTime, setNewTime] = useState('15:00')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function loadAgenda() {
    setLoading(true)
    setFeedback('')

    try {
      const [appointmentData, availableData] = await Promise.all([
        getAppointmentsByResponsible(RESPONSAVEL_ID),
        getAvailableTimes(selectedDate),
      ])

      const ids = appointmentData
        .filter((item) => item.data === selectedDate)
        .map((item) => item.id_aluno)

      const studentData = await getStudentsByIds(ids)

      const names: Record<number, string> = {}
      studentData.forEach((student) => {
        names[student.id_aluno] =
          student.nome_preferido?.trim() || student.nome_completo
      })

      setAppointments(
        appointmentData.filter((item) => item.data === selectedDate),
      )
      setSlots(availableData)
      setStudents(names)
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a agenda.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgenda()
  }, [selectedDate])

  const agendaItems = useMemo<AgendaItem[]>(() => {
    const booked = appointments.map((appointment) => ({
      appointment,
      student: students[appointment.id_aluno] || 'Aluno',
    }))

    const free = slots
      .filter(
        (slot) =>
          slot.disponivel &&
          !booked.some(
            (item) =>
              item.appointment?.horario === slot.horario &&
              item.appointment?.data === slot.data,
          ),
      )
      .map((slot) => ({ slot }))

    return [...booked, ...free].sort((a, b) => {
      const timeA = a.appointment?.horario || a.slot?.horario || ''
      const timeB = b.appointment?.horario || b.slot?.horario || ''
      return timeA.localeCompare(timeB)
    })
  }, [appointments, slots, students])

  async function addTime() {
    setSaving(true)
    setFeedback('')

    try {
      await createAvailableTime(selectedDate, newTime)
      setShowAddTime(false)
      await loadAgenda()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o horário.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-shell staff-agenda-shell">
      <div className="page-heading staff-agenda-heading">
        <p className="eyebrow">Área da responsável</p>
        <h1>Agenda</h1>
        <p className="page-lead">
          Acompanhe os atendimentos e organize os horários disponíveis.
        </p>
      </div>

      {feedback && <p className="form-feedback" role="alert">{feedback}</p>}

      <div className="staff-dashboard staff-dashboard--agenda">
        <section className="surface-card day-agenda">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{formatDate(selectedDate)}</p>
              <h2>Agenda do dia</h2>
            </div>

            <div>
              <button
                className="button button--dark"
                type="button"
                onClick={() => setShowAddTime((visible) => !visible)}
              >
                {showAddTime ? 'Fechar' : 'Adicionar horário'}
              </button>
            </div>
          </div>

          <div className="add-time">
            <label htmlFor="agenda-date">Data</label>
            <input
              id="agenda-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />

            {showAddTime && (
              <>
                <label htmlFor="add-time">Horário</label>
                <input
                  id="add-time"
                  type="time"
                  step="1800"
                  value={newTime}
                  onChange={(event) => setNewTime(event.target.value)}
                />
                <button
                  className="button button--primary"
                  type="button"
                  onClick={addTime}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Adicionar'}
                </button>
              </>
            )}
          </div>

          <div className="agenda-list">
            {loading ? (
              <p>Carregando agenda...</p>
            ) : agendaItems.length === 0 ? (
              <p>Nenhum horário cadastrado para esta data.</p>
            ) : (
              agendaItems.map((item) => {
                const appointment = item.appointment
                const time = appointment?.horario || item.slot?.horario || ''
                const status = appointment
                  ? appointment.status === 'cancelado'
                    ? 'Cancelado'
                    : 'Confirmado'
                  : 'Disponível'

                return (
                  <article
                    className="agenda-row"
                    key={appointment?.id_agendamento ?? item.slot?.id_horario}
                  >
                    <strong>{time}</strong>
                    <span className="agenda-student">
                      {appointment
                        ? item.student
                        : 'Horário livre'}
                    </span>
                    <span
                      className={`agenda-status ${
                        status === 'Cancelado'
                          ? 'cancelled'
                          : status === 'Disponível'
                            ? ''
                            : ''
                      }`}
                    >
                      {status}
                    </span>
                    {appointment ? (
                      <span className="agenda-free-label">
                        30 minutos
                      </span>
                    ) : (
                      <span className="agenda-free-label">
                        Disponível para agendamento
                      </span>
                    )}
                  </article>
                )
              })
            )}
          </div>
        </section>

        <aside className="surface-card weekly-card">
          <p className="eyebrow">Horário selecionado</p>
          <h2>{formatDate(selectedDate)}</h2>
          <p className="occupancy-label">
            Horários cadastrados <strong>{slots.length}</strong>
          </p>
          <p className="occupancy-label">
            Agendamentos <strong>{appointments.filter((item) => item.status === 'agendado').length}</strong>
          </p>
          <div className="progress">
            <span
              style={{
                width: `${slots.length ? Math.min(100, (appointments.length / slots.length) * 100) : 0}%`,
              }}
            />
          </div>
        </aside>
      </div>

      <p className="demo-note">
        Os horários e agendamentos desta agenda são persistidos no Firestore.
      </p>
    </main>
  )
}
