const express = require('express')
const { authRateLimiter } = require('../middleware/rateLimiters')
const { requireAuth } = require('../middleware/auth')
const { register, login, me } = require('../controllers/authController')

const router = express.Router()

router.post('/register', authRateLimiter, register)
router.post('/login', authRateLimiter, login)
router.get('/me', requireAuth, me)

module.exports = router
