/**
 * components/ExamHistoryView.js — Revisão: CL/CO/PIE/Ditado/Leitura
 */
const ExamHistoryView = {
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="text-xl font-bold text-slate-800">Revisão</h2>
      </div>

      <!-- ═══ FILTERS ═══ -->
      <div class="glass-card rounded-glass p-4 mb-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Type filter -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs text-slate-500 font-medium">Tipo:</span>
            <button v-for="t in filterTypes" :key="t"
                    @click="fType = t"
                    :class="['px-3 py-1.5 rounded text-sm font-medium transition border',
                      fType === t
                        ? typeActiveClass(t)
                        : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">{{ t }}</button>
          </div>
          <!-- Level filter -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs text-slate-500 font-medium">Nível:</span>
            <button v-for="lv in filterLevels" :key="lv"
                    @click="fLevel = lv"
                    :class="['px-3 py-1.5 rounded text-sm font-medium transition border',
                      fLevel === lv
                        ? levelActiveClass(lv)
                        : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
              <span v-if="lv === 'Todas'">{{ lv }}</span>
              <span v-else><strong>{{ lv }}</strong></span>
            </button>
          </div>
          <!-- Time filter -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs text-slate-500 font-medium">Período:</span>
            <button v-for="t in filterTimes" :key="t"
                    @click="fTime = t; customTime = false"
                    :class="['px-3 py-1.5 rounded text-sm font-medium transition border',
                      fTime === t && !customTime ? 'bg-azulejo text-white border-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">{{ t }}</button>
            <button @click="customTime = true; fTime = 'Último'"
                    :class="['px-3 py-1.5 rounded text-sm font-medium transition border pill-hover btn-magnetic',
                      customTime ? 'bg-azulejo text-white border-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">Último</button>
            <div v-if="customTime" class="flex items-center gap-1">
              <input type="number" v-model.number="customNum" min="1" max="365"
                     class="w-14 px-2 py-1 text-xs glass-input rounded text-center focus:outline-none focus:ring-1 focus:ring-azulejo"
                     placeholder="N">
              <select v-model="customUnit"
                      class="px-2 py-1 text-xs glass-input rounded focus:outline-none focus:ring-1 focus:ring-azulejo">
                <option value="dias">dias</option>
                <option value="meses">meses</option>
                <option value="anos">anos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ STATS ═══ -->
      <div class="grid grid-cols-4 gap-3 mb-4">
        <div class="glass-card rounded-glass p-4 text-center">
          <p class="text-2xl font-bold text-slate-700">{{ filtered.length }}</p>
          <p class="text-xs text-slate-400">Filtr.</p>
        </div>
        <div class="glass-card rounded-glass p-4 text-center stat-fade-up">
          <p class="text-2xl font-bold text-slate-700 stat-number stat-glow-green">{{ monthCount }}</p>
          <p class="text-xs text-slate-400">Este mês</p>
        </div>
        <div class="glass-card rounded-glass p-4 text-center stat-fade-up">
          <p class="text-2xl font-bold text-slate-700 stat-number">{{ allEntries.length }}</p>
          <p class="text-xs text-slate-400">Total</p>
        </div>
        <div class="glass-card rounded-glass p-4 text-center stat-fade-up">
          <p class="text-2xl font-bold text-azulejo stat-number stat-glow-gold">{{ bestScore }}%</p>
          <p class="text-xs text-slate-400">Melhor</p>
        </div>
      </div>

      <!-- ═══ EMPTY ═══ -->
      <div v-if="filtered.length === 0" class="glass-card-strong rounded-glass p-8 text-center">
        <i data-lucide="file-text" class="w-10 h-10 mx-auto text-slate-300 mb-3"></i>
        <p class="text-slate-600 font-medium">Nenhum registo encontrado</p>
      </div>

      <!-- ═══ LIST ═══ -->
      <div v-for="(entry, ei) in filtered" :key="entry.id" class="glass-card rounded-glass mb-3 overflow-hidden card-hover list-glow">
        <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition" @click="toggleOpen(entry.id)">
          <div class="flex items-center gap-4">
            <!-- Score (exams) -->
            <div v-if="entry._type==='CL'||entry._type==='CO'||entry._type==='PIE'" class="text-center min-w-[3rem]">
              <p class="text-2xl font-bold" :class="gradeColor(entry.percent)">{{ entry.percent }}%</p>
              <p v-if="entry._type!=='PIE'" class="text-xs text-slate-400">{{ entry.correct }}/{{ entry.total }}</p>
            </div>
            <!-- Icon (Ditado/Leitura) -->
            <div v-else class="text-center min-w-[3rem] text-2xl">{{ entry._type==='Ditado' ? '🎧' : '📖' }}</div>
            <!-- Info -->
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-xs font-bold"
                      :class="entry.level?levelBadge(entry.level):'bg-slate-100 text-slate-500'">{{ entry.level || '—' }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                      :class="typeBadge(entry._type)">{{ entry._type }}</span>
                <span v-if="entry.examDifficulty" class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                      :class="diffBadge(entry.examDifficulty)">D:{{ entry.examDifficulty }}</span>
                <span class="text-xs text-slate-400">{{ formatDate(entry.date) }}</span>
              </div>
              <p v-if="entry._type==='Ditado'" class="text-xs text-slate-400 mt-0.5">{{ entry.audioName || 'Áudio' }} · {{ entry.transcript?.length || 0 }} caracteres</p>
              <p v-if="entry._type==='Leitura'" class="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{{ entry.textPreview }}...</p>
              <p v-if="entry.sourceText" class="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{{ entry.sourceText.slice(0,80) }}...</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="entry._type==='CL'||entry._type==='CO'||entry._type==='PIE'" class="px-2 py-0.5 rounded text-xs font-medium" :class="gradeBg(entry.percent)">{{ gradeLabel(entry.percent) }}</span>
            <button v-if="entry._saved" @click.stop="apagarExame(entry)" class="px-2 py-1 text-xs font-medium text-erro border border-red-200 rounded hover:bg-red-50 transition" title="Apagar exame">
              <i data-lucide="trash-2" class="w-3 h-3 inline"></i>
            </button>
            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform"
               :class="{'rotate-180': openIds[entry.id]}"></i>
          </div>
        </div>

        <!-- CL details -->
        <div v-if="openIds[entry.id] && entry._type==='CL'" class="border-t border-slate-200">
          <div class="px-4 pt-3 pb-1"><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Parte 1 — Compreensão da Leitura</p></div>
          <div v-for="(q, i) in entry.questions?.slice(0,6)" :key="'r1-'+i" class="px-4 py-3 border-b border-slate-200 last:border-0">
            <div class="flex items-start gap-3">
              <span class="shrink-0 mt-0.5">{{ entry.qgCorrect[i] ? '✅' : '❌' }}</span>
              <div class="flex-1">
                <p class="text-xs text-slate-500 mb-1">{{ i+1 }}. {{ q.question }}</p>
                <div class="text-xs space-y-0.5">
                  <p :class="entry.qgCorrect[i]?'text-certo':'text-erro'">Tua: <strong>{{ entry.userAnswers[i]||'(—)' }}</strong></p>
                  <p v-if="!entry.qgCorrect[i]" class="text-certo">Correta: <strong>{{ q.answer }}</strong></p>
                  <p v-if="q.explanation" class="text-slate-400 mt-1 italic">{{ q.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="px-4 pt-3 pb-1 border-t border-slate-200"><p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Parte 2 — Preenchimento</p></div>
          <div v-for="(q, i) in entry.questions?.slice(6)" :key="'r2-'+i" class="px-4 py-3 border-b border-slate-200 last:border-0">
            <div class="flex items-start gap-3">
              <span class="shrink-0 mt-0.5">{{ entry.qgCorrect[i+6] ? '✅' : '❌' }}</span>
              <div class="flex-1">
                <p class="text-xs text-slate-500 mb-1">{{ i+7 }}. {{ q.question }}</p>
                <div class="text-xs space-y-0.5">
                  <p :class="entry.qgCorrect[i+6]?'text-certo':'text-erro'">Tua: <strong>{{ entry.userAnswers[i+6]||'(—)' }}</strong></p>
                  <p v-if="!entry.qgCorrect[i+6]" class="text-certo">Correta: <strong>{{ q.answer }}</strong></p>
                  <p v-if="q.explanation" class="text-slate-400 mt-1 italic">{{ q.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- PIE details -->
        <div v-if="openIds[entry.id] && entry._type==='PIE'" class="border-t border-slate-200 p-4 text-center">
          <p class="text-2xl font-bold" :class="gradeColor(entry.percent)">{{ entry.percent || '—' }}%</p>
          <p class="text-xs text-slate-500 mt-1">Avaliado por DeepSeek</p>
          <div v-if="entry.comentario" class="mt-3 text-left text-xs text-slate-600 p-3 glass-panel rounded">{{ entry.comentario }}</div>
        </div>
        <!-- Ditado details -->
        <div v-if="openIds[entry.id] && entry._type==='Ditado'" class="border-t border-slate-200 p-4">
          <p class="text-xs text-slate-500 mb-2"><strong>Áudio:</strong> {{ entry.audioName || '—' }}</p>
          <p class="text-xs text-slate-500 mb-2"><strong>Nível:</strong> {{ entry.level || '—' }}</p>
          <p class="text-xs text-slate-500 mb-1"><strong>Transcrição:</strong></p>
          <div class="text-xs text-slate-700 p-3 glass-panel rounded whitespace-pre-wrap leading-relaxed">{{ entry.transcript || '(sem transcrição)' }}</div>
        </div>
        <!-- Leitura details -->
        <div v-if="openIds[entry.id] && entry._type==='Leitura'" class="border-t border-slate-200 p-4">
          <p class="text-xs text-slate-500 mb-2"><strong>Texto:</strong> {{ entry.textPreview }}</p>
          <p class="text-xs text-slate-500"><strong>Notas:</strong> {{ entry.notesCount }} linha{{ entry.notesCount !== 1 ? 's' : '' }} · {{ entry.wordCount }} palavras</p>
        </div>
        <!-- Exame (saved exam) details -->
        <div v-if="openIds[entry.id] && entry._saved" class="border-t border-slate-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500">Dificuldade: {{ entry.examDifficulty }}/100</p>
              <p v-if="entry._type==='PIE'" class="text-xs text-slate-500 mt-1">{{ entry.duracao }} · {{ entry.descrip }}</p>
              <p v-else class="text-xs text-slate-500">Duração: {{ entry.examDuration }} min · {{ entry.questionCount }} perguntas</p>
            </div>
            <button @click="reabrirExame(entry.examId)" class="px-4 py-2 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition">
              <i data-lucide="external-link" class="w-3.5 h-3.5 inline mr-1"></i>Reabrir
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      fType: 'Todas',
      fLevel: 'Todas',
      fTime: 'Tudo',
      customTime: false,
      customNum: 7,
      customUnit: 'dias',
      filterTypes: ['Todas', 'CL', 'CO', 'PIE', 'Ditado', 'Leitura', 'Exames'],
      filterLevels: ['Todas', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      filterTimes: ['Tudo', 'Este mês', 'Últimos 3 meses'],
      openIds: {},
    }
  },

  computed: {
    exams() { return PTStore.getExamHistory() },
    dictacoes() { return PTStore.getDictationHistory() },
    leituras() { return PTStore.getLeituraHistory() },

    /** Combine all entries with type markers */
    allEntries() {
      const list = []
      for (const ex of this.exams) {
        const type = this._exType(ex)
        list.push({ ...ex, _type: type })
      }
      for (const d of this.dictacoes) {
        list.push({ ...d, _type: 'Ditado' })
      }
      for (const l of this.leituras) {
        list.push({ ...l, _type: 'Leitura' })
      }
      // Saved exams from CAPLE_SAVED_EXAMS
      try {
        const saved = JSON.parse(localStorage.getItem('CAPLE_SAVED_EXAMS') || '[]')
        for (const s of saved) {
          // Derive actual exam type from examId
          let exType = 'Exames'
          if (s.examId.includes('_CL')) exType = 'CL'
          else if (s.examId.includes('_CO')) exType = 'CO'
          else if (s.examId.includes('_PIE')) exType = 'PIE'
          list.push({ ...s, _type: exType, _saved: true, id: s.examId })
        }
      } catch {}
      list.sort((a, b) => new Date(b.date||0) - new Date(a.date||0))
      return list
    },

    filtered() {
      let list = [...this.allEntries]
      // Type
      if (this.fType !== 'Todas') {
        if (this.fType === 'Exames') {
          list = list.filter(e => e._saved)
        } else {
          list = list.filter(e => e._type === this.fType)
        }
      }
      // Level
      if (this.fLevel !== 'Todas') list = list.filter(e => e.level === this.fLevel)
      // Time
      const now = new Date()
      if (this.fTime === 'Este mês') {
        list = list.filter(e => e.date && isSameMonth(new Date(e.date), now))
      } else if (this.fTime === 'Últimos 3 meses') {
        const d = new Date(); d.setMonth(d.getMonth() - 3)
        list = list.filter(e => e.date && new Date(e.date) >= d)
      } else if (this.customTime && this.customNum > 0) {
        const d = new Date()
        if (this.customUnit === 'dias') d.setDate(d.getDate() - this.customNum)
        else if (this.customUnit === 'meses') d.setMonth(d.getMonth() - this.customNum)
        else if (this.customUnit === 'anos') d.setFullYear(d.getFullYear() - this.customNum)
        list = list.filter(e => e.date && new Date(e.date) >= d)
      }
      return list
    },

    monthCount() {
      const now = new Date()
      return this.allEntries.filter(e => e.date && isSameMonth(new Date(e.date), now)).length
    },

    bestScore() {
      const e = this.filtered.filter(x => x._type==='CL'||x._type==='CO'||x._type==='PIE')
      return e.length ? Math.max(...e.map(ex => ex.percent || 0)) : 0
    },
  },

  methods: {
    _exType(ex) {
      const id = ex.id || ''
      if (ex._type === 'Exames') return 'Exames'
      if (id.includes('_CL')) return 'CL'
      if (id.includes('_CO')) return 'CO'
      if (id.includes('_PIE')) return 'PIE'
      return 'CL'
    },
    toggleOpen(id) { this.openIds[id] = !this.openIds[id] },
    formatDate(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    },
    gradeColor(p) { return p >= 85 ? 'text-teal-500' : p >= 70 ? 'text-certo' : p >= 55 ? 'text-lisboa' : 'text-erro' },
    gradeBg(p) { return p >= 85 ? 'bg-teal-50 text-teal-600' : p >= 70 ? 'bg-emerald-50 text-emerald-600' : p >= 55 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600' },
    gradeLabel(p) { return p >= 85 ? 'Muito Bom' : p >= 70 ? 'Bom' : p >= 55 ? 'Suficiente' : 'Insuficiente' },
    diffBadge(d) { return d >= 98 ? 'bg-red-500 text-white' : d >= 95 ? 'bg-rose-500 text-white' : d >= 90 ? 'bg-orange-400 text-white' : 'bg-amber-400 text-white' },

    typeActiveClass(t) {
      const m = { 'Todas':'bg-slate-800 text-white border-slate-800', 'CL':'bg-azulejo text-white border-azulejo',
        'CO':'bg-amber-600 text-white border-amber-600', 'PIE':'bg-rose-600 text-white border-rose-600',
        'Ditado':'bg-purple-600 text-white border-purple-600', 'Leitura':'bg-teal-600 text-white border-teal-600',
        'Exames':'bg-slate-600 text-white border-slate-600' }
      return m[t] || 'bg-slate-800 text-white border-slate-800'
    },
    levelActiveClass(lv) {
      if (lv === 'Todas') return 'bg-slate-800 text-white border-slate-800'
      const m = { 'A1':'bg-emerald-600 text-white border-emerald-600', 'A2':'bg-teal-600 text-white border-teal-600',
        'B1':'bg-sky-600 text-white border-sky-600', 'B2':'bg-indigo-500 text-white border-indigo-500',
        'C1':'bg-violet-500 text-white border-violet-500', 'C2':'bg-rose-500 text-white border-rose-500' }
      return m[lv] || 'bg-slate-600 text-white'
    },
    levelBadge(lv) {
      const m = { 'A1':'bg-emerald-50 text-emerald-700', 'A2':'bg-teal-50 text-teal-700', 'B1':'bg-sky-50 text-sky-700',
        'B2':'bg-indigo-50 text-indigo-700', 'C1':'bg-violet-50 text-violet-700', 'C2':'bg-rose-50 text-rose-700' }
      return m[lv] || 'bg-slate-100 text-slate-500'
    },
    typeBadge(t) {
      const m = { 'CL':'bg-blue-50 text-azulejo', 'CO':'bg-amber-50 text-amber-700', 'PIE':'bg-rose-50 text-rose-600',
        'Ditado':'bg-purple-50 text-purple-700', 'Leitura':'bg-teal-50 text-teal-700', 'Exames':'bg-slate-50 text-slate-600' }
      return m[t] || 'bg-slate-100 text-slate-500'
    },

    reabrirExame(examId) {
      try {
        const raw = localStorage.getItem('CAPLE_SAVED_FULL_' + examId)
        if (!raw) { alert('Dados do exame não encontrados. O ficheiro JSON foi descarregado — pode fazer upload manual.'); return }
        if (examId.includes('_PIE')) {
          localStorage.setItem('PIE_CURRENT_EXAM', raw)
          window.__OPEN_EXAM__('pie_exam.html')
        } else {
          localStorage.setItem('CL_CURRENT_EXAM', raw)
          window.__OPEN_EXAM__('cl_exam.html')
        }
      } catch(e) { alert('Erro ao reabrir: ' + e.message) }
    },

    apagarExame(entry) {
      if (!confirm(`Apagar exame ${entry.examId}?`)) return
      const examId = entry.examId
      // Remove from saved metadata list
      try {
        const saved = JSON.parse(localStorage.getItem('CAPLE_SAVED_EXAMS') || '[]')
        const idx = saved.findIndex(s => s.examId === examId)
        if (idx >= 0) saved.splice(idx, 1)
        localStorage.setItem('CAPLE_SAVED_EXAMS', JSON.stringify(saved))
      } catch {}
      // Remove full data
      try { localStorage.removeItem('CAPLE_SAVED_FULL_' + examId) } catch {}
      alert(`Exame ${examId} apagado. O ficheiro ${examId}.json em Exames/ pode ser apagado manualmente.`)
    },
  },

  mounted() { this.$nextTick(() => lucide.createIcons()) },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}

function isSameMonth(a, b) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}
