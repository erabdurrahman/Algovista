const errorHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return
  }

  if (error && error.statusCode) {
    res.status(error.statusCode).json({ error: error.message })
    return
  }

  res.status(500).json({ error: 'Internal server error.' })
}

module.exports = errorHandler
