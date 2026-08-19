import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { saveSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = location.state?.from || '/learn'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = mode === 'register' ? { name, email, password } : { email, password }
      const data = mode === 'register' ? await api.register(payload) : await api.login(payload)
      saveSession(data.token, data.user)
      navigate(redirectTo)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900">{mode === 'login' ? 'Login' : 'Create Account'}</h1>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'New user? Register' : 'Already have an account? Login'}
        </button>
      </div>

      <p className="mt-3 text-slate-600">Sign in to track progress, save practice code, and use AI code explainer.</p>

      <form className="mt-6 grid gap-4 md:max-w-md" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Name"
            className="rounded-lg border border-slate-300 p-3 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="rounded-lg border border-slate-300 p-3 text-sm"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-lg border border-slate-300 p-3 text-sm"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </section>
  )
}
