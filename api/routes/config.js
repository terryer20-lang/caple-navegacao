/**
 * routes/config.js — 用戶設定 CRUD
 */
const { Router } = require('express')
const { query, execute } = require('../db')

const router = Router()

// GET /api/config — 拉取全部設定
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT config_key, config_value FROM user_config WHERE user_id = ?',
      [req.user.id]
    )
    const config = {}
    for (const row of rows) {
      config[row.config_key] = row.config_value
    }
    res.json({ config })
  } catch (err) {
    console.error('config get error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// PUT /api/config — 批量更新設定
router.put('/', async (req, res) => {
  try {
    const { config } = req.body
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'config 須為物件' })
    }
    for (const [key, value] of Object.entries(config)) {
      await execute(
        `INSERT INTO user_config (user_id, config_key, config_value)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
        [req.user.id, key, String(value)]
      )
    }
    res.json({ success: true })
  } catch (err) {
    console.error('config put error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
