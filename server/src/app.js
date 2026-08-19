const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const authRoutes = require('./routes/authRoutes')
const learnRoutes = require('./routes/learnRoutes')
const explainRoutes = require('./routes/explainRoutes')
const errorHandler = require('./middleware/errorHandler')
const { defaultRateLimiter } = require('./middleware/rateLimiters')

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use(defaultRateLimiter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/learn', learnRoutes)
app.use('/api/explain', explainRoutes)

app.use(errorHandler)

module.exports = app
