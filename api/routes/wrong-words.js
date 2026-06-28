/**
 * routes/wrong-words.js — 錯題本 SRS 同步
 */
const { Router } = require('express')
const { query, execute } = require('../db')

// TencentDB 不接受 ISO 8601，須轉為 YYYY-MM-DD HH:MM:SS
function toMysqlDatetime(iso) {
  if (!iso) return new Date().toISOString().replace('T', ' ').split('.')[0]
  return iso.replace('T', ' ').split('.')[0].replace('Z', '')
}

const router = Router()

// GET /api/wrong-words — 拉取全部錯題
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, pt, zh, pos, wrong_count, correct_count, stage, next_review, created_at, updated_at
       FROM wrong_words WHERE user_id = ? ORDER BY next_review ASC`,
      [req.user.id]
    )
    // 附帶每條的 history
    const ids = rows.map(r => r.id)
    let history = []
    if (ids.length > 0) {
      history = await query(
        `SELECT wrong_word_id, action, direction, reviewed_at FROM wrong_word_history WHERE wrong_word_id IN (?) ORDER BY reviewed_at ASC`,
        [ids]
      )
    }
    // 分組
    const historyMap = {}
    for (const h of history) {
      if (!historyMap[h.wrong_word_id]) historyMap[h.wrong_word_id] = []
      historyMap[h.wrong_word_id].push(h)
    }
    const items = rows.map(r => ({ ...r, history: historyMap[r.id] || [] }))
    res.json({ items })
  } catch (err) {
    console.error('wrong-words list error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// POST /api/wrong-words/sync — 合併錯題記錄
router.post('/sync', async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items 須為陣列' })
    }
    for (const item of items) {
      if (!item.pt) continue
      // 檢查是否已存在
      const existing = await query(
        'SELECT id, stage, wrong_count, correct_count FROM wrong_words WHERE user_id = ? AND pt = ?',
        [req.user.id, item.pt]
      )
      if (existing.length > 0) {
        const e = existing[0]
        // Last-write-wins: 只用服務器最新的 wrong_count, stage
        // 但客戶端有更新的歷史則追加
        await execute(
          `UPDATE wrong_words SET
            zh = ?, pos = ?, wrong_count = GREATEST(wrong_count, ?),
            correct_count = GREATEST(correct_count, ?),
            stage = GREATEST(stage, ?),
            next_review = CASE WHEN ? > stage THEN ? ELSE next_review END
           WHERE id = ?`,
          [item.zh || '', item.pos || '',
           item.wrong_count || 0, item.correct_count || 0,
           item.stage || 0, item.stage || 0, toMysqlDatetime(item.next_review),
           e.id]
        )
        // 追加新的 history 記錄
        if (Array.isArray(item.history)) {
          for (const h of item.history) {
            await execute(
              'INSERT IGNORE INTO wrong_word_history (wrong_word_id, action, direction, reviewed_at) VALUES (?, ?, ?, ?)',
              [e.id, h.action || 'wrong', h.direction || '', toMysqlDatetime(h.reviewed_at)]
            )
          }
        }
      } else {
        // 新增
        const result = await execute(
          `INSERT INTO wrong_words (user_id, pt, zh, pos, wrong_count, correct_count, stage, next_review)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, item.pt, item.zh || '', item.pos || '',
           item.wrong_count || 1, item.correct_count || 0,
           item.stage || 0, toMysqlDatetime(item.next_review)]
        )
        if (Array.isArray(item.history)) {
          for (const h of item.history) {
            await execute(
              'INSERT INTO wrong_word_history (wrong_word_id, action, direction, reviewed_at) VALUES (?, ?, ?, ?)',
              [result.insertId, h.action || 'wrong', h.direction || '', toMysqlDatetime(h.reviewed_at)]
            )
          }
        }
      }
    }
    res.json({ success: true, count: items.length })
  } catch (err) {
    console.error('wrong-words sync error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
