import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Learn() {
  const { token } = useAuth()

  const [topics, setTopics] = useState([])
  const [progress, setProgress] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({ completedTopics: 0, totalTopics: 0, completionRate: 0, streakDays: 0 })
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('JavaScript')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const progressMap = useMemo(
    () => new Map(progress.map((entry) => [entry.topicId, entry])),
    [progress],
  )

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) || topics[0] || null,
    [topics, selectedTopicId],
  )

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [topicData, progressData, submissionData] = await Promise.all([
          api.listTopics(),
          api.getProgress(token),
          api.listSubmissions(token),
        ])
        setTopics(topicData.topics)
        setProgress(progressData.progress)
        setStats(progressData.stats)
        setSubmissions(submissionData.submissions)
        if (topicData.topics.length > 0) {
          setSelectedTopicId(topicData.topics[0].id)
        }
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  const refreshProgress = async () => {
    const data = await api.getProgress(token)
    setProgress(data.progress)
    setStats(data.stats)
  }

  const markComplete = async (topicId) => {
    setSaving(true)
    setFeedback('')
    setError('')
    try {
      await api.markTopicComplete(token, topicId)
      await refreshProgress()
      setFeedback('Topic marked as completed.')
    } catch (markError) {
      setError(markError.message)
    } finally {
      setSaving(false)
    }
  }

  const submitPractice = async (event) => {
    event.preventDefault()
    if (!selectedTopic) return

    setSaving(true)
    setFeedback('')
    setError('')

    try {
      const data = await api.addSubmission(token, {
        topicId: selectedTopic.id,
        code,
        language,
        notes,
      })

      setSubmissions((prev) => [data.submission, ...prev].slice(0, 100))
      await refreshProgress()
      setCode('')
      setNotes('')
      setFeedback('Practice submission saved.')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="rounded-2xl bg-white p-8 shadow-sm text-sm text-slate-600">Loading learning dashboard...</section>
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Learn DSA</h1>
        <p className="mt-3 text-slate-600">Track progress, complete topics, and save your practice attempts.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Completed" value={`${stats.completedTopics}/${stats.totalTopics}`} />
          <StatCard label="Completion Rate" value={`${stats.completionRate}%`} />
          <StatCard label="Current Streak" value={`${stats.streakDays} day(s)`} />
          <StatCard label="Saved Submissions" value={String(submissions.length)} />
        </div>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {feedback && <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{feedback}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Curriculum</h2>
          <div className="mt-4 space-y-3">
            {topics.map((topic) => {
              const entry = progressMap.get(topic.id)
              const isCompleted = Boolean(entry?.completedAt)

              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selectedTopic?.id === topic.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{topic.title}</p>
                    <span className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-slate-500'}`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{topic.level} • {topic.estimatedMinutes} mins</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {!selectedTopic ? (
            <p className="text-sm text-slate-600">No topic selected.</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{selectedTopic.title}</h2>
              <p className="mt-2 text-sm text-slate-700">{selectedTopic.theory}</p>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900">Examples</h3>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                  {selectedTopic.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 text-sm text-slate-700"><span className="font-semibold">Complexity:</span> {selectedTopic.complexitySummary}</p>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900">Practice Problems</h3>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {selectedTopic.practiceProblems.map((problem) => (
                    <li key={problem.title}>
                      {problem.title} <span className="text-xs text-slate-500">({problem.difficulty})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={() => markComplete(selectedTopic.id)}
                disabled={saving}
              >
                Mark as Complete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Save Practice Submission</h2>

        <form className="mt-4 grid gap-3" onSubmit={submitPractice}>
          <select
            className="rounded-lg border border-slate-300 p-3 text-sm"
            value={selectedTopic?.id || ''}
            onChange={(event) => setSelectedTopicId(event.target.value)}
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.title}</option>
            ))}
          </select>

          <input
            type="text"
            className="rounded-lg border border-slate-300 p-3 text-sm"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="Language"
            required
          />

          <textarea
            rows={7}
            className="rounded-lg border border-slate-300 p-3 text-sm"
            placeholder="Paste your code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            minLength={5}
            maxLength={10000}
          />

          <textarea
            rows={3}
            className="rounded-lg border border-slate-300 p-3 text-sm"
            placeholder="Short notes (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={1000}
          />

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={saving || !selectedTopic}
          >
            {saving ? 'Saving...' : 'Save Submission'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Recent Submissions</h2>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No submissions yet. Start practicing to build your history.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {submissions.slice(0, 8).map((submission) => {
              const topic = topics.find((item) => item.id === submission.topicId)
              return (
                <article key={submission.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{topic?.title || 'Topic'} • {submission.language}</p>
                  <p className="text-xs text-slate-500">{new Date(submission.createdAt).toLocaleString()}</p>
                  {submission.notes && <p className="mt-2 text-sm text-slate-700">{submission.notes}</p>}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
