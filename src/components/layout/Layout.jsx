import { Link, useLocation } from 'react-router-dom'
import { Activity, Newspaper, Rocket } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { ChatbotWidget } from '../widgets/ChatbotWidget'

export function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-stone-100/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-2.5 dark:border-indigo-900/60 dark:bg-indigo-950/60">
              <Rocket className="text-indigo-600 dark:text-indigo-300" size={18} />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wide sm:text-lg">Mission Control Analytics</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">ISS telemetry and global news intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink to="/" active={location.pathname === '/'} icon={<Rocket size={16} />} label="Dashboard" />
            <NavLink to="/news" active={location.pathname === '/news'} icon={<Newspaper size={16} />} label="News" />
            <span className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300 md:inline-flex">
              <Activity size={14} />
              Live
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      <ChatbotWidget />
    </div>
  )
}

function NavLink({ to, active, label, icon }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
