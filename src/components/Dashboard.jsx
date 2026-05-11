import { useState } from 'react'
import { format, parseISO, differenceInCalendarDays, isAfter, isBefore } from 'date-fns'
import { TASKS, CHALLENGE_DAYS, PENALTY_PER_TASK } from '../constants'
import {
  todayKey, getDayNumber, getCarriedPenalty, tasksCompleted,
  currentWeight, computeStreak, startDate, endDate,
} from '../utils'

export default function Dashboard({ profile, days, onUpdateDay, onOpenDay }) {
  const today = todayKey()
  const dayNum = getDayNumber(today)
  const dayData = days[today] ?? { date: today }
  const tasks = dayData.tasks ?? {}
  const weight = dayData.weight ?? ''
  const [weightInput, setWeightInput] = useState(weight || '')
  const penalty = getCarriedPenalty(days, today)
  const streak = computeStreak(days)
  const cur = currentWeight(days, profile)
  const lostKg = profile?.startWeight && cur ? (profile.startWeight - cur).toFixed(1) : null
  const progressPct = lostKg && profile
    ? Math.min(100, Math.round((lostKg / (profile.startWeight - profile.targetWeight)) * 100))
    : 0
  const daysLeft = differenceInCalendarDays(endDate, new Date())
  const doneTasks = tasksCompleted(dayData)
  const challengeStarted = !isBefore(new Date(), startDate)
  const challengeEnded = isAfter(new Date(), endDate)

  const toggleTask = id => {
    onUpdateDay(today, {
      tasks: { ...tasks, [id]: !tasks[id] },
    })
  }

  const saveWeight = () => {
    const val = parseFloat(weightInput)
    if (!weightInput || isNaN(val)) return
    onUpdateDay(today, { weight: val })
  }

  // Not yet started
  if (!challengeStarted) {
    const daysToStart = differenceInCalendarDays(startDate, new Date())
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="text-7xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-zinc-100">Challenge starts in</h2>
        <p className="text-6xl font-bold text-brand-400 my-3">{daysToStart}</p>
        <p className="text-zinc-400 text-lg">days</p>
        <p className="text-zinc-500 mt-4 text-sm">May 11, 2026 — Get ready, {profile?.name}!</p>
        <div className="mt-8 bg-zinc-900 rounded-2xl p-5 w-full max-w-xs border border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Your goal</p>
          <p className="text-zinc-200">{profile?.startWeight} kg → {profile?.targetWeight} kg</p>
          <p className="text-brand-400 font-bold text-lg">−{(profile?.startWeight - profile?.targetWeight).toFixed(1)} kg in 75 days</p>
        </div>
      </div>
    )
  }

  // Challenge ended
  if (challengeEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-zinc-100">Challenge Complete!</h2>
        <p className="text-zinc-400 mt-2">You completed 75 Hard.</p>
        {lostKg > 0 && <p className="text-brand-400 font-bold text-2xl mt-3">−{lostKg} kg lost</p>}
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Day header */}
      <div className="bg-gradient-to-br from-brand-700 to-purple-900 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium">
              {format(new Date(), 'EEEE, d MMM yyyy')}
            </p>
            <h2 className="text-3xl font-black text-white mt-1">
              Day {dayNum} <span className="text-purple-300 text-xl font-semibold">of {CHALLENGE_DAYS}</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-purple-300 text-xs">Streak</p>
            <p className="text-white text-2xl font-black">🔥{streak}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-purple-300 mb-1">
            <span>{daysLeft} days left</span>
            <span>Day {dayNum}/{CHALLENGE_DAYS}</span>
          </div>
          <div className="h-2 bg-purple-900/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all"
              style={{ width: `${Math.round((dayNum / CHALLENGE_DAYS) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Penalty banner */}
      {penalty > 0 && (
        <div className="bg-amber-900/40 border border-amber-700/50 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-amber-300 font-bold text-sm">Penalty from yesterday</p>
            <p className="text-amber-400 text-xs">
              +{penalty} min stairmaster ({penalty / PENALTY_PER_TASK} task{penalty / PENALTY_PER_TASK !== 1 ? 's' : ''} missed)
            </p>
          </div>
        </div>
      )}

      {/* Weight */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <p className="text-zinc-300 font-semibold flex items-center gap-2">⚖️ Weight today</p>
          {cur && profile && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              lostKg > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {lostKg > 0 ? `−${lostKg} kg` : `+${Math.abs(lostKg)} kg`}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            min="30"
            max="300"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            placeholder={`Start: ${profile?.startWeight} kg`}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={saveWeight}
            className="px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-colors"
          >
            Log
          </button>
        </div>
        {profile && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Goal: {profile.targetWeight} kg</span>
              <span>{progressPct}% there</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Today's tasks */}
      <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-zinc-200">Today's Tasks</p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            doneTasks === TASKS.length
              ? 'bg-emerald-900/60 text-emerald-400'
              : doneTasks > 0
              ? 'bg-amber-900/50 text-amber-400'
              : 'bg-zinc-800 text-zinc-500'
          }`}>
            {doneTasks}/{TASKS.length}
          </span>
        </div>

        <div className="space-y-2">
          {TASKS.map(task => {
            const done = !!tasks[task.id]
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  done
                    ? 'bg-emerald-900/25 border-emerald-800/50'
                    : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                }`}>
                  {done && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${done ? 'text-emerald-300 line-through decoration-emerald-600' : 'text-zinc-200'}`}>
                    {task.icon} {task.label}
                  </p>
                  <p className="text-xs text-zinc-500">{task.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {doneTasks < TASKS.length && (
          <p className="text-xs text-zinc-600 text-center mt-3">
            {TASKS.length - doneTasks} task{TASKS.length - doneTasks !== 1 ? 's' : ''} left — miss any = +{(TASKS.length - doneTasks) * PENALTY_PER_TASK} min stairmaster tomorrow
          </p>
        )}
        {doneTasks === TASKS.length && dayData.weight && (
          <div className="mt-3 text-center">
            <span className="text-emerald-400 font-bold">🎉 Day {dayNum} Complete!</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Lost" value={lostKg > 0 ? `${lostKg}kg` : '0kg'} color="emerald" />
        <StatCard label="Days done" value={`${dayNum - 1}`} color="brand" />
        <StatCard label="Penalty" value={`${(penalty || 0) + 'min'}`} color="amber" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    emerald: 'text-emerald-400',
    brand: 'text-brand-400',
    amber: 'text-amber-400',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
      <p className={`text-lg font-black ${colors[color]}`}>{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}
