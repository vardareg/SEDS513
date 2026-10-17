/**
 * Sequential cool→warm ramp between two theme tokens. Mixing in oklab keeps the
 * perceptual step even, and tokens let dark mode retune the ramp without
 * recomputing anything here. Pure string builder: no color parsing.
 */
export function temperatureColor(value: number, domain: readonly [number, number]): string {
  const [min, max] = domain
  const span = max - min
  const clamped = Math.min(max, Math.max(min, value))
  const percent = span <= 0 ? 0 : Math.round(((clamped - min) / span) * 100)
  return `color-mix(in oklab, var(--heat-cold) ${100 - percent}%, var(--heat-warm))`
}
