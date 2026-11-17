
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

type StudentData = {
  nome_completo: string
  cpf: string
  nome_preferido: string
}

export async function createStudent(
  uid: string,
  data: StudentData,
) {
  const studentRef = doc(db, 'alunos', uid)

  await setDoc(studentRef, {
    nome_completo: data.nome_completo.trim(),
    cpf: data.cpf.replace(/\D/g, ''),
    nome_preferido: data.nome_preferido.trim(),
    data_criacao: serverTimestamp(),
  })
}

export async function getStudent(uid: string) {
  const studentRef = doc(db, 'alunos', uid)
  const studentSnapshot = await getDoc(studentRef)

  if (!studentSnapshot.exists()) {
    return null
  }

  return studentSnapshot.data()
}

export async function updateStudentPreferredName(
  uid: string,
  nomePreferido: string,
) {
  const nome = nomePreferido.trim()

  if (!nome) {
    throw new Error('Informe um nome preferido.')
  }

  const studentRef = doc(db, 'alunos', uid)

  await updateDoc(studentRef, {
    nome_preferido: nome,
  })
}
