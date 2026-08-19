const jwt = require('jsonwebtoken')

const getJwtSecret = () => process.env.JWT_SECRET || ''

const signAuthToken = ({ userId, email }) => {
  const secret = getJwtSecret()
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ sub: userId, email }, secret, { expiresIn })
}

const verifyAuthToken = (token) => {
  const secret = getJwtSecret()
  return jwt.verify(token, secret)
}

module.exports = { signAuthToken, verifyAuthToken }
