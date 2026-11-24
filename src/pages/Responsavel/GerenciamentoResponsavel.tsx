import { useEffect, useMemo, useState } from 'react'
import './GerenciamentoResponsavel.css'
import { getAppointmentsByResponsible, type AppointmentData } from '../../services/appointmentService'
import {
  getAttendanceByAppointment,
  createAttendance,
  updateAttendance,
} from '../../services/attendanceService'
import { getStudentsByIds } from '../../services/studentService'
import { RESPONSAVEL_ID } from '../../services/responsibleService'
import Icon from '../../components/layout/Icon'

type FilterStatus = 'Concluídos' | 'Ausentes' | 'Cancelados' | 'Próximos'

type ManagementAppointment = {
  appointment: AppointmentData
  student: string
  summary: string
  attendanceId?: number
  attendanceCompleted: boolean
  presence: boolean
}

const filters: FilterStatus[] = [
  'Concluídos',
  'Ausentes',
  'Cancelados',
  'Próximos',
]

function parseDate(date: unknown) {
  if (typeof date === 'string') {
    const normalized = date.trim()
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)

    if (match) {
      const year = Number(match[1])
      const month = Number(match[2])
      const day = Number(match[3])
      const parsed = new Date(year, month - 1, day)

      if (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
      ) {
        return parsed
      }
    }

    const parsed = new Date(normalized)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (
    date &&
    typeof date === 'object' &&
    'toDate' in date &&
    typeof (date as { toDate?: unknown }).toDate === 'function'
  ) {
    const parsed = (date as { toDate: () => Date }).toDate()
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null
  }

  return null
}

function formatDate(date: unknown) {
  const parsedDate = parseDate(date)

  if (!parsedDate) {
    return {
      day: '--',
      month: 'Data',
      weekday: 'Data não disponível',
      full: 'Data não disponível',
    }
  }

  return {
    day: parsedDate.toLocaleDateString('pt-BR', { day: '2-digit' }),
    month: parsedDate.toLocaleDateString('pt-BR', { month: 'long' }),
    weekday: parsedDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
    full: parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  }
}

function statusOf(item: ManagementAppointment): FilterStatus {
  if (item.appointment.status === 'cancelado') return 'Cancelados'
  if (item.attendanceCompleted && !item.presence) return 'Ausentes'
  if (item.attendanceCompleted) return 'Concluídos'
  return 'Próximos'
}

function statusLabel(item: ManagementAppointment) {
  const status = statusOf(item)
  if (status === 'Concluídos') return 'Concluído'
  if (status === 'Ausentes') return 'Ausente'
  if (status === 'Cancelados') return 'Cancelado'
  return 'Confirmado'
}

