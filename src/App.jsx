import { useState, useEffect } from 'react'
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
  const [store, setStore] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [tab, setTab] = useState('dashboard')
  const [modalDay, setModalDay] = useState(null)

  useEffect(() => {
    if (store) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    }
  }, [store])

  const updateDay = (dateKey, patch) => {
    setStore(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dateKey]: { ...(prev.days?.[dateKey] ?? { date: dateKey }), ...patch },
      },
    }))
  }

  if (!store) {
    return <SetupScreen onSetup={profile => setStore({ profile, days: {} })} />
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
        <button
          onClick={() => {
            if (confirm('Reset all data? This cannot be undone.')) {
              localStorage.removeItem(STORAGE_KEY)
              setStore(null)
            }
          }}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          ⚙ Reset
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'dashboard' && (
          <Dashboard
            profile={profile}
            days={days}
            onUpdateDay={updateDay}
            onOpenDay={setModalDay}
          />
        )}
        {tab === 'calendar' && (
          <CalendarView
            days={days}
            onOpenDay={setModalDay}
          />
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
