/**
 * scf_bootstrap.js — Tencent SCF 入口封裝
 *
 * 部署方式：
 * 1. 在 SCF 控制台創建「自定義運行時」Node.js 雲函數
 * 2. 觸發方式：API Gateway 觸發器
 * 3. 上傳整個 api/ 目錄（不含 node_modules，SCF 自動安裝）
 * 4. 處理函數：main_handler
 *
 * serverless-http 會自動將 API Gateway Event 轉為 Express req/res
 */
const serverless = require('serverless-http')
const app = require('./index')

// 同步模式
exports.main_handler = serverless(app)

// 非同步模式（如果用 async 觸發）
// exports.main_handler = async (event, context) => {
//   return await serverless(app)(event, context)
// }
