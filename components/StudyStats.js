/**
 * components/StudyStats.js — 學習統計列：時鐘(HH:MM)+學習時長+連續天數（置頂）
 */
const StudyStats = {
  template: `
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1">
        <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
        <span class="text-sm text-slate-500 font-mono tracking-wider">{{ currentTime }}</span>
      </div>
      <div class="w-px h-3.5 bg-slate-200 shrink-0"></div>
      <div class="flex items-center gap-1">
        <i data-lucide="timer" class="w-3.5 h-3.5 text-slate-400"></i>
        <span class="text-sm text-slate-500">{{ todayMinutes }}min</span>
      </div>
      <div class="w-px h-3.5 bg-slate-200 shrink-0"></div>
      <span class="text-sm text-slate-500">{{ streakDays }}d</span>
    </div>
  `,
  data() {
    return {
      currentTime: '',
      timerId: null,
      _reactiveTick: 0,
    }
  },
  computed: {
    todayMinutes() {
      void this._reactiveTick
      return PTStore.getTodayMinutes()
    },
    streakDays() {
      void this._reactiveTick
      return PTStore.getStreakDays()
    },
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    },
    refreshStats() {
      this._reactiveTick++
    },
  },
  mounted() {
    this.updateTime()
    this.timerId = setInterval(() => this.updateTime(), 1000)
    this._statsInterval = setInterval(() => this.refreshStats(), 60000)
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId)
    if (this._statsInterval) clearInterval(this._statsInterval)
  },
}
