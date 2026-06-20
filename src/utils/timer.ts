export function formatTime(ms: number, showMs = true): string {
  if (!isFinite(ms) || ms < 0) return '--:--.---'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const milliseconds = Math.floor(ms % 1000)

  const minStr = minutes > 0 ? `${minutes}:` : ''
  const secStr = minutes > 0 ? String(seconds).padStart(2, '0') : String(seconds)
  const msStr = showMs ? `.${String(milliseconds).padStart(3, '0')}` : ''

  return `${minStr}${secStr}${msStr}`
}

export function parseTime(str: string): number | null {
  const cleaned = str.trim()
  const parts = cleaned.split(':')
  let minutes = 0
  let secondsStr = cleaned

  if (parts.length === 2) {
    minutes = parseInt(parts[0], 10)
    secondsStr = parts[1]
  }

  const secParts = secondsStr.split('.')
  const seconds = parseInt(secParts[0], 10) || 0
  let milliseconds = 0

  if (secParts.length === 2) {
    const msStr = secParts[1].padEnd(3, '0').slice(0, 3)
    milliseconds = parseInt(msStr, 10) || 0
  }

  const total = minutes * 60000 + seconds * 1000 + milliseconds
  return isFinite(total) && total > 0 ? total : null
}

export function generateScramble(length = 20): string {
  const moves = ['R', 'L', 'U', 'D', 'F', 'B']
  const modifiers = ['', "'", '2']
  const result: string[] = []
  let lastAxis = ''

  const getAxis = (move: string): string => {
    if (move === 'R' || move === 'L') return 'x'
    if (move === 'U' || move === 'D') return 'y'
    return 'z'
  }

  for (let i = 0; i < length; i++) {
    let move: string
    do {
      move = moves[Math.floor(Math.random() * moves.length)]
    } while (getAxis(move) === lastAxis)

    lastAxis = getAxis(move)
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    result.push(`${move}${modifier}`)
  }

  return result.join(' ')
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
