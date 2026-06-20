import { onMount, onCleanup, For } from 'solid-js'
import type { TimerStore } from '../../stores/timerStore'
import { formatTime } from '../../utils/timer'
import { getEffectiveTime } from '../../utils/stats'

interface TimerPageProps {
  timerStore: TimerStore
}

export default function TimerPage(props: TimerPageProps) {
  let containerRef: HTMLDivElement | undefined

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault()
      props.timerStore.startHolding()
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      props.timerStore.stopHolding()
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    props.timerStore.startHolding()
  }

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    props.timerStore.stopHolding()
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const recentRecords = () => [...props.timerStore.records()].slice(-10).reverse()

  const setPlus2 = (recordId: string) => {
    const record = props.timerStore.records().find(r => r.id === recordId)
    if (record?.penalty === '+2') {
      props.timerStore.setPenalty(recordId, undefined)
    } else {
      props.timerStore.setPenalty(recordId, '+2')
    }
  }

  const setDNF = (recordId: string) => {
    const record = props.timerStore.records().find(r => r.id === recordId)
    if (record?.penalty === 'DNF') {
      props.timerStore.setPenalty(recordId, undefined)
    } else {
      props.timerStore.setPenalty(recordId, 'DNF')
    }
  }

  return (
    <div
      ref={containerRef}
      class="timer-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div class="timer-scramble">{props.timerStore.scramble()}</div>

      <div class={`timer-display ${props.timerStore.status()}`}>
        {formatTime(props.timerStore.currentTime())}
      </div>

      <div class="timer-hint">
        长按空格键开始计时，松开停止
        <br />
        <span style="opacity: 0.6; font-size: 12px;">（移动端可长按屏幕）</span>
      </div>

      <div class="timer-stats">
        <div class="stat-item">
          <div class="stat-label">五次平均</div>
          <div class="stat-value">
            {props.timerStore.avg5() !== null
              ? formatTime(props.timerStore.avg5()!, false)
              : '--:--'}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">最好成绩</div>
          <div class="stat-value">
            {props.timerStore.best() !== null
              ? formatTime(props.timerStore.best()!, false)
              : '--:--'}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">还原次数</div>
          <div class="stat-value">{props.timerStore.solveCount()}</div>
        </div>
      </div>

      <div class="records-section">
        <div class="records-header">
          <div class="records-title">最近记录</div>
          <div class="records-actions">
            <button class="btn btn-sm" onClick={() => props.timerStore.newScramble()}>
              换一组打乱
            </button>
          </div>
        </div>
        <div class="records-list">
          <For each={recentRecords()}>
            {(record) => {
              const effTime = getEffectiveTime(record)
              const isDNF = record.penalty === 'DNF'
              const isPlus2 = record.penalty === '+2'

              return (
                <div class="record-item">
                  <div class={`record-time ${isDNF ? 'dnf' : ''} ${isPlus2 ? 'plus2' : ''}`}>
                    {isDNF ? 'DNF' : formatTime(effTime)}
                  </div>
                  <div class="record-info">
                    <div class="record-scramble">{record.scramble}</div>
                    <div class="record-date">{formatDate(record.createdAt)}</div>
                  </div>
                  <div class="record-actions">
                    <button class="btn btn-sm" onClick={() => setPlus2(record.id)}>
                      +2
                    </button>
                    <button class="btn btn-sm" onClick={() => setDNF(record.id)}>
                      DNF
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      onClick={() => props.timerStore.deleteRecordById(record.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              )
            }}
          </For>
          {props.timerStore.records().length === 0 && (
            <div class="empty-state">
              <div class="empty-state-icon">⏱️</div>
              <div class="empty-state-text">还没有记录，开始你的第一次还原吧！</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
