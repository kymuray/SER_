import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export const RESPONSAVEL_ID = 1

export type ResponsibleProfile = {
  id_responsavel?: number
  email?: string
  nome_preferido?: string
  senha_hash?: string
}

export async function ensureResponsible(email: string) {
  const ref = doc(db, 'responsaveis', String(RESPONSAVEL_ID))
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    await setDoc(ref, {
      id_responsavel: RESPONSAVEL_ID,
      email: email.trim(),
      senha_hash: 'GERENCIADA_PELO_FIREBASE_AUTH',
      nome_preferido: '',
    })
  }
}

export async function getResponsible() {
  const snapshot = await getDoc(doc(db, 'responsaveis', String(RESPONSAVEL_ID)))
  return snapshot.exists() ? snapshot.data() as ResponsibleProfile : null
}

export async function updateResponsiblePreferredName(name: string) {
  const value = name.trim()
  if (!value || value.length > 40) throw new Error('Informe um nome com até 40 caracteres.')
  await updateDoc(doc(db, 'responsaveis', String(RESPONSAVEL_ID)), { nome_preferido: value })
}
