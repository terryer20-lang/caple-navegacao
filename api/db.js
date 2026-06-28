/**
 * db.js — MySQL 連接池（mysql2/promise）
 * SCF 環境：連接在冷啟動時建立，後續復用
 */
const mysql = require('mysql2/promise')

let pool = null

function getPool() {
  if (pool) return pool
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'semedo',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: '+08:00',
    dateStrings: true,
  })
  return pool
}

async function query(sql, params = []) {
  const conn = await getPool().getConnection()
  try {
    const [rows] = await conn.query(sql, params)
    return rows
  } finally {
    conn.release()
  }
}

async function execute(sql, params = []) {
  const conn = await getPool().getConnection()
  try {
    const [result] = await conn.execute(sql, params)
    return result
  } finally {
    conn.release()
  }
}

module.exports = { getPool, query, execute }
