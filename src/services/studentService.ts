import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
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
    id_aluno: Date.now(),
    nome_completo: data.nome_completo.trim(),
    cpf: data.cpf.replace(/\D/g, ''),
    senha_hash: 'GERENCIADA_PELO_FIREBASE_AUTH',
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

export async function getStudentsByIds(ids: number[]) {
  if (ids.length === 0) return []

  const uniqueIds = [...new Set(ids)]
  const students = [] as Array<{
    id_aluno: number
    nome_completo: string
    nome_preferido?: string
  }>

  for (let index = 0; index < uniqueIds.length; index += 30) {
    const batch = uniqueIds.slice(index, index + 30)
    const snapshot = await getDocs(
      query(
        collection(db, 'alunos'),
        where('id_aluno', 'in', batch),
      ),
    )

    snapshot.docs.forEach((student) => {
      const data = student.data()
      students.push({
        id_aluno: data.id_aluno,
        nome_completo: data.nome_completo,
        nome_preferido: data.nome_preferido,
      })
    })
  }

  return students
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
