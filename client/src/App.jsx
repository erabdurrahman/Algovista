import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Learn from './pages/Learn'
import CodeExplainer from './pages/CodeExplainer'
import Auth from './pages/Auth'

function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-slate-900">AlgoVista</Link>
        <div className="flex gap-4 text-sm text-slate-700">
          <Link to="/learn" className="hover:text-blue-600">Learn</Link>
          <Link to="/code-explainer" className="hover:text-blue-600">Code Explainer</Link>
          <Link to="/auth" className="hover:text-blue-600">Login/Register</Link>
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
          <Route path="/learn" element={<Learn />} />
          <Route path="/code-explainer" element={<CodeExplainer />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  )
}
