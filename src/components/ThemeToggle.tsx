import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      onClick={toggleTheme}
      aria-pressed={dark}
      data-testid="theme-toggle"
    >
      {dark ? <Sun aria-hidden="true" data-icon="inline-start" /> : <Moon aria-hidden="true" data-icon="inline-start" />}
      {dark ? 'Light theme' : 'Dark theme'}
    </Button>
  )
}
