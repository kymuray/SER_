import { useMemo, useState } from 'react'
import './GerenciamentoResponsavel.css'

type AppointmentStatus = 'Confirmado' | 'Concluído' | 'Ausente' | 'Cancelado'
type FilterStatus = 'Concluídos' | 'Ausentes' | 'Cancelados' | 'Próximos'
type Appointment = {
  id: number
  student: string
  date: string
  time: string
  place: string
  status: AppointmentStatus
  summary: string
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    student: 'Maria Eduarda',
    date: '2026-10-18',
    time: '09:00',
    place: 'Sala de acolhimento',
    status: 'Concluído',
    summary:
      'Realizou-se escuta qualificada com a estudante na sala de acolhimento, oferecendo suporte emocional e espaço seguro de diálogo. A aluna compartilhou suas demandas pessoais e escolares, sendo acolhida com empatia e orientada na busca por estratégias de enfrentamento. Encerrou o atendimento mais tranquila, mantendo-se o acompanhamento pela equipe.',
  },
  {
    id: 2,
    student: 'Ana Clara Souza',
    date: '2026-10-18',
    time: '10:00',
    place: 'Sala de acolhimento',
    status: 'Concluído',
    summary: '',
  },
  {
    id: 3,
    student: 'Lucas Henrique',
    date: '2026-11-12',
    time: '14:00',
    place: 'Sala de acolhimento',
    status: 'Ausente',
    summary: '',
  },
  {
    id: 4,
    student: 'Beatriz Oliveira',
    date: '2026-11-14',
    time: '09:30',
    place: 'Sala de acolhimento',
    status: 'Cancelado',
    summary: '',
  },
  {
    id: 5,
    student: 'Gabriel Santos',
    date: '2026-11-20',
    time: '11:00',
    place: 'Sala de acolhimento',
    status: 'Confirmado',
    summary: '',
  },
]

