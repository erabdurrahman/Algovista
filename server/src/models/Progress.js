const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    completedAt: { type: Date, default: null },
    completionCount: { type: Number, default: 0, min: 0 },
    lastPracticedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

progressSchema.index({ userId: 1, topicId: 1 }, { unique: true })

module.exports = mongoose.model('Progress', progressSchema)
