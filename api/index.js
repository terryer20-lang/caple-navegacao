/**
 * index.js — Express 應用入口
 * 可在本地 dev 用 node index.js 直接啟動
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { requireAuth } = require('./middleware/auth')

const app = express()

// ─── 中間件 ───
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// 健康檢查
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ─── 公開路由 ───
app.use('/api/auth', require('./routes/auth'))

// ─── 需認證路由 ───
app.use('/api/vocab', requireAuth, require('./routes/vocab'))
app.use('/api/wrong-words', requireAuth, require('./routes/wrong-words'))
app.use('/api/stats', requireAuth, require('./routes/stats'))
app.use('/api/favorites', requireAuth, require('./routes/favorites'))
app.use('/api/config', requireAuth, require('./routes/config'))
app.use('/api/sync', requireAuth, require('./routes/sync'))

// ─── 錯誤處理 ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: '內部伺服器錯誤' })
})

// ─── 本地開發用 ───
const PORT = process.env.PORT || 3001
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Semedo API running on http://localhost:${PORT}`)
  })
}

module.exports = app
