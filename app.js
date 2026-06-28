/**
 * app.js — Vue 3 應用啟動
 */
const { createApp } = Vue

const app = createApp({
  template: `<AppShell />`,
  components: { AppShell },
})

app.mount('#app')

// 初始化同步管理器
if (typeof SyncManager !== 'undefined' && SyncManager.init) {
  SyncManager.init()
  // 如果已登入，啟動時同步一次
  if (SyncManager.isLoggedIn()) {
    SyncManager.sync().catch(e => console.warn('Initial sync:', e.message))
  }
}
