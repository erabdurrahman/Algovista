const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query } = require('./db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'algovista_default_secret_key'

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader.startsWith('JWT ')
    ? authHeader.slice(4)
    : authHeader

  if (!token) {
    return res.status(401).json({ error: 'Invalid token format.' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (_err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' })
  }
}

// 1. Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' })
    }

    // Check if user already exists
    const existingUsers = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [trimmedEmail])
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user into MySQL
    const result = await query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [trimmedName, trimmedEmail, hashedPassword],
    )

    const userId = result.insertId

    // Generate JWT
    const token = jwt.sign(
      { id: userId, name: trimmedName, email: trimmedEmail },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
      },
    })
  } catch (error) {
    console.error('Registration Error:', error.message)
    return res.status(500).json({ error: 'Failed to register account. Please try again.' })
  }
})

// 2. Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Find user in MySQL
    const users = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [trimmedEmail])
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    const user = users[0]

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login Error:', error.message)
    return res.status(500).json({ error: 'Failed to log in. Please try again.' })
  }
})

// 3. Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1', [req.user.id])
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }

    return res.json({ user: users[0] })
  } catch (error) {
    console.error('Me Error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch user profile.' })
  }
})

module.exports = {
  router,
  authenticateToken,
}
