import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { algorithmsData, defaultGraph } from '../algorithms/algorithmsData'
import { analyzeArrayInput } from '../algorithms/inputAnalysis'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Visualizer() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { token, isAuthenticated } = useAuth()

  // 1. Mode Toggle: 'single' vs 'compare'
  const [viewMode, setViewMode] = useState('single')

  // Selected algorithm for Single Mode
  const currentAlgo = useMemo(() => {
    return algorithmsData.find((a) => a.slug === slug) || algorithmsData[0]
  }, [slug])

  // Custom Input State
  const [arrayInput, setArrayInput] = useState(() => (currentAlgo.defaultArray ? currentAlgo.defaultArray.join(', ') : ''))
  const [targetInput, setTargetInput] = useState(() => (currentAlgo.defaultTarget !== undefined ? String(currentAlgo.defaultTarget) : '10'))
  const [startNode, setStartNode] = useState(() => (currentAlgo.defaultStartNode || 'A'))
  const [inputError, setInputError] = useState('')

  // Steps & Animation State (Single Mode)
  const [steps, setSteps] = useState([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(800) // ms per step

  // AI Explainer State
  const [aiLoading, setAiLoading] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiError, setAiError] = useState('')
  const [customQuestion, setCustomQuestion] = useState('')

  // Progress update state
  const [completing, setCompleting] = useState(false)
  const [completedSuccess, setCompletedSuccess] = useState('')

  // 2. Comparison Mode State
  const [compareCategory, setCompareCategory] = useState('Sorting')
  const [compareAlgo1Slug, setCompareAlgo1Slug] = useState('bubble-sort')
  const [compareAlgo2Slug, setCompareAlgo2Slug] = useState('insertion-sort')
  const [compareArrayInput, setCompareArrayInput] = useState('29, 10, 14, 37, 13, 8, 25')
  const [compareTargetInput, setCompareTargetInput] = useState('37')
  const [compareStartNode, setCompareStartNode] = useState('A')
  const [compareSteps1, setCompareSteps1] = useState([])
  const [compareSteps2, setCompareSteps2] = useState([])
  const [compareStepIndex1, setCompareStepIndex1] = useState(0)
  const [compareStepIndex2, setCompareStepIndex2] = useState(0)
  const [compareIsPlaying, setCompareIsPlaying] = useState(false)
  const [compareSpeed, setCompareSpeed] = useState(800)
  const [compareError, setCompareError] = useState('')

  const timerRef = useRef(null)
  const compareTimerRef = useRef(null)

  // Algorithms filtered by comparison category
  const availableCompareAlgos = useMemo(() => {
    return algorithmsData.filter((a) => a.category === compareCategory)
  }, [compareCategory])

  const compareAlgo1 = useMemo(() => {
    return algorithmsData.find((a) => a.slug === compareAlgo1Slug) || availableCompareAlgos[0]
  }, [compareAlgo1Slug, availableCompareAlgos])

  const compareAlgo2 = useMemo(() => {
    return algorithmsData.find((a) => a.slug === compareAlgo2Slug) || availableCompareAlgos[1] || availableCompareAlgos[0]
  }, [compareAlgo2Slug, availableCompareAlgos])

  // Generate execution steps based on inputs
  const computeStepsForAlgo = useCallback((algo, customArray, customTarget, customStart) => {
    try {
      if (algo.category === 'Sorting') {
        const arr = customArray.map(Number)
        return algo.generateSteps({ array: arr })
      } else if (algo.category === 'Searching') {
        const arr = customArray.map(Number)
        const tgt = Number(customTarget)
        return algo.generateSteps({ array: arr, target: tgt })
      } else if (algo.category === 'Graph') {
        return algo.generateSteps({ graph: defaultGraph, startNode: customStart })
      }
      return []
    } catch {
      return []
    }
  }, [])

  // Sync inputs and initial steps when algorithm changes (Single Mode)
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

    const generated = computeStepsForAlgo(currentAlgo, defaultArr, defaultTgt, defaultStart)
    setSteps(generated)
    setCurrentStepIndex(0)
  }, [currentAlgo, computeStepsForAlgo])

  // Sync comparison steps when comparison selections change
  const refreshCompareSteps = useCallback(() => {
    setCompareError('')
    try {
      let arr = compareArrayInput.split(',').map((s) => s.trim()).filter(Boolean).map(Number)
      if (compareCategory !== 'Graph') {
        if (arr.length === 0 || arr.some((n) => isNaN(n))) {
          arr = [29, 10, 14, 37, 13, 8, 25]
        }
      }

      const s1 = computeStepsForAlgo(compareAlgo1, arr, compareTargetInput, compareStartNode)
      const s2 = computeStepsForAlgo(compareAlgo2, arr, compareTargetInput, compareStartNode)

      setCompareSteps1(s1)
      setCompareSteps2(s2)
      setCompareStepIndex1(0)
      setCompareStepIndex2(0)
      setCompareIsPlaying(false)
    } catch (err) {
      setCompareError('Failed to generate comparison steps: ' + err.message)
    }
  }, [compareAlgo1, compareAlgo2, compareArrayInput, compareTargetInput, compareStartNode, compareCategory, computeStepsForAlgo])

  useEffect(() => {
    refreshCompareSteps()
  }, [compareCategory, compareAlgo1Slug, compareAlgo2Slug, refreshCompareSteps])

  // Animation player loop (Single Mode)
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

  // Animation player loop (Compare Mode)
  useEffect(() => {
    if (compareIsPlaying) {
      const max1 = compareSteps1.length - 1
      const max2 = compareSteps2.length - 1

      if (compareStepIndex1 < max1 || compareStepIndex2 < max2) {
        compareTimerRef.current = setTimeout(() => {
          setCompareStepIndex1((prev) => (prev < max1 ? prev + 1 : prev))
          setCompareStepIndex2((prev) => (prev < max2 ? prev + 1 : prev))
        }, compareSpeed)
      } else {
        setCompareIsPlaying(false)
      }
    }
    return () => {
      if (compareTimerRef.current) clearTimeout(compareTimerRef.current)
    }
  }, [compareIsPlaying, compareStepIndex1, compareStepIndex2, compareSteps1.length, compareSteps2.length, compareSpeed])

  // Current Step Objects
  const currentStep = steps[currentStepIndex] || {
    array: currentAlgo.defaultArray || [],
    comparing: [],
    explanation: 'Ready to start.',
    codeLine: 1,
    metrics: { comparisons: 0, swaps: 0, shifts: 0, arrayAccesses: 0 },
  }

  const currentCompareStep1 = compareSteps1[compareStepIndex1] || {
    array: [],
    comparing: [],
    explanation: 'Ready.',
    metrics: { comparisons: 0, swaps: 0, shifts: 0, arrayAccesses: 0 },
  }

  const currentCompareStep2 = compareSteps2[compareStepIndex2] || {
    array: [],
    comparing: [],
    explanation: 'Ready.',
    metrics: { comparisons: 0, swaps: 0, shifts: 0, arrayAccesses: 0 },
  }

  // Input characteristics analysis
  const inputAnalysis = useMemo(() => {
    if (currentAlgo.category === 'Graph') return null
    const parsed = arrayInput.split(',').map((s) => s.trim()).filter(Boolean).map(Number)
    return analyzeArrayInput(parsed)
  }, [arrayInput, currentAlgo.category])

  // Max value in array for bar scaling
  const maxArrayVal = useMemo(() => {
    if (!currentStep.array || currentStep.array.length === 0) return 100
    return Math.max(...currentStep.array, 10)
  }, [currentStep.array])

  // Apply Input Handlers
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

      const generated = computeStepsForAlgo(currentAlgo, numbers, targetInput, startNode)
      setSteps(generated)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    } else {
      const generated = computeStepsForAlgo(currentAlgo, [], targetInput, startNode)
      setSteps(generated)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    }
  }

  // Input Preset generators
  const setPresetArray = (type) => {
    let newArr = []
    if (type === 'random') {
      const size = Math.floor(Math.random() * 5) + 6
      newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10)
    } else if (type === 'sorted') {
      newArr = [5, 12, 19, 28, 35, 47, 56, 68, 80]
    } else if (type === 'reverse') {
      newArr = [85, 72, 60, 48, 35, 22, 11]
    } else if (type === 'nearly-sorted') {
      newArr = [10, 20, 40, 30, 50, 60, 80, 70]
    }

    setArrayInput(newArr.join(', '))
    if (currentAlgo.category === 'Searching') {
      setTargetInput(String(newArr[Math.floor(newArr.length / 2)]))
    }

    const generated = computeStepsForAlgo(currentAlgo, newArr, targetInput, startNode)
    setSteps(generated)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setInputError('')
  }

  // Playback handlers (Single Mode)
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

    if (isAuthenticated && token) {
      api.updateProgress(token, { algorithmSlug: currentAlgo.slug, incrementPractice: 1 }).catch(() => {})
    }
  }

  // Comparison Playback Handlers
  const handleCompareNext = () => {
    setCompareStepIndex1((prev) => (prev < compareSteps1.length - 1 ? prev + 1 : prev))
    setCompareStepIndex2((prev) => (prev < compareSteps2.length - 1 ? prev + 1 : prev))
  }

  const handleComparePrev = () => {
    setCompareStepIndex1((prev) => (prev > 0 ? prev - 1 : prev))
    setCompareStepIndex2((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleCompareReset = () => {
    setCompareIsPlaying(false)
    if (compareTimerRef.current) clearTimeout(compareTimerRef.current)
    setCompareStepIndex1(0)
    setCompareStepIndex2(0)
  }

  const toggleComparePlay = () => {
    const max1 = compareSteps1.length - 1
    const max2 = compareSteps2.length - 1
    if (compareStepIndex1 >= max1 && compareStepIndex2 >= max2) {
      setCompareStepIndex1(0)
      setCompareStepIndex2(0)
    }
    setCompareIsPlaying((prev) => !prev)
  }

  // AI Explainer Request
  const requestAiExplanation = async (userQuestion) => {
    const questionText = (typeof userQuestion === 'string' && userQuestion.trim()) ? userQuestion.trim() : customQuestion.trim()
    if (!questionText) {
      setAiError('Please enter a question for the AI tutor.')
      return
    }

    setAiLoading(true)
    setAiError('')
    setAiExplanation('')

    try {
      const payload = {
        question: questionText,
        algorithm: currentAlgo.name,
        input: currentAlgo.category === 'Graph' ? 'Default Graph (Nodes A-F)' : (currentStep.array ? currentStep.array.join(', ') : arrayInput),
        currentStep: currentStepIndex + 1,
        totalSteps: steps.length,
        currentState: currentStep.explanation || `Executing step ${currentStepIndex + 1}`,
        action: currentStep.action || 'processing',
        comparing: currentStep.comparing || [],
        metrics: currentStep.metrics || {},
        complexity: currentAlgo.timeComplexity || {},
      }

      const res = await api.explain(payload)
      setAiExplanation(res.explanation)
    } catch (err) {
      setAiError(err.message || 'AI explanation unavailable. Please check backend connection.')
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

  // Final comparison metrics for comparison verdict
  const finalMetric1 = compareSteps1[compareSteps1.length - 1]?.metrics || { comparisons: 0, swaps: 0, shifts: 0, arrayAccesses: 0 }
  const finalMetric2 = compareSteps2[compareSteps2.length - 1]?.metrics || { comparisons: 0, swaps: 0, shifts: 0, arrayAccesses: 0 }

  return (
    <div className="space-y-6">
      {/* 1. Top Mode Selector & Algorithm Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-900/90 p-4 text-white shadow-md border border-slate-800 backdrop-blur-md">
        {/* Visualizer vs Compare Toggle */}
        <div className="flex items-center rounded-2xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              viewMode === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Single Visualizer</span>
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              viewMode === 'compare'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ Algorithm Comparison</span>
          </button>
        </div>

        {viewMode === 'single' ? (
          <div className="flex flex-wrap items-center gap-2">
            {algorithmsData.map((algo) => {
              const isSelected = algo.slug === currentAlgo.slug
              return (
                <button
                  key={algo.slug}
                  onClick={() => navigate(`/visualizer/${algo.slug}`)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {algo.name}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            {['Sorting', 'Searching', 'Graph'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCompareCategory(cat)
                  if (cat === 'Sorting') {
                    setCompareAlgo1Slug('bubble-sort')
                    setCompareAlgo2Slug('insertion-sort')
                  } else if (cat === 'Searching') {
                    setCompareAlgo1Slug('linear-search')
                    setCompareAlgo2Slug('binary-search')
                  } else {
                    setCompareAlgo1Slug('bfs')
                    setCompareAlgo2Slug('dfs')
                  }
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  compareCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SINGLE VISUALIZER VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'single' && (
        <>
          {/* 2. Algorithm Banner */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
                    {currentAlgo.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      currentAlgo.difficulty === 'Easy'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {currentAlgo.difficulty}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentAlgo.name}</h1>
                <p className="mt-1 text-xs text-slate-600">{currentAlgo.description}</p>
              </div>

              <button
                onClick={handleMarkCompleted}
                disabled={completing}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {completing ? 'Saving...' : '✓ Mark as Completed'}
              </button>
            </div>

            {completedSuccess && (
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700">
                {completedSuccess}
              </p>
            )}
          </div>

          {/* 3. Visual Canvas & Source Code (Side by Side) */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Visual Canvas (7 cols) */}
            <div className="flex flex-col justify-between rounded-3xl bg-slate-950 p-6 text-white shadow-md border border-slate-800 lg:col-span-7">
              <div>
                {/* Live Metrics Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-amber-400">
                      <strong>🔍 Comp:</strong> {currentStep.metrics?.comparisons || 0}
                    </span>
                    <span className="text-rose-400">
                      <strong>🔄 Swaps/Shifts:</strong> {(currentStep.metrics?.swaps || 0) + (currentStep.metrics?.shifts || 0)}
                    </span>
                    <span className="text-cyan-400">
                      <strong>⚡ Access:</strong> {currentStep.metrics?.arrayAccesses || 0}
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-900 px-2.5 py-1 font-mono text-xs text-cyan-300 border border-slate-800">
                    Step {steps.length > 0 ? currentStepIndex + 1 : 0} / {steps.length}
                  </span>
                </div>

                {/* Canvas Render Area */}
                <div className="my-6 flex min-h-[260px] items-end justify-center rounded-2xl bg-slate-900/60 p-4 border border-slate-900/80">
                  {currentAlgo.category !== 'Graph' ? (
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

                        const heightPercent = Math.max(20, Math.round((val / maxArrayVal) * 190))

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
                          barBg = 'bg-slate-800 text-slate-600 opacity-30'
                        }

                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 transition-all duration-300">
                            {label && (
                              <span className="text-[10px] font-black tracking-wider text-amber-400">
                                {label}
                              </span>
                            )}
                            <div
                              style={{ height: `${heightPercent}px`, minWidth: '32px' }}
                              className={`flex flex-col justify-end items-center rounded-xl p-1 text-center font-mono font-bold text-xs shadow-md transition-all duration-300 ${barBg}`}
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
                    /* Graph Canvas */
                    <div className="flex flex-col items-center w-full">
                      <svg viewBox="0 0 580 280" className="w-full max-w-[540px] h-[220px]">
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

                        {defaultGraph.nodes.map((node) => {
                          const isCurrent = currentStep.currentNode === node.id
                          const isVisited = currentStep.visited?.includes(node.id)
                          const inQueue = currentStep.queue?.includes(node.id)
                          const inStack = currentStep.stack?.includes(node.id)

                          let fill = '#1e293b'
                          let stroke = '#64748b'

                          if (isCurrent) {
                            fill = '#f59e0b'
                            stroke = '#fef08a'
                          } else if (isVisited) {
                            fill = '#10b981'
                            stroke = '#6ee7b7'
                          } else if (inQueue || inStack) {
                            fill = '#6366f1'
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

                      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono mt-2">
                        {currentAlgo.slug === 'bfs' && (
                          <div className="rounded-lg bg-slate-900 px-3 py-1 border border-slate-800">
                            <span className="text-cyan-400 font-bold">Queue (FIFO): </span>
                            [{currentStep.queue?.join(', ') || 'empty'}]
                          </div>
                        )}
                        {currentAlgo.slug === 'dfs' && (
                          <div className="rounded-lg bg-slate-900 px-3 py-1 border border-slate-800">
                            <span className="text-cyan-400 font-bold">Call Stack (LIFO): </span>
                            [{currentStep.stack?.join(' ➔ ') || 'empty'}]
                          </div>
                        )}
                        <div className="rounded-lg bg-slate-900 px-3 py-1 border border-slate-800">
                          <span className="text-emerald-400 font-bold">Visited: </span>
                          [{currentStep.visited?.join(', ') || 'none'}]
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step Banner */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Current Step</span>
                  <p className="mt-1 text-sm font-medium text-slate-100">{currentStep.explanation}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0 || isPlaying}
                    className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                  >
                    ⏮ Prev
                  </button>

                  <button
                    onClick={togglePlay}
                    className={`rounded-xl px-5 py-2 text-xs font-bold transition shadow-sm ${
                      isPlaying ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentStepIndex >= steps.length - 1 || isPlaying}
                    className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                  >
                    Next ⏭
                  </button>

                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    ↺ Reset
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span>Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={1500}>0.5x (Slow)</option>
                    <option value={800}>1.0x (Normal)</option>
                    <option value={350}>2.0x (Fast)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Synchronized Source Code (5 cols) */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-slate-200 lg:col-span-5">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-500">
                    Source Code Highlighting
                  </span>
                  <span className="text-xs text-slate-400 font-mono">JavaScript</span>
                </div>

                <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs border border-slate-900">
                  {currentAlgo.sourceCode.map((lineObj) => {
                    const isActive = currentStep.codeLine === lineObj.line
                    return (
                      <div
                        key={lineObj.line}
                        className={`flex items-center gap-3 px-2 py-0.5 rounded-lg transition-colors ${
                          isActive ? 'bg-blue-600/30 text-cyan-300 font-semibold ring-1 ring-blue-500/80' : 'text-slate-400'
                        }`}
                      >
                        <span className="w-5 select-none text-right text-[11px] text-slate-600">{lineObj.line}</span>
                        <span className="whitespace-pre">{lineObj.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Real Life Analogy */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Real-Life Intuition</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{currentAlgo.realLifeAnalogy}</p>
              </div>
            </div>
          </div>

          {/* 4. Custom Input Panel & Input Presets */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Custom Input & Presets</h2>
                <p className="text-xs text-slate-500">
                  Enter custom numbers or select a test distribution to observe how {currentAlgo.name} behaves.
                </p>
              </div>

              {currentAlgo.category !== 'Graph' && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPresetArray('random')}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    🎲 Random
                  </button>
                  <button
                    onClick={() => setPresetArray('sorted')}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    📈 Best (Sorted)
                  </button>
                  <button
                    onClick={() => setPresetArray('reverse')}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    📉 Worst (Reverse)
                  </button>
                  <button
                    onClick={() => setPresetArray('nearly-sorted')}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    ⚡ Nearly Sorted
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleApplyInput} className="mt-4 flex flex-wrap items-end gap-3">
              {currentAlgo.category !== 'Graph' ? (
                <>
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Array Values (comma-separated, max 30)
                    </label>
                    <input
                      type="text"
                      value={arrayInput}
                      onChange={(e) => setArrayInput(e.target.value)}
                      placeholder="e.g. 15, 3, 9, 24, 7"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  {currentAlgo.category === 'Searching' && (
                    <div className="w-36">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Search Target
                      </label>
                      <input
                        type="number"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        placeholder="Target"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-48">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Node
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
                Apply & Run
              </button>
            </form>

            {inputError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                {inputError}
              </p>
            )}
          </div>

          {/* 5. Input Properties & Complexity Matrix Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Input Analysis & Complexity Matrix</h2>
                <p className="text-xs text-slate-500">
                  Differentiating theoretical asymptotic Big-O bounds from actual executed operations.
                </p>
              </div>

              {inputAnalysis && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-slate-700">
                    N = <strong>{inputAnalysis.size}</strong> elements
                  </span>
                  <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 font-semibold text-blue-700">
                    {inputAnalysis.orderStatus}
                  </span>
                  <span className="rounded-lg bg-purple-50 border border-purple-200 px-3 py-1 font-semibold text-purple-700">
                    {inputAnalysis.hasDuplicates ? `${inputAnalysis.duplicateCount} Duplicates` : 'All Unique'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {/* Theoretical Complexity Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Theoretical Complexity (Big-O)
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Best Case Time</span>
                    <p className="mt-1 font-mono text-base font-bold text-emerald-600">{currentAlgo.timeComplexity.best}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Average Case Time</span>
                    <p className="mt-1 font-mono text-base font-bold text-blue-600">{currentAlgo.timeComplexity.average}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Worst Case Time</span>
                    <p className="mt-1 font-mono text-base font-bold text-rose-600">{currentAlgo.timeComplexity.worst}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                    <span className="text-slate-500 text-[11px]">Space Complexity</span>
                    <p className="mt-1 font-mono text-base font-bold text-slate-900">{currentAlgo.spaceComplexity}</p>
                  </div>
                </div>
              </div>

              {/* Observed Execution Metrics Card */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3">
                  Observed Execution Metrics (This Input)
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-blue-100 shadow-2xs">
                    <span className="text-slate-500 text-[11px]">Total Comparisons</span>
                    <p className="mt-1 font-mono text-base font-black text-amber-600">{currentStep.metrics?.comparisons || 0}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-blue-100 shadow-2xs">
                    <span className="text-slate-500 text-[11px]">Total Swaps / Shifts</span>
                    <p className="mt-1 font-mono text-base font-black text-rose-600">
                      {(currentStep.metrics?.swaps || 0) + (currentStep.metrics?.shifts || 0)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-blue-100 shadow-2xs">
                    <span className="text-slate-500 text-[11px]">Array Memory Accesses</span>
                    <p className="mt-1 font-mono text-base font-black text-cyan-600">{currentStep.metrics?.arrayAccesses || 0}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-blue-100 shadow-2xs">
                    <span className="text-slate-500 text-[11px]">Discrete State Frames</span>
                    <p className="mt-1 font-mono text-base font-black text-indigo-600">{steps.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Upgraded AI Explainer & Interactive Question Box */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Algorithm Tutor</h2>
                  <p className="text-xs text-slate-500">
                    Ask any question about the live state, why elements are swapping, or request an intuitive analogy.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => requestAiExplanation('Explain what is happening in the current step of this algorithm.')}
                disabled={aiLoading}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-indigo-50/70 disabled:opacity-50"
              >
                🔍 Explain This Step
              </button>
              <button
                onClick={() => requestAiExplanation('Why is this specific step or decision taking place right now?')}
                disabled={aiLoading}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-indigo-50/70 disabled:opacity-50"
              >
                🤔 Why This Step?
              </button>
              <button
                onClick={() => requestAiExplanation('Explain the time and space complexity of this algorithm.')}
                disabled={aiLoading}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-indigo-50/70 disabled:opacity-50"
              >
                ⏱️ Explain Complexity
              </button>
              <button
                onClick={() => requestAiExplanation('Give a simple, relatable real-life analogy for this algorithm.')}
                disabled={aiLoading}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-indigo-50/70 disabled:opacity-50"
              >
                🌍 Real-Life Example
              </button>
              <button
                onClick={() => requestAiExplanation('Explain how this algorithm works in very simple terms for a complete beginner.')}
                disabled={aiLoading}
                className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-indigo-50/70 disabled:opacity-50"
              >
                🌱 Explain Like a Beginner
              </button>
            </div>

            {/* Custom Question Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = customQuestion.trim()
                if (q) {
                  requestAiExplanation(q)
                }
              }}
              className="mt-4 flex items-center gap-2"
            >
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask AI anything (e.g. Why do we choose Bubble Sort for sorting? Why is Binary Search faster?)..."
                className="flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none shadow-2xs"
              />
              <button
                type="submit"
                disabled={aiLoading || !customQuestion.trim()}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                Ask AI
              </button>
            </form>

            {/* AI Output Viewport */}
            {aiLoading && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 border border-indigo-100">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <span className="text-xs text-indigo-900 font-medium">Analyzing current state & generating tutoring response...</span>
              </div>
            )}

            {aiError && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {aiError}
              </p>
            )}

            {aiExplanation && (
              <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-2xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">AI Tutor Response</span>
                <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-800 font-sans">
                  {aiExplanation}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* ALGORITHM COMPARISON MODE (SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      {viewMode === 'compare' && (
        <div className="space-y-6">
          {/* Comparison Controller */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Side-by-Side Algorithm Comparison</h2>
            <p className="text-xs text-slate-500">
              Compare execution speed, comparisons, and element swaps of two algorithms running on identical inputs.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Algorithm 1 (Left)</label>
                <select
                  value={compareAlgo1Slug}
                  onChange={(e) => setCompareAlgo1Slug(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                >
                  {availableCompareAlgos.map((a) => (
                    <option key={a.slug} value={a.slug}>{a.name} ({a.difficulty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Algorithm 2 (Right)</label>
                <select
                  value={compareAlgo2Slug}
                  onChange={(e) => setCompareAlgo2Slug(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                >
                  {availableCompareAlgos.map((a) => (
                    <option key={a.slug} value={a.slug}>{a.name} ({a.difficulty})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Input Box */}
            <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
              {compareCategory !== 'Graph' ? (
                <>
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shared Input Array</label>
                    <input
                      type="text"
                      value={compareArrayInput}
                      onChange={(e) => setCompareArrayInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {compareCategory === 'Searching' && (
                    <div className="w-32">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Key</label>
                      <input
                        type="number"
                        value={compareTargetInput}
                        onChange={(e) => setCompareTargetInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-48">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Root Node</label>
                  <select
                    value={compareStartNode}
                    onChange={(e) => setCompareStartNode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {defaultGraph.nodes.map((n) => (
                      <option key={n.id} value={n.id}>Node {n.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={refreshCompareSteps}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Apply Shared Input
              </button>
            </div>

            {compareError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {compareError}
              </p>
            )}
          </div>

          {/* Dual Canvases Side-by-Side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Canvas: Algo 1 */}
            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400">{compareAlgo1.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Step {compareStepIndex1 + 1} / {compareSteps1.length}
                  </span>
                </div>

                <div className="my-4 flex min-h-[190px] items-end justify-center rounded-2xl bg-slate-900/60 p-3 overflow-x-auto">
                  {currentCompareStep1.array?.map((val, idx) => {
                    const isComparing = currentCompareStep1.comparing?.includes(idx)
                    const isSorted = currentCompareStep1.sortedIndices?.includes(idx)
                    const isFound = currentCompareStep1.foundIndex === idx
                    const heightPercent = Math.max(16, Math.round((val / 100) * 140))

                    let barBg = 'bg-slate-700'
                    if (isFound) barBg = 'bg-emerald-500 ring-2 ring-emerald-300'
                    else if (isSorted) barBg = 'bg-green-600'
                    else if (isComparing) barBg = currentCompareStep1.swapped ? 'bg-rose-500' : 'bg-amber-500'

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 mx-0.5">
                        <div
                          style={{ height: `${heightPercent}px`, minWidth: '24px' }}
                          className={`rounded-lg flex items-end justify-center font-mono text-[10px] font-bold p-0.5 ${barBg}`}
                        >
                          <span className="mb-0.5">{val}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">[{idx}]</span>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-slate-300 border border-slate-800 rounded-xl bg-slate-900 p-2.5 min-h-[50px]">
                  {currentCompareStep1.explanation}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
                <span>Comp: <strong className="text-amber-400">{currentCompareStep1.metrics?.comparisons || 0}</strong></span>
                <span>Swaps: <strong className="text-rose-400">{(currentCompareStep1.metrics?.swaps || 0) + (currentCompareStep1.metrics?.shifts || 0)}</strong></span>
                <span>Access: <strong className="text-cyan-400">{currentCompareStep1.metrics?.arrayAccesses || 0}</strong></span>
              </div>
            </div>

            {/* Right Canvas: Algo 2 */}
            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-indigo-400">{compareAlgo2.name}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Step {compareStepIndex2 + 1} / {compareSteps2.length}
                  </span>
                </div>

                <div className="my-4 flex min-h-[190px] items-end justify-center rounded-2xl bg-slate-900/60 p-3 overflow-x-auto">
                  {currentCompareStep2.array?.map((val, idx) => {
                    const isComparing = currentCompareStep2.comparing?.includes(idx)
                    const isSorted = currentCompareStep2.sortedIndices?.includes(idx)
                    const isFound = currentCompareStep2.foundIndex === idx
                    const heightPercent = Math.max(16, Math.round((val / 100) * 140))

                    let barBg = 'bg-slate-700'
                    if (isFound) barBg = 'bg-emerald-500 ring-2 ring-emerald-300'
                    else if (isSorted) barBg = 'bg-green-600'
                    else if (isComparing) barBg = currentCompareStep2.swapped ? 'bg-rose-500' : 'bg-amber-500'

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 mx-0.5">
                        <div
                          style={{ height: `${heightPercent}px`, minWidth: '24px' }}
                          className={`rounded-lg flex items-end justify-center font-mono text-[10px] font-bold p-0.5 ${barBg}`}
                        >
                          <span className="mb-0.5">{val}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">[{idx}]</span>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-slate-300 border border-slate-800 rounded-xl bg-slate-900 p-2.5 min-h-[50px]">
                  {currentCompareStep2.explanation}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-slate-800/80 pt-2 text-slate-400">
                <span>Comp: <strong className="text-amber-400">{currentCompareStep2.metrics?.comparisons || 0}</strong></span>
                <span>Swaps: <strong className="text-rose-400">{(currentCompareStep2.metrics?.swaps || 0) + (currentCompareStep2.metrics?.shifts || 0)}</strong></span>
                <span>Access: <strong className="text-cyan-400">{currentCompareStep2.metrics?.arrayAccesses || 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Synchronized Comparison Playback Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleComparePrev}
                disabled={compareStepIndex1 === 0 && compareStepIndex2 === 0}
                className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                ⏮ Step Prev
              </button>

              <button
                onClick={toggleComparePlay}
                className={`rounded-xl px-5 py-2 text-xs font-bold transition shadow-sm ${
                  compareIsPlaying ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {compareIsPlaying ? '⏸ Pause Comparison' : '▶ Play Both Synchronously'}
              </button>

              <button
                onClick={handleCompareNext}
                disabled={
                  compareStepIndex1 >= compareSteps1.length - 1 &&
                  compareStepIndex2 >= compareSteps2.length - 1
                }
                className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                Step Next ⏭
              </button>

              <button
                onClick={handleCompareReset}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                ↺ Reset
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Speed:</span>
              <select
                value={compareSpeed}
                onChange={(e) => setCompareSpeed(Number(e.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              >
                <option value={1500}>0.5x (Slow)</option>
                <option value={800}>1.0x (Normal)</option>
                <option value={350}>2.0x (Fast)</option>
              </select>
            </div>
          </div>

          {/* Side-by-Side Metrics Comparison Matrix */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Head-to-Head Execution Metrics Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate operation counts accumulated throughout complete algorithm execution on this input.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Metric / Property</th>
                    <th className="py-2.5 px-3 text-cyan-700 font-bold">{compareAlgo1.name}</th>
                    <th className="py-2.5 px-3 text-indigo-700 font-bold">{compareAlgo2.name}</th>
                    <th className="py-2.5 px-3 text-slate-700">Winner / Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-700">Total Steps to Complete</td>
                    <td className="py-2.5 px-3 font-bold">{compareSteps1.length}</td>
                    <td className="py-2.5 px-3 font-bold">{compareSteps2.length}</td>
                    <td className="py-2.5 px-3 font-sans text-xs">
                      {compareSteps1.length < compareSteps2.length ? `🏆 ${compareAlgo1.name}` : compareSteps2.length < compareSteps1.length ? `🏆 ${compareAlgo2.name}` : '🤝 Tied'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-700">Comparisons Executed</td>
                    <td className="py-2.5 px-3 font-bold">{finalMetric1.comparisons}</td>
                    <td className="py-2.5 px-3 font-bold">{finalMetric2.comparisons}</td>
                    <td className="py-2.5 px-3 font-sans text-xs">
                      {finalMetric1.comparisons < finalMetric2.comparisons ? `🏆 ${compareAlgo1.name}` : finalMetric2.comparisons < finalMetric1.comparisons ? `🏆 ${compareAlgo2.name}` : '🤝 Tied'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-700">Swaps / Shifts</td>
                    <td className="py-2.5 px-3 font-bold">{(finalMetric1.swaps || 0) + (finalMetric1.shifts || 0)}</td>
                    <td className="py-2.5 px-3 font-bold">{(finalMetric2.swaps || 0) + (finalMetric2.shifts || 0)}</td>
                    <td className="py-2.5 px-3 font-sans text-xs">
                      {(finalMetric1.swaps + finalMetric1.shifts) < (finalMetric2.swaps + finalMetric2.shifts)
                        ? `🏆 ${compareAlgo1.name}`
                        : (finalMetric2.swaps + finalMetric2.shifts) < (finalMetric1.swaps + finalMetric1.shifts)
                        ? `🏆 ${compareAlgo2.name}`
                        : '🤝 Tied'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-700">Theoretical Worst Case</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{compareAlgo1.timeComplexity.worst}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{compareAlgo2.timeComplexity.worst}</td>
                    <td className="py-2.5 px-3 font-sans text-xs text-slate-500">Asymptotic Bound</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-700">Space Complexity</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{compareAlgo1.spaceComplexity}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{compareAlgo2.spaceComplexity}</td>
                    <td className="py-2.5 px-3 font-sans text-xs text-slate-500">Auxiliary Memory</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
