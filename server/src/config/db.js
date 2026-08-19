const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    return
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri)
  }
}

module.exports = connectDB
