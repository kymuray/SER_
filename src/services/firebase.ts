
import { initializeApp } from 'firebase/app'
import { getAuth, inMemoryPersistence, setPersistence, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

/**
 * O SER exige nova autenticação sempre que a aplicação é aberta/recarregada.
 * A persistência em memória impede que uma sessão antiga do Firebase seja
 * restaurada automaticamente pelo navegador.
 */
export const authReady = setPersistence(auth, inMemoryPersistence)
  .catch(async (error) => {
    console.error('Não foi possível configurar a sessão em memória:', error)
    // Mesmo se a persistência falhar, não reutiliza uma sessão antiga.
    if (auth.currentUser) await signOut(auth)
  })
  .then(async () => {
    // Aguarda a restauração inicial do Firebase antes de limpar uma sessão antiga.
    await auth.authStateReady()
    if (auth.currentUser) await signOut(auth)
  })
  .catch((error) => {
    console.error('Não foi possível limpar a sessão anterior:', error)
  })

export const db = getFirestore(app)
