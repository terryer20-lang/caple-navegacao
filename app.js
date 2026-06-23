/**
 * app.js — Vue 3 應用啟動
 */
const { createApp } = Vue

const app = createApp({
  template: `<AppShell />`,
  components: { AppShell },
})

app.mount('#app')