function statusClass(status: string) {
  return status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function GerenciamentoResponsavel() {
  const [appointments, setAppointments] = useState<ManagementAppointment[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Concluídos')
  const [selected, setSelected] = useState<ManagementAppointment | null>(null)
  const [summaryDraft, setSummaryDraft] = useState('')
  const [modalMode, setModalMode] = useState<'details' | 'summary-editor'>('details')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function loadData() {
    setLoading(true)
    setFeedback('')

    try {
      const rawAppointments = await getAppointmentsByResponsible(RESPONSAVEL_ID)
      const studentIds = rawAppointments.map((item) => item.id_aluno)
      const students = await getStudentsByIds(studentIds)

      const names: Record<number, string> = {}
      students.forEach((student) => {
        names[student.id_aluno] =
          student.nome_preferido?.trim() || student.nome_completo
      })

      const rows: ManagementAppointment[] = []

      for (const appointment of rawAppointments) {
        const attendance = await getAttendanceByAppointment(
          appointment.id_agendamento,
        )

        rows.push({
          appointment,
          student: names[appointment.id_aluno] || 'Aluno',
          summary: attendance?.resumo_geral || '',
          attendanceId: attendance?.id_atendimento,
          attendanceCompleted: attendance?.concluido === true,
          presence: attendance?.presenca === true,
        })
      }

      setAppointments(rows)
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o gerenciamento.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => statusOf(appointment) === activeFilter,
      ),
    [appointments, activeFilter],
  )

  function openAppointment(item: ManagementAppointment) {
    setSelected(item)
    setSummaryDraft(item.summary)
    setModalMode('details')
    setFeedback('')
  }

  function openSummaryEditor(item: ManagementAppointment) {
    if (!item.attendanceCompleted || !item.presence) return
    setSelected(item)
    setSummaryDraft(item.summary)
    setModalMode('summary-editor')
    setFeedback('')
  }

  async function saveSummary() {
    if (!selected) return

    const summary = summaryDraft.trim()

    if (!summary) {
      setFeedback('Informe o resumo geral do atendimento.')
      return
    }

    setSaving(true)
    setFeedback('')

    try {
      let attendanceId = selected.attendanceId

      if (!attendanceId) {
        attendanceId = await createAttendance(
          selected.appointment.id_agendamento,
          selected.appointment.data,
        )
      }

      await updateAttendance(attendanceId, { resumo_geral: summary })

      const updated = {
        ...selected,
        summary,
        attendanceId,
        attendanceCompleted: selected.attendanceCompleted,
        presence: selected.presence,
      }

      setAppointments((current) =>
        current.map((item) =>
          item.appointment.id_agendamento ===
          selected.appointment.id_agendamento
            ? updated
            : item,
        ),
      )
      setSelected(updated)
      setModalMode('details')
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o atendimento.',
      )
    } finally {
      setSaving(false)
    }
  }


  return (
    <main className="page-shell staff-management-shell">
      <header className="staff-management-heading">
        <div>
          <p className="eyebrow">Área da responsável</p>
          <h1>Gerenciamento de atendimentos</h1>
          <p className="page-lead">
            Consulte o histórico, acompanhe os agendamentos e registre os resumos dos acolhimentos.
          </p>
        </div>
        <div className="management-count" aria-live="polite">
          <strong>{appointments.length}</strong>
          <span>registros</span>
        </div>
      </header>

      {feedback && <p className="form-feedback" role="alert">{feedback}</p>}

      <section className="management-content" aria-label="Lista de atendimentos">
        <div className="management-filters" role="group" aria-label="Filtrar atendimentos">
          {filters.map((filter) => (
            <button
              className={`management-filter ${activeFilter === filter ? 'is-active' : ''}`}
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="management-list-heading">
          <div>
            <p className="eyebrow">Histórico de atendimentos</p>
            <h2>{activeFilter}</h2>
          </div>
          <span>
            {filteredAppointments.length}{' '}
            {filteredAppointments.length === 1 ? 'atendimento' : 'atendimentos'}
          </span>
        </div>

        {loading ? (
          <div className="management-empty">
            <h3>Carregando atendimentos...</h3>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="management-list">
            {filteredAppointments.map((item) => {
              const date = formatDate(item.appointment.data)
              const label = statusLabel(item)

              return (
                <article
                  className="management-card"
                  key={item.appointment.id_agendamento}
                >
                  <div className="management-card__date">
                    <span>{date.month}</span>
                    <strong>{date.day}</strong>
                    <span>{date.weekday}</span>
                  </div>

                  <div className="management-card__body">
                    <span className={`management-status management-status--${statusClass(label)}`}>
                      {label}
                    </span>

                    <h3>Escuta e Acolhimento</h3>
                    <p className="management-card__student">{item.student}</p>

                    <div className="management-card__meta">
                      <span className="management-meta-item">
                        <Icon name="clock" /> {item.appointment.horario}
                      </span>
                      <span className="management-meta-item">
                        <Icon name="pin" /> Sala de acolhimento
                      </span>
                    </div>

                    <div className="management-card__actions">
                      <button
                        type="button"
                        className="management-action"
                        onClick={() => openAppointment(item)}
                      >
                        Detalhes
                      </button>

                      {item.attendanceCompleted && item.presence && (
                        <button
                          type="button"
                          className="management-action management-action--soft"
                          onClick={() => openSummaryEditor(item)}
                        >
                          <Icon name="edit" /> {item.summary ? 'Resumo' : 'Adicionar resumo'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="management-empty">
            <span className="management-empty__icon">⌕</span>
            <h3>Nenhum atendimento nesta categoria</h3>
            <p>Quando houver registros com esse status, eles aparecerão aqui.</p>
          </div>
        )}
      </section>

      {selected && (
        <div
          className="management-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setSelected(null)
          }}
        >
          <section
            className="management-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="management-modal-title"
          >
            <header className="management-modal__header">
              <div className="management-modal__title-wrap">
                <span className="management-modal__symbol" aria-hidden="true"><Icon name="ear" /></span>
                <div>
                  <p className="eyebrow">Escuta e Acolhimento</p>
                  <h2 id="management-modal-title">{selected.student}</h2>
                </div>
              </div>
              <button
                type="button"
                className="management-modal__close"
                aria-label="Fechar janela"
                onClick={() => setSelected(null)}
                disabled={saving}
              >
                <Icon name="x" />
              </button>
            </header>

            {modalMode === 'summary-editor' ? (
              <div className="management-summary-editor">
                <h3>Registro de Acolhimento</h3>
                <label htmlFor="appointment-summary">Registro do atendimento</label>
                <textarea
                  id="appointment-summary"
                  value={summaryDraft}
                  onChange={(event) => setSummaryDraft(event.target.value)}
                  placeholder="Escreva aqui o resumo do acolhimento..."
                  rows={8}
                  disabled={saving}
                />
                <p className="management-privacy-note">
                  Este registro pertence ao atendimento e fica disponível somente para a responsável.
                </p>
                {feedback && <p className="form-feedback" role="alert">{feedback}</p>}
                <div className="management-modal__footer">
                  <button
                    type="button"
                    className="management-secondary-button"
                    onClick={() => setSelected(null)}
                    disabled={saving}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    className="management-primary-button"
                    onClick={saveSummary}
                    disabled={saving || !summaryDraft.trim()}
                  >
                    {saving ? 'Salvando...' : 'Salvar resumo'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="management-detail-content">
                <div className="management-detail-field management-detail-field--student">
                  <span><Icon name="user" /> Nome completo</span>
                  <strong>{selected.student}</strong>
                </div>
                <div className="management-detail-field">
                  <span><Icon name="check-circle" /> Status</span>
                  <strong><span className={`management-status management-status--${statusClass(statusLabel(selected))}`}>{statusLabel(selected)}</span></strong>
                </div>
                <div className="management-detail-grid">
                  <div className="management-detail-field">
                    <span><Icon name="calendar" /> Data</span>
                    <strong>{formatDate(selected.appointment.data).full}</strong>
                  </div>
                  <div className="management-detail-field">
                    <span><Icon name="clock" /> Horário</span>
                    <strong>{selected.appointment.horario} — 30 minutos</strong>
                  </div>
                  <div className="management-detail-field">
                    <span><Icon name="pin" /> Local</span>
                    <strong>Sala de acolhimento</strong>
                  </div>
                </div>
                <section className="management-detail-summary" aria-labelledby="management-summary-title">
                  <h3 id="management-summary-title">Registro de Acolhimento</h3>
                  {selected.summary
                    ? <p>{selected.summary}</p>
                    : <p className="management-summary-empty">Nenhum resumo registrado para este atendimento.</p>}
                </section>
                <div className="management-modal__footer">
                  <button type="button" className="management-primary-button" onClick={() => setSelected(null)}>Fechar</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
