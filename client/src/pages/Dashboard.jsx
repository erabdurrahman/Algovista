import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { algorithmsData } from '../algorithms/algorithmsData'

export default function Dashboard() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progressData, setProgressData] = useState({
    stats: {
      totalAlgorithms: 7,
      completedCount: 0,
      overallProgress: 0,
      totalPractices: 0,
    },
    categoryStats: {
      Sorting: { total: 3, completed: 0, percentage: 0 },
      Searching: { total: 2, completed: 0, percentage: 0 },
      Graph: { total: 2, completed: 0, percentage: 0 },
    },
    algorithms: algorithmsData.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      difficulty: a.difficulty,
      description: a.description,
      slug: a.slug,
      completed: false,
      practiceCount: 0,
      lastPracticed: null,
    })),
  })

  useEffect(() => {
    let isMounted = true
    const fetchProgress = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getProgress(token)
        if (isMounted) {
          setProgressData(data)
        }
      } catch (err) {
        console.warn('Could not fetch server progress, using local defaults:', err.message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProgress()
    return () => {
      isMounted = false
    }
  }, [token])

  const { stats, categoryStats, algorithms } = progressData

  // Identify next uncompleted algorithm for "Continue Learning"
  const nextAlgo = algorithms.find((a) => !a.completed) || algorithms[0]

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading progress dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Learner'} 👋
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Track your algorithmic mastery, practice step-by-step visualizations, and learn DSA systematically.
            </p>
          </div>

          {nextAlgo && (
            <Link
              to={`/visualizer/${nextAlgo.slug}`}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Continue with {nextAlgo.name} →
            </Link>
          )}
        </div>

        {/* Top Metric Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Overall Progress</span>
            <p className="mt-1 text-2xl font-black text-cyan-400">{stats.overallProgress}%</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
              <div
                style={{ width: `${stats.overallProgress}%` }}
                className="h-full bg-cyan-400 transition-all duration-500"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Completed Algorithms</span>
            <p className="mt-1 text-2xl font-black text-emerald-400">
              {stats.completedCount} <span className="text-sm font-normal text-slate-400">/ {stats.totalAlgorithms}</span>
            </p>
          </div>

          <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Practice Sessions</span>
            <p className="mt-1 text-2xl font-black text-amber-400">{stats.totalPractices}</p>
          </div>

          <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Supported Topics</span>
            <p className="mt-1 text-2xl font-black text-purple-400">3 Categories</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </p>
      )}

      {/* 2. Category Progress Section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Category Progress</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {Object.entries(categoryStats).map(([catName, data]) => (
            <div key={catName} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{catName}</span>
                <span className="font-mono text-blue-600">{data.completed} / {data.total} ({data.percentage}%)</span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${data.percentage}%` }}
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Algorithms Grid */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Curriculum & Practice</h2>
            <p className="text-xs text-slate-500">
              Select an algorithm to launch the interactive visualizer and test custom inputs.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((algo) => (
            <div
              key={algo.slug}
              className={`flex flex-col justify-between rounded-xl border p-5 transition ${
                algo.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      algo.completed ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {algo.completed ? '✓ Completed' : '○ Incomplete'}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {algo.category}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{algo.name}</h3>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">{algo.description}</p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Practices: <strong className="text-slate-800">{algo.practiceCount || 0}</strong></span>
                  <span>{algo.lastPracticed ? new Date(algo.lastPracticed).toLocaleDateString() : 'Not yet'}</span>
                </div>

                <Link
                  to={`/visualizer/${algo.slug}`}
                  className="mt-3 block w-full rounded-lg bg-slate-900 py-2 text-center text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  {algo.completed ? 'Practice Again' : 'Start Visualizer'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
