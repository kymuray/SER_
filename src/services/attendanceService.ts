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

export type AttendanceData = {
  id_atendimento: number
  presenca: boolean
  concluido: boolean
  resumo_geral: string
  id_agendamento: number
  data: string
}

export async function createAttendance(
  idAgendamento: number,
  data: string,
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

  const existingQuery = query(
    collection(db, 'atendimentos'),
    where('id_agendamento', '==', idAgendamento),
  )

  const existingSnapshot = await getDocs(existingQuery)

  if (!existingSnapshot.empty) {
    throw new Error(
      'Este agendamento já possui um atendimento.',
    )
  }

  const id_atendimento = Date.now()

  const attendanceRef = doc(
    db,
    'atendimentos',
    String(id_atendimento),
  )

  await setDoc(attendanceRef, {
    id_atendimento,
    presenca: false,
    concluido: false,
    resumo_geral: '',
    id_agendamento: idAgendamento,
    data: data.trim(), 
  })

  return id_atendimento
}

export async function getAttendance(
  idAtendimento: number,
) {
  const attendanceRef = doc(
    db,
    'atendimentos',
    String(idAtendimento),
  )

  const snapshot = await getDoc(attendanceRef)

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data()
}

export async function getAttendanceByAppointment(
  idAgendamento: number,
) {
  const attendanceQuery = query(
    collection(db, 'atendimentos'),
    where('id_agendamento', '==', idAgendamento),
  )

  const snapshot = await getDocs(attendanceQuery)

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0].data()
}

export async function getAttendanceHistory() {
  const attendanceQuery = query(
    collection(db, 'atendimentos'),
  )

  const snapshot = await getDocs(attendanceQuery)

  return snapshot.docs.map(
    (item) => item.data() as AttendanceData,
  )
}

export async function updateAttendance(
  idAtendimento: number,
  data: {
    presenca?: boolean
    concluido?: boolean
    resumo_geral?: string
  },
) {
  const attendanceRef = doc(
    db,
    'atendimentos',
    String(idAtendimento),
  )

  const snapshot = await getDoc(attendanceRef)

  if (!snapshot.exists()) {
    throw new Error('Atendimento não encontrado.')
  }

  const updateData: Record<string, unknown> = {}

  if (data.presenca !== undefined) {
    updateData.presenca = data.presenca
  }

  if (data.concluido !== undefined) {
    updateData.concluido = data.concluido
  }

  if (data.resumo_geral !== undefined) {
    updateData.resumo_geral = data.resumo_geral.trim()
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('Nenhuma alteração foi informada.')
  }

  await updateDoc(attendanceRef, updateData)
}

export async function completeAttendance(
  idAtendimento: number,
  resumoGeral: string,
) {
  const resumo = resumoGeral.trim()

  if (!resumo) {
    throw new Error('Informe o resumo geral do atendimento.')
  }

  await updateAttendance(idAtendimento, {
    concluido: true,
    resumo_geral: resumo,
  })
}