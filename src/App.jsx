import { useState, useEffect, Component } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Roster from './pages/Roster'
import DraftBoard from './pages/DraftBoard'
import GameDay from './pages/GameDay'
import DevLeague from './pages/DevLeague'
import Scouting from './pages/Scouting'
import TradeMarket from './pages/TradeMarket'
import CoachingStaff from './pages/CoachingStaff'
import Offseason from './pages/Offseason'
import Records from './pages/Records'
import HallOfFame from './pages/HallOfFame'
import SeasonRecap from './pages/SeasonRecap'
import NewGame from './pages/NewGame'
import DatabaseSetup from './pages/DatabaseSetup'
import LandingPage from './pages/LandingPage'
import { GameProvider } from './context/GameContext'
import { CinematicProvider } from './context/CinematicContext'
import CinematicOverlay from './components/CinematicOverlay'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.warn('App ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stadium flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h2 className="font-display text-2xl text-ember mb-4">Something went wrong</h2>
            <p className="font-mono text-muted text-sm mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-rust text-cream font-mono text-sm rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const appRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/roster', element: <Roster /> },
  { path: '/draft-board', element: <DraftBoard /> },
  { path: '/game-day', element: <GameDay /> },
  { path: '/dev-league', element: <DevLeague /> },
  { path: '/scouting', element: <Scouting /> },
  { path: '/trade-market', element: <TradeMarket /> },
  { path: '/coaching-staff', element: <CoachingStaff /> },
  { path: '/offseason', element: <Offseason /> },
  { path: '/records', element: <Records /> },
  { path: '/hall-of-fame', element: <HallOfFame /> },
  { path: '/season-recap', element: <SeasonRecap /> },
  { path: '/new-game', element: <NewGame /> },
]

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const location = useLocation()
  const isNewGame = location.pathname === '/new-game'
  const isLandingPage = location.pathname === '/'

  useEffect(() => {
    setIsReady(true)
  }, [])

  const savedGm = typeof localStorage !== 'undefined' ? localStorage.getItem('hardwood_gm') : null
  const hasSavedGame = !!savedGm

  if (!isReady) {
    return (
      <div className="min-h-screen bg-stadium flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-cream mb-4">HARDWOOD MANAGER</h1>
          <p className="font-mono text-muted/60 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  const showLayout = hasSavedGame && !isNewGame && !isLandingPage
  const showLanding = !hasSavedGame || isLandingPage

  const content = (
    <Routes location={location} key={location.pathname}>
      {showLanding ? (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new-game" element={<NewGame />} />
          <Route path="/database-setup" element={<DatabaseSetup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {appRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<ErrorBoundary>{element}</ErrorBoundary>} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )

  return (
    <ErrorBoundary>
      <GameProvider>
        <CinematicProvider>
          {showLayout ? (
            <Layout>
              <AnimatePresence mode="wait">{content}</AnimatePresence>
            </Layout>
          ) : (
            <AnimatePresence mode="wait">{content}</AnimatePresence>
          )}
          {showLayout && <CinematicOverlay />}
        </CinematicProvider>
      </GameProvider>
    </ErrorBoundary>
  )
}
