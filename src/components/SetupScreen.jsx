import { useState } from 'react'
import { START_DATE } from '../constants'

export default function SetupScreen({ onSetup }) {
  const [startWeight, setStartWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [name, setName] = useState('')

  const target = startWeight ? (parseFloat(startWeight) - 10).toFixed(1) : ''

  const handleSubmit = e => {
    e.preventDefault()
    const sw = parseFloat(startWeight)
    const tw = targetWeight ? parseFloat(targetWeight) : sw - 10
    if (!sw || sw < 30 || sw > 300) return alert('Enter a valid start weight.')
    onSetup({ name: name.trim() || 'Athlete', startWeight: sw, targetWeight: tw, startDate: START_DATE })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🔥</div>
          <h1 className="text-3xl font-bold text-zinc-100">75 Hard</h1>
          <p className="text-brand-400 font-semibold text-lg">10KG Challenge</p>
          <p className="text-zinc-500 text-sm mt-2">Starts {new Date(START_DATE + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rehan"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Starting weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={startWeight}
              onChange={e => { setStartWeight(e.target.value); setTargetWeight('') }}
              placeholder="e.g. 85.0"
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Target weight (kg)
              {target && <span className="text-zinc-600 ml-1">— auto: {target}</span>}
            </label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={targetWeight || target}
              onChange={e => setTargetWeight(e.target.value)}
              placeholder={target || 'e.g. 75.0'}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Daily goals (75 Hard rules)</p>
            {[
              '💪 Workout 1 — 45 min indoor',
              '🏃 Workout 2 — 45 min outdoor',
              '🥗 Follow diet, zero alcohol/cheats',
              '💧 Drink 4 litres of water',
              '📚 Read 10 pages non-fiction',
              '📸 Take a progress photo',
              '⚖️ Log your weight',
            ].map(t => (
              <p key={t} className="text-sm text-zinc-400 py-0.5">{t}</p>
            ))}
            <p className="text-xs text-amber-400 mt-3 font-medium">⚡ Miss any task = +10 min stairmaster penalty next day</p>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-brand-900/50"
          >
            Start the Challenge 🚀
          </button>
        </form>
      </div>
    </div>
  )
}
