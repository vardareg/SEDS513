import { describe, expect, it } from 'vitest'
import { temperatureColor } from './heatmap'

describe('heatmap color scale', () => {
  it('mixes fully toward cold at the domain minimum and warm at the maximum', () => {
    expect(temperatureColor(-10, [-10, 35])).toBe('color-mix(in oklab, var(--heat-cold) 100%, var(--heat-warm))')
    expect(temperatureColor(35, [-10, 35])).toBe('color-mix(in oklab, var(--heat-cold) 0%, var(--heat-warm))')
  })

  it('scales linearly and clamps values outside the domain', () => {
    expect(temperatureColor(12.5, [-10, 35])).toBe('color-mix(in oklab, var(--heat-cold) 50%, var(--heat-warm))')
    expect(temperatureColor(-99, [-10, 35])).toBe('color-mix(in oklab, var(--heat-cold) 100%, var(--heat-warm))')
    expect(temperatureColor(99, [-10, 35])).toBe('color-mix(in oklab, var(--heat-cold) 0%, var(--heat-warm))')
  })

  it('falls back to fully cold for a degenerate domain', () => {
    expect(temperatureColor(5, [5, 5])).toBe('color-mix(in oklab, var(--heat-cold) 100%, var(--heat-warm))')
  })
})
