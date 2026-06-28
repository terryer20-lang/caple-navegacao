/**
 * middleware/auth.js — JWT 驗證中間件
 */
const jwt = require('jsonwebtoken')

const SECRET = () => process.env.JWT_SECRET || 'dev-secret'

function sign(payload, expiresIn = '30d') {
  return jwt.sign(payload, SECRET(), { expiresIn })
}

function verify(token) {
  return jwt.verify(token, SECRET())
}

/** Express middleware: 從 Authorization header 解析 user */
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登錄，請提供 JWT' })
  }
  try {
    req.user = verify(header.slice(7))
    next()
  } catch {
    return res.status(401).json({ error: 'JWT 無效或已過期' })
  }
}

module.exports = { sign, verify, requireAuth }
