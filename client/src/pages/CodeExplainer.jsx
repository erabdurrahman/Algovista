import { useState } from 'react'

export default function CodeExplainer() {
  const [code, setCode] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const explainCode = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain code')
      }

      setExplanation(data.explanation)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Code Explainer</h1>
      <p className="mt-3 text-slate-600">Paste your DSA code and get a beginner-friendly explanation from AI.</p>

      <form onSubmit={explainCode} className="mt-6 space-y-4">
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          rows={8}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm"
          placeholder="Paste code here"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Explaining...' : 'Explain Code'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {explanation && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Explanation</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{explanation}</p>
        </div>
      )}
    </section>
  )
}
