import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

export type AvailableTime = {
  id_horario: number
  data: string
  horario: string
  disponivel: boolean
  id_agendamento: number | null
}

function validateHalfHourTime(horario: string) {
  const match = /^(\d{2}):(00|30)$/.exec(horario.trim())

  if (!match) {
    throw new Error('Os horários devem ser definidos em intervalos de 30 minutos.')
  }
}

export async function createAvailableTime(
  data: string,
  horario: string,
) {
  const date = data.trim()
  const time = horario.trim()

  if (!date || !time) {
    throw new Error('Informe a data e o horário.')
  }

  validateHalfHourTime(time)

  const existingQuery = query(
    collection(db, 'horarios_disponiveis'),
    where('data', '==', date),
    where('horario', '==', time),
  )

  const existingSnapshot = await getDocs(existingQuery)

  if (!existingSnapshot.empty) {
    throw new Error('Este horário já existe.')
  }

  const id_horario = Date.now()

  const horarioRef = doc(
    db,
    'horarios_disponiveis',
    String(id_horario),
  )

  await setDoc(horarioRef, {
    id_horario,
    data: date,
    horario: time,
    disponivel: true,
    id_agendamento: null,
  })

  return id_horario
}

export async function getAvailableTimes(data?: string) {
  const horariosRef = collection(db, 'horarios_disponiveis')

  const horariosQuery = data
    ? query(
        horariosRef,
        where('data', '==', data.trim()),
        where('disponivel', '==', true),
      )
    : query(
        horariosRef,
        where('disponivel', '==', true),
      )

  const snapshot = await getDocs(horariosQuery)

  return snapshot.docs
    .map((item) => item.data() as AvailableTime)
    .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`))
}

export async function getAvailableTime(idHorario: number) {
  const horarioRef = doc(
    db,
    'horarios_disponiveis',
    String(idHorario),
  )

  const snapshot = await getDoc(horarioRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as AvailableTime
}

export async function updateAvailableTime(
  idHorario: number,
  data: string,
  horario: string,
) {
  const horarioRef = doc(
    db,
    'horarios_disponiveis',
    String(idHorario),
  )

  const snapshot = await getDoc(horarioRef)

  if (!snapshot.exists()) {
    throw new Error('Horário não encontrado.')
  }

  if (!snapshot.data().disponivel) {
    throw new Error('Não é possível alterar um horário já utilizado.')
  }

  validateHalfHourTime(horario)

  await updateDoc(horarioRef, {
    data: data.trim(),
    horario: horario.trim(),
  })
}

export async function deleteAvailableTime(idHorario: number) {
  const horarioRef = doc(
    db,
    'horarios_disponiveis',
    String(idHorario),
  )

  const snapshot = await getDoc(horarioRef)

  if (!snapshot.exists()) {
    throw new Error('Horário não encontrado.')
  }

  if (!snapshot.data().disponivel) {
    throw new Error('Não é possível excluir um horário já utilizado.')
  }

  await updateDoc(horarioRef, {
    disponivel: false,
  })
}
