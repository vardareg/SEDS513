import { test, expect } from '@playwright/test'
import data from '../src/data/temperatures-2025.json' with { type: 'json' }

type CityKey = keyof (typeof data.days)[number]['temperaturesC']

function meanOf(city: CityKey): string {
  const values = data.days.map((day) => day.temperaturesC[city]).filter((value): value is number => value !== null)
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/analytics')
  await page.getByTestId('monthly-chart').waitFor()
})

test('statistics table matches the bundled dataset', async ({ page }) => {
  for (const city of ['izmir', 'ankara', 'istanbul', 'antalya', 'erzurum', 'van'] as const) {
    await expect(page.locator(`[data-city="${city}"][data-stat="mean"]`)).toHaveText(meanOf(city))
  }
})

test('statistics table missing-day column matches the documented gaps', async ({ page }) => {
  const expectations: [string, string][] = [
    ['İzmir', '0'], ['Ankara', '0'], ['İstanbul', '2'], ['Antalya', '0'], ['Erzurum', '3'], ['Van', '3'],
  ]
  for (const [name, missing] of expectations) {
    const row = page.locator('.stats-region tbody tr').filter({ hasText: name })
    await expect(row.locator('td').last()).toHaveText(missing)
  }
})

test('monthly chart draws one line per city across twelve months', async ({ page }) => {
  const chart = page.getByTestId('monthly-chart')
  await expect(chart.locator('.recharts-line')).toHaveCount(6)
  await expect(chart.locator('.recharts-xAxis .recharts-cartesian-axis-tick')).toHaveCount(12)
})

test('distribution panels cover all six cities on one scale', async ({ page }) => {
  const grid = page.getByTestId('distribution-grid')
  await expect(grid.locator('.distribution-panel')).toHaveCount(6)
  await expect(grid.locator('.distribution-mean').first()).toBeVisible()
})

test('calendar heatmap renders every day and marks exactly the documented gaps', async ({ page }) => {
  const heatmap = page.getByTestId('calendar-heatmap')
  await expect(heatmap.locator('.heatmap-cell')).toHaveCount(365)
  await page.locator('#heatmap-city').selectOption('izmir')
  await expect(heatmap.locator('.heatmap-gap')).toHaveCount(0)
  await page.locator('#heatmap-city').selectOption('erzurum')
  await expect(heatmap.locator('.heatmap-grid')).toHaveAttribute('data-city', 'erzurum')
  await expect(heatmap.locator('.heatmap-gap')).toHaveCount(3)
  await page.locator('#heatmap-city').selectOption('van')
  await expect(heatmap.locator('.heatmap-gap')).toHaveCount(3)
})

test('heatmap companion table lists every day with gaps as Unavailable', async ({ page }) => {
  await page.locator('#heatmap-city').selectOption('van')
  await page.getByText('View daily values for Van').click()
  const table = page.getByRole('region', { name: 'Daily temperature values for Van' })
  await expect(table.getByRole('row')).toHaveCount(366)
  await expect(table.getByRole('cell', { name: 'Unavailable' })).toHaveCount(3)
})

test('correlation matrix is self-consistent with a unit diagonal', async ({ page }) => {
  const matrix = page.getByTestId('correlation-matrix')
  await expect(matrix.locator('[data-cities="izmir-izmir"]')).toHaveText('1.00')
  await expect(matrix.locator('[data-cities="van-van"]')).toHaveText('1.00')
  await expect(matrix.locator('[data-cities="izmir-ankara"]')).toHaveText(/^0\.\d{2}$/)
  await expect(matrix.locator('[data-cities="ankara-izmir"]')).toHaveText('—')
})
