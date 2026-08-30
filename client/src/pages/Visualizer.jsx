import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { algorithmsData, defaultGraph } from '../algorithms/algorithmsData'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Visualizer() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { token, isAuthenticated } = useAuth()

  // Selected algorithm
  const currentAlgo = useMemo(() => {
    return algorithmsData.find((a) => a.slug === slug) || algorithmsData[0]
  }, [slug])

  // Custom Input State
  const [arrayInput, setArrayInput] = useState(() => (currentAlgo.defaultArray ? currentAlgo.defaultArray.join(', ') : ''))
  const [targetInput, setTargetInput] = useState(() => (currentAlgo.defaultTarget !== undefined ? String(currentAlgo.defaultTarget) : '10'))
  const [startNode, setStartNode] = useState(() => (currentAlgo.defaultStartNode || 'A'))
  const [inputError, setInputError] = useState('')

  // Steps & Animation State
  const [steps, setSteps] = useState([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(800) // ms per step

  // AI Explainer State
  const [aiLoading, setAiLoading] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiError, setAiError] = useState('')

  // Progress update state
  const [completing, setCompleting] = useState(false)
  const [completedSuccess, setCompletedSuccess] = useState('')

  const timerRef = useRef(null)

  // Generate execution steps based on inputs
  const computeSteps = useCallback((customArray, customTarget, customStart) => {
    try {
      if (currentAlgo.category === 'Sorting') {
        const arr = customArray.map(Number)
        return currentAlgo.generateSteps({ array: arr })
      } else if (currentAlgo.category === 'Searching') {
        const arr = customArray.map(Number)
        const tgt = Number(customTarget)
        return currentAlgo.generateSteps({ array: arr, target: tgt })
      } else if (currentAlgo.category === 'Graph') {
        return currentAlgo.generateSteps({ graph: defaultGraph, startNode: customStart })
      }
      return []
    } catch (err) {
      setInputError('Failed to generate steps: ' + err.message)
      return []
    }
  }, [currentAlgo])

  // Sync inputs and initial steps when algorithm changes
  useEffect(() => {
    const defaultArr = currentAlgo.defaultArray || []
    const defaultTgt = currentAlgo.defaultTarget !== undefined ? String(currentAlgo.defaultTarget) : '10'
    const defaultStart = currentAlgo.defaultStartNode || 'A'

    setArrayInput(defaultArr.join(', '))
    setTargetInput(defaultTgt)
    setStartNode(defaultStart)
    setInputError('')
    setAiExplanation('')
    setCompletedSuccess('')
    setIsPlaying(false)

    const generated = computeSteps(defaultArr, defaultTgt, defaultStart)
    setSteps(generated)
    setCurrentStepIndex(0)
  }, [currentAlgo, computeSteps])

  // Animation player loop
  useEffect(() => {
    if (isPlaying) {
      if (currentStepIndex < steps.length - 1) {
        timerRef.current = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1)
        }, playbackSpeed)
      } else {
        setIsPlaying(false)
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeed])

  // Custom Input Apply
  const handleApplyInput = (e) => {
    if (e) e.preventDefault()
    setInputError('')

    if (currentAlgo.category !== 'Graph') {
      const rawValues = arrayInput.split(',').map((s) => s.trim()).filter(Boolean)
      if (rawValues.length === 0) {
        setInputError('Please enter at least one number.')
        return
      }
      if (rawValues.length > 30) {
        setInputError('Maximum 30 elements allowed for clear visualization.')
        return
      }
      const numbers = rawValues.map(Number)
      if (numbers.some((n) => isNaN(n))) {
        setInputError('Input contains invalid numbers. Use comma-separated numbers (e.g. 5, 2, 8, 1, 9).')
        return
      }

      if (currentAlgo.category === 'Searching' && (targetInput === '' || isNaN(Number(targetInput)))) {
        setInputError('Please provide a valid numeric search target.')
        return
      }

      const generated = computeSteps(numbers, targetInput, startNode)
      setSteps(generated)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    } else {
      const generated = computeSteps([], targetInput, startNode)
      setSteps(generated)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    }
  }

  // Random array generator
  const handleGenerateRandom = () => {
    const size = Math.floor(Math.random() * 6) + 6 // 6 to 11 elements
    const randoms = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
    setArrayInput(randoms.join(', '))
    let nextTarget = targetInput
    if (currentAlgo.category === 'Searching') {
      const randomTarget = randoms[Math.floor(Math.random() * randoms.length)]
      nextTarget = String(randomTarget)
      setTargetInput(nextTarget)
    }
    const generated = computeSteps(randoms, nextTarget, startNode)
    setSteps(generated)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setInputError('')
  }

  // Playback handlers
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setCurrentStepIndex(0)
  }

  const togglePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0)
    }
    setIsPlaying((prev) => !prev)

    // Record practice session when user plays
    if (isAuthenticated && token) {
      api.updateProgress(token, { algorithmSlug: currentAlgo.slug, incrementPractice: 1 }).catch(() => {})
    }
  }

  // Current step state
  const currentStep = steps[currentStepIndex] || {
    array: currentAlgo.defaultArray || [],
    comparing: [],
    explanation: 'Ready to start.',
    codeLine: 1,
  }

  // Max value in array for bar scaling
  const maxArrayVal = useMemo(() => {
    if (!currentStep.array || currentStep.array.length === 0) return 100
    return Math.max(...currentStep.array, 10)
  }, [currentStep.array])

  // AI Explainer Request
  const requestAiExplanation = async (type) => {
    setAiLoading(true)
    setAiError('')
    setAiExplanation('')

    try {
      const payload = {
        type,
        algorithm: currentAlgo.name,
        currentStep: currentStepIndex + 1,
        totalSteps: steps.length,
        array: currentStep.array,
        comparing: currentStep.comparing,
        action: currentStep.action,
        explanation: currentStep.explanation,
        target: currentStep.target !== undefined ? currentStep.target : targetInput,
        node: currentStep.currentNode,
        codeLine: currentStep.codeLine,
      }

      const res = await api.explain(payload)
      setAiExplanation(res.explanation)
    } catch (err) {
      setAiError(err.message || 'AI explanation unavailable. Please check server.')
    } finally {
      setAiLoading(false)
    }
  }

  // Mark Completed
  const handleMarkCompleted = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/visualizer/${currentAlgo.slug}` } })
      return
    }

    setCompleting(true)
    setCompletedSuccess('')
    try {
      await api.updateProgress(token, {
        algorithmSlug: currentAlgo.slug,
        completed: true,
        incrementPractice: 1,
      })
      setCompletedSuccess(`🎉 "${currentAlgo.name}" marked as completed!`)
    } catch (err) {
      setInputError(err.message)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Algorithm Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {algorithmsData.map((algo) => {
            const isSelected = algo.slug === currentAlgo.slug
            return (
              <button
                key={algo.slug}
                onClick={() => navigate(`/visualizer/${algo.slug}`)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {algo.name}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {currentAlgo.category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              currentAlgo.difficulty === 'Easy'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {currentAlgo.difficulty}
          </span>
        </div>
      </div>

      {/* 2. Main Algorithm Banner */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentAlgo.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{currentAlgo.description}</p>
          </div>

          <button
            onClick={handleMarkCompleted}
            disabled={completing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {completing ? 'Saving...' : '✓ Mark as Completed'}
          </button>
        </div>

        {completedSuccess && (
          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700">
            {completedSuccess}
          </p>
        )}
      </div>

      {/* 3. Visualizer Canvas & Source Code (Side by Side) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Interactive Canvas (7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white shadow-md lg:col-span-7">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-medium tracking-wide uppercase text-slate-400">
                Visual Canvas ({currentAlgo.category})
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Step {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}
              </span>
            </div>

            {/* Canvas Area */}
            <div className="my-6 flex min-h-[260px] items-end justify-center rounded-xl bg-slate-950/60 p-4">
              {currentAlgo.category !== 'Graph' ? (
                /* Array Visualizer */
                <div className="flex w-full items-end justify-center gap-2 overflow-x-auto pb-2">
                  {currentStep.array?.map((val, idx) => {
                    const isComparing = currentStep.comparing?.includes(idx)
                    const isSorted = currentStep.sortedIndices?.includes(idx)
                    const isFound = currentStep.foundIndex === idx
                    const isMid = currentStep.mid === idx
                    const isLow = currentStep.low === idx
                    const isHigh = currentStep.high === idx
                    const isEliminated = currentStep.eliminated?.includes(idx)
                    const isMin = currentStep.minIndex === idx
                    const isKey = currentStep.keyIndex === idx

                    // Height calculation
                    const heightPercent = Math.max(18, Math.round((val / maxArrayVal) * 190))

                    let barBg = 'bg-slate-700 text-slate-200'
                    let label = ''

                    if (isFound) {
                      barBg = 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                      label = 'FOUND'
                    } else if (isSorted) {
                      barBg = 'bg-green-600 text-white'
                    } else if (isComparing) {
                      barBg = currentStep.swapped ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                      label = currentStep.swapped ? 'SWAP' : 'CMP'
                    } else if (isMin) {
                      barBg = 'bg-purple-500 text-white'
                      label = 'MIN'
                    } else if (isKey) {
                      barBg = 'bg-cyan-500 text-white'
                      label = 'KEY'
                    } else if (isMid) {
                      barBg = 'bg-indigo-500 text-white'
                      label = 'MID'
                    } else if (isEliminated) {
                      barBg = 'bg-slate-800 text-slate-600 opacity-40'
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5 transition-all duration-300">
                        {label && (
                          <span className="text-[10px] font-bold tracking-wider text-amber-400">
                            {label}
                          </span>
                        )}
                        <div
                          style={{ height: `${heightPercent}px`, minWidth: '32px' }}
                          className={`flex flex-col justify-end items-center rounded-lg p-1 text-center font-mono font-bold text-xs shadow-md transition-all duration-300 ${barBg}`}
                        >
                          <span className="mb-1">{val}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          [{idx}]
                          {isLow && <span className="block text-indigo-400 font-bold">L</span>}
                          {isHigh && <span className="block text-purple-400 font-bold">H</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Graph Visualizer (SVG) */
                <div className="flex flex-col items-center w-full">
                  <svg viewBox="0 0 580 300" className="w-full max-w-[540px] h-[240px]">
                    {/* Edges */}
                    {defaultGraph.edges.map((edge, idx) => {
                      const u = defaultGraph.nodes.find((n) => n.id === edge.from)
                      const v = defaultGraph.nodes.find((n) => n.id === edge.to)
                      if (!u || !v) return null

                      const isActiveEdge =
                        (currentStep.activeEdge?.[0] === u.id && currentStep.activeEdge?.[1] === v.id) ||
                        (currentStep.activeEdge?.[0] === v.id && currentStep.activeEdge?.[1] === u.id)

                      return (
                        <line
                          key={idx}
                          x1={u.x}
                          y1={u.y}
                          x2={v.x}
                          y2={v.y}
                          stroke={isActiveEdge ? '#38bdf8' : '#334155'}
                          strokeWidth={isActiveEdge ? '4' : '2'}
                          strokeDasharray={isActiveEdge ? '4,4' : 'none'}
                          className="transition-all duration-300"
                        />
                      )
                    })}

                    {/* Nodes */}
                    {defaultGraph.nodes.map((node) => {
                      const isCurrent = currentStep.currentNode === node.id
                      const isVisited = currentStep.visited?.includes(node.id)
                      const inQueue = currentStep.queue?.includes(node.id)
                      const inStack = currentStep.stack?.includes(node.id)

                      let fill = '#1e293b' // default slate-800
                      let stroke = '#64748b'

                      if (isCurrent) {
                        fill = '#f59e0b' // amber
                        stroke = '#fef08a'
                      } else if (isVisited) {
                        fill = '#10b981' // emerald
                        stroke = '#6ee7b7'
                      } else if (inQueue || inStack) {
                        fill = '#6366f1' // indigo
                        stroke = '#a5b4fc'
                      }

                      return (
                        <g key={node.id} className="transition-all duration-300">
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isCurrent ? 24 : 20}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isCurrent ? 3 : 2}
                          />
                          <text
                            x={node.x}
                            y={node.y + 5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isCurrent ? 14 : 12}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {node.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* Graph Data Structures Info */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono mt-2">
                    {currentAlgo.slug === 'bfs' && (
                      <div className="rounded bg-slate-800 px-3 py-1.5 border border-slate-700">
                        <span className="text-cyan-400 font-bold">Queue (FIFO): </span>
                        [{currentStep.queue?.join(', ') || 'empty'}]
                      </div>
                    )}
                    {currentAlgo.slug === 'dfs' && (
                      <div className="rounded bg-slate-800 px-3 py-1.5 border border-slate-700">
                        <span className="text-cyan-400 font-bold">Call Stack (LIFO): </span>
                        [{currentStep.stack?.join(' ➔ ') || 'empty'}]
                      </div>
                    )}
                    <div className="rounded bg-slate-800 px-3 py-1.5 border border-slate-700">
                      <span className="text-emerald-400 font-bold">Visited: </span>
                      [{currentStep.visited?.join(', ') || 'none'}]
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Explanation Banner */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Current Step:</span>
              <p className="mt-1 text-sm font-medium text-slate-100">{currentStep.explanation}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0 || isPlaying}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                ⏮ Prev Step
              </button>

              <button
                onClick={togglePlay}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  isPlaying ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIndex >= steps.length - 1 || isPlaying}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                Next Step ⏭
              </button>

              <button
                onClick={handleReset}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                ↺ Reset
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value={1500}>0.5x (Slow)</option>
                <option value={800}>1.0x (Normal)</option>
                <option value={350}>2.0x (Fast)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Source Code Viewer (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-500">
                Source Code Highlight
              </span>
              <span className="text-xs text-slate-400 font-mono">JavaScript</span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs">
              {currentAlgo.sourceCode.map((lineObj) => {
                const isActive = currentStep.codeLine === lineObj.line
                return (
                  <div
                    key={lineObj.line}
                    className={`flex items-center gap-3 px-2 py-0.5 rounded transition-colors ${
                      isActive ? 'bg-blue-600/30 text-cyan-300 font-semibold ring-1 ring-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <span className="w-5 select-none text-right text-[11px] text-slate-600">{lineObj.line}</span>
                    <span className="whitespace-pre">{lineObj.text}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Real-Life Analogy Box */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Real-Life Analogy</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{currentAlgo.realLifeAnalogy}</p>
          </div>
        </div>
      </div>

      {/* 4. Custom Input Panel */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Custom Input</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter custom data to watch how {currentAlgo.name} executes on your values.
        </p>

        <form onSubmit={handleApplyInput} className="mt-4 flex flex-wrap items-end gap-3">
          {currentAlgo.category !== 'Graph' ? (
            <>
              <div className="flex-1 min-w-[240px]">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Array Elements (comma-separated, max 30)
                </label>
                <input
                  type="text"
                  value={arrayInput}
                  onChange={(e) => setArrayInput(e.target.value)}
                  placeholder="e.g. 15, 3, 9, 24, 7"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {currentAlgo.category === 'Searching' && (
                <div className="w-32">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Search Target
                  </label>
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="Target"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="w-48">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Root Starting Node
              </label>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {defaultGraph.nodes.map((n) => (
                  <option key={n.id} value={n.id}>Node {n.label}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Apply & Visualize
          </button>

          {currentAlgo.category !== 'Graph' && (
            <button
              type="button"
              onClick={handleGenerateRandom}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              🎲 Randomize
            </button>
          )}
        </form>

        {inputError && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {inputError}
          </p>
        )}
      </div>

      {/* 5. Complexity Analysis Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Best Case Time</span>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">{currentAlgo.timeComplexity.best}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Average Case Time</span>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">{currentAlgo.timeComplexity.average}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Worst Case Time</span>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">{currentAlgo.timeComplexity.worst}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Space Complexity</span>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900">{currentAlgo.spaceComplexity}</p>
        </div>
      </div>

      {/* 6. AI Explainer Panel */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Algorithm Tutor</h2>
              <p className="text-xs text-slate-500">
                Ask the AI to explain the current step, provide intuition, or clarify complexity trade-offs.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Prompt Trigger Buttons */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => requestAiExplanation('algorithm')}
            disabled={aiLoading}
            className="rounded-xl border border-indigo-200 bg-white p-3 text-left text-xs font-semibold text-slate-800 shadow-xs transition hover:border-indigo-400 hover:bg-indigo-50/50 disabled:opacity-50"
          >
            💡 Explain This Algorithm
          </button>
          <button
            onClick={() => requestAiExplanation('step')}
            disabled={aiLoading}
            className="rounded-xl border border-indigo-200 bg-white p-3 text-left text-xs font-semibold text-slate-800 shadow-xs transition hover:border-indigo-400 hover:bg-indigo-50/50 disabled:opacity-50"
          >
            🔍 Explain This Step
          </button>
          <button
            onClick={() => requestAiExplanation('real-life')}
            disabled={aiLoading}
            className="rounded-xl border border-indigo-200 bg-white p-3 text-left text-xs font-semibold text-slate-800 shadow-xs transition hover:border-indigo-400 hover:bg-indigo-50/50 disabled:opacity-50"
          >
            🌍 Give Real-Life Example
          </button>
          <button
            onClick={() => requestAiExplanation('complexity')}
            disabled={aiLoading}
            className="rounded-xl border border-indigo-200 bg-white p-3 text-left text-xs font-semibold text-slate-800 shadow-xs transition hover:border-indigo-400 hover:bg-indigo-50/50 disabled:opacity-50"
          >
            ⏱️ Explain Complexity
          </button>
        </div>

        {/* AI Output Viewport */}
        {aiLoading && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-white p-4 border border-indigo-100">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="text-xs text-indigo-900 font-medium">Generating student-friendly explanation...</span>
          </div>
        )}

        {aiError && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {aiError}
          </p>
        )}

        {aiExplanation && (
          <div className="mt-5 rounded-xl border border-indigo-100 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">AI Tutor Response</span>
            <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-800 font-sans">
              {aiExplanation}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
