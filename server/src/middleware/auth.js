const { verifyAuthToken } = require('../utils/jwt')

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')
  const acceptedScheme = scheme === 'Bearer' || scheme === 'JWT'

  if (!acceptedScheme || !token) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  try {
    const payload = verifyAuthToken(token)
    req.user = { id: payload.sub, email: payload.email }
    return next()
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

module.exports = { requireAuth }
