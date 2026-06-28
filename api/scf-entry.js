/**
 * scf-entry.js — SCF 打包入口（匹配 secretario-api 工作模式）
 */
import serverless from 'serverless-http'
import app from './index.js'

export const main = serverless(app)
