import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { saveSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = location.state?.from || '/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.')
        }
        const data = await api.register({ name, email, password })
        saveSession(data.token, data.user)
      } else {
        const data = await api.login({ email, password })
        saveSession(data.token, data.user)
      }

      navigate(redirectTo)
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900">
            {mode === 'login' ? 'Welcome Back to Algovista' : 'Create Your Account'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {mode === 'login'
              ? 'Log in to track your algorithm progress and practice history.'
              : 'Sign up to begin your DSA mastery and track your journey.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => {
              setMode('register')
              setError('')
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Johnson"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. alex@example.com"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
