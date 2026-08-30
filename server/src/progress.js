const express = require('express')
const { query } = require('./db')
const { authenticateToken } = require('./auth')

const router = express.Router()

// 1. Get user progress and computed stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch all algorithms
    const algorithms = await query('SELECT id, name, category, difficulty, description, slug FROM algorithms ORDER BY id ASC')

    // Fetch user progress records
    const progressRecords = await query(
      'SELECT algorithm_id, completed, practice_count, last_practiced FROM progress WHERE user_id = ?',
      [userId],
    )

    const progressMap = new Map()
    for (const record of progressRecords) {
      progressMap.set(record.algorithm_id, {
        completed: Boolean(record.completed),
        practiceCount: record.practice_count || 0,
        lastPracticed: record.last_practiced,
      })
    }

    let completedCount = 0
    let totalPractices = 0

    // Compute category statistics
    const categoryStats = {
      Sorting: { total: 0, completed: 0, percentage: 0 },
      Searching: { total: 0, completed: 0, percentage: 0 },
      Graph: { total: 0, completed: 0, percentage: 0 },
    }

    const algorithmsWithProgress = algorithms.map((algo) => {
      const userProg = progressMap.get(algo.id) || {
        completed: false,
        practiceCount: 0,
        lastPracticed: null,
      }

      if (userProg.completed) {
        completedCount++
      }
      totalPractices += userProg.practiceCount

      if (!categoryStats[algo.category]) {
        categoryStats[algo.category] = { total: 0, completed: 0, percentage: 0 }
      }
      categoryStats[algo.category].total++
      if (userProg.completed) {
        categoryStats[algo.category].completed++
      }

      return {
        id: algo.id,
        name: algo.name,
        category: algo.category,
        difficulty: algo.difficulty,
        description: algo.description,
        slug: algo.slug,
        completed: userProg.completed,
        practiceCount: userProg.practiceCount,
        lastPracticed: userProg.lastPracticed,
      }
    })

    // Calculate percentages
    for (const catKey of Object.keys(categoryStats)) {
      const cat = categoryStats[catKey]
      cat.percentage = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0
    }

    const totalAlgorithms = algorithms.length
    const overallProgress = totalAlgorithms > 0 ? Math.round((completedCount / totalAlgorithms) * 100) : 0

    return res.json({
      stats: {
        totalAlgorithms,
        completedCount,
        overallProgress,
        totalPractices,
      },
      categoryStats,
      algorithms: algorithmsWithProgress,
    })
  } catch (error) {
    console.error('Fetch Progress Error:', error.message)
    return res.status(500).json({ error: 'Failed to retrieve progress records.' })
  }
})

// 2. Update progress (complete algorithm or record practice session)
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { algorithmId, algorithmSlug, completed, incrementPractice = 1 } = req.body

    let targetAlgorithmId = algorithmId

    // If slug is passed instead of ID, resolve ID
    if (!targetAlgorithmId && algorithmSlug) {
      const algoRows = await query('SELECT id FROM algorithms WHERE slug = ? LIMIT 1', [algorithmSlug])
      if (algoRows && algoRows.length > 0) {
        targetAlgorithmId = algoRows[0].id
      }
    }

    if (!targetAlgorithmId) {
      return res.status(400).json({ error: 'Valid algorithmId or algorithmSlug is required.' })
    }

    const markCompleted = completed ? 1 : 0
    const addPractice = Number(incrementPractice) >= 0 ? Number(incrementPractice) : 1

    // Upsert progress entry
    await query(
      `INSERT INTO progress (user_id, algorithm_id, completed, practice_count, last_practiced)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         completed = IF(? = 1, TRUE, completed),
         practice_count = practice_count + ?,
         last_practiced = NOW();`,
      [userId, targetAlgorithmId, markCompleted, addPractice, markCompleted, addPractice],
    )

    // Return the updated record
    const updated = await query(
      'SELECT algorithm_id, completed, practice_count, last_practiced FROM progress WHERE user_id = ? AND algorithm_id = ? LIMIT 1',
      [userId, targetAlgorithmId],
    )

    return res.json({
      message: 'Progress updated successfully!',
      progress: updated[0] ? {
        algorithmId: updated[0].algorithm_id,
        completed: Boolean(updated[0].completed),
        practiceCount: updated[0].practice_count,
        lastPracticed: updated[0].last_practiced,
      } : null,
    })
  } catch (error) {
    console.error('Update Progress Error:', error.message)
    return res.status(500).json({ error: 'Failed to update progress.' })
  }
})

module.exports = router
