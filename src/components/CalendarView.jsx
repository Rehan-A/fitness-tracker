import { useState } from 'react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, parseISO, isSameMonth } from 'date-fns'
import { getDateKey, dayStatus, getDayNumber, isChallengDay, startDate } from '../utils'

const STATUS_STYLES = {
  complete:      'bg-emerald-600 text-white border-emerald-500',
  partial:       'bg-amber-600/70 text-white border-amber-500',
  'partial-past':'bg-red-700/60 text-white border-red-600',
  missed:        'bg-red-800/50 text-red-300 border-red-700',
  empty:         'bg-zinc-800/60 text-zinc-400 border-zinc-700',
  future:        'bg-zinc-900/60 text-zinc-600 border-zinc-800',
  outside:       'bg-transparent text-zinc-800 border-transparent',
}

const STATUS_LABELS = {
  complete:       '✅ All done',
  partial:        '⚡ In progress',
  'partial-past': '⚠️ Incomplete',
  missed:         '❌ Missed',
  empty:          '— Not started',
  future:         '○ Upcoming',
  outside:        '',
}

export default function CalendarView({ days, onOpenDay }) {
  const [viewDate, setViewDate] = useState(startDate)

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start so week begins on Monday
  const startDow = (getDay(monthStart) + 6) % 7
  const padBefore = Array(startDow).fill(null)

  const stats = {
    complete: 0, missed: 0, partial: 0,
  }
  calDays.forEach(d => {
    const key = getDateKey(d)
    const s = dayStatus(days[key], key)
    if (s === 'complete') stats.complete++
    else if (s === 'missed' || s === 'partial-past') stats.missed++
    else if (s === 'partial') stats.partial++
  })

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate(d => subMonths(d, 1))}
          className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          ‹
        </button>
        <h2 className="text-lg font-bold text-zinc-100">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setViewDate(d => addMonths(d, 1))}
          className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Complete', val: stats.complete, cls: 'text-emerald-400' },
          { label: 'Partial/Missed', val: stats.missed, cls: 'text-red-400' },
          { label: 'In Progress', val: stats.partial, cls: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-center">
            <p className={`text-xl font-black ${s.cls}`}>{s.val}</p>
            <p className="text-[10px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekday headers */}
      <div>
        <div className="grid grid-cols-7 mb-1">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-zinc-600 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {padBefore.map((_, i) => <div key={`pad-${i}`} />)}
          {calDays.map(day => {
            const key = getDateKey(day)
            const status = dayStatus(days[key], key)
            const dayN = isChallengDay(key) ? getDayNumber(key) : null
            const isToday = key === getDateKey(new Date())

            return (
              <button
                key={key}
                onClick={() => isChallengDay(key) && onOpenDay(key)}
                disabled={!isChallengDay(key)}
                className={`
                  aspect-square rounded-xl border text-xs font-bold flex flex-col items-center justify-center
                  transition-all relative
                  ${STATUS_STYLES[status]}
                  ${isChallengDay(key) && status !== 'outside' ? 'hover:scale-105 active:scale-95' : ''}
                  ${isToday ? 'ring-2 ring-brand-400 ring-offset-1 ring-offset-zinc-950' : ''}
                `}
              >
                <span className="text-[11px] font-bold">{format(day, 'd')}</span>
                {dayN && <span className="text-[8px] opacity-70">D{dayN}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">Legend</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {Object.entries(STATUS_LABELS).filter(([k]) => k !== 'outside').map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border ${STATUS_STYLES[k]}`} />
              <span className="text-xs text-zinc-400">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-3">Tap any challenge day to view or edit</p>
      </div>
    </div>
  )
}
