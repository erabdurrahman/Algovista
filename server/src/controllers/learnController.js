const mongoose = require('mongoose')
const Topic = require('../models/Topic')
const Progress = require('../models/Progress')
const Submission = require('../models/Submission')
const { TOPICS, ensureTopicsSeeded } = require('../services/topicService')

const memoryProgress = []
const memorySubmissions = []

const toTopicResponse = (topic) => ({
  id: String(topic._id || topic.id),
  slug: topic.slug,
  title: topic.title,
  level: topic.level,
  estimatedMinutes: topic.estimatedMinutes,
  theory: topic.theory,
  examples: topic.examples || [],
  complexitySummary: topic.complexitySummary,
  practiceProblems: topic.practiceProblems || [],
  order: topic.order,
})

const toSubmissionResponse = (submission) => ({
  id: String(submission._id || submission.id),
  topicId: String(submission.topicId),
  code: submission.code,
  language: submission.language,
  notes: submission.notes || '',
  createdAt: submission.createdAt,
})

const calculateStreak = (dates) => {
  const uniqueDays = [...new Set(dates.map((date) => new Date(date).toISOString().slice(0, 10)))].sort().reverse()
  if (uniqueDays.length === 0) {
    return 0
  }

  let streak = 0
  let cursor = new Date()
  cursor.setUTCHours(0, 0, 0, 0)

  for (let index = 0; index < uniqueDays.length; index += 1) {
    const expectedDay = cursor.toISOString().slice(0, 10)
    if (uniqueDays[index] === expectedDay) {
      streak += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
      continue
    }

    if (index === 0) {
      cursor.setUTCDate(cursor.getUTCDate() - 1)
      if (uniqueDays[index] === cursor.toISOString().slice(0, 10)) {
        streak += 1
        cursor.setUTCDate(cursor.getUTCDate() - 1)
        continue
      }
    }

    break
  }

  return streak
}

const listTopics = async (_req, res) => {
  if (mongoose.connection.readyState === 1) {
    await ensureTopicsSeeded()
    const topics = await Topic.find().sort({ order: 1 }).lean()
    return res.json({ topics: topics.map(toTopicResponse) })
  }

  return res.json({
    topics: TOPICS.map((topic, index) => toTopicResponse({ ...topic, id: `topic_${index + 1}` })),
  })
}

const getTopicBySlug = async (req, res) => {
  const { slug } = req.params

  if (mongoose.connection.readyState === 1) {
    await ensureTopicsSeeded()
    const topic = await Topic.findOne({ slug }).lean()
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' })
    }
    return res.json({ topic: toTopicResponse(topic) })
  }

  const topic = TOPICS.find((entry) => entry.slug === slug)
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found.' })
  }

  return res.json({ topic: toTopicResponse({ ...topic, id: `topic_${topic.order}` }) })
}

const getProgress = async (req, res) => {
  const userId = req.user.id

  if (mongoose.connection.readyState === 1) {
    await ensureTopicsSeeded()
    const topics = await Topic.find().sort({ order: 1 }).lean()
    const progressEntries = await Progress.find({ userId }).lean()
    const byTopicId = new Map(progressEntries.map((entry) => [String(entry.topicId), entry]))

    const completedDates = []
    const progress = topics.map((topic) => {
      const entry = byTopicId.get(String(topic._id))
      if (entry?.completedAt) {
        completedDates.push(entry.completedAt)
      }
      return {
        topicId: String(topic._id),
        completedAt: entry?.completedAt || null,
        completionCount: entry?.completionCount || 0,
        lastPracticedAt: entry?.lastPracticedAt || null,
      }
    })

    const completedTopics = progress.filter((entry) => entry.completedAt).length
    const totalTopics = topics.length

    return res.json({
      progress,
      stats: {
        completedTopics,
        totalTopics,
        completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
        streakDays: calculateStreak(completedDates),
      },
    })
  }

  const entries = memoryProgress.filter((entry) => entry.userId === userId)
  const completedDates = entries.filter((entry) => entry.completedAt).map((entry) => entry.completedAt)
  const progress = TOPICS.map((topic) => {
    const topicId = `topic_${topic.order}`
    const entry = entries.find((item) => item.topicId === topicId)
    return {
      topicId,
      completedAt: entry?.completedAt || null,
      completionCount: entry?.completionCount || 0,
      lastPracticedAt: entry?.lastPracticedAt || null,
    }
  })

  const completedTopics = progress.filter((entry) => entry.completedAt).length
  const totalTopics = TOPICS.length

  return res.json({
    progress,
    stats: {
      completedTopics,
      totalTopics,
      completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      streakDays: calculateStreak(completedDates),
    },
  })
}

