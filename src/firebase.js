import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isConfigured = !!firebaseConfig.apiKey

let _auth, _db, _provider

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  _auth     = getAuth(app)
  _db       = getFirestore(app)
  _provider = new GoogleAuthProvider()
}

export const auth           = _auth
export const db             = _db
export const googleProvider = _provider
