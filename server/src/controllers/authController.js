const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require('../models/User')
const { signAuthToken } = require('../utils/jwt')

const inMemoryUsers = []

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

const sanitizeUser = (user) => ({
  id: String(user._id || user.id),
  name: user.name,
  email: user.email,
})

const register = async (req, res) => {
  const { name, email, password } = req.body || {}
  const normalizedEmail = normalizeEmail(email)

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' })
  }
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Valid email is required.' })
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  let user
  if (mongoose.connection.readyState === 1) {
    const existing = await User.findOne({ email: normalizedEmail }).lean()
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' })
    }

    user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash })
  } else {
    const existing = inMemoryUsers.find((entry) => entry.email === normalizedEmail)
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' })
    }

    user = {
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
    }
    inMemoryUsers.push(user)
  }

  const safeUser = sanitizeUser(user)
  const token = signAuthToken({ userId: safeUser.id, email: safeUser.email })
  return res.status(201).json({ token, user: safeUser })
}

const login = async (req, res) => {
  const { email, password } = req.body || {}
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  let user
  if (mongoose.connection.readyState === 1) {
    user = await User.findOne({ email: normalizedEmail })
  } else {
    user = inMemoryUsers.find((entry) => entry.email === normalizedEmail)
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  const safeUser = sanitizeUser(user)
  const token = signAuthToken({ userId: safeUser.id, email: safeUser.email })
  return res.json({ token, user: safeUser })
}

const me = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(req.user.id).lean()
    if (!user) {
      return res.status(404).json({ error: 'User not found.' })
    }
    return res.json({ user: sanitizeUser(user) })
  }

  const user = inMemoryUsers.find((entry) => entry.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  return res.json({ user: sanitizeUser(user) })
}

module.exports = { register, login, me }
