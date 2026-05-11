import { parseISO, differenceInCalendarDays, format, addDays, isAfter, isBefore, isToday } from 'date-fns'
import { START_DATE, CHALLENGE_DAYS, TASKS, PENALTY_PER_TASK } from './constants'

export const startDate = parseISO(START_DATE)
export const endDate = addDays(startDate, CHALLENGE_DAYS - 1)

export function getDateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

export function getDayNumber(dateKey) {
  const d = parseISO(dateKey)
  return differenceInCalendarDays(d, startDate) + 1
}

export function todayKey() {
  return getDateKey(new Date())
}

export function isChallengDay(dateKey) {
  const d = parseISO(dateKey)
  return !isBefore(d, startDate) && !isAfter(d, endDate)
}

export function isPast(dateKey) {
  return isBefore(parseISO(dateKey), new Date()) && !isToday(parseISO(dateKey))
}

export function isFuture(dateKey) {
  return isAfter(parseISO(dateKey), new Date())
}

export function tasksCompleted(day) {
  if (!day?.tasks) return 0
  return TASKS.filter(t => day.tasks[t.id]).length
}

export function allTasksDone(day) {
  return tasksCompleted(day) === TASKS.length
}

export function dayStatus(day, dateKey) {
  if (!isChallengDay(dateKey)) return 'outside'
  if (isFuture(dateKey)) return 'future'
  const done = tasksCompleted(day)
  const hasWeight = day?.weight != null && day?.weight > 0
  if (allTasksDone(day) && hasWeight) return 'complete'
  if (done === 0 && !hasWeight) return isPast(dateKey) ? 'missed' : 'empty'
  return isPast(dateKey) ? 'partial-past' : 'partial'
}

export function getPenaltyForDay(day) {
  if (!day) return 0
  const missed = TASKS.length - tasksCompleted(day)
  return missed * PENALTY_PER_TASK
}

// Returns penalty minutes to carry into the given dateKey (from previous day)
export function getCarriedPenalty(days, dateKey) {
  const d = parseISO(dateKey)
  const prevKey = getDateKey(addDays(d, -1))
  if (!isChallengDay(prevKey)) return 0
  const prevDay = days[prevKey]
  return getPenaltyForDay(prevDay)
}

export function computeStreak(days) {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < CHALLENGE_DAYS; i++) {
    const key = getDateKey(addDays(startDate, i))
    const d = parseISO(key)
    if (isAfter(d, today)) break
    if (allTasksDone(days[key]) && days[key]?.weight) {
      streak++
    } else {
      streak = 0
    }
  }
  return streak
}

export function getWeightData(days, profile) {
  const points = []
  if (profile?.startWeight) {
    points.push({ date: START_DATE, weight: profile.startWeight, label: 'Start' })
  }
  for (let i = 0; i < CHALLENGE_DAYS; i++) {
    const key = getDateKey(addDays(startDate, i))
    if (days[key]?.weight) {
      points.push({ date: key, weight: days[key].weight, label: `Day ${i + 1}` })
    }
  }
  return points
}

export function currentWeight(days, profile) {
  for (let i = CHALLENGE_DAYS - 1; i >= 0; i--) {
    const key = getDateKey(addDays(startDate, i))
    if (days[key]?.weight) return days[key].weight
  }
  return profile?.startWeight ?? null
}

export function totalPenaltyMinutes(days) {
  let total = 0
  for (let i = 0; i < CHALLENGE_DAYS; i++) {
    const key = getDateKey(addDays(startDate, i))
    const d = parseISO(key)
    if (isPast(key)) total += getPenaltyForDay(days[key])
  }
  return total
}
