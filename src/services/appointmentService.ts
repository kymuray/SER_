import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export type AppointmentStatus =
  | 'agendado'
  | 'cancelado'
  | 'concluido'

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

export async function createAppointment(
  data: Omit<AppointmentData, 'id_agendamento' | 'data_criacao'>,
) {
  const date = normalizeDate(data.data)
  const time = normalizeTime(data.horario)

  // Impede dois agendamentos ativos no mesmo dia e horário.
  const sameSlotQuery = query(
    collection(db, 'agendamentos'),
    where('data', '==', date),
    where('horario', '==', time),
    where('status', '==', 'agendado'),
  )

  const sameSlotSnapshot = await getDocs(sameSlotQuery)

  if (!sameSlotSnapshot.empty) {
    throw new Error('Este horário já está agendado.')
  }

  // Um aluno só pode possuir um agendamento futuro ativo.
  const studentQuery = query(
    collection(db, 'agendamentos'),
    where('id_aluno', '==', data.id_aluno),
    where('status', '==', 'agendado'),
  )

  const studentSnapshot = await getDocs(studentQuery)

  if (!studentSnapshot.empty) {
    throw new Error(
      'Este aluno já possui um agendamento futuro ativo.',
    )
  }

  const id_agendamento = Date.now()

  const appointmentRef = doc(
    db,
    'agendamentos',
    String(id_agendamento),
  )

  await setDoc(appointmentRef, {
    id_agendamento,
    data_criacao: serverTimestamp(),
    status: 'agendado',
    id_responsavel: data.id_responsavel,
    id_aluno: data.id_aluno,
    data: date,
    horario: time,
  })

  return id_agendamento
}

export async function getAppointment(
  idAgendamento: number,
) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const snapshot = await getDoc(appointmentRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data()
}

export async function getAppointmentsByStudent(
  idAluno: number,
) {
  const appointmentsQuery = query(
    collection(db, 'agendamentos'),
    where('id_aluno', '==', idAluno),
  )

  const snapshot = await getDocs(appointmentsQuery)

  return snapshot.docs.map((item) => item.data())
}

export async function getAppointmentsByResponsible(
  idResponsavel: number,
) {
  const appointmentsQuery = query(
    collection(db, 'agendamentos'),
    where('id_responsavel', '==', idResponsavel),
  )

  const snapshot = await getDocs(appointmentsQuery)

  return snapshot.docs.map((item) => item.data())
}

export async function cancelAppointment(
  idAgendamento: number,
) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const snapshot = await getDoc(appointmentRef)

  if (!snapshot.exists()) {
    throw new Error('Agendamento não encontrado.')
  }

  const appointment = snapshot.data()

  if (appointment.status !== 'agendado') {
    throw new Error('Este agendamento não pode ser cancelado.')
  }

  await updateDoc(appointmentRef, {
    status: 'cancelado',
  })
}

export async function rescheduleAppointment(
  idAgendamento: number,
  data: string,
  horario: string,
) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const snapshot = await getDoc(appointmentRef)

  if (!snapshot.exists()) {
    throw new Error('Agendamento não encontrado.')
  }

  const appointment = snapshot.data()

  if (appointment.status !== 'agendado') {
    throw new Error(
      'Somente agendamentos ativos podem ser reagendados.',
    )
  }

  const conflictQuery = query(
    collection(db, 'agendamentos'),
    where('data', '==', normalizeDate(data)),
    where('horario', '==', normalizeTime(horario)),
    where('status', '==', 'agendado'),
  )

  const conflictSnapshot = await getDocs(conflictQuery)

  const hasConflict = conflictSnapshot.docs.some(
    (item) => item.id !== String(idAgendamento),
  )

  if (hasConflict) {
    throw new Error('Este horário já está agendado.')
  }

  await updateDoc(appointmentRef, {
    data: normalizeDate(data),
    horario: normalizeTime(horario),
  })
}

export async function completeAppointment(
  idAgendamento: number,
) {
  const appointmentRef = doc(
    db,
    'agendamentos',
    String(idAgendamento),
  )

  const snapshot = await getDoc(appointmentRef)

  if (!snapshot.exists()) {
    throw new Error('Agendamento não encontrado.')
  }

  if (snapshot.data().status !== 'agendado') {
    throw new Error(
      'Somente agendamentos ativos podem ser concluídos.',
    )
  }

  await updateDoc(appointmentRef, {
    status: 'concluido',
  })
}