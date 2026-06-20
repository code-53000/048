import { createSignal, onCleanup } from 'solid-js'
import type { TimerStatus } from '../types'
import { generateScramble, generateId } from '../utils/timer'
import { addRecord, getAllRecords, updateRecord, deleteRecord } from '../db'
import type { SolveRecord } from '../types'
import { averageOf5, bestTime } from '../utils/stats'

export function createTimerStore() {
  const [status, setStatus] = createSignal<TimerStatus>('idle')
  const [currentTime, setCurrentTime] = createSignal(0)
  const [scramble, setScramble] = createSignal(generateScramble())
  const [records, setRecords] = createSignal<SolveRecord[]>([])
  const [lastSolveTime, setLastSolveTime] = createSignal(0)
  const [activeFormulaGroupId, setActiveFormulaGroupId] = createSignal<string | undefined>()
  const [activeFormulaId, setActiveFormulaId] = createSignal<string | undefined>()

  let startTime = 0
  let animationFrame: number | null = null
  let holdTimer: number | null = null
  let isSpaceHeld = false

  const loadRecords = async () => {
    const allRecords = await getAllRecords()
    setRecords(allRecords.sort((a, b) => a.createdAt - b.createdAt))
  }

  loadRecords()

  const tick = () => {
    if (status() === 'running') {
      setCurrentTime(performance.now() - startTime)
      animationFrame = requestAnimationFrame(tick)
    }
  }

  const startHolding = () => {
    if (status() === 'running' || status() === 'ready') return
    if (isSpaceHeld) return

    isSpaceHeld = true
    setStatus('ready')

    holdTimer = window.setTimeout(() => {
      if (isSpaceHeld && status() === 'ready') {
        startTime = performance.now()
        setCurrentTime(0)
        setStatus('running')
        animationFrame = requestAnimationFrame(tick)
      }
    }, 300)
  }

  const stopHolding = () => {
    if (!isSpaceHeld) return
    isSpaceHeld = false

    if (holdTimer !== null) {
      clearTimeout(holdTimer)
      holdTimer = null
    }

    if (status() === 'running') {
      const finalTime = performance.now() - startTime
      setCurrentTime(finalTime)
      setLastSolveTime(finalTime)
      setStatus('stopped')

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }

      saveRecord(finalTime)
    } else if (status() === 'ready') {
      setStatus('idle')
    }
  }

  const saveRecord = async (time: number) => {
    const record: SolveRecord = {
      id: generateId(),
      time,
      scramble: scramble(),
      createdAt: Date.now(),
      formulaGroupId: activeFormulaGroupId(),
      formulaId: activeFormulaId(),
    }

    await addRecord(record)
    setRecords(prev => [...prev, record])
    setScramble(generateScramble())
  }

  const newScramble = () => {
    setScramble(generateScramble())
  }

  const setPenalty = async (recordId: string, penalty: '+2' | 'DNF' | undefined) => {
    const record = records().find(r => r.id === recordId)
    if (!record) return

    const updated = { ...record, penalty }
    setRecords(prev =>
      prev.map(r => (r.id === recordId ? updated : r))
    )

    await updateRecord(updated)
  }

  const deleteRecordById = async (recordId: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId))
    await deleteRecord(recordId)
  }

  const avg5 = () => averageOf5(records())
  const best = () => bestTime(records())
  const solveCount = () => records().length

  const reset = () => {
    setStatus('idle')
    setCurrentTime(0)
    setLastSolveTime(0)
  }

  onCleanup(() => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
    }
    if (holdTimer !== null) {
      clearTimeout(holdTimer)
    }
  })

  return {
    status,
    currentTime,
    scramble,
    records,
    lastSolveTime,
    activeFormulaGroupId,
    activeFormulaId,
    avg5,
    best,
    solveCount,
    startHolding,
    stopHolding,
    newScramble,
    setActiveFormulaGroupId,
    setActiveFormulaId,
    setPenalty,
    deleteRecordById,
    reset,
    loadRecords,
  }
}

export type TimerStore = ReturnType<typeof createTimerStore>
