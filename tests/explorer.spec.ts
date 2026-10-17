import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import data from '../src/data/temperatures-2025.json' with { type: 'json' }

async function selectPair(page: Page, first = 'izmir', second = 'ankara') {
  await page.getByLabel('City 1', { exact: true }).selectOption(first)
  await page.getByLabel('City 2', { exact: true }).selectOption(second)
  await expect(page.getByTestId('temperature-chart')).toBeVisible()
}

async function applyRange(page: Page, start: string, end: string) {
  await page.getByLabel('Start date', { exact: true }).fill(start)
  await page.getByLabel('End date', { exact: true }).fill(end)
  await page.getByRole('button', { name: 'Apply dates', exact: true }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('starts empty, prevents duplicate cities, and resets all form state', async ({ page }) => {
  await expect(page.getByText('Your comparison starts with two cities')).toBeVisible()
  await expect(page.getByTestId('temperature-chart')).toHaveCount(0)
  await page.getByLabel('City 1', { exact: true }).selectOption('izmir')
  await expect(page.getByText('Choose one more city')).toBeVisible()
  await expect(page.locator('#city-1 option[value="izmir"]')).toBeDisabled()
  await page.getByLabel('City 2', { exact: true }).selectOption('ankara')
  await expect(page.locator('#applied-summary')).toContainText('365 days')
  await page.getByLabel('City 2', { exact: true }).selectOption('')
  await expect(page.getByTestId('temperature-chart')).toHaveCount(0)
  await expect(page.getByText('Choose one more city')).toBeVisible()
  await page.getByLabel('City 2', { exact: true }).selectOption('ankara')
  await applyRange(page, '2025-06-01', '2025-06-30')
  await expect(page.locator('#applied-summary')).toContainText('30 days')
  await page.getByLabel('Start date').fill('2025-07-01')
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.getByLabel('City 1', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('City 2', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('City 1', { exact: true })).toBeFocused()
  await expect(page.getByLabel('Start date')).toHaveValue('2025-01-01')
  await expect(page.getByLabel('End date')).toHaveValue('2025-12-31')
  await expect(page.getByText('Date changes not applied')).toHaveCount(0)
  await expect(page.getByText('Your comparison starts with two cities')).toBeVisible()
})

test('renders every city pair and preserves the full-data temperature scale', async ({ page }) => {
  await selectPair(page)
  const domain = await page.getByTestId('temperature-chart').getAttribute('data-temperature-domain')
  expect(domain).toBe('-10,35')
  for (const [first, second, names] of [
    ['izmir', 'ankara', 'İzmir and Ankara'],
    ['izmir', 'istanbul', 'İzmir and İstanbul'],
    ['ankara', 'istanbul', 'Ankara and İstanbul'],
    ['antalya', 'erzurum', 'Antalya and Erzurum'],
    ['van', 'antalya', 'Van and Antalya'],
    ['erzurum', 'van', 'Erzurum and Van'],
  ]) {
    await page.getByLabel('City 1', { exact: true }).selectOption(first)
    await page.getByLabel('City 2', { exact: true }).selectOption(second)
    await expect(page.locator('#applied-summary')).toContainText(names)
    await expect(page.getByTestId('temperature-chart')).toHaveAttribute('data-temperature-domain', domain!)
  }
  await applyRange(page, '2025-07-01', '2025-07-31')
  await expect(page.getByTestId('temperature-chart')).toHaveAttribute('data-temperature-domain', domain!)
  await expect(page.locator('#applied-summary')).toContainText('31 days')
})

test('keeps date edits pending, including when changing cities', async ({ page }) => {
  await selectPair(page)
  await page.getByLabel('Start date').fill('2025-06-01')
  await page.getByLabel('End date').fill('2025-06-30')
  await expect(page.getByText('Date changes not applied')).toBeVisible()
  await expect(page.locator('#applied-summary')).toContainText('365 days')
  await page.getByLabel('City 2', { exact: true }).selectOption('istanbul')
  await expect(page.locator('#applied-summary')).toContainText('İzmir and İstanbul')
  await expect(page.locator('#applied-summary')).toContainText('365 days')
  await page.getByRole('button', { name: 'Apply dates', exact: true }).click()
  await expect(page.locator('#applied-summary')).toContainText('1 Jun 2025 – 30 Jun 2025')
  await expect(page.locator('#applied-summary')).toContainText('30 days')
  await expect(page.getByText('Date changes not applied')).toHaveCount(0)
})

test('rejects reversed, absent, and out-of-year dates, focuses errors, and retains the applied range', async ({ page }) => {
  await selectPair(page)
  await applyRange(page, '2025-08-01', '2025-07-01')
  await expect(page.getByText('End date must be on or after the start date.')).toBeVisible()
  await expect(page.getByLabel('End date')).toBeFocused()
  await expect(page.getByLabel('End date')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#applied-summary')).toContainText('365 days')
  await page.getByLabel('Start date').fill('')
  await page.getByRole('button', { name: 'Apply dates', exact: true }).click()
  await expect(page.getByText('Choose a start date.')).toBeVisible()
  await expect(page.getByLabel('Start date')).toBeFocused()
  await applyRange(page, '2024-12-31', '2025-07-01')
  await expect(page.getByText('Choose a date from 1 Jan to 31 Dec 2025.')).toBeVisible()
  await expect(page.locator('#applied-summary')).toContainText('365 days')
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0)
})

test('uses inclusive boundaries and displays the exact bundled values in the table', async ({ page }) => {
  await selectPair(page)
  await applyRange(page, '2025-01-31', '2025-02-01')
  await expect(page.locator('#applied-summary')).toContainText('2 days')
  await page.getByText('View daily values', { exact: false }).click()
  const table = page.getByRole('table')
  await expect(table.getByRole('row')).toHaveCount(3)
  for (const date of ['2025-01-31', '2025-02-01']) {
    const day = data.days.find((item) => item.date === date)!
    const row = table.getByRole('row').filter({ has: page.locator(`time[datetime="${date}"]`) })
    await expect(row.getByRole('cell').nth(0)).toHaveText(day.temperaturesC.izmir.toFixed(1))
    await expect(row.getByRole('cell').nth(1)).toHaveText(day.temperaturesC.ankara.toFixed(1))
  }
  await applyRange(page, '2025-12-31', '2025-12-31')
  await expect(page.locator('#applied-summary')).toContainText('1 day')
  await expect(table.getByRole('row')).toHaveCount(2)
  await expect(page.getByText('One day is shown;', { exact: false })).toBeVisible()
})

test('provides a shared keyboard readout for both cities with correct values', async ({ page }) => {
  await selectPair(page)
  await applyRange(page, '2025-01-01', '2025-01-03')
  const chart = page.getByTestId('temperature-chart').getByRole('application')
  await chart.focus()
  await chart.press('ArrowRight')
  const tooltip = page.getByTestId('comparison-tooltip')
  await expect(tooltip).toBeVisible()
  await expect(tooltip).toContainText('İzmir')
  await expect(tooltip).toContainText('Ankara')
  const dateText = await tooltip.locator('.tooltip-date').innerText()
  const selectedDay = data.days.find((day) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`)) === dateText)!
  await expect(tooltip).toContainText(`${selectedDay.temperaturesC.izmir.toFixed(1)} °C`)
  await expect(tooltip).toContainText(`${selectedDay.temperaturesC.ankara.toFixed(1)} °C`)
})

test('supports pointer or touch inspection and renders direct endpoint labels', async ({ page, isMobile }) => {
  await selectPair(page)
  await applyRange(page, '2025-07-01', '2025-07-31')
  const chart = page.getByTestId('temperature-chart')
  await chart.scrollIntoViewIfNeeded()
  const box = (await chart.boundingBox())!
  if (isMobile) await page.touchscreen.tap(box.x + box.width / 2, box.y + 140)
  else await page.mouse.move(box.x + box.width / 2, box.y + 140)
  await expect(page.getByTestId('comparison-tooltip')).toBeVisible()
  await expect(chart.locator('svg text').filter({ hasText: /^İzmir$/ })).toBeVisible()
  await expect(chart.locator('svg text').filter({ hasText: /^Ankara$/ })).toBeVisible()
})

test('offers a keyboard route through controls and the daily-values disclosure', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop keyboard route; the mobile project covers touch and chart focus directly.')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('City 1', { exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('City 2', { exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByTestId('temperature-chart')).toBeVisible()
  const disclosure = page.locator('summary')
  await disclosure.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('table')).toBeVisible()
})

test('has no detected WCAG A/AA violations across initial, valid, error, and expanded-table states', async ({ page }) => {
  async function scan() {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(result.violations).toEqual([])
  }
  await scan()
  await selectPair(page)
  await scan()
  await applyRange(page, '2025-07-01', '2025-06-01')
  await scan()
  await applyRange(page, '2025-06-01', '2025-06-07')
  await page.locator('summary').first().click()
  await scan()
  await page.getByRole('radio', { name: '14-day' }).check()
  await scan()
})

test.describe('timezone independence', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })
  test('keeps dates unchanged in an American timezone', async ({ page }) => {
  await selectPair(page)
  await applyRange(page, '2025-01-01', '2025-01-01')
  await expect(page.locator('#applied-summary')).toContainText('1 Jan 2025 – 1 Jan 2025')
  await page.locator('summary').click()
  await expect(page.locator('time[datetime="2025-01-01"]')).toHaveText('1 Jan 2025')
  })
})

test('reflows at narrow, tablet, and desktop widths without clipping the page', async ({ page }, testInfo) => {
  await selectPair(page)
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect(page.getByTestId('temperature-chart')).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`comparison-${width}.png`), fullPage: true })
  }
})

test('loads without JavaScript errors or requests to external services', async ({ page }) => {
  const errors: string[] = []
  const external: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('request', (request) => {
    if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) external.push(request.url())
  })
  await page.reload()
  await selectPair(page)
  await applyRange(page, '2025-03-01', '2025-03-31')
  await applyRange(page, '2025-01-31', '2025-02-01')
  await applyRange(page, '2025-12-31', '2025-12-31')
  expect(errors).toEqual([])
  expect(external).toEqual([])
})

test('applies quick ranges immediately while manual edits still wait for Apply dates', async ({ page }) => {
  await selectPair(page)
  await page.getByRole('button', { name: 'Summer', exact: true }).click()
  await expect(page.locator('#applied-summary')).toContainText('1 Jun 2025 – 31 Aug 2025')
  await expect(page.locator('#applied-summary')).toContainText('92 days')
  await expect(page.getByText('Date changes not applied')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Summer', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Start date').fill('2025-07-01')
  await expect(page.getByText('Date changes not applied')).toBeVisible()
  await page.getByRole('button', { name: 'Winter', exact: true }).click()
  await expect(page.getByText('Date changes not applied')).toHaveCount(0)
  await expect(page.locator('#applied-summary')).toContainText('59 days')
})

test('swaps the two selected cities', async ({ page }) => {
  await selectPair(page, 'izmir', 'ankara')
  await page.getByRole('button', { name: 'Swap cities' }).click()
  await expect(page.getByLabel('City 1', { exact: true })).toHaveValue('ankara')
  await expect(page.getByLabel('City 2', { exact: true })).toHaveValue('izmir')
  await expect(page.locator('#applied-summary')).toContainText('Ankara and İzmir')
})

test('overlays trailing rolling means that pause at gaps', async ({ page }) => {
  await page.getByLabel('City 1', { exact: true }).selectOption('erzurum')
  await page.getByLabel('City 2', { exact: true }).selectOption('van')
  await expect(page.getByTestId('temperature-chart')).toBeVisible()
  await expect(page.locator('.recharts-line')).toHaveCount(2)
  await page.getByRole('radio', { name: '7-day' }).check()
  await expect(page.locator('.recharts-line')).toHaveCount(4)
  await expect(page.locator('.series-key')).toContainText('7-day mean')
  await expect(page.getByText('thinner lines show trailing 7-day means', { exact: false })).toBeVisible()
})

test('toggles the synchronized difference chart', async ({ page }) => {
  await selectPair(page)
  await expect(page.getByTestId('difference-chart')).toBeVisible()
  await page.getByTestId('difference-toggle').uncheck()
  await expect(page.getByTestId('difference-chart')).toHaveCount(0)
  await page.getByTestId('difference-toggle').check()
  await expect(page.getByTestId('difference-chart')).toBeVisible()
})

test('downloads the filtered comparison as CSV with gaps as empty fields', async ({ page }) => {
  await page.getByLabel('City 1', { exact: true }).selectOption('istanbul')
  await page.getByLabel('City 2', { exact: true }).selectOption('izmir')
  await applyRange(page, '2025-11-01', '2025-11-05')
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('csv-export').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('temperatures-istanbul-izmir-2025-11-01-to-2025-11-05.csv')
  const lines = readFileSync(await download.path(), 'utf8').replace(/^\uFEFF/, '').trimEnd().split(/\r\n/)
  expect(lines).toHaveLength(6)
  expect(lines[0]).toBe('Date,İstanbul,İzmir')
  const gapDay = data.days.find((day) => day.date === '2025-11-03')!
  const firstDay = data.days.find((day) => day.date === '2025-11-01')!
  expect(lines[3]).toBe(`2025-11-03,,${gapDay.temperaturesC.izmir.toFixed(1)}`)
  expect(lines[1]).toBe(`2025-11-01,${firstDay.temperaturesC.istanbul!.toFixed(1)},${firstDay.temperaturesC.izmir!.toFixed(1)}`)
})
