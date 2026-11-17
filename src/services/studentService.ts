import {
  doc,
  getDoc,
  setDoc,
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
