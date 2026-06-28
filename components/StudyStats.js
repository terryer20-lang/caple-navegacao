/**
 * components/StudyStats.js — 學習統計列：時鐘(HH:MM)+學習時長+連續天數（置頂）
 * 支援 GSAP count-up 動畫
 */
const StudyStats = {
  template: `
    <div class="flex items-center gap-3 cursor-pointer select-none anim-fade-in"
         @click="showStats = !showStats" title="Clique para ocultar/mostrar">
      <template v-if="showStats">
        <div class="flex items-center gap-1 stat-fade-up">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i>
          <span class="text-sm text-slate-500 font-mono tracking-wider stat-number">{{ currentTime }}</span>
        </div>
        <div class="w-px h-3.5 bg-slate-200 shrink-0"></div>
        <div class="flex items-center gap-1 stat-fade-up">
          <i data-lucide="timer" class="w-3.5 h-3.5 text-slate-400"></i>
          <span class="text-sm text-slate-500 stat-number" ref="minutesRef">{{ displayMinutes }}min</span>
        </div>
        <div class="w-px h-3.5 bg-slate-200 shrink-0"></div>
        <div class="flex items-center gap-1 stat-fade-up">
          <i data-lucide="flame" class="w-3.5 h-3.5" :class="streakDays > 0 ? 'text-amber-400' : 'text-slate-300'"></i>
          <span class="text-sm text-slate-500 stat-number" ref="streakRef">{{ displayStreak }}</span>
          <span v-if="streakDays > 0" class="text-[10px] text-slate-400">dias</span>
        </div>
      </template>
      <span v-else class="text-sm text-slate-300 tracking-widest">···</span>
    </div>
  `,
  data() {
    return {
      currentTime: '',
      timerId: null,
      _reactiveTick: 0,
      showStats: true,
      displayMinutes: '0',
      displayStreak: '0',
      _prevMinutes: 0,
      _prevStreak: 0,
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
    animateNumbers() {
      if (typeof Anim === 'undefined') return
      const minTarget = parseInt(this.todayMinutes) || 0
      const strTarget = parseInt(this.streakDays) || 0
      if (this.$refs.minutesRef && minTarget !== this._prevMinutes) {
        Anim.countUp(this.$refs.minutesRef, minTarget, 'min', 0.6)
        this._prevMinutes = minTarget
      }
      if (this.$refs.streakRef && strTarget !== this._prevStreak) {
        Anim.countUp(this.$refs.streakRef, strTarget, strTarget > 0 ? '' : '', 0.5)
        this._prevStreak = strTarget
      }
    },
  },
  mounted() {
    this.updateTime()
    this.timerId = setInterval(() => this.updateTime(), 1000)
    this._statsInterval = setInterval(() => this.refreshStats(), 60000)
    this.$nextTick(() => {
      lucide.createIcons()
      this.animateNumbers()
    })
    // 首次延遲動畫（等待 view 渲染）
    setTimeout(() => this.animateNumbers(), 300)
  },
  updated() {
    this.$nextTick(() => {
      lucide.createIcons()
      this.animateNumbers()
    })
  },
  beforeUnmount() {
    if (this.timerId) clearInterval(this.timerId)
    if (this._statsInterval) clearInterval(this._statsInterval)
  },
}
