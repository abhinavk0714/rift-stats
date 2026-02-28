import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

/** App shell: navbar, sidebar, and main content area. */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-primary">
      <Navbar />
      <div className="flex flex-1 min-w-0">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
