import { Link } from 'react-router-dom'
import { algorithmsData } from '../algorithms/algorithmsData'

export default function Home() {
  const categories = [
    {
      name: 'Sorting Algorithms',
      description: 'Master in-place comparisons, passes, and swapping mechanisms.',
      algorithms: algorithmsData.filter((a) => a.category === 'Sorting'),
      icon: '📊',
    },
    {
      name: 'Searching Algorithms',
      description: 'Understand sequential scans vs logarithmic interval division.',
      algorithms: algorithmsData.filter((a) => a.category === 'Searching'),
      icon: '🔍',
    },
    {
      name: 'Graph Traversal',
      description: 'Learn queue-based level-order and stack-based recursive exploration.',
      algorithms: algorithmsData.filter((a) => a.category === 'Graph'),
      icon: '🕸️',
    },
  ]

  const features = [
    {
      title: 'Interactive Step Visualizer',
      description: 'Step forwards and backwards through algorithm execution states with array bars and SVG graph rendering.',
      icon: '▶️',
    },
    {
      title: 'Synchronized Code Highlighting',
      description: 'See the exact line of JavaScript executing in real-time as elements compare, swap, and visit.',
      icon: '💻',
    },
    {
      title: 'AI Algorithm Tutor',
      description: 'Ask AI to explain individual steps, real-life intuitive analogies, and complexity trade-offs on demand.',
      icon: '🤖',
    },
    {
      title: 'Dynamic Progress Tracking',
      description: 'Track your practice counts, completion statuses, and overall DSA curriculum mastery automatically.',
      icon: '📈',
    },
  ]

  return (
    <div className="space-y-12 pb-10">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            ✨ Interactive DSA Learning Platform
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Master Data Structures & Algorithms Visually.
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Algovista helps students understand algorithms through step-by-step visualizations, line-by-line code tracing, custom inputs, and instant AI explanations.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/visualizer/bubble-sort"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Start Visualizing →
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              View Progress
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Feature Highlights */}
      <section>
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Why Learn with Algovista?</h2>
          <p className="mt-1 text-xs text-slate-500">
            Designed specifically for students preparing for exams, interviews, and project presentations.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-4 text-base font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Supported Algorithm Categories */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Curriculum Categories</h2>
          <p className="mt-1 text-xs text-slate-500">Explore the 7 foundational sorting, searching, and graph algorithms.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.name} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div>
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{cat.name}</h3>
                <p className="mt-1 text-xs text-slate-600">{cat.description}</p>

                <div className="mt-4 space-y-2">
                  {cat.algorithms.map((algo) => (
                    <Link
                      key={algo.slug}
                      to={`/visualizer/${algo.slug}`}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                      <span>{algo.name}</span>
                      <span className="text-[11px] font-normal text-slate-500">{algo.difficulty} →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
