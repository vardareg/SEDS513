import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/cities')
  await expect(page.locator('.city-profile').first()).toBeVisible()
})

test('lists all six city profiles with facts from the dataset', async ({ page }) => {
  await expect(page.locator('.city-profile')).toHaveCount(6)
  await expect(page.locator('.city-profile[data-city="erzurum"]')).toContainText('3 (10 Jan 2025 – 12 Jan 2025)')
  await expect(page.locator('.city-profile[data-city="van"]')).toContainText('3 (20 Jul 2025 – 22 Jul 2025)')
  await expect(page.locator('.city-profile[data-city="istanbul"]')).toContainText('2 (3 Nov 2025 – 4 Nov 2025)')
  await expect(page.locator('.city-profile[data-city="izmir"] .city-facts')).toContainText('none')
  await expect(page.locator('.city-profile[data-city="izmir"] .city-sparkline polyline')).toBeVisible()
})

test('hands a chosen pair off to the comparison page', async ({ page }) => {
  await page.locator('#compare-erzurum').selectOption('antalya')
  await page.getByTestId('compare-link-erzurum').click()
  await page.getByTestId('temperature-chart').waitFor()
  await expect(page.locator('#applied-summary')).toContainText('Erzurum and Antalya')
  await expect(page.locator('#applied-summary')).toContainText('365 days')
  await expect(page).toHaveURL(/\/$/)
})

test('accepts a full hand-off link with cities and dates', async ({ page }) => {
  await page.goto('/?from=van&to=izmir&start=2025-06-01&end=2025-06-30')
  await page.getByTestId('temperature-chart').waitFor()
  await expect(page.locator('#applied-summary')).toContainText('Van and İzmir')
  await expect(page.locator('#applied-summary')).toContainText('30 days')
  await expect(page).toHaveURL(/\/$/)
})

test('ignores invalid hand-off parameters', async ({ page }) => {
  await page.goto('/?from=nowhere&to=izmir&start=2024-01-01&end=2025-01-01')
  await expect(page.getByText('Your comparison starts with two cities')).toBeVisible()
  await expect(page.locator('#applied-summary')).toContainText('Applied dates: 1 Jan 2025 – 31 Dec 2025')
})

test('has no detected WCAG A/AA violations', async ({ page }) => {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(result.violations).toEqual([])
})
