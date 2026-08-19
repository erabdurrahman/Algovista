const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const learnRoutes = require('./routes/learnRoutes')
const explainRoutes = require('./routes/explainRoutes')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/learn', learnRoutes)
app.use('/api/explain', explainRoutes)

module.exports = app
