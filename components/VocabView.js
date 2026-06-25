/**
 * components/VocabView.js — Vocabulário c/ upload CSV + 背誦
 */
const VocabView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- ═══ HEADER ═══ -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Léxicos</h2>
          <p class="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">Vocabulário</p>
        </div>
        <!-- Upload button (só no modo praticar) -->
        <div class="flex items-center gap-2">
          <button v-if="subTab==='praticar'" @click="showUpload = true"
                  class="btn-glow btn-magnetic px-3 py-2 rounded-lg text-xs font-medium glass-btn border border-slate-200 text-slate-500 hover:bg-slate-50 transition flex items-center gap-1.5">
            <i data-lucide="upload" class="w-3.5 h-3.5"></i>
            Upload CSV
          </button>
        </div>
      </div>

      <!-- ═══ SUB-TABS ═══ -->
      <div class="flex gap-2 mb-5">
        <button @click="subTab='praticar'"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition border btn-click',
                  subTab==='praticar' ? 'bg-azulejo/8 border-azulejo/25 text-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
          <i data-lucide="play" class="w-3.5 h-3.5 inline mr-1"></i>Praticar
        </button>
        <button @click="subTab='meu-lexico'"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition border btn-click',
                  subTab==='meu-lexico' ? 'bg-azulejo/8 border-azulejo/25 text-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
          <i data-lucide="book-marked" class="w-3.5 h-3.5 inline mr-1"></i>Meu Léxico
          <span v-if="myVocabTotal > 0" class="ml-1 text-[10px] opacity-70">({{ myVocabTotal }})</span>
        </button>
      </div>

      <!-- ═══ SUB-TAB: PRATICAR ═══ -->
      <template v-if="subTab === 'praticar'">

      <!-- CEFR Level Selector -->
      <div class="glass-card rounded-glass p-4 mb-3 anim-fade-in-up relative">
        <div class="tile-corner tile-corner-br"></div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs text-slate-500 font-medium">Nível / Coleção</label>
          <!-- Direction toggle -->
          <div class="flex glass-panel rounded-lg p-0.5">
            <button @click="mode='zh2pt'" :class="mode==='zh2pt' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500'"
                    class="btn-click px-3 py-1.5 text-xs font-medium rounded-md transition">CN→PT</button>
            <button @click="mode='pt2zh'" :class="mode==='pt2zh' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500'"
                    class="btn-click px-3 py-1.5 text-xs font-medium rounded-md transition">PT→CN</button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="lv in levels" :key="lv.id"
                  @click="selectLevel(lv.id)"
                  :class="['btn-click px-4 py-2 rounded-lg text-sm font-medium transition border',
                    selectedLevel === lv.id
                      ? lv.id==='A1'?'bg-emerald-50 border-emerald-400 text-emerald-700'
                        :lv.id==='A2'?'bg-teal-50 border-teal-400 text-teal-700'
                        :lv.id==='B1'?'bg-sky-50 border-sky-400 text-sky-700'
                        :lv.id==='B2'?'bg-indigo-50 border-indigo-400 text-indigo-700'
                        :lv.id==='C1'?'bg-violet-50 border-violet-400 text-violet-700'
                        :lv.id==='C2'?'bg-rose-50 border-rose-400 text-rose-700'
                        : 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50'
                  ]">
            <span class="font-bold">{{ lv.id }}</span>
            <span class="text-[10px] opacity-70 ml-0.5">{{ levelLabel(lv.id) }}</span>
            <span class="ml-1 opacity-70">({{ lv.count }}/{{ lv.total }})</span>
          </button>
        </div>
        <p class="text-xs text-slate-400 mt-2">{{ levelDesc }}</p>
      </div>

      <!-- ═══ IDLE ═══ -->
      <div v-if="!flowActive && !roundComplete" class="glass-card-strong rounded-glass p-8 text-center card-border-glow">
        <i data-lucide="book-open" class="w-10 h-10 mx-auto text-slate-200 mb-3"></i>
        <p class="text-slate-600 font-medium mb-1">
          {{ selectedLevel ? (poolSize > 0 ? 'Pronto para praticar?' : 'Sem palavras disponíveis') : 'Selecione um nível acima' }}
        </p>
        <p v-if="selectedLevel && poolSize > 0" class="text-sm text-slate-400 mb-4">{{ poolSize.toLocaleString() }} palavras disponíveis</p>
        <p v-else-if="selectedLevel && poolSize === 0" class="text-sm text-slate-400 mb-5">Nenhuma palavra — faça upload de um ficheiro CSV.</p>
        <p v-else-if="!selectedLevel" class="text-sm text-slate-400 mb-5">Escolha o nível ou a coleção para começar.</p>

        <div v-if="selectedLevel && poolSize > 0" class="flex items-center justify-center gap-2 mb-4">
          <span class="text-xs text-slate-400 font-medium">N.º de palavras:</span>
          <div class="flex gap-1">
            <button v-for="n in [10,20,30,40,50]" :key="n" @click="roundSize=n; customSize=null"
                    :class="['px-4 py-2 rounded text-sm font-medium transition border',
                      roundSize===n && !customSize ? 'bg-azulejo text-white border-azulejo' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
              {{ n }}
            </button>
            <button @click="roundSize=-1; customSize=null"
                    :class="['px-4 py-2 rounded text-sm font-medium transition border',
                      roundSize===-1 ? 'bg-rose-500 text-white border-rose-500' : 'glass-btn text-slate-500 border-slate-200 hover:bg-slate-50']">
              ∞
            </button>
          </div>
          <div class="relative w-14">
            <input type="number" v-model.number="customSize" min="1" max="200"
                   @focus="roundSize=customSize||roundSize"
                   class="w-full px-2 py-1 text-xs glass-input rounded text-center focus:outline-none focus:ring-1 focus:ring-azulejo"
                   placeholder="N">
          </div>
        </div>

        <button v-if="selectedLevel && poolSize > 0" @click="startRound"
                class="px-6 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition btn-glow btn-magnetic">Iniciar Ronda</button>
      </div>

      <!-- ═══ UPLOAD MODAL ═══ -->
      <transition name="scale">
        <div v-if="showUpload" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             style="background:rgba(0,0,0,0.08);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)"
             @click.self="showUpload = false">
          <div class="glass-card-strong rounded-glass-lg w-full max-w-lg p-6 shadow-glass-lg" @click.stop>
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-bold text-slate-800">Upload CSV</h3>
              <button @click="showUpload = false" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>

            <!-- Format hint -->
            <div class="mb-4 p-3 glass-panel rounded-lg text-xs text-slate-500 leading-relaxed">
              <strong class="text-slate-600">Formato CSV (separador: <code class="text-[11px]">;</code>)</strong><br>
              <code class="text-[10px]">葡文;中文;詳細詞性;例句;固定介詞搭配</code>
              <div class="mt-2 space-y-0.5">
                <div><span class="text-slate-600 font-medium">1. 葡文</span> — palavra ou expressão em português</div>
                <div><span class="text-slate-600 font-medium">2. 中文</span> — tradução em chinês</div>
                <div><span class="text-slate-600 font-medium">3. 詳細詞性</span> — classe gramatical detalhada (ex: <span class="text-slate-600">v. t.</span>, <span class="text-slate-600">adj.</span>, <span class="text-slate-600">s. f.</span>, <span class="text-slate-600">loc. adv.</span>)</div>
                <div><span class="text-slate-600 font-medium">4. 例句</span> — frase de exemplo em português</div>
                <div><span class="text-slate-600 font-medium">5. 固定介詞搭配</span> — regência ou preposição fixa (opcional)</div>
              </div>
              <div class="mt-2 pt-2 border-t border-slate-100">
                <strong class="text-slate-600">Exemplo:</strong><br>
                <code class="text-[10px]">acordar cedo;早起;v. i.;Acordo cedo todos os dias para trabalhar.;</code>
              </div>
            </div>

            <!-- Drag & drop zone -->
            <div @dragover.prevent="dragOver=true" @dragleave.prevent="dragOver=false"
                 @drop.prevent="onDrop"
                 @click="$refs.fileInput.click()"
                 :class="['relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-4',
                   dragOver ? 'border-azulejo bg-azulejo/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50']">
              <input ref="fileInput" type="file" accept=".csv" @change="onFileChange" class="hidden">
              <i data-lucide="file-text" class="w-8 h-8 mx-auto mb-2" :class="fileName ? 'text-azulejo' : 'text-slate-300'"></i>
              <p v-if="!fileName" class="text-sm text-slate-500">Arraste o CSV aqui ou <span class="text-azulejo underline">clique para procurar</span></p>
              <p v-if="fileName" class="text-sm font-medium text-azulejo">{{ fileName }}</p>
              <p v-if="parsedCount > 0" class="text-xs text-slate-400 mt-1">{{ parsedCount }} palavras lidas</p>
              <p v-if="parseError" class="text-xs text-erro mt-1">{{ parseError }}</p>
            </div>

            <!-- Level / Label -->
            <div class="flex gap-3 mb-5">
              <div class="flex-1">
                <label class="block text-xs text-slate-500 font-medium mb-1.5">Nível QECR</label>
                <select v-model="uploadLevel"
                        class="w-full px-3 py-2 glass-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo appearance-none">
                  <option value="">— Nenhum —</option>
                  <option v-for="lv in ['A1','A2','B1','B2','C1','C2']" :key="lv" :value="lv">{{ lv }}</option>
                </select>
              </div>
              <div class="flex-1">
                <label class="block text-xs text-slate-500 font-medium mb-1.5">Nome da coleção <span class="text-slate-300">(opcional)</span></label>
                <input type="text" v-model="uploadLabel" maxlength="32"
                       class="w-full px-3 py-2 glass-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo"
                       placeholder="Ex: Viagem, Negócios...">
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 justify-end">
              <button @click="showUpload = false" class="px-4 py-2 text-sm font-medium glass-btn rounded-lg btn-glow">Cancelar</button>
              <button @click="confirmUpload" :disabled="parsedData.length === 0"
                      class="px-5 py-2 text-sm font-medium glass-btn-primary rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition btn-glow btn-magnetic">
                <i data-lucide="check" class="w-4 h-4 inline mr-1"></i>Confirmar upload
              </button>
            </div>
          </div>
        </div>
      </transition>

      </template><!-- /praticar -->

      <!-- ═══ SUB-TAB: MEU LÉXICO ═══ -->
      <template v-if="subTab === 'meu-lexico'">
        <div class="glass-card rounded-glass p-5 anim-fade-in-up">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-bold text-slate-700">Palavras memorizadas</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ myVocabTotal }} palavra{{ myVocabTotal !== 1 ? 's' : '' }}</p>
            </div>
            <!-- Direction toggle -->
            <div class="flex glass-panel rounded-lg p-0.5">
              <button @click="mode='zh2pt'" :class="mode==='zh2pt' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500'"
                      class="btn-click px-3 py-1.5 text-xs font-medium rounded-md transition">CN→PT</button>
              <button @click="mode='pt2zh'" :class="mode==='pt2zh' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500'"
                      class="btn-click px-3 py-1.5 text-xs font-medium rounded-md transition">PT→CN</button>
            </div>
          </div>

          <!-- Word list -->
          <div v-if="myVocabList.length > 0" class="space-y-1.5 max-h-[60vh] overflow-y-auto">
            <div v-for="(w, i) in myVocabList" :key="w.pt + i"
                 class="flex items-center justify-between p-3 rounded-lg glass-panel hover:bg-white/50 transition group">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ w.pt }}</p>
                <p class="text-xs text-slate-500 truncate">{{ w.zh }}<span v-if="w.pos" class="ml-1.5 text-[10px] text-slate-400">({{ w.pos }})</span></p>
              </div>
              <button @click="removeFromMyVocab(w)"
                      class="ml-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-erro hover:bg-erro/5"
                      title="Remover">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <i data-lucide="book-open" class="w-8 h-8 mx-auto text-slate-200 mb-2"></i>
            <p class="text-sm text-slate-500">Nenhuma palavra memorizada ainda.</p>
            <p class="text-xs text-slate-400 mt-1">As palavras acertadas nas rondas de vocabulário e de erros serão adicionadas automaticamente.</p>
          </div>
        </div>
      </template>

    </div>
  `,

  data() {
    return {
      mode: 'zh2pt',
      subTab: 'praticar',
      dictEntries: [],
      selectedLevel: null,
      roundSize: 10,
      customSize: null,
      roundWords: [],
      currentIdx: 0,
      userInput: '',
      feedback: null,
      rated: false,
      roundResults: [],
      showPt2zhAnswer: false,
      autoAdvanceTimer: null,
      roundComplete: false,
      roundReady: false,
      isWrongReviewMode: false,
      /* Upload modal */
      showUpload: false,
      dragOver: false,
      fileName: '',
      parsedData: [],
      parsedCount: 0,
      parseError: '',
      uploadLevel: '',
      uploadLabel: '',
    }
  },

  computed: {
    levels() {
      const counts = {}
      // Collect all unique lv values (both built-in and uploaded)
      for (const e of this.dictEntries) {
        const lv = e.lv || '—'
        counts[lv] = (counts[lv] || 0) + 1
      }
      const myPts = new Set(PTStore.getMyVocabForDirection(this.mode).map(v => v.pt.toLowerCase()))
      const myCounts = {}
      for (const e of this.dictEntries) {
        const lv = e.lv || '—'
        if (myPts.has(e.pt.toLowerCase())) myCounts[lv] = (myCounts[lv] || 0) + 1
      }
      // Built-in A1-C2 always shown even if empty
      const order = ['A1','A2','B1','B2','C1','C2']
      const result = order.map(id => ({
        id,
        count: (counts[id] || 0) - (myCounts[id] || 0),
        total: counts[id] || 0,
      }))
      // Also add custom labels
      const customLvs = Object.keys(counts).filter(k => !order.includes(k))
      for (const label of customLvs) {
        result.push({
          id: label,
          count: (counts[label] || 0) - (myCounts[label] || 0),
          total: counts[label] || 0,
        })
      }
      return result
    },
    poolSize() {
      if (!this.selectedLevel) return 0
      const myPts = new Set(PTStore.getMyVocabForDirection(this.mode).map(v => v.pt.toLowerCase()))
      const total = this.dictEntries.filter(e => (e.lv || '—') === this.selectedLevel).length
      const mine = this.dictEntries.filter(e => (e.lv || '—') === this.selectedLevel && myPts.has(e.pt.toLowerCase())).length
      return total - mine
    },
    myVocabCount() {
      return PTStore.getMyVocabForDirection(this.mode).length
    },
    myVocabTotal() {
      const s = new Set()
      PTStore.getMyVocabForDirection('zh2pt').forEach(v => s.add(v.pt.toLowerCase()))
      PTStore.getMyVocabForDirection('pt2zh').forEach(v => s.add(v.pt.toLowerCase()))
      return s.size
    },
    myVocabList() {
      return PTStore.getMyVocabForDirection(this.mode)
    },
    myVocabBreakdown() {
      const modeData = PTStore.getMyVocabForDirection(this.mode)
      const byLevel = {}
      for (const v of modeData) {
        const entry = this.dictEntries.find(e => e.pt.toLowerCase() === (v.pt || '').toLowerCase())
        const lv = entry?.lv || '?'
        if (!byLevel[lv]) byLevel[lv] = 0
        byLevel[lv]++
      }
      return Object.entries(byLevel).map(([level, count]) => ({ level, count })).sort((a, b) => {
        const order = ['A1','A2','B1','B2','C1','C2']
        return order.indexOf(a.level) - order.indexOf(b.level)
      })
    },
    currentWord() {
      return this.currentIdx < this.roundWords.length ? this.roundWords[this.currentIdx] : null
    },
    flowActive() {
      return this.roundWords.length > 0 && !this.roundComplete
    },
    totalWrong() {
      return PTStore.getWrongWordCount()
    },
    dueCount() {
      return PTStore.getDueWrongWords().length
    },
    levelDesc() {
      const d = {
        A1:'Iniciação — palavras básicas do dia a dia',
        A2:'Elementar — situações quotidianas',
        B1:'Limiar — opiniões simples',
        B2:'Vantagem — discurso abstracto',
        C1:'Autonomia — expressões sofisticadas',
        C2:'Mestria — domínio completo',
      }
      if (d[this.selectedLevel]) return d[this.selectedLevel]
      if (this.selectedLevel && !['A1','A2','B1','B2','C1','C2'].includes(this.selectedLevel)) {
        return 'Coleção personalizada: ' + this.selectedLevel
      }
      return ''
    },
  },

  methods: {
    levelLabel(lv) {
      return { A1:'ACESSO', A2:'CIPLE', B1:'DEPLE', B2:'DIPLE', C1:'DAPLE', C2:'DUPLE' }[lv] || ''
    },
    selectLevel(lv) { this.selectedLevel = lv; this.resetRound() },
    resetRound() {
      this.roundWords=[]; this.currentIdx=0; this.userInput=''; this.feedback=null;
      this.rated=false; this.roundResults=[]; this.showPt2zhAnswer=false;
      this.roundComplete=false;
      if (this.autoAdvanceTimer) { clearTimeout(this.autoAdvanceTimer); this.autoAdvanceTimer=null }
    },
    startRound() {
      if (!this.selectedLevel) return
      PTStore.logActivity()
      const pool = this.dictEntries.filter(e => (e.lv || '—') === this.selectedLevel)
      if (!pool.length) return
      const unlimited = this.roundSize === -1
      const count = unlimited ? pool.length : this.roundSize
      const copy = [...pool]; const picked = []
      for (let i = 0; i < count && copy.length > 0; i++) picked.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0])
      const roundData = { words: picked, mode: this.mode, level: this.selectedLevel, roundSize: unlimited ? -1 : this.roundSize, isUnlimited: unlimited, timestamp: Date.now() }
      try {
        localStorage.setItem('LEXICO_CURRENT_ROUND', JSON.stringify(roundData))
        window.open('lexico_exam.html', '_blank')
        this.roundReady = true
        this.resetRound()
      } catch (e) { console.warn('Erro ao abrir janela:', e) }
    },

    /* ─── CSV Upload ─── */
    onDrop(e) {
      this.dragOver = false
      const file = e.dataTransfer?.files?.[0]
      if (file) this._readCSV(file)
    },
    onFileChange(e) {
      const file = e.target?.files?.[0]
      if (file) this._readCSV(file)
    },
    _readCSV(file) {
      if (!file.name.endsWith('.csv')) {
        this.parseError = 'Apenas ficheiros .csv são suportados.'
        return
      }
      this.parseError = ''
      this.fileName = file.name
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        this._parseCSV(text)
      }
      reader.readAsText(file, 'UTF-8')
    },
    _parseCSV(text) {
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) {
        this.parseError = 'Ficheiro vazio ou formato inválido.'
        return
      }
      // Auto-detect delimiter
      const firstLine = lines[1]
      const commaCount = (firstLine.match(/,/g) || []).length
      const semiCount = (firstLine.match(/;/g) || []).length
      const d = semiCount >= commaCount ? ';' : ','

      // Parse line with quoted-field support
      const parseLine = (line) => {
        const fields = []
        let cur = '', inQ = false
        for (let i = 0; i < line.length; i++) {
          const ch = line[i]
          if (ch === '"') { inQ = !inQ; continue }
          if (ch === d && !inQ) { fields.push(cur.trim()); cur = ''; continue }
          cur += ch
        }
        fields.push(cur.trim())
        return fields
      }

      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const parts = parseLine(lines[i])
        if (parts.length >= 2) {
          const pt = parts[0].trim()
          const zh = parts[1].trim()
          const pos = parts[2]?.trim() || ''
          const example = parts[3]?.trim() || ''
          const prep = parts[4]?.trim() || ''
          if (pt && zh) {
            rows.push({ pt, zh, pos, example, prep })
          }
        }
      }
      if (rows.length === 0) {
        this.parseError = 'Nenhuma palavra válida encontrada. O formato deve ser: 葡文;中文;詳細詞性;例句;固定介詞搭配'
        return
      }
      this.parsedData = rows
      this.parsedCount = rows.length
    },
    confirmUpload() {
      if (this.parsedData.length === 0) return
      const lv = this.uploadLevel || this.uploadLabel || '—'
      const label = this.uploadLabel || lv
      const entries = this.parsedData.map(d => ({ ...d, lv, label }))
      // Merge with existing uploaded data in localStorage
      const KEY = 'UPLOADED_VOCAB_DATA'
      let existing = []
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) existing = JSON.parse(raw)
      } catch {}
      existing.push(...entries)
      try {
        localStorage.setItem(KEY, JSON.stringify(existing))
      } catch (e) {
        this.parseError = 'Erro ao guardar: ' + e.message
        return
      }
      // Reload dict
      this.loadDict()
      this.parsedData = []
      this.parsedCount = 0
      this.fileName = ''
      this.uploadLevel = ''
      this.uploadLabel = ''
      this.showUpload = false
    },

    loadDict() {
      let entries = []
      // 1. Built-in QECR-level vocab (from uploaded_qecr_data.js)
      try {
        if (typeof UPLOADED_QECR_DATA !== 'undefined' && Array.isArray(UPLOADED_QECR_DATA)) entries.push(...UPLOADED_QECR_DATA)
      } catch {}
      // 2. Uploaded vocab from localStorage (CSV upload)
      try {
        const raw = localStorage.getItem('UPLOADED_VOCAB_DATA')
        if (raw) {
          const uploaded = JSON.parse(raw)
          if (Array.isArray(uploaded)) entries.push(...uploaded)
        }
      } catch {}
      this.dictEntries = entries
    },

    removeFromMyVocab(w) {
      PTStore.removeFromMyVocab(w.pt, this.mode)
      this.$forceUpdate()
    },

    /* ─── (kept for backwards compat, unused now) ─── */
    startWrongReview() {},
    exitWrongReview() {},
    getWrongStage() { return 0 },
    submitZh2pt() {},
    rateZh2pt() {},
    nextWord() {},
    skipWord() {},
    ratePt2zh() {},
    nextPt2zh() {},
    finishRound() {},
    reviewRound() {},
    goToErrosView() {},
  },

  mounted() {
    this.loadDict()
    this.$nextTick(() => lucide.createIcons())
    // Check for wrong review trigger
    if (window.__START_WRONG_REVIEW__) {
      window.__START_WRONG_REVIEW__ = false
    }
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
  beforeUnmount() {
    if (this.autoAdvanceTimer) { clearTimeout(this.autoAdvanceTimer); this.autoAdvanceTimer = null }
  },
}
