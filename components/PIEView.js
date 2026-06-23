/**
 * components/PIEView.js — Produção e Interação Escritas (CAPLE PIE)
 */
const PIEView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto">

      <!-- ═══ HEADER ═══ -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Produção e Interação Escritas</h2>
        </div>
      </div>

      <!-- ═══ API Key Warning ═══ -->
      <div v-if="!hasApiKey" class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-glass p-4 mb-5 text-sm">
        <p class="text-amber-700 font-medium mb-1">⚠️ Chave API DeepSeek necessária</p>
        <p class="text-amber-600 text-xs mb-2">Configure a sua chave em Configurações.</p>
        <button @click="openConfig" class="text-xs text-azulejo underline hover:text-blue-700">Abrir Configurações →</button>
      </div>

      <!-- ═══ INPUT STAGE ═══ -->
      <div v-if="stage === 'input'" class="space-y-4">

        <!-- Success banner after exam generation -->
        <div v-if="examReady" class="bg-emerald-50 border border-emerald-200 rounded-glass p-4 text-sm text-emerald-700">
          <p class="font-medium">📄 Exame PIE gerado com sucesso</p>
          <p class="text-xs text-emerald-600 mt-1">A nova janela foi aberta — escreva as suas respostas e submeta para avaliação automática.</p>
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
          <p v-if="selectedLevel" class="text-xs text-slate-400 mt-2">{{ levelInfo.desc }}</p>
        </div>

        <!-- Generate -->
        <div class="text-center">
          <button @click="generateExam" :disabled="!selectedLevel || loading || !hasApiKey"
                  class="px-5 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 transition inline-flex items-center gap-2 btn-glow btn-magnetic">
            <i data-lucide="pen-tool" class="w-4 h-4" :class="{'animate-pulse': loading}"></i>
            {{ loading ? 'A gerar...' : 'Gerar Exame PIE ' + (selectedLevel || '') }}
          </button>
        </div>
      </div>

      <!-- ═══ LOADING ═══ -->
      <div v-if="stage === 'loading'" class="glass-card-strong rounded-glass-lg p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azulejo border-t-transparent mb-4"></div>
        <p class="text-slate-600 font-medium">A gerar exame PIE {{ selectedLevel }}...</p>
        <p class="text-xs text-slate-400 mt-1">DeepSeek está a criar uma prova com temas adequados ao nível.</p>
      </div>

      <!-- ═══ EXAM DISPLAY ═══ -->
      <div v-if="stage === 'exam'" class="space-y-4">
        <!-- Opened in new window hint -->
        <div class="bg-emerald-50 border border-emerald-200 rounded-glass p-4 text-sm text-emerald-700">
          <p class="font-medium">📄 Exame aberto numa nova janela</p>
          <p class="text-xs text-emerald-600 mt-1">Escreva as suas respostas na nova página e submeta para avaliação automática.</p>
        </div>

        <!-- Exam header -->
        <div class="glass-card-strong rounded-glass p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] text-slate-400 font-mono mb-1">{{ examId }}</p>
              <p class="text-lg font-bold text-slate-800">{{ examTitle }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ levelInfo.descrip }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2.5 py-1 rounded text-xs font-bold" :class="levelBadge">{{ selectedLevel }}</span>
              <p class="text-[10px] text-slate-400 mt-1">{{ levelInfo.duracao }}</p>
            </div>
          </div>
        </div>

        <!-- Part 1 -->
        <div class="glass-card rounded-glass p-5">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Parte 1 — Tarefa contextualizada</div>
          <p class="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{{ examData.parte1 }}</p>
          <p class="text-xs text-slate-400 mt-3">Extensão: <strong>{{ levelInfo.wc1 }} palavras</strong></p>
        </div>

        <!-- Part 2 -->
        <div class="glass-card rounded-glass p-5">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Parte 2 — Escolha um dos três tópicos</div>
          <div class="space-y-3">
            <div v-for="(topico, ti) in examData.parte2" :key="ti"
                 class="p-3 rounded-lg border border-slate-200 hover:border-azulejo/30 transition cursor-pointer"
                 :class="selectedTopic === ti ? 'border-azulejo bg-blue-50/50' : ''"
                 @click="selectedTopic = ti">
              <div class="flex items-start gap-2">
                <span class="text-xs font-bold text-azulejo shrink-0 mt-0.5">{{ ['A','B','C'][ti] }}.</span>
                <p class="text-sm text-slate-700 leading-relaxed">{{ topico }}</p>
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-3">Extensão: <strong>{{ levelInfo.wc2 }} palavras</strong></p>
        </div>

        <!-- Part 3 -->
        <div class="glass-card rounded-glass p-5">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Parte 3 — Texto de opinião / argumentação</div>
          <p class="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{{ examData.parte3 }}</p>
          <p class="text-xs text-slate-400 mt-3">Extensão: <strong>{{ levelInfo.wc3 }} palavras</strong></p>
        </div>

        <div class="flex justify-center gap-3 pt-2">
          <button @click="generateExam" class="px-5 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition">
            Novo exame
          </button>
          <button @click="resetAll" class="px-5 py-2.5 glass-btn text-sm font-medium rounded-lg transition btn-glow">
            Voltar ao início
          </button>
        </div>
      </div>

    </div>
  `,

  data() {
    return {
      levels: [
        { id: 'A1', label: 'ACESSO',   cls: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
        { id: 'A2', label: 'CIPLE',   cls: 'bg-teal-50 border-teal-400 text-teal-700' },
        { id: 'B1', label: 'DEPLE',   cls: 'bg-sky-50 border-sky-400 text-sky-700' },
        { id: 'B2', label: 'DIPLE',   cls: 'bg-indigo-50 border-indigo-400 text-indigo-700' },
        { id: 'C1', label: 'DAPLE',   cls: 'bg-violet-50 border-violet-400 text-violet-700' },
        { id: 'C2', label: 'DUPLE',   cls: 'bg-rose-50 border-rose-400 text-rose-700' },
      ],
      levelInfo: {
        'A1': { desc: 'CIPLE (A1) — Iniciação. Temos básicos: apresentações, rotinas simples.', duracao: '45 min', wc1: '50–80', wc2: '50–80', wc3: '50–80', descrip: 'CIPLE (A1) — 45 minutos · 3 partes · 50–80 palavras cada' },
        'A2': { desc: 'CIPLE (A2) — Elementar. Temas do quotidiano: família, trabalho, lazer.', duracao: '60 min', wc1: '80–100', wc2: '80–100', wc3: '80–100', descrip: 'CIPLE (A2) — 60 minutos · 3 partes · 80–100 palavras cada' },
        'B1': { desc: 'DEPLE — Limiar. Experiências pessoais, opiniões simples, planos.', duracao: '75 min', wc1: '120–150', wc2: '120–150', wc3: '120–150', descrip: 'DEPLE (B1) — 75 minutos · 3 partes · 120–150 palavras cada' },
        'B2': { desc: 'DIPLE — Vantagem. Discurso abstrato, argumentação, artigos.', duracao: '90 min', wc1: '180–200', wc2: '180–200', wc3: '180–200', descrip: 'DIPLE (B2) — 90 minutos · 3 partes · 180–200 palavras cada' },
        'C1': { desc: 'DAPLE — Autonomia. Textos formais, ensaios, cartas formais.', duracao: '90 min', wc1: '200–230', wc2: '200–230', wc3: '200–230', descrip: 'DAPLE (C1) — 90 minutos · 3 partes · 200–230 palavras cada' },
        'C2': { desc: 'DUPLE — Mestria. Discurso sofisticado, artigos de opinião.', duracao: '105 min', wc1: '220–250', wc2: '220–250', wc3: '220–250', descrip: 'DUPLE (C2) — 105 minutos · 3 partes · 220–250 palavras cada' },
      },
      selectedLevel: null,
      stage: 'input',    // input | loading | exam
      loading: false,
      examId: '',
      examTitle: '',
      examData: { parte1: '', parte2: [], parte3: '' },
      selectedTopic: null,
      examReady: false,
    }
  },

  computed: {
    hasApiKey() { return !!PTStore.data.config.deepseekKey },
    levelBadge() {
      return {
        'A2': 'bg-teal-50 text-teal-700 border border-teal-200',
        'B1': 'bg-sky-50 text-sky-700 border border-sky-200',
        'B2': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        'C1': 'bg-violet-50 text-violet-700 border border-violet-200',
        'C2': 'bg-rose-50 text-rose-700 border border-rose-200',
      }[this.selectedLevel] || ''
    },
  },

  methods: {
    async generateExam() {
      if (!this.hasApiKey || !this.selectedLevel) return
      PTStore.logActivity()

      this.loading = true
      this.stage = 'loading'
      this.examReady = false

      // Generate sequential exam ID
      const now = new Date()
      const yyyymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')
      let seq = 1
      try {
        const last = parseInt(localStorage.getItem('CAPLE_PIE_SEQ') || '0', 10)
        seq = last + 1
      } catch {}
      localStorage.setItem('CAPLE_PIE_SEQ', String(seq))
      this.examId = `CAPLE_${yyyymmdd}_${String(seq).padStart(2, '0')}_PIE`

      const level = this.selectedLevel
      const levelNames = { A2: 'CIPLE A2', B1: 'DEPLE B1', B2: 'DIPLE B2', C1: 'DAPLE C1', C2: 'DUPLE C2' }
      const info = this.levelInfo[level]

      const apiKey = PTStore.data.config.deepseekKey

      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: `Gera exame PIE CAPLE nivel ${levelNames[level]}, 3 partes.

