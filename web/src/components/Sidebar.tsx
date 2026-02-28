import { Link, useLocation } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/players', label: 'Players' },
  { to: '/teams', label: 'Teams' },
  { to: '/matches', label: 'Matches' },
  { to: '/roster', label: 'Roster' },
  { to: '/match-stats', label: 'Match Stats' },
]

export function Sidebar() {
  const location = useLocation()
  return (
    <aside className="w-52 flex-shrink-0 border-r border-slate-700 bg-secondary p-4" aria-label="Main navigation">
      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                ? 'bg-accent text-primary'
                : 'text-text-muted hover:bg-slate-700 hover:text-primary'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
