export interface SolveRecord {
  id: string
  time: number
  scramble: string
  penalty?: '+2' | 'DNF'
  createdAt: number
  formulaGroupId?: string
  formulaId?: string
}

export interface Formula {
  id: string
  name: string
  notation: string
  description?: string
  createdAt: number
}

export interface FormulaGroup {
  id: string
  name: string
  description?: string
  formulaIds: string[]
  createdAt: number
}

export interface PracticeSession {
  id: string
  formulaGroupId?: string
  formulaId?: string
  startTime: number
  endTime: number
  solveCount: number
  bestTime?: number
  avg5?: number
}

export type TimerStatus = 'idle' | 'ready' | 'running' | 'stopped'
