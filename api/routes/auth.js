/**
 * routes/auth.js — 註冊 / 登錄
 */
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { query, execute } = require('../db')
const { sign } = require('../middleware/auth')

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 為必填' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼至少 6 位' })
    }

    // 檢查郵箱是否已註冊
    const existing = await query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ error: '此郵箱已註冊' })
    }

    const hash = await bcrypt.hash(password, 10)
    const result = await execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hash]
    )
    const token = sign({ id: result.insertId, email })
    res.status(201).json({ token, user: { id: result.insertId, email } })
  } catch (err) {
    console.error('register error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'email 和 password 為必填' })
    }

    const rows = await query('SELECT id, email, password FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: '郵箱未註冊' })
    }
    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: '密碼錯誤' })
    }
    const token = sign({ id: user.id, email: user.email })
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

module.exports = router
