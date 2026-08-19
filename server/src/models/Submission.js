const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    code: { type: String, required: true, minlength: 5, maxlength: 10000, trim: true },
    language: { type: String, required: true, trim: true, maxlength: 32 },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
)

submissionSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Submission', submissionSchema)
