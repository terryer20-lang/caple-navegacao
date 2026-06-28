/**
 * routes/vocab.js — 我的詞庫 CRUD + 批量同步
 */
const { Router } = require('express')
const { query, execute } = require('../db')

const router = Router()

// GET /api/vocab — 拉取全部詞庫
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT pt, zh, pos, direction, source, created_at, updated_at FROM vocab WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ items: rows })
  } catch (err) {
    console.error('vocab list error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// POST /api/vocab/upsert — 新增/更新一個詞
router.post('/upsert', async (req, res) => {
  try {
    const { pt, zh, pos, direction, source } = req.body
    if (!pt || !zh || !direction) {
      return res.status(400).json({ error: 'pt, zh, direction 為必填' })
    }
    if (!['zh2pt', 'pt2zh'].includes(direction)) {
      return res.status(400).json({ error: 'direction 須為 zh2pt 或 pt2zh' })
    }
    await execute(
      `INSERT INTO vocab (user_id, pt, zh, pos, direction, source)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE zh = VALUES(zh), pos = VALUES(pos), source = VALUES(source)`,
      [req.user.id, pt, zh, pos || '', direction, source || 'manual']
    )
    res.json({ success: true })
  } catch (err) {
    console.error('vocab upsert error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// POST /api/vocab/batch — 批量同步
router.post('/batch', async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items 須為陣列' })
    }
    for (const item of items) {
      if (!item.pt || !item.zh || !item.direction) continue
      await execute(
        `INSERT INTO vocab (user_id, pt, zh, pos, direction, source)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE zh = VALUES(zh), pos = VALUES(pos), source = VALUES(source)`,
        [req.user.id, item.pt, item.zh, item.pos || '', item.direction, item.source || 'manual']
      )
    }
    res.json({ success: true, count: items.length })
  } catch (err) {
    console.error('vocab batch error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// DELETE /api/vocab/:pt — 刪除一個詞（可選 direction 參數）
router.delete('/:pt', async (req, res) => {
  try {
    const { pt } = req.params
    const direction = req.query.direction // 可選
    if (direction) {
      await execute('DELETE FROM vocab WHERE user_id = ? AND pt = ? AND direction = ?',
        [req.user.id, pt, direction])
    } else {
      await execute('DELETE FROM vocab WHERE user_id = ? AND pt = ?',
        [req.user.id, pt])
    }
    res.json({ success: true })
  } catch (err) {
    console.error('vocab delete error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
