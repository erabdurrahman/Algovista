const mongoose = require('mongoose')

const practiceProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  },
  { _id: false },
)

const topicSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    estimatedMinutes: { type: Number, min: 1, required: true },
    theory: { type: String, required: true, trim: true },
    examples: [{ type: String, trim: true }],
    complexitySummary: { type: String, required: true, trim: true },
    practiceProblems: [practiceProblemSchema],
    order: { type: Number, required: true },
  },
  { timestamps: true },
)

topicSchema.index({ slug: 1 }, { unique: true })
topicSchema.index({ order: 1 })

module.exports = mongoose.model('Topic', topicSchema)
