import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Beginner-Friendly DSA Learning</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900">Visualize Data Structures and Algorithms the Simple Way</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        AlgoVista helps B.Tech students practice and understand DSA concepts using clean visual explanations and quick coding support.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/learn"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Start Learning
        </Link>
        <Link
          to="/auth"
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
        >
          Login/Register
        </Link>
      </div>
    </section>
  )
}
