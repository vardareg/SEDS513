import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = [
  { path: '/', heading: 'Compare temperatures', title: 'Compare · Scientific Time-Series Explorer', nav: 'Compare' },
  { path: '/analytics', heading: 'Annual statistics', title: 'Analytics · Scientific Time-Series Explorer', nav: 'Analytics' },
  { path: '/cities', heading: 'City profiles', title: 'Cities · Scientific Time-Series Explorer', nav: 'Cities' },
  { path: '/about', heading: 'How the data is made', title: 'About · Scientific Time-Series Explorer', nav: 'About' },
] as const

test.describe('navigation', () => {
  for (const { path, heading, title, nav } of PAGES) {
    test(`renders ${path} with its heading, title, and current nav marker`, async ({ page }) => {
      await page.goto(path)
      if (path === '/analytics') await page.getByTestId('monthly-chart').waitFor()
      await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
      await expect(page).toHaveTitle(title)
      const link = page.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: nav })
      await expect(link).toHaveAttribute('aria-current', 'page')
      for (const other of PAGES.filter((entry) => entry.nav !== nav)) {
        await expect(page.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: other.nav })).not.toHaveAttribute('aria-current', 'page')
      }
    })
  }

  test('returns home from an unknown address', async ({ page }) => {
    await page.goto('/no-such-page')
    await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible()
    await expect(page).toHaveTitle('Page not found · Scientific Time-Series Explorer')
    await page.getByRole('link', { name: 'Return to the comparison workspace' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'Compare temperatures' })).toBeVisible()
  })

  test('fits the header and navigation at 360px without clipping', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/about')
    await expect(page.getByRole('heading', { name: 'How the data is made' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('offers a keyboard route through the navigation', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('theme-toggle')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Compare' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { level: 2, name: 'Compare temperatures' })).toBeVisible()
  })

  test('has no detected WCAG A/AA violations on any page', async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path)
      if (path === '/analytics') await page.getByTestId('monthly-chart').waitFor()
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      expect(result.violations, `axe violations on ${path}`).toEqual([])
    }
  })
})
