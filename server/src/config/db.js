const mongoose = require('mongoose')

mongoose.set('strictQuery', true)

const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    return false
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri)
  }

  return mongoose.connection.readyState === 1
}

module.exports = connectDB