const filters: FilterStatus[] = ['Concluídos', 'Ausentes', 'Cancelados', 'Próximos']

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`)
  return {
    day: parsed.toLocaleDateString('pt-BR', { day: '2-digit' }),
    month: parsed.toLocaleDateString('pt-BR', { month: 'long' }),
    weekday: parsed.toLocaleDateString('pt-BR', { weekday: 'long' }),
    full: parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  }
}

function statusClass(status: AppointmentStatus) {
  return status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function DetailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5v5M12 7.5h.01" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L8 20l-5 1 1-5L16.5 3.5Z" />
    </svg>
  )
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5" /></svg>
}
function StatusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></svg>
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
}
function LocationIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
}

export default function GerenciamentoResponsavel() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('Concluídos')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [modalTab, setModalTab] = useState<'details' | 'summary'>('details')
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState('')

  const filteredAppointments = useMemo(() => {
    const statusByFilter: Record<FilterStatus, AppointmentStatus> = {
      Concluídos: 'Concluído',
      Ausentes: 'Ausente',
      Cancelados: 'Cancelado',
      Próximos: 'Confirmado',
    }
    return appointments.filter((appointment) => appointment.status === statusByFilter[activeFilter])
  }, [appointments, activeFilter])

  function openAppointment(appointment: Appointment, tab: 'details' | 'summary', edit = false) {
    setSelectedAppointment(appointment)
    setModalTab(tab)
    setEditingSummary(edit)
    setSummaryDraft(appointment.summary)
  }

  function closeModal() {
    setSelectedAppointment(null)
    setEditingSummary(false)
  }

  function saveSummary() {
    if (!selectedAppointment) return
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? { ...appointment, summary: summaryDraft }
          : appointment,
      ),
    )
    setSelectedAppointment({ ...selectedAppointment, summary: summaryDraft })
    setEditingSummary(false)
    setModalTab('summary')
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
          <span>{filteredAppointments.length} {filteredAppointments.length === 1 ? 'atendimento' : 'atendimentos'}</span>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="management-list">
            {filteredAppointments.map((appointment) => {
              const date = formatDate(appointment.date)
              return (
                <article className="management-card" key={appointment.id}>
                  <div className="management-card__date">
                    <span>{date.month}</span>
                    <strong>{date.day}</strong>
                    <span>{date.weekday}</span>
                  </div>
                  <div className="management-card__body">
                    <span className={`management-status management-status--${statusClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <h3>Escuta e Acolhimento</h3>
                    <p className="management-card__student">{appointment.student}</p>
                    <div className="management-card__meta">
                      <span className="management-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                        {appointment.time}
                      </span>
                      <span className="management-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /></svg>
                        {appointment.place}
                      </span>
                    </div>
                    <div className="management-card__actions">
                      <button type="button" className="management-action" onClick={() => openAppointment(appointment, 'details')}>
                        <DetailIcon /> Detalhes
                      </button>
                      <button type="button" className="management-action management-action--soft" onClick={() => openAppointment(appointment, 'summary', true)}>
                        <EditIcon /> Resumo
                      </button>
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

      {selectedAppointment && (
        <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal()
        }}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="management-modal-title">
            <header className="management-modal__header">
              <div className="management-modal__title-wrap">
                <span className="management-modal__symbol" aria-hidden="true">◉</span>
                <div>
                  <h2 id="management-modal-title">Escuta e Acolhimento</h2>
                  <p>{selectedAppointment.student}</p>
                </div>
              </div>
              {!editingSummary && (
                <div className="management-modal__tabs" role="tablist" aria-label="Informações do atendimento">
                  <button type="button" role="tab" aria-selected={modalTab === 'details'} className={modalTab === 'details' ? 'is-active' : ''} onClick={() => setModalTab('details')}>Detalhes</button>
                  <button type="button" role="tab" aria-selected={modalTab === 'summary'} className={modalTab === 'summary' ? 'is-active' : ''} onClick={() => setModalTab('summary')}>Resumo</button>
                </div>
              )}
            </header>

            {editingSummary ? (
              <div className="management-summary-editor">
                <div className="management-editor-heading"><EditIcon /><h3>Resumo do acolhimento</h3></div>
                <label htmlFor="appointment-summary">Registro do atendimento</label>
                <textarea
                  id="appointment-summary"
                  value={summaryDraft}
                  onChange={(event) => setSummaryDraft(event.target.value)}
                  placeholder="Escreva aqui o resumo do acolhimento..."
                  rows={8}
                />
                <p className="management-privacy-note">Este registro é demonstrativo e ainda não é salvo no Firestore.</p>
                <div className="management-modal__footer">
                  <button type="button" className="management-secondary-button" onClick={() => setEditingSummary(false)}>Voltar</button>
                  <button type="button" className="management-primary-button" onClick={saveSummary}>Salvar resumo</button>
                </div>
              </div>
            ) : modalTab === 'details' ? (
              <div className="management-detail-content">
                <div className="management-detail-field management-detail-field--student">
                  <span><UserIcon /> Nome completo</span>
                  <strong>{selectedAppointment.student}</strong>
                </div>
                <div className="management-detail-field">
                  <span><StatusIcon /> Status</span>
                  <strong><span className={`management-status management-status--${statusClass(selectedAppointment.status)}`}>{selectedAppointment.status}</span></strong>
                </div>
                <div className="management-detail-grid">
                  <div className="management-detail-field"><span><CalendarIcon /> Data</span><strong>{formatDate(selectedAppointment.date).full}</strong></div>
                  <div className="management-detail-field"><span><ClockIcon /> Horário</span><strong>{selectedAppointment.time}</strong></div>
                  <div className="management-detail-field"><span><LocationIcon /> Local</span><strong>{selectedAppointment.place}</strong></div>
                </div>
                <div className="management-modal__footer">
                  <button type="button" className="management-primary-button" onClick={closeModal}>Fechar</button>
                </div>
              </div>
            ) : (
              <div className="management-summary-view">
                <h3>Registro de Acolhimento</h3>
                {selectedAppointment.summary ? (
                  <p>{selectedAppointment.summary}</p>
                ) : (
                  <p className="management-summary-empty">Ainda não há um resumo registrado para este atendimento.</p>
                )}
                <div className="management-modal__footer">
                  <button type="button" className="management-primary-button" onClick={closeModal}>Fechar</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
