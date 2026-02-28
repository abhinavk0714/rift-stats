import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { PlayersPage } from './pages/PlayersPage'
import { PlayerDetailPage } from './pages/PlayerDetailPage'
import { TeamsPage } from './pages/TeamsPage'
import { TeamDetailPage } from './pages/TeamDetailPage'
import { MatchesPage } from './pages/MatchesPage'
import { MatchDetailPage } from './pages/MatchDetailPage'
import { RosterPage } from './pages/RosterPage'
import { RosterDetailPage } from './pages/RosterDetailPage'
import { MatchStatsPage } from './pages/MatchStatsPage'
import { MatchStatDetailPage } from './pages/MatchStatDetailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="players" element={<PlayersPage />} />
            <Route path="players/:id" element={<PlayerDetailPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/:id" element={<TeamDetailPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="matches/:id" element={<MatchDetailPage />} />
            <Route path="roster" element={<RosterPage />} />
            <Route path="roster/:id" element={<RosterDetailPage />} />
            <Route path="match-stats" element={<MatchStatsPage />} />
            <Route path="match-stats/:id" element={<MatchStatDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
