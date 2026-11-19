import { useState } from 'react'

const initialAppointments = [
  { time: '09:00', student: 'Aluno A', status: 'Concluído' },
  { time: '10:00', student: 'Aluno B', status: 'Confirmado' },
  { time: '14:00', student: 'Aluno C', status: 'Confirmado' },
]

const weeklyAvailability = [
  { day: 'SEG', date: '15', hours: '2 horários' },
  { day: 'TER', date: '16', hours: '1 horário' },
  { day: 'QUA', date: '17', hours: '2 horários' },
  { day: 'QUI', date: '18', hours: '3 horários' },
  { day: 'SEX', date: '19', hours: '4 horários' },
]

export default function AgendaResponsavel() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [showAddTime, setShowAddTime] = useState(false)
  const [newTime, setNewTime] = useState('15:00')
  const [selectedDay, setSelectedDay] = useState('QUI')

  function updateStatus(index: number, status: string) {
    setAppointments((current) =>
      current.map((appointment, itemIndex) =>
        itemIndex === index ? { ...appointment, status } : appointment,
      ),
    )
  }

  function addTime() {
    setAppointments((current) =>
      [...current, { time: newTime, student: 'Horário livre', status: 'Disponível' }]
        .sort((first, second) => first.time.localeCompare(second.time)),
    )
    setShowAddTime(false)
  }

  return (
    <main className="page-shell staff-agenda-shell">
      <div className="page-heading staff-agenda-heading">
        <p className="eyebrow">Área da responsável</p>
        <h1>Agenda</h1>
        <p className="page-lead">
          Acompanhe os atendimentos do dia e organize os horários disponíveis.
        </p>
      </div>

      <div className="staff-dashboard staff-dashboard--agenda">
        <section className="surface-card day-agenda">
          <div className="card-heading">
            <div>
              <p className="eyebrow">{weeklyAvailability.find((item) => item.day === selectedDay)?.day} {weeklyAvailability.find((item) => item.day === selectedDay)?.date} de outubro</p>
              <h2>Agenda do dia</h2>
            </div>
            <button
              className="button button--dark"
              type="button"
              onClick={() => setShowAddTime((visible) => !visible)}
            >
              {showAddTime ? 'Fechar' : 'Adicionar horário'}
            </button>
          </div>

          {showAddTime && (
            <div className="add-time">
              <label htmlFor="add-time">Horário</label>
              <input
                id="add-time"
                type="time"
                value={newTime}
                onChange={(event) => setNewTime(event.target.value)}
              />
              <button
                className="button button--primary"
                type="button"
                onClick={addTime}
              >
                Adicionar
              </button>
            </div>
          )}

          <div className="agenda-list">
            {appointments.map((appointment, index) => (
              <article
                className="agenda-row"
                key={`${appointment.time}-${index}`}
              >
                <strong>{appointment.time}</strong>
                <span className="agenda-student">{appointment.student}</span>
                <span
                  className={`agenda-status ${
                    appointment.status === 'Concluído'
                      ? 'done'
                      : appointment.status === 'Cancelado'
                        ? 'cancelled'
                        : appointment.status === 'Ausente'
                          ? 'absent'
                          : ''
                  }`}
                >
                  {appointment.status}
                </span>
                {appointment.student !== 'Horário livre' ? (
                  <select
                    aria-label={`Atualizar status de ${appointment.student}`}
                    value={appointment.status}
                    onChange={(event) => updateStatus(index, event.target.value)}
                  >
                    <option>Confirmado</option>
                    <option>Concluído</option>
                    <option>Ausente</option>
                    <option>Cancelado</option>
                  </select>
                ) : (
                  <span className="agenda-free-label">Horário livre</span>
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="surface-card weekly-card">
          <p className="eyebrow">Visão semanal</p>
          <h2>Disponibilidade</h2>

          {weeklyAvailability.map((item) => (
            <button
              className={`week-row ${selectedDay === item.day ? 'current' : ''}`}
              key={item.day}
              type="button"
              aria-pressed={selectedDay === item.day}
              onClick={() => setSelectedDay(item.day)}
            >
              <strong>{item.day} {item.date}</strong>
              <span>{item.hours}</span>
            </button>
          ))}

          <p className="occupancy-label">
            Ocupação da semana <strong>72%</strong>
          </p>
          <div className="progress">
            <span />
          </div>
        </aside>
      </div>

      <p className="demo-note">
        Painel demonstrativo: status e horários são alterados apenas na
        interface, sem persistência ou autenticação.
      </p>
    </main>
  )
}
