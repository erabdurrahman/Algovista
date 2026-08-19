const express = require('express')
const { requireAuth } = require('../middleware/auth')
const {
  listTopics,
  getTopicBySlug,
  getProgress,
  markTopicCompleted,
  addSubmission,
  listSubmissions,
} = require('../controllers/learnController')

const router = express.Router()

router.get('/topics', listTopics)
router.get('/topics/:slug', getTopicBySlug)
router.get('/progress', requireAuth, getProgress)
router.post('/progress/:topicId/complete', requireAuth, markTopicCompleted)
router.post('/submissions', requireAuth, addSubmission)
router.get('/submissions', requireAuth, listSubmissions)

module.exports = router
