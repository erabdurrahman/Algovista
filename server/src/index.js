require('dotenv').config()
const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error.message)
    process.exit(1)
  })
