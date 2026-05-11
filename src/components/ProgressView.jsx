import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { addDays, format, parseISO, isBefore } from 'date-fns'
import { CHALLENGE_DAYS, TASKS } from '../constants'
import { startDate, getDateKey, getDayNumber, tasksCompleted, totalPenaltyMinutes, getWeightData, currentWeight } from '../utils'

export default function ProgressView({ profile, days }) {
  const weightData = getWeightData(days, profile)
  const cur = currentWeight(days, profile)
  const lostKg = profile?.startWeight && cur ? (profile.startWeight - cur) : 0
  const penaltyTotal = totalPenaltyMinutes(days)

  // Task completion rate data
  const completionData = []
  const today = new Date()
  for (let i = 0; i < CHALLENGE_DAYS; i++) {
    const d = addDays(startDate, i)
    if (isBefore(d, today)) {
      const key = getDateKey(d)
      const day = days[key]
      const done = tasksCompleted(day)
      completionData.push({
        label: `D${i + 1}`,
        tasks: done,
        pct: Math.round((done / TASKS.length) * 100),
      })
    }
  }

  const completedDays = completionData.filter(d => d.tasks === TASKS.length).length
  const totalDaysSoFar = completionData.length

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-zinc-300 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'Weight' ? ' kg' : ''}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Weight Lost</p>
          <p className={`text-3xl font-black mt-1 ${lostKg > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {lostKg > 0 ? `−${lostKg.toFixed(1)}` : '0.0'}<span className="text-sm font-medium ml-1">kg</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">Goal: −{profile ? (profile.startWeight - profile.targetWeight).toFixed(1) : '10'}kg</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Days Perfect</p>
          <p className="text-3xl font-black mt-1 text-brand-400">
            {completedDays}<span className="text-sm font-medium text-zinc-500 ml-1">/{totalDaysSoFar}</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {totalDaysSoFar > 0 ? Math.round((completedDays / totalDaysSoFar) * 100) : 0}% completion rate
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Penalty Total</p>
          <p className="text-3xl font-black mt-1 text-amber-400">
            {penaltyTotal}<span className="text-sm font-medium ml-1">min</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">Extra stairmaster earned</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Current Weight</p>
          <p className="text-3xl font-black mt-1 text-zinc-200">
            {cur?.toFixed(1) ?? '—'}<span className="text-sm font-medium ml-1">kg</span>
          </p>
          <p className="text-xs text-zinc-600 mt-1">Target: {profile?.targetWeight} kg</p>
        </div>
      </div>

      {/* Weight chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-sm font-semibold text-zinc-200 mb-4">⚖️ Weight Progress</p>
        {weightData.length < 2 ? (
          <div className="h-36 flex items-center justify-center text-zinc-600 text-sm">
            Log weight on at least 2 days to see chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 10 }} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickFormatter={v => `${v}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              {profile?.targetWeight && (
                <ReferenceLine
                  y={profile.targetWeight}
                  stroke="#22c55e"
                  strokeDasharray="4 4"
                  label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={{ fill: '#a855f7', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Task completion chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-sm font-semibold text-zinc-200 mb-4">✅ Tasks per Day</p>
        {completionData.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-zinc-600 text-sm">
            Challenge starts May 11, 2026
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={completionData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis domain={[0, TASKS.length]} ticks={[0, 2, 4, 6]} tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={TASKS.length} stroke="#22c55e" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="tasks"
                name="Tasks"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Penalty breakdown */}
      {penaltyTotal > 0 && (
        <div className="bg-amber-900/20 border border-amber-800/40 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-300 mb-1">⚡ Penalty Summary</p>
          <p className="text-amber-400 text-2xl font-black">{penaltyTotal} min</p>
          <p className="text-amber-600 text-xs mt-1">of extra stairmaster to complete</p>
          <p className="text-amber-700 text-xs mt-2">
            ≈ {Math.round(penaltyTotal / 30)} sessions × 30 min
          </p>
        </div>
      )}
    </div>
  )
}
