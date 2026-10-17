import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('toggles dark mode, persists the choice across reloads, and returns to light', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(await page.evaluate(() => localStorage.getItem('stse-theme'))).toBe('dark')
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  expect(await page.evaluate(() => localStorage.getItem('stse-theme'))).toBe('light')
})

test('follows the system color scheme when no choice is stored', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('keeps a valid comparison legible in dark mode with no WCAG A/AA violations', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('theme-toggle').click()
  await page.getByLabel('City 1', { exact: true }).selectOption('erzurum')
  await page.getByLabel('City 2', { exact: true }).selectOption('antalya')
  await expect(page.getByTestId('temperature-chart')).toBeVisible()
  await expect(page.getByTestId('difference-chart')).toBeVisible()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(result.violations).toEqual([])
})

test('keeps the analytics page free of violations in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/analytics')
  await page.getByTestId('monthly-chart').waitFor()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(result.violations).toEqual([])
})
