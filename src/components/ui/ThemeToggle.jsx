import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
