const mongoose = require('mongoose')
const Topic = require('../models/Topic')
const TOPICS = require('../data/topics')

const ensureTopicsSeeded = async () => {
  if (mongoose.connection.readyState !== 1) {
    return
  }

  const count = await Topic.estimatedDocumentCount()
  if (count > 0) {
    return
  }

  await Topic.insertMany(TOPICS)
}

module.exports = { ensureTopicsSeeded, TOPICS }