FORMATO:${['A1','A2'].includes(level)?`
P1: carta/email simples (${info.wc1}pal). P2: 3 topicos descritivos (${info.wc2}pal). P3: descricao curta (${info.wc3}pal).`:level==='C1'||level==='C2'?`
P1: carta formal (${info.wc1}pal). P2: 3 topicos (${info.wc2}pal). P3: 10 reescritas.`:level==='B1'||level==='B2'?`
P1: carta formal/informal (${info.wc1}pal). P2: 3 topicos opiniao (${info.wc2}pal). P3: texto opiniao (${info.wc3}pal).`:''}

TEMAS: ${level==='A1'?'apresentacoes, familia, rotinas':level==='A2'?'vida quotidiana, compras, lazer':level==='B1'?'opinioes, saude, ambiente':level==='B2'?'argumentacao, tecnologia, sociedade':level==='C1'?'politica, ciencia, direitos, etica':'globalizacao, filosofia, arte, justica'}

JSON: {"titulo":"...","parte1":"...","parte2":["A","B","C"],"parte3":${['C1','C2'].includes(level)?'["reescreva: ..."]':'"..."'}}` },
              { role: 'user', content: `${level} (${info.duracao}, ${info.wc1}/${info.wc2}/${info.wc3}pal). Gera 3 partes variadas.` },
            ],
            temperature: 0.8,
            max_tokens: 4000,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const parsed = parseJSON(data.choices?.[0]?.message?.content || '')

        this.examTitle = parsed.titulo || `Exame PIE ${levelNames[level]}`
        this.examData = {
          parte1: parsed.parte1 || '',
          parte2: parsed.parte2 || [],
          parte3: parsed.parte3 || '',
        }
        this.selectedTopic = null
        this.stage = 'exam'

        // Save to localStorage and open in new window for answering
        const examData = {
          examId: this.examId,
          level: this.selectedLevel,
          examTitle: this.examTitle,
          parte1: this.examData.parte1,
          parte2: this.examData.parte2,
          parte3: this.examData.parte3,
          duracao: info.duracao,
          descrip: info.descrip,
          wc1: info.wc1, wc2: info.wc2, wc3: info.wc3,
        }
        try {
          localStorage.setItem('PIE_CURRENT_EXAM', JSON.stringify(examData))
          window.open('pie_exam.html', '_blank')
          // Reset to input stage — exam is in the new window
          this.stage = 'input'
          this.examReady = true
        } catch (e) {
          console.warn('Não foi possível abrir nova janela:', e)
        }
      } catch (e) {
        this.stage = 'input'
        alert('Erro ao gerar exame: ' + e.message)
      } finally {
        this.loading = false
      }
    },

    resetAll() {
      this.stage = 'input'
      this.selectedLevel = null
      this.examId = ''
      this.examTitle = ''
      this.examData = { parte1: '', parte2: [], parte3: '' }
      this.selectedTopic = null
    },

    openConfig() { window.dispatchEvent(new CustomEvent('open-config')) },
  },

  mounted() { this.$nextTick(() => lucide.createIcons()) },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
