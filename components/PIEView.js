/**
 * components/PIEView.js — CAPLE PIE: exam generation with CEFR classification
 * Matches CL ExamView.js UI flow.
 */
const PIEView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Produção e Interação Escritas</h2>
      </div>

      <!-- API Key Warning -->
      <div v-if="!hasApiKey" class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-glass p-4 mb-5 text-sm">
        <p class="text-amber-700 font-medium mb-1">⚠️ Chave API DeepSeek necessária</p>
        <p class="text-amber-600 text-xs mb-2">Configure a sua chave em Configurações.</p>
        <button @click="openConfig" class="text-xs text-azulejo underline hover:text-blue-700">Abrir Configurações →</button>
      </div>

      <!-- ═══ INPUT STAGE ═══ -->
      <div v-if="stage === 'input'" class="space-y-4">

        <!-- Success banner -->
        <div v-if="examReady" class="bg-emerald-50 border border-emerald-200 rounded-glass p-4 text-sm text-emerald-700">
          <p class="font-medium">📄 Exame PIE gerado — dificuldade {{ examDifficulty }}/100</p>
          <p class="text-xs text-emerald-600 mt-1">A nova janela foi aberta — escreva as suas respostas.</p>
          <p class="text-xs text-slate-400 mt-1">{{ lastDuration }} · {{ lastDescrip }}</p>
        </div>

        <!-- Level selector -->
        <div class="glass-card rounded-glass p-4">
          <label class="text-xs text-slate-500 font-medium block mb-2">Nível do exame</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="lv in levels" :key="lv.id"
                    @click="selectedLevel = lv.id"
                    :class="['px-4 py-2 rounded-lg text-sm font-medium transition border',
                      selectedLevel === lv.id
                        ? lv.cls
                        : 'glass-btn text-slate-500 border-slate-200']">
              <span class="font-bold">{{ lv.id }}</span>
              <span class="text-[10px] opacity-70 ml-1">{{ lv.label }}</span>
            </button>
          </div>
          <p v-if="selectedLevel" class="text-xs text-slate-400 mt-2">{{ levelInfo[selectedLevel]?.desc }}</p>
          <p v-if="selectedLevel" class="text-xs text-slate-400 mt-1">{{ levelInfo[selectedLevel]?.duracao }} · 3 partes</p>
        </div>

        <!-- Generate -->
        <div class="text-center">
          <button @click="generateExam"
                  :disabled="!selectedLevel || loading"
                  class="btn-click btn-glow btn-magnetic px-8 py-3 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 transition inline-flex items-center gap-2">
            <i data-lucide="pen-tool" class="w-4 h-4"></i>
            Gerar Exame PIE {{ selectedLevel || '' }}
          </button>
        </div>

        <!-- CEFR Warning -->
        <div v-if="showCefrWarning" class="bg-amber-50 border border-amber-200 rounded-glass p-4 text-sm">
          <p class="text-amber-700 font-medium mb-1">⚠️ Classificação QECR baixa ({{ cefrResult?.pontuacao }}/100)</p>
          <p class="text-amber-600 text-xs mb-2">O texto gerado foi classificado como nível {{ cefrResult?.nivel }} com pontuação {{ cefrResult?.pontuacao }}/100. O exame será do nível {{ selectedLevel }}.</p>
          <div class="flex gap-2">
            <button @click="forceGenerate" class="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition">Forçar geração</button>
            <button @click="dismissCefrWarning" class="px-4 py-2 glass-btn text-sm font-medium rounded-lg border transition">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- ═══ LOADING ═══ -->
      <div v-if="stage === 'loading'" class="glass-card-strong rounded-glass-lg p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azulejo border-t-transparent mb-4"></div>
        <p class="text-slate-600 font-medium">{{ loadingMsg }}</p>
        <p class="text-xs text-slate-400 mt-1">DeepSeek está a preparar o exame PIE com dificuldade ≥ 90.</p>
      </div>

      <!-- ═══ CEFR RESULT ═══ -->
      <div v-if="cefrResult" class="glass-card rounded-glass p-4 mb-4 flex items-center gap-4">
        <div class="text-center min-w-[5rem]">
          <span class="text-2xl font-bold" :class="cefrColor">{{ cefrResult.nivel }}</span>
          <p class="text-[10px] text-slate-400">QECR</p>
        </div>
        <div class="text-center min-w-[3rem] ml-auto">
          <span class="text-lg font-bold" :class="cefrScoreColor">{{ cefrResult.pontuacao }}</span>
          <p class="text-[10px] text-slate-400">/100</p>
        </div>
      </div>

      <!-- ═══ Generation result ═══ -->
      <div v-if="stage === 'generated'" class="space-y-4">
        <div class="glass-card-strong rounded-glass-lg p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs text-slate-400 font-mono">{{ lastExamId }}</p>
              <p class="text-lg font-bold text-slate-800 mt-1">{{ examTitle }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold"
                    :class="difficultyBadgeClass">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                {{ examDifficulty }}/100
              </span>
              <p class="text-[10px] text-slate-400 mt-1">Dificuldade</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
            <span>📝 3 partes</span>
            <span>⏱ {{ lastDuration }}</span>
          </div>
          <div v-if="examDifficulty >= 90" class="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-700">
            ✅ Dificuldade ≥ 90 — exame adequado para preparação Muito Bom
          </div>
          <div class="mt-4 flex gap-3">
            <button @click="openExamWindow" class="px-5 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition btn-glow btn-magnetic">
              <i data-lucide="external-link" class="w-4 h-4 inline mr-1"></i>Abrir exame
            </button>
            <button @click="resetExam" class="px-5 py-2.5 glass-btn text-sm font-medium rounded-lg border transition">
              Novo exame
            </button>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      stage: 'input',
      selectedLevel: null,
      examTitle: '',
      examDifficulty: 0,
      lastExamId: '',
      lastDuration: '',
      lastDescrip: '',
      examReady: false,
      loading: false,
      loadingMsg: '',
      cefrResult: null,
      showCefrWarning: false,
      _pendingCefrLevel: null,
      _pendingCefrText: null,
      _lastExamData: null,
      levels: [
        { id: 'A1', label: 'ACESSO',   cls: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
        { id: 'A2', label: 'CIPLE',   cls: 'bg-teal-50 border-teal-400 text-teal-700' },
        { id: 'B1', label: 'DEPLE',   cls: 'bg-sky-50 border-sky-400 text-sky-700' },
        { id: 'B2', label: 'DIPLE',   cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
        { id: 'C1', label: 'DAPLE',   cls: 'bg-violet-50 border-violet-400 text-violet-700' },
        { id: 'C2', label: 'DUPLE',   cls: 'bg-rose-50 border-rose-400 text-rose-700' },
      ],
      levelInfo: {
        'A1': { desc: 'ACESSO (A1) — Iniciação. Temas básicos.', duracao: '20 min', wc1: '40–60', wc2: '40–60', wc3: '30–50' },
        'A2': { desc: 'CIPLE (A2) — Elementar. Temas do quotidiano.', duracao: '— (parte CL+PIE)', wc1: '60–80', wc2: '60–80', wc3: '40–60' },
        'B1': { desc: 'DEPLE (B1) — Limiar. Opiniões simples.', duracao: '60 min', wc1: '120', wc2: '150–180', wc3: '60–80' },
        'B2': { desc: 'DIPLE (B2) — Vantagem. Carta + argumentação + 10 reescritas.', duracao: '75 min', wc1: '120', wc2: '150–180', wc3: '10 reescritas' },
        'C1': { desc: 'DAPLE (C1) — Autonomia. Textos formais.', duracao: '90 min', wc1: '200–230', wc2: '200–230', wc3: '10 reescritas' },
        'C2': { desc: 'DUPLE (C2) — Mestria. Discurso sofisticado.', duracao: '105 min', wc1: '220–250', wc2: '250–280', wc3: '10 reescritas' },
      },
    }
  },

  computed: {
    hasApiKey() { return !!PTStore.data.config.deepseekKey },
    difficultyBadgeClass() {
      if (this.examDifficulty >= 95) return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      if (this.examDifficulty >= 90) return 'bg-teal-50 text-teal-700 border border-teal-200'
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    },
    cefrColor() {
      const c = { 'C2':'text-rose-600', 'C1':'text-violet-600', 'B2':'text-indigo-600', 'B1':'text-sky-600', 'A2':'text-teal-600', 'A1':'text-emerald-600' }
      return c[this.cefrResult?.nivel] || 'text-slate-600'
    },
    cefrScoreColor() {
      const p = parseInt(this.cefrResult?.pontuacao)
      if (isNaN(p)) return ''
      return p >= 80 ? 'text-certo' : p >= 60 ? 'text-lisboa' : 'text-erro'
    },
  },

  methods: {
    async generateExam() {
      if (!this.hasApiKey) { this.openConfig(); return }
      PTStore.logActivity()
      this.loading = true
      this.stage = 'loading'
      const apiKey = PTStore.data.config.deepseekKey
      try {
        let text, clLevel = this.selectedLevel
        this.loadingMsg = 'A gerar texto nível ' + clLevel + '...'

        // 1. Generate a text at the selected level
        const levelTopics = {
          A1: 'apresentacoes, saudes, numeros, cores, familia, rotinas basicas, escola, objetos quotidianos',
          A2: 'vida quotidiana, alimentacao, compras, tempos livres, viagens, alojamento, saude, transportes',
          B1: 'trabalho, estudos, imprensa, atualidade, saude, opinioes, cultura, tecnologia',
          B2: 'relacoes sociais, trabalho, negocios, saude, cultura, atualidade, media, opinioes, argumentacao',
          C1: 'politica, economia, direitos, cidadania, ciencia, etica, educacao',
          C2: 'globalizacao, filosofia, arte, justica, diplomacia, inovacao, identidade cultural',
        }
        const textRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'Gera APENAS um texto em português europeu (PT-PT). NÃO escrevas título, NÃO escrevas introdução — APENAS o texto corrido. O texto deve ser adequado para servir de base a um exame de Produção e Interação Escritas (PIE).' },
              { role: 'user', content: `Gera um texto PT-PT nível ${clLevel} com pelo menos 200 palavras sobre um tema variado. Apenas o texto, sem título.` },
            ],
            temperature: 0.8,
            max_tokens: 4000,
          }),
        })
        if (!textRes.ok) throw new Error(`HTTP ${textRes.status} ao gerar texto`)
        const textData = await textRes.json()
        text = textData.choices?.[0]?.message?.content?.trim() || ''
        if (!text || text.length < 100) throw new Error('Texto gerado muito curto')

        // 2. Classify via CEFR API
        this.loadingMsg = 'A classificar QECR do texto gerado...'
        const cefrGenRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'Classifica texto PT-PT em nível CEFR (A1-C2). APENAS JSON: {"nivel":"B2","pontuacao":95}. A pontuação (0-100) mede o GRAU DE ADEQUAÇÃO ao nível classificado. 100=perfeitamente alinhado, 95=muito bom, 85=bom, 75=adequado com desvios, 65=razoável, <55=fraca. NÃO escrever texto explicativo.' },
              { role: 'user', content: text.slice(0, 5000) },
            ],
            temperature: 0.2,
            max_tokens: 300,
          }),
        })
        const cefrGenData = await cefrGenRes.json()
        this.cefrResult = parseJSON(cefrGenData.choices?.[0]?.message?.content || '')

        clLevel = this.selectedLevel

        const cefrScore = parseInt(this.cefrResult.pontuacao)
        if (!isNaN(cefrScore) && cefrScore < 90) {
          this._pendingCefrLevel = clLevel
          this._pendingCefrText = text
          this.showCefrWarning = true
          this.stage = 'input'
          this.loading = false
          return
        }

        // 3. Generate PIE exam
        this.loadingMsg = 'A gerar exame PIE...'
        const result = await ExamAPI.generatePIEExam(clLevel, apiKey)
        this._onExamGenerated(result, clLevel, text)
      } catch (e) {
        this.stage = 'input'
        alert('Erro ao gerar exame: ' + e.message)
      } finally {
        this.loading = false
      }
    },

    _onExamGenerated(result, clLevel, text) {
      this.examTitle = result.titulo || ('Exame PIE ' + clLevel)
      this.examDifficulty = result.examDifficulty
      this.lastDuration = result.duracao || result.duration || this.levelInfo[clLevel]?.duracao || '90 min'
      this.lastDescrip = result.descrip || result.desc || this.levelInfo[clLevel]?.desc || ''

      const now = new Date()
      const yyyymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')
      let seq = 1
      try { seq = (parseInt(localStorage.getItem('SEMEDO_PIE_SEQ') || '0', 10)) + 1 } catch {}
      localStorage.setItem('SEMEDO_PIE_SEQ', String(seq))
      const examId = 'SEMEDO_' + yyyymmdd + '_' + String(seq).padStart(2, '0') + '_PIE'
      this.lastExamId = examId

      const examData = {
        examId,
        level: clLevel,
        examTitle: this.examTitle,
        parte1: result.parte1 || '',
        parte2: result.parte2 || [],
        parte3: result.parte3 || '',
        duracao: this.lastDuration,
        descrip: this.lastDescrip,
        wc1: result.wc1, wc2: result.wc2, wc3: result.wc3,
        examDifficulty: this.examDifficulty,
        _type: 'PIE',
        timestamp: Date.now(),
      }
      this._lastExamData = examData

      // Auto-save + download
      this.guardarExame()

      try {
        localStorage.setItem('PIE_CURRENT_EXAM', JSON.stringify(examData))
        this.stage = 'generated'
        this.examReady = true
        window.open('pie_exam.html', '_blank')
      } catch (e) { console.warn('Erro ao abrir janela:', e) }
    },

    guardarExame() {
      const data = this._lastExamData
      if (!data) return
      try {
        localStorage.setItem('SEMEDO_SAVED_FULL_' + data.examId, JSON.stringify(data))
        const saved = JSON.parse(localStorage.getItem('SEMEDO_SAVED_EXAMS') || '[]')
        if (!saved.find(s => s.examId === data.examId)) {
          saved.push({ examId: data.examId, level: data.level, date: new Date().toISOString(), examDifficulty: data.examDifficulty, duracao: data.duracao, descrip: data.descrip, _type: 'PIE', _saved: true })
          localStorage.setItem('SEMEDO_SAVED_EXAMS', JSON.stringify(saved))
        }
      } catch {}
      try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.examId + '.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) { console.warn('Erro ao descarregar JSON:', e) }
    },

    openExamWindow() {
      try { window.open('pie_exam.html', '_blank') } catch (e) { console.warn('Erro ao abrir:', e) }
    },

    resetExam() {
      this.stage = 'input'
      this.examTitle = ''
      this.examDifficulty = 0
      this.examReady = false
      this.cefrResult = null
    },

    forceGenerate() {
      this.showCefrWarning = false
      this._continueGenerate(this._pendingCefrText, this.selectedLevel)
      this._pendingCefrLevel = null
      this._pendingCefrText = null
    },
    dismissCefrWarning() {
      this.showCefrWarning = false
      this.cefrResult = null
      this._pendingCefrLevel = null
      this._pendingCefrText = null
    },
    async _continueGenerate(text, clLevel) {
      this.loading = true
      this.stage = 'loading'
      const apiKey = PTStore.data.config.deepseekKey
      this.loadingMsg = 'A gerar exame PIE...'
      try {
        const result = await ExamAPI.generatePIEExam(clLevel, apiKey)
        this._onExamGenerated(result, clLevel, text)
      } catch (e) {
        this.stage = 'input'
        alert('Erro: ' + e.message)
      } finally { this.loading = false }
    },

    openConfig() { window.dispatchEvent(new CustomEvent('open-config')) },
  },

  mounted() { this.$nextTick(() => lucide.createIcons()) },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