const markTopicCompleted = async (req, res) => {
  const userId = req.user.id
  const { topicId } = req.params

  if (!topicId) {
    return res.status(400).json({ error: 'Topic ID is required.' })
  }

  const now = new Date()

  if (mongoose.connection.readyState === 1) {
    const topic = await Topic.findById(topicId).lean()
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' })
    }

    const progress = await Progress.findOneAndUpdate(
      { userId, topicId },
      {
        $set: {
          completedAt: now,
          lastPracticedAt: now,
        },
        $inc: { completionCount: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()

    return res.json({
      message: 'Topic marked as completed.',
      progress: {
        topicId: String(progress.topicId),
        completedAt: progress.completedAt,
        completionCount: progress.completionCount,
        lastPracticedAt: progress.lastPracticedAt,
      },
    })
  }

  const topic = TOPICS.find((entry) => `topic_${entry.order}` === topicId)
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found.' })
  }

  const existing = memoryProgress.find((entry) => entry.userId === userId && entry.topicId === topicId)
  if (existing) {
    existing.completionCount += 1
    existing.completedAt = now
    existing.lastPracticedAt = now
  } else {
    memoryProgress.push({ userId, topicId, completionCount: 1, completedAt: now, lastPracticedAt: now })
  }

  const item = memoryProgress.find((entry) => entry.userId === userId && entry.topicId === topicId)
  return res.json({ message: 'Topic marked as completed.', progress: item })
}

const addSubmission = async (req, res) => {
  const userId = req.user.id
  const { topicId, code, language, notes = '' } = req.body || {}

  if (!topicId) {
    return res.status(400).json({ error: 'Topic ID is required.' })
  }
  if (!code || String(code).trim().length < 5) {
    return res.status(400).json({ error: 'Code must be at least 5 characters.' })
  }
  if (!language || String(language).trim().length < 2) {
    return res.status(400).json({ error: 'Language is required.' })
  }

  const now = new Date()

  if (mongoose.connection.readyState === 1) {
    const topic = await Topic.findById(topicId).lean()
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found.' })
    }

    const submission = await Submission.create({
      userId,
      topicId,
      code: String(code).trim(),
      language: String(language).trim(),
      notes: String(notes || '').trim(),
    })

    await Progress.findOneAndUpdate(
      { userId, topicId },
      {
        $set: { lastPracticedAt: now },
        $setOnInsert: { completionCount: 0, completedAt: null },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    return res.status(201).json({ message: 'Submission saved.', submission: toSubmissionResponse(submission) })
  }

  const topic = TOPICS.find((entry) => `topic_${entry.order}` === topicId)
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found.' })
  }

  const submission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    userId,
    topicId,
    code: String(code).trim(),
    language: String(language).trim(),
    notes: String(notes || '').trim(),
    createdAt: now,
  }
  memorySubmissions.push(submission)

  const existing = memoryProgress.find((entry) => entry.userId === userId && entry.topicId === topicId)
  if (existing) {
    existing.lastPracticedAt = now
  } else {
    memoryProgress.push({ userId, topicId, completionCount: 0, completedAt: null, lastPracticedAt: now })
  }

  return res.status(201).json({ message: 'Submission saved.', submission: toSubmissionResponse(submission) })
}

const listSubmissions = async (req, res) => {
  const userId = req.user.id

  if (mongoose.connection.readyState === 1) {
    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(100).lean()
    return res.json({ submissions: submissions.map(toSubmissionResponse) })
  }

  const submissions = memorySubmissions
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100)

  return res.json({ submissions: submissions.map(toSubmissionResponse) })
}

module.exports = {
  listTopics,
  getTopicBySlug,
  getProgress,
  markTopicCompleted,
  addSubmission,
  listSubmissions,
}
