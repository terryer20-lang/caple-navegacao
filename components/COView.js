/**
 * components/COView.js — Compreensão do Oral (CAPLE CO)
 * Gera exames CO com formato oficial CAPLE, sensível ao nível CEFR
 */
const COView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- ═══ HEADER ═══ -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Compreensão do Oral</h2>
      </div>

      <!-- ═══ API Key Warning ═══ -->
      <div v-if="!hasApiKey" class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-glass p-4 mb-5 text-sm">
        <p class="text-amber-700 font-medium mb-1">⚠️ Chave API DeepSeek necessária</p>
        <p class="text-amber-600 text-xs mb-2">Configure a sua chave em Configurações.</p>
        <button @click="openConfig" class="text-xs text-azulejo underline hover:text-blue-700">Abrir Configurações →</button>
      </div>

      <!-- ═══ INPUT STAGE ═══ -->
      <div v-if="stage === 'input'" class="space-y-4">

        <!-- Success banner -->
        <div v-if="examReady" class="bg-emerald-50 border border-emerald-200 rounded-glass p-4 text-sm text-emerald-700">
          <p class="font-medium">📄 Exame CO gerado</p>
          <p class="text-xs text-emerald-600 mt-1">Responda na nova janela aberta.</p>
        </div>

        <div class="glass-card rounded-glass p-4">
          <label class="text-xs text-slate-500 font-medium block mb-2">Transcrição do áudio</label>
          <textarea v-model="transcript" rows="10"
                    class="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-y font-mono text-xs leading-relaxed"
                    placeholder="Cole aqui a transcrição do áudio (entrevista, notícia, debate, palestra...)"></textarea>
          <p class="text-xs text-slate-400 mt-1">Mínimo ~200 palavras para uma classificação e geração fiáveis.</p>
        </div>

        <div class="text-center">
          <button @click="generateExam" :disabled="!transcript.trim() || loading || !hasApiKey"
                  class="px-8 py-3 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 transition inline-flex items-center gap-2 btn-glow btn-magnetic">
            <i data-lucide="ear" class="w-4 h-4" :class="{'animate-pulse': loading}"></i>
            {{ loading ? 'A classificar e gerar...' : 'Classificar QECR e Gerar Exame' }}
          </button>
        </div>
      </div>

      <!-- ═══ LOADING ═══ -->
      <div v-if="stage === 'loading'" class="glass-card-strong rounded-glass-lg p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azulejo border-t-transparent mb-4"></div>
        <p class="text-slate-600 font-medium">{{ loadingMsg }}</p>
        <p class="text-xs text-slate-400 mt-1">DeepSeek está a analisar o texto e a gerar perguntas no formato CAPLE CO.</p>
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
            <span class="text-sm font-bold text-slate-700">Exame CO — {{ cefrResult?.nivel || '?' }}</span>
            <span class="ml-2 text-xs text-slate-400">{{ questions.length }} perguntas</span>
          </div>
          <button @click="submitAnswers"
                  class="px-5 py-2 bg-certo text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition btn-glow btn-magnetic">
            Submeter respostas
          </button>
        </div>

        <div v-for="part in examParts" :key="part.label" class="space-y-3">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 pt-2">{{ part.label }}</div>
          <div v-for="(q, i) in part.questions" :key="q.index"
               class="glass-card rounded-glass p-5">
            <div class="text-xs text-slate-400 font-mono mb-2">{{ q.index + 1 }}.</div>
            <p class="text-sm text-slate-800 mb-3 leading-relaxed">{{ q.question }}</p>
            <div class="space-y-2">
              <label v-for="(opt, oi) in q.options" :key="oi"
                     class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition text-sm"
                     :class="userAnswers[q.index] === ['A','B','C'][oi] ? 'border-azulejo bg-blue-50' : 'border-slate-200 hover:bg-slate-50'">
                <input type="radio" :name="'coq'+q.index" :value="['A','B','C'][oi]"
                       v-model="userAnswers[q.index]" class="mt-0.5 accent-azulejo">
                <span class="text-slate-700">{{ ['A','B','C'][oi] }}. {{ opt }}</span>
              </label>
            </div>
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
          <p class="text-[10px] text-slate-400 font-mono mb-1">{{ examId }}</p>
          <p class="text-xs text-slate-500 mb-1">Exame CO {{ cefrResult?.nivel || '?' }} — Resultado</p>
          <p class="text-3xl font-bold"
             :class="scorePercent >= 85 ? 'text-teal-500' : scorePercent >= 70 ? 'text-certo' : scorePercent >= 55 ? 'text-lisboa' : 'text-erro'">
            {{ scoreCorrect }} / {{ questions.length }}
          </p>
          <p class="text-sm text-slate-500 mt-1">{{ scorePercent }}% — {{ scoreLabel }}</p>
          <div class="flex justify-center gap-3 mt-4">
            <button @click="resetAll" class="px-4 py-2 text-sm bg-azulejo text-white rounded-lg hover:bg-blue-800 transition">Nova transcrição</button>
            <button @click="showAnswers = !showAnswers" class="px-4 py-2 text-sm border border-slate-200 rounded-lg glass-btn transition btn-glow">
              {{ showAnswers ? 'Ocultar respostas' : 'Mostrar respostas' }}
            </button>
          </div>
        </div>

        <div v-for="part in examParts" :key="part.label">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2">{{ part.label }}</p>
          <div v-for="(q, i) in part.questions" :key="q.index"
               class="glass-card rounded-glass p-5" :class="qgCorrect[q.index] ? 'border-emerald-200' : 'border-rose-200'">
            <div class="flex items-start gap-3">
              <span class="shrink-0 text-lg mt-0.5">{{ qgCorrect[q.index] ? '✅' : '❌' }}</span>
              <div class="flex-1">
                <p class="text-xs text-slate-400 font-mono mb-1">{{ q.index+1 }}.</p>
                <p class="text-sm text-slate-800 mb-2">{{ q.question }}</p>
                <div v-if="showAnswers" class="space-y-1 text-xs">
                  <p :class="qgCorrect[q.index] ? 'text-certo' : 'text-erro'">Tua resposta: <strong>{{ userAnswers[q.index] || '(sem resposta)' }}</strong></p>
                  <p v-if="!qgCorrect[q.index]" class="text-certo">Resposta correta: <strong>{{ q.answer }}</strong></p>
                  <p v-if="q.explanation" class="text-slate-500 mt-2 p-2 bg-slate-50 rounded">{{ q.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,

  data() {
    return {
      stage: 'input',     // input | loading | exercise | graded
      transcript: '',
      loading: false,
      loadingMsg: '',
      cefrResult: null,
      examId: '',
      questions: [],
      examParts: [],
      userAnswers: [],
      qgCorrect: [],
      showAnswers: false,
      examReady: false,
    }
  },

  computed: {
    hasApiKey() { return !!PTStore.data.config.deepseekKey },
    scoreCorrect() { return this.qgCorrect.filter(Boolean).length },
    scorePercent() {
      return this.questions.length ? Math.round((this.scoreCorrect / this.questions.length) * 100) : 0
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
    async generateExam() {
      if (!this.hasApiKey || !this.transcript.trim()) return
      PTStore.logActivity()

      this.loading = true
      this.stage = 'loading'
      this.loadingMsg = 'A classificar o texto...'

      const apiKey = PTStore.data.config.deepseekKey
      const text = this.transcript.trim()

      // Generate sequential exam ID
      const now = new Date()
      const yyyymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')
      let seq = 1
      try { seq = (parseInt(localStorage.getItem('CAPLE_CO_SEQ') || '0', 10)) + 1 } catch {}
      localStorage.setItem('CAPLE_CO_SEQ', String(seq))
      this.examId = `CAPLE_${yyyymmdd}_${String(seq).padStart(2, '0')}_CO`

      try {
        // Step 1: Classify CEFR level (Referencial Camões PLE criteria)
        const cefrRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'Classifica texto PT-PT em nível CEFR (A1-C2). APENAS JSON: {"nivel":"B2","pontuacao":65,"descricao":"...","label":"Vantagem"}. Critérios: A1=vocab básico+Presente; A2=quotidiano+Pretérito; B1=opiniões+Conjuntivo presente; B2=abstrato+Conjuntivo imperfeito; C1=formal+Infinitivo pessoal; C2=sofisticado+domínio total. Labels: A1=Iniciação, A2=Elementar, B1=Limiar, B2=Vantagem, C1=Autonomia, C2=Mestria. NÃO escrever texto explicativo.' },
              { role: 'user', content: text.slice(0, 5000) },
            ],
            temperature: 0.2,
            max_tokens: 300,
          }),
        })
        const cefrData = await cefrRes.json()
        let cefrContent = (cefrData.choices?.[0]?.message?.content || '')
        this.cefrResult = parseJSON(cefrContent)

        // Step 2: Generate CAPLE CO exam (level-aware format)
        this.loadingMsg = 'A gerar exame CAPLE CO...'
        const coLevel = this.cefrResult.nivel

        // Determine CO format based on CEFR level
        const isFundamental = ['A1', 'A2'].includes(coLevel)
        const isIntermediate = ['B1', 'B2'].includes(coLevel)

        const coSystemPrompt = `Gera exame CAPLE CO nivel ${coLevel}, 25 MC (A/B/C).

ESTRUTURA:
${isFundamental ? 'Parte1(15): 10 textos curtos. Parte2(10): correspondencia frases->locais.'
: isIntermediate ? 'Parte1(13): 3 textos. Parte2(8): 1 entrevista. Parte3(4): 1 monologo.'
: 'Parte1(6): 1 texto longo. Parte2(9): 4 textos. Parte3(10): 7 excertos.'}

PT-PT. Incluir explicacao cada.${isFundamental?' Vocab simples.':' Dificuldade progressiva.'}${['C1','C2'].includes(coLevel)?' Vocab sofisticado.':''}`

        const coUserPrompt = `Texto:\n${text}\nNivel: ${coLevel}\n25 perguntas CO.`

        const examRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: coSystemPrompt },
              { role: 'user', content: coUserPrompt },
            ],
            temperature: 0.5,
            max_tokens: 8000,
          }),
        })
        const examData = await examRes.json()
        const parsed = parseJSON(examData.choices?.[0]?.message?.content || '')

        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          throw new Error('Formato inesperado: campo "questions" não encontrado')
        }

        this.questions = parsed.questions
        this.userAnswers = new Array(parsed.questions.length).fill('')
        this.qgCorrect = new Array(parsed.questions.length).fill(false)
        this.showAnswers = false

        // Build exam parts dynamically based on level
        if (isFundamental) {
          this.examParts = [
            { label: 'Parte 1 — Textos 1-10 (Q1-15)', questions: this.questions.slice(0, 15) },
            { label: 'Parte 2 — Correspondência (Q16-25)', questions: this.questions.slice(15) },
          ]
        } else {
          this.examParts = [
            { label: `Parte 1 — Textos 1-3 (Q1-13)`, questions: this.questions.slice(0, 13) },
            { label: 'Parte 2 — Texto 4 (Q14-21)', questions: this.questions.slice(13, 21) },
            { label: 'Parte 3 — Excertos (Q22-25)', questions: this.questions.slice(21) },
          ]
        }

        this.stage = 'exercise'

        // Save to localStorage and open in new window
        try {
          localStorage.setItem('CO_CURRENT_EXAM', JSON.stringify({
            examId: this.examId,
            level: this.cefrResult?.nivel || coLevel,
            questions: this.questions,
            parts: this.examParts,
            cefr: this.cefrResult,
          }))
          window.open('co_exam.html', '_blank')
          this.stage = 'input'
          this.examReady = true
        } catch (e) { console.warn('Erro ao abrir janela:', e) }
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
        const ua = (this.userAnswers[i] || '').trim().toUpperCase()
        const ca = (q.answer || '').trim().toUpperCase()
        return ua === ca
      })
      this.qgCorrect = correct
      this.stage = 'graded'
      this.showAnswers = true
    },

    resetAll() {
      this.stage = 'input'
      this.transcript = ''
      this.cefrResult = null
      this.questions = []
      this.examParts = []
      this.userAnswers = []
      this.qgCorrect = []
      this.showAnswers = false
    },

    openConfig() { window.dispatchEvent(new CustomEvent('open-config')) },
  },

  mounted() { this.$nextTick(() => lucide.createIcons()) },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
