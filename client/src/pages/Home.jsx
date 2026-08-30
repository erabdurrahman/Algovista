import { Link } from 'react-router-dom'
import { algorithmsData } from '../algorithms/algorithmsData'

export default function Home() {
  const categories = [
    {
      name: 'Sorting Algorithms',
      description: 'Master in-place comparisons, passes, and swapping mechanisms.',
      algorithms: algorithmsData.filter((a) => a.category === 'Sorting'),
      icon: '📊',
      accent: 'border-blue-500/20 bg-blue-50/40',
    },
    {
      name: 'Searching Algorithms',
      description: 'Understand sequential scans vs logarithmic interval division.',
      algorithms: algorithmsData.filter((a) => a.category === 'Searching'),
      icon: '🔍',
      accent: 'border-indigo-500/20 bg-indigo-50/40',
    },
    {
      name: 'Graph Traversal',
      description: 'Learn queue-based level-order and stack-based recursive exploration.',
      algorithms: algorithmsData.filter((a) => a.category === 'Graph'),
      icon: '🕸️',
      accent: 'border-purple-500/20 bg-purple-50/40',
    },
  ]

  const features = [
    {
      title: 'Interactive Visualizer',
      description: 'Step forwards and backwards through algorithm execution states with animated bars and SVG graphs.',
      icon: '▶️',
    },
    {
      title: 'Side-by-Side Comparison',
      description: 'Execute two algorithms simultaneously on identical inputs with live metrics and efficiency matrices.',
      icon: '⚡',
    },
    {
      title: 'Input Complexity Analyzer',
      description: 'Analyze input characteristics (sorted, reverse, nearly-sorted, duplicates) and compare Big-O with actual operations.',
      icon: '📈',
    },
    {
      title: 'Conversational AI Tutor',
      description: 'Ask AI custom questions like "Why did these elements swap?" or get beginner-friendly intuitive explanations.',
      icon: '🤖',
    },
  ]

  return (
    <div className="space-y-12 pb-10">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-14 text-white shadow-xl border border-slate-800">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
            ✨ Interactive Full-Stack DSA Platform
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl text-white">
            Master Algorithms <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Visually & Comparatively.</span>
          </h1>
          <p className="mt-5 text-base text-slate-300 leading-relaxed max-w-2xl">
            Algovista helps students understand algorithms through discrete step animations, line-by-line code tracing, side-by-side algorithm comparisons, and conversational AI tutoring.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/visualizer/bubble-sort"
              className="rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-blue-500/25"
            >
              Launch Single Visualizer →
            </Link>
            <Link
              to="/visualizer"
              className="rounded-2xl border border-indigo-500/40 bg-indigo-950/40 px-6 py-3.5 text-xs font-bold text-indigo-300 transition hover:bg-indigo-900/60"
            >
              ⚡ Compare Two Algorithms
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Feature Highlights */}
      <section>
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900">Built for Intuitive Mastery</h2>
          <p className="mt-1 text-xs text-slate-500">
            Designed specifically for undergraduate computer science students preparing for exams and project vivas.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
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
          <h2 className="text-2xl font-black text-slate-900">Supported Curriculum</h2>
          <p className="mt-1 text-xs text-slate-500">Explore the 7 foundational sorting, searching, and graph algorithms.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200`}
            >
              <div>
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{cat.name}</h3>
                <p className="mt-1 text-xs text-slate-600">{cat.description}</p>

                <div className="mt-5 space-y-2">
                  {cat.algorithms.map((algo) => (
                    <Link
                      key={algo.slug}
                      to={`/visualizer/${algo.slug}`}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition hover:bg-blue-50 hover:text-blue-700 border border-slate-100"
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
