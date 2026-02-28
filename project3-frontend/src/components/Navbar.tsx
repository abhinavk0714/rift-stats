import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="border-b border-slate-700 bg-secondary px-4 py-3" role="banner">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-accent hover:text-accent-hover">
          Rift Stats
        </Link>
        <span className="text-sm text-text-muted">Project 3 Frontend</span>
      </div>
    </header>
  )
}
