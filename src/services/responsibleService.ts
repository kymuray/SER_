import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export const RESPONSAVEL_ID = 1

export async function ensureResponsible(email: string) {
  const ref = doc(db, 'responsaveis', String(RESPONSAVEL_ID))
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    await setDoc(ref, {
      id_responsavel: RESPONSAVEL_ID,
      email: email.trim().toLowerCase(),
      senha_hash: 'GERENCIADA_PELO_FIREBASE_AUTH',
    })
  }
}
