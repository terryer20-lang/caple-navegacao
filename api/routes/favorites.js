/**
 * routes/favorites.js — 收藏同步
 */
const { Router } = require('express')
const { query, execute } = require('../db')

const router = Router()

// GET /api/favorites — 拉取全部收藏
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT pt, zh, type, src, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ items: rows })
  } catch (err) {
    console.error('favorites list error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// POST /api/favorites/sync — 批量同步收藏
router.post('/sync', async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items 須為陣列' })
    }
    for (const item of items) {
      if (!item.pt) continue
      if (item._delete) {
        await execute(
          'DELETE FROM favorites WHERE user_id = ? AND pt = ? AND src = ?',
          [req.user.id, item.pt, item.src || '']
        )
      } else {
        await execute(
          `INSERT INTO favorites (user_id, pt, zh, type, src)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE zh = VALUES(zh), type = VALUES(type)`,
          [req.user.id, item.pt, item.zh || '', item.type || 'outro', item.src || '']
        )
      }
    }
    res.json({ success: true, count: items.length })
  } catch (err) {
    console.error('favorites sync error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
