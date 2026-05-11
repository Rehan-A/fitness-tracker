import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { TASKS } from '../constants'
import { getDayNumber, isChallengDay, isFuture, getPenaltyForDay } from '../utils'

export default function DayModal({ dateKey, dayData, onClose, onSave }) {
  const [tasks, setTasks] = useState(dayData.tasks ?? {})
  const [weight, setWeight] = useState(dayData.weight ?? '')
  const [notes, setNotes] = useState(dayData.notes ?? '')

  const dayNum = getDayNumber(dateKey)
  const date = parseISO(dateKey)
  const future = isFuture(dateKey)
  const penalty = getPenaltyForDay({ tasks, weight })

  const toggleTask = id => setTasks(prev => ({ ...prev, [id]: !prev[id] }))

  const doneTasks = TASKS.filter(t => tasks[t.id]).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-zinc-400 text-sm">{format(date, 'EEEE, d MMMM yyyy')}</p>
            <h3 className="text-xl font-black text-zinc-100">Day {dayNum} of 75</h3>
          </div>
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
            doneTasks === TASKS.length
              ? 'bg-emerald-900/50 text-emerald-400'
              : doneTasks > 0
              ? 'bg-amber-900/50 text-amber-400'
              : 'bg-zinc-800 text-zinc-500'
          }`}>
            {doneTasks}/{TASKS.length}
          </div>
        </div>

        {/* Weight */}
        <div className="mb-5">
          <label className="block text-sm text-zinc-400 mb-1.5">⚖️ Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            min="30"
            max="300"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 83.5"
            disabled={future}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 disabled:opacity-40"
          />
        </div>

        {/* Tasks */}
        <div className="mb-5">
          <p className="text-sm text-zinc-400 mb-2">Daily Tasks</p>
          <div className="space-y-2">
            {TASKS.map(task => {
              const done = !!tasks[task.id]
              return (
                <button
                  key={task.id}
                  onClick={() => !future && toggleTask(task.id)}
                  disabled={future}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    done
                      ? 'bg-emerald-900/25 border-emerald-800/50'
                      : 'bg-zinc-800/70 border-zinc-700/50 hover:bg-zinc-800'
                  } disabled:opacity-40`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                  }`}>
                    {done && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${done ? 'text-emerald-300 line-through' : 'text-zinc-200'}`}>
                      {task.icon} {task.label}
                    </p>
                    <p className="text-xs text-zinc-500">{task.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Penalty preview */}
        {!future && penalty > 0 && (
          <div className="mb-4 bg-amber-900/30 border border-amber-800/50 rounded-xl p-3">
            <p className="text-amber-400 text-sm font-medium">⚡ {penalty} min stairmaster penalty</p>
            <p className="text-amber-600 text-xs">{TASKS.length - doneTasks} task{TASKS.length - doneTasks !== 1 ? 's' : ''} missed</p>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm text-zinc-400 mb-1.5">📝 Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={future}
            rows={2}
            placeholder="How did today go?"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500 resize-none disabled:opacity-40"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-zinc-400 font-semibold hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({
              tasks,
              weight: weight ? parseFloat(weight) : null,
              notes,
            })}
            disabled={future}
            className="flex-1 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-colors disabled:opacity-40"
          >
            Save Day
          </button>
        </div>
      </div>
    </div>
  )
}
