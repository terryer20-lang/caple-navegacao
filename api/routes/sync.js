/**
 * routes/sync.js — 一鍵全量同步（sync/all）
 */
const { Router } = require('express')
const { query } = require('../db')

const router = Router()

// GET /api/sync/all — 拉取該用戶全部數據
router.get('/all', async (req, res) => {
  try {
    const uid = req.user.id
    const [vocab, wrongWords, favorites, stats, configRows] = await Promise.all([
      query('SELECT pt, zh, pos, direction, source, created_at, updated_at FROM vocab WHERE user_id = ?', [uid]),
      query('SELECT id, pt, zh, pos, wrong_count, correct_count, stage, next_review FROM wrong_words WHERE user_id = ?', [uid]),
      query('SELECT pt, zh, type, src, created_at FROM favorites WHERE user_id = ?', [uid]),
      query('SELECT log_date, minutes, words FROM study_log WHERE user_id = ? ORDER BY log_date DESC', [uid]),
      query('SELECT config_key, config_value FROM user_config WHERE user_id = ?', [uid]),
    ])

    // 組裝 config 物件
    const config = {}
    for (const row of configRows) {
      config[row.config_key] = row.config_value
    }

    // 附帶 wrong_words 的 history
    const ids = wrongWords.map(w => w.id)
    let history = []
    if (ids.length > 0) {
      history = await query(
        'SELECT wrong_word_id, action, direction, reviewed_at FROM wrong_word_history WHERE wrong_word_id IN (?) ORDER BY reviewed_at',
        [ids]
      )
    }
    const historyMap = {}
    for (const h of history) {
      if (!historyMap[h.wrong_word_id]) historyMap[h.wrong_word_id] = []
      historyMap[h.wrong_word_id].push(h)
    }

    res.json({
      vocab: { items: vocab },
      wrong_words: { items: wrongWords.map(w => ({ ...w, history: historyMap[w.id] || [] })) },
      favorites: { items: favorites },
      stats: { items: stats },
      config: { items: config },
    })
  } catch (err) {
    console.error('sync/all error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
