import { Link } from 'react-router-dom'

export default function About() {
  const superpowers = [
    {
      icon: '👁️',
      title: 'Visual Step-by-Step Clarity',
      description:
        'Watch algorithms think in real time. See numbers compare, swap, and settle into place with synchronized code line tracing so you never have to memorize dry syntax again.',
      tag: 'Intuitive Learning',
      accent: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    },
    {
      icon: '⚡',
      title: 'Side-by-Side Battle Arena',
      description:
        'Pit two algorithms against each other on the exact same array. See firsthand why Insertion Sort defeats Bubble Sort on nearly-sorted data through live, verified operation counters.',
      tag: 'Direct Comparison',
      accent: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
    },
    {
      icon: '🤖',
      title: '24/7 AI Algorithm Mentor',
      description:
        'Never stay stuck on a tricky step. Ask your AI Tutor real-time questions like "Why did these swap?", "Give me a real-life analogy", or "Explain like I am 10 years old".',
      tag: 'Powered by Gemini',
      accent: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
    {
      icon: '📈',
      title: 'Personal Mastery Tracker',
      description:
        'Monitor your learning journey across Sorting, Searching, and Graph Traversals. Track completed topics and total practice runs to build unshakable confidence for exams.',
      tag: 'Progress & Goals',
      accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
  ]

  const journeySteps = [
    {
      num: '01',
      title: 'Choose a Topic',
      desc: 'Pick from 7 essential curriculum algorithms across Sorting, Searching, and Graph Traversals.',
    },
    {
      num: '02',
      title: 'Test Your Own Numbers',
      desc: 'Input your own custom arrays, try sorted or reverse distributions, and watch how the algorithm responds.',
    },
    {
      num: '03',
      title: 'Control The Flow',
      desc: 'Play, pause, rewind, or slow down execution to 0.5x to observe every single comparison and pointer shift.',
    },
    {
      num: '04',
      title: 'Ask AI & Master Intuition',
      desc: 'Ask why decisions happen and learn how these concepts power real-world systems like Google Maps and LinkedIn.',
    },
  ]

  const studentAudiences = [
    {
      emoji: '🎓',
      role: 'College & University Students',
      benefit: 'Ace your Data Structures semester exams, lab practicals, and viva questions with crystal-clear conceptual clarity.',
    },
    {
      emoji: '💼',
      role: 'Placement & Job Aspirants',
      benefit: 'Demystify Time/Space Complexity trade-offs and build strong problem-solving intuition for technical interviews.',
    },
    {
      emoji: '🚀',
      role: 'Self-Taught Developers & Beginners',
      benefit: 'Eliminate the frustration of dry textbook code with interactive animations, real-life analogies, and zero unnecessary jargon.',
    },
  ]

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-14 text-white shadow-xl border border-slate-800">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
            💡 The Story Behind Algovista
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl text-white">
            Algorithms Shouldn&apos;t Feel Like <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">Magic Tricks.</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            For years, students have struggled with rote memorization of algorithms from static textbooks and confusing code snippets. 
            <strong> Algovista</strong> was born out of a simple mission: <span className="text-white font-semibold">to turn abstract algorithmic logic into interactive, beautiful, and intuitive visual stories.</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/visualizer/bubble-sort"
              className="rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-blue-500/25"
            >
              Start Visualizing Now →
            </Link>
            <Link
              to="/visualizer"
              className="rounded-2xl border border-indigo-500/40 bg-indigo-950/40 px-6 py-3.5 text-xs font-bold text-indigo-300 transition hover:bg-indigo-900/60"
            >
              ⚡ Try Algorithm Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* 2. The 4 Superpowers */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Why Students Love Algovista</span>
          <h2 className="mt-1 text-3xl font-black text-slate-900">Your Complete Visual Playground</h2>
          <p className="mt-2 text-xs text-slate-500">
            Everything you need to master Data Structures & Algorithms without feeling overwhelmed.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {superpowers.map((power) => (
            <div
              key={power.title}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{power.icon}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                  {power.tag}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{power.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{power.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The 4-Step Learning Journey */}
      <section className="rounded-3xl bg-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-md">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">How It Works</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">The 4-Step Mastery Journey</h2>
          <p className="mt-2 text-xs text-slate-400">
            A frictionless learning path designed to take you from a curious beginner to a confident algorithm master.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step) => (
            <div key={step.num} className="rounded-2xl bg-slate-900/90 p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="font-mono text-2xl font-black text-cyan-400">{step.num}</span>
                <h4 className="mt-3 text-sm font-bold text-white">{step.title}</h4>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Who is Algovista for? */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Built For Learners</span>
          <h2 className="mt-1 text-3xl font-black text-slate-900">Who is Algovista For?</h2>
          <p className="mt-2 text-xs text-slate-500">
            Tailored specifically for anyone looking to build a rock-solid foundation in computer science.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {studentAudiences.map((aud) => (
            <div
              key={aud.role}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div>
                <span className="text-3xl">{aud.emoji}</span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{aud.role}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{aud.benefit}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white text-center shadow-lg">
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Ready to Fall in Love with Algorithms?
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
          Stop staring at confusing dry code. Experience how algorithms actually work, test your own inputs, and ask your AI tutor anything.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/visualizer/bubble-sort"
            className="rounded-2xl bg-white px-7 py-3.5 text-xs font-black text-slate-950 shadow-md transition hover:bg-slate-100"
          >
            Launch Visualizer →
          </Link>
          <Link
            to="/dashboard"
            className="rounded-2xl border border-white/40 bg-white/10 px-7 py-3.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
          >
            View Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
