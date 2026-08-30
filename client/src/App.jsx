import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Visualizer from './pages/Visualizer'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import About from './pages/About'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-slate-900 tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold shadow-xs">
            AV
          </span>
          <span>AlgoVista</span>
        </Link>

        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
          <Link
            to="/"
            className={`transition hover:text-blue-600 ${isActive('/') && location.pathname === '/' ? 'text-blue-600 font-bold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/visualizer/bubble-sort"
            className={`transition hover:text-blue-600 ${isActive('/visualizer') ? 'text-blue-600 font-bold' : ''}`}
          >
            Visualizer
          </Link>
          <Link
            to="/dashboard"
            className={`transition hover:text-blue-600 ${isActive('/dashboard') || isActive('/progress') ? 'text-blue-600 font-bold' : ''}`}
          >
            Progress
          </Link>
          <Link
            to="/about"
            className={`transition hover:text-blue-600 ${isActive('/about') ? 'text-blue-600 font-bold' : ''}`}
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">
                Hi, <strong className="text-slate-900">{user?.name || 'Learner'}</strong>
              </span>
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3.5 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 shadow-xs"
            >
              Login / Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visualizer" element={<Visualizer />} />
          <Route path="/visualizer/:slug" element={<Visualizer />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/progress"
            element={(
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>
    </div>
  )
}
