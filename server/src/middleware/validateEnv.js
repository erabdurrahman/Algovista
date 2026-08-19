const validateEnv = () => {
  const required = ['JWT_SECRET']
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim())
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

module.exports = validateEnv
