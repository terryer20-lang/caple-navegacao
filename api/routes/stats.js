/**
 * routes/stats.js — 學習統計同步
 */
const { Router } = require('express')
const { query, execute } = require('../db')

const router = Router()

// GET /api/stats — 拉取全部學習記錄
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT log_date, minutes, words FROM study_log WHERE user_id = ? ORDER BY log_date DESC LIMIT 365',
      [req.user.id]
    )
    res.json({ items: rows })
  } catch (err) {
    console.error('stats list error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// POST /api/stats/sync — 合併今日統計
router.post('/sync', async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items 須為陣列' })
    }
    for (const item of items) {
      if (!item.log_date) continue
      await execute(
        `INSERT INTO study_log (user_id, log_date, minutes, words)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           minutes = GREATEST(minutes, VALUES(minutes)),
           words   = GREATEST(words, VALUES(words))`,
        [req.user.id, item.log_date, item.minutes || 0, item.words || 0]
      )
    }
    res.json({ success: true, count: items.length })
  } catch (err) {
    console.error('stats sync error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
