const express = require('express')
const { explainRateLimiter } = require('../middleware/rateLimiters')
const { requireAuth } = require('../middleware/auth')
const { explainCode } = require('../controllers/explainController')

const router = express.Router()

router.post('/', explainRateLimiter, requireAuth, explainCode)

module.exports = router
