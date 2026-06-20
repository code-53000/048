import { onMount, onCleanup, createEffect } from 'solid-js'
import { drawLineChart, type ChartDataPoint, type ChartOptions } from '../../utils/chart'

interface StatsChartProps {
  data: ChartDataPoint[]
  title?: string
  options?: ChartOptions
  height?: number
}

export default function StatsChart(props: StatsChartProps) {
  let canvasRef: HTMLCanvasElement | undefined

  const draw = () => {
    if (!canvasRef) return

    const container = canvasRef.parentElement
    if (!container) return

    const width = container.clientWidth - 48
    const height = props.height || 300

    drawLineChart(canvasRef, props.data, {
      width,
      height,
      lineColor: '#3b82f6',
      pointColor: '#3b82f6',
      gridColor: '#334155',
      textColor: '#94a3b8',
      ...props.options,
    })
  }

  let resizeObserver: ResizeObserver | null = null

  onMount(() => {
    draw()

    resizeObserver = new ResizeObserver(() => {
      draw()
    })

    if (canvasRef?.parentElement) {
      resizeObserver.observe(canvasRef.parentElement)
    }
  })

  createEffect(() => {
    draw()
  })

  onCleanup(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })

  return (
    <div class="chart-container">
      {props.title && <div class="chart-title">{props.title}</div>}
      <canvas ref={canvasRef} class="chart-canvas"></canvas>
    </div>
  )
}
