require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { initDB, query } = require('./db')
const { router: authRouter } = require('./auth')
const progressRouter = require('./progress')
const aiRouter = require('./ai')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from frontend development server or same-origin
      callback(null, true)
    },
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 2. Auth Routes
app.use('/api/auth', authRouter)

// 3. Progress Routes
app.use('/api/progress', progressRouter)

// 4. AI Routes
app.use('/api/ai', aiRouter)

// 5. Algorithms Endpoint
app.get('/api/algorithms', async (_req, res) => {
  try {
    const algorithms = await query('SELECT id, name, category, difficulty, description, slug FROM algorithms ORDER BY id ASC')
    return res.json({ algorithms })
  } catch (error) {
    console.warn('Algorithms query error (returning fallback metadata):', error.message)
    // Fallback static metadata
    const staticAlgorithms = [
      { id: 1, name: 'Bubble Sort', category: 'Sorting', difficulty: 'Easy', slug: 'bubble-sort', description: 'Repeatedly compares adjacent elements and swaps them if they are in the wrong order.' },
      { id: 2, name: 'Selection Sort', category: 'Sorting', difficulty: 'Easy', slug: 'selection-sort', description: 'Finds the minimum element from the unsorted part and places it at the beginning.' },
      { id: 3, name: 'Insertion Sort', category: 'Sorting', difficulty: 'Easy', slug: 'insertion-sort', description: 'Builds the sorted array one element at a time by repeatedly inserting elements into their correct position.' },
      { id: 4, name: 'Linear Search', category: 'Searching', difficulty: 'Easy', slug: 'linear-search', description: 'Sequentially checks each element of the list until a match is found or the list ends.' },
      { id: 5, name: 'Binary Search', category: 'Searching', difficulty: 'Medium', slug: 'binary-search', description: 'Efficiently finds an item from a sorted list by repeatedly dividing the search interval in half.' },
      { id: 6, name: 'Breadth First Search (BFS)', category: 'Graph', difficulty: 'Medium', slug: 'bfs', description: 'Traverses or searches graph data structures level by level using a queue.' },
      { id: 7, name: 'Depth First Search (DFS)', category: 'Graph', difficulty: 'Medium', slug: 'dfs', description: 'Explores as far as possible along each branch before backtracking using a stack or recursion.' },
    ]
    return res.json({ algorithms: staticAlgorithms })
  }
})

// 6. Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  })
})

// Start Server
const startServer = async () => {
  try {
    // Attempt DB initialization
    await initDB()

    app.listen(PORT, () => {
      console.log(`🚀 Algovista Backend running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
