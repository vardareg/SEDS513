// Sparkline per Tufte: no axes, no labels, dots only on the extremes.
const WIDTH = 120
const HEIGHT = 32

export function CitySparkline({ values, color }: { values: readonly (number | null)[]; color: string }) {
  const points = values
    .map((value, index) => ({ index, value }))
    .filter((point): point is { index: number; value: number } => point.value !== null)
  if (points.length < 2) {
    return (
      <svg className="city-sparkline" width={WIDTH} height={HEIGHT} aria-hidden="true">
        <line x1="2" y1={HEIGHT / 2} x2={WIDTH - 2} y2={HEIGHT / 2} stroke="var(--border)" strokeWidth="2" strokeDasharray="2 4" />
      </svg>
    )
  }
  const min = Math.min(...points.map((point) => point.value))
  const max = Math.max(...points.map((point) => point.value))
  const span = max - min || 1
  const x = (index: number) => 2 + (index / Math.max(1, values.length - 1)) * (WIDTH - 4)
  const y = (value: number) => HEIGHT - 3 - ((value - min) / span) * (HEIGHT - 6)
  const lowest = points.reduce((a, b) => (b.value < a.value ? b : a))
  const highest = points.reduce((a, b) => (b.value > a.value ? b : a))
  return (
    <svg className="city-sparkline" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
      <polyline points={points.map((point) => `${x(point.index)},${y(point.value)}`).join(' ')} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={x(lowest.index)} cy={y(lowest.value)} r="2.5" fill={color} />
      <circle cx={x(highest.index)} cy={y(highest.value)} r="2.5" fill={color} />
    </svg>
  )
}
