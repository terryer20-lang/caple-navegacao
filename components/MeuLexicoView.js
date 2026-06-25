/**
 * components/MeuLexicoView.js — 詞彙庫數據可視化儀表板
 * 純統計圖表，無背誦功能
 */
const MeuLexicoView = {
  template: `
    <div class="p-6 max-w-4xl mx-auto">

      <!-- ═══ HEADER ═══ -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-800">Minha Conta</h2>
      </div>

      <!-- ═══ TOP STATS ROW ═══ -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div class="glass-card rounded-glass p-3 sm:p-4 text-center">
          <p class="text-2xl sm:text-3xl font-bold text-azulejo">{{ totalUnique }}</p>
          <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Palavras únicas</p>
        </div>
        <div class="glass-card rounded-glass p-3 sm:p-4 text-center">
          <p class="text-2xl sm:text-3xl font-bold text-certo">{{ myVocabCount }}</p>
          <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">No meu léxico</p>
        </div>
        <div class="glass-card rounded-glass p-3 sm:p-4 text-center">
          <p class="text-2xl sm:text-3xl font-bold text-erro">{{ wrongCount }}</p>
          <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Palavras erradas</p>
        </div>
        <div class="glass-card rounded-glass p-3 sm:p-4 text-center">
          <p class="text-2xl sm:text-3xl font-bold text-lisboa">{{ todayMinutes }}</p>
          <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Min. hoje</p>
        </div>
        <div class="glass-card rounded-glass p-3 sm:p-4 text-center">
          <p class="text-2xl sm:text-3xl font-bold text-amber-500">{{ streakDays }}</p>
          <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">Dias seguidos</p>
        </div>
      </div>

      <!-- ═══ DIRECTIONS CROSS-SECTION ═══ -->
      <div class="glass-card rounded-glass p-5 mb-5">
        <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Distribuição por direção</p>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 w-16 shrink-0 text-right">CN→PT</span>
            <div class="flex-1 h-5 glass-panel rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :style="{ width: (maxDir > 0 ? zh2ptCount / maxDir * 100 : 0) + '%' }"
                   :class="zh2ptCount > 0 ? 'bg-azulejo' : ''"></div>
            </div>
            <span class="text-xs font-medium text-slate-600 w-12 text-right">{{ zh2ptCount }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 w-16 shrink-0 text-right">PT→CN</span>
            <div class="flex-1 h-5 glass-panel rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :style="{ width: (maxDir > 0 ? pt2zhCount / maxDir * 100 : 0) + '%' }"
                   :class="pt2zhCount > 0 ? 'bg-certo' : ''"></div>
            </div>
            <span class="text-xs font-medium text-slate-600 w-12 text-right">{{ pt2zhCount }}</span>
          </div>
        </div>
        <div v-if="totalUnique === 0" class="text-xs text-slate-300 mt-2 italic">Nenhuma palavra memorizada — pratique no Léxico para começar.</div>
      </div>

      <!-- ═══ CEFR DISTRIBUTION ═══ -->
      <div class="glass-card rounded-glass p-5 mb-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Distribuição QECR (no meu léxico)</p>
          <div class="flex glass-panel rounded-lg p-0.5">
            <button @click="cefrMode='zh2pt'" :class="cefrMode==='zh2pt' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500'"
                    class="btn-click px-2.5 py-1 text-[10px] font-medium rounded-md transition">CN→PT</button>
            <button @click="cefrMode='pt2zh'" :class="cefrMode==='pt2zh' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500'"
                    class="btn-click px-2.5 py-1 text-[10px] font-medium rounded-md transition">PT→CN</button>
          </div>
        </div>
        <div class="space-y-2.5">
          <div v-for="lv in cefrLevels" :key="lv.id" class="flex items-center gap-3">
            <span class="px-2 py-0.5 rounded text-xs font-bold min-w-[2.5rem] text-center shrink-0"
                  :class="lv.cls">{{ lv.id }}</span>
            <div class="flex-1 h-4 glass-panel rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :style="{ width: lv.pct + '%' }"
                   :class="lv.barCls"></div>
            </div>
            <span class="text-xs text-slate-500 shrink-0 flex items-center gap-1.5">
              <strong class="text-slate-700">{{ lv.count }}</strong>
              <span class="text-slate-300">/</span>
              <span class="text-slate-500">{{ lv.total }}</span>
              <span class="ml-1.5 text-[11px] font-bold" :class="lv.pct >= 100 ? 'text-certo' : 'text-azulejo'">{{ lv.pct }}%</span>
            </span>
          </div>
        </div>
        <div v-if="totalUnique === 0" class="text-xs text-slate-300 mt-2 italic">Memorize palavras no Léxico para ver a distribuição.</div>
      </div>

      <!-- ═══ WRONG WORD STAGES ═══ -->
      <div class="glass-card rounded-glass p-5 mb-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Estágios Ebbinghaus — Erros</p>
          <span class="text-[10px] text-slate-400">{{ wrongCount }} total · {{ dueWrongCount }} por rever hoje</span>
        </div>
        <div v-if="wrongCount > 0" class="flex items-end gap-1 h-24 mb-2">
          <div v-for="(n, i) in stageCounts" :key="i"
               class="flex-1 rounded-t transition-all duration-500 relative group"
               :class="stageBarCls(i)"
               :style="{ height: maxStage > 0 ? (n / maxStage * 100) + '%' : '4px' }"
               :title="'Estágio ' + (i+1) + ': ' + n + ' palavras'">
            <span v-if="n > 0" class="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-medium">{{ n }}</span>
          </div>
        </div>
        <div v-if="wrongCount > 0" class="flex justify-between text-[10px] text-slate-400 mt-1">
          <span v-for="(_, i) in [0,1,2,3,4,5]" :key="i">{{ stageLabel(i) }}</span>
        </div>
        <div v-if="wrongCount === 0" class="text-xs text-slate-300 italic">Nenhum erro registado — continue a praticar!</div>
      </div>

      <!-- ═══ CALENDÁRIO DE ATIVIDADE ═══ -->
      <div class="glass-card rounded-glass p-5 mb-5">
        <!-- Header: month navigation -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Atividade</p>
          <span class="text-[10px] text-slate-400">{{ monthTotal }} min · {{ monthActive }} dias ativos</span>
        </div>

        <div class="flex items-center justify-between mb-4">
          <button @click="prevMonth"
                  class="glass-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition btn-glow">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-700">{{ monthLabel }}</span>
            <span class="text-sm font-medium text-slate-400">{{ viewYear }}</span>
            <button v-if="!isCurrentMonth" @click="goToCurrentMonth"
                    class="px-2 py-0.5 rounded text-[10px] font-medium bg-azulejo/10 text-azulejo hover:bg-azulejo/20 transition">
              Hoje
            </button>
          </div>
          <button @click="nextMonth"
                  class="glass-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition btn-glow">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-1">
          <div v-for="hd in ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']" :key="'h-'+hd"
               class="text-center text-[10px] text-slate-400 font-medium py-1">{{ hd }}</div>
          <div v-for="(cell, ci) in monthGrid" :key="ci"
               class="min-h-[48px] sm:min-h-[56px] rounded-lg flex flex-col items-center justify-center text-xs transition-all duration-200 py-1 px-0.5"
               :class="cell.cls"
               :title="cell.title">
            <span :class="cell.txtCls + ' text-xs sm:text-sm font-semibold leading-tight'">{{ cell.day }}</span>
            <div v-if="cell.day > 0 && (cell.minutes > 0 || cell.words > 0)" class="flex flex-col items-center leading-tight mt-0.5">
              <span class="text-[9px] sm:text-[10px] font-medium" :class="cell.subCls">{{ cell.minutes }}m</span>
              <span class="text-[8px] sm:text-[9px]" :class="cell.subCls">{{ cell.words }}p</span>
            </div>
          </div>
        </div>

        <!-- Color legend -->
        <div class="flex items-center justify-center gap-3 mt-3 text-[10px] text-slate-400">
          <span>Sem atividade</span>
          <span class="w-3 h-3 rounded-sm inline-block bg-emerald-50 border border-emerald-100/30"></span>
          <span class="w-3 h-3 rounded-sm inline-block bg-emerald-100 border border-emerald-200/30"></span>
          <span class="w-3 h-3 rounded-sm inline-block bg-emerald-200 border border-emerald-300/30"></span>
          <span class="w-3 h-3 rounded-sm inline-block bg-certo border border-certo/30"></span>
          <span>≥45 min</span>
        </div>
      </div>

      <!-- ═══ SUMMARY ═══ -->
      <div class="glass-card rounded-glass p-5">
        <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Resumo</p>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="p-3 glass-panel rounded-lg">
            <p class="text-xs text-slate-400 mb-1">Exames realizados</p>
            <p class="text-base font-bold text-slate-700">{{ examCount }}</p>
          </div>
          <div class="p-3 glass-panel rounded-lg">
            <p class="text-xs text-slate-400 mb-1">Melhor nota</p>
            <p class="text-base font-bold text-certo">{{ bestExam }}%</p>
          </div>
          <div class="p-3 glass-panel rounded-lg">
            <p class="text-xs text-slate-400 mb-1">Dias de estudo</p>
            <p class="text-base font-bold text-slate-700">{{ totalStudyDays }}</p>
          </div>
          <div class="p-3 glass-panel rounded-lg">
            <p class="text-xs text-slate-400 mb-1">Tempo total (min)</p>
            <p class="text-base font-bold text-slate-700">{{ totalStudyMinutes.toLocaleString() }}</p>
          </div>
        </div>
      </div>

    </div>
  `,

  data() {
    return {
      _reactiveTick: 0,
      dictEntries: [],
      viewYear: new Date().getFullYear(),
      viewMonth: new Date().getMonth(),       // 0-indexed
      cefrMode: 'zh2pt',
    }
  },

  computed: {
    /* ─── 詞庫方向 ─── */
    zh2ptData() { return PTStore.getMyVocabForDirection('zh2pt') },
    pt2zhData() { return PTStore.getMyVocabForDirection('pt2zh') },
    zh2ptCount() { return this.zh2ptData.length },
    pt2zhCount() { return this.pt2zhData.length },
    bothCount() {
      const zhPts = new Set(this.zh2ptData.map(v => v.pt.toLowerCase()))
      let both = 0
      for (const v of this.pt2zhData) { if (zhPts.has(v.pt.toLowerCase())) both++ }
      return both
    },
    totalUnique() {
      const s = new Set()
      for (const v of this.zh2ptData) s.add(v.pt.toLowerCase())
      for (const v of this.pt2zhData) s.add(v.pt.toLowerCase())
      return s.size
    },
    myVocabCount() {
      const s = new Set()
      for (const v of this.zh2ptData) s.add(v.pt.toLowerCase())
      for (const v of this.pt2zhData) s.add(v.pt.toLowerCase())
      return s.size
    },
    maxDir() { return Math.max(this.zh2ptCount, this.pt2zhCount, 1) },

    /* ─── CEFR ─── */
    cefrLevels() {
      void this._reactiveTick
      const totalByLevel = {}
      for (const e of this.dictEntries) {
        const lv = e.lv || '?'
        totalByLevel[lv] = (totalByLevel[lv] || 0) + 1
      }
      const myPts = new Set()
      if (this.cefrMode === 'zh2pt') {
        for (const v of this.zh2ptData) myPts.add(v.pt.toLowerCase())
      } else if (this.cefrMode === 'pt2zh') {
        for (const v of this.pt2zhData) myPts.add(v.pt.toLowerCase())
      } else {
        for (const v of this.zh2ptData) myPts.add(v.pt.toLowerCase())
        for (const v of this.pt2zhData) myPts.add(v.pt.toLowerCase())
      }
      const myCounts = {}
      for (const e of this.dictEntries) {
        const lv = e.lv || '?'
        if (myPts.has(e.pt.toLowerCase())) {
          myCounts[lv] = (myCounts[lv] || 0) + 1
        }
      }
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      const cls = { A1:'bg-emerald-50 text-emerald-700 border border-emerald-200', A2:'bg-teal-50 text-teal-700 border border-teal-200', B1:'bg-sky-50 text-sky-700 border border-sky-200', B2:'bg-indigo-50 text-indigo-700 border border-indigo-200', C1:'bg-violet-50 text-violet-700 border border-violet-200', C2:'bg-rose-50 text-rose-700 border border-rose-200' }
      const barCls = { A1:'bg-emerald-400', A2:'bg-teal-400', B1:'bg-sky-400', B2:'bg-indigo-400', C1:'bg-violet-400', C2:'bg-rose-400' }
      return levels.map(id => ({
        id, cls: cls[id] || 'bg-slate-100 text-slate-600',
        barCls: barCls[id] || 'bg-slate-300',
        count: myCounts[id] || 0,
        total: totalByLevel[id] || 0,
        pct: (totalByLevel[id] || 0) > 0 ? Math.round(((myCounts[id] || 0) / (totalByLevel[id] || 1)) * 100) : 0,
      }))
    },
    baseVocabCount() { return this.dictEntries.length },

    /* ─── Ebbinghaus ─── */
    wrongCount() { return PTStore.getWrongWordCount() },
    dueWrongCount() { return PTStore.getDueWrongWords().length },
    stageCounts() {
      void this._reactiveTick
      const c = [0, 0, 0, 0, 0, 0]
      for (const w of PTStore.data.wrong_words) c[Math.min(w.stage, 5)]++
      return c
    },
    maxStage() { return Math.max(...this.stageCounts, 1) },
    stageBarCls() {
      return (i) => ['bg-rose-400','bg-orange-400','bg-amber-400','bg-yellow-400','bg-emerald-400','bg-teal-400'][Math.min(i, 5)]
    },
    stageLabel() {
      return (i) => ['①','②','③','④','⑤','⑥'][Math.min(i, 5)]
    },

    /* ─── Calendário Mensal ─── */
    monthLabel() {
      const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
      return names[this.viewMonth] || ''
    },
    isCurrentMonth() {
      const now = new Date()
      return this.viewYear === now.getFullYear() && this.viewMonth === now.getMonth()
    },
    monthGrid() {
      void this._reactiveTick
      const year = this.viewYear
      const month = this.viewMonth
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDow = new Date(year, month, 1).getDay()   // 0=Dom
      const cells = []
      // Padding cells before 1st
      for (let p = 0; p < firstDow; p++) cells.push({ day: 0, cls: '', txtCls: '', subCls: '', title: '', minutes: 0, words: 0 })
      // Day cells
      for (let d = 1; d <= daysInMonth; d++) {
        const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
        const entry = PTStore.data.study_log?.[key]
        const mins = entry?.minutes || 0
        const words = entry?.words || 0
        const isToday = this._isToday(year, month, d)
        let cls = 'bg-slate-50 border border-slate-100'
        let txtCls = 'text-slate-500'
        let subCls = 'text-slate-400'
        if (isToday) { cls = 'ring-2 ring-azulejo/50 border-azulejo/30 bg-white' }
        if (mins > 0) {
          if (mins >= 45) cls = (isToday ? 'ring-2 ring-certo/50 ' : '') + 'bg-certo border border-certo/30'
          else if (mins >= 20) cls = (isToday ? 'ring-2 ring-emerald-400/50 ' : '') + 'bg-emerald-200 border border-emerald-300/30'
          else if (mins >= 5) cls = (isToday ? 'ring-2 ring-emerald-300/50 ' : '') + 'bg-emerald-100 border border-emerald-200/30'
          else cls = (isToday ? 'ring-2 ring-emerald-200/50 ' : '') + 'bg-emerald-50 border border-emerald-100/30'
          txtCls = mins >= 20 ? 'text-white' : 'text-slate-700'
          subCls = mins >= 20 ? 'text-white/90' : 'text-slate-500'
        }
        cells.push({ day: d, minutes: mins, words, cls, txtCls, subCls, title: key + ' — ' + mins + ' min · ' + words + ' palavras' })
      }
      return cells
    },
    monthTotal() {
      void this._reactiveTick
      let total = 0
      const year = this.viewYear
      const month = this.viewMonth
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
        total += PTStore.data.study_log?.[key]?.minutes || 0
      }
      return total
    },
    monthActive() {
      void this._reactiveTick
      let count = 0
      const year = this.viewYear
      const month = this.viewMonth
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let d = 1; d <= daysInMonth; d++) {
        const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
        if (PTStore.data.study_log?.[key]?.minutes > 0) count++
      }
      return count
    },

    /* ─── Estudo hoje + sequência ─── */
    todayMinutes() {
      void this._reactiveTick
      return PTStore.getTodayMinutes()
    },
    streakDays() {
      void this._reactiveTick
      return PTStore.getStreakDays()
    },

    /* ─── Exames + Estatísticas ─── */
    examCount() {
      void this._reactiveTick
      return PTStore.getExamHistory().length
    },
    bestExam() {
      void this._reactiveTick
      const e = PTStore.getExamHistory()
      return e.length ? Math.max(...e.map(ex => ex.percent || 0)) : 0
    },
    totalStudyDays() {
      void this._reactiveTick
      return Object.keys(PTStore.data.study_log || {}).length
    },
    totalStudyMinutes() {
      void this._reactiveTick
      const log = PTStore.data.study_log || {}
      let total = 0
      for (const k of Object.keys(log)) total += log[k]?.minutes || 0
      return total
    },
  },

  methods: {
    loadDict() {
      let entries = []
      try {
        if (typeof UPLOADED_QECR_DATA !== 'undefined' && Array.isArray(UPLOADED_QECR_DATA)) entries.push(...UPLOADED_QECR_DATA)
      } catch (e) {}
      this.dictEntries = entries
    },
    refresh() { this._reactiveTick++ },

    /* ─── Navegação do calendário ─── */
    prevMonth() {
      if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear-- }
      else { this.viewMonth-- }
    },
    nextMonth() {
      if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++ }
      else { this.viewMonth++ }
    },
    goToCurrentMonth() {
      const now = new Date()
      this.viewYear = now.getFullYear()
      this.viewMonth = now.getMonth()
    },
    _isToday(year, month, day) {
      const now = new Date()
      return year === now.getFullYear() && month === now.getMonth() && day === now.getDate()
    },
  },

  mounted() {
    this.loadDict()
    this._statsInterval = setInterval(() => this.refresh(), 60000)
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  beforeUnmount() {
    if (this._statsInterval) clearInterval(this._statsInterval)
  },
}
