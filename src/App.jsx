import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, isConfigured } from './firebase'
import AuthScreen from './components/AuthScreen'
import SetupScreen from './components/SetupScreen'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import ProgressView from './components/ProgressView'
import DayModal from './components/DayModal'
import { STORAGE_KEY } from './constants'

const TABS = [
  { id: 'dashboard', label: 'Today',    icon: '🏠' },
  { id: 'calendar',  label: 'Calendar', icon: '📅' },
  { id: 'progress',  label: 'Progress', icon: '📈' },
]

export default function App() {
  // When Firebase isn't configured yet, skip auth and use localStorage
  const [user, setUser]       = useState(isConfigured ? undefined : 'local')
  const [store, setStore]     = useState(() => {
    if (isConfigured) return null
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null } catch { return null }
  })
  const [syncing, setSyncing] = useState(false)
  const [tab, setTab]         = useState('dashboard')
  const [modalDay, setModalDay] = useState(null)

  // Listen to Firebase auth state (only when configured)
  useEffect(() => {
    if (!isConfigured) return
    // Handle redirect result (fires when returning from Google redirect sign-in)
    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user) })
      .catch(() => {})
    return onAuthStateChanged(auth, u => setUser(u ?? null))
  }, [])

  // Subscribe to Firestore when signed in
  useEffect(() => {
    if (!isConfigured || !user || user === 'local') return
    const ref = doc(db, 'users', user.uid)
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setStore(snap.data())
      } else {
        try {
          const local = localStorage.getItem(STORAGE_KEY)
          if (local) setStore(JSON.parse(local))
        } catch {}
      }
    })
    return unsub
  }, [user])

  const saveStore = useCallback(async newStore => {
    setStore(newStore)
    if (!isConfigured || !user || user === 'local') {
      // localStorage fallback
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore))
      return
    }
    setSyncing(true)
    try {
      await setDoc(doc(db, 'users', user.uid), newStore)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setSyncing(false)
    }
  }, [user])

  const updateDay = (dateKey, patch) => {
    const newStore = {
      ...store,
      days: {
        ...store.days,
        [dateKey]: { ...(store.days?.[dateKey] ?? { date: dateKey }), ...patch },
      },
    }
    saveStore(newStore)
  }

  // Auth loading
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  // Not signed in (Firebase configured but no user)
  if (!user) return <AuthScreen />

  // Signed in but profile not set up yet
  if (!store?.profile) {
    return <SetupScreen onSetup={profile => saveStore({ profile, days: {} })} />
  }

  const { profile, days } = store

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <h1 className="font-bold text-sm leading-none text-zinc-100">75 Hard</h1>
            <p className="text-xs text-zinc-500 leading-none mt-0.5">10KG Challenge</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {syncing && <span className="text-[10px] text-zinc-600 animate-pulse">syncing…</span>}
          {user !== 'local' && (
            <div className="flex items-center gap-2">
              {user?.photoURL && (
                <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="w-7 h-7 rounded-full" />
              )}
              <button
                onClick={() => auth.signOut()}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'dashboard' && (
          <Dashboard profile={profile} days={days} onUpdateDay={updateDay} onOpenDay={setModalDay} />
        )}
        {tab === 'calendar' && (
          <CalendarView days={days} onOpenDay={setModalDay} />
        )}
        {tab === 'progress' && (
          <ProgressView profile={profile} days={days} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-20">
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                tab === t.id ? 'text-brand-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Day modal */}
      {modalDay && (
        <DayModal
          dateKey={modalDay}
          dayData={days[modalDay] ?? { date: modalDay }}
          onClose={() => setModalDay(null)}
          onSave={patch => { updateDay(modalDay, patch); setModalDay(null) }}
        />
      )}
    </div>
  )
}
