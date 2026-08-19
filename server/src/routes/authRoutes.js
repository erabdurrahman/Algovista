const express = require('express')

const router = express.Router()

router.post('/login', (_req, res) => {
  res.json({ message: 'Login endpoint placeholder.' })
})

router.post('/register', (_req, res) => {
  res.json({ message: 'Register endpoint placeholder.' })
})

module.exports = router
