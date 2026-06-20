import { createMemo, For } from 'solid-js'
import StatsChart from '../StatsChart'
import type { TimerStore } from '../../stores/timerStore'
import type { FormulaStore } from '../../stores/formulaStore'
import { formatTime } from '../../utils/timer'
import {
  bestTime,
  worstTime,
  meanTime,
  averageOf5,
  averageOf12,
  dailyStats,
} from '../../utils/stats'
import type { ChartDataPoint } from '../../utils/chart'

interface StatsPageProps {
  timerStore: TimerStore
  formulaStore: FormulaStore
}

export default function StatsPage(props: StatsPageProps) {
  const records = () => props.timerStore.records()

  const stats = createMemo(() => {
    const recs = records()
    return {
      total: recs.length,
      best: bestTime(recs),
      worst: worstTime(recs),
      mean: meanTime(recs),
      avg5: averageOf5(recs),
      avg12: averageOf12(recs),
    }
  })

  const daily = createMemo(() => {
    return dailyStats(records())
  })

  const bestChartData = createMemo((): ChartDataPoint[] => {
    return daily().map(d => ({
      x: d.timestamp,
      y: d.best,
      label: d.date,
    }))
  })

  const avg5ChartData = createMemo((): ChartDataPoint[] => {
    return daily().map(d => ({
      x: d.timestamp,
      y: d.avg5,
      label: d.date,
    }))
  })

  const meanChartData = createMemo((): ChartDataPoint[] => {
    return daily().map(d => ({
      x: d.timestamp,
      y: d.mean,
      label: d.date,
    }))
  })

  const timeFormat = (seconds: number) => {
    const ms = seconds * 1000
    return formatTime(ms, false)
  }

  return (
    <div class="page-layout">
      <div class="page-header">
        <h1 class="page-title">成绩统计</h1>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-label">总还原次数</div>
          <div class="stat-card-value">{stats().total}</div>
          <div class="stat-card-sub">次</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">最好成绩</div>
          <div class="stat-card-value">
            {stats().best !== null ? formatTime(stats().best!, false) : '--:--'}
          </div>
          <div class="stat-card-sub">单次</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">平均成绩</div>
          <div class="stat-card-value">
            {stats().mean !== null ? formatTime(stats().mean!, false) : '--:--'}
          </div>
          <div class="stat-card-sub">全部平均</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">五次平均</div>
          <div class="stat-card-value">
            {stats().avg5 !== null ? formatTime(stats().avg5!, false) : '--:--'}
          </div>
          <div class="stat-card-sub">去头尾</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">十二次平均</div>
          <div class="stat-card-value">
            {stats().avg12 !== null ? formatTime(stats().avg12!, false) : '--:--'}
          </div>
          <div class="stat-card-sub">去头尾</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">最差成绩</div>
          <div class="stat-card-value">
            {stats().worst !== null ? formatTime(stats().worst!, false) : '--:--'}
          </div>
          <div class="stat-card-sub">单次</div>
        </div>
      </div>

      <StatsChart
        data={bestChartData()}
        title="每日最好成绩趋势"
        options={{
          lineColor: '#22c55e',
          pointColor: '#22c55e',
          yAxisFormatter: timeFormat,
        }}
      />

      <StatsChart
        data={avg5ChartData()}
        title="每日五次平均趋势"
        options={{
          lineColor: '#3b82f6',
          pointColor: '#3b82f6',
          yAxisFormatter: timeFormat,
        }}
      />

      <StatsChart
        data={meanChartData()}
        title="每日平均成绩趋势"
        options={{
          lineColor: '#f59e0b',
          pointColor: '#f59e0b',
          yAxisFormatter: timeFormat,
        }}
      />

      <div class="chart-container">
        <div class="chart-title">每日记录</div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border);">
                <th style="text-align: left; padding: 10px 8px; color: var(--text-secondary); font-weight: 500;">日期</th>
                <th style="text-align: right; padding: 10px 8px; color: var(--text-secondary); font-weight: 500;">次数</th>
                <th style="text-align: right; padding: 10px 8px; color: var(--text-secondary); font-weight: 500;">最好</th>
                <th style="text-align: right; padding: 10px 8px; color: var(--text-secondary); font-weight: 500;">五次平均</th>
                <th style="text-align: right; padding: 10px 8px; color: var(--text-secondary); font-weight: 500;">平均</th>
              </tr>
            </thead>
            <tbody>
              <For each={[...daily()].reverse()}>
                {(day) => (
                  <tr style="border-bottom: 1px solid var(--bg-tertiary);">
                    <td style="padding: 10px 8px; color: var(--text-primary);">{day.date}</td>
                    <td style="text-align: right; padding: 10px 8px; color: var(--text-secondary);">{day.count}</td>
                    <td style="text-align: right; padding: 10px 8px; color: var(--success); font-variant-numeric: tabular-nums;">
                      {day.best !== null ? formatTime(day.best, false) : '--'}
                    </td>
                    <td style="text-align: right; padding: 10px 8px; color: var(--accent); font-variant-numeric: tabular-nums;">
                      {day.avg5 !== null ? formatTime(day.avg5, false) : '--'}
                    </td>
                    <td style="text-align: right; padding: 10px 8px; color: var(--text-secondary); font-variant-numeric: tabular-nums;">
                      {day.mean !== null ? formatTime(day.mean, false) : '--'}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
        {daily().length === 0 && (
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-text">还没有数据，开始练习后会在这里显示统计</div>
          </div>
        )}
      </div>
    </div>
  )
}
