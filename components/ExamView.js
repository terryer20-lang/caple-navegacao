/**
 * components/ExamView.js — CAPLE CL: generate exams with official structure,
 * weighted difficulty scoring, part navigation, and analysis.
 * Level-only mode (text input removed).
 */
const ExamView = {
  template: `
    <div class="p-6 max-w-3xl mx-auto anim-fade-in-up">

      <!-- Header -->
      <div class="mb-5">
        <h2 class="text-xl font-bold text-slate-800">Compreensão da Leitura</h2>
      </div>

      <!-- API Key Warning -->
      <div v-if="!hasApiKey" class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-glass p-4 mb-5 text-sm anim-fade-in">
        <p class="text-amber-700 font-medium mb-1">⚠️ Chave API DeepSeek necessária</p>
        <p class="text-amber-600 text-xs mb-2">Configure a sua chave em Configurações.</p>
        <button @click="openConfig" class="text-xs text-azulejo underline hover:text-blue-700 btn-click">Abrir Configurações →</button>
      </div>

      <!-- ═══ INPUT STAGE ═══ -->
      <div v-if="stage === 'input'" class="space-y-4">

        <!-- Success banner -->
        <div v-if="examReady" class="bg-emerald-50 border border-emerald-200 rounded-glass p-4 text-sm text-emerald-700 anim-fade-in">
          <p class="font-medium">📄 Exame gerado — dificuldade {{ examDifficulty }}/100</p>
          <p class="text-xs text-emerald-600 mt-1">Responda na nova janela aberta.</p>
          <p class="text-xs text-slate-400 mt-1">{{ examPartCount }} partes · {{ examQuestionCount }} perguntas · {{ examDuration }} min</p>
        </div>

        <!-- Level selector -->
        <div class="glass-card rounded-glass p-4 card-hover-strong">
          <label class="text-xs text-slate-500 font-medium block mb-2">Nível do exame</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="lv in levels" :key="lv.id"
                    @click="selectedLevel = lv.id"
                    :class="['btn-click px-4 py-2 rounded-lg text-sm font-medium transition border',
                      selectedLevel === lv.id
                        ? lv.cls
                        : 'glass-btn text-slate-500 border-slate-200']">
              <span class="font-bold">{{ lv.id }}</span>
              <span class="text-[10px] opacity-70 ml-1">{{ lv.label }}</span>
            </button>
          </div>
          <p v-if="selectedLevel" class="text-xs text-slate-400 mt-2">
            Gera exame CAPLE CL nível {{ selectedLevel }} com estrutura oficial ({{ structureInfo }}).
          </p>
        </div>

        <!-- Generate -->
        <div class="text-center">
          <button @click="generateExam"
                  :disabled="!selectedLevel || loading"
                  class="btn-click btn-glow btn-magnetic px-8 py-3 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 transition inline-flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            Gerar Exame {{ selectedLevel || '' }}
          </button>
        </div>
      </div>

      <!-- ═══ LOADING ═══ -->
      <div v-if="stage === 'loading'" class="glass-card-strong rounded-glass-lg p-12 text-center card-hover-strong">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azulejo border-t-transparent mb-4 spin-loader" style="border-top-color:var(--accent);border-color:rgba(26,123,181,0.3)"></div>
        <p class="text-slate-600 font-medium">{{ loadingMsg }}</p>
        <p class="text-xs text-slate-400 mt-1">DeepSeek está a preparar perguntas no formato CAPLE CL.</p>
      </div>

      <!-- CEFR Result (info only) -->
      <div v-if="cefrResult" class="glass-card rounded-glass p-4 mb-4 flex items-center gap-4 card-hover-strong">
        <div class="text-center min-w-[5rem]">
          <span class="text-2xl font-bold" :class="cefrColor">{{ cefrResult.nivel }}</span>
          <p class="text-[10px] text-slate-400">Nível do exame</p>
        </div>
        <div class="text-center min-w-[3rem] ml-auto">
          <span class="text-lg font-bold" :class="cefrScoreColor">{{ cefrResult.pontuacao }}</span>
          <p class="text-[10px] text-slate-400">/100</p>
        </div>
        <div class="text-xs text-slate-500 text-left ml-4 border-l border-slate-200 pl-4">
          <p class="font-medium">Adequação do texto ao nível {{ selectedLevel }}</p>
          <p class="text-slate-400 mt-0.5">Pontuação ≥ 95 exigida para aprovação</p>
        </div>
      </div>

      <!-- ═══ Generation result ═══ -->
      <div v-if="stage === 'generated'" class="space-y-4">
        <div class="glass-card-strong rounded-glass-lg p-6 card-hover-strong">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs text-slate-400 font-mono">{{ lastExamId }}</p>
              <p class="text-lg font-bold text-slate-800 mt-1">Exame CL {{ examLevel }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold"
                    :class="difficultyBadgeClass">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                {{ examDifficulty }}/100
              </span>
              <p class="text-[10px] text-slate-400 mt-1">Dificuldade do exame</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
            <span>📝 {{ questions.length }} perguntas</span>
            <span>⏱ {{ examDuration }} minutos</span>
            <span>📊 {{ examParts.length }} partes</span>
          </div>
          <div v-if="examDifficulty >= 90" class="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-700">
            ✅ Dificuldade ≥ 90 — exame adequado para preparação Muito Bom
          </div>
          <div v-else class="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            ⚠️ Dificuldade {{ examDifficulty }}/100 — abaixo do recomendado (90)
          </div>
          <div class="mt-4 flex gap-3">
            <button @click="openExamWindow" class="btn-click btn-glow btn-magnetic px-5 py-2.5 bg-azulejo text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition">
              <i data-lucide="external-link" class="w-4 h-4 inline mr-1"></i>Abrir exame
            </button>
            <button @click="guardarExame" class="btn-click btn-glow btn-magnetic px-5 py-2.5 glass-btn text-sm font-medium rounded-lg border transition">
              <i data-lucide="save" class="w-4 h-4 inline mr-1"></i>Guardar
            </button>
            <button @click="resetExam" class="btn-click px-5 py-2.5 glass-btn text-sm font-medium rounded-lg border transition">
              Novo exame
            </button>
          </div>
        </div>

        <!-- Parts overview -->
        <div class="glass-card rounded-glass p-4 card-hover-strong">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Estrutura do exame</p>
          <div class="space-y-2">
            <div v-for="(part, pi) in examParts" :key="pi"
                 class="list-item-enter flex items-center justify-between p-3 rounded-lg bg-slate-50 text-sm" :style="{ animationDelay: (pi * 0.04) + 's' }">
              <div class="flex items-center gap-2">
                <span class="font-bold text-azulejo text-xs">P{{ pi + 1 }}</span>
                <span class="text-slate-700">{{ part.label }}</span>
              </div>
              <span class="text-xs text-slate-400">{{ part.count }} perguntas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      stage: 'input',    // input | loading | generated
      selectedLevel: null,
      questions: [],
      examParts: [],
      examDifficulty: 0,
      examDuration: 0,
      lastExamId: '',
      examReady: false,
      loading: false,
      loadingMsg: '',
      cefrResult: null,
      _lastExamData: null,
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
    examLevel() { return this.selectedLevel || '?' },
    structureInfo() {
      const s = ExamAPI.getCL5Part(this.selectedLevel)
      if (!s) return '5 artigos'
      return s.qPerPart.map((c, i) => `P${i+1}: ${c} perg.`).join(' · ')
    },
    difficultyBadgeClass() {
      if (this.examDifficulty >= 95) return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      if (this.examDifficulty >= 90) return 'bg-teal-50 text-teal-700 border border-teal-200'
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    },
    examPartCount() { return this.examParts?.length || 0 },
    examQuestionCount() { return this.questions?.length || 0 },
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
      const apiKey = PTStore.data.config.deepseekKey
      try {
        let text, clLevel = this.selectedLevel
        this.loadingMsg = 'A gerar texto nível ' + clLevel + '...'
        const levelTopics = {
          A1: 'apresentacoes, saudes, numeros, cores, familia, rotinas basicas, escola, objetos quotidianos, transporte publico, lojas, rua, tempo',
          A2: 'vida quotidiana, alimentacao, compras, tempos livres, viagens, alojamento, servicos publicos, banco, correios, saude, transportes, restaurante, clima',
          B1: 'trabalho, carreira, negocios, estudos, universidade, formacao, imprensa, atualidade, saude, habitacao, viagens, servicos, opinioes, cultura, tecnologia, consumo',
          B2: 'relacoes sociais, trabalho, negocios, comercio, reembolsos, trocas, reclamacoes, saude, sintomas, conselhos medicos, cultura, musica, literatura, danca, formacao nao academica, atualidade, media, entrevistas, debates, opinioes, argumentacao',
          C1: 'politica, economia, direitos, cidadania, ciencia, etica',
          C2: 'globalizacao, justica, filosofia, arte, inovacao, diplomacia',
        }
        const textRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: `Gera APENAS um texto em portugu\u00eas europeu (PT-PT) de n\u00edvel ${clLevel}. O texto DEVE ter ${clLevel === 'C1' ? 'pelo menos 550 palavras' : clLevel === 'C2' ? 'pelo menos 800 palavras' : clLevel === 'B2' ? 'pelo menos 400 palavras' : clLevel === 'B1' ? 'pelo menos 250 palavras' : clLevel === 'A2' ? 'pelo menos 200 palavras' : 'pelo menos 150 palavras'} (30% acima do padr\u00e3o oficial CAPLE). N\u00c3O escrevas t\u00edtulo, N\u00c3O escrevas introdu\u00e7\u00e3o, N\u00c3O escrevas explica\u00e7\u00f5es \u2014 APENAS o texto corrido. Tema: ${levelTopics[clLevel]||'geral'}. \\nREGRAS CR\u00cdTICAS DE N\u00cdVEL:\\n${clLevel === 'A1' ? 'USA APENAS: presente do indicativo, vocabul\u00e1rio b\u00e1sico (cores, n\u00fameros, fam\u00edlia, rotina), frases curtas coordenadas. N\u00c3O uses pret\u00e9rito, conjuntivo, ou vocabul\u00e1rio abstrato.' : clLevel === 'A2' ? 'USA: presente e pret\u00e9rito perfeito simples, vocabul\u00e1rio quotidiano (compras, viagens, alimenta\u00e7\u00e3o), frases coordenadas com e/mas/porque. N\u00c3O uses conjuntivo, discurso indireto ou vocabul\u00e1rio formal.' : clLevel === 'B1' ? 'USA: presente, pret\u00e9rito, conjuntivo presente, conectores de causa/contraste, discurso indireto simples. Vocabul\u00e1rio profissional/acad\u00e9mico b\u00e1sico. N\u00c3O uses conjuntivo imperfeito, infinitivo pessoal, ou express\u00f5es idiom\u00e1ticas.' : clLevel === 'B2' ? 'USA: conjuntivo presente e imperfeito, discurso indireto, conectores de contraste/concess\u00e3o/conclus\u00e3o, vocabul\u00e1rio argumentativo. N\u00c3O uses infinitivo pessoal, express\u00f5es idiom\u00e1ticas raras, ou estruturas formais complexas de n\u00edvel C1.' : clLevel === 'C1' ? 'USA: infinitivo pessoal, conjuntivo imperfeito e mais-que-perfeito, conectores formais (n\u00e3o obstante, todavia, por conseguinte), discurso indireto complexo, vocabul\u00e1rio formal, express\u00f5es idiom\u00e1ticas comuns. Podes incluir an\u00e1lise cr\u00edtica.' : 'USA: dom\u00ednio total de todas as estruturas, express\u00f5es idiom\u00e1ticas, met\u00e1fora, ironia, registos formal e informal, vocabul\u00e1rio erudito, refer\u00eancias culturais.'}\\nO texto deve ser coeso e bem estruturado, como um artigo de jornal ou texto informativo. USA \\n\\n (DUAS QUEBRAS DE LINHA) para separar par\u00e1grafos \u2014 o texto DEVE ter 2-4 par\u00e1grafos separados por \\n\\n. \u00c9 CRUCIAL que o texto tenha o m\u00ednimo de palavras especificado \u2014 conta as palavras antes de responder.` },
              { role: 'user', content: `Gera um texto PT-PT n\u00edvel ${clLevel} com pelo menos ${clLevel === 'C1' ? 550 : clLevel === 'C2' ? 800 : clLevel === 'B2' ? 400 : clLevel === 'B1' ? 250 : clLevel === 'A2' ? 200 : 150} palavras sobre ${(levelTopics[clLevel]||'tema geral').split(',')[0]}. Apenas o texto, sem t\u00edtulo. USA \\n\\n entre par\u00e1grafos.` },
            ],
            temperature: 0.8,
            max_tokens: clLevel === 'C2' ? 8000 : clLevel === 'C1' ? 6000 : 4000,
          }),
        })
        if (!textRes.ok) throw new Error(`HTTP ${textRes.status} ao gerar texto`)
        const textData = await textRes.json()
        text = textData.choices?.[0]?.message?.content?.trim() || ''
        if (!text || text.length < 200) throw new Error('Texto gerado muito curto — tente novamente')

        // Classify the generated text (QECR ≥ 90 obrigatório)
        this.loadingMsg = 'A classificar QECR do texto gerado...'
        const cefrGenRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: `Avalia o GRAU DE ADEQUAÇÃO do texto PT-PT ao nível ${clLevel} (o nível-alvo do exame). APENAS JSON: {"nivel":"${clLevel}","pontuacao":95}. A pontuação (0-100) mede o quão bem o texto corresponde ao nível ${clLevel}. 100=perfeitamente alinhado com ${clLevel}, 95=muito bom, 85=bom com desvios, 75=adequado, 65=razoável, <55=fraca. Critérios: A1=vocab básico+Presente+frases curtas; A2=quotidiano+Pretérito perfeito+frases coordenadas; B1=opiniões+Conjuntivo presente+conectores causa; B2=argumentação+Conjuntivo imperfeito+discurso indireto; C1=formal+Infinitivo pessoal+conetores formais; C2=sofisticado+domínio total+expressões idiomáticas. NÃO escrever texto explicativo.` },
              { role: 'user', content: text.slice(0, 5000) },
            ],
            temperature: 0.2,
            max_tokens: 300,
          }),
        })
        const cefrGenData = await cefrGenRes.json()
        this.cefrResult = parseJSON(cefrGenData.choices?.[0]?.message?.content || '')
        // Força exibição do nível selecionado (não o classificado)
        // A classificação do texto é apenas para validação (score); o nível do exame
        // é sempre o que o utilizador escolheu, independentemente do nível do texto gerado.
        if (this.cefrResult) this.cefrResult.nivel = clLevel

        // ⚠️ CRÍTICO: manter o nível SELECIONADO pelo utilizador
        // O QECR classifica o TEXTO gerado, NÃO o exame.
        // Se o utilizador escolheu C2, o exame é C2, independentemente
        // do nível que o classificador atribuiu ao texto de treino.
        // clLevel permanece = this.selectedLevel (nunca substituído)
        clLevel = this.selectedLevel

        const cefrScore = parseInt(this.cefrResult.pontuacao)
        if (!isNaN(cefrScore) && cefrScore < 90) {
          // Auto-retry: the AI generated text above the selected level
          // Try again with stricter prompt up to 3 times
          let retryAttempts = 0
          const maxRetry = 3
          let success = false
          while (retryAttempts < maxRetry && !success) {
            retryAttempts++
            this.loadingMsg = `Texto gerado com pontuação ${cefrScore}/100 para nível ${clLevel}. A gerar novo texto... (${retryAttempts}/${maxRetry})`
            const strictTopics = this.getStrictLevelTopics(clLevel)
            const strictPrompt = retryAttempts > 1
              ? `Atenção: o texto anterior teve pontuação ${cefrScore}/100 para nível ${clLevel} (baixa demais). É OBRIGATÓRIO gerar texto nível ${clLevel} — nem mais, nem menos. ${strictTopics}`
              : `Gera texto nível ${clLevel}. ${strictTopics}`
            try {
              const retryRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [
                    { role: 'system', content: this.getStrictSystemPrompt(clLevel) },
                    { role: 'user', content: strictPrompt },
                  ],
                  temperature: 0.5 + retryAttempts * 0.1, // increase temperature to explore different output
                  max_tokens: clLevel === 'C2' ? 8000 : clLevel === 'C1' ? 6000 : 4000,
                }),
              })
              if (!retryRes.ok) continue
              const retryData = await retryRes.json()
              const retryText = retryData.choices?.[0]?.message?.content?.trim() || ''
              if (!retryText || retryText.length < 200) continue
              // Re-classify
              const cefrRetryRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [
                    { role: 'system', content: `Avalia o GRAU DE ADEQUAÇÃO do texto PT-PT ao nível ${clLevel} (o nível-alvo). APENAS JSON: {"nivel":"${clLevel}","pontuacao":95}.` },
                    { role: 'user', content: retryText.slice(0, 5000) },
                  ],
                  temperature: 0.2,
                  max_tokens: 300,
                }),
              })
              const cefrRetryData = await cefrRetryRes.json()
              const newResult = parseJSON(cefrRetryData.choices?.[0]?.message?.content || '')
              if (newResult) newResult.nivel = clLevel
              const newScore = parseInt(newResult.pontuacao)
              if (!isNaN(newScore) && newScore >= 90) {
                text = retryText
                this.cefrResult = newResult
                success = true
              } else {
                this.cefrResult = newResult
              }
            } catch { continue }
          }
          if (!success) {
            this.stage = 'input'
            alert(`O gerador AI produziu texto com pontuação ${this.cefrResult?.pontuacao || 'baixa'}/100 para nível ${clLevel} após várias tentativas. Tente novamente ou escolha um nível diferente.`)
            this.loading = false
            return
          }
        }

        this.loadingMsg = 'A gerar exame CAPLE CL...'

        // Generate exam (with auto-retry for incomplete question count)
        let result = null
        let retries = 0
        const maxRetries = 3
        while (retries < maxRetries) {
          try {
            result = await ExamAPI.generateExam(text, clLevel, apiKey)
            break // success
          } catch (e) {
            if ((e.message.includes('perguntas-placeholder') || e.message.includes('Contagem insuficiente') || e.message.includes('Resposta incompleta na Parte')) && retries < maxRetries - 1) {
              retries++
              this.loadingMsg = `A gerar exame CAPLE CL... (tentativa ${retries + 1}/${maxRetries})`
              continue
            }
            throw e // non-retryable error or final retry failed
          }
        }
        this._onExamGenerated(result, clLevel, text)
      } catch (e) {
        console.error('generateExam final error:', e.message)
        if (e.message.includes('perguntas-placeholder') || e.message.includes('Contagem insuficiente')) {
          this.stage = 'input'
          alert(`O gerador AI produziu perguntas inválidas ou texto demasiado curto após 3 tentativas. Tente novamente mais tarde ou escolha um nível diferente.\n\nErro: ${e.message}`)
        } else {
          this.stage = 'input'
          alert('Erro ao gerar exame: ' + e.message)
        }
      } finally {
        this.loading = false
      }
    },

    _onExamGenerated(result, clLevel, text) {
      this.questions = result.questions
      this.examParts = result.parts
      this.examDifficulty = result.examDifficulty
      this.examDuration = result.examDuration

      const now = new Date()
      const yyyymmdd = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0')
      let seq = 1
      try { seq = (parseInt(localStorage.getItem('SEMEDO_CL_SEQ') || '0', 10)) + 1 } catch {}
      localStorage.setItem('SEMEDO_CL_SEQ', String(seq))
      const examId = 'SEMEDO_' + yyyymmdd + '_' + String(seq).padStart(2, '0') + '_CL'
      this.lastExamId = examId

      const examData = {
        examId,
        level: clLevel,
        sourceText: (text || '').slice(0, 3000),
        questions: result.questions,
        parts: result.parts,
        examDifficulty: result.examDifficulty,
        examDuration: result.examDuration,
        timestamp: Date.now(),
      }
      this._lastExamData = examData
      // DEBUG: verify parts' sourceText uniqueness
      const debugInfo = 'Partes: ' + (result.parts || []).map((p, i) =>
        `P${i+1}: ${((p.sourceText || '').substring(0, 30)).replace(/\n/g, ' ')}`
      ).join(' | ')
      console.log('DEBUG parts:', debugInfo)
      // Auto-save: guardar para Revisão + download JSON
      this.guardarExame()

      try {
        localStorage.setItem('CL_CURRENT_EXAM', JSON.stringify(examData))
        this.stage = 'generated'
        this.examReady = true
        window.open('cl_exam.html', '_blank')
      } catch (e) { console.warn('Erro ao guardar exame:', e) }
    },

    openExamWindow() {
      try { window.open('cl_exam.html', '_blank') } catch (e) { console.warn('Erro ao abrir:', e) }
    },

    /** Guardar exame: save to localStorage + download JSON */
    guardarExame() {
      const data = this._lastExamData
      if (!data) { alert('Nenhum exame para guardar.'); return }
      // Save full data to localStorage for Revisão reopening
      try {
        localStorage.setItem('SEMEDO_SAVED_FULL_' + data.examId, JSON.stringify(data))
        const saved = JSON.parse(localStorage.getItem('SEMEDO_SAVED_EXAMS') || '[]')
        if (!saved.find(s => s.examId === data.examId)) {
          saved.push({ examId: data.examId, level: data.level, date: new Date().toISOString(), examDifficulty: data.examDifficulty, examDuration: data.examDuration, questionCount: data.questions?.length })
          localStorage.setItem('SEMEDO_SAVED_EXAMS', JSON.stringify(saved))
        }
      } catch {}
      // Download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.examId + '.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },

    resetExam() {
      this.stage = 'input'
      this.questions = []
      this.examParts = []
      this.examDifficulty = 0
      this.examReady = false
    },

    resetExam() {
      this.stage = 'input'
      this.questions = []
      this.examParts = []
      this.examDifficulty = 0
      this.examReady = false
    },

    getStrictLevelTopics(level) {
      const forbidden = {
        A1: 'NÃO uses: pretérito perfeito, pretérito imperfeito, conjuntivo, futuro, condicional, discurso indireto, vocabulário abstrato, frases com mais de 15 palavras, conectores complexos. USA APENAS: presente do indicativo, vocabulário básico (cores, números, família, rotina, escola, lojas), frases curtas coordenadas com "e" ou "mas".',
        A2: 'NÃO uses: conjuntivo, futuro do conjuntivo, discurso indireto, infinitivo pessoal, vocabulário formal, expressões idiomáticas, frases com mais de 20 palavras. USA: presente, pretérito perfeito simples, vocabulário quotidiano (compras, viagens, alimentação, saúde, transportes), frases coordenadas com "e/mas/porque/portanto".',
        B1: 'NÃO uses: conjuntivo imperfeito, conjuntivo mais-que-perfeito, infinitivo pessoal, futuro do conjuntivo, expressões idiomáticas, estruturas formais complexas. USA: presente, pretérito perfeito e imperfeito, conjuntivo presente, futuro do presente, conectores de causa/contraste/conclusão, discurso indireto simples, vocabulário profissional e académico básico.',
        B2: 'NÃO uses: infinitivo pessoal, conjuntivo mais-que-perfeito, expressões idiomáticas raras, vocabulário erudito, estruturas literárias, análise estética da linguagem. USA: conjuntivo presente e imperfeito, discurso indireto, futuro do conjuntivo, conectores de contraste/concessão/conclusão (no entanto, contudo, por conseguinte), vocabulário argumentativo e formal mas não erudito.',
        C1: 'NÃO uses: vocabulário erudito ou arcaico, expressões idiomáticas muito raras, estruturas sintáticas excessivamente complexas, análise estética/literária profunda, metáforas poéticas. USA: conjuntivo presente, imperfeito e mais-que-perfeito; infinitivo pessoal; futuro do conjuntivo; conectores formais (não obstante, todavia, por conseguinte); discurso indireto complexo; vocabulário formal mas acessível; expressões idiomáticas comuns.',
        C2: 'USA: vocabulário erudito e sofisticado, expressões idiomáticas, domínio total dos tempos verbais (conjuntivo mais-que-perfeito composto, infinitivo pessoal composto), estruturas sintáticas complexas, registo formal, subentendidos, ironia e linguagem figurada. Temas abstratos e filosóficos.',
      }
      return forbidden[level] || ''
    },

    getStrictSystemPrompt(level) {
      const base = `Gera APENAS um texto em português europeu (PT-PT) de nível ${level}.`
      const levelRules = this.getStrictLevelTopics(level)
      return `${base}\n${levelRules}\nNÃO escrevas título. NÃO escrevas introdução. APENAS o texto corrido. NÃO uses estruturas gramaticais ou vocabulário acima do nível ${level}. Se usares uma estrutura de nível superior, o texto será rejeitado. Sê rigoroso(a) — cada escolha vocabular e gramatical deve corresponder exatamente ao nível ${level}.`
    },

    async _continueGenerate(text, clLevel) {
      const apiKey = PTStore.data.config.deepseekKey
      try {
        // Generate exam (with auto-retry for incomplete question count)
        let result = null
        let retries = 0
        const maxRetries = 3
        while (retries < maxRetries) {
          try {
            result = await ExamAPI.generateExam(text, clLevel, apiKey)
            break
          } catch (e) {
            if ((e.message.includes('perguntas-placeholder') || e.message.includes('perguntas reais') || e.message.includes('Contagem insuficiente') || e.message.includes('Resposta incompleta na Parte')) && retries < maxRetries - 1) {
              retries++
              this.loadingMsg = `A gerar exame CAPLE CL... (tentativa ${retries + 1}/${maxRetries})`
              continue
            }
            throw e
          }
        }
        this._onExamGenerated(result, clLevel, text)
      } catch (e) {
        this.stage = 'input'
        const msg = e.message || ''
        console.error('_continueGenerate final error:', msg)
        if (msg.includes('perguntas-placeholder') || msg.includes('perguntas reais')) {
          alert('O gerador AI não produziu perguntas suficientes após 3 tentativas. Tente novamente mais tarde ou escolha um nível diferente.')
        } else if (msg.includes('JSON')) {
          alert('Erro ao processar resposta da API: JSON inválido. A geração para níveis altos (C1/C2) pode falhar ocasionalmente. Tente novamente.')
        } else {
          alert('Erro: ' + msg)
        }
      } finally { this.loading = false }
    },

    goToHistory() { if (typeof window.__NAV__ === 'function') window.__NAV__('exames') },
    openConfig() { window.dispatchEvent(new CustomEvent('open-config')) },
  },

  mounted() {
    this.$nextTick(() => lucide.createIcons())
  },
  updated() { this.$nextTick(() => lucide.createIcons()) },
}
