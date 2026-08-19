const express = require('express')
const { explainCode } = require('../controllers/explainController')

const router = express.Router()

router.post('/', explainCode)

module.exports = router
