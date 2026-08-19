const express = require('express')

const router = express.Router()

router.get('/topics', (_req, res) => {
  res.json({
    topics: ['Arrays', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs'],
  })
})

module.exports = router
