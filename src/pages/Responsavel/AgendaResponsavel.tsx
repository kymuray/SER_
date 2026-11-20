
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  createAvailableTime,
  getAvailableTimes,
  type AvailableTime,
} from '../../services/availabilityService'

import {
  cancelAppointment,
  deleteAppointment,
  reactivateAppointment,
  getAppointmentsByResponsible,
  type AppointmentData,
} from '../../services/appointmentService'

import {
  getAttendanceByAppointment,
  setAttendanceStatus,
  type AttendanceData,
} from '../../services/attendanceService'

import { getStudentsByIds } from '../../services/studentService'
import { RESPONSAVEL_ID } from '../../services/responsibleService'

type AgendaItem = {
  appointment?: AppointmentData
  slot?: AvailableTime
  student?: string
}

type WeekDaySummary = {
  date: string
  available: number
  booked: number
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
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
  )

  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [slots, setSlots] = useState<AvailableTime[]>([])
  const [students, setStudents] = useState<Record<number, string>>({})
  const [attendanceByAppointment, setAttendanceByAppointment] = useState<
    Record<number, AttendanceData>
  >({})
  const [weekSummary, setWeekSummary] = useState<WeekDaySummary[]>([])

  const [showAddTime, setShowAddTime] = useState(false)
  const [newTime, setNewTime] = useState('15:00')

  const dateInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function loadAgenda() {
    setLoading(true)
    setFeedback('')

    try {
      const selected = new Date(`${selectedDate}T12:00:00`)
      const mondayOffset = (selected.getDay() + 6) % 7
      const monday = new Date(selected)

      monday.setDate(selected.getDate() - mondayOffset)

      const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday)
        date.setDate(monday.getDate() + index)

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })

      const [appointmentData, availabilityByDay] = await Promise.all([
        getAppointmentsByResponsible(RESPONSAVEL_ID),
        Promise.all(weekDates.map((date) => getAvailableTimes(date))),
      ])

      const appointmentsByDay = new Map<string, AppointmentData[]>()

      weekDates.forEach((date) => {
        appointmentsByDay.set(
          date,
          appointmentData.filter((item) => item.data === date),
        )
      })

      setWeekSummary(
        weekDates.map((date, index) => ({
          date,
          available: availabilityByDay[index].length,
          booked:
            appointmentsByDay
              .get(date)
              ?.filter((item) => item.status === 'agendado').length || 0,
        })),
      )

      const dailyAppointments = appointmentsByDay.get(selectedDate) || []
      const ids = dailyAppointments.map((item) => item.id_aluno)

      const studentData = await getStudentsByIds(ids)

      const names: Record<number, string> = {}

      studentData.forEach((student) => {
        names[student.id_aluno] =
          student.nome_preferido?.trim() || student.nome_completo
      })

      const attendanceEntries = await Promise.all(
        dailyAppointments.map(async (item) => [
          item.id_agendamento,
          await getAttendanceByAppointment(item.id_agendamento),
        ] as const),
      )

      const attendanceMap: Record<number, AttendanceData> = {}

      attendanceEntries.forEach(([id, value]) => {
        if (value) {
          attendanceMap[id] = value as AttendanceData
        }
      })

      setAttendanceByAppointment(attendanceMap)
      setAppointments(dailyAppointments)
      setSlots(availabilityByDay[weekDates.indexOf(selectedDate)] || [])
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
    const booked: AgendaItem[] = appointments.map((appointment) => ({
      appointment,
      student: students[appointment.id_aluno] || 'Aluno',
    }))

    const free: AgendaItem[] = slots
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

  async function changeAppointmentStatus(
    appointment: AppointmentData,
    value: string,
  ) {
    setSaving(true)
    setFeedback('')

    try {
      if (appointment.status === 'cancelado' && value !== 'Cancelado') {
        if (value !== 'Confirmado') {
          setFeedback(
            'Reative o agendamento antes de registrar a conclusão ou ausência.',
          )
          return
        }

        await reactivateAppointment(appointment.id_agendamento)
      } else if (value === 'Cancelado') {
        if (appointment.status !== 'cancelado') {
          await cancelAppointment(appointment.id_agendamento)
        }
      } else if (value === 'Concluído' || value === 'Ausente') {
        const id = await setAttendanceStatus(
          appointment.id_agendamento,
          appointment.data,
          value === 'Concluído',
        )

        const attendance = (await getAttendanceByAppointment(
          appointment.id_agendamento,
        )) as AttendanceData | null

        if (attendance) {
          setAttendanceByAppointment((current) => ({
            ...current,
            [appointment.id_agendamento]: attendance,
          }))
        } else {
          setAttendanceByAppointment((current) => ({
            ...current,
            [appointment.id_agendamento]: {
              id_atendimento: id,
              id_agendamento: appointment.id_agendamento,
              data: appointment.data,
              presenca: value === 'Concluído',
              concluido: true,
              resumo_geral: '',
            },
          }))
        }
      } else {
        setFeedback(
          'Para reativar um cancelamento, realize um novo agendamento.',
        )
        return
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id_agendamento === appointment.id_agendamento
            ? {
                ...item,
                status: value === 'Cancelado' ? 'cancelado' : 'agendado',
              }
            : item,
        ),
      )

      await loadAgenda()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o status.',
      )
    } finally {
      setSaving(false)
    }
  }

  // Exclusão permanente do agendamento
  async function removeAppointment(appointment: AppointmentData) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir permanentemente o agendamento de ${
        students[appointment.id_aluno] || 'este aluno'
      }?`,
    )

    if (!confirmed) return

    setSaving(true)
    setFeedback('')

    try {
      await deleteAppointment(appointment.id_agendamento)

      setFeedback('Agendamento excluído com sucesso.')

      await loadAgenda()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o agendamento.',
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

      {feedback && (
        <p className="form-feedback" role="alert">
          {feedback}
        </p>
      )}

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
            <label
              className="agenda-picker-field"
              htmlFor="agenda-date"
              onClick={(event) => {
                if (event.target !== dateInputRef.current) {
                  event.preventDefault()
                  dateInputRef.current?.showPicker?.()
                }
              }}
            >
              <span>Data</span>
              <strong>
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  'pt-BR',
                )}
              </strong>

              <input
                ref={dateInputRef}
                id="agenda-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                aria-label="Selecionar data da agenda"
              />
            </label>

            {showAddTime && (
              <>
                <label
                  className="agenda-picker-field agenda-picker-field--time"
                  htmlFor="add-time"
                  onClick={(event) => {
                    if (event.target !== timeInputRef.current) {
                      event.preventDefault()
                      timeInputRef.current?.showPicker?.()
                    }
                  }}
                >
                  <span>Horário</span>
                  <strong>{newTime}</strong>

                  <input
                    ref={timeInputRef}
                    id="add-time"
                    type="time"
                    step="1800"
                    value={newTime}
                    onChange={(event) => setNewTime(event.target.value)}
                    aria-label="Selecionar horário disponível"
                  />
                </label>

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
                const time =
                  appointment?.horario || item.slot?.horario || ''

                const attendance = appointment
                  ? attendanceByAppointment[appointment.id_agendamento]
                  : undefined

                const status = appointment
                  ? appointment.status === 'cancelado'
                    ? 'Cancelado'
                    : attendance?.concluido
                      ? attendance.presenca
                        ? 'Concluído'
                        : 'Ausente'
                      : 'Confirmado'
                  : 'Disponível'

                return (
                  <article
                    className="agenda-row"
                    key={
                      appointment?.id_agendamento ?? item.slot?.id_horario
                    }
                  >
                    <strong>{time}</strong>

                    <span className="agenda-student">
                      {appointment ? item.student : 'Horário livre'}
                    </span>

                    <div className="agenda-row__status">
                      <span
                        className={`agenda-status ${
                          status === 'Cancelado'
                            ? 'cancelled'
                            : status === 'Concluído'
                              ? 'done'
                              : status === 'Ausente'
                                ? 'absent'
                                : status === 'Disponível'
                                  ? 'free'
                                  : 'confirmed'
                        }`}
                      >
                        {status}
                      </span>

                      {appointment && (
                        <label
                          className="agenda-status-editor"
                          aria-label={`Alterar status de ${item.student || 'aluno'}`}
                        >
                          <select
                            value={status}
                            disabled={saving}
                            onChange={(event) =>
                              void changeAppointmentStatus(
                                appointment,
                                event.target.value,
                              )
                            }
                            aria-label="Status do atendimento"
                          >
                            <option value="Confirmado">Confirmado</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Ausente">Ausente</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </label>
                      )}
                    </div>

                    <span className="agenda-free-label">
                      {appointment
                        ? '30 minutos'
                        : 'Disponível para agendamento'}
                    </span>

                    {appointment && (
                      <button
                        className="button button--dark"
                        type="button"
                        disabled={saving}
                        onClick={() => void removeAppointment(appointment)}
                      >
                        Excluir
                      </button>
                    )}
                  </article>
                )
              })
            )}
          </div>
        </section>

        <aside className="surface-card weekly-card">
          <p className="eyebrow">Visão semanal</p>
          <h2>Disponibilidade</h2>

          <div
            className="staff-week-days"
            aria-label="Selecionar dia da semana"
          >
            {weekSummary.map((day) => {
              const date = new Date(`${day.date}T12:00:00`)

              return (
                <button
                  type="button"
                  key={day.date}
                  className={`staff-week-day ${
                    selectedDate === day.date ? 'is-selected' : ''
                  }`}
                  aria-pressed={selectedDate === day.date}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span>
                    {date
                      .toLocaleDateString('pt-BR', {
                        weekday: 'short',
                      })
                      .replace('.', '')}{' '}
                    {date.getDate()}
                  </span>
                  <strong>{day.available} livres</strong>
                </button>
              )
            })}
          </div>

          <p className="occupancy-label">
            Dia selecionado <strong>{formatDate(selectedDate)}</strong>
          </p>

          <p className="occupancy-label">
            Agendamentos ativos{' '}
            <strong>
              {
                appointments.filter(
                  (item) => item.status === 'agendado',
                ).length
              }
            </strong>
          </p>

          <div className="progress">
            <span
              style={{
                width: `${
                  slots.length +
                    appointments.filter(
                      (item) => item.status === 'agendado',
                    ).length
                    ? Math.min(
                        100,
                        (appointments.filter(
                          (item) => item.status === 'agendado',
                        ).length /
                          (slots.length +
                            appointments.filter(
                              (item) => item.status === 'agendado',
                            ).length)) *
                          100,
                      )
                    : 0
                }%`,
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
