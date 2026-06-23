/**
 * components/ExamView.js — 模擬卷 CAPLE CL：文本模式 + 等級模式
 */
const ExamView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- Header -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Compreensão da Leitura</h2>
      </div>

      <!-- ═══ API Key Warning ═══ -->
      <div v-if="!hasApiKey" class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-glass p-4 mb-5 text-sm">
        <p class="text-amber-700 font-medium mb-1">⚠️ Chave API DeepSeek necessária</p>
        <p class="text-amber-600 text-xs mb-2">Configure a sua chave em Configurações.</p>
        <button @click="openConfig" class="text-xs text-azulejo underline hover:text-blue-700">Abrir Configurações →</button>
      </div>

      <!-- CEFR score warning (threshold 90) -->
      <div v-if="showCefrWarning" class="bg-amber-50 border border-amber-200 rounded-glass p-4 mb-5 text-sm">
        <p class="text-amber-700 font-medium mb-1">⚠️ Classificação QECR baixa ({{ cefrResult?.pontuacao }}/100)</p>
        <p class="text-amber-600 text-xs mb-2">O texto não atingiu a pontuação mínima de 90. O exame pode não corresponder ao nível esperado.</p>
        <div class="flex gap-2 mt-2">
          <button @click="forceGenerate" class="px-3 py-1.5 text-xs bg-azulejo text-white rounded-lg hover:bg-blue-800 transition btn-glow btn-magnetic">Gerar mesmo assim</button>
          <button @click="dismissCefrWarning" class="px-3 py-1.5 text-xs border rounded-lg hover:bg-slate-50 transition">Cancelar</button>
        </div>
      </div>

      <!-- ═══ INPUT STAGE ═══ -->
      <div v-if="stage === 'input'" class="space-y-4">

        <!-- Success banner -->
        <div v-if="examReady" class="bg-emerald-50 border border-emerald-200 rounded-glass p-4 text-sm text-emerald-700">
          <p class="font-medium">📄 Exame gerado</p>
          <p class="text-xs text-emerald-600 mt-1">Responda na nova janela aberta.</p>
        </div>

        <!-- Mode toggle -->
        <div class="flex glass-panel rounded-lg p-0.5 w-fit mx-auto">
          <button @click="genMode='text'"
                  :class="['px-4 py-2 text-sm font-medium rounded-md transition', genMode==='text' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500']">
            <i data-lucide="file-text" class="w-3.5 h-3.5 inline mr-1"></i>Texto
          </button>
          <button @click="genMode='level'"
                  :class="['px-4 py-2 text-sm font-medium rounded-md transition', genMode==='level' ? 'glass-card text-azulejo shadow-sm' : 'text-slate-500']">
            <i data-lucide="layers" class="w-3.5 h-3.5 inline mr-1"></i>Nível
          </button>
        </div>

        <!-- Text input (text mode) -->
        <div v-if="genMode==='text'" class="glass-card rounded-glass p-4">
          <label class="text-xs text-slate-500 font-medium block mb-2">Texto de origem</label>
          <textarea v-model="sourceText" rows="6"
                    class="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y"
                    placeholder="Cole aqui um texto em português europeu (notícia, artigo de opinião, excerto literário...)"></textarea>
          <p class="text-xs text-slate-400 mt-1">O nível QECR será classificado automaticamente. Mínimo ~200 palavras para uma classificação fiável.</p>
        </div>

        <!-- Level selector (level mode) -->
        <div v-if="genMode==='level'" class="glass-card rounded-glass p-4">
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
          <p v-if="selectedLevel" class="text-xs text-slate-400 mt-2">O DeepSeek gera um texto e um exame CAPLE CL ao nível {{ selectedLevel }}.</p>
        </div>

        <!-- Generate -->
        <div class="text-center">
          <button @click="generateExam"
                  :disabled="(genMode==='text' && !sourceText.trim()) || (genMode==='level' && !selectedLevel) || loading"
                  class="btn-click btn-glow btn-magnetic px-8 py-3 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 transition inline-flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            {{ genMode==='text' ? 'Classificar QECR e Gerar Exame' : 'Gerar Exame ' + (selectedLevel || '') }}
          </button>
        </div>
      </div>

      <!-- ═══ LOADING ═══ -->
      <div v-if="stage === 'loading'" class="glass-card-strong rounded-glass-lg p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azulejo border-t-transparent mb-4"></div>
        <p class="text-slate-600 font-medium">{{ loadingMsg }}</p>
        <p class="text-xs text-slate-400 mt-1">DeepSeek está a analisar o texto e a preparar perguntas no formato CAPLE CL.</p>
      </div>

      <!-- ═══ CEFR RESULT ═══ -->
      <div v-if="cefrResult" class="glass-card rounded-glass p-4 mb-4 flex items-center gap-4">
        <div class="text-center min-w-[5rem]">
          <span class="text-2xl font-bold" :class="cefrColor">{{ cefrResult.nivel }}</span>
          <p class="text-[10px] text-slate-400">{{ cefrResult.label }}</p>
        </div>
        <div class="flex-1">
          <p class="text-xs font-medium text-slate-600 mb-1">Classificação QECR</p>
          <p class="text-xs text-slate-500 leading-relaxed">{{ cefrResult.descricao }}</p>
        </div>
        <div class="text-center min-w-[3rem]">
          <span class="text-lg font-bold" :class="cefrScoreColor">{{ cefrResult.pontuacao }}</span>
          <p class="text-[10px] text-slate-400">/100</p>
        </div>
      </div>

      <!-- ═══ EXERCISE ═══ -->
      <div v-if="stage === 'exercise'" class="space-y-4">
        <div class="glass-card rounded-glass p-4 flex items-center justify-between">
          <div>
            <span class="text-sm font-bold text-slate-700">Exame {{ examLevel }}</span>
            <span class="ml-2 text-xs text-slate-400">{{ questions.length }} perguntas</span>
          </div>
          <button @click="submitAnswers"
                  class="px-5 py-2 bg-certo text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition btn-glow btn-magnetic">
            Submeter respostas
          </button>
        </div>
        <div v-for="(q, i) in questions" :key="i" class="glass-card rounded-glass p-5 card-hover anim-fade-in-up" :style="{ animationDelay: (i * 0.04) + 's' }">
          <div v-if="i === 0" class="mb-4 pb-3 border-b border-slate-200">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Parte 1 — Compreensão da Leitura</p>
            <p class="text-[10px] text-slate-400">Escolha a opção correta (A, B ou C).</p>
          </div>
          <div v-if="i === 6" class="mb-4 pb-3 border-b border-slate-200 mt-4">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Parte 2 — Preenchimento de espaços</p>
            <p class="text-[10px] text-slate-400">Complete com a palavra ou expressão correta.</p>
          </div>
          <div class="text-xs text-slate-400 font-mono mb-1">
            {{ i + 1 }}.
            <span class="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium"
                  :class="q.type==='fill'?'glass-badge bg-sky-50 text-sky-600':'glass-badge bg-violet-50 text-violet-600'">
              {{ q.type==='fill' ? 'Preenchimento' : 'Escolha múltipla' }}
            </span>
          </div>
          <p class="text-sm text-slate-800 mb-3 leading-relaxed">{{ q.question }}</p>
          <div v-if="q.type === 'choice' && q.options" class="space-y-2">
            <label v-for="(opt, oi) in q.options" :key="oi"
                   class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition text-sm"
                   :class="userAnswers[i] === ['A','B','C'][oi] ? 'border-azulejo bg-blue-50' : 'border-slate-200 hover:bg-slate-50'">
              <input type="radio" :name="'q'+i" :value="['A','B','C'][oi]" v-model="userAnswers[i]"
                     class="mt-0.5 accent-azulejo">
              <span class="text-slate-700">{{ ['A','B','C'][oi] }}. {{ opt }}</span>
            </label>
          </div>
          <div v-if="q.type === 'fill'">
            <input v-model="userAnswers[i]" type="text"
                   class="glass-input w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azulejo"
                   placeholder="Escreva a sua resposta...">
          </div>
        </div>
        <div class="text-center pb-4">
          <button @click="submitAnswers"
                  class="px-8 py-3 bg-certo text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition">
            Submeter respostas
          </button>
        </div>
      </div>

      <!-- ═══ GRADED ═══ -->
      <div v-if="stage === 'graded'" class="space-y-4">
        <div class="glass-card-strong rounded-glass p-5 text-center">
          <p class="text-[10px] text-slate-400 font-mono mb-1">{{ lastExamId }}</p>
          <p class="text-xs text-slate-500 mb-1">Exame {{ examLevel }} — Resultado</p>
          <p class="text-3xl font-bold"
             :class="scorePercent >= 85 ? 'text-teal-500' : scorePercent >= 70 ? 'text-certo' : scorePercent >= 55 ? 'text-lisboa' : 'text-erro'">
            {{ scoreCorrect }} / {{ questions.length }}
          </p>
          <p class="text-sm text-slate-500 mt-1">{{ scorePercent }}% — {{ scoreLabel }}</p>
          <div class="flex justify-center gap-3 mt-4">
            <button @click="resetExam" class="px-4 py-2 text-sm bg-azulejo text-white rounded-lg hover:bg-blue-800 transition btn-glow btn-magnetic">Novo exame</button>
            <button @click="showAnswers = !showAnswers" class="glass-btn px-4 py-2 text-sm border rounded-lg transition">
              {{ showAnswers ? 'Ocultar respostas' : 'Mostrar respostas' }}
            </button>
          </div>
        </div>
        <p v-if="showAnswers" class="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Parte 1 — Compreensão da Leitura</p>
        <div v-for="(q, i) in questions.slice(0,6)" :key="i"
             class="glass-card rounded-glass p-5" :class="qgCorrect[i] ? 'border-emerald-200' : 'border-rose-200'">
          <div class="flex items-start gap-3">
            <span class="shrink-0 text-lg mt-0.5">{{ qgCorrect[i] ? '✅' : '❌' }}</span>
            <div class="flex-1">
              <p class="text-xs text-slate-400 font-mono mb-1">{{ i+1 }}.</p>
              <p class="text-sm text-slate-800 mb-2">{{ q.question }}</p>
              <div v-if="showAnswers" class="space-y-1 text-xs">
                <p :class="qgCorrect[i] ? 'text-certo' : 'text-erro'">Tua resposta: <strong>{{ userAnswers[i] || '(sem)' }}</strong></p>
                <p v-if="!qgCorrect[i]" class="text-certo">Correta: <strong>{{ q.answer }}</strong></p>
                <p v-if="q.explanation" class="text-slate-500 mt-2 p-2 glass-panel rounded">{{ q.explanation }}</p>
              </div>
            </div>
          </div>
        </div>
        <p v-if="showAnswers" class="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mt-4">Parte 2 — Preenchimento de espaços</p>
        <div v-for="(q, i) in questions.slice(6)" :key="'p2-'+i"
             class="glass-card rounded-glass p-5" :class="qgCorrect[i+6] ? 'border-emerald-200' : 'border-rose-200'">
          <div class="flex items-start gap-3">
            <span class="shrink-0 text-lg mt-0.5">{{ qgCorrect[i+6] ? '✅' : '❌' }}</span>
            <div class="flex-1">
              <p class="text-xs text-slate-400 font-mono mb-1">{{ i+7 }}.</p>
              <p class="text-sm text-slate-800 mb-2">{{ q.question }}</p>
              <div v-if="showAnswers" class="space-y-1 text-xs">
                <p :class="qgCorrect[i+6] ? 'text-certo' : 'text-erro'">Tua: <strong>{{ userAnswers[i+6] || '(sem)' }}</strong></p>
                <p v-if="!qgCorrect[i+6]" class="text-certo">Correta: <strong>{{ q.answer }}</strong></p>
                <p v-if="q.explanation" class="text-slate-500 mt-2 p-2 glass-panel rounded">{{ q.explanation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      stage: 'input',    // input | loading | exercise | graded
      genMode: 'text',   // 'text' | 'level'
      sourceText: '',
      selectedLevel: null,
      questions: [],
      userAnswers: [],
      qgCorrect: [],
      showAnswers: false,
      lastExamId: '',
      examReady: false,
      loading: false,
      loadingMsg: '',
      cefrResult: null,
      showCefrWarning: false,
      _pendingCefrLevel: null,
      _pendingCefrText: null,
      levels: [
        { id: 'A1', label: 'ACESSO',   cls: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
        { id: 'A2', label: 'CIPLE',   cls: 'bg-teal-50 border-teal-400 text-teal-700' },
        { id: 'B1', label: 'DEPLE',   cls: 'bg-sky-50 border-sky-400 text-sky-700' },
        { id: 'B2', label: 'DIPLE',   cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
        { id: 'C1', label: 'DAPLE',   cls: 'bg-violet-50 border-violet-400 text-violet-700' },
        { id: 'C2', label: 'DUPLE',   cls: 'bg-rose-50 border-rose-400 text-rose-700' },
      ],
    }
  },

  computed: {
    hasApiKey() { return !!PTStore.data.config.deepseekKey },
    examLevel() { return this.cefrResult?.nivel || this.selectedLevel || '?' },
    scoreCorrect() { return this.qgCorrect.filter(Boolean).length },
    scorePercent() {
      if (!this.questions.length) return 0
      return Math.round((this.scoreCorrect / this.questions.length) * 100)
    },
    scoreLabel() {
      if (this.scorePercent >= 85) return 'Muito Bom!'
      if (this.scorePercent >= 70) return 'Bom'
      if (this.scorePercent >= 55) return 'Suficiente'
      return 'Insuficiente'
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
    levelLabel(lv) {
      return { A1:'ACESSO', A2:'CIPLE', B1:'DEPLE', B2:'DIPLE', C1:'DAPLE', C2:'DUPLE' }[lv] || ''
    },
    async generateExam() {
      if (!this.hasApiKey) { this.openConfig(); return }
      PTStore.logActivity()
      this.loading = true
      this.stage = 'loading'
      this.loadingMsg = this.genMode === 'level' ? 'A gerar texto e exame...' : 'A classificar o texto...'
      const apiKey = PTStore.data.config.deepseekKey
      try {
        let text, clLevel

        if (this.genMode === 'level') {
          // Level mode: generate a text first
          clLevel = this.selectedLevel
          this.loadingMsg = 'A gerar texto nível ' + clLevel + '...'
          const levelTopics = {
            A1: 'apresentacoes, saudes, numeros, cores, familia, rotinas basicas',
            A2: 'vida quotidiana, comida, tempo livre, compras, viagens simples',
            B1: 'experiencias pessoais, opinioes, escola, trabalho, saude, ambiente',
            B2: 'argumentacao, tecnologia, educacao, cultura, sociedade',
            C1: 'politica, economia, direitos, cidadania, ciencia, etica',
            C2: 'globalizacao, justica, filosofia, arte, inovacao, diplomacia',
          }
          const textRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: `Gera texto PT-PT nivel ${clLevel} (${250+parseInt(clLevel[1]||'1')*100} palavras). Tema: ${levelTopics[clLevel]||'geral'}. PT-PT. So texto, sem titulo. Vocabulario e estruturas adequados ao nivel ${clLevel}.` },
                { role: 'user', content: `Texto PT-PT nivel ${clLevel} sobre ${(levelTopics[clLevel]||'tema geral').split(',')[0]}.` },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          })
          const textData = await textRes.json()
          text = textData.choices?.[0]?.message?.content?.trim() || ''
          if (!text || text.length < 100) throw new Error('Texto gerado muito curto')
          this.cefrResult = { nivel: clLevel, pontuacao: 70, descricao: 'Texto gerado por IA ao nível ' + clLevel, label: this.levelLabel(clLevel) }

          this.loadingMsg = 'A gerar exame CAPLE CL...'
        } else {
          // Text mode: classify CEFR then generate
          const cefrRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: 'Classifica texto PT-PT em nível CEFR (A1-C2). APENAS JSON: {"nivel":"B2","pontuacao":65,"descricao":"...","label":"Vantagem"}. Critérios: A1=vocab básico+Presente; A2=quotidiano+Pretérito; B1=opiniões+Conjuntivo presente; B2=abstrato+Conjuntivo imperfeito; C1=formal+Infinitivo pessoal; C2=sofisticado+domínio total. Labels: A1=Iniciação, A2=Elementar, B1=Limiar, B2=Vantagem, C1=Autonomia, C2=Mestria. NÃO escrever texto explicativo.' },
                { role: 'user', content: (this.sourceText || '').slice(0, 5000) },
              ],
              temperature: 0.2,
              max_tokens: 300,
            }),
          })
          const cefrData = await cefrRes.json()
          this.cefrResult = parseJSON(cefrData.choices?.[0]?.message?.content || '')
          clLevel = this.cefrResult.nivel
          text = this.sourceText.trim()

          // QECR threshold: require 90+ for qualified exam
          const cefrScore = parseInt(this.cefrResult.pontuacao)
          if (!isNaN(cefrScore) && cefrScore < 90) {
            this._pendingCefrLevel = clLevel
            this._pendingCefrText = text
            this.showCefrWarning = true
            this.stage = 'input'
            this.loading = false
            return
          }

          this.loadingMsg = 'A gerar exame CAPLE CL...'
        }

        // Generate exam from text
        const result = await ExamAPI.generateExam(text, clLevel, apiKey)
        this._openExamWindow(result, clLevel, text)
      } catch (e) {
        this.stage = 'input'
        alert('Erro ao gerar exame: ' + e.message)
      } finally {
        this.loading = false
      }
    },

    submitAnswers() {
      PTStore.logActivity()
      const correct = this.questions.map((q, i) => {
        const ua = (this.userAnswers[i] || '').trim()
        const ca = (q.answer || '').trim()
        if (q.type === 'choice') return ua.toLowerCase() === ca.toLowerCase()
        const uNorm = Diacritics.normalize(ua)
        const cNorm = Diacritics.normalize(ca)
        return uNorm === cNorm || ua.toLowerCase() === ca.toLowerCase()
      })
      this.qgCorrect = correct

      const now = new Date()
      const yyyymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')
      let seq = 1
      try { seq = (parseInt(localStorage.getItem('CAPLE_CL_SEQ') || '0', 10)) + 1 } catch {}
      localStorage.setItem('CAPLE_CL_SEQ', String(seq))
      const examId = 'CAPLE_' + yyyymmdd + '_' + String(seq).padStart(2, '0') + '_CL'
      this.lastExamId = examId

      PTStore.saveExamResult({
        id: examId,
        level: this.examLevel,
        correct: correct.filter(Boolean).length,
        total: this.questions.length,
        percent: Math.round((correct.filter(Boolean).length / this.questions.length) * 100),
        sourceText: this.genMode === 'text' ? (this.sourceText || '').slice(0, 500) : '',
        questions: this.questions,
        userAnswers: [...this.userAnswers],
        qgCorrect: correct,
      })
      this.stage = 'graded'
      this.showAnswers = true
    },

    resetExam() {
      this.stage = 'input'
      this.questions = []
      this.userAnswers = []
      this.qgCorrect = []
      this.showAnswers = false
    },

    goToHistory() { if (typeof window.__NAV__ === 'function') window.__NAV__('exames') },
    openConfig() { window.dispatchEvent(new CustomEvent('open-config')) },

    /** Force exam generation despite low CEFR score */
    forceGenerate() {
      this.showCefrWarning = false
      this._continueGenerate(this._pendingCefrText, this._pendingCefrLevel)
      this._pendingCefrLevel = null
      this._pendingCefrText = null
    },
    /** Dismiss and go back to input */
    dismissCefrWarning() {
      this.showCefrWarning = false
      this.cefrResult = null
      this._pendingCefrLevel = null
      this._pendingCefrText = null
    },
    /** Continue generation after CEFR check (shared between normal and force) */
    async _continueGenerate(text, clLevel) {
      this.loading = true
      this.stage = 'loading'
      this.loadingMsg = 'A gerar exame CAPLE CL...'
      const apiKey = PTStore.data.config.deepseekKey
      try {
        const result = await ExamAPI.generateExam(text, clLevel, apiKey)
        this._openExamWindow(result, clLevel, text)
      } catch (e) {
        this.stage = 'input'
        alert('Erro ao gerar exame: ' + e.message)
      } finally {
        this.loading = false
      }
    },
    /** Save exam and open window (extracted for reuse) */
    _openExamWindow(questions, clLevel, text) {
      this.questions = questions
      this.userAnswers = new Array(questions.length).fill('')
      this.qgCorrect = new Array(questions.length).fill(false)
      this.showAnswers = false
      const now = new Date()
      const yyyymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')
      let seq = 1
      try { seq = (parseInt(localStorage.getItem('CAPLE_CL_SEQ') || '0', 10)) + 1 } catch {}
      localStorage.setItem('CAPLE_CL_SEQ', String(seq))
      const examId = 'CAPLE_' + yyyymmdd + '_' + String(seq).padStart(2, '0') + '_CL'
      this.lastExamId = examId
      try {
        localStorage.setItem('CL_CURRENT_EXAM', JSON.stringify({
          examId, level: clLevel, sourceText: (text || '').slice(0, 3000), questions, timestamp: Date.now(),
        }))
        window.open('cl_exam.html', '_blank')
        this.stage = 'input'
        this.examReady = true
      } catch (e) { console.warn('Erro ao abrir janela:', e) }
    },
  },

  mounted() {
    this.$nextTick(() => lucide.createIcons())
    if (window.__IMPORT_NEWS_TEXT__) {
      this.sourceText = window.__IMPORT_NEWS_TEXT__
      window.__IMPORT_NEWS_TEXT__ = null
    }
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
