import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Learn from './pages/Learn'
import CodeExplainer from './pages/CodeExplainer'
import Auth from './pages/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-slate-900">AlgoVista</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
          <Link to="/learn" className="hover:text-blue-600">Learn</Link>
          <Link to="/code-explainer" className="hover:text-blue-600">Code Explainer</Link>
          {isAuthenticated ? (
            <>
              <span className="text-slate-500">Hi, {user?.name}</span>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="hover:text-blue-600">Login/Register</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/learn"
            element={(
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/code-explainer"
            element={(
              <ProtectedRoute>
                <CodeExplainer />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>
    </div>
  )
}
