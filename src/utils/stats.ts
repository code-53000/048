import type { SolveRecord } from '../types'

export function getEffectiveTime(record: SolveRecord): number {
  if (record.penalty === 'DNF') return Infinity
  if (record.penalty === '+2') return record.time + 2000
  return record.time
}

export function isDNF(record: SolveRecord): boolean {
  return record.penalty === 'DNF'
}

export function averageOf(records: SolveRecord[], count: number): number | null {
  if (records.length < count) return null

  const latest = records.slice(-count)
  const times = latest.map(getEffectiveTime).sort((a, b) => a - b)

  const dnfCount = times.filter(t => t === Infinity).length
  if (dnfCount > 1) return Infinity

  const trimmed = times.slice(1, -1)
  const sum = trimmed.reduce((acc, t) => acc + t, 0)

  return sum / trimmed.length
}

export function averageOf5(records: SolveRecord[]): number | null {
  return averageOf(records, 5)
}

export function averageOf12(records: SolveRecord[]): number | null {
  return averageOf(records, 12)
}

export function bestTime(records: SolveRecord[]): number | null {
  if (records.length === 0) return null
  const times = records.map(getEffectiveTime).filter(t => isFinite(t))
  if (times.length === 0) return null
  return Math.min(...times)
}

export function worstTime(records: SolveRecord[]): number | null {
  if (records.length === 0) return null
  const times = records.map(getEffectiveTime).filter(t => isFinite(t))
  if (times.length === 0) return null
  return Math.max(...times)
}

export function meanTime(records: SolveRecord[]): number | null {
  const valid = records.filter(r => !isDNF(r))
  if (valid.length === 0) return null
  const sum = valid.reduce((acc, r) => acc + getEffectiveTime(r), 0)
  return sum / valid.length
}

export function groupByDay(records: SolveRecord[]): Map<string, SolveRecord[]> {
  const groups = new Map<string, SolveRecord[]>()
  for (const record of records) {
    const date = new Date(record.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(record)
  }
  return groups
}

export function dailyStats(records: SolveRecord[]): Array<{
  date: string
  timestamp: number
  count: number
  best: number | null
  avg5: number | null
  mean: number | null
}> {
  const groups = groupByDay(records)
  const result: Array<{
    date: string
    timestamp: number
    count: number
    best: number | null
    avg5: number | null
    mean: number | null
  }> = []

  for (const [date, dayRecords] of groups) {
    const sorted = [...dayRecords].sort((a, b) => a.createdAt - b.createdAt)
    result.push({
      date,
      timestamp: new Date(date).getTime(),
      count: sorted.length,
      best: bestTime(sorted),
      avg5: averageOf5(sorted),
      mean: meanTime(sorted),
    })
  }

  return result.sort((a, b) => a.timestamp - b.timestamp)
}
