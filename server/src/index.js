require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')
const validateEnv = require('./middleware/validateEnv')
const { ensureTopicsSeeded } = require('./services/topicService')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    validateEnv()
    const connected = await connectDB()
    if (connected) {
      await ensureTopicsSeeded()
    }

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
