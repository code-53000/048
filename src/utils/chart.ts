export interface ChartDataPoint {
  x: number
  y: number | null
  label?: string
}

export interface ChartOptions {
  width?: number
  height?: number
  padding?: { top: number; right: number; bottom: number; left: number }
  lineColor?: string
  pointColor?: string
  gridColor?: string
  textColor?: string
  bgColor?: string
  showPoints?: boolean
  showGrid?: boolean
  yAxisFormatter?: (value: number) => string
  xAxisFormatter?: (value: number) => string
}

const defaultOptions: Required<ChartOptions> = {
  width: 800,
  height: 300,
  padding: { top: 20, right: 20, bottom: 40, left: 60 },
  lineColor: '#3b82f6',
  pointColor: '#3b82f6',
  gridColor: '#475569',
  textColor: '#94a3b8',
  bgColor: 'transparent',
  showPoints: true,
  showGrid: true,
  yAxisFormatter: (v) => v.toFixed(2),
  xAxisFormatter: (v) => new Date(v).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
}

export function drawLineChart(
  canvas: HTMLCanvasElement,
  data: ChartDataPoint[],
  options: ChartOptions = {}
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const opts = { ...defaultOptions, ...options, padding: { ...defaultOptions.padding, ...options.padding } }

  const dpr = window.devicePixelRatio || 1
  const displayWidth = opts.width
  const displayHeight = opts.height

  canvas.width = displayWidth * dpr
  canvas.height = displayHeight * dpr
  canvas.style.width = `${displayWidth}px`
  canvas.style.height = `${displayHeight}px`

  ctx.scale(dpr, dpr)

  if (opts.bgColor !== 'transparent') {
    ctx.fillStyle = opts.bgColor
    ctx.fillRect(0, 0, displayWidth, displayHeight)
  }

  const chartWidth = displayWidth - opts.padding.left - opts.padding.right
  const chartHeight = displayHeight - opts.padding.top - opts.padding.bottom

  const validPoints = data.filter((d): d is { x: number; y: number; label?: string } => d.y !== null && isFinite(d.y))

  if (validPoints.length === 0) {
    ctx.fillStyle = opts.textColor
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('暂无数据', displayWidth / 2, displayHeight / 2)
    return
  }

  const minY = Math.min(...validPoints.map(d => d.y)) * 0.95
  const maxY = Math.max(...validPoints.map(d => d.y)) * 1.05
  const minX = data[0].x
  const maxX = data[data.length - 1].x

  const xScale = (x: number) => {
    if (maxX === minX) return chartWidth / 2
    return opts.padding.left + ((x - minX) / (maxX - minX)) * chartWidth
  }

  const yScale = (y: number) => {
    if (maxY === minY) return chartHeight / 2
    return opts.padding.top + chartHeight - ((y - minY) / (maxY - minY)) * chartHeight
  }

  if (opts.showGrid) {
    ctx.strokeStyle = opts.gridColor
    ctx.lineWidth = 0.5
    ctx.font = '11px sans-serif'
    ctx.fillStyle = opts.textColor

    const yTicks = 5
    for (let i = 0; i <= yTicks; i++) {
      const yValue = minY + ((maxY - minY) * i) / yTicks
      const y = yScale(yValue)

      ctx.beginPath()
      ctx.moveTo(opts.padding.left, y)
      ctx.lineTo(displayWidth - opts.padding.right, y)
      ctx.stroke()

      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(opts.yAxisFormatter(yValue / 1000), opts.padding.left - 8, y)
    }

    const xTickCount = Math.min(6, data.length)
    for (let i = 0; i < xTickCount; i++) {
      const index = Math.floor((i / (xTickCount - 1)) * (data.length - 1))
      const point = data[index]
      const x = xScale(point.x)

      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(opts.xAxisFormatter(point.x), x, displayHeight - opts.padding.bottom + 8)
    }
  }

  ctx.strokeStyle = opts.lineColor
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()

  let started = false
  for (let i = 0; i < data.length; i++) {
    const point = data[i]
    if (point.y === null || !isFinite(point.y)) {
      started = false
      continue
    }

    const x = xScale(point.x)
    const y = yScale(point.y)

    if (!started) {
      ctx.moveTo(x, y)
      started = true
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  if (opts.showPoints) {
    ctx.fillStyle = opts.pointColor
    for (const point of validPoints) {
      const x = xScale(point.x)
      const y = yScale(point.y)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}
