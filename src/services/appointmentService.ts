import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

export type AppointmentStatus = 'agendado' | 'cancelado'

export type AppointmentData = {
  id_agendamento: number
  data_criacao: unknown
  status: AppointmentStatus
  id_responsavel: number
  id_aluno: number
  data: string
  horario: string
}

function normalizeDate(date: string) {
  return date.trim()
}

function normalizeTime(time: string) {
  return time.trim()
}

function isFutureDate(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const value = new Date(`${date}T00:00:00`)
  return value >= today
}

export async function createAppointment(
  data: Omit<AppointmentData, 'id_agendamento' | 'data_criacao'> & {
    id_horario: number
  },
) {
  const date = normalizeDate(data.data)
  const time = normalizeTime(data.horario)

  if (!date || !time) {
    throw new Error('Informe a data e o horário do agendamento.')
  }

  if (!isFutureDate(date)) {
    throw new Error('Escolha uma data futura.')
  }

  const slotRef = doc(
    db,
    'horarios_disponiveis',
    String(data.id_horario),
  )

  const activeAppointmentsQuery = query(
    collection(db, 'agendamentos'),
    where('id_aluno', '==', data.id_aluno),
    where('status', '==', 'agendado'),
  )

  const activeAppointments = await getDocs(activeAppointmentsQuery)

  const hasFutureAppointment = activeAppointments.docs.some((item) => {
    const appointment = item.data()
    return typeof appointment.data === 'string' && isFutureDate(appointment.data)
  })

  if (hasFutureAppointment) {
    throw new Error(
      'Você já possui um agendamento futuro ativo. Cancele ou reagende o atual.',
    )
  }

  const id_agendamento = Date.now()
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(id_agendamento),
  )

  await runTransaction(db, async (transaction) => {
    const slotSnapshot = await transaction.get(slotRef)

    if (!slotSnapshot.exists()) {
      throw new Error('Este horário não existe.')
    }

    const slot = slotSnapshot.data()

    if (
      slot.data !== date ||
      slot.horario !== time ||
      slot.disponivel !== true ||
      slot.id_agendamento !== null
    ) {
      throw new Error('Este horário não está mais disponível.')
    }

    transaction.set(appointmentRef, {
      id_agendamento,
      data_criacao: serverTimestamp(),
      status: 'agendado',
      id_responsavel: data.id_responsavel,
      id_aluno: data.id_aluno,
      data,
      horario: time,
    })

    transaction.update(slotRef, {
      disponivel: false,
      id_agendamento,
    })
  })

  return id_agendamento
}

export async function getAppointment(idAgendamento: number) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const snapshot = await getDoc(appointmentRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as AppointmentData
}

export async function getAppointmentsByStudent(idAluno: number) {
  const appointmentsQuery = query(
    collection(db, 'agendamentos'),
    where('id_aluno', '==', idAluno),
  )

  const snapshot = await getDocs(appointmentsQuery)

  return snapshot.docs
    .map((item) => item.data() as AppointmentData)
    .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`))
}

export async function getAppointmentsByResponsible(idResponsavel: number) {
  const appointmentsQuery = query(
    collection(db, 'agendamentos'),
    where('id_responsavel', '==', idResponsavel),
  )

  const snapshot = await getDocs(appointmentsQuery)

  return snapshot.docs
    .map((item) => item.data() as AppointmentData)
    .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`))
}

export async function cancelAppointment(idAgendamento: number) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const appointmentSnapshot = await getDoc(appointmentRef)

  if (!appointmentSnapshot.exists()) {
    throw new Error('Agendamento não encontrado.')
  }

  const appointment = appointmentSnapshot.data()

  if (appointment.status !== 'agendado') {
    throw new Error('Este agendamento não pode ser cancelado.')
  }

  const slotQuery = query(
    collection(db, 'horarios_disponiveis'),
    where('id_agendamento', '==', idAgendamento),
  )

  const slotSnapshot = await getDocs(slotQuery)

  await runTransaction(db, async (transaction) => {
    const appointmentCurrent = await transaction.get(appointmentRef)

    if (!appointmentCurrent.exists()) {
      throw new Error('Agendamento não encontrado.')
    }

    if (appointmentCurrent.data().status !== 'agendado') {
      throw new Error('Este agendamento não pode ser cancelado.')
    }

    transaction.update(appointmentRef, {
      status: 'cancelado',
    })

    for (const slotDoc of slotSnapshot.docs) {
      const slotRef = doc(
        db,
        'horarios_disponiveis',
        slotDoc.id,
      )
      transaction.update(slotRef, {
        disponivel: true,
        id_agendamento: null,
      })
    }
  })
}

export async function rescheduleAppointment(
  idAgendamento: number,
  data: string,
  horario: string,
  idHorarioNovo: number,
) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const appointmentSnapshot = await getDoc(appointmentRef)

  if (!appointmentSnapshot.exists()) {
    throw new Error('Agendamento não encontrado.')
  }

  const currentAppointment = appointmentSnapshot.data()

  if (currentAppointment.status !== 'agendado') {
    throw new Error('Somente agendamentos ativos podem ser reagendados.')
  }

  const newDate = normalizeDate(data)
  const newTime = normalizeTime(horario)

  if (!isFutureDate(newDate)) {
    throw new Error('Escolha uma data futura.')
  }

  const currentSlotQuery = query(
    collection(db, 'horarios_disponiveis'),
    where('id_agendamento', '==', idAgendamento),
  )

  const currentSlotSnapshot = await getDocs(currentSlotQuery)

  const newSlotRef = doc(
    db,
    'horarios_disponiveis',
    String(idHorarioNovo),
  )

  await runTransaction(db, async (transaction) => {
    const newSlotSnapshot = await transaction.get(newSlotRef)

    if (!newSlotSnapshot.exists()) {
      throw new Error('O novo horário não existe.')
    }

    const newSlot = newSlotSnapshot.data()

    if (
      newSlot.data !== newDate ||
      newSlot.horario !== newTime ||
      newSlot.disponivel !== true ||
      newSlot.id_agendamento !== null
    ) {
      throw new Error('O novo horário não está disponível.')
    }

    const appointmentCurrent = await transaction.get(appointmentRef)

    if (!appointmentCurrent.exists()) {
      throw new Error('Agendamento não encontrado.')
    }

    if (appointmentCurrent.data().status !== 'agendado') {
      throw new Error('Este agendamento não pode ser reagendado.')
    }

    for (const slotDoc of currentSlotSnapshot.docs) {
      if (slotDoc.id !== newSlotRef.id) {
        const oldSlotRef = doc(
          db,
          'horarios_disponiveis',
          slotDoc.id,
        )
        transaction.update(oldSlotRef, {
          disponivel: true,
          id_agendamento: null,
        })
      }
    }

    transaction.update(newSlotRef, {
      disponivel: false,
      id_agendamento: idAgendamento,
    })

    transaction.update(appointmentRef, {
      data: newDate,
      horario: newTime,
    })
  })
}

export async function getReservedTimeByAppointment(
  idAgendamento: number,
) {
  const slotQuery = query(
    collection(db, 'horarios_disponiveis'),
    where('id_agendamento', '==', idAgendamento),
  )

  const snapshot = await getDocs(slotQuery)

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].data()
}
