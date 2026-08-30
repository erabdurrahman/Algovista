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
  const nextAlgo = algorithms.find((a) => !a.completed) || algorithms[0]

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading progress dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-10 text-white shadow-md border border-slate-800">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
              Welcome back, {user?.name || 'Learner'} 👋
            </h1>
            <p className="mt-2 text-xs text-slate-300 max-w-xl leading-relaxed">
              Track your algorithmic mastery, practice step-by-step visualizations, compare algorithmic efficiency, and monitor curriculum completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {nextAlgo && (
              <Link
                to={`/visualizer/${nextAlgo.slug}`}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Continue with {nextAlgo.name} →
              </Link>
            )}
            <Link
              to="/visualizer"
              className="rounded-2xl border border-indigo-500/40 bg-indigo-950/40 px-5 py-3 text-xs font-bold text-indigo-300 transition hover:bg-indigo-900/60"
            >
              ⚡ Compare Algorithms
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Overall Progress</span>
            <p className="mt-1 text-2xl font-black text-cyan-400">{stats.overallProgress}%</p>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${stats.overallProgress}%` }}
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Completed Topics</span>
            <p className="mt-1 text-2xl font-black text-emerald-400">
              {stats.completedCount} <span className="text-sm font-normal text-slate-400">/ {stats.totalAlgorithms}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Practice Executions</span>
            <p className="mt-1 text-2xl font-black text-amber-400">{stats.totalPractices}</p>
          </div>

          <div className="rounded-2xl bg-slate-900/90 p-4 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Curriculum Areas</span>
            <p className="mt-1 text-2xl font-black text-purple-400">3 Core Fields</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      {/* 2. Category Progress Section */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Category Progress</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Object.entries(categoryStats).map(([catName, data]) => (
            <div key={catName} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{catName}</span>
                <span className="font-mono text-blue-600">{data.completed} / {data.total} ({data.percentage}%)</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
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
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Curriculum & Practice Status</h2>
          <p className="text-xs text-slate-500">
            Select an algorithm to launch the interactive visualizer, test custom inputs, and ask AI for step explanations.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((algo) => (
            <div
              key={algo.slug}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
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
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {algo.category}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{algo.name}</h3>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">{algo.description}</p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Practices: <strong className="text-slate-800 font-mono">{algo.practiceCount || 0}</strong></span>
                  <span>{algo.lastPracticed ? new Date(algo.lastPracticed).toLocaleDateString() : 'Not practiced'}</span>
                </div>

                <Link
                  to={`/visualizer/${algo.slug}`}
                  className="mt-3 block w-full rounded-xl bg-slate-900 py-2 text-center text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  {algo.completed ? 'Practice Again' : 'Launch Visualizer'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
